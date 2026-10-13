# Chetna Verma — B.A. LL.B Scholar & Legal Intern Portfolio

A high-performance, modern Next.js portfolio and secure Admin CMS built for **Chetna Verma**, 1st Year B.A. LL.B student at Chandigarh Group of Colleges (CGC University), Mohali.

Featuring a stately Emerald & Oxford Spruce aesthetic, comprehensive academic & courtroom credentials, and a serverless CMS with Upstash Redis and Vercel Blob storage.

---

## 🌟 Candidate Overview

- **Name:** Chetna Verma
- **Current Degree:** B.A. LL.B (5-Year Integrated Degree), 1st Year — Chandigarh Group of Colleges (CGC University), Mohali
- **Senior Secondary (12th):** Mount Litera Zee School, Kathua (60%)
- **Secondary (10th):** Kendriya Vidyalaya (KV), Kathua (57%)
- **Seeking:** Foundational Legal Internships (Litigation Chambers, High Court / District Court, Pro Bono Legal Aid, Law Firms)
- **Focus Areas:** Constitutional Law, Bharatiya Nyaya Sanhita (BNS/BNSS), Contract Law, Legal Research (SCC Online), Case Analysis & Memorial Drafting

---

## 🚀 Quick Start — Run on Port 7777

To run and preview the portfolio locally on port **7777**:

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Local Environment Variables
A `.env.local` file is already created. You can verify or create it from `.env.example`:
```bash
cp .env.example .env.local
```

Default local credentials:
```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=password
SESSION_SECRET=chetna_verma_portfolio_jwt_secret_key_2026_secure
```

### 3. Start Development Server on Port 7777
Run either of these commands:
```bash
npm run dev
```
*or*
```bash
npm run dev:7777
```
*or via direct Next CLI:*
```bash
npx next dev -p 7777
```

