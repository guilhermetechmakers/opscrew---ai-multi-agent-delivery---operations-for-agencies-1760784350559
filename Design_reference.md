# Modern Design Best Practices

## Philosophy

Create unique, memorable experiences while maintaining consistency through modern design principles. Every project should feel distinct yet professional, innovative yet intuitive.

---

## Landing Pages & Marketing Sites

### Hero Sections
**Go beyond static backgrounds:**
- Animated gradients with subtle movement
- Particle systems or geometric shapes floating
- Interactive canvas backgrounds (Three.js, WebGL)
- Video backgrounds with proper fallbacks
- Parallax scrolling effects
- Gradient mesh animations
- Morphing blob animations

**Avoid:** Plain solid colors or static images, and gradient color for texts.

### Layout Patterns
**Use modern grid systems:**
- Bento grids (asymmetric card layouts)
- Masonry layouts for varied content
- Feature sections with diagonal cuts or curves
- Overlapping elements with proper z-index
- Split-screen designs with scroll-triggered reveals

**Avoid:** Traditional 3-column equal grids

### Scroll Animations
**Engage users as they scroll:**
- Fade-in and slide-up animations for sections
- Scroll-triggered parallax effects
- Progress indicators for long pages
- Sticky elements that transform on scroll
- Horizontal scroll sections for portfolios
- Text reveal animations (word by word, letter by letter)
- Number counters animating into view

**Avoid:** Static pages with no scroll interaction

### Call-to-Action Areas
**Make CTAs impossible to miss:**
- Gradient buttons with hover effects
- Floating action buttons with micro-interactions
- Animated borders or glowing effects
- Scale/lift on hover
- Interactive elements that respond to mouse position
- Pulsing indicators for primary actions

---

## Dashboard Applications

### Layout Structure
**Always use collapsible side navigation:**
- Sidebar that can collapse to icons only
- Smooth transition animations between states
- Persistent navigation state (remember user preference)
- Mobile: drawer that slides in/out
- Desktop: sidebar with expand/collapse toggle
- Icons visible even when collapsed

**Structure:**
```
/dashboard (layout wrapper with sidebar)
  /dashboard/overview
  /dashboard/analytics
  /dashboard/settings
  /dashboard/users
  /dashboard/projects
```

All dashboard pages should be nested inside the dashboard layout, not separate routes.

### Data Tables
**Modern table design:**
- Sticky headers on scroll
- Row hover states with subtle elevation
- Sortable columns with clear indicators
- Pagination with items-per-page control
- Search/filter with instant feedback
- Selection checkboxes with bulk actions
- Responsive: cards on mobile, table on desktop
- Loading skeletons, not spinners
- Empty states with illustrations or helpful text

**Use modern table libraries:**
- TanStack Table (React Table v8)
- AG Grid for complex data
- Data Grid from MUI (if using MUI)

### Charts & Visualizations
**Use the latest charting libraries:**
- Recharts (for React, simple charts)
- Chart.js v4 (versatile, well-maintained)
- Apache ECharts (advanced, interactive)
- D3.js (custom, complex visualizations)
- Tremor (for dashboards, built on Recharts)

**Chart best practices:**
- Animated transitions when data changes
- Interactive tooltips with detailed info
- Responsive sizing
- Color scheme matching design system
- Legend placement that doesn't obstruct data
- Loading states while fetching data

### Dashboard Cards
**Metric cards should stand out:**
- Gradient backgrounds or colored accents
- Trend indicators (↑ ↓ with color coding)
- Sparkline charts for historical data
- Hover effects revealing more detail
- Icon representing the metric
- Comparison to previous period

---

## Color & Visual Design

### Color Palettes
**Create depth with gradients:**
- Primary gradient (not just solid primary color)
- Subtle background gradients
- Gradient text for headings
- Gradient borders on cards
- Dark mode with elevated surfaces

**Color usage:**
- 60-30-10 rule (dominant, secondary, accent)
- Consistent semantic colors (success, warning, error)
- Accessible contrast ratios (WCAG AA minimum)

### Typography
**Create hierarchy through contrast:**
- Large, bold headings (48-72px for heroes)
- Clear size differences between levels
- Variable font weights (300, 400, 600, 700)
- Letter spacing for small caps
- Line height 1.5-1.7 for body text
- Inter, Poppins, or DM Sans for modern feel

