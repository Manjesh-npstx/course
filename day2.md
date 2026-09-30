Day 2 Assignment: Backend Integration, Authentication & RBAC
Objective: Integrate the Login and Registration pages with the backend API, implement secure token handling, and explore how Role-Based Access Control (RBAC) can be implemented in the current system.
Requirements:
API Integration — connect the Login and Registration forms to the actual backend APIs so data is sent, validated and stored properly, instead of working in isolation.
Service layer — create a dedicated authService.js (or similar) to handle all API calls (login, register), keeping API logic separate from components.
Axios Interceptor — set up a proper Axios interceptor to attach the token automatically to every outgoing request and handle common response errors (e.g., 401 Unauthorized) in one place.
Token Storage — store the authentication token securely on the client, and explore the trade-offs between storage options (e.g., localStorage vs. sessionStorage vs. httpOnly cookies) — be ready to explain which one you chose and why.
Protected/Dashboard API — integrate at least one protected dashboard/data API call, passing the stored token with the request and handling token validation (including expired/invalid token scenarios).
RBAC Exploration — explore and document how Role-Based Access Control can be implemented in the current system (e.g., how roles would be stored, how routes/components would be restricted based on role, and how the UI would differ for different roles).
