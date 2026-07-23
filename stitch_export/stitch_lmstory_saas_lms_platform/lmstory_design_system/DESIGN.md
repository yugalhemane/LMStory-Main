---
name: LMStory Design System
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#0058be'
  on-secondary: '#ffffff'
  secondary-container: '#2170e4'
  on-secondary-container: '#fefcff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#002113'
  on-tertiary-container: '#009668'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  title-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style

The design system is built for a high-density enterprise SaaS environment, specifically tailored for Learning Management Systems (LMS). The brand personality is **reliable, efficient, and objective**. It prioritizes information clarity and task completion over decorative elements.

The aesthetic follows a **Corporate Modern** approach. It utilizes a structured, systematic layout that feels high-end and engineered. The UI should evoke a sense of professional growth and organizational clarity, ensuring that administrators and learners can navigate complex data structures without cognitive overload.

Key visual principles:

- **High Information Density:** Maximizing screen real estate for data-rich dashboards and tables.
- **Functional Clarity:** Distinct separation between navigation, configuration, and content areas.
- **Precision:** Mathematical alignment and consistent internal padding within all UI components.

## Colors

The color palette is grounded in professional stability and functional utility.

- **Primary (#0F172A):** A deep Slate used for high-level navigation, headings, and core brand moments. It provides a strong anchor for the interface.
- **Secondary (#3B82F6):** A bright Corporate Blue used for primary actions, progress indicators, and active states.
- **Tertiary (#10B981):** An Emerald Green reserved specifically for "Success" states, completed courses, and positive growth metrics.
- **Neutral (#64748B):** A balanced Grey used for secondary text and supporting icons.
- **System Colors:**
  - **Destructive:** #EF4444 (Red) for errors and critical alerts.
  - **Warning:** #F59E0B (Amber) for pending certifications or expiring licenses.
  - **Background:** #F8FAFC for the main application canvas to reduce eye strain.

## Typography

This design system utilizes **Inter** for all roles to leverage its exceptional legibility at small sizes and its technical, neutral appearance.

- **Scale:** A tight typographic scale is used to support high-density layouts.
- **Hierarchy:** Use `title-md` for standard card headers and `body-md` for primary content. `body-sm` is the workhorse for table data and metadata.
- **Case:** Use `label-md` in all-caps for section headers in the sidebar or small eyebrow text above headlines.
- **Mobile:** On mobile devices, `display` should scale down to `28px/36px` to avoid excessive wrapping.

## Layout & Spacing

The layout is based on a **fixed-fluid hybrid grid**.

- **Sidebar:** Fixed width at 260px for desktop, collapsible to 64px (icon only).
- **Main Content:** Fluid container with a maximum width of 1440px to ensure line lengths remain readable.
- **Grid:** A 12-column system is used for dashboard widgets. Gutters are strictly 16px to maintain high density while preventing visual crowding.

**Breakpoints:**

- **Mobile (< 640px):** Single column, 16px side margins. Navigation moves to a bottom bar or hamburger menu.
- **Tablet (640px - 1024px):** 2-column widget layouts, sidebar becomes an overlay.
- **Desktop (> 1024px):** Full 12-column grid, permanent sidebar.

## Elevation & Depth

To maintain a clean, professional aesthetic, depth is communicated through **Tonal Layering** and **Low-Contrast Outlines** rather than heavy shadows.

- **Level 0 (Background):** #F8FAFC. The lowest layer.
- **Level 1 (Cards/Surface):** #FFFFFF. Used for the primary content containers. These use a 1px border of #E2E8F0.
- **Level 2 (Dropdowns/Modals):** #FFFFFF with a subtle ambient shadow (0px 4px 6px -1px rgba(0, 0, 0, 0.1)).
- **Interactions:** Buttons and interactive cards use a subtle "lift" effect on hover, achieved by changing the border color to the Secondary Blue rather than increasing shadow depth.

## Shapes

The design system uses a **Soft (Level 1)** rounding strategy. This maintains a precise, "pro" look while feeling modern.

- **Components (Buttons, Inputs, Small Cards):** 0.25rem (4px).
- **Large Containers (Dashboards, Main Surface):** 0.5rem (8px).
- **Badges/Chips:** Fully rounded (pill-shaped) to distinguish them from interactive buttons.
- **Selection States:** A 2px vertical bar is used on the left side of active navigation items to reinforce selection without relying solely on color.

## Components

### Navigation & Top Bar

- **Sidebar:** Dark theme (#0F172A) to contrast against the light content area. Icons should be stroke-based and 20px in size.
- **Tenant Switcher:** Located in the top bar, allowing users to toggle between organizations. Uses a `title-md` font weight with a chevron-down icon.

### Data Tables

- **Header:** Background #F1F5F9, text `label-md` color Neutral.
- **Cells:** Vertical padding of 12px, font `body-sm`.
- **Badges:** Low-saturation backgrounds with high-saturation text (e.g., Success badge: Light Green bg / Dark Green text).

### Buttons & Inputs

- **Primary Button:** Solid Secondary Blue (#3B82F6), white text, 4px radius.
- **Secondary Button:** White background, 1px border #E2E8F0, text #0F172A.
- **Input Fields:** 1px border #E2E8F0, 8px horizontal padding. Focus state: 1px border #3B82F6 with a 2px light blue outer ring.

### Dashboards

- **Progress Bars:** 8px height, rounded. Background #E2E8F0, fill Secondary Blue.
- **Stat Cards:** Large `headline-lg` for the metric, `body-sm` for the label, and a small trend indicator (e.g., "+12%") in `label-sm`.