### Shadows & Depth
**Layer UI elements:**
- Multi-layer shadows for realistic depth
- Colored shadows matching element color
- Elevated states on hover
- Neumorphism for special elements (sparingly)

---

## Interactions & Micro-animations

### Button Interactions
**Every button should react:**
- Scale slightly on hover (1.02-1.05)
- Lift with shadow on hover
- Ripple effect on click
- Loading state with spinner or progress
- Disabled state clearly visible
- Success state with checkmark animation

### Card Interactions
**Make cards feel alive:**
- Lift on hover with increased shadow
- Subtle border glow on hover
- Tilt effect following mouse (3D transform)
- Smooth transitions (200-300ms)
- Click feedback for interactive cards

### Form Interactions
**Guide users through forms:**
- Input focus states with border color change
- Floating labels that animate up
- Real-time validation with inline messages
- Success checkmarks for valid inputs
- Error states with shake animation
- Password strength indicators
- Character count for text areas

### Page Transitions
**Smooth between views:**
- Fade + slide for page changes
- Skeleton loaders during data fetch
- Optimistic UI updates
- Stagger animations for lists
- Route transition animations

---

## Mobile Responsiveness

### Mobile-First Approach
**Design for mobile, enhance for desktop:**
- Touch targets minimum 44x44px
- Generous padding and spacing
- Sticky bottom navigation on mobile
- Collapsible sections for long content
- Swipeable cards and galleries
- Pull-to-refresh where appropriate

### Responsive Patterns
**Adapt layouts intelligently:**
- Hamburger menu → full nav bar
- Card grid → stack on mobile
- Sidebar → drawer
- Multi-column → single column
- Data tables → card list
- Hide/show elements based on viewport

---

## Loading & Empty States

### Loading States
**Never leave users wondering:**
- Skeleton screens matching content layout
- Progress bars for known durations
- Animated placeholders
- Spinners only for short waits (<3s)
- Stagger loading for multiple elements
- Shimmer effects on skeletons

### Empty States
**Make empty states helpful:**
- Illustrations or icons
- Helpful copy explaining why it's empty
- Clear CTA to add first item
- Examples or suggestions
- No "no data" text alone

---

## Unique Elements to Stand Out

### Distinctive Features
**Add personality:**
- Custom cursor effects on landing pages
- Animated page numbers or section indicators
- Unusual hover effects (magnification, distortion)
- Custom scrollbars
- Glassmorphism for overlays
- Animated SVG icons
- Typewriter effects for hero text
- Confetti or celebration animations for actions

### Interactive Elements
**Engage users:**
- Drag-and-drop interfaces
- Sliders and range controls
- Toggle switches with animations
- Progress steps with animations
- Expandable/collapsible sections
- Tabs with slide indicators
- Image comparison sliders
- Interactive demos or playgrounds

---

## Consistency Rules

### Maintain Consistency
**What should stay consistent:**
- Spacing scale (4px, 8px, 16px, 24px, 32px, 48px, 64px)
- Border radius values
- Animation timing (200ms, 300ms, 500ms)
- Color system (primary, secondary, accent, neutrals)
- Typography scale
- Icon style (outline vs filled)
- Button styles across the app
- Form element styles

### What Can Vary
**Project-specific customization:**
- Color palette (different colors, same system)
- Layout creativity (grids, asymmetry)
- Illustration style
- Animation personality
- Feature-specific interactions
- Hero section design
- Card styling variations
- Background patterns or textures

---

## Technical Excellence

### Performance
- Optimize images (WebP, lazy loading)
- Code splitting for faster loads
- Debounce search inputs
- Virtualize long lists
- Minimize re-renders
- Use proper memoization

### Accessibility
- Keyboard navigation throughout
- ARIA labels where needed
- Focus indicators visible
- Screen reader friendly
- Sufficient color contrast
- Respect reduced motion preferences

---

## Key Principles

1. **Be Bold** - Don't be afraid to try unique layouts and interactions
2. **Be Consistent** - Use the same patterns for similar functions
3. **Be Responsive** - Design works beautifully on all devices
4. **Be Fast** - Animations are smooth, loading is quick
5. **Be Accessible** - Everyone can use what you build
6. **Be Modern** - Use current design trends and technologies
7. **Be Unique** - Each project should have its own personality
8. **Be Intuitive** - Users shouldn't need instructions


---

# Project-Specific Customizations

**IMPORTANT: This section contains the specific design requirements for THIS project. The guidelines above are universal best practices - these customizations below take precedence for project-specific decisions.**

