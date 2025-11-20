# KSA HR Application Development Requirements

## Project Overview
Convert the Bahrain HR application to Saudi Arabia with full GOSI, EOSB, and Saudi Labor Law compliance.

## Technology Stack Requirements
- **Frontend**: Angular (latest version)
- **Backend**: ASP.NET Core 8 Web API
- **Database**: PostgreSQL
- **ORM**: Entity Framework Core Code-First approach
- **Authentication**: Azure Entra ID with Identity Framework
- **Deployment**: Azure with Bicep templates

## Source Application Analysis
The original Bahrain HR application (Diyar Bahrain HR System) includes:
- Employee Management with search and analytics
- Organizational Management with chart visualization  
- Payroll Processing (currently in BHD)
- Master Data Management (departments, positions, salary grades, benefits, allowances)
- EOS Calculator, Analytics, Compliance modules
- Islamic Calendar & Holiday integration
- Role-based access (HR Administrator, Team Manager, Employee)
- Bilingual support (English/Arabic)

**Source URLs**:
- Application: https://c05zs88lbkfj.space.minimax.io
- Chat Reference: https://agent.minimax.io/chat?id=330997049507964

## Saudi Arabia Compliance Requirements

### Currency & Localization
- **Change currency**: BHD (Bahraini Dinar) → SAR (Saudi Riyal)
- **Language**: Maintain Arabic/English bilingual support
- **Calendar**: Keep Islamic (Hijri) calendar integration

### GOSI (General Organization for Social Insurance)
- **Saudi Nationals**: 21.5% total (Employee: 9.75%, Employer: 11.75%)
- **New Saudi Employees** (after July 3, 2024): Graduated rates starting 10.25%
- **Expatriates**: 2% employer contribution only
- **Calculation Base**: Basic salary + Housing allowances

### EOSB (End of Service Benefits)
- **Formula**: 
  - ≤5 years: (Basic Salary ÷ 2) × Years of Service
  - >5 years: (Basic Salary ÷ 2) × 5 + (Basic Salary × Remaining Years)
- **Eligibility**: Minimum 1 year continuous service

### Leave Policies
- **Annual Leave**: 21 days (1-5 years), 30 days (5+ years)
- **Sick Leave**: 120 days total (30 full pay, 60 one-third pay, 30 unpaid)
- **Maternity**: 10 weeks (4 before, 6 after delivery)
- **Other**: Paternity (3 days), Bereavement (2 days), Marriage (3 days), Hajj (10-15 days)

### Working Hours & Overtime
- **Standard**: 8 hours/day, 48 hours/week, Sunday-Thursday
- **Overtime**: Hourly wage + 50% of basic wage
- **Annual Limit**: 720 hours (extendable with consent)

### Minimum Wage
- **Saudi Nationals**: SAR 4,000/month (private sector)
- **Public Sector**: SAR 3,000/month

## Core Modules to Implement

### 1. Employee Management
- Employee registration with GOSI numbers
- Support for Saudi National ID and Iqama
- Salary structure with basic + housing breakdown
- WPS (Wage Protection System) compliance

### 2. Payroll Processing
- **GOSI Calculations**: Different rates for Saudis vs expatriates
- **Minimum Wage Validation**: SAR 4,000 for Saudis
- **Overtime Calculations**: 150% rate
- **Currency**: All amounts in SAR
- **WPS Integration**: Bank transfer requirements

### 3. Leave Management
- Updated leave entitlements per Saudi law
- Saudi public holidays (National Day, Sports Day, etc.)
- Islamic calendar integration
- Leave approval workflows

### 4. EOS Calculator
- Saudi-specific calculation formula
- Service period tracking
- Different rates for different employee categories
- Certificate generation

### 5. Compliance & Reporting
- GOSI contribution reports
- WPS compliance reporting
- Zakat calculations (for Saudis/GCC)
- Monthly/annual compliance summaries

### 6. Master Data
- **Departments**: Maintain Arabic/English names
- **Salary Grades**: SAR-based ranges
- **Benefits**: Saudi market standards
- **Allowances**: Housing allowances calculation
- **Roles & Permissions**: Azure AD integration

## Azure Infrastructure Requirements

### Bicep Templates Needed
- Azure App Service (for hosting)
- Azure Database for PostgreSQL
- Azure Application Insights
- Azure Key Vault (for secrets)
- Azure Storage Account (for documents)
- Azure Active Directory App Registration

### Security Requirements
- Azure Entra ID integration
- JWT token authentication
- Role-based authorization
- Data encryption at rest and in transit

## Development Architecture

### Database Design (Entity Framework Code-First)
```csharp
// Core Entities
- Employee (with GOSI fields)
- Department 
- Position
- SalaryGrade
- Benefits
- Allowances
- LeaveRequests
- PayrollRecords
- EOSCalculations
- GOSIContributions
```

### API Endpoints Structure
```
/api/auth/* - Azure AD authentication
/api/employees/* - Employee management
/api/departments/* - Organizational management
/api/payroll/* - Payroll processing with GOSI
/api/leaves/* - Leave management
/api/eos/* - End of Service calculations
/api/reports/* - Compliance reporting
/api/master-data/* - Configuration
```

### Angular Frontend Structure
```
src/
├── app/
│   ├── core/ (auth, guards, services)
│   ├── shared/ (components, pipes, directives)
│   ├── features/
│   │   ├── employee-management/
│   │   ├── payroll/
│   │   ├── leave-management/
│   │   ├── organizational/
│   │   └── reports/
│   └── layout/ (navigation, header, sidebar)
```

## Implementation Priorities

### Phase 1: Core Infrastructure (Days 1-2)
1. Set up Angular frontend project
2. Create ASP.NET Core Web API
3. Configure PostgreSQL with Entity Framework
4. Implement Azure AD authentication

### Phase 2: Employee & Payroll (Days 3-4)
1. Employee management with GOSI integration
2. Payroll processing with GOSI calculations
3. Master data management
4. Basic reporting

### Phase 3: Leave & Compliance (Day 5)
1. Leave management system
2. EOS calculator implementation
3. Compliance reporting
4. WPS integration

### Phase 4: Azure Deployment (Day 6)
1. Bicep templates creation
2. Azure deployment
3. Production configuration
4. Performance optimization

## Success Criteria
- ✅ All HR modules functional with Saudi compliance
- ✅ GOSI calculations accurate for different employee categories
- ✅ EOS calculator follows Saudi Labor Law
- ✅ Leave policies match Saudi regulations
- ✅ Azure deployment successful
- ✅ Authentication via Azure Entra ID working
- ✅ Bilingual support (Arabic/English)
- ✅ Demo-ready application

## Code Repository
- **Repository**: https://github.com/chiragushah/KSA_HR_Application-.git
- **Status**: Empty repository - build from scratch
- **Deployment**: Azure hosting required

## Documentation Requirements
- API documentation
- Database schema documentation
- Deployment guide
- User manual
- Compliance guide

## Azure Deployment Preparation
Will need Azure CLI credentials and subscription details for deployment phase.