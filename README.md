# Dobby Ads — Media Drive

> **Full-stack media management app** built for the Dobby Ads developer assignment.

🌐 **Live Frontend:** [https://dobby-assignment.vercel.app](https://dobby-assignment.vercel.app)

⚙️ **Live Backend:** [https://dobby-assignment-qeyw.onrender.com](https://dobby-assignment-qeyw.onrender.com)

---

## Overview

Dobby Ads is a Google Drive–style media manager where users can register, create unlimited nested folders, and upload images — all in a private, user-specific workspace. Built with Node.js, React, and MongoDB, with Cloudinary for image storage and an MCP server bonus for Claude Desktop integration.

---

## Features

| Feature | Description |
|---------|-------------|
| 🔐 **Signup / Login / Logout** | JWT authentication with bcrypt password hashing (no Firebase) |
| 📁 **Nested Folders** | Create folders inside folders to any depth, just like Google Drive |
| 📦 **Folder Size** | Each folder shows its total size — recursively summed from all images at any nesting level |
| 🖼️ **Image Upload** | Upload images with a custom name; stored securely on Cloudinary |
| 🔒 **User-Specific Access** | Users only ever see their own folders and images |
| 🏠 **Landing Page** | Public marketing page with hero, features, how-it-works, MCP callout, and CTA |
| 🤖 **MCP Server (Bonus)** | Claude Desktop integration via MCP tools |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Node.js + Express |
| **Frontend** | React (Vite) |
| **Database** | MongoDB (Mongoose) |
| **Authentication** | JWT + bcrypt |
| **Image Storage** | Cloudinary |
| **MCP** | `@modelcontextprotocol/sdk` |
| **Frontend Host** | Vercel |
| **Backend Host** | Render |

---

## Live Demo

### 🌐 Frontend — Vercel
**[https://dobby-assignment.vercel.app](https://dobby-assignment.vercel.app)**

- Visit `/home` for the public landing page
- Sign up or log in to access your personal drive
- Create nested folders, upload images, manage your media

### ⚙️ Backend API — Render
**[https://dobby-assignment-qeyw.onrender.com](https://dobby-assignment-qeyw.onrender.com)**

- Base URL for all API calls: `https://dobby-assignment-qeyw.onrender.com/api`
- Health check: `GET /api/health`

> **Note:** The Render backend may take ~30 seconds to wake up on first request (free tier cold start).

---

## Pages

| Route | Page | Access |
|-------|------|--------|
| `/home` | Landing page | Public |
| `/login` | Login page | Public (redirects to `/` if already logged in) |
| `/signup` | Signup page | Public (redirects to `/` if already logged in) |
| `/` | My Drive (root folders) | Protected |
| `/folder/:id` | Folder view (sub-folders + images) | Protected |

---

## API Reference

All protected routes require: `Authorization: Bearer <token>`

### Auth

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/signup` | `{name, email, password}` | Register a new user |
| `POST` | `/api/auth/login` | `{email, password}` | Login → returns JWT |
| `GET` | `/api/auth/me` | — | Get current user info |

### Folders

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `GET` | `/api/folders` | — | List root folders with sizes |
| `GET` | `/api/folders/:id` | — | Folder detail + children + images + breadcrumb |
| `POST` | `/api/folders` | `{name, parent?}` | Create a folder (optionally nested) |
| `DELETE` | `/api/folders/:id` | — | Delete folder + all contents recursively |

### Images

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `POST` | `/api/images` | `FormData {name, folder, image}` | Upload image to Cloudinary |
| `DELETE` | `/api/images/:id` | — | Delete image from Cloudinary + DB |

---

## Local Development

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account

### 1. Clone the repo

```bash
git clone https://github.com/wellknown21st/dobby_assignment.git
cd dobby_assignment
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in your values in .env
npm run dev
# Runs on http://localhost:5000
```

**Backend `.env` variables:**

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/dobby-ads
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

Open **[http://localhost:5173/home](http://localhost:5173/home)** in your browser.

---

## MCP Server (Bonus — Claude Desktop Integration)

The MCP server exposes backend actions as tools so Claude Desktop can manage your media via natural language.

### Setup

1. **Get your JWT token** — Log in to the app, open browser DevTools → Application → Local Storage → copy the `token` value.

2. **Add to Claude Desktop config** (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "dobby-ads": {
      "command": "node",
      "args": ["C:\\path\\to\\dobby_assignment\\mcp-server\\index.js"],
      "env": {
        "DOBBY_API_URL": "https://dobby-assignment-qeyw.onrender.com/api",
        "DOBBY_JWT_TOKEN": "paste-your-jwt-token-here"
      }
    }
  }
}
```

3. **Restart Claude Desktop** — it will connect to the MCP server automatically.

### Available MCP Tools

| Tool | Description |
|------|-------------|
| `list_folders` | List root folders or sub-folders of a given folder |
| `create_folder` | Create a new folder with an optional parent |
| `list_images` | List all images inside a specific folder |
| `get_folder_info` | Get folder details including total recursive size |
| `delete_folder` | Delete a folder and all its contents permanently |
| `delete_image` | Delete a specific image by ID |

### Example Claude Prompts

```
"Create a folder called Campaigns"
"Create a folder called Summer 2024 inside Campaigns"
"List all my folders"
"What is the total size of the Brand Assets folder?"
"List all images in the Social Media folder"
```

---

## Project Structure

```
dobby_assignment/
├── .gitignore
├── README.md
│
├── backend/
│   ├── .env.example              ← environment template
│   ├── package.json
│   └── src/
│       ├── index.js              ← Express app entry point
│       ├── models/
│       │   ├── User.js           ← bcrypt password hashing
│       │   ├── Folder.js         ← nested folder model
│       │   └── Image.js          ← Cloudinary metadata model
│       ├── routes/
│       │   ├── auth.js           ← signup, login, /me
│       │   ├── folders.js        ← CRUD + recursive size
│       │   └── images.js         ← Cloudinary upload/delete
│       ├── middleware/
│       │   └── auth.js           ← JWT protect middleware
│       └── utils/
│           ├── upload.js         ← Cloudinary + multer config
│           └── folderUtils.js    ← recursive size calculation
│
├── frontend/
│   └── src/
│       ├── api/
│       │   └── axios.js          ← JWT interceptor
│       ├── context/
│       │   └── AuthContext.jsx   ← global auth state
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── FolderCard.jsx
│       │   ├── ImageCard.jsx
│       │   ├── CreateFolderModal.jsx
│       │   └── UploadImageModal.jsx
│       └── pages/
│           ├── LandingPage.jsx   ← public marketing page
│           ├── LoginPage.jsx
│           ├── SignupPage.jsx
│           └── DashboardPage.jsx ← drive (root + nested)
│
└── mcp-server/
    └── index.js                  ← MCP tools for Claude Desktop
```

---

## Deployment

### Frontend — Vercel
- Framework: **Vite (React)**
- Set environment variable: `VITE_API_URL=https://dobby-assignment-qeyw.onrender.com`

### Backend — Render
- Runtime: **Node.js**
- Build command: `npm install`
- Start command: `node src/index.js`
- Set all `.env` variables in Render's environment settings

---

## Security Notes

- Passwords are hashed with **bcrypt** (12 salt rounds)
- JWT tokens expire in **7 days**
- All folder/image queries are filtered by `owner` — no cross-user data leakage
- Cloudinary credentials are never exposed to the client
- `.env` is gitignored; use `.env.example` as a template