## User Design Requirements

# OpsCrew — Development Blueprint

OpsCrew is an AI-driven multi-agent operations platform for agencies and delivery teams that automates intake, project spin-up, delivery orchestration, launch, handover, and lightweight support. It uses specialized OpenAI-powered agents (Intake, Spin‑Up, PM, Comms, Research/Copilot, Launch, Handover, Support) combined with infra and deployment integrations to reduce operational overhead, provision repos/environments, run QA/deploy workflows, and provide branded client portals with human-in-the-loop controls.

## 1. Pages (UI Screens)

- Landing Page (Public)
  - Purpose: Market product, explain value props, drive CTAs (Start Intake, Book Demo).
  - Key sections/components: Hero (headline, subheadline, primary/secondary CTAs, screenshot/video), Features Overview (agent cards), How It Works (4-step workflow), Pricing Teaser, Customer Logos & Testimonials, Footer (Docs, Terms, Privacy, Contact).

- Login / Signup
  - Purpose: Authentication entry supporting email/password, SSO, magic link.
  - Key sections/components: Email/Password Form (validation, password strength meter), SSO Buttons (SAML/OIDC, Google/Apple), Magic Link flow, Links (Forgot Password, Signup), Header/Footer.

- Email Verification / Password Reset
  - Purpose: Verify emails and securely reset passwords.
  - Key sections/components: Verification Status Card (success/failure), Resend Verification, Password Reset Form (new password/confirm), token validation, support info.

- Dashboard
  - Purpose: User control center summarizing projects, leads, agent activity and quick actions.
  - Key sections/components: Top Nav (search, notifications, user menu, create CTA), Overview Cards (active projects, pending proposals, open tickets, SLA health), Agent Activity Feed (agent actions + confidence), Quick Actions Panel, Projects List (cards/rows with status, milestone, SLA), Notifications.

- Intake Chat / Lead Qualification
  - Purpose: Interactive AI Intake Agent for qualifying leads, capturing requirements, and generating proposals/SoWs.
  - Key sections/components: Chat Window (message list, attachments, suggested replies), Qualification Form (budget, timeline, scope, stakeholders), Proposal Preview Drawer (editable proposal with version history), E-sign Integration, Admin Controls (persona, manual override, approval).

- Proposal / SoW Editor & E-Sign
  - Purpose: Create/edit proposals and manage signing/approvals.
  - Key sections/components: Rich Text Editor (template & variables), Template Library, Versioning/Comments, Approval Workflow (reviewers, statuses), E-sign Panel (DocuSign/HelloSign integration), Export (PDF/HTML), Audit log.

- Project Provisioning (Spin‑Up)
  - Purpose: Provision repos, environments, and client portal.
  - Key sections/components: Provisioning Wizard (stack template, infra options), Repo Integration Panel (connect Git provider, repo settings, webhooks), Environment & Secrets (vault integration), Client Portal Branding, Provisioning Logs & Rollback Controls.

- Project Board / PM Workspace
  - Purpose: Sprint planning, task tracking, and blocker management.
  - Key sections/components: Backlog & Sprint Views (kanban, drag/drop), Task Card (title, acceptance criteria, assignee, estimate, attachments), AI Sprint Planner Panel, Blocker Tracker (flags, escalations, SLA timers), Activity Timeline, Filters.

- Comms & Meeting Summaries
  - Purpose: Ingest recordings, summarize meetings, and convert items to tasks.
  - Key sections/components: Recordings Upload/Integrations (Zoom/Meet), Transcript & Summary Pane (searchable transcript), Action Items Extractor (convert to tasks), Client Update Composer.

- Research / Copilot Workspace
  - Purpose: Generate specs, user stories, test plans, PR drafts and code snippets.
  - Key sections/components: Spec Drafting Editor, Stack Context Selector (repo/stack context), Code Snippet Assistant, PR Draft & Commit Controls, Review & Approve Flow.

- Launch & Release Coordinator
  - Purpose: Run QA/security checklists and coordinate deploys.
  - Key sections/components: Pre-launch Checklist (automated checks), Deploy Controls (Vercel/Cloudflare triggers, logs, rollback), Release Notes Composer, Stakeholder Scheduler, Deployment Audit Log.

- Client Portal (Branded)
  - Purpose: Client-facing view of project status, deliverables, and communications.
  - Key sections/components: Project Overview (milestones, status), Documents & Deliverables, Comments & Feedback (threaded), Billing & Renewals, Portal Settings (branding, access).

