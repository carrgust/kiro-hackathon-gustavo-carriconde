# Feature: Setup Next.js Dashboard

The following plan should be complete, but its important that you validate documentation and codebase patterns and task sanity before you start implementing.

Pay special attention to naming of existing utils types and models. Import from the right files etc.

## Feature Description

Set up a Next.js 14 project with TypeScript and create a basic dashboard layout for Curatos DNA. The dashboard will serve as the main interface for users to view their research projects and track validation progress through the Ready State criteria (Market Demand + Willingness to Pay + Ability to Pay + Buildable).

## User Story

As a user
I want to view a dashboard that shows my research projects and their validation status
So that I can track the progress of my SaaS ideas through the validation pipeline

## Problem Statement

Currently there is no application code - we need to bootstrap the Next.js project and create the foundational UI structure that will house the autonomous research and validation system.

## Solution Statement

Create a minimal Next.js 14 application with TypeScript, Tailwind CSS, and shadcn/ui components. Build a dashboard layout with project sidebar, main content area, and status cards for validation progress. Use local state management for MVP without database dependency.

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: Medium
**Primary Systems Affected**: Frontend UI, Project Structure
**Dependencies**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui

---

## CONTEXT REFERENCES

### Relevant Codebase Files IMPORTANT: YOU MUST READ THESE FILES BEFORE IMPLEMENTING!

- `.kiro/steering/tech.md` - Why: Contains technology stack requirements and standards
- `.kiro/steering/structure.md` - Why: Defines project directory structure and naming conventions
- `.kiro/steering/product.md` - Why: Contains product context and Ready State validation criteria

### New Files to Create

- `package.json` - Next.js project dependencies and scripts
- `next.config.js` - Next.js configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `src/app/layout.tsx` - Root layout component
- `src/app/page.tsx` - Dashboard page component
- `src/components/ui/` - shadcn/ui base components
- `src/components/dashboard/` - Dashboard-specific components
- `src/types/project.ts` - TypeScript types for projects
- `src/lib/mock-data.ts` - Mock project data for development

### Relevant Documentation YOU SHOULD READ THESE BEFORE IMPLEMENTING!

