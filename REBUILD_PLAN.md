# KSA HR Application - Complete Rebuild Plan (Angular 18+)

## Executive Summary
Complete rebuild and upgrade of the KSA HR Application with Angular 18+ features, full feature parity with the reference React application (adapted for Angular), English/Arabic bilingual support with RTL, KSA regulations compliance, and professional .NET solution structure.

**Timeline**: Phased implementation across multiple days
**Status**: Planning Complete - Implementation Starting

---

## Phase 1: Foundation & Setup (Day 1-2)

### 1.1 Angular 18+ Upgrade
- [X] Upgrade from Angular 17 to Angular 18.x
- [ ] Implement standalone components architecture
- [ ] Implement Angular Signals for state management
- [ ] Update all dependencies to latest compatible versions
- [ ] Fix breaking changes and deprecations
- [ ] Optimize build configuration for performance

### 1.2 Project Structure Enhancement
- [ ] Create comprehensive .NET Solution file
- [ ] Organize projects with proper namespaces
- [ ] Update project references and dependencies
- [ ] Configure solution-wide settings

### 1.3 PowerShell Database Scripts
- [ ] Create local PostgreSQL setup script
- [ ] Create Azure PostgreSQL deployment script
- [ ] CLI-based environment selection
- [ ] Migration and seed data management
- [ ] Environment configuration scripts

---

## Phase 2: Backend Enhancement (Day 2-3)

### 2.1 .NET Solution Structure
```
KSA_HR_Solution/
├── KSA_HR_Solution.sln
├── src/
│   ├── KSA.HR.Api/                 # ASP.NET Core 8 Web API
│   ├── KSA.HR.Core/                # Domain models and interfaces
│   ├── KSA.HR.Infrastructure/      # Data access and external services
│   ├── KSA.HR.Application/         # Business logic and services
│   └── KSA.HR.Shared/              # Common utilities and helpers
├── tests/
│   ├── KSA.HR.Api.Tests/
│   ├── KSA.HR.Core.Tests/
│   └── KSA.HR.Application.Tests/
└── scripts/
    ├── database/
    │   ├── Setup-LocalDatabase.ps1
    │   ├── Deploy-AzureDatabase.ps1
    │   └── Manage-Database.ps1
    └── deployment/
```

### 2.2 Enhanced Backend Features
- [ ] AI Analytics for retention risk and performance forecasting
- [ ] Advanced payroll processing with GOSI calculations
- [ ] Comprehensive leave management system
- [ ] Document management integration
- [ ] Training and development tracking
- [ ] Performance review system
- [ ] Violation management system
- [ ] Reimbursement and payment requests

---

## Phase 3: Frontend Rebuild (Day 3-5)

### 3.1 Core Architecture
- [ ] Implement role-based routing (HR Admin, Team Manager, Employee)
- [ ] Create Angular 18 standalone components
- [ ] Implement Angular Signals for state management
- [ ] Set up RxJS patterns for reactive data flow
- [ ] Configure Angular Material or custom UI library

### 3.2 Dashboard Implementations

#### HR Administrator Portal
- [ ] Comprehensive HR Dashboard with analytics and KPIs
- [ ] Employee Management (CRUD operations)
- [ ] Payroll Processing with GOSI calculations
- [ ] Compliance Center (GOSI, EOSB, Labor Law)
- [ ] AI Analytics & Insights
- [ ] Document Management
- [ ] Leave Management with approval workflows
- [ ] Violation Management
- [ ] Performance Reviews
- [ ] Time & Attendance
- [ ] Training & Development
- [ ] Reimbursement Claims
- [ ] Payment Requests
- [ ] System Configuration

#### Team Manager Portal
- [ ] Manager Dashboard with team-focused metrics
- [ ] Team Management with performance tracking
- [ ] Approvals Dashboard (leave, expenses, time adjustments, reviews)
- [ ] Performance Reviews for team members
- [ ] Violation Management oversight
- [ ] Team Analytics and reporting

