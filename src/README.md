# PropertyFlow - Professional Property Management SaaS Platform

A comprehensive property management platform built with React, TypeScript, and Supabase. This platform provides all the tools needed for property management companies to efficiently manage their rental properties, tenants, maintenance requests, payments, and more.

## 🏢 Features

### Core Property Management
- **Property Portfolio Management** - Add, edit, and track multiple properties
- **Tenant Management** - Complete tenant profiles with lease information
- **Rent Collection** - Track payments, invoices, and financial records
- **Maintenance Requests** - Create, track, and manage maintenance issues
- **Lease Management** - Handle lease agreements and renewals

### Advanced Features
- **Multi-Tenant Architecture** - Separate data for each property management company
- **User Role Management** - Platform Admin, Company Admin, and Employee access levels
- **Import/Export** - Bulk import/export of tenant and property data
- **Automated Reminders** - Payment reminders and lease expiry notifications
- **AI Assistant** - Intelligent chatbot to help users navigate the platform
- **Comprehensive Reporting** - Financial and operational analytics

### User Access Levels

#### Platform Administrator
- Approve/reject new company registrations
- Manage all companies and users
- Platform-wide analytics and monitoring
- System configuration and settings

#### Company Administrator
- Full access to company's property portfolio
- Manage company employees and their permissions
- Add/edit properties, tenants, and financial records
- Generate reports and analytics for their properties

#### Company Employee
- View-only access to assigned properties and tenants
- Create maintenance requests and update statuses
- Access to basic reporting and tenant communication tools
- Limited permissions based on company admin settings

## 🚀 Getting Started

### Prerequisites
- Supabase account and project
- Node.js and npm/yarn installed
- Modern web browser

### Initial Setup

1. **Platform Administrator Account**
   - Email: `admin@propertyflow.com`
   - Password: `PropertyFlow2024!`
   - This account is automatically created when the server starts

2. **Company Registration Process**
   - New companies register through the registration form
   - All registrations require approval from the Platform Administrator
   - Companies specify employee count and admin details during registration

3. **Employee Access**
   - Company admins can invite employees through their dashboard
   - Employees have restricted access based on company settings
   - All employee accounts require company admin approval

## 📊 Platform Architecture

### Database Structure
The platform uses Supabase's key-value store with the following data organization:

- `user:{userId}` - User profiles and company associations
- `company:{companyId}` - Company information and settings
- `property:{companyId}:{propertyId}` - Property details (company-scoped)
- `tenant:{companyId}:{tenantId}` - Tenant information (company-scoped)
- `maintenance:{companyId}:{requestId}` - Maintenance requests (company-scoped)
- `payment:{companyId}:{paymentId}` - Payment records (company-scoped)
- `reminder:{companyId}:{reminderId}` - Automated reminders (company-scoped)
- `registration:{registrationId}` - Pending company registrations

### Security Features
- **Row-Level Security** - Data isolation between companies
- **JWT Authentication** - Secure user authentication
- **Role-Based Access Control** - Granular permissions system
- **API Authorization** - Protected endpoints with token verification

## 🛠️ Key Components

### Frontend Components
- **AuthForm** - User login and company registration
- **PlatformAdminDashboard** - Admin interface for user approval and platform management
- **CompanyDashboard** - Full-featured property management interface
- **EmployeeDashboard** - Limited access interface for company employees
- **AIAssistant** - Interactive chatbot for user guidance and task scheduling

### Backend API Endpoints
- `/register` - Company registration submission
- `/pending-registrations` - Get pending approvals (Admin only)
- `/approve-registration` - Approve/reject registrations (Admin only)
- `/profile` - User profile information
- `/properties` - Property CRUD operations
- `/tenants` - Tenant management
- `/maintenance-requests` - Maintenance tracking
- `/payments` - Financial record management
- `/reminders` - Automated reminder system
- `/dashboard-stats` - Analytics and reporting data

## 🎯 Usage Examples

### For Property Management Companies
1. **Registration**: Submit company details and wait for admin approval
2. **Setup**: Add properties, create tenant profiles, set up payment schedules
3. **Daily Operations**: Track maintenance requests, record payments, communicate with tenants
4. **Reporting**: Generate monthly reports, analyze property performance, track financials

### For Platform Administrators
1. **User Management**: Review and approve company registrations
2. **Platform Monitoring**: Track platform usage, user activity, and system health
3. **Support**: Assist companies with onboarding and technical issues

## 🔧 Customization

The platform is built with modularity in mind:

- **Styling**: Uses Tailwind CSS with shadcn/ui components
- **Database**: Extensible key-value structure
- **API**: RESTful endpoints with easy expansion
- **Components**: Reusable React components with TypeScript

## 📈 Roadmap

- [ ] Advanced reporting and analytics dashboard
- [ ] Automated lease renewal workflows
- [ ] Integration with payment processing systems
- [ ] Mobile application for tenants
- [ ] Document management and e-signature integration
- [ ] Advanced maintenance scheduling and contractor management
- [ ] QuickBooks and accounting software integration
- [ ] Tenant screening and background check services

## 🤝 Support

This platform is designed for property management companies of all sizes. The AI Assistant provides 24/7 guidance for common tasks and platform navigation.

For technical support or feature requests, contact the platform administrator through the admin dashboard.

---

**PropertyFlow** - Streamlining Property Management Operations