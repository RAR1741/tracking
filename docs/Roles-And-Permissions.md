# Roles and Permissions System

This application includes a comprehensive roles and permissions system that allows for fine-grained access control.

## Overview

The system consists of:

- **Roles**: Groups of permissions (ADMIN, MENTOR, STUDENT_ADMIN, STUDENT, PARENT, GUEST)
- **Permissions**: Specific actions users can perform
- **User Roles**: Many-to-many relationship between users and roles
- **User Permissions**: Direct permissions assigned to users (bypassing roles)

## Default Roles

### ADMIN

- Full system administrator with all permissions
- Can manage users, roles, permissions, and all content

### MENTOR

- Can manage students and content
- Limited user management capabilities
- Can view and update student progress

### STUDENT_ADMIN

- Student with elevated permissions
- Can create content and view student progress
- Limited administrative capabilities

### STUDENT

- Regular student with basic access
- Can read content and view own progress

### PARENT

- Can view their child's progress
- Limited to child-related information

### GUEST

- Minimal access for non-registered users
- Can only read publicly available content

## Permission Categories

### User Management

- `user:create` - Create new users
- `user:read` - View user information
- `user:update` - Update user details
- `user:delete` - Delete users
- `user:assign_roles` - Assign roles to users
- `user:assign_permissions` - Assign direct permissions

### Role Management

- `role:create`, `role:read`, `role:update`, `role:delete`

### Permission Management

- `permission:create`, `permission:read`, `permission:update`, `permission:delete`

### Content Management

- `content:create`, `content:read`, `content:update`, `content:delete`

### Student/Parent Specific

- `student:progress_view` - View student progress
- `student:progress_update` - Update student progress
- `child:progress_view` - View child's progress (for parents)

### System

- `system:admin` - Full system administration

## Usage

### Setting Up

1. Run migrations: `npm run db:migrate`
2. Seed roles and permissions: `npm run db:seed`

### Managing Users

- Visit `/users` to view all users
- Click "Edit" next to any user to manage their roles and permissions
- Assign roles and/or direct permissions as needed

### Checking Permissions in Code

```typescript
import {
  hasPermission,
  getUserWithRolesAndPermissions,
} from "../lib/user-permissions";
import { PERMISSIONS } from "../../database/seed";

// Check if user has a specific permission
const canEdit = await hasPermission(userId, PERMISSIONS.CONTENT_UPDATE);

// Get user with all roles and permissions
const userWithPerms = await getUserWithRolesAndPermissions(userId);
```

### Using Permission Checker

```typescript
import { createPermissionChecker } from "../lib/permissions";

const authContext = { userId: "user-id", isAuthenticated: true };
const permissions = createPermissionChecker(authContext);

const canManage = await permissions.canManageUsers();
const isAdmin = await permissions.isAdmin();
```

## Database Schema

### Tables Created

- `role` - Role definitions
- `permission` - Permission definitions
- `role_permission` - Links roles to permissions
- `user_role` - Links users to roles
- `user_permission` - Direct user permissions

### Key Features

- Cascading deletes for data integrity
- Audit trail with `assignedAt` and `assignedBy` fields
- Conflict resolution with `onConflictDoNothing()`
- Composite primary keys for junction tables

## Security Considerations

1. **Principle of Least Privilege**: Users should only have the minimum permissions needed
2. **Role Inheritance**: Permissions from roles are combined with direct permissions
3. **Audit Trail**: Track who assigned roles/permissions and when
4. **Data Integrity**: Foreign key constraints ensure referential integrity

## Future Enhancements

- Role hierarchies and inheritance
- Time-based permissions (expiration)
- Permission groups and categories
- API endpoints for role/permission management
- Bulk operations for user management