#### Employee Portal
- [ ] Employee Dashboard with personal metrics
- [ ] My Profile & Documents management
- [ ] Time & Attendance self-service
- [ ] Leave Management (submit requests, view balance)
- [ ] Payslip Generation & History
- [ ] Payment Requests submission
- [ ] Training & Development tracking
- [ ] Violation Records viewing
- [ ] Document Access

### 3.3 Feature Implementation from Reference App

#### Core Features to Adapt from React to Angular
1. **Employee Management**
   - Employee directory with search and filters
   - Employee profiles with full details
   - Employee creation and editing forms
   - Department and position management
   - Organizational hierarchy viewer

2. **Payroll Processing**
   - GOSI calculations (Saudi/Expat rates, new employee rates)
   - Basic salary and allowances
   - Deductions management
   - Net salary calculation
   - Payroll history and reports
   - Bank integration for payments
   - Payslip PDF generation

3. **Leave Management**
   - Leave types (Annual, Sick, Maternity, Paternity, etc.)
   - Leave request submission
   - Approval workflows
   - Leave balance tracking
   - Calendar integration
   - Leave history and audit trail
   - Working days calculation (Saudi working days)

4. **EOSB Calculator**
   - Article 84 compliant calculations
   - Service period breakdown
   - Different termination scenarios
   - Certificate generation
   - History tracking

5. **Compliance Center**
   - GOSI integration and reporting
   - Labor law compliance checklists
   - Working hours monitoring
   - Overtime tracking with 720-hour annual cap
   - Contract management

6. **AI Analytics**
   - Retention risk analysis
   - Performance forecasting
   - Training optimization recommendations
   - Engagement insights
   - Predictive analytics
   - Risk assessment

7. **Document Management**
   - Employee contracts
   - Payslip archives
   - Performance reviews
   - Compliance documents
   - Training certificates
   - File upload/download

8. **Time & Attendance**
   - Clock in/out system
   - Break management
   - Overtime tracking
   - Attendance reports
   - Time approval workflows
   - Mobile access support

9. **Training & Development**
   - Training programs management
   - Progress tracking
   - Certification management
   - Training calendar
   - Performance impact tracking
   - AI-driven recommendations

10. **Master Data Management**
    - Departments with hierarchy
    - Positions and job grades
    - Salary grades
    - Benefits and allowances
    - Leave types

---

## Phase 4: Language Support (Day 5-6)

### 4.1 English/Arabic Language Switching
- [ ] Implement Angular i18n or ngx-translate
- [ ] Create translation files for all UI text
- [ ] Implement language selector component
- [ ] Persist language preference
- [ ] Support bilingual data models

### 4.2 RTL (Right-to-Left) Support
- [ ] Configure Angular Material for RTL
- [ ] Implement RTL-specific styles
- [ ] Test and fix layout issues in RTL mode
- [ ] Ensure proper text alignment
- [ ] Handle mixed LTR/RTL content

### 4.3 Cultural Adaptations
- [ ] Arabic fonts and typography
- [ ] Date formatting (Hijri calendar support)
- [ ] Number formatting (Arabic numerals)
- [ ] Currency formatting (SAR)
- [ ] Cultural UI/UX considerations

---

## Phase 5: KSA Compliance (Day 6-7)

### 5.1 GOSI Social Insurance
- [ ] 2025 dual-model system implementation
- [ ] Saudi nationals: 21.5% total (9.75% employee + 11.75% employer)
- [ ] New Saudi employees: Graduated rates 2024-2028
- [ ] Expatriates: 2% employer contribution only
- [ ] Wage caps and bases calculation
- [ ] Salary change windows (January/Muharram)
- [ ] Age-based restrictions (50+ employees)

### 5.2 End-of-Service Benefits (EOSB)
- [ ] Article 84 compliance
- [ ] Formula: ≤5 years: (Basic Salary ÷ 2) × Years
- [ ] Formula: >5 years: (Basic Salary ÷ 2) × 5 + (Basic Salary × Remaining Years)
- [ ] Resignation prorata calculations
- [ ] Termination scenario handling
- [ ] Certificate generation

