# KSA HR Application - Azure Deployment Guide

## Prerequisites

1. **Azure CLI** installed and authenticated
2. **Azure Subscription** with sufficient permissions
3. **Azure AD App Registration** for authentication
4. **.NET 8 SDK** for local development
5. **Node.js 18+** for Angular frontend
6. **PostgreSQL client** for database management

## Azure AD App Registration

### Step 1: Create App Registration

```bash
# Login to Azure
az login

# Create App Registration
az ad app create \
  --display-name "KSA HR Application" \
  --sign-in-audience AzureADMyOrg \
  --web-redirect-uris "https://ksa-hr-app-web-prod-{suffix}.azurewebsites.net" \
  --enable-id-token-issuance true
```

### Step 2: Configure API Permissions

1. Go to Azure Portal > Azure Active Directory > App Registrations
2. Select "KSA HR Application"
3. Go to "API Permissions"
4. Add permissions:
   - Microsoft Graph > User.Read
   - Microsoft Graph > email
   - Microsoft Graph > profile

### Step 3: Create Client Secret

```bash
az ad app credential reset --id {app-id} --append
```

Save the client secret securely - you'll need it for deployment.

## Deployment Steps

### 1. Prepare Resource Group

```bash
# Set variables
RESOURCE_GROUP="ksa-hr-rg"
LOCATION="eastus"
ENVIRONMENT="prod"

# Create resource group
az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION \
  --tags Environment=$ENVIRONMENT Application=KSA-HR-System
```

### 2. Create Key Vault and Store Secrets

```bash
# Create temporary Key Vault for secrets
KV_NAME="ksa-hr-kv-temp"
az keyvault create \
  --name $KV_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION

# Store PostgreSQL password
az keyvault secret set \
  --vault-name $KV_NAME \
  --name "postgres-admin-password" \
  --value "YourSecurePassword123!"

# Store Azure AD Client Secret
az keyvault secret set \
  --vault-name $KV_NAME \
  --name "azure-ad-client-secret" \
  --value "your-client-secret"
```

### 3. Update Parameters File

Edit `main.parameters.json` and replace:
- `{subscription-id}` with your Azure subscription ID
- `{rg-name}` with `ksa-hr-rg`
- `{kv-name}` with `ksa-hr-kv-temp`
- `your-tenant-id` with your Azure AD tenant ID
- `your-client-id` with your App Registration client ID

### 4. Deploy Infrastructure

```bash
# Deploy using Bicep
az deployment group create \
  --resource-group $RESOURCE_GROUP \
  --template-file Bicep/main.bicep \
  --parameters Bicep/main.parameters.json \
  --verbose
```

This will create:
- App Service Plan (B2 tier)
- API App Service (ASP.NET Core 8)
- Frontend App Service (Angular)
- PostgreSQL Flexible Server
- Application Insights
- Key Vault
- Storage Account

### 5. Configure Database

```bash
# Get PostgreSQL connection details
POSTGRES_SERVER=$(az deployment group show \
  --resource-group $RESOURCE_GROUP \
  --name main \
  --query properties.outputs.postgresServerFqdn.value -o tsv)

# Connect and verify database
psql "host=$POSTGRES_SERVER port=5432 dbname=ksahr_db user=ksahradmin sslmode=require"
```

### 6. Deploy Backend API

```bash
# Navigate to backend folder
cd Backend

# Restore dependencies
dotnet restore

# Build for production
dotnet publish -c Release -o ./publish

# Create deployment package
cd publish
zip -r ../api-deploy.zip .
cd ..

# Deploy to Azure
az webapp deploy \
  --resource-group $RESOURCE_GROUP \
  --name $(az deployment group show --resource-group $RESOURCE_GROUP --name main --query properties.outputs.apiAppServiceUrl.value -o tsv | sed 's/https:\/\///') \
  --src-path api-deploy.zip \
  --type zip
```

### 7. Run Database Migrations

```bash
# Update connection string in appsettings.json
# Run migrations
dotnet ef database update --project KsaHrApi.csproj
```

### 8. Deploy Frontend Application

```bash
# Navigate to frontend folder
cd ../Frontend/ksa-hr-app

# Install dependencies
npm install

# Build for production
npm run build:prod

# Deploy to Azure
cd dist/ksa-hr-app
zip -r ../../frontend-deploy.zip .
cd ../..

az webapp deploy \
  --resource-group $RESOURCE_GROUP \
  --name $(az deployment group show --resource-group $RESOURCE_GROUP --name main --query properties.outputs.frontendAppServiceUrl.value -o tsv | sed 's/https:\/\///') \
  --src-path frontend-deploy.zip \
  --type zip
```

