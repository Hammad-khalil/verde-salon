# 🌿 Verde Salon - Administrator's Manual

Welcome to your **Verde Salon** management sanctuary. This system is designed to be elegant, powerful, and simple enough for daily use without writing a single line of code.

---

## 🚀 Step 1: Initialize Your Sanctuary
If your website looks empty, don't worry! 
1. Log in at `/admin/login`.
2. On the main **Dashboard**, you will see a prominent gold banner.
3. Click **"Seed Sanctuary Now"**.
4. This instantly creates your Home page layout, starter Services, and Global Colors.

---

## 🛠️ Step 2: Using the Page Builder
Located at `/admin/pages`, the Page Builder is where you design your digital presence.
- **Adding Sections**: Click the buttons at the bottom (Hero, Gallery, CTA, etc.) to add them to your page.
- **Editing Content**: Click the **Settings (Gear icon)** on any section to change its text, images, and buttons.
- **Reordering**: Use the **Up/Down Arrows** to move sections.
- **Syncing**: There is **no Save button needed** for data—it saves automatically. The "Publish" button at the top is for your mental confirmation!

---

## 📖 Step 3: Managing Your Content
- **Rituals (Services)**: Go to `/admin/services` to manage your menu, prices, and categories.
- **The Journal (Blog)**: Go to `/admin/blog` to write new articles. It includes built-in SEO tools to help you rank on Google.
- **Inquiries**: Go to `/admin/submissions` to see clients who have filled out your booking or contact forms.
- **Branding**: Go to `/admin/branding` to change your Logo, Site Name, and primary brand colors site-wide.

---

## ✨ Pro-Tips for Success
1. **Real-Time Sync**: Open your live website in one tab and the Admin panel in another. As you edit the Admin panel, watch the live site update **instantly** without a refresh.
2. **High-Quality Images**: For the best luxury feel, use vertical images for the Gallery and wide cinematic images for the Hero.
3. **SEO Matters**: When writing blog posts, fill out the "SEO Optimization" fields. This is how Google understands what your salon is about.

---

## 🔒 Security & Access
Your data is stored in **Google Firebase**.
- All logins are managed via Firebase Authentication.
- All permissions are restricted via `roles_admin` in Firestore.
- Only users with the `admin` role can access the `/admin` area.

**Verde Salon** is more than a website; it is an intentional digital ritual. May your sanctuary flourish.