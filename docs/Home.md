# Tracking Application Documentation

Welcome to the comprehensive documentation for the Tracking application - a modern web application built for learning management, training tracking, and team coordination.

## 🎯 Project Overview

This application serves as a replacement for traditional spreadsheet-based tracking systems, providing:

- **Learning Management System**: Track training progress and completion
- **Time Tracking**: Monitor time spent in training and activities
- **Training Area Management**: Organize and track different areas of expertise
- **User Management**: Comprehensive role-based access control
- **Battery Tracking**: Monitor robot battery status and usage

## 🏗️ Architecture & Tech Stack

### Frontend

- **[React 19](https://react.dev/)** - Modern React with latest features
- **[React Router 7](https://reactrouter.com/)** - Full-stack React framework with SSR
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework
- **TypeScript** - Type-safe development

### Backend

- **[Express.js](https://expressjs.com/)** - Node.js web framework
- **[Better Auth](https://www.better-auth.com/)** - Modern authentication system
- **[Drizzle ORM](https://orm.drizzle.team/)** - Type-safe database toolkit
- **[PostgreSQL](https://postgresql.org/)** - Robust relational database

### Development Tools

- **ESLint + TypeScript ESLint** - Code linting and quality
- **Prettier** - Code formatting
- **Husky + lint-staged** - Git hooks for quality gates
- **Docker** - Containerized development and deployment

## 📚 Documentation Sections

### 🔐 [Authentication System](Auth.md)

Complete guide to the authentication implementation including:

- Email/password authentication with Better Auth
- Session management and security
- Database integration with user storage
- TypeScript integration and type safety
- API endpoints and middleware setup

### 👥 [Roles and Permissions](Roles-And-Permissions.md)

Comprehensive role-based access control system:

- **Default Roles**: ADMIN, MENTOR, STUDENT_ADMIN, STUDENT, PARENT, GUEST
- **Permission Categories**: User management, content control, progress tracking
- **User Management Interface**: Edit users, assign roles, manage permissions
- **Permission Checking**: Utilities for route protection and UI control
- **Database Schema**: Detailed table structure and relationships

### ⚛️ [React Router Setup](React-Router-README.md)

Modern full-stack React application setup:

- Server-side rendering (SSR) capabilities
- Hot Module Replacement for development
- Asset bundling and optimization
- Data loading and mutation patterns
- Type-safe routing with TypeScript

### 🔍 [Code Quality & Linting](Eslint.md)

Development standards and tooling:

- ESLint configuration for TypeScript and React
- Automated code fixing and quality checks
- Pre-commit hooks with Husky and lint-staged
- Consistent code formatting with Prettier
- Best practices and development workflows

## 🚀 Quick Start Guide

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- PostgreSQL (or use Docker setup)

### Setup Steps

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd tracking
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment setup**

   ```bash
   cp .env.example .env
   # Edit .env with your database URL and other settings
   ```

4. **Database setup**

   ```bash
   # Start PostgreSQL with Docker
   docker-compose up -d postgres

   # Run migrations
   npm run db:migrate

   # Seed roles and permissions
   npm run db:seed
   ```

5. **Start development server**

   ```bash
   npm run dev
   ```

6. **Visit the application**
   Open [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Schema

The application uses PostgreSQL with the following key tables:

- **`user`** - User accounts and profile information
- **`session`** - Authentication sessions
- **`role`** - System roles (ADMIN, MENTOR, etc.)
- **`permission`** - Granular permissions
- **`user_role`** - User role assignments
- **`user_permission`** - Direct user permissions

## 🔒 Security Features

- **Authentication**: Secure email/password authentication with Better Auth
- **Authorization**: Role-based access control with granular permissions
- **Session Management**: Secure session handling with automatic refresh
- **Route Protection**: Server-side route protection with permission checks
- **CSRF Protection**: Built-in CSRF protection with Better Auth
- **Type Safety**: Full TypeScript coverage for security-critical code

## 🛠️ Development Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run db:generate     # Generate new migrations
npm run db:migrate      # Run database migrations
npm run db:seed         # Seed roles and permissions

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run format          # Format code with Prettier
npm run typecheck       # Run TypeScript checking
```

## 📁 Project Structure

```
tracking/
├── app/                  # React Router application
│   ├── components/       # Reusable UI components
│   ├── lib/              # Utility functions and helpers
│   ├── routes/           # Application routes
│   └── welcome/          # Welcome page components
├── database/             # Database schema and utilities
│   ├── schema.ts         # Drizzle schema definitions
│   ├── context.ts        # Database context management
│   └── seed.ts           # Data seeding utilities
├── docs/                 # Documentation files
├── drizzle/              # Generated migrations
├── public/               # Static assets
├── scripts/              # Utility scripts
└── server/               # Express server setup
```

## 🤝 Contributing

1. Follow the established code style (ESLint + Prettier)
2. Write TypeScript with proper types
3. Add tests for new features
4. Update documentation for changes
5. Use conventional commit messages

## 🔗 Useful Links

- **[React Router Documentation](https://reactrouter.com/docs)**
- **[Better Auth Documentation](https://www.better-auth.com/docs)**
- **[Drizzle ORM Documentation](https://orm.drizzle.team/docs)**
- **[Tailwind CSS Documentation](https://tailwindcss.com/docs)**
- **[TypeScript Documentation](https://www.typescriptlang.org/docs)**

## 📞 Support

For questions, issues, or contributions:

1. Check existing documentation in this wiki
2. Review the codebase for examples
3. Create issues for bugs or feature requests
4. Submit pull requests for improvements

---

_This documentation is automatically updated from the main branch. Last updated: 7/30/2025_
