Day 4 Assignment: Dashboard Layout, Role-Based Sidebar/Menu & Additional Pages
Objective: Build out your application's navigation shell — a proper dashboard layout with a role-based sidebar/menu — and add the next set of feature pages relevant to your project, so the app starts feeling like a real multi-page product instead of a single screen.
Requirements:
Dashboard Layout — build a proper authenticated layout (Sidebar + Topbar/Header + Content area) that wraps all logged-in pages, separate from the public Login/Register layout from Day 1.
Role-Based Sidebar/Menu — the sidebar/menu items should render based on the logged-in user's role (e.g., Admin sees extra options a normal user doesn't). Don't hardcode the menu — drive it from a config/constants array so it's easy to extend.
Active/Current Page Highlight — the currently active route in the sidebar should be visually highlighted, using React Router's active link state.
New Pages — add at least 2 new pages relevant to your own project, connected to real API calls with proper loading/error/empty states. Examples depending on your project: a detail page for a core entity, a profile page, an admin-only page, or any other page that adds real value to your app.
Breadcrumbs or Page Title — show the user where they are in the app (a simple breadcrumb or a page heading pattern is enough).
Responsive Sidebar (bonus, if time allows) — collapse the sidebar into a hamburger menu on smaller screens.
Code Consistency — continue using reusable components, constants, service layer and the auth/RBAC setup from Days 1–3. No duplicate layouts or hardcoded roles inside components.