- Handover & Knowledge Base
  - Purpose: Final deliverables, tutorials, governance docs, and renewal workflows.
  - Key sections/components: Handover Package Builder, Knowledge Base (searchable, versioning), Loom Embed Player, Renewal Workflow.

- Support & SLA Triage
  - Purpose: Ticket triage and SLA-driven routing and escalation.
  - Key sections/components: Ticket Queue (priority by SLA), Triage Panel (AI suggestions, KB suggestions), SLA Dashboard, Escalation Paths.

- Settings & Preferences
  - Purpose: Org configuration, team management, integrations, security, and agent personas.
  - Key sections/components: Account Settings, Team Management (roles/permissions), Billing & Subscription, Integrations, Security (2FA, API keys, audit logs), Agent Personas config.

- Admin Dashboard
  - Purpose: Org-level governance, usage, templates, and system health.
  - Key sections/components: User Management, Usage & Billing, Templates & Org Library, Security & Compliance (audit logs), System Health (integration statuses, job queues).

- Docs & Help Center
  - Purpose: Onboarding, API docs, guides and FAQs.
  - Key sections/components: Searchable Docs, Onboarding Guides, API Reference, Contact Support, Demo Scheduler.

- Pricing & Checkout
  - Purpose: Present plans and handle payments and add-ons.
  - Key sections/components: Plans Comparison, Add-ons Selector, Checkout Form (payment, coupons), Invoice Display.

- Privacy, Terms & Legal
  - Purpose: Legal and compliance pages.
  - Key sections/components: Privacy Policy, Terms of Service, Cookie Consent Manager, DPA & Data Export Form.

- 404 / 500 / Loading / Success Pages
  - Purpose: Error and system state UX.
  - Key sections/components: 404 (search, links), 500 (retry/report), Loading Skeletons, Success Confirmations.

## 2. Features

- User Authentication & Security
  - Technical details: JWT access tokens + refresh tokens in HTTP-only secure cookies; password hashing with bcrypt/argon2; rate limits and brute-force protection; email verification tokens with expiry; optional 2FA (TOTP & SMS); session revocation and device management endpoints.
  - Implementation notes: Use OAuth libraries for SAML/OIDC, integrate Google/Apple OAuth. Implement refresh token rotation and revoke on logout. Store sessions in DB with device metadata.

- AI Multi-Agent Engine
  - Technical details: Orchestration service (task queue + state machine) that sequences prompts, manages memory (embeddings), handles agent personas and allowed actions, supports human-in-the-loop approvals, logs outputs with confidence scores.
  - Implementation notes: Agents are orchestrated via server-side workflows (e.g., Temporal, Cadence, or custom job queue). Use OpenAI Chat Completions for dialog and embeddings for contextual memory. Persist agent states and audit events per project.

- Proposal & SoW Generation with E-sign
  - Technical details: Rich editor with template variables, server-side PDF rendering (Headless Chromium or PDF library), integration with DocuSign/HelloSign (webhooks), versioning and audit logs.
  - Implementation notes: Keep signed artifacts in encrypted object storage; store signature events and transaction IDs for legal audit.

- Project Provisioning & Infra Automation
  - Technical details: GitHub/GitLab API integration for repo creation and permissions; IaC via Terraform/Pulumi templates; secrets stored in HashiCorp Vault or KMS; idempotent flows and rollback strategies; webhook setups.
  - Implementation notes: Run provisioning in isolated worker environment with audited logs. Provide dry-run and rollback endpoints. Support template library per org.

- Delivery Orchestration & PM Automation
  - Technical details: Kanban/sprint data model, real-time updates (WebSocket), AI-driven task generation mapped to templates, blocker heuristics, integrations with Jira/GitHub Issues.
  - Implementation notes: Implement optimistic UI and conflict resolution for concurrent edits. Provide manual override and approval gates for AI-generated tasks.

- Comms & Meeting Summary Automation
  - Technical details: Ingest recorded meetings (Zoom/Meet), transcription pipeline (Whisper or 3rd party), NLP summarization and action item extraction using OpenAI, timestamp linking.
  - Implementation notes: Allow human review and edit before converting items to tasks. Persist transcripts and limit retention per org policy.