- [Next.js 14 App Router](https://nextjs.org/docs/app)
  - Specific section: App Router fundamentals
  - Why: Required for proper Next.js 14 structure
- [shadcn/ui Installation](https://ui.shadcn.com/docs/installation/next)
  - Specific section: Next.js setup guide
  - Why: Proper component library integration
- [Tailwind CSS with Next.js](https://tailwindcss.com/docs/guides/nextjs)
  - Specific section: Installation and configuration
  - Why: Styling framework setup

### Patterns to Follow

**Component Structure:**
- Use functional components with TypeScript
- Props interfaces defined inline or in separate types file
- Export components as default

**File Naming:**
- Components: PascalCase (e.g., `ProjectSidebar.tsx`)
- Utilities: camelCase (e.g., `mockData.ts`)
- Types: PascalCase with `.types.ts` suffix

**Styling:**
- Use Tailwind utility classes
- shadcn/ui components for consistent design system
- Responsive design with mobile-first approach

---

## IMPLEMENTATION PLAN

### Phase 1: Foundation

Set up Next.js 14 project with TypeScript and essential dependencies.

**Tasks:**
- Initialize Next.js project with TypeScript
- Configure Tailwind CSS
- Install and configure shadcn/ui
- Set up project structure

### Phase 2: Core Layout

Create the main dashboard layout structure.

**Tasks:**
- Build root layout component
- Create dashboard page structure
- Implement responsive grid layout

### Phase 3: Dashboard Components

Build the three main dashboard areas.

**Tasks:**
- Create project list sidebar component
- Build main content area component
- Implement status cards for validation progress
- Add mock data and state management

### Phase 4: Integration & Polish

Connect components and add final touches.

**Tasks:**
- Wire up component interactions
- Add responsive behavior
- Test layout on different screen sizes
- Ensure TypeScript compliance

---

## STEP-BY-STEP TASKS

IMPORTANT: Execute every task in order, top to bottom. Each task is atomic and independently testable.

### CREATE package.json

- **IMPLEMENT**: Next.js 14 project with TypeScript, Tailwind, and shadcn/ui dependencies
- **PATTERN**: Standard Next.js package.json structure
- **IMPORTS**: next@14, react, typescript, tailwindcss, @radix-ui components
- **GOTCHA**: Use exact versions for stability
- **VALIDATE**: `npm install && npm run build`

### CREATE next.config.js

- **IMPLEMENT**: Basic Next.js configuration for TypeScript and Tailwind
- **PATTERN**: Standard Next.js config with TypeScript support
- **IMPORTS**: None required
- **GOTCHA**: Ensure TypeScript strict mode enabled
- **VALIDATE**: `npm run build`

### CREATE tailwind.config.js

- **IMPLEMENT**: Tailwind configuration with shadcn/ui integration
- **PATTERN**: shadcn/ui recommended Tailwind config
- **IMPORTS**: tailwindcss/plugin for shadcn/ui
- **GOTCHA**: Include proper content paths for Next.js app directory
- **VALIDATE**: `npx tailwindcss -i ./src/app/globals.css -o ./dist/output.css`

### CREATE tsconfig.json

- **IMPLEMENT**: TypeScript configuration for Next.js 14 with strict mode
- **PATTERN**: Next.js recommended TypeScript config
- **IMPORTS**: None required
- **GOTCHA**: Enable strict mode and proper path mapping
- **VALIDATE**: `npx tsc --noEmit`

### CREATE src/app/globals.css

- **IMPLEMENT**: Global CSS with Tailwind directives and shadcn/ui base styles
- **PATTERN**: Standard Tailwind CSS setup with shadcn/ui variables
- **IMPORTS**: @tailwind directives
- **GOTCHA**: Include CSS custom properties for shadcn/ui theming
- **VALIDATE**: `npm run dev` and check styles load

### CREATE src/types/project.ts

- **IMPLEMENT**: TypeScript interfaces for Project and ValidationStatus
- **PATTERN**: Interface-based type definitions
- **IMPORTS**: None required
- **GOTCHA**: Include all Ready State criteria fields
- **VALIDATE**: `npx tsc --noEmit`

### CREATE src/lib/mock-data.ts

- **IMPLEMENT**: Mock project data with various validation states
- **PATTERN**: Export const array of mock objects
- **IMPORTS**: Project types from ../types/project
- **GOTCHA**: Include realistic project names and validation progress
- **VALIDATE**: `npx tsc --noEmit`

### CREATE src/components/ui/card.tsx

- **IMPLEMENT**: shadcn/ui Card component
- **PATTERN**: shadcn/ui component structure with forwardRef
- **IMPORTS**: React, clsx, class-variance-authority
- **GOTCHA**: Follow exact shadcn/ui Card implementation
- **VALIDATE**: `npx tsc --noEmit`

### CREATE src/components/ui/badge.tsx

- **IMPLEMENT**: shadcn/ui Badge component for status indicators
- **PATTERN**: shadcn/ui component with variants
- **IMPORTS**: React, clsx, class-variance-authority
- **GOTCHA**: Include success, warning, destructive variants
- **VALIDATE**: `npx tsc --noEmit`

### CREATE src/components/dashboard/ProjectSidebar.tsx

- **IMPLEMENT**: Sidebar component displaying list of projects
- **PATTERN**: Functional component with props interface
- **IMPORTS**: Project types, mock data, Card component
- **GOTCHA**: Make responsive - collapse on mobile
- **VALIDATE**: `npm run dev` and check sidebar renders

### CREATE src/components/dashboard/ProjectContent.tsx

- **IMPLEMENT**: Main content area showing selected project details
- **PATTERN**: Conditional rendering based on selected project
- **IMPORTS**: Project types, Card and Badge components
- **GOTCHA**: Handle no project selected state
- **VALIDATE**: `npm run dev` and check content area

### CREATE src/components/dashboard/StatusCards.tsx

- **IMPLEMENT**: Grid of cards showing Ready State validation progress
- **PATTERN**: Grid layout with Card components
- **IMPORTS**: Project types, Card and Badge components
- **GOTCHA**: Show all 4 Ready State criteria (Market Demand, Willingness to Pay, Ability to Pay, Buildable)
- **VALIDATE**: `npm run dev` and check status cards display

### CREATE src/app/layout.tsx

- **IMPLEMENT**: Root layout with HTML structure and global styles
- **PATTERN**: Next.js 14 app router layout structure
- **IMPORTS**: globals.css, Inter font from next/font/google
- **GOTCHA**: Include proper metadata and viewport configuration
- **VALIDATE**: `npm run dev` and check page loads

### UPDATE src/app/page.tsx

- **IMPLEMENT**: Dashboard page with sidebar, content, and status components
- **PATTERN**: Client component with useState for project selection
- **IMPORTS**: Dashboard components, mock data, useState
- **GOTCHA**: Use 'use client' directive for state management
- **VALIDATE**: `npm run dev` and test full dashboard functionality

---

## TESTING STRATEGY

### Manual Testing

Since this is UI-focused MVP without complex logic, focus on manual testing of the interface.

**Browser Testing:**
- Test in Chrome, Firefox, Safari
- Verify responsive behavior on mobile, tablet, desktop
- Check component interactions and state updates

**Component Testing:**
- Verify project selection updates main content
- Check status cards display correct validation states
- Test sidebar collapse/expand on mobile

### Edge Cases

- No projects in list
- Project with incomplete validation data
- Very long project names
- Mobile viewport behavior

---

## VALIDATION COMMANDS

Execute every command to ensure zero regressions and 100% feature correctness.

### Level 1: Syntax & Style

```bash
npx tsc --noEmit
npm run lint
```

### Level 2: Build Validation

```bash
npm run build
npm run start
```

### Level 3: Development Server

```bash
npm run dev
```

### Level 4: Manual Validation

- Navigate to http://localhost:3000
- Verify dashboard loads without errors
- Test project selection in sidebar
- Check status cards display validation progress
- Test responsive behavior by resizing browser
- Verify all components render correctly

---

## ACCEPTANCE CRITERIA

- [ ] Next.js 14 project successfully created with TypeScript
- [ ] Tailwind CSS properly configured and working
- [ ] shadcn/ui components installed and functional
- [ ] Dashboard displays project list sidebar
- [ ] Main content area shows selected project details
- [ ] Status cards display Ready State validation progress
- [ ] Layout is responsive on mobile, tablet, and desktop
- [ ] Project selection updates main content area
- [ ] All TypeScript types properly defined
- [ ] No console errors in browser
- [ ] Build process completes successfully
- [ ] Code follows project naming conventions

---

## COMPLETION CHECKLIST

- [ ] All tasks completed in order
- [ ] Each task validation passed immediately
- [ ] All validation commands executed successfully
- [ ] TypeScript compilation successful with no errors
- [ ] Development server runs without issues
- [ ] Manual testing confirms dashboard works
- [ ] Responsive design tested on multiple screen sizes
- [ ] All acceptance criteria met
- [ ] Code follows established patterns and conventions

---

## NOTES

**Design Decisions:**
- Using local state with useState for MVP simplicity
- shadcn/ui provides consistent, accessible components
- Mobile-first responsive design approach
- Mock data structure mirrors future database schema

**Future Considerations:**
- State management can be upgraded to Zustand/Redux when needed
- Database integration will replace mock data
- Authentication can be added as separate feature
- Agent integration points identified in component structure
