# KSA HR Application - Azure PostgreSQL Flexible Server Deployment Script
# This script deploys and configures an Azure PostgreSQL Flexible Server

param(
    [Parameter(Mandatory=$false)]
    [string]$ResourceGroupName = "rg-ksahr-prod",
    
    [Parameter(Mandatory=$false)]
    [string]$ServerName = "psql-ksahr-prod",
    
    [Parameter(Mandatory=$false)]
    [string]$DatabaseName = "ksahr_db",
    
    [Parameter(Mandatory=$false)]
    [string]$Location = "eastus",
    
    [Parameter(Mandatory=$false)]
    [string]$AdminUsername = "ksahr_admin",
    
    [Parameter(Mandatory=$false)]
    [string]$AdminPassword = "",
    
    [Parameter(Mandatory=$false)]
    [ValidateSet('Burstable', 'GeneralPurpose', 'MemoryOptimized')]
    [string]$SkuTier = "Burstable",
    
    [Parameter(Mandatory=$false)]
    [string]$SkuName = "Standard_B1ms",
    
    [Parameter(Mandatory=$false)]
    [int]$StorageSizeGB = 32,
    
    [Parameter(Mandatory=$false)]
    [switch]$EnableFirewallRule = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$RunMigrations = $false
)

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  KSA HR - Azure Database Deployment" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Function to check Azure CLI installation
function Test-AzureCLIInstalled {
    try {
        $null = Get-Command az -ErrorAction Stop
        return $true
    }
    catch {
        return $false
    }
}

# Function to check Azure login status
function Test-AzureLogin {
    try {
        $account = az account show 2>$null | ConvertFrom-Json
        return $null -ne $account
    }
    catch {
        return $false
    }
}

# Function to create resource group
function New-AzureResourceGroup {
    param([string]$RgName, [string]$Loc)
    
    Write-Host "Checking if resource group exists..." -ForegroundColor Yellow
    
    $rgExists = az group exists --name $RgName
    
    if ($rgExists -eq "true") {
        Write-Host "Resource group '$RgName' already exists" -ForegroundColor Green
        return $true
    }
    
    Write-Host "Creating resource group '$RgName'..." -ForegroundColor Yellow
    
    try {
        az group create --name $RgName --location $Loc
        Write-Host "Resource group created successfully!" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "Error creating resource group: $_" -ForegroundColor Red
        return $false
    }
}

# Function to create PostgreSQL Flexible Server
function New-PostgreSQLFlexibleServer {
    param(
        [string]$RgName,
        [string]$SrvName,
        [string]$Loc,
        [string]$AdminUser,
        [string]$AdminPass,
        [string]$SkuT,
        [string]$SkuN,
        [int]$StorageGB
    )
    
    Write-Host "Creating PostgreSQL Flexible Server '$SrvName'..." -ForegroundColor Yellow
    Write-Host "This may take 5-10 minutes..." -ForegroundColor Gray
    
    try {
        $result = az postgres flexible-server create `
            --resource-group $RgName `
            --name $SrvName `
            --location $Loc `
            --admin-user $AdminUser `
            --admin-password $AdminPass `
            --sku-name $SkuN `
            --tier $SkuT `
            --storage-size $StorageGB `
            --version 15 `
            --public-access 0.0.0.0 `
            --output json | ConvertFrom-Json
        
        Write-Host "PostgreSQL Flexible Server created successfully!" -ForegroundColor Green
        return $result
    }
    catch {
        Write-Host "Error creating server: $_" -ForegroundColor Red
        return $null
    }
}

# Function to create database
function New-AzurePostgreSQLDatabase {
    param(
        [string]$RgName,
        [string]$SrvName,
        [string]$DbName
    )
    
    Write-Host "Creating database '$DbName'..." -ForegroundColor Yellow
    
    try {
        az postgres flexible-server db create `
            --resource-group $RgName `
            --server-name $SrvName `
            --database-name $DbName
        
        Write-Host "Database created successfully!" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "Error creating database: $_" -ForegroundColor Red
        return $false
    }
}

# Function to configure firewall rule
function Set-FirewallRule {
    param(
        [string]$RgName,
        [string]$SrvName
    )
    
    Write-Host "Configuring firewall rule..." -ForegroundColor Yellow
    
    try {
        # Get current public IP
        $publicIp = (Invoke-WebRequest -Uri "https://api.ipify.org" -UseBasicParsing).Content.Trim()
        Write-Host "Your public IP: $publicIp" -ForegroundColor Cyan
        
        az postgres flexible-server firewall-rule create `
            --resource-group $RgName `
            --name $SrvName `
            --rule-name "DevelopmentMachine" `
            --start-ip-address $publicIp `
            --end-ip-address $publicIp
        
        Write-Host "Firewall rule created successfully!" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "Error creating firewall rule: $_" -ForegroundColor Red
        return $false
    }
}

# Function to store connection string in Key Vault
function Set-KeyVaultSecret {
    param(
        [string]$VaultName,
        [string]$SecretName,
        [string]$SecretValue
    )
    
    Write-Host "Storing connection string in Key Vault..." -ForegroundColor Yellow
    
    try {
        az keyvault secret set `
            --vault-name $VaultName `
            --name $SecretName `
            --value $SecretValue
        
        Write-Host "Connection string stored in Key Vault!" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "Error storing secret: $_" -ForegroundColor Red
        Write-Host "You can store it manually later" -ForegroundColor Yellow
        return $false
    }
}

