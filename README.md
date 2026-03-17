# 🌿 Verde Salon - Administrator's Manual

Welcome to the **Verde Salon** digital sanctuary. This project is a premium management suite designed for luxury boutique salons.

---

## 🚀 1. First-Time Setup (Unlocking the Sanctuary)
As an AI, I cannot access your private credentials. You must perform these **two manual steps** to unlock your admin panel:

### Step A: Enable Authentication
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Navigate to **Build > Authentication**.
3. Click **Get Started** and enable the **Email/Password** provider.
4. In the **Users** tab, click **Add User** and create your account.
5. **Copy the UID** generated for this user.

### Step B: Grant Admin Privileges
1. Navigate to **Build > Firestore Database**.
2. Click **Start Collection** and name it `roles_admin`.
3. For the **Document ID**, paste the **UID** you copied in Step A.
4. Add a field:
   - Field name: `role`
   - Type: `string`
   - Value: `admin`
5. Save the document.

---

## 2. Project Overview & Features
Verde Salon blends a cinematic frontend with a powerful administrative "sanctuary."

### **Built Features:**
- **Cinematic Frontend**: A luxury botanical aesthetic using Forest Green (#0F2F2F) and Gold (#C6A15B).
- **Dynamic Page Builder**: Manage your Home and Services pages by reordering sections (Hero, About, Gallery, etc.) at `/admin/pages`.
- **Real-Time Synchronization**: All changes reflect on the frontend instantly via Firestore listeners.
- **One-Click Initializer**: Found on the main Dashboard, this seeds your entire site with luxury sample data so you don't start from scratch.
- **The Journal (Blog)**: A high-end editorial system with automatic SEO optimization.
- **Global Branding Controls**: Change your logo, colors, and typography site-wide at `/admin/branding`.

---

## 3. How to Manage Content
1. **Access the Dashboard**: Log in at `/admin/login`.
2. **Page Builder**: Toggle between "Home" and "Services". Use arrows to reorder and the settings icon to edit text/images.
3. **Rituals (Services)**: Manage your menu, categories, and pricing at `/admin/services`.
4. **Journal**: Create and publish articles at `/admin/blog`.

---

## 4. Technical Architecture
- **Framework**: Next.js 15 (App Router).
- **Styling**: Tailwind CSS + ShadCN UI.
- **Database**: Firebase Firestore (Real-time).
- **Auth**: Firebase Authentication (Email/Password).
- **AI Engine**: Genkit (Pre-wired for content assistance).

**Verde Salon** is more than a website; it is an intentional digital ritual. May your sanctuary flourish.