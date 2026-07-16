# CampusHub Workspace Customization Rules

## Backend Synchronization Reminders
- When implementing a real backend or database connection, remind the user to convert the client-side `localStorage` theme state persistence to a cookie-based approach (or database profile sync) to prevent layout flashes (FOUC) during Next.js SSR.
