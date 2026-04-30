# Requirements Document

## Introduction

This document specifies requirements for improving the NCTU ERP system's admin dashboard styling, optimizing frontend performance through animation management, and reorganizing the codebase structure. The feature addresses visual consistency, performance optimization, and maintainability concerns by applying a unified purple gradient background to admin pages, reducing animation overhead on non-home pages, and restructuring files into dedicated folders.

## Glossary

- **Admin_Dashboard**: The administrative interface accessible at `/admin/dashboard` and all admin routes
- **Home_Page**: The landing page accessible at `/` route using HomeModern component
- **Purple_Gradient**: The specific background gradient `linear-gradient(135deg, #0a043c, #1c062e, #2c003e)`
- **Animation_Component**: React components in `client/frontend/src/components/animations/` directory
- **Page_Component**: React components in `client/frontend/src/pages/` directory that represent full page views
- **CSS_Module**: CSS files using `.module.css` extension for scoped styling
- **Global_Animation**: Animation components rendered at App.jsx level (CustomCursor, ClickSpark, SplashCursor)
- **Page_Animation**: Animation components used within specific page components
- **Component_Folder**: A directory containing a component file and its associated CSS file

## Requirements

### Requirement 1: Admin Dashboard Background Styling

**User Story:** As an administrator, I want the admin dashboard to have a consistent purple gradient background, so that the interface has a unified visual identity across all admin pages.

#### Acceptance Criteria

1. THE Admin_Dashboard SHALL display the Purple_Gradient as the background
2. WHEN an admin navigates to any route under `/admin/*`, THE Admin_Dashboard SHALL maintain the Purple_Gradient background
3. THE Purple_Gradient SHALL be applied to the AdminLayout component or AdminDashboard root element
4. THE Purple_Gradient SHALL remain fixed during page scrolling
5. THE background styling SHALL not override existing glassmorphism effects on child components

### Requirement 2: Animation Performance Optimization

**User Story:** As a user, I want pages to load and render quickly, so that I can access information without performance delays.

#### Acceptance Criteria

1. WHEN a user navigates to any Page_Component except Home_Page, THE system SHALL disable or simplify Page_Animation effects
2. THE Home_Page SHALL retain all existing Animation_Component functionality
3. WHEN Global_Animation components cause performance degradation on non-home pages, THE system SHALL conditionally render them only on Home_Page
4. THE system SHALL reduce CSS animation keyframes complexity on non-home Page_Component stylesheets
5. WHEN animations are simplified, THE system SHALL preserve essential UI feedback animations (hover, focus, loading states)

### Requirement 3: File Organization and Structure

**User Story:** As a developer, I want each component organized in its own folder with related files, so that the codebase is easier to navigate and maintain.

#### Acceptance Criteria

1. WHERE a Page_Component has an associated CSS file, THE system SHALL place both files in a dedicated Component_Folder
2. THE Component_Folder SHALL be named using kebab-case matching the component name
3. WHEN reorganizing files, THE system SHALL update all import statements to reflect new paths
4. THE system SHALL maintain the existing folder hierarchy (pages/Admin/, pages/Student/, etc.)
5. WHERE a component uses CSS_Module, THE folder SHALL contain the component JSX file and its `.module.css` file together
6. THE system SHALL preserve all existing functionality after reorganization

### Requirement 4: Route Configuration Consistency

**User Story:** As a developer, I want the routing configuration to remain functional after file reorganization, so that all application routes continue to work correctly.

#### Acceptance Criteria

1. WHEN files are reorganized into Component_Folder structures, THE App.jsx routing configuration SHALL be updated with correct import paths
2. THE system SHALL maintain all existing route paths and navigation behavior
3. WHEN a Page_Component is moved, THE system SHALL update all internal imports within that component
4. THE system SHALL verify that nested admin routes under AdminLayout continue to function
5. THE system SHALL preserve all route guards and protected route logic

### Requirement 5: Animation Conditional Rendering

**User Story:** As a developer, I want animations to render conditionally based on the current route, so that performance is optimized while maintaining visual appeal on the home page.

#### Acceptance Criteria

1. THE system SHALL implement a route detection mechanism to identify the current page
2. WHEN the current route is `/` or `/home`, THE system SHALL render all Global_Animation components
3. WHEN the current route is not `/` or `/home`, THE system SHALL disable CustomCursor, ClickSpark, and SplashCursor components
4. WHERE Page_Animation components exist in non-home pages, THE system SHALL replace complex animations with simple CSS transitions
5. THE system SHALL maintain loading spinners and essential UI feedback animations on all pages

### Requirement 6: CSS Performance Optimization

**User Story:** As a user, I want pages to render smoothly without animation jank, so that the interface feels responsive and professional.

#### Acceptance Criteria

1. THE system SHALL remove or simplify `@keyframes` animations in non-home Page_Component CSS files
2. WHERE animations are necessary for UX, THE system SHALL use GPU-accelerated properties (transform, opacity)
3. THE system SHALL limit animation duration to 300ms or less for non-home pages
4. WHEN hover effects are needed, THE system SHALL use simple transform and opacity transitions
5. THE system SHALL remove `animation: fadeIn`, `animation: float`, and `animation: pulse` from admin dashboard CSS files

### Requirement 7: Background Gradient Application