## Configuration

### Update API CORS Settings

```bash
API_APP_NAME="ksa-hr-app-api-prod-{suffix}"
FRONTEND_URL=$(az webapp show \
  --resource-group $RESOURCE_GROUP \
  --name ksa-hr-app-web-prod-{suffix} \
  --query defaultHostName -o tsv)

az webapp cors add \
  --resource-group $RESOURCE_GROUP \
  --name $API_APP_NAME \
  --allowed-origins "https://$FRONTEND_URL"
```

### Configure Authentication

1. Update API `appsettings.json` with Azure AD details
2. Update Frontend `environment.prod.ts` with API URL and Azure AD config
3. Test authentication flow

## Verification

### Check API Health

```bash
API_URL=$(az deployment group show \
  --resource-group $RESOURCE_GROUP \
  --name main \
  --query properties.outputs.apiAppServiceUrl.value -o tsv)

curl $API_URL/health
```

### Check Frontend

```bash
FRONTEND_URL=$(az deployment group show \
  --resource-group $RESOURCE_GROUP \
  --name main \
  --query properties.outputs.frontendAppServiceUrl.value -o tsv)

echo "Access application at: $FRONTEND_URL"
```

## Monitoring

### View Application Logs

```bash
# API Logs
az webapp log tail \
  --resource-group $RESOURCE_GROUP \
  --name $API_APP_NAME

# Frontend Logs
az webapp log tail \
  --resource-group $RESOURCE_GROUP \
  --name $FRONTEND_APP_NAME
```

### Application Insights

Access metrics and traces:
```bash
az monitor app-insights component show \
  --resource-group $RESOURCE_GROUP \
  --app ksa-hr-app-insights-prod-{suffix}
```

## Scaling

### Scale App Service Plan

```bash
# Scale up (vertical)
az appservice plan update \
  --resource-group $RESOURCE_GROUP \
  --name ksa-hr-app-plan-prod-{suffix} \
  --sku P1V2

# Scale out (horizontal)
az appservice plan update \
  --resource-group $RESOURCE_GROUP \
  --name ksa-hr-app-plan-prod-{suffix} \
  --number-of-workers 3
```

### Scale PostgreSQL

```bash
az postgres flexible-server update \
  --resource-group $RESOURCE_GROUP \
  --name ksa-hr-app-db-prod-{suffix} \
  --sku-name Standard_D2s_v3
```

## Backup and Disaster Recovery

### Database Backups

Automatic backups are configured for 7 days retention. To perform manual backup:

```bash
az postgres flexible-server backup create \
  --resource-group $RESOURCE_GROUP \
  --name ksa-hr-app-db-prod-{suffix} \
  --backup-name manual-backup-$(date +%Y%m%d)
```

### Application Backup

```bash
az webapp backup create \
  --resource-group $RESOURCE_GROUP \
  --webapp-name $API_APP_NAME \
  --container-url "https://{storage-account}.blob.core.windows.net/backups"
```

## Security

### Enable Managed Identity

```bash
az webapp identity assign \
  --resource-group $RESOURCE_GROUP \
  --name $API_APP_NAME
```

### Configure SSL/TLS

```bash
az webapp config set \
  --resource-group $RESOURCE_GROUP \
  --name $API_APP_NAME \
  --min-tls-version 1.2 \
  --ftps-state Disabled
```

## Troubleshooting

### Common Issues

1. **Database Connection Failures**
   - Check firewall rules
   - Verify connection string
   - Ensure SSL mode is enabled

2. **Authentication Errors**
   - Verify Azure AD configuration
   - Check redirect URIs
   - Validate client ID and tenant ID

3. **CORS Errors**
   - Update CORS settings in API
   - Verify frontend URL in allowed origins

### Get Deployment Outputs

```bash
az deployment group show \
  --resource-group $RESOURCE_GROUP \
  --name main \
  --query properties.outputs
```

## Cost Estimation

### Monthly Costs (Production Environment)

- App Service Plan (B2): ~$70/month
- PostgreSQL (Standard_B2s): ~$45/month
- Application Insights: ~$5/month (first 5GB free)
- Storage Account: ~$2/month
- Key Vault: ~$1/month

**Total Estimated: ~$123/month**

## Support

For issues and questions:
- Check Application Insights for errors
- Review Azure App Service logs
- Contact IT Support

## Next Steps

1. Configure continuous deployment (CI/CD)
2. Set up staging environment
3. Configure custom domain
4. Enable Application Gateway for advanced routing
5. Implement Azure Front Door for global distribution
6. Set up Azure DevOps pipelines
