# 🌿 Verde Salon | Premium Management System

Verde Salon is a bespoke digital ecosystem designed for luxury beauty brands. It combines a high-performance, minimalist frontend with a robust, real-time Content Management System (CMS), enabling seamless management of artisan services, brand narratives, and client inquiries.

---

## 🏗️ System Overview
The platform is built on a modern stack featuring **Next.js 15**, **Firebase**, and **Tailwind CSS**. It prioritizes a "Content-First" philosophy, where the administrative interface provides granular control over every visual and structural element of the website without requiring technical expertise.

---

## ✨ Core Features

### 🛠️ Professional CMS & Admin Panel
A centralized control hub for all business logic, branding identity, and architectural configurations.
*   **Real-Time Data Sync**: All updates made in the admin panel propagate instantly to the live site via Firestore snapshots.
*   **Visual Architect**: A sidebar-driven page builder allowing for point-and-click editing of live components.
*   **Decoupled State Management**: Advanced storage logic that separates Workspace (Draft) content from Public (Live) content to ensure maximum scalability.

### 📑 Content Management
*   **Service Architecture**: Manage an artisan menu with detailed price profiles, durations, and high-definition imagery.
*   **Journal (Blogs)**: A high-end editorial system for brand reflections, featuring category filtering and optimized readability.
*   **CRM & Leads**: Automated tracking of client submissions with conversion status management (New, In Progress, Converted).
*   **Brand Identity Engine**: Direct control over global HSL color signatures, typography pairings, and logo scaling.

### 🚀 Performance & UX
*   **CLS Elimination**: Explicit sizing and ghost-state placeholders prevent layout shifts during hydration.
*   **Conditional Hydration**: Administrative scripts are only loaded in "Edit Mode," significantly reducing Total Blocking Time (TBT) for visitors.
*   **Intelligent Media**: Support for local uploads (with strict safety caps) and external HD resource linking (YouTube/Unsplash).

---

## 📐 Page Builder Logic

The system utilizes a modular **Section-Based Architecture**. Each page is an array of pointers to distinct section documents.

### How Sections Work:
1.  **Drafting**: Sections are created and modified in the `cms_page_sections` collection. These changes are visible only to admins in "Edit Mode."
2.  **Reordering**: Vertical rhythm can be adjusted via the "Pages & Content" manager, updating the document array sequence.
3.  **Publishing**: Upon clicking "Publish," the system performs an atomic batch write, cloning the current workspace state to the `cms_sections_live` collection.
4.  **Visibility**: Every section features a toggle to hide or unhide content from the public without deleting the underlying data.

---

## 🔒 Security & Access

Access to the administrative sanctuary is strictly enforced through **Firebase Authentication** and **Firestore Security Rules**.
*   **Role-Based Access (RBAC)**: Only authenticated users with verified administrative UIDs or specific brand emails can access the `/admin` routing.
*   **Public Safety**: All public-facing collections are configured for "Read-Only" access, preventing unauthorized data injection.
*   **Secure API Handling**: External integrations (Analytics, Webhooks) are managed via server-side configuration profiles.

---

## 💡 Best Practices for Management

To maintain the premium performance and aesthetic of the site, we recommend the following:

*   **Media Handling**: For the highest performance, use **External Source URLs** (e.g., Unsplash for images, YouTube for 4K video). The local upload system is optimized for files under 400KB.
*   **Typography**: Stick to the pre-configured font pairings. If changing, ensure the fonts are available via Google Fonts for dynamic injection.
*   **SEO**: Fill out the "Search Engine" card for every blog post. This metadata is injected via the `SEOManager` to improve your organic ranking.
*   **Maintenance**: Regularly archive "Converted" leads in the CRM to keep your submission queue clean and efficient.

---

**Verde Salon** is more than a website; it is an intentional digital signature. Engineered for performance, designed for beauty.