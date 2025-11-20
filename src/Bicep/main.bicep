// Main Bicep template for KSA HR Application
// Deploys all Azure resources needed for the application

@description('The location for all resources')
param location string = resourceGroup().location

@description('The name of the application')
param appName string = 'ksa-hr-app'

@description('The environment (dev, staging, prod)')
param environment string = 'prod'

@description('SKU for App Service Plan')
param appServicePlanSku string = 'B2'

@description('Frontend application URL for CORS (optional)')
param frontendAppUrl string = ''

@description('PostgreSQL administrator login')
param postgresAdminLogin string = 'ksahradmin'

@secure()
@description('PostgreSQL administrator password')
param postgresAdminPassword string

@description('Azure AD Tenant ID')
param tenantId string

@description('Azure AD Client ID')
param clientId string

// Variables
var uniqueSuffix = uniqueString(resourceGroup().id)
var appServicePlanName = '${appName}-plan-${environment}-${uniqueSuffix}'
var apiAppName = '${appName}-api-${environment}-${uniqueSuffix}'
var frontendAppName = '${appName}-web-${environment}-${uniqueSuffix}'
var postgresServerName = '${appName}-db-${environment}-${uniqueSuffix}'
var postgresDatabaseName = 'ksahr_db'
var appInsightsName = '${appName}-insights-${environment}-${uniqueSuffix}'
var keyVaultName = '${appName}-kv-${uniqueSuffix}'
var storageAccountName = '${replace(appName, '-', '')}sa${uniqueSuffix}'

// App Service Plan
resource appServicePlan 'Microsoft.Web/serverfarms@2022-09-01' = {
  name: appServicePlanName
  location: location
  sku: {
    name: appServicePlanSku
    tier: 'Basic'
    capacity: 1
  }
  kind: 'linux'
  properties: {
    reserved: true
  }
  tags: {
    Environment: environment
    Application: 'KSA-HR-System'
  }
}

// API App Service
resource apiAppService 'Microsoft.Web/sites@2022-09-01' = {
  name: apiAppName
  location: location
  kind: 'app,linux'
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'DOTNETCORE|8.0'
      alwaysOn: true
      ftpsState: 'Disabled'
      minTlsVersion: '1.2'
      http20Enabled: true
      appSettings: [
        {
          name: 'ASPNETCORE_ENVIRONMENT'
          value: environment
        }
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: appInsights.properties.ConnectionString
        }
        {
          name: 'AzureAd__TenantId'
          value: tenantId
        }
        {
          name: 'AzureAd__ClientId'
          value: clientId
        }
        {
          name: 'AzureAd__Instance'
          value: environment().authentication.loginEndpoint
        }
        {
          name: 'AzureAd__Domain'
          value: '${tenantId}.onmicrosoft.com'
        }
      ]
      connectionStrings: [
        {
          name: 'DefaultConnection'
          connectionString: 'Host=${postgresServer.properties.fullyQualifiedDomainName};Database=${postgresDatabaseName};Username=${postgresAdminLogin};Password=${postgresAdminPassword};SslMode=Require'
          type: 'PostgreSQL'
        }
      ]
      cors: {
        allowedOrigins: [
          frontendAppUrl
          'http://localhost:4200'
        ]
        supportCredentials: true
      }
    }
  }
  tags: {
    Environment: environment
    Application: 'KSA-HR-API'
  }
}

// Frontend App Service
resource frontendAppService 'Microsoft.Web/sites@2022-09-01' = {
  name: frontendAppName
  location: location
  kind: 'app,linux'
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'NODE|18-lts'
      alwaysOn: true
      ftpsState: 'Disabled'
      minTlsVersion: '1.2'
      http20Enabled: true
      appSettings: [
        {
          name: 'API_URL'
          value: 'https://${apiAppName}.azurewebsites.net/api'
        }
        {
          name: 'AZURE_AD_CLIENT_ID'
          value: clientId
        }
        {
          name: 'AZURE_AD_TENANT_ID'
          value: tenantId
        }
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: appInsights.properties.ConnectionString
        }
      ]
    }
  }
  tags: {
    Environment: environment
    Application: 'KSA-HR-Frontend'
  }
}

// PostgreSQL Server
resource postgresServer 'Microsoft.DBforPostgreSQL/flexibleServers@2022-12-01' = {
  name: postgresServerName
  location: location
  sku: {
    name: 'Standard_B2s'
    tier: 'Burstable'
  }
  properties: {
    administratorLogin: postgresAdminLogin
    administratorLoginPassword: postgresAdminPassword
    version: '15'
    storage: {
      storageSizeGB: 32
    }
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
    highAvailability: {
      mode: 'Disabled'
    }
  }
  tags: {
    Environment: environment
    Application: 'KSA-HR-Database'
  }
}

// PostgreSQL Database
resource postgresDatabase 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2022-12-01' = {
  parent: postgresServer
  name: postgresDatabaseName
  properties: {
    charset: 'UTF8'
    collation: 'en_US.utf8'
  }
}

// PostgreSQL Firewall Rule (Allow Azure Services)
resource postgresFirewallRule 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2022-12-01' = {
  parent: postgresServer
  name: 'AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

// Application Insights
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    RetentionInDays: 90
    IngestionMode: 'ApplicationInsights'
  }
  tags: {
    Environment: environment
    Application: 'KSA-HR-Monitoring'
  }
}

// Key Vault
resource keyVault 'Microsoft.KeyVault/vaults@2023-02-01' = {
  name: keyVaultName
  location: location
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: tenantId
    accessPolicies: []
    enableRbacAuthorization: true
    enableSoftDelete: true
    softDeleteRetentionInDays: 90
  }
  tags: {
    Environment: environment
    Application: 'KSA-HR-Secrets'
  }
}

// Storage Account
resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    supportsHttpsTrafficOnly: true
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false
  }
  tags: {
    Environment: environment
    Application: 'KSA-HR-Storage'
  }
}

// Outputs
output apiAppServiceUrl string = 'https://${apiAppName}.azurewebsites.net'
output frontendAppServiceUrl string = 'https://${frontendAppName}.azurewebsites.net'
output postgresServerFqdn string = postgresServer.properties.fullyQualifiedDomainName
output appInsightsInstrumentationKey string = appInsights.properties.InstrumentationKey
output keyVaultUri string = keyVault.properties.vaultUri
output storageAccountName string = storageAccount.name
