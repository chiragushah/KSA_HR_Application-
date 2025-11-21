# KSA HR Application - Database Management Script
# Supports both Local PostgreSQL and Azure PostgreSQL deployments

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('Local', 'Azure', 'Help')]
    [string]$Environment = 'Help'
)

# Display banner
function Show-Banner {
    Write-Host "===============================================" -ForegroundColor Cyan
    Write-Host "  KSA HR Application - Database Manager" -ForegroundColor Cyan
    Write-Host "  Version 1.0 - PowerShell Management Tool" -ForegroundColor Cyan
    Write-Host "===============================================" -ForegroundColor Cyan
    Write-Host ""
}

# Display help information
function Show-Help {
    Write-Host "USAGE:" -ForegroundColor Yellow
    Write-Host "  .\Manage-Database.ps1 -Environment <Local|Azure|Help>" -ForegroundColor White
    Write-Host ""
    Write-Host "PARAMETERS:" -ForegroundColor Yellow
    Write-Host "  -Environment  Target environment (Local, Azure, or Help)" -ForegroundColor White
    Write-Host ""
    Write-Host "EXAMPLES:" -ForegroundColor Yellow
    Write-Host "  .\Manage-Database.ps1 -Environment Local" -ForegroundColor White
    Write-Host "  .\Manage-Database.ps1 -Environment Azure" -ForegroundColor White
    Write-Host ""
}

# Show menu and get user selection
function Show-Menu {
    param([string]$EnvType)
    
    Write-Host "DATABASE MANAGEMENT MENU - $EnvType Environment" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "1. Setup Database" -ForegroundColor White
    Write-Host "2. Run Migrations" -ForegroundColor White
    Write-Host "3. Seed Sample Data" -ForegroundColor White
    Write-Host "4. Backup Database" -ForegroundColor White
    Write-Host "5. Restore Database" -ForegroundColor White
    Write-Host "6. Drop Database (WARNING!)" -ForegroundColor Red
    Write-Host "7. Test Connection" -ForegroundColor White
    Write-Host "8. View Connection String" -ForegroundColor White
    Write-Host "0. Exit" -ForegroundColor Yellow
    Write-Host ""
    
    $selection = Read-Host "Select an option (0-8)"
    return $selection
}

# Execute the selected operation
function Invoke-DatabaseOperation {
    param(
        [string]$Operation,
        [string]$EnvType
    )
    
    switch ($Operation) {
        "1" { 
            Write-Host "`nSetting up database..." -ForegroundColor Cyan
            & ".\Setup-$($EnvType)Database.ps1"
        }
        "2" { 
            Write-Host "`nRunning migrations..." -ForegroundColor Cyan
            Set-Location "../../src/Backend"
            dotnet ef database update
            Set-Location "../../scripts/database"
        }
        "3" { 
            Write-Host "`nSeeding sample data..." -ForegroundColor Cyan
            Set-Location "../../src/Backend"
            dotnet run --seed-data
            Set-Location "../../scripts/database"
        }
        "4" { 
            Write-Host "`nBacking up database..." -ForegroundColor Cyan
            $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
            $backupPath = "../../backups/ksahr_backup_$timestamp.sql"
            
            if ($EnvType -eq "Local") {
                $dbName = Read-Host "Enter database name (default: ksahr_db)"
                if ([string]::IsNullOrWhiteSpace($dbName)) { $dbName = "ksahr_db" }
                
                New-Item -ItemType Directory -Force -Path "../../backups" | Out-Null
                pg_dump -U postgres -d $dbName -f $backupPath
                Write-Host "Backup created: $backupPath" -ForegroundColor Green
            }
            else {
                Write-Host "Azure backup - Please use Azure Portal or Azure CLI" -ForegroundColor Yellow
                Write-Host "Command: az postgres flexible-server backup create --resource-group <rg> --name <server>" -ForegroundColor White
            }
        }
        "5" { 
            Write-Host "`nRestoring database..." -ForegroundColor Cyan
            if ($EnvType -eq "Local") {
                $backupFile = Read-Host "Enter backup file path"
                $dbName = Read-Host "Enter target database name"
                
                if (Test-Path $backupFile) {
                    psql -U postgres -d $dbName -f $backupFile
                    Write-Host "Database restored successfully" -ForegroundColor Green
                }
                else {
                    Write-Host "Backup file not found: $backupFile" -ForegroundColor Red
                }
            }
            else {
                Write-Host "Azure restore - Please use Azure Portal or Azure CLI" -ForegroundColor Yellow
                Write-Host "Command: az postgres flexible-server restore --resource-group <rg> --name <server> --source-server <source>" -ForegroundColor White
            }
        }
        "6" { 
            Write-Host "`nWARNING: This will permanently delete the database!" -ForegroundColor Red
            $confirm = Read-Host "Type 'DELETE' to confirm"
            
            if ($confirm -eq "DELETE") {
                if ($EnvType -eq "Local") {
                    $dbName = Read-Host "Enter database name to drop"
                    dropdb -U postgres $dbName
                    Write-Host "Database dropped" -ForegroundColor Yellow
                }
                else {
                    Write-Host "Azure database deletion should be done via Azure Portal" -ForegroundColor Yellow
                }
            }
            else {
                Write-Host "Operation cancelled" -ForegroundColor Green
            }
        }
        "7" { 
            Write-Host "`nTesting connection..." -ForegroundColor Cyan
            Set-Location "../../src/Backend"
            dotnet run --test-connection
            Set-Location "../../scripts/database"
        }
        "8" { 
            Write-Host "`nConnection String:" -ForegroundColor Cyan
            if ($EnvType -eq "Local") {
                Write-Host "Host=localhost;Database=ksahr_db;Username=postgres;Password=<your-password>" -ForegroundColor White
            }
            else {
                Write-Host "Check Azure Key Vault or appsettings.production.json" -ForegroundColor Yellow
            }
        }
        "0" { 
            Write-Host "`nExiting..." -ForegroundColor Yellow
            return $false
        }
        default {
            Write-Host "`nInvalid selection. Please try again." -ForegroundColor Red
        }
    }
    
    return $true
}

# Main execution
Show-Banner

if ($Environment -eq 'Help') {
    Show-Help
    exit 0
}

Write-Host "Selected Environment: $Environment`n" -ForegroundColor Cyan

$continue = $true
while ($continue) {
    $selection = Show-Menu -EnvType $Environment
    $continue = Invoke-DatabaseOperation -Operation $selection -EnvType $Environment
    
    if ($continue) {
        Write-Host "`nPress any key to continue..." -ForegroundColor Gray
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        Clear-Host
        Show-Banner
    }
}

Write-Host "`nThank you for using KSA HR Database Manager!" -ForegroundColor Cyan
