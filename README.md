# KSA HR Management System

## نظام إدارة الموارد البشرية السعودي

A comprehensive HR Management System designed specifically for Saudi Arabia compliance, featuring GOSI integration, EOSB calculations, and Saudi Labor Law compliance.

## Features

### Core Modules

- **Employee Management** - إدارة الموظفين
  - Complete employee records with Saudi National ID and Iqama support
  - GOSI registration tracking
  - Bilingual support (English/Arabic)
  - Organizational hierarchy management
  - WPS (Wage Protection System) compliance

- **Payroll Processing** - معالجة الرواتب
  - Automated GOSI calculations (different rates for Saudis vs expatriates)
  - Saudi nationals: 21.5% total (9.75% employee + 11.75% employer)
  - New Saudi employees: Graduated rates 2024-2028
  - Expatriates: 2% employer contribution only
  - Minimum wage validation (SAR 4,000 for Saudi nationals)
  - All calculations in SAR (Saudi Riyal)

- **Leave Management** - إدارة الإجازات
  - Annual leave: 21 days (1-5 years), 30 days (5+ years)
  - Sick leave: 120 days (30 full pay, 60 one-third pay, 30 unpaid)
  - Maternity leave: 10 weeks
  - Other leave types: Paternity (3 days), Bereavement (2 days), Marriage (3 days), Hajj (10-15 days)
  - Automated leave balance calculation
  - Leave approval workflows

- **EOSB Calculator** - حاسبة مكافأة نهاية الخدمة
  - Saudi Labor Law Article 84 compliance
  - Formula: ≤5 years: (Basic Salary ÷ 2) × Years
  - Formula: >5 years: (Basic Salary ÷ 2) × 5 + (Basic Salary × Remaining Years)
  - Automatic service period calculation
  - Certificate generation

- **Master Data Management** - إدارة البيانات الأساسية
  - Departments (with hierarchy)
  - Positions
  - Salary grades
  - Benefits and allowances
  - Leave types

- **Compliance & Reporting** - الامتثال والتقارير
  - GOSI contribution reports
  - WPS compliance reports
  - EOSB liability calculations
  - Monthly/annual summaries
  - Analytics dashboard

## Technology Stack

### Backend
- **Framework**: ASP.NET Core 8.0
- **Database**: PostgreSQL 15
- **ORM**: Entity Framework Core (Code-First)
- **Authentication**: Azure Entra ID (Azure AD) with Identity Framework
- **API**: RESTful Web API with Swagger documentation

### Frontend
- **Framework**: Angular 17
- **Language**: TypeScript
- **Styling**: SCSS with responsive design
- **State Management**: RxJS
- **HTTP**: Angular HttpClient with interceptors

### Deployment
- **Cloud**: Microsoft Azure
- **Infrastructure as Code**: Bicep templates
- **App Hosting**: Azure App Service (Linux)
- **Database**: Azure Database for PostgreSQL
- **Monitoring**: Application Insights
- **Security**: Azure Key Vault for secrets

## Project Structure

```
KSA_HR_Application-/
├── src/
│   ├── Backend/                    # ASP.NET Core 8 API
│   │   ├── Controllers/            # API endpoints
│   │   ├── Models/                 # Entity models
│   │   ├── Services/               # Business logic
│   │   │   ├── GosiCalculationService.cs
│   │   │   ├── EosbCalculationService.cs
│   │   │   ├── PayrollService.cs
│   │   │   ├── LeaveService.cs
│   │   │   └── EmployeeService.cs
│   │   ├── Data/                   # DbContext and migrations
│   │   ├── Program.cs              # Application startup
│   │   └── KsaHrApi.csproj         # Project file
│   │
│   ├── Frontend/                   # Angular application
│   │   └── ksa-hr-app/
│   │       ├── src/
│   │       │   ├── app/
│   │       │   │   ├── core/       # Services, models, interceptors
│   │       │   │   ├── features/   # Feature modules
│   │       │   │   │   ├── dashboard/
│   │       │   │   │   ├── employee/
│   │       │   │   │   ├── payroll/
│   │       │   │   │   ├── leave/
│   │       │   │   │   └── reports/
│   │       │   │   └── shared/     # Shared components
│   │       │   ├── assets/         # Static assets
│   │       │   └── environments/   # Environment configs
│   │       ├── angular.json
│   │       ├── package.json
│   │       └── tsconfig.json
│   │
│   └── Bicep/                      # Azure deployment templates
│       ├── main.bicep              # Main infrastructure template
│       └── main.parameters.json    # Deployment parameters
│
└── docs/                           # Documentation
    ├── DEPLOYMENT_GUIDE.md         # Azure deployment instructions
    ├── saudi_arabia_hr_regulations_2024.md
    └── requirements.md             # Project requirements
```

## Quick Start

### Prerequisites

- .NET 8 SDK
- Node.js 18+
- PostgreSQL 15
- Azure CLI (for deployment)
- Azure subscription

### Local Development

#### 1. Setup Database

```bash
# Create PostgreSQL database
createdb ksahr_db

# Update connection string in Backend/appsettings.json
```

#### 2. Run Backend API

```bash
cd src/Backend

# Restore dependencies
dotnet restore

# Run migrations
dotnet ef database update

# Start API
dotnet run

# API will be available at https://localhost:7001
```

#### 3. Run Frontend

```bash
cd src/Frontend/ksa-hr-app

# Install dependencies
npm install

# Start development server
npm start

# Application will be available at http://localhost:4200
```

### Azure Deployment

Follow the comprehensive [Deployment Guide](docs/DEPLOYMENT_GUIDE.md) for Azure deployment instructions.