# Function to run migrations
function Invoke-AzureMigrations {
    param([string]$ConnectionString)
    
    Write-Host "`nRunning Entity Framework Core migrations..." -ForegroundColor Yellow
    
    Set-Location "../../src/Backend"
    
    try {
        # Temporarily set connection string
        $env:ConnectionStrings__DefaultConnection = $ConnectionString
        
        dotnet ef database update
        Write-Host "Migrations completed successfully!" -ForegroundColor Green
        
        # Clear connection string
        $env:ConnectionStrings__DefaultConnection = $null
        
        Set-Location "../../scripts/database"
        return $true
    }
    catch {
        Write-Host "Error running migrations: $_" -ForegroundColor Red
        $env:ConnectionStrings__DefaultConnection = $null
        Set-Location "../../scripts/database"
        return $false
    }
}

# Main execution
Write-Host "Deployment Configuration:" -ForegroundColor Cyan
Write-Host "  Resource Group: $ResourceGroupName" -ForegroundColor White
Write-Host "  Server Name: $ServerName" -ForegroundColor White
Write-Host "  Database Name: $DatabaseName" -ForegroundColor White
Write-Host "  Location: $Location" -ForegroundColor White
Write-Host "  SKU: $SkuTier - $SkuName" -ForegroundColor White
Write-Host "  Storage: $StorageSizeGB GB" -ForegroundColor White
Write-Host ""

# Check Azure CLI
if (-not (Test-AzureCLIInstalled)) {
    Write-Host "ERROR: Azure CLI is not installed" -ForegroundColor Red
    Write-Host "Please install from: https://aka.ms/installazurecliwindows" -ForegroundColor Yellow
    exit 1
}

Write-Host "Azure CLI detected!" -ForegroundColor Green

# Check Azure login
if (-not (Test-AzureLogin)) {
    Write-Host "Not logged in to Azure. Please login..." -ForegroundColor Yellow
    az login
    
    if (-not (Test-AzureLogin)) {
        Write-Host "ERROR: Azure login failed" -ForegroundColor Red
        exit 1
    }
}

$account = az account show | ConvertFrom-Json
Write-Host "Logged in as: $($account.user.name)" -ForegroundColor Green
Write-Host "Subscription: $($account.name)" -ForegroundColor Green
Write-Host ""

# Prompt for admin password if not provided
if ([string]::IsNullOrWhiteSpace($AdminPassword)) {
    $securePassword = Read-Host "Enter admin password for PostgreSQL server (min 8 chars)" -AsSecureString
    $AdminPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    )
}

# Confirm deployment
Write-Host "WARNING: This will incur Azure costs!" -ForegroundColor Yellow
$confirm = Read-Host "Continue with deployment? (yes/no)"

if ($confirm -ne "yes") {
    Write-Host "Deployment cancelled" -ForegroundColor Yellow
    exit 0
}

# Create resource group
if (-not (New-AzureResourceGroup -RgName $ResourceGroupName -Loc $Location)) {
    exit 1
}

# Create PostgreSQL Flexible Server
$server = New-PostgreSQLFlexibleServer `
    -RgName $ResourceGroupName `
    -SrvName $ServerName `
    -Loc $Location `
    -AdminUser $AdminUsername `
    -AdminPass $AdminPassword `
    -SkuT $SkuTier `
    -SkuN $SkuName `
    -StorageGB $StorageSizeGB

if ($null -eq $server) {
    Write-Host "Failed to create server" -ForegroundColor Red
    exit 1
}

# Create database
if (-not (New-AzurePostgreSQLDatabase -RgName $ResourceGroupName -SrvName $ServerName -DbName $DatabaseName)) {
    Write-Host "Warning: Database creation failed, but server is created" -ForegroundColor Yellow
}

# Configure firewall if requested
if ($EnableFirewallRule) {
    Set-FirewallRule -RgName $ResourceGroupName -SrvName $ServerName
}

# Build connection string
$connectionString = "Host=$ServerName.postgres.database.azure.com;Database=$DatabaseName;Username=$AdminUsername;Password=$AdminPassword;SslMode=Require"

# Run migrations if requested
if ($RunMigrations) {
    Invoke-AzureMigrations -ConnectionString $connectionString
}

# Summary
Write-Host "`n===============================================" -ForegroundColor Green
Write-Host "  Deployment Completed Successfully!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Server Details:" -ForegroundColor Cyan
Write-Host "  Server: $ServerName.postgres.database.azure.com" -ForegroundColor White
Write-Host "  Database: $DatabaseName" -ForegroundColor White
Write-Host "  Admin User: $AdminUsername" -ForegroundColor White
Write-Host ""
Write-Host "Connection String (store in Azure Key Vault):" -ForegroundColor Cyan
Write-Host "  $connectionString" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Store connection string in Azure Key Vault" -ForegroundColor White
Write-Host "  2. Configure App Service connection strings" -ForegroundColor White
Write-Host "  3. Run migrations if not done: dotnet ef database update" -ForegroundColor White
Write-Host "  4. Review firewall rules in Azure Portal" -ForegroundColor White
Write-Host ""
