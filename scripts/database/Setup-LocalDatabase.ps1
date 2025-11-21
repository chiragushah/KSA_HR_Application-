# KSA HR Application - Local PostgreSQL Database Setup Script
# This script sets up a local PostgreSQL database for development

param(
    [Parameter(Mandatory=$false)]
    [string]$DatabaseName = "ksahr_db",
    
    [Parameter(Mandatory=$false)]
    [string]$Username = "postgres",
    
    [Parameter(Mandatory=$false)]
    [string]$Password = "",
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipMigrations = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$SeedData = $false
)

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  KSA HR - Local Database Setup" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if PostgreSQL is installed
function Test-PostgreSQLInstalled {
    try {
        $null = Get-Command psql -ErrorAction Stop
        return $true
    }
    catch {
        return $false
    }
}

# Function to check if database exists
function Test-DatabaseExists {
    param([string]$DbName, [string]$User)
    
    $result = psql -U $User -lqt | Select-String -Pattern "^\s*$DbName\s"
    return $null -ne $result
}

# Function to create database
function New-PostgreSQLDatabase {
    param([string]$DbName, [string]$User)
    
    Write-Host "Creating database '$DbName'..." -ForegroundColor Yellow
    
    try {
        createdb -U $User $DbName
        Write-Host "Database created successfully!" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "Error creating database: $_" -ForegroundColor Red
        return $false
    }
}

# Function to update connection string
function Update-ConnectionString {
    param(
        [string]$DbName,
        [string]$User,
        [string]$Pass
    )
    
    $appSettingsPath = "../../src/Backend/appsettings.Development.json"
    
    if (Test-Path $appSettingsPath) {
        Write-Host "Updating connection string in appsettings.Development.json..." -ForegroundColor Yellow
        
        $connectionString = "Host=localhost;Database=$DbName;Username=$User"
        if (-not [string]::IsNullOrWhiteSpace($Pass)) {
            $connectionString += ";Password=$Pass"
        }
        
        $appSettings = Get-Content $appSettingsPath -Raw | ConvertFrom-Json
        $appSettings.ConnectionStrings.DefaultConnection = $connectionString
        $appSettings | ConvertTo-Json -Depth 10 | Set-Content $appSettingsPath
        
        Write-Host "Connection string updated!" -ForegroundColor Green
    }
    else {
        Write-Host "Warning: appsettings.Development.json not found" -ForegroundColor Yellow
    }
}

# Function to run EF Core migrations
function Invoke-Migrations {
    Write-Host "`nRunning Entity Framework Core migrations..." -ForegroundColor Yellow
    
    Set-Location "../../src/Backend"
    
    try {
        # Check if dotnet-ef is installed
        $efInstalled = dotnet tool list -g | Select-String "dotnet-ef"
        
        if (-not $efInstalled) {
            Write-Host "Installing dotnet-ef tool..." -ForegroundColor Yellow
            dotnet tool install --global dotnet-ef
        }
        
        # Run migrations
        dotnet ef database update
        Write-Host "Migrations completed successfully!" -ForegroundColor Green
        
        Set-Location "../../scripts/database"
        return $true
    }
    catch {
        Write-Host "Error running migrations: $_" -ForegroundColor Red
        Set-Location "../../scripts/database"
        return $false
    }
}

# Function to seed sample data
function Invoke-SeedData {
    Write-Host "`nSeeding sample data..." -ForegroundColor Yellow
    
    Set-Location "../../src/Backend"
    
    try {
        dotnet run -- --seed
        Write-Host "Sample data seeded successfully!" -ForegroundColor Green
        
        Set-Location "../../scripts/database"
        return $true
    }
    catch {
        Write-Host "Error seeding data: $_" -ForegroundColor Red
        Set-Location "../../scripts/database"
        return $false
    }
}

# Main execution
Write-Host "Configuration:" -ForegroundColor Cyan
Write-Host "  Database Name: $DatabaseName" -ForegroundColor White
Write-Host "  Username: $Username" -ForegroundColor White
Write-Host "  Run Migrations: $(-not $SkipMigrations)" -ForegroundColor White
Write-Host "  Seed Data: $SeedData" -ForegroundColor White
Write-Host ""

# Check PostgreSQL installation
if (-not (Test-PostgreSQLInstalled)) {
    Write-Host "ERROR: PostgreSQL is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install PostgreSQL from: https://www.postgresql.org/download/" -ForegroundColor Yellow
    exit 1
}

Write-Host "PostgreSQL detected!" -ForegroundColor Green

# Prompt for password if not provided
if ([string]::IsNullOrWhiteSpace($Password)) {
    $securePassword = Read-Host "Enter PostgreSQL password for user '$Username'" -AsSecureString
    $Password = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    )
}

# Set PGPASSWORD environment variable
$env:PGPASSWORD = $Password

# Check if database exists
if (Test-DatabaseExists -DbName $DatabaseName -User $Username) {
    Write-Host "`nDatabase '$DatabaseName' already exists!" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to drop and recreate it? (yes/no)"
    
    if ($overwrite -eq "yes") {
        Write-Host "Dropping existing database..." -ForegroundColor Yellow
        dropdb -U $Username $DatabaseName
        
        if (-not (New-PostgreSQLDatabase -DbName $DatabaseName -User $Username)) {
            exit 1
        }
    }
}
else {
    if (-not (New-PostgreSQLDatabase -DbName $DatabaseName -User $Username)) {
        exit 1
    }
}

# Update connection string
Update-ConnectionString -DbName $DatabaseName -User $Username -Pass $Password

# Run migrations
if (-not $SkipMigrations) {
    if (-not (Invoke-Migrations)) {
        Write-Host "`nSetup completed with errors in migrations" -ForegroundColor Yellow
        exit 1
    }
}

# Seed data if requested
if ($SeedData) {
    if (-not (Invoke-SeedData)) {
        Write-Host "`nSetup completed with errors in seeding data" -ForegroundColor Yellow
        exit 1
    }
}

# Clear password from environment
$env:PGPASSWORD = $null

Write-Host "`n===============================================" -ForegroundColor Green
Write-Host "  Database Setup Completed Successfully!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Connection String:" -ForegroundColor Cyan
Write-Host "  Host=localhost;Database=$DatabaseName;Username=$Username;Password=***" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Review appsettings.Development.json" -ForegroundColor White
Write-Host "  2. Run the application: dotnet run (from src/Backend)" -ForegroundColor White
Write-Host "  3. Test API: http://localhost:5000/swagger" -ForegroundColor White
Write-Host ""