- Research/Copilot & Code PR Drafting
  - Technical details: Repo context ingestion via embeddings (index key files), code generation and PR draft creation via Git APIs, pre-commit checks triggered, CI integration.
  - Implementation notes: Use vector DB (Pinecone/Weaviate) for repo/document embeddings; provide a sandboxed environment for generated code; require human approval to commit.

- Launch & CI/CD Integration
  - Technical details: Integrations with Vercel and Cloudflare APIs to trigger deploys and manage DNS; launch checklist automation running tests and security scans; deploy logs and rollback control.
  - Implementation notes: Use service tokens per integration stored securely; surface pipeline logs and allow manual/auto-rollbacks.

- Handover & Knowledge Transfer
  - Technical details: Aggregate docs and media into handover packages (zip/PDF), embed Loom/Vimeo, KB indexing and search with versioning, renewal scheduling.
  - Implementation notes: Provide export options and access controls; attach runbooks and governance artifacts.

- Support & SLA Management
  - Technical details: Ticket model with SLA timers, priority routing, AI-suggested responses, escalation rules, email/webhook ticket ingestion.
  - Implementation notes: Implement SLA breach alerts and metrics dashboards; integrate with on-call/alerting tools.

- Billing & Usage Accounting
  - Technical details: Stripe for subscriptions and one-time purchases, metering for AI token usage and provisioning credits, invoices and webhook handling.
  - Implementation notes: Reconcile usage daily, provide org-level usage dashboards, support coupons and promo codes.

- Search, Filter & KB
  - Technical details: Vector search for embeddings (Pinecone/Weaviate or OpenAI embeddings), full-text search fallback, access-controlled results with facet filters.
  - Implementation notes: Incremental indexing pipelines for docs, transcripts, and repo content with change detection.

- Integrations & Connectors
  - Technical details: GitHub/GitLab, Vercel, Cloudflare, Zoom, Google Meet, DocuSign/HelloSign, Stripe, Vault/KMS, Transcription APIs.
  - Implementation notes: Centralize integration connectors with retry & backoff, per-org credentials storage, and secure webhook endpoints.

- Observability & Compliance
  - Technical details: Audit logs for agent outputs/actions, token usage logging, job queue metrics, system health dashboards, data export/DPA support.
  - Implementation notes: Store logs with retention and export capabilities; provide role-based access controls and admin audit UI.

## 3. User Journeys

- Prospect via Landing Page → Intake
  1. Prospect lands on Landing Page; clicks Start Intake.
  2. Intake Chat opens (public or light gating); Intake Agent qualifies lead through conversation.
  3. Agent generates a draft proposal/SoW in Proposal Preview.
  4. Prospect provides contact and optionally accepts to receive proposal via email.
  5. Proposal sent to prospect and assigned to sales rep for review.

- Sales / BD rep Flow
  1. Login → Dashboard → Open pending proposals.
  2. Open Proposal Editor, review AI draft, edit variables and sections.
  3. Submit for internal approval (approval workflow).
  4. Send proposal for e-sign; monitor signing status via dashboard.

- Admin / Owner Onboarding
  1. Signup via SSO or email → Email verification → Org setup wizard (company info, branding).
  2. Connect integrations (Git provider, Vercel/Cloudflare, DocuSign, Stripe).
  3. Configure Agent Personas & approval gates; invite team members.

- Project Spin-Up (PM or Admin)
  1. From Dashboard quick action: Start provision.
  2. Provisioning Wizard: select stack template, repo name, infra options, and client portal branding.
  3. Orchestration spins up repo, environments, secrets; logs shown in Provisioning Logs.
  4. On success, project appears in Projects List; client portal created and invite sent.

- Delivery (PM & Team)
  1. PM opens Project Board; runs AI Sprint Planner to generate sprint from backlog and timeline.
  2. Tasks generated with acceptance criteria; PM assigns to developers.
  3. Developers work on tasks; Research/Copilot assists with specs and PR drafts.
  4. Comms Agent summarizes meetings and converts action items into tickets.
  5. Blockers flagged by Agent; automations escalate per rules.

- Launch & Release
  1. PM triggers Launch Agent to run pre-launch checks.
  2. Launch Agent runs test harness and security checks, triggers Vercel/Cloudflare deploys.
  3. Release Notes Composer generates notes and schedules stakeholder comms.
  4. If issues, rollback is triggered from Launch UI.

- Handover & Renewal
  1. Handover Agent assembles final documentation, Loom tutorials and runbooks.
  2. Client receives handover package in portal; renewal workflow schedules outreach.

