# Feature: User Authentication with NextAuth.js

The following plan should be complete, but it's important that you validate documentation and codebase patterns and task sanity before you start implementing.

Pay special attention to naming of existing utils types and models. Import from the right files etc.

## Feature Description

Implement user authentication system using NextAuth.js with credentials provider (email/password). Connect to existing Prisma User model, automatically create Wallet with 3 free credits on signup, protect API routes, and add login/signup UI components.

## User Story

As a **Curatos user**
I want to **create an account and log in with email/password**
So that **I can access my research sessions, wallet balance, and transaction history**

## Problem Statement

The application currently has no authentication system. Users cannot create accounts, log in, or have their data persisted across sessions. The database has User and Wallet models but no way to authenticate users or protect routes.

## Solution Statement

Implement NextAuth.js with credentials provider for email/password authentication. Hash passwords with bcrypt, create wallet with 3 free credits on signup, protect API routes with middleware, and add login/signup UI components to the dashboard.

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: Medium
**Primary Systems Affected**: Authentication, API routes, Database, UI
**Dependencies**: NextAuth.js, bcrypt, Prisma, React

---

## CONTEXT REFERENCES

### Relevant Codebase Files IMPORTANT: YOU MUST READ THESE FILES BEFORE IMPLEMENTING!

- `prisma/schema.prisma` - User and Wallet models already defined
- `src/lib/db/client.ts` - Database client with retry wrapper
- `src/lib/db/index.ts` - Database exports (getPrisma)
- `src/app/layout.tsx` - Root layout for SessionProvider
- `src/app/page.tsx` (lines 1-50) - Main dashboard component
- `src/components/dashboard/APIConnector.tsx` - API key input pattern
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript path aliases (@/*)

### New Files to Create

- `src/app/api/auth/[...nextauth]/route.ts` - NextAuth.js API route
- `src/lib/auth/config.ts` - NextAuth configuration
- `src/lib/auth/index.ts` - Auth utilities (getServerSession, etc.)
- `src/components/auth/LoginForm.tsx` - Login UI component
- `src/components/auth/SignupForm.tsx` - Signup UI component
- `src/components/auth/AuthModal.tsx` - Modal wrapper for auth forms
- `src/app/api/auth/signup/route.ts` - Signup API endpoint
- `src/middleware.ts` - Route protection middleware
- `src/types/next-auth.d.ts` - NextAuth TypeScript types

### Relevant Documentation YOU SHOULD READ THESE BEFORE IMPLEMENTING!

- [NextAuth.js v5 Documentation](https://authjs.dev/getting-started/installation)
  - Specific section: Credentials Provider
  - Why: Core authentication setup
- [NextAuth.js Prisma Adapter](https://authjs.dev/getting-started/adapters/prisma)
  - Specific section: Setup with Prisma
  - Why: Database integration pattern
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
  - Specific section: Protecting routes
  - Why: Route protection pattern
- [bcrypt Documentation](https://www.npmjs.com/package/bcrypt)
  - Why: Password hashing

### Patterns to Follow

**Naming Conventions:**
- Components: PascalCase (LoginForm, SignupForm)
- Files: kebab-case for components, camelCase for utilities
- API routes: kebab-case (signup, [...nextauth])

**Import Pattern:**
```typescript
import { getPrisma } from '@/lib/db';
import { getServerSession } from '@/lib/auth';
```

**Error Handling:**
```typescript
if (!response.ok) {
  const error = await response.text();
  throw new Error(`Error: ${response.status} - ${error}`);
}
```

**Component Pattern:**
```typescript
'use client';
import { useState } from 'react';
export default function Component() { ... }
```

---

## IMPLEMENTATION PLAN

### Phase 1: Foundation - NextAuth Setup

Install dependencies, configure NextAuth with credentials provider, set up Prisma adapter.

**Tasks:**
- Install next-auth, bcrypt, @types/bcrypt
- Create NextAuth API route
- Configure credentials provider
- Set up session strategy

### Phase 2: Core Implementation - Auth Logic

Implement signup endpoint, password hashing, wallet creation, session management.

**Tasks:**
- Create signup API endpoint
- Hash passwords with bcrypt
- Create user and wallet in transaction
- Configure NextAuth callbacks

### Phase 3: UI Components

Create login/signup forms, auth modal, integrate with dashboard.

**Tasks:**
- Create LoginForm component
- Create SignupForm component
- Create AuthModal wrapper
- Add auth state to dashboard

### Phase 4: Route Protection

Implement middleware to protect API routes and pages.

**Tasks:**
- Create middleware.ts
- Protect API routes
- Add session checks
- Handle unauthorized access

---

## STEP-BY-STEP TASKS

### INSTALL Dependencies

- **IMPLEMENT**: Install NextAuth.js, bcrypt, and types
- **PATTERN**: Existing package.json structure
- **IMPORTS**: None
- **GOTCHA**: Use bcrypt (not bcryptjs) for better security
- **VALIDATE**: `npm list next-auth bcrypt`

```bash
npm install next-auth@beta bcrypt
npm install -D @types/bcrypt
```

### UPDATE prisma/schema.prisma

- **IMPLEMENT**: Add password field to User model
- **PATTERN**: Existing User model structure
- **IMPORTS**: None
- **GOTCHA**: Password should be optional for future OAuth support
- **VALIDATE**: `npx prisma format && npx prisma validate`

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String?
  name      String?
  image     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  wallet       Wallet?
  researches   Research[]
  transactions Transaction[]

  @@index([email])
}
```

### RUN Migration

- **IMPLEMENT**: Create migration for password field
- **PATTERN**: Prisma migration workflow
- **IMPORTS**: None
- **GOTCHA**: Ensure database is running
- **VALIDATE**: `npm run db:migrate`

```bash
npm run db:migrate
# Name: add_password_to_user
```

### CREATE src/lib/auth/config.ts

- **IMPLEMENT**: NextAuth configuration with credentials provider
- **PATTERN**: NextAuth v5 configuration
- **IMPORTS**: `import { NextAuthConfig } from 'next-auth';`, `import { getPrisma } from '@/lib/db';`, `import bcrypt from 'bcrypt';`
- **GOTCHA**: Use JWT strategy for serverless compatibility
- **VALIDATE**: `npx tsc --noEmit`

```typescript
import { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { getPrisma } from '@/lib/db';
import bcrypt from 'bcrypt';

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const prisma = getPrisma();
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: { wallet: true },
        });

        if (!user || !user.password) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!passwordMatch) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
```

### CREATE src/types/next-auth.d.ts

- **IMPLEMENT**: Extend NextAuth types with user ID
- **PATTERN**: TypeScript declaration merging
- **IMPORTS**: `import 'next-auth';`
- **GOTCHA**: Must be in types/ directory for TypeScript to pick up
- **VALIDATE**: `npx tsc --noEmit`

```typescript
import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
  }
}
```

### CREATE src/app/api/auth/[...nextauth]/route.ts

- **IMPLEMENT**: NextAuth API route handler
- **PATTERN**: Next.js App Router API route
- **IMPORTS**: `import NextAuth from 'next-auth';`, `import { authConfig } from '@/lib/auth/config';`
- **GOTCHA**: Must export GET and POST handlers
- **VALIDATE**: `npx tsc --noEmit`

```typescript
import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth/config';

const handler = NextAuth(authConfig);

export { handler as GET, handler as POST };
```

### CREATE src/lib/auth/index.ts

- **IMPLEMENT**: Auth utility exports
- **PATTERN**: Barrel export pattern
- **IMPORTS**: `import { getServerSession as nextGetServerSession } from 'next-auth';`, `import { authConfig } from './config';`
- **GOTCHA**: Wrap getServerSession for easier imports
- **VALIDATE**: `npx tsc --noEmit`

```typescript
import { getServerSession as nextGetServerSession } from 'next-auth';
import { authConfig } from './config';

export async function getServerSession() {
  return nextGetServerSession(authConfig);
}

export { authConfig } from './config';
```

### CREATE src/app/api/auth/signup/route.ts

- **IMPLEMENT**: Signup endpoint with wallet creation
- **PATTERN**: Next.js API route with POST handler
- **IMPORTS**: `import { NextResponse } from 'next/server';`, `import { getPrisma } from '@/lib/db';`, `import bcrypt from 'bcrypt';`
- **GOTCHA**: Use Prisma transaction to create user and wallet atomically
- **VALIDATE**: `curl -X POST http://localhost:5001/api/auth/signup -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"test123","name":"Test"}'`

```typescript
import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const prisma = getPrisma();

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and wallet in transaction
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        wallet: {
          create: {
            balance: 3,
            totalPurchased: 0,
            totalUsed: 0,
          },
        },
      },
      include: {
        wallet: true,
      },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      wallet: user.wallet,
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### CREATE src/components/auth/LoginForm.tsx

- **IMPLEMENT**: Login form with email/password
- **PATTERN**: Client component with useState
- **IMPORTS**: `import { useState } from 'react';`, `import { signIn } from 'next-auth/react';`
- **GOTCHA**: Use signIn from next-auth/react (client-side)
- **VALIDATE**: Manual testing in browser

```typescript
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToSignup?: () => void;
}

export default function LoginForm({ onSuccess, onSwitchToSignup }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        onSuccess?.();
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Logging in...' : 'Log In'}
      </button>

      <div className="text-center text-sm">
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="text-blue-600 hover:underline"
        >
          Don't have an account? Sign up
        </button>
      </div>
    </form>
  );
}
```

### CREATE src/components/auth/SignupForm.tsx

- **IMPLEMENT**: Signup form with email/password/name
- **PATTERN**: Client component with useState
- **IMPORTS**: `import { useState } from 'react';`, `import { signIn } from 'next-auth/react';`
- **GOTCHA**: Call signup API then auto-login
- **VALIDATE**: Manual testing in browser

```typescript
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';

interface SignupFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export default function SignupForm({ onSuccess, onSwitchToLogin }: SignupFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Create account
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Signup failed');
        setLoading(false);
        return;
      }

      // Auto-login after signup
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Account created but login failed. Please try logging in.');
      } else {
        onSuccess?.();
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password (min 6 characters)
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Creating account...' : 'Sign Up (Get 3 Free Credits)'}
      </button>

      <div className="text-center text-sm">
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-blue-600 hover:underline"
        >
          Already have an account? Log in
        </button>
      </div>
    </form>
  );
}
```

### CREATE src/components/auth/AuthModal.tsx

- **IMPLEMENT**: Modal wrapper for login/signup forms
- **PATTERN**: Client component with conditional rendering
- **IMPORTS**: `import { useState } from 'react';`, `import LoginForm from './LoginForm';`, `import SignupForm from './SignupForm';`
- **GOTCHA**: Handle modal close on successful auth
- **VALIDATE**: Manual testing in browser

```typescript
'use client';

import { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'signup';
}

export default function AuthModal({ isOpen, onClose, defaultMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);

  if (!isOpen) return null;

  const handleSuccess = () => {
    onClose();
    window.location.reload(); // Refresh to update session
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {mode === 'login' ? 'Log In' : 'Sign Up'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {mode === 'login' ? (
          <LoginForm
            onSuccess={handleSuccess}
            onSwitchToSignup={() => setMode('signup')}
          />
        ) : (
          <SignupForm
            onSuccess={handleSuccess}
            onSwitchToLogin={() => setMode('login')}
          />
        )}
      </div>
    </div>
  );
}
```

### UPDATE src/app/layout.tsx

- **IMPLEMENT**: Add SessionProvider wrapper
- **PATTERN**: Existing layout structure
- **IMPORTS**: `import { SessionProvider } from 'next-auth/react';`
- **GOTCHA**: SessionProvider must wrap children
- **VALIDATE**: `npx tsc --noEmit`

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { SessionProvider } from 'next-auth/react'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Curatos DNA - Autonomous SaaS Development',
  description: 'AI-powered system for researching, validating, and building SaaS products',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
```

### CREATE src/middleware.ts

- **IMPLEMENT**: Protect API routes (except auth and health)
- **PATTERN**: Next.js middleware
- **IMPORTS**: `import { NextResponse } from 'next/server';`, `import type { NextRequest } from 'next/server';`
- **GOTCHA**: Middleware runs on edge runtime, limited APIs
- **VALIDATE**: Test protected routes return 401

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Skip auth routes and health check
  if (
    path.startsWith('/api/auth') ||
    path.startsWith('/api/health')
  ) {
    return NextResponse.next();
  }

  // Protect other API routes
  if (path.startsWith('/api/')) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

### UPDATE .env

- **IMPLEMENT**: Add NextAuth secret
- **PATTERN**: Existing .env structure
- **IMPORTS**: None
- **GOTCHA**: Generate secure random string for NEXTAUTH_SECRET
- **VALIDATE**: Check .env file

```bash
# Add to .env
NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:5001"
```

### UPDATE package.json

- **IMPLEMENT**: Add generate-secret script
- **PATTERN**: Existing scripts structure
- **IMPORTS**: None
- **GOTCHA**: Helper script for generating NEXTAUTH_SECRET
- **VALIDATE**: `npm run generate-secret`

```json
"scripts": {
  "generate-secret": "node -e \"console.log('NEXTAUTH_SECRET=' + require('crypto').randomBytes(32).toString('base64'))\""
}
```

---

## TESTING STRATEGY

### Manual Testing

1. **Signup Flow**
   - Open dashboard
   - Click signup
   - Enter email, password, name
   - Verify account created
   - Check wallet has 3 credits in Prisma Studio

2. **Login Flow**
   - Log out
   - Click login
   - Enter credentials
   - Verify logged in

3. **Protected Routes**
   - Try accessing API without auth
   - Verify 401 response

### Integration Tests

No automated tests for MVP. Manual testing sufficient.

### Edge Cases

1. **Duplicate Email**: Returns error
2. **Invalid Password**: Returns error
3. **Missing Fields**: Returns validation error
4. **Weak Password**: Minimum 6 characters enforced

---

## VALIDATION COMMANDS

### Level 1: Syntax & Style

```bash
npx tsc --noEmit
npm run lint
npx prisma validate
```

### Level 2: Database

```bash
npm run db:migrate
npm run db:studio
# Verify User has password field
```

### Level 3: Build

```bash
npm run build
```

### Level 4: Manual Validation

```bash
npm run dev

# Test signup
curl -X POST http://localhost:5001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","name":"Test User"}'

# Test login (in browser)
# Open http://localhost:5001
# Click signup/login
# Verify authentication works
```

---

## ACCEPTANCE CRITERIA

- [x] NextAuth.js installed and configured
- [x] Credentials provider with email/password
- [x] Password hashing with bcrypt
- [x] User model has password field
- [x] Signup creates user and wallet (3 credits)
- [x] Login authenticates against database
- [x] Session management with JWT
- [x] Login/Signup UI components
- [x] Auth modal with form switching
- [x] Protected API routes with middleware
- [x] TypeScript types for NextAuth
- [x] No regressions in existing functionality

---

## COMPLETION CHECKLIST

- [ ] All tasks completed in order
- [ ] TypeScript compilation passes
- [ ] Prisma migration successful
- [ ] Build succeeds
- [ ] Signup creates user + wallet
- [ ] Login authenticates correctly
- [ ] Protected routes return 401 without auth
- [ ] UI components render correctly
- [ ] Session persists across page reloads
- [ ] All acceptance criteria met

---

## NOTES

### Design Decisions

1. **JWT Strategy**: Chosen over database sessions for serverless compatibility
2. **Bcrypt**: 10 rounds for password hashing (balance of security and performance)
3. **Atomic Wallet Creation**: Prisma transaction ensures user and wallet created together
4. **Client-Side Auth**: SessionProvider for easy session access in components
5. **Middleware Protection**: Edge runtime for fast route protection

### Trade-offs

- **No OAuth**: MVP focuses on credentials only, OAuth can be added later
- **No Email Verification**: Simplified MVP, add verification in production
- **No Password Reset**: Can be added as follow-up feature
- **Client-Side Session**: Refresh on login/signup for simplicity

### Future Enhancements

- Add OAuth providers (Google, GitHub)
- Email verification on signup
- Password reset flow
- Remember me functionality
- Session management UI
- Rate limiting on auth endpoints

### Security Considerations

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens signed with NEXTAUTH_SECRET
- Protected API routes with middleware
- HTTPS required in production
- Password minimum length enforced

---

**Estimated Confidence Score:** 9/10

This plan provides complete authentication setup with clear validation steps. NextAuth.js is well-documented and the Prisma integration is straightforward. Minimal risk of breaking existing functionality.