### 5.3 Leave Policies
- [ ] Annual leave: 21 days (1-5 yrs), 30 days (5+ yrs)
- [ ] Maternity leave: 12 weeks (6 weeks postnatal mandatory)
- [ ] Paternity leave: 3 days
- [ ] Bereavement leave: 5 days (spouse/parents/children), 3 days (sibling)
- [ ] Hajj leave: 10-15 days (after 2+ years)
- [ ] Sick leave: Tiered payment scheme

### 5.4 Working Hours and Overtime
- [ ] Standard: 8 hours/day, 48 hours/week
- [ ] Ramadan: 6 hours/day, 36 hours/week
- [ ] Overtime: Hourly rate + 50%
- [ ] Annual overtime cap: 720 hours (extendable with consent)
- [ ] Compensatory time off option
- [ ] Public holiday handling

### 5.5 2025 Labor Law Updates
- [ ] Contract digitization (Qiwa integration)
- [ ] Probation: Up to 180 days
- [ ] Notice periods: 30 days (employee), 60 days (employer)
- [ ] National Address requirements
- [ ] Unified contract templates
- [ ] Wage Protection System (WPS)

### 5.6 Saudization (Nitaqat)
- [ ] Counting rules (disabilities, ex-prisoners, students, part-time)
- [ ] Sector-specific requirements
- [ ] Dashboard for status monitoring
- [ ] Risk assessment and remediation planning
- [ ] Qiwa integration

---

## Phase 6: Modern UI/UX Design (Day 7-8)

### 6.1 Design System
- [ ] Professional color scheme (Saudi-themed)
- [ ] Consistent typography
- [ ] Component library (buttons, cards, forms, etc.)
- [ ] Icons (Lucide or similar)
- [ ] Layout patterns
- [ ] Animation and transitions

### 6.2 Responsive Design
- [ ] Mobile-first approach
- [ ] Tablet optimization
- [ ] Desktop layout
- [ ] Print styles for reports
- [ ] Accessibility (WCAG compliance)

### 6.3 User Experience
- [ ] Intuitive navigation
- [ ] Clear information hierarchy
- [ ] Interactive elements
- [ ] Loading states
- [ ] Error handling
- [ ] Success feedback

---

## Phase 7: Azure Deployment (Day 8-9)

### 7.1 Infrastructure Updates
- [ ] Update Bicep templates for latest Azure services
- [ ] Configure App Service Plans
- [ ] Set up PostgreSQL Flexible Server
- [ ] Configure Application Insights
- [ ] Set up Key Vault for secrets
- [ ] Configure Storage for documents

### 7.2 CI/CD Pipeline
- [ ] GitHub Actions or Azure DevOps pipeline
- [ ] Automated build and test
- [ ] Automated deployment
- [ ] Environment-specific configurations

### 7.3 Security
- [ ] Azure AD integration
- [ ] Role-based access control
- [ ] API authentication and authorization
- [ ] Data encryption
- [ ] Secure configuration management

---

## Phase 8: Testing & Documentation (Day 9-10)

### 8.1 Testing
- [ ] Unit tests for services and components
- [ ] Integration tests for API endpoints
- [ ] E2E tests for critical workflows
- [ ] Performance testing
- [ ] Security testing
- [ ] Accessibility testing
- [ ] Cross-browser testing

### 8.2 Documentation
- [ ] Technical architecture documentation
- [ ] API documentation (Swagger)
- [ ] User guides (English and Arabic)
- [ ] Deployment guide
- [ ] Configuration guide
- [ ] Troubleshooting guide

### 8.3 Data Migration
- [ ] Migration scripts from old structure
- [ ] Data validation
- [ ] Backup procedures
- [ ] Rollback plan

---

## Technical Stack Summary

### Frontend
- **Framework**: Angular 18+
- **Language**: TypeScript 5.x
- **UI Library**: Angular Material or custom components
- **State Management**: Angular Signals + RxJS
- **Styling**: SCSS with Tailwind CSS utilities
- **Icons**: Lucide Angular or Material Icons
- **i18n**: Angular i18n or ngx-translate
- **Build**: Angular CLI with Vite (if available) or Webpack