- Support & SLA Triage
  1. Client submits feedback or ticket from portal (or email ingestion).
  2. Support Agent triages, suggests responses, and assigns according to SLA rules.
  3. SLA Dashboard tracks response and resolution metrics; escalations route if breached.

- Admin / Governance
  1. Admin accesses Admin Dashboard to manage users, templates, billing, and system health.
  2. Admin configures data retention, DPA options, and audits agent outputs.

## 4. UI Guide

Apply the Visual Style and Implementation Notes below consistently.

- Global layout
  - Left sidebar (vertical) with grouped nav (Essentials, Projects, Support, Admin).
  - Top nav for contextual actions (search, notifications, user menu).
  - Content area uses grid-based card layout.

- Component tokens
  - Backgrounds: Primary #181A1B, Secondary #222426.
  - Accent: #53B7FF for active states, icons, CTA highlights.
  - Text: Primary #FFFFFF, Secondary #A3A7AC.
  - Borders: #26282A.
  - Status: #FF7784 sparingly for alerts/data viz.

- Buttons
  - Radius: 8px; default bg #222426, primary uses accent text or outline; hover lifts slightly with subtle blue glow.
  - Sizes: primary (large CTA), secondary (medium), small (icon only).

- Inputs & Forms
  - Filled dark backgrounds (use secondary), no external border; focus ring uses accent (#53B7FF) or subtle outline.
  - Spacing/padding: 8–12px inside, use 16–20px between fields.

- Cards
  - Background #222426, border 1px #26282A, radius 8px; inner shadow subtle; hover lighten to #232527.

- Sidebar & Navigation
  - Sidebar background #181A1B; active item uses #222426 with left accent bar in #53B7FF and #FFFFFF text.
  - Collapse/expand animations smooth; project lists collapsible.

- Typography
  - Font: Inter, sans-serif.
  - Headings: weight 600–700; body 400–500.
  - Spacing: 24–32px between sections, 16–20px between cards.

- Data Visualization
  - Transparent charts over cards.
  - Line charts: #FF7784; pie/donut: #53B7FF with muted segments.
  - Gridlines: #26282A; small dot markers on lines.

- Micro-interactions
  - Soft transitions for hover/focus; no aggressive animations.
  - Provide feedback for AI actions: confidence badge, human review CTA, and editable outputs.

- Accessibility
  - Contrast: ensure text meets WCAG AA on chosen backgrounds.
  - Keyboard navigation for all interactive elements (sidebar, boards, chat).
  - ARIA labels for chat messages, form controls, and dynamic content updates.

Implementation Notes:
- Enforce design tokens in a shared UI component library; apply across web app and client portal.
- After each development step, validate UIs against this UI Guide and color/typography tokens.
- Keep dark theme global and ensure exported PDFs maintain legibility (use white backgrounds where needed).

Instructions to AI Development Tool:
- After every development step, refer back to this blueprint to ensure correct implementation.
- Verify all features and pages are built according to the specified pages, features, user journeys, and UI Guide before marking tasks complete.
- Pay special attention to agent orchestration, human-in-the-loop approval flows, security (secrets, tokens), and integration webhooks.

## Implementation Notes

When implementing this project:

1. **Follow Universal Guidelines**: Use the design best practices documented above as your foundation
2. **Apply Project Customizations**: Implement the specific design requirements stated in the "User Design Requirements" section
3. **Priority Order**: Project-specific requirements override universal guidelines when there's a conflict
4. **Color System**: Extract and implement color values as CSS custom properties in HSL format
5. **Typography**: Define font families, sizes, and weights based on specifications
6. **Spacing**: Establish consistent spacing scale following the design system
7. **Components**: Style all Shadcn components to match the design aesthetic
8. **Animations**: Use Motion library for transitions matching the design personality
9. **Responsive Design**: Ensure mobile-first responsive implementation

## Implementation Checklist

- [ ] Review universal design guidelines above
- [ ] Extract project-specific color palette and define CSS variables
- [ ] Configure Tailwind theme with custom colors
- [ ] Set up typography system (fonts, sizes, weights)
- [ ] Define spacing and sizing scales
- [ ] Create component variants matching design
- [ ] Implement responsive breakpoints
- [ ] Add animations and transitions
- [ ] Ensure accessibility standards
- [ ] Validate against user design requirements

---

**Remember: Always reference this file for design decisions. Do not use generic or placeholder designs.**
