# 🌿 Verde Salon - Administrator's Manual

Welcome to the **Verde Salon** digital sanctuary. This project is a premium, minimal, and high-end management suite designed specifically for luxury boutique salons.

---

## 🚀 1. First-Time Setup (Admin Access)
Since this is a fresh installation, you need to manually set up your first administrator account in the Firebase Console:

### Step A: Enable Authentication
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project.
3. Navigate to **Build > Authentication**.
4. Click **Get Started** and enable the **Email/Password** provider.
5. In the **Users** tab, click **Add User** and create your account (e.g., `editor@verdesalon.com`).
6. **Copy the UID** generated for this user.

### Step B: Grant Admin Privileges in Firestore
1. Navigate to **Build > Firestore Database**.
2. Click **Create Database** if you haven't already.
3. Click **Start Collection** and name it `roles_admin`.
4. For the **Document ID**, paste the **UID** you copied in Step A.
5. Add a field:
   - Field name: `role`
   - Type: `string`
   - Value: `admin`
6. Save the document.

### Step C: Log In
Visit `http://localhost:9002/admin/login` and use the email and password you created.

---

## 2. Project Overview
Verde Salon is a full-stack digital experience that blends a cinematic frontend with a powerful administrative "sanctuary." 

### Key Features:
- **Cinematic Frontend**: A luxury botanical aesthetic using the deep forest green (#0F2F2F) and gold accent (#C6A15B) palette.
- **Dynamic Page Builder**: Manage your Home and Services pages by reordering sections (Hero, About, Gallery, etc.).
- **The Journal (Blog)**: A high-end editorial system with automatic SEO optimization.
- **Global Branding Controls**: Change your logo, site-wide colors, and typography directly from the Admin panel.

---

## 3. CMS Dashboard & Page Builder
Access your management suite at `/admin`.

### **The Page Builder** (`/admin/pages`)
1. **Choose a Page**: Toggle between "Home" and "Services".
2. **Reorder Sections**: Use the up/down arrows to change the layout flow.
3. **Edit Content**: Click the settings icon to change text and images in real-time.
4. **Add Sections**: Click "Add New Section" to inject new modules like Video Blocks or FAQs.

### **Branding & Theme** (`/admin/branding`)
- **Logo**: Upload your brand mark and adjust its size.
- **Colors**: Paste Hex codes to update the site's primary, background, and accent colors instantly.
- **Fonts**: Choose luxury Google Font pairings for Headlines and Body text.

---

## 4. The Journal System
### **Managing Articles** (`/admin/blog`)
- **Create**: Click "New Article" to launch the editor.
- **SEO Engine**: Every article includes an SEO Optimization card to manage browser titles and search engine descriptions.

---

## 5. Firestore Data Structure
Your data is organized into "Collections":
- `roles_admin`: Your security vault. Document ID = User UID.
- `cms_pages`: Definitions for your page layouts.
- `cms_page_sections`: The raw content for every block on your site.
- `blog_posts`: Your editorial content and SEO data.
- `services`: Your rituals menu.
- `form_submissions`: Client leads and booking inquiries.
- `settings`: Global branding and API keys.

---

## 6. Integrations & Analytics
Manage these in **Admin > Branding & Theme** or the **Integrations** tab (if visible):
- **Google Analytics**: Enter your "G-" ID.
- **Facebook Pixel**: Enter your Pixel ID.
- **CRM Webhooks**: Use the Zapier Webhook field to send lead data to HubSpot or GoHighLevel.

---

**Verde Salon** is more than a website; it is an intentional digital ritual. May your sanctuary flourish.
