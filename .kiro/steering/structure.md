# Project Structure

## Directory Layout
```
curatos-dna/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── api/               # API routes
│   │   ├── dashboard/         # Dashboard pages
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   │   ├── ui/               # Base UI components
│   │   ├── research/         # Research-related components
│   │   ├── validation/       # Validation UI components
│   │   └── build/            # Build phase components
│   ├── lib/                  # Utility functions
│   │   ├── agents/           # Agent orchestration
│   │   ├── validation/       # Ready State validation logic
│   │   └── database/         # Database utilities
│   └── types/                # TypeScript type definitions
├── .kiro/                    # Kiro CLI configuration
│   ├── agents/              # Custom agent definitions
│   ├── prompts/             # Custom prompts
│   └── steering/            # Project steering documents
├── prisma/                  # Database schema and migrations
├── public/                  # Static assets
└── docs/                    # Project documentation
```

## File Naming Conventions
- Components: PascalCase (e.g., `ResearchAgent.tsx`)
- Utilities: camelCase (e.g., `validateReadyState.ts`)
- API routes: kebab-case (e.g., `market-research.ts`)
- Types: PascalCase with `.types.ts` suffix
- Constants: UPPER_SNAKE_CASE

## Module Organization
- **Agent Layer**: Autonomous AI agents for research and development
- **Validation Layer**: Ready State criteria evaluation
- **UI Layer**: React components for user interaction
- **API Layer**: Next.js API routes for backend logic
- **Data Layer**: Prisma ORM and database models

## Configuration Files
- `.kiro/` - Kiro CLI agent and prompt configurations
- `prisma/schema.prisma` - Database schema
- `next.config.js` - Next.js configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration

## Documentation Structure
- `README.md` - Project overview and setup
- `DEVLOG.md` - Development timeline and decisions
- `docs/` - Detailed technical documentation
- `.kiro/steering/` - Product and technical specifications

## Asset Organization
- `public/` - Static assets (images, icons, etc.)
- `src/styles/` - Global CSS and Tailwind customizations
- Component-level styles using Tailwind classes

## Build Artifacts
- `.next/` - Next.js build output
- `dist/` - Production build artifacts
- `node_modules/` - Dependencies

## Environment-Specific Files
- `.env.local` - Local development environment variables
- `.env.example` - Template for required environment variables
- Vercel deployment handles production environment configuration
