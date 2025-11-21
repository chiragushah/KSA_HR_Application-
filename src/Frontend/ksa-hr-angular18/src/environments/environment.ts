// environment.ts - Development configuration
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7001/api',
  azureAd: {
    clientId: 'your-client-id',
    authority: 'https://login.microsoftonline.com/your-tenant-id',
    redirectUri: 'http://localhost:4200',
    scopes: ['api://ksa-hr-api/access_as_user']
  }
};
