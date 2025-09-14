# 🎪 EventSphere Admin Dashboard

A comprehensive web-based administrative dashboard for managing events, users, and system operations built as a capstone project for the Aptech ADSE program.

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Project Structure](#-project-structure)
- [API Integration](#-api-integration)
- [Usage Guide](#-usage-guide)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [Team](#-team)
- [License](#-license)

## 🎯 Project Overview

EventSphere Admin Dashboard is a full-stack web application designed to provide comprehensive administrative control over an event management system. The application serves as the central hub for administrators and event organizers to manage events, user accounts, and system operations efficiently.

### 🎓 Academic Context

This project was developed as part of the **Aptech Advanced Diploma in Software Engineering (ADSE)** program, demonstrating proficiency in modern web development technologies, system architecture design, and full-stack application development.

### 🌐 Live Demo

- **Frontend Application**: [https://eventsphere-admin-dashboard.onrender.com](https://eventsphere-admin-dashboard.onrender.com)
- **Backend API**: [https://eventsphere-backend-i42h.onrender.com](https://eventsphere-backend-i42h.onrender.com)

## ✨ Features

### 🔐 Authentication & Authorization
- **JWT-based authentication** with automatic token refresh
- **Role-based access control (RBAC)** with three user roles:
  - **Administrator**: Full system access and management
  - **Organizer**: Event creation and management capabilities
  - **Participant**: Limited access to public features
- **Secure session management** with automatic logout on token expiration

### 🎪 Event Management
- **Create Events**: Comprehensive event creation form with image upload support
- **Edit Events**: Full event modification with pre-populated forms
- **Event Gallery**: Multiple image upload and management
- **Status Management**: Approve, decline, publish, and cancel events
- **Advanced Filtering**: Search by title, status, date range, and organizer
- **Real-time Statistics**: Dashboard with event metrics and insights

### 👥 User Management
- **User Overview**: Paginated user listings with role-based filtering
- **Profile Management**: View and edit user information
- **Status Control**: Activate/deactivate user accounts
- **Role Assignment**: Change user roles and permissions
- **Bulk Operations**: Efficient user management workflows

### 📊 Dashboard & Analytics
- **Real-time Metrics**: Event counts, user statistics, and system health
- **Interactive Charts**: Visual representation of key performance indicators
- **Quick Actions**: One-click access to common administrative tasks
- **Status Overview**: Pending approvals, active events, and system alerts

### 🎨 User Interface & Experience
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Modern UI Components**: Built with Radix UI and Tailwind CSS
- **Dark/Light Theme Support**: Adaptive theming system
- **Accessibility**: WCAG-compliant design with keyboard navigation
- **Performance Optimized**: Lazy loading, image optimization, and caching

## 🛠 Technology Stack

### Frontend Framework
- **Next.js 15.5.3**: React-based full-stack framework with App Router
- **React 19.1.0**: Modern React with concurrent features and hooks
- **TypeScript**: Type-safe JavaScript for robust development

### UI & Styling
- **Tailwind CSS 4**: Utility-first CSS framework
- **Radix UI**: Accessible, unstyled UI primitives
- **Lucide React**: Modern icon library
- **Sonner**: Toast notification system

### Form Management
- **React Hook Form**: Performant forms with easy validation
- **Zod**: TypeScript-first schema validation
- **@hookform/resolvers**: Schema validation integration

### State Management & Authentication
- **Context API**: React's built-in state management
- **JWT Tokens**: Secure authentication tokens
- **Local Storage**: Client-side token persistence

### Development Tools
- **ESLint**: Code linting and quality enforcement
- **TypeScript**: Static type checking
- **Tailwind PostCSS**: CSS processing and optimization

## 📋 Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js** (version 18.0.0 or higher)
- **npm** or **yarn** package manager
- **Git** for version control

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd admin-web-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://eventsphere-backend-i42h.onrender.com

# Development Configuration
NODE_ENV=development

# Optional: Additional environment variables
# NEXT_PUBLIC_APP_NAME=EventSphere Admin
# NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### 5. Build for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
admin-web-app/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   ├── (dashboard)/              # Protected dashboard routes
│   │   ├── events/               # Event management pages
│   │   ├── users/                # User management pages
│   │   ├── settings/             # System settings
│   │   └── page.tsx              # Dashboard home
│   ├── components/               # Reusable components
│   │   ├── ui/                   # UI components (buttons, forms, etc.)
│   │   ├── layout/               # Layout components
│   │   └── common/               # Common utilities
│   └── contexts/                 # React contexts
├── lib/                          # Utility libraries
│   ├── api/                      # API client functions
│   ├── utils/                    # Helper functions
│   └── middleware.ts             # Route protection
├── types/                        # TypeScript type definitions
├── public/                       # Static assets
└── styles/                       # Global styles
```

### Key Directories Explained

- **`app/`**: Next.js 13+ App Router structure with route groups
- **`components/`**: Reusable UI components built with Radix UI
- **`lib/`**: Core business logic, API clients, and utilities
- **`types/`**: TypeScript interfaces and type definitions

## 🔗 API Integration

The application integrates with a RESTful API backend hosted at [https://eventsphere-backend-i42h.onrender.com](https://eventsphere-backend-i42h.onrender.com).

### Authentication Endpoints
- `POST /api/v1/auth/login` - User authentication
- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/verify-email` - Email verification
- `POST /api/v1/auth/refresh-token` - Token refresh

### Event Management Endpoints
- `GET /api/v1/admin/events` - List events with pagination
- `POST /api/v1/admin/events` - Create new event
- `PUT /api/v1/admin/events/{id}` - Update existing event
- `DELETE /api/v1/admin/events/{id}` - Delete event
- `POST /api/v1/admin/events/{id}/approve` - Approve pending event

### User Management Endpoints
- `GET /api/v1/admin/users` - List users with pagination
- `PATCH /api/v1/admin/users/{id}/status` - Update user status
- `PATCH /api/v1/admin/users/{id}/roles` - Update user roles

## 📖 Usage Guide

### For Administrators

1. **Login**: Access the application using admin credentials
2. **Dashboard Overview**: Review system metrics and pending tasks
3. **Event Management**:
   - Create new events with comprehensive details
   - Review and approve pending events
   - Edit existing events and manage images
   - Monitor event statistics and performance
4. **User Management**:
   - View all registered users
   - Activate/deactivate user accounts
   - Modify user roles and permissions
   - Monitor user activity and engagement

### For Event Organizers

1. **Login**: Access with organizer credentials
2. **Event Creation**: Create and manage personal events
3. **Content Management**: Upload images and update event details
4. **Status Tracking**: Monitor approval status and event performance

## 🚀 Deployment

### Development Deployment

```bash
# Development server
npm run dev

# Build for development
npm run build
npm start
```

### Production Deployment

The application is configured for deployment on platforms like:

- **Render**: Current hosting platform
- **Vercel**: Alternative deployment option
- **Netlify**: Static hosting with serverless functions

### Environment Variables for Production

```env
# Production API URL
NEXT_PUBLIC_API_URL=https://eventsphere-backend-i42h.onrender.com

# Production settings
NODE_ENV=production

# Optional analytics and monitoring
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

## 🤝 Contributing

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/new-feature`
3. **Commit** changes: `git commit -m 'Add new feature'`
4. **Push** to branch: `git push origin feature/new-feature`
5. **Create** Pull Request

### Code Standards

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting with Next.js configuration
- **Prettier**: Code formatting (if configured)
- **Conventional Commits**: Standardized commit messages

### Testing

```bash
# Run linting
npm run lint

# Type checking
npm run build

# Manual testing
npm run dev
```

## 👥 Team

This project was developed by:

- **Project Lead & Developer**: [Student Name]
- **Academic Supervisor**: Aptech ADSE Faculty
- **Technical Advisor**: Aptech Technical Team

*Developed as part of the Advanced Diploma in Software Engineering (ADSE) program at Aptech Computer Education.*

## 📄 License

This project is developed as an academic assignment and is intended for educational purposes. All rights reserved to the original developers and Aptech Computer Education.

## 📞 Support

For technical support or questions regarding this project:

- **Project Repository**: [GitHub Repository URL]
- **Documentation**: [https://eventsphere-admin-dashboard.onrender.com](https://eventsphere-admin-dashboard.onrender.com)
- **API Documentation**: Available in `doc.md`

## 🔄 Version History

- **v1.0.0**: Initial release with core features
  - User authentication and authorization
  - Event creation and management
  - User management system
  - Responsive dashboard interface
  - Image upload functionality

---

**Built with ❤️ for the Aptech ADSE Program**

*This project demonstrates modern web development practices, full-stack architecture, and professional software engineering principles.*
