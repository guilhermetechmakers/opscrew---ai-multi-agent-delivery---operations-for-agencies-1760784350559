# Design Rules for This Project

## Project Design Pattern: ---

## Visual Style

### Color Palette:
- Primary background: #23272E (deep charcoal gray) for main workspace and cards
- Sidebar background: #191B1F (almost black) for navigation and left panels
- Card and panel surfaces: #2A2E35 and #23272E for subtle separation
- Accent colors: 
  - Yellow #F7C948 (indicators, tags)
  - Soft green #2FE6A6 (progress bars, tags)
  - Sky blue #48B7F5 (badges, links)
  - Soft red #FF6B6B (priority/status)
  - Lavender #A793F8 (highlight)
- Text colors:
  - Primary: #FFFFFF (high contrast white)
  - Secondary: #A3A7B3 (muted gray for secondary info)
  - Disabled/placeholder: #6B6E7C (low-emphasis text)
- Divider/border: #353945 (thin, low-contrast separators)
- Hover/focus: subtle overlays using #343941 or #23272E with increased brightness

### Typography & Layout:
- Font family: Inter, sans-serif; geometric, highly readable
- Weights: Regular (400) for body, Medium (500) for section headers, Bold (700) for titles
- Hierarchy: 
  - Large, bold page headers
  - Medium-weight section titles
  - Smaller, lighter supporting text and metadata (dates, statuses)
- Spacing: Generous horizontal and vertical padding (24–32px for main sections, 16px for cards)
- Layout: 
  - Three-column kanban board with cards
  - Persistent vertical sidebar navigation
  - Clear alignment, strong grid structure, and grouped sections
- Typography treatments: Minimal decoration, clear separation between content types, pill-shaped tags with uppercase or semi-bold text

### Key Design Elements
#### Card Design:
- Rounded corners (8px radius)
- Subtle drop shadows for depth without harsh contrast
- Flat surfaces with accent outlines for status/priority
- Visual hierarchy: title bold and prominent, metadata and avatars grouped at the bottom, clear calls to action (buttons)
- Hover state: slight elevation and background brightness increase

#### Navigation:
- Vertical sidebar on the left, dark background, compact width
- Icon-based main navigation with tooltips, section dividers
- Active state: accent color highlight, slightly lighter background, subtle glow or border
- Collapsible subsections (e.g., project lists), clean expand/collapse icons

#### Data Visualization:
- Status bars: thin, rounded progress lines (accent color)
- Tags: pill-shaped, color-coded for priority/status (yellow, green, red)
- Avatars: small circles, grouped or stacked for team members
- Dates/status: small badges with colored backgrounds for quick scanning

#### Interactive Elements:
- Buttons: Rounded, filled or outlined, high-contrast text; primary actions use accent colors
- Form inputs: Minimal, understated, focus ring on active
- Switches/toggles: Rounded, accent color fill when active
- Hover effects: Soft background lightening or shadow, smooth transitions (150–200ms)
- Micro-interactions: Badge pulses, subtle icon animations on click/transition

### Design Philosophy
This interface embodies:
- A modern, professional, and highly functional aesthetic for productivity-focused SaaS dashboards
- Minimalist, clean, and dark-themed design with pops of color for clarity and focus
- Consistent use of rounded corners, subtle shadows, and understated gradients for a sense of depth without clutter
- Clear visual hierarchy and spacious layouts to reduce cognitive load and increase efficiency
- User experience goals: clarity, fast navigation, immediate context, and effortless collaboration
- Visual strategy: balance between seriousness (for business/agency users) and approachability (soft colors, smooth edges), supporting complex workflows with ease

This project follows the "---

## Visual Style

### Color Palette:
- Primary background: #23272E (deep charcoal gray) for main workspace and cards
- Sidebar background: #191B1F (almost black) for navigation and left panels
- Card and panel surfaces: #2A2E35 and #23272E for subtle separation
- Accent colors: 
  - Yellow #F7C948 (indicators, tags)
  - Soft green #2FE6A6 (progress bars, tags)
  - Sky blue #48B7F5 (badges, links)
  - Soft red #FF6B6B (priority/status)
  - Lavender #A793F8 (highlight)