**User Story:** As an administrator, I want the purple gradient background to be visible behind all admin content, so that the dashboard has a cohesive look.

#### Acceptance Criteria

1. THE AdminLayout component SHALL apply the Purple_Gradient to its root container element
2. THE Purple_Gradient SHALL use `background-attachment: fixed` property
3. WHEN admin pages have transparent or semi-transparent backgrounds, THE Purple_Gradient SHALL be visible through them
4. THE system SHALL ensure the Purple_Gradient does not conflict with existing glassmorphism card backgrounds
5. THE Purple_Gradient SHALL cover the full viewport height and width

### Requirement 8: Code Organization Standards

**User Story:** As a developer, I want a consistent folder structure for all page components, so that I can quickly locate files and understand the project organization.

#### Acceptance Criteria

1. THE system SHALL create Component_Folder for each Page_Component in the pages directory
2. WHERE a Page_Component has multiple CSS files (both `.css` and `.module.css`), THE Component_Folder SHALL contain all related styles
3. THE Component_Folder SHALL contain an index.js file that exports the main component as default
4. WHEN a Page_Component has no associated CSS, THE system SHALL still place it in a Component_Folder for consistency
5. THE system SHALL document the new folder structure in a README or migration guide

### Requirement 9: Chatbot Removal

**User Story:** As a system administrator, I want to completely remove the chatbot functionality from the application, so that the system is simplified and unnecessary features are eliminated.

#### Acceptance Criteria

1. THE system SHALL remove the BotpressChat component from `client/frontend/src/components/chat/BotpressChat.jsx`
2. THE system SHALL remove the BotpressChat CSS file from `client/frontend/src/components/chat/BotpressChat.css`
3. THE system SHALL remove the ConditionalBotpressChat component and its usage from App.jsx
4. THE system SHALL remove all BotpressChat imports from App.jsx
5. THE system SHALL remove the entire `client/frontend/src/components/chat/` directory if no other chat components exist
6. THE system SHALL remove any Botpress-related environment variables from configuration files
7. THE system SHALL remove any Botpress-related documentation from BOTPRESS_SETUP.md or similar files
8. WHEN the chatbot is removed, THE system SHALL maintain all other application functionality without errors

### Requirement 10: QR Code Feature Removal

**User Story:** As a system administrator, I want to completely remove the QR code registration functionality from the application, so that the system uses only the time-limited form link system for student registration.

#### Acceptance Criteria

1. THE system SHALL remove the QRCodeRegistration page component from `client/frontend/src/pages/QRCodeRegistration.jsx`
2. THE system SHALL remove the QRCodeRegistration CSS file from `client/frontend/src/pages/QRCodeRegistration.css`
3. THE system SHALL remove the QRCodePage admin component from `client/frontend/src/pages/Admin/QRCodePage.jsx`
4. THE system SHALL remove the `/qr-register` route from App.jsx
5. THE system SHALL remove the `/admin/qr-code` route from App.jsx admin routes
6. THE system SHALL remove all QRCode imports from App.jsx
7. THE system SHALL remove QR code related API endpoints from `server/routes/authRoutes.js`
8. THE system SHALL remove QR code related API endpoints from `server/routes/gradeRoutes.js`
9. THE system SHALL remove QR code related API endpoints from `server/routes/extendedAdminRoutes.js`
10. THE system SHALL remove the QRCodeService from `server/services/qrCodeService.js`
11. THE system SHALL remove QR code related controller methods from `server/controllers/authController.js`
12. THE system SHALL remove QR code related controller methods from `server/controllers/gradeController.js`
13. THE system SHALL remove QR code related controller methods from `server/controllers/extendedAdminController.js`
14. THE system SHALL remove the StudentQRCode model from `server/models/StudentQRCode.js`
15. THE system SHALL remove QR code related imports from all affected files
16. THE system SHALL remove QR code menu items from admin navigation components
17. THE system SHALL remove QR code buttons from student dashboard
18. THE system SHALL remove QR code related API calls from `client/frontend/src/services/apiService.js`
19. THE system SHALL remove QR code related API calls from `client/frontend/src/services/adminService.js`
20. WHEN QR code functionality is removed, THE system SHALL maintain all other registration functionality (time-limited form links) without errors

### Requirement 11: Unnecessary File Cleanup

**User Story:** As a developer, I want to remove duplicate and unused files from the codebase, so that the project is cleaner and easier to maintain.

#### Acceptance Criteria

1. THE system SHALL identify and remove duplicate admin page files (e.g., Dashboard.jsx vs AdminDashboard.jsx in Admin folder)
2. THE system SHALL identify and remove unused test pages (e.g., AdminTestPage.jsx)
3. THE system SHALL identify and remove duplicate management pages (e.g., CoursesManagement.jsx vs CoursesPage.jsx)
4. THE system SHALL identify and remove orphaned CSS files with no corresponding component
5. THE system SHALL identify and remove duplicate CSS files (e.g., StudentRegistration.css and StudentRegistration.module.css if only one is used)
6. THE system SHALL verify that removed files are not imported or referenced anywhere in the codebase
7. THE system SHALL update any imports that reference removed files to use the correct remaining files
8. WHEN unnecessary files are removed, THE system SHALL maintain all existing functionality without errors

