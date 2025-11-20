# Project Goal
Build a high-performance, polished Landing Page / Single Page Application.
The application must be built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS v4**, and use **Turbopack**.

# Tech Stack & Constraints
- **Framework:** Next.js 15 (App Router).
- **Styling:** Tailwind CSS v4.
  - IMPORTANT: Tailwind v4 does not use `tailwind.config.js` by default. Use CSS variables in the main global CSS file for theme configuration.
  - Use the `@theme` directive in CSS for custom colors/fonts.
- **Icons:** `lucide-react` (preferred) or `react-icons`.
- **Fonts:** `next/font/google` (optimize for performance).
- **Images:** `next/image` component only.
- **Component Architecture:** atomic design principles (atoms, molecules, organisms) inside a `@/components` alias.
- **State Management:** Keep it simple (React `useState`/`useContext`). Prefer Server Components (RSC) by default; only use `'use client'` when interactivity is strictly required.

# Core Structure
1. **Navbar:** - Sticky/Fixed top.
   - Logo (left), Links (center/right), Language Selector.
   - **Mobile:** Hamburger menu triggering a slide-out drawer or full-screen overlay.
2. **Hero Section:** - H1 Headline (high impact), Subheadline, Primary CTA, Secondary CTA.
   - Hero Image or abstract graphic on the right (desktop) / top (mobile).
3. **About Section:** - Grid layout (text + visual representation).
4. **Services/Features:** - Card-based layout using CSS Grid.
   - Cards should have hover states (scale up or shadow depth).
5. **Contact Section:** - Functional UI for a form (Name, Email, Message).
   - Visually distinct Submit button.
6. **Footer:** - Logo, Social Links, Copyright, simplified sitemap.

# Detailed Requirements
- **Responsive Design:** Mobile-first approach. Ensure touch targets are at least 44px on mobile.
- **Image Placeholders:** Use `https://placehold.co/{width}x{height}/png` for all mock images.
- **WhatsApp Button:** Floating Action Button (FAB) fixed at the bottom-right. Green background (`bg-green-500`), white icon, rounded-full, subtle pulse animation on load.
- **Component Organization:**
  - `components/layout/*` (Navbar, Footer)
  - `components/sections/*` (Hero, About, Contact)
  - `components/ui/*` (Buttons, Inputs, Cards - reusable)
- **SEO:** Create a `layout.tsx` metadata object with Title, Description, and OpenGraph tags.

# Styling Guidelines
- Use utility classes for layout (Flexbox/Grid).
- **No inline styles.**
- Use Semantic HTML (`<section>`, `<article>`, `<main>`, `<header>`).
- Ensure adequate whitespace (padding/margin) between sections to let the content breathe.