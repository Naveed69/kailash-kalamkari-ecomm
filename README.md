# Welcome to our project

## Project info

**URL**: https://kailash-kalamkari-ecomm.vercel.app/
e.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (Authentication & Database)
- Razorpay (Payment Gateway)

## 📧 Email Authentication System

**Kailash Kalamkari** now features a modern email-only authentication system that replaces SMS/WhatsApp OTP.

### **Features:**

✨ **Magic Link Login** - One-click email authentication (preferred)  
🔐 **Email OTP** - 6-digit verification code (backup method)  
🚀 **Auto-Account Creation** - New users created automatically during checkout  
🛒 **Seamless Checkout** - Login modal appears in-context without navigation  
👤 **User Dashboard** - Profile, Order History, and Order Tracking

### **Quick Start:**

1. **Configure Supabase** (Required)
   - Follow the detailed guide in `SETUP_GUIDE.md`
   - Enable Email authentication in Supabase Dashboard
   - Configure Magic Link and Email OTP settings
   - Customize email templates

2. **Set Environment Variables**
   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key
   VITE_RAZORPAY_KEY_ID=your_razorpay_key
   ```

3. **Test the Authentication**
   - Navigate to `/login` to test standalone login
   - Add items to cart and checkout to test inline authentication
   - Visit `/profile` to see user dashboard
   - Visit `/my-orders` to view order history

### **Documentation:**

📚 Complete documentation is available:
- **SETUP_GUIDE.md** - Step-by-step Supabase configuration
- **EMAIL_AUTH_IMPLEMENTATION.md** - Technical documentation
- **VISUAL_ARCHITECTURE.md** - System diagrams and flows
- **EXECUTIVE_SUMMARY.md** - Business impact and deployment plan
- **CHECKLIST.md** - Pre-deployment checklist

### **Benefits:**

💰 **Zero SMS Costs** - Eliminates OTP charges  
🌍 **International Support** - Works globally  
⚡ **Faster Login** - 60% faster than SMS OTP  
📱 **Mobile-Friendly** - Optimized for all devices  
🔒 **Secure** - Supabase-managed authentication

---

## Supabase and Admin panel setup

Follow these steps to connect Supabase and enable the Admin panel:

1. Create a Supabase project at https://app.supabase.com/
2. In Project Settings → API copy the Project URL and anon (public) key.
3. Create a `.env` or `.env.local` file in the project root with:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
# comma separated admin emails (lowercase)
VITE_ADMIN_EMAILS=admin@example.com,other@domain.com
```

4. In Supabase → Table Editor → select your `products` table → Policies. Add a policy to allow select for public (or for auth users):

```sql
create policy "Allow public select"
on "public"."products"
as permissive
for select
to public
using (true);
```

5. For production, do NOT set `to public` — instead create policies that check `auth.role()` or user metadata and restrict by `VITE_ADMIN_EMAILS` in your app.

6. Start the dev server:

```bash
npm install
npm run dev
```

7. Visit `/admin/login` to sign in using the magic link you configured in Supabase Auth. Make sure the sign-in email is included in `VITE_ADMIN_EMAILS`.

Notes:
- The AdminRoute component checks `VITE_ADMIN_EMAILS` to determine whether the logged-in user is allowed.
- Improve authorization by adding an `is_admin` flag in a database table or using Supabase user metadata.

---

## 🚀 Quick Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📞 Support

For issues or questions:
1. Check the relevant documentation in the project root
2. Review Supabase dashboard logs
3. Check browser console for errors
4. Verify environment variables are set correctly

---

**Built with ❤️ using Lovable, React, Supabase, and modern web technologies.**
