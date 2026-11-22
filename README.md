# Levy Makomere portfolio (Next.js + Firebase + Cloudinary, hosted on Vercel)

- **Public site**: home, project pages, blog. Server-rendered from Firestore and cached (revalidates when you save in the admin).
- **Admin panel** at `/admin`: projects, blog posts, experience, stack, settings, analytics. Login with Firebase Authentication.
- **Images**: uploaded from the admin straight to Cloudinary (signed by the server), delivered with automatic format and size.
- **Analytics**: stored in Firestore. No cookies, no IP addresses stored, bots / Do-Not-Track / your own admin visits excluded.

## 1. Firebase (about 5 minutes)
1. console.firebase.google.com > **Add project**.
2. **Build > Firestore Database > Create database** (production mode, pick a nearby region). Open the **Rules** tab, paste `firestore.rules`, **Publish**.
3. **Build > Authentication > Get started > Email/Password > Enable**. Then **Users > Add user** with your email + a strong password.
4. **Project settings > General > Your apps > Web (</>)**: register an app and copy the config values into the `NEXT_PUBLIC_FIREBASE_*` variables.
5. **Project settings > Service accounts > Generate new private key**. From the JSON copy `project_id`, `client_email`, `private_key` into `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`.
6. Set `ADMIN_EMAILS` to the email you created in step 3. Only listed emails can use the admin, even if someone else signs up.

## 2. Cloudinary
Sign up (free), then **Settings > API Keys**: copy Cloud name, API key, API secret into `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

## 3. Run locally
    npm install
    cp .env.example .env.local   # fill it in
    npm run dev                  # http://localhost:3000  (admin: /admin)

## 4. Deploy to Vercel
1. Push this folder to a GitHub repo.
2. vercel.com > **Add New > Project** > import the repo (framework auto-detected: Next.js).
3. Add every variable from `.env.example` under **Environment Variables** (for `FIREBASE_PRIVATE_KEY` paste the value with the `\n` sequences).
4. Deploy. Then in Firebase **Authentication > Settings > Authorized domains** add your `*.vercel.app` domain (and your custom domain).
5. Set `NEXT_PUBLIC_SITE_URL` to the final URL and redeploy (used for sitemap and social previews).

Open `/admin`, sign in, and fill in **Settings** (portrait, email, WhatsApp, GitHub, LinkedIn, CV link). First login adds your three named projects (LOOK AFRICA Lead Hunter, PataKeja, AACL Digital) as empty cards for you to complete.

## Notes
- Firestore data: `settings/site`, `projects`, `posts`, `experience`, `meta/stack`, `stats/{day}` (analytics counters).
- Optional: in Firestore **TTL policies**, add one for collection group `visitors` on field `expireAt` so the daily anonymous visitor hashes clean themselves up.
- Cloudinary images you upload but never save stay in your Cloudinary library; delete them there if you care.
- Disable public sign-ups if you like (Authentication > Settings > User actions). The allow-list already blocks non-admins from every admin API.