## Configuration

### Backend Configuration (appsettings.json)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=ksahrdb;Username=postgres;Password=password"
  },
  "AzureAd": {
    "Instance": "https://login.microsoftonline.com/",
    "TenantId": "your-tenant-id",
    "ClientId": "your-client-id"
  },
  "GosiRates": {
    "SaudiEmployee": 0.0975,
    "SaudiEmployer": 0.1175,
    "ExpatEmployer": 0.02
  },
  "MinimumWage": {
    "SaudiPrivateSector": 4000
  }
}
```

### Frontend Configuration (environment.ts)

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7001/api',
  azureAd: {
    clientId: 'your-client-id',
    authority: 'https://login.microsoftonline.com/your-tenant-id',
    redirectUri: 'http://localhost:4200'
  }
};
```

## Saudi Arabia Compliance

### GOSI Contribution Rates (2024)

| Employee Type | Employee Rate | Employer Rate | Total |
|--------------|--------------|---------------|-------|
| Saudi National | 9.75% | 11.75% | 21.5% |
| New Saudi (2024) | 10.25% | 11.75% | 22% |
| Expatriate | 0% | 2% | 2% |

**Calculation Base**: Basic Salary + Housing Allowance

### EOSB Calculation Formula

- **Service ≤ 5 years**: (Basic Salary ÷ 2) × Years of Service
- **Service > 5 years**: (Basic Salary ÷ 2) × 5 + (Basic Salary × Remaining Years)

**Example**: 8 years of service, SAR 10,000 salary
- First 5 years: (10,000 ÷ 2) × 5 = SAR 25,000
- Remaining 3 years: 10,000 × 3 = SAR 30,000
- **Total EOSB**: SAR 55,000

### Leave Entitlements

| Leave Type | Entitlement | Notes |
|-----------|------------|-------|
| Annual | 21 days (1-5 yrs) / 30 days (5+ yrs) | Article 109 |
| Sick | 120 days | 30 full, 60 1/3, 30 unpaid |
| Maternity | 10 weeks | 4 before, 6 after |
| Paternity | 3 days | Paid |
| Bereavement | 2 days | Immediate family |
| Marriage | 3 days | One-time |
| Hajj | 10-15 days | After 2+ years |

## API Documentation

### Authentication

All API endpoints require Bearer token authentication via Azure AD.

```bash
Authorization: Bearer {access_token}
```

### Key Endpoints

#### Employees
- `GET /api/employees` - Get all employees
- `GET /api/employees/{id}` - Get employee by ID
- `POST /api/employees` - Create new employee
- `PUT /api/employees/{id}` - Update employee
- `DELETE /api/employees/{id}` - Delete employee
- `GET /api/employees/search?searchTerm={term}` - Search employees

#### Payroll
- `POST /api/payroll/process` - Process single employee payroll
- `POST /api/payroll/process-bulk` - Process bulk payroll
- `GET /api/payroll?employeeId={id}&month={month}&year={year}` - Get payroll record

#### EOSB
- `POST /api/eosb/calculate` - Calculate EOSB for employee
- `POST /api/eosb/calculate-quick` - Quick EOSB calculation
- `POST /api/eosb/save-calculation` - Save EOSB calculation
- `GET /api/eosb/history/{employeeId}` - Get EOSB history

#### Leave
- `POST /api/leave` - Create leave request
- `POST /api/leave/{id}/approve` - Approve leave
- `POST /api/leave/{id}/reject` - Reject leave
- `GET /api/leave/employee/{employeeId}` - Get employee leaves
- `GET /api/leave/pending` - Get pending leaves
- `GET /api/leave/balance/{employeeId}` - Get leave balance

#### Master Data
- `GET /api/departments` - Get all departments
- `GET /api/master-data/positions` - Get all positions
- `GET /api/master-data/salary-grades` - Get salary grades
- `GET /api/master-data/leave-types` - Get leave types

## Security

### Role-Based Access Control

- **HRAdministrator**: Full access to all modules
- **TeamManager**: Employee management, leave approval, reporting
- **Employee**: View own data, submit leave requests

### Data Protection

- All data encrypted at rest (Azure Storage encryption)
- TLS 1.2+ for data in transit
- Azure Key Vault for secret management
- Azure AD for authentication and authorization
- CORS configured for frontend access only

## Testing

### Backend Tests

```bash
cd src/Backend
dotnet test
```

### Frontend Tests

```bash
cd src/Frontend/ksa-hr-app
npm test
```

## Monitoring

### Application Insights

- Real-time application monitoring
- Performance metrics
- Error tracking
- Custom telemetry

### Logging

- Structured logging with Serilog
- Log levels: Debug, Information, Warning, Error, Critical
- Application Insights integration

## Maintenance

### Database Migrations

```bash
# Create new migration
dotnet ef migrations add MigrationName

# Apply migrations
dotnet ef database update

# Rollback migration
dotnet ef database update PreviousMigrationName
```

### Backup

- Automated daily backups (7-day retention)
- Point-in-time restore available
- Manual backup via Azure Portal or CLI

## Support

For technical support, please contact:
- Email: support@ksahr.com
- Documentation: [docs/](docs/)

## License

Proprietary - All rights reserved

## Contributors

- Development Team
- Saudi HR Compliance Team
- Azure Infrastructure Team

## Acknowledgments

- Ministry of Human Resources and Social Development (HRSD)
- General Organization for Social Insurance (GOSI)
- Saudi Labor Law references

---

**Last Updated**: November 2025
**Version**: 1.0.0
**Status**: Production Ready
