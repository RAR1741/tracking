# Authentication Implementation

This project now includes user authentication using Better Auth with Drizzle ORM adapter.

## Features

- **Email/Password Authentication**: Users can sign up and sign in with email and password
- **Session Management**: Sessions persist for 7 days with refresh every 24 hours
- **Database Integration**: User data is stored in PostgreSQL using Drizzle ORM
- **Type Safety**: Full TypeScript support with Better Auth types

## Database Schema

The following tables have been added to support authentication:

- `user` - Stores user information (id, name, email, emailVerified, image, createdAt, updatedAt)
- `session` - Stores user sessions (id, userId, token, expiresAt, ipAddress, userAgent, createdAt, updatedAt)
- `account` - Stores account information for different providers
- `verification` - Stores email verification tokens

## API Endpoints

Better Auth provides the following endpoints:

- `GET /api/auth/ok` - Health check endpoint
- `POST /api/auth/sign-up/email` - Create new user account
- `POST /api/auth/sign-in/email` - Sign in existing user
- `POST /api/auth/sign-out` - Sign out current user
- `GET /api/auth/session` - Get current session information

## Usage

### Frontend Routes

- `/auth?mode=signup` - Sign up page
- `/auth?mode=signin` - Sign in page
- `/auth/signout` - Sign out action (POST)

### Client-side Authentication

```typescript
import { signIn, signUp, signOut, useSession } from "~/lib/auth-client";

// Sign up new user
await signUp.email({
  email: "user@example.com",
  password: "password123",
  name: "John Doe"
});

// Sign in existing user
await signIn.email({
  email: "user@example.com",
  password: "password123"
});

// Sign out
await signOut();

// Get session in React components
const { data: session } = useSession();
```

### Server-side Session Access

```typescript
import { auth } from "../../auth.js";

export async function loader({ request }) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (session) {
    // User is authenticated
    console.log(session.user.email);
  }
}
```

## Configuration

The auth configuration is in `/auth.ts`:

- Database connection using Drizzle adapter
- Email/password authentication enabled
- No email verification required (for development)
- 7-day session expiration
- 24-hour session refresh

## Security Features

- Secure session token generation
- Password hashing
- CSRF protection
- Rate limiting (configurable)
- Secure cookie settings in production

## Next Steps

You can extend the authentication system by:

1. Adding email verification
2. Implementing password reset
3. Adding OAuth providers (Google, GitHub, etc.)
4. Adding two-factor authentication
5. Implementing role-based access control
6. Adding user profile management