### Backend
- **Framework**: ASP.NET Core 8.0
- **Architecture**: Clean Architecture (Core, Application, Infrastructure, API)
- **Database**: PostgreSQL 15+ (Azure Database for PostgreSQL - Flexible Server)
- **ORM**: Entity Framework Core 8.0 (Code-First)
- **Authentication**: Azure AD / Entra ID with JWT
- **API**: RESTful with Swagger/OpenAPI documentation
- **Logging**: Serilog with Application Insights

### Database Management
- **Scripts**: PowerShell 7+
- **Local**: PostgreSQL 15+ via Docker or direct install
- **Azure**: Azure Database for PostgreSQL - Flexible Server
- **Migrations**: EF Core Migrations
- **Seeding**: SQL scripts and EF Core seed data

### Deployment
- **Cloud**: Microsoft Azure
- **IaC**: Bicep templates
- **API Hosting**: Azure App Service (Linux)
- **Frontend Hosting**: Azure Static Web Apps or App Service
- **Database**: Azure Database for PostgreSQL - Flexible Server
- **Monitoring**: Application Insights
- **Secrets**: Azure Key Vault
- **Storage**: Azure Blob Storage (for documents)

---

## Success Criteria

### Functional Requirements
- [X] Angular 18+ with latest features implemented
- [ ] All reference application features adapted for Angular
- [ ] Working English/Arabic language switching with RTL
- [ ] Full KSA regulations compliance (GOSI, EOSB, 2025 labor law)
- [ ] Proper .NET Solution file with organized project structure
- [ ] PowerShell scripts for database management (local and Azure)
- [ ] Modern responsive UI/UX design
- [ ] Azure deployment ready with updated Bicep templates

### Non-Functional Requirements
- [ ] Performance: Page load < 3 seconds
- [ ] Security: OWASP Top 10 compliance
- [ ] Accessibility: WCAG 2.1 Level AA
- [ ] Code Quality: 80%+ test coverage
- [ ] Documentation: Comprehensive technical and user docs
- [ ] Scalability: Support 1000+ concurrent users
- [ ] Maintainability: Clean code with proper separation of concerns

---

## Risk Management

### Technical Risks
1. **Angular 18 Breaking Changes**: Mitigation - Thorough testing and incremental migration
2. **RTL Layout Issues**: Mitigation - Early testing with Arabic content
3. **GOSI Calculation Complexity**: Mitigation - Reference implementation and thorough validation
4. **Azure Cost**: Mitigation - Proper resource sizing and cost monitoring

### Business Risks
1. **Regulatory Changes**: Mitigation - Configurable compliance rules
2. **Data Migration**: Mitigation - Comprehensive testing and rollback plan
3. **User Adoption**: Mitigation - Intuitive UI and comprehensive training
4. **Integration Issues**: Mitigation - Well-defined APIs and integration testing

---

## Timeline Estimate

| Phase | Duration | Status |
|-------|----------|--------|
| Phase 1: Foundation & Setup | 2 days | Planning Complete |
| Phase 2: Backend Enhancement | 1 day | Not Started |
| Phase 3: Frontend Rebuild | 2 days | Not Started |
| Phase 4: Language Support | 1 day | Not Started |
| Phase 5: KSA Compliance | 1 day | Not Started |
| Phase 6: Modern UI/UX Design | 1 day | Not Started |
| Phase 7: Azure Deployment | 1 day | Not Started |
| Phase 8: Testing & Documentation | 1 day | Not Started |
| **Total** | **10 days** | **In Progress** |

---

## Next Steps

1. Begin Angular 18+ upgrade process
2. Create .NET Solution structure
3. Implement PowerShell database scripts
4. Start backend feature enhancements
5. Begin frontend component development

---

**Plan Created**: 2025-11-21 00:30:38
**Plan Version**: 1.0
**Last Updated**: 2025-11-21 00:30:38
