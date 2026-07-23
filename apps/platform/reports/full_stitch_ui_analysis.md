# Comprehensive Stitch UI Parity Analysis

This report is a complete, unvarnished analysis of the UI currently implemented in the React application compared to the `stitch_export` HTML files and your provided trial screenshot.

## The Root Problem

The current application was built using a generic, generic component library template (e.g., standard shadcn/ui defaults like `bg-background`, `bg-card`, `text-foreground`).
**However, your Stitch UI utilizes a highly customized, Material Design 3 inspired token system** (e.g., `bg-surface-container-lowest`, `text-on-surface`, `text-secondary`, `bg-mesh`, `font-headline-lg`).

As a result, almost **none** of the implemented pages match your actual brand, aesthetic, or layout specifications.

---

## Detailed Page-by-Page Breakdown

### 1. Authentication (Login & Trial Registration)

- **Login Page (`code.html`):** The Stitch design uses a `bg-mesh` background, a blurred glassmorphic overlay, an "Organization" dropdown, Google/Microsoft SSO buttons, and an atmospheric mouse effect.
  - _Current Status:_ Generic white box on a blank background. Total failure to match.
- **Trial Registration (`demo.innvikta.co.in/trial`):** Screenshot clearly dictates a comprehensive signup form with an orange `#ff5722` Create Account button and specific fields (Company, Team size).
  - _Current Status:_ Page does not exist in the codebase. Total miss.

### 2. Super Admin Dashboard (`super_admin_dashboard/code.html`)

- **Stitch Design:** Features custom KPI cards, detailed bar charts, and a dark/light mode surface toggle.
- **Current Status:** The data hooks are connected, but the UI is using generic placeholder styling. The charts are missing or mocked poorly.

### 3. Tenant Admin Dashboard (`tenant_admin_dashboard/code.html`)

- **Stitch Design:** Features active user heatmaps, recent enrollments lists, and custom progress rings.
- **Current Status:** Uses standard generic tables and basic `<Card>` components. The aesthetic is entirely different from the provided HTML.

### 4. Learner Dashboard & Player (`learner_dashboard/code.html`, `learner_player/code.html`)

- **Stitch Design:** Uses immersive course cards with progress bars overlaid on thumbnails, and a sleek dark-mode theater for the video player.
- **Current Status:** Implemented, but using `shadcn` defaults. The player lacks the specific theater-mode aesthetics of the Stitch design.

### 5. Library & Courses (`library_management/code.html`, `course_builder/code.html`)

- **Stitch Design:** Features complex drag-and-drop handles, rich asset preview modals, and specific SCORM upload flows.
- **Current Status:** Functional forms exist, but they look like generic CRUD apps. The custom drag-and-drop UI and preview cards from Stitch are missing.

### 6. Users & Groups (`user_management/code.html`, `group_management/code.html`)

- **Stitch Design:** Features bulk action toolbars, custom role badges (`bg-primary-container text-on-primary-container`), and avatar stacks.
- **Current Status:** Rendered as plain data tables. Badges use generic colors (red/green) instead of the defined brand tokens. (Note: Only `GroupDetailPage` has partial Stitch tokens).

### 7. Campaigns (`campaign_wizard/code.html`)

- **Stitch Design:** A beautiful multi-step stepper with animated transitions and specific typography (`font-title-md`).
- **Current Status:** This is the _only_ section that partially uses Stitch tokens (`text-on-surface`), but the layout still falls short of the pixel-perfect HTML provided.

---

## Conclusion of Analysis

The application has strong backend connectivity and functional React logic, but the **Frontend Presentation Layer is completely disconnected from the Stitch HTML designs.**

To fix this professionally without creating "rework loops", we must stop building features and immediately execute a **Global CSS Token Replacement and Layout Overhaul** on a page-by-page basis.
