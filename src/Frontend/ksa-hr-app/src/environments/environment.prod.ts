export const environment = {
  production: true,
  apiUrl: 'https://ksa-hr-api.azurewebsites.net/api',
  azureAd: {
    clientId: 'your-production-client-id',
    authority: 'https://login.microsoftonline.com/your-tenant-id',
    redirectUri: 'https://ksa-hr-app.azurewebsites.net'
  }
};