### 4. Open in Browser
- **Public Portfolio:** [http://localhost:7777](http://localhost:7777)
- **Admin CMS Dashboard:** [http://localhost:7777/rj-admin-portfolio](http://localhost:7777/rj-admin-portfolio)
  - **Username:** `admin`
  - **Password:** `password`

> **Note for Local Development:** When running locally without Redis, all edits made in the Admin CMS are saved directly to `data.json`, and file uploads are saved to `public/uploads/`.

---

## ☁️ Complete Deployment Guide: Vercel & Cloud Storage

In production on Vercel, serverless lambdas run in a **read-only ephemeral filesystem**. To persist your CMS content updates, profile photos, and PDF resume uploads across deployments, this project uses:
1. **Upstash Redis** (Stores `data.json` CMS updates)
2. **Vercel Blob** (Stores profile pictures and PDF resumes)

Follow these simple steps to deploy:

### Step 1: Push Code to GitHub
The repository is set up at:
`https://github.com/raghavijasrotia/portfolio-chetnaverma`

If making additional local changes, commit and push:
```bash
git add .
git commit -m "Update portfolio settings and styling"
git push origin main
```

---

### Step 2: Import into Vercel
1. Go to [https://vercel.com](https://vercel.com) and log in.
2. Click **"Add New..."** → **"Project"**.
3. Import the **`portfolio-chetnaverma`** repository from your GitHub account.
4. Leave the Framework Preset as **Next.js** and Root Directory as `./`.

---

### Step 3: Setup Upstash Redis Storage (For CMS Edits)
To allow admin edits (text, experience, education, skills) to save on Vercel:

#### Method A: Direct inside Vercel Dashboard (Easiest)
1. In your Vercel Project Dashboard, click the **Storage** tab.
2. Click **Connect Database** → Select **Upstash Redis** (or **Vercel KV**).
3. Follow the quick prompts to create a free database and link it to your project.
4. Vercel will automatically inject:
   - `KV_REST_API_URL` (or `UPSTASH_REDIS_REST_URL`)
   - `KV_REST_API_TOKEN` (or `UPSTASH_REDIS_REST_TOKEN`)

#### Method B: Using Upstash Console
1. Go to [https://console.upstash.com](https://console.upstash.com) and create a free account.
2. Create a new Redis Database (select region closest to your users, e.g. Mumbai / AWS ap-south-1).
3. Copy **REST URL** and **REST Token** from the database overview.
4. Add them in Vercel **Project Settings → Environment Variables**:
   - `UPSTASH_REDIS_REST_URL` = `https://your-database.upstash.io`
   - `UPSTASH_REDIS_REST_TOKEN` = `your_upstash_token`

---

### Step 4: Setup Vercel Blob (For Resume & Photo Uploads)
To persist uploaded photos and PDF resumes in production:
1. In your Vercel Project Dashboard, navigate to the **Storage** tab.
2. Click **Create Database** → Select **Blob**.
3. Click **Create** and link it to your `portfolio-chetnaverma` project.
4. Vercel automatically populates:
   - `BLOB_READ_WRITE_TOKEN`

---

### Step 5: Configure Environment Variables in Vercel
In Vercel **Project Settings → Environment Variables**, ensure the following keys are set:

| Variable Name | Value / Description |
|---|---|
| `ADMIN_USERNAME` | `admin` (or your preferred admin login email) |
| `ADMIN_PASSWORD` | Your custom secure password |
| `SESSION_SECRET` | A long, secure random string (e.g. `openssl rand -hex 32`) |
| `ADMIN_SECRET` | Same long random string as `SESSION_SECRET` |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL (Auto-set if linked via Vercel) |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST Token (Auto-set if linked via Vercel) |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob Access Token (Auto-set if Blob is linked) |

---

### Step 6: Deploy & Verify
1. Click **Deploy** in Vercel.
2. Once the build finishes, open your live URL (e.g. `https://portfolio-chetnaverma.vercel.app`).
3. Visit the Admin Panel at `/rj-admin-portfolio` on your live domain.
4. Log in using your `ADMIN_USERNAME` and `ADMIN_PASSWORD`.
5. Test saving a change in the Profile or Education section. With Upstash Redis connected, your changes will persist permanently!

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router with Server Components)
- **Styling:** Tailwind CSS v4 with bespoke Emerald, Spruce & Alabaster color tokens
- **Typography:** `Inter` (sans-serif) & `Cinzel` (authoritative legal serif)
- **Icons:** `lucide-react`
- **CMS & Storage:** Upstash Redis (Production DB), Local FS (Development), Vercel Blob (Media)
- **Authentication:** Edge-compatible JWT via `jose` with HttpOnly session cookies

---

## 📁 Repository Structure

```
portfolio-chetnaverma/
├── app/
│   ├── api/                     # Serverless API routes (auth, data saving, uploads)
│   ├── rj-admin-portfolio/      # Secure Advocate CMS Admin Panel
│   ├── globals.css              # Tailwind v4 theme, emerald/spruce tokens & glass styles
│   ├── layout.tsx               # Root layout with legal parchment pattern & fonts
│   ├── page.tsx                 # Public portfolio homepage
│   └── robots.ts                # SEO crawler directives
├── components/
│   ├── Navbar.tsx               # Navigation bar with live status & badge
│   └── Footer.tsx               # Footer with BCI legal compliance statement
├── lib/
│   ├── auth.ts                  # JWT session management
│   ├── defaultData.ts           # Fallback profile & education data structure
│   ├── storage.ts               # Hybrid storage adapter (Redis / Local File)
│   └── types.ts                 # TypeScript interfaces
├── public/
│   ├── images/                  # Chetna Verma portrait avatar & assets
│   └── uploads/                 # Local uploaded files
├── .env.example                 # Environment variables template
├── .env.local                   # Local configuration
├── data.json                    # Local CMS database
└── package.json                 # Next.js configuration and scripts
```