- Text colors:
  - Primary: #FFFFFF (high contrast white)
  - Secondary: #A3A7B3 (muted gray for secondary info)
  - Disabled/placeholder: #6B6E7C (low-emphasis text)
- Divider/border: #353945 (thin, low-contrast separators)
- Hover/focus: subtle overlays using #343941 or #23272E with increased brightness

### Typography & Layout:
- Font family: Inter, sans-serif; geometric, highly readable
- Weights: Regular (400) for body, Medium (500) for section headers, Bold (700) for titles
- Hierarchy: 
  - Large, bold page headers
  - Medium-weight section titles
  - Smaller, lighter supporting text and metadata (dates, statuses)
- Spacing: Generous horizontal and vertical padding (24–32px for main sections, 16px for cards)
- Layout: 
  - Three-column kanban board with cards
  - Persistent vertical sidebar navigation
  - Clear alignment, strong grid structure, and grouped sections
- Typography treatments: Minimal decoration, clear separation between content types, pill-shaped tags with uppercase or semi-bold text

### Key Design Elements
#### Card Design:
- Rounded corners (8px radius)
- Subtle drop shadows for depth without harsh contrast
- Flat surfaces with accent outlines for status/priority
- Visual hierarchy: title bold and prominent, metadata and avatars grouped at the bottom, clear calls to action (buttons)
- Hover state: slight elevation and background brightness increase

#### Navigation:
- Vertical sidebar on the left, dark background, compact width
- Icon-based main navigation with tooltips, section dividers
- Active state: accent color highlight, slightly lighter background, subtle glow or border
- Collapsible subsections (e.g., project lists), clean expand/collapse icons

#### Data Visualization:
- Status bars: thin, rounded progress lines (accent color)
- Tags: pill-shaped, color-coded for priority/status (yellow, green, red)
- Avatars: small circles, grouped or stacked for team members
- Dates/status: small badges with colored backgrounds for quick scanning

#### Interactive Elements:
- Buttons: Rounded, filled or outlined, high-contrast text; primary actions use accent colors
- Form inputs: Minimal, understated, focus ring on active
- Switches/toggles: Rounded, accent color fill when active
- Hover effects: Soft background lightening or shadow, smooth transitions (150–200ms)
- Micro-interactions: Badge pulses, subtle icon animations on click/transition

### Design Philosophy
This interface embodies:
- A modern, professional, and highly functional aesthetic for productivity-focused SaaS dashboards
- Minimalist, clean, and dark-themed design with pops of color for clarity and focus
- Consistent use of rounded corners, subtle shadows, and understated gradients for a sense of depth without clutter
- Clear visual hierarchy and spacious layouts to reduce cognitive load and increase efficiency
- User experience goals: clarity, fast navigation, immediate context, and effortless collaboration
- Visual strategy: balance between seriousness (for business/agency users) and approachability (soft colors, smooth edges), supporting complex workflows with ease" design pattern.
All design decisions should align with this pattern's best practices.

## 🌓 Dark/Light Mode Requirements (CRITICAL)

**THIS PROJECT MUST SUPPORT BOTH DARK AND LIGHT MODES**

- Never create single-mode UI (light-only or dark-only)
- Use CSS custom properties for all theme colors
- Theme toggle component is implemented and accessible
- Support: light, dark, and system (follows OS preference)
- Persist user's theme choice in localStorage
- Smooth transitions between themes (200-300ms)
- Test all components in both themes
- Maintain WCAG AA contrast in both modes

**Implementation:**
- Theme provider available at `src/components/theme-provider.tsx`
- Theme toggle available at `src/components/ui/theme-toggle.tsx`
- All colors use `hsl(var(--variable))` pattern
- Light mode defined in `:root`
- Dark mode defined in `.dark` class

---

## Dashboard Pattern

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
- Color scheme matching design system (works in both themes)
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

---

## General Design Principles

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
- Test colors in both light and dark modes

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
- Adjust shadow intensity based on theme (lighter in dark mode)

---

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
- Sufficient color contrast (both themes)
- Respect reduced motion preferences

---

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
9. **Be Themeable** - Support both dark and light modes seamlessly

---

