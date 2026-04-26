# Dobby Ads — Media Drive

A full-stack Google Drive–style media manager built with Node.js, React, and MongoDB.

## Features

- ✅ Signup / Login / Logout (JWT auth, no Firebase)
- ✅ Create nested folders (unlimited depth)
- ✅ Folder size: recursive sum of all images including nested folders
- ✅ Upload images (name + file required)
- ✅ User-specific access — users only see their own folders/images
- ✅ Image lightbox viewer
- ✅ Drag-and-drop image upload
- 🤖 **Bonus:** MCP server for Claude Desktop integration

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express |
| Frontend | React (Vite) |
| Database | MongoDB (Mongoose) |
| Auth | JWT + bcrypt |
| File storage | Multer (local `uploads/`) |
| MCP | `@modelcontextprotocol/sdk` |

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB running locally on port 27017

### 1. Backend

```bash
cd backend
npm install
# Edit .env if needed (MONGO_URI, JWT_SECRET)
npm run dev    # starts on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev    # starts on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## API Reference

### Auth
| Method | Path | Body | Description |
|--------|------|------|-------------|
| POST | `/api/auth/signup` | `{name, email, password}` | Register |
| POST | `/api/auth/login` | `{email, password}` | Login → JWT |
| GET | `/api/auth/me` | — | Current user |

### Folders (all require `Authorization: Bearer <token>`)
| Method | Path | Body | Description |
|--------|------|------|-------------|
| GET | `/api/folders` | — | Root folders with sizes |
| GET | `/api/folders/:id` | — | Folder + children + images + breadcrumb |
| POST | `/api/folders` | `{name, parent?}` | Create folder |
| DELETE | `/api/folders/:id` | — | Delete folder + all contents |

### Images
| Method | Path | Body | Description |
|--------|------|------|-------------|
| POST | `/api/images` | `FormData{name, folder, image}` | Upload image |
| DELETE | `/api/images/:id` | — | Delete image |

Static files served at `/uploads/<filename>`.

---

## MCP Server (Bonus — Claude Desktop Integration)

The MCP server exposes backend actions as tools so Claude Desktop can control the app via natural language.

### Setup

1. Get your JWT token by logging in via the app (check browser localStorage → `token`).

2. Add to Claude Desktop config (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "dobby-ads": {
      "command": "node",
      "args": ["C:\\path\\to\\dobby ads\\mcp-server\\index.js"],
      "env": {
        "DOBBY_API_URL": "http://localhost:5000/api",
        "DOBBY_JWT_TOKEN": "your-jwt-token-here"
      }
    }
  }
}
```

3. Restart Claude Desktop — it will connect to the MCP server.

### Available MCP Tools

| Tool | Description |
|------|-------------|
| `list_folders` | List root folders or sub-folders |
| `create_folder` | Create a folder with optional parent |
| `list_images` | List images inside a folder |
| `get_folder_info` | Get folder details + total size |
| `delete_folder` | Delete folder + all contents |
| `delete_image` | Delete a specific image |

### Example prompts for Claude

- *"Create a folder called Campaigns"*
- *"Create a folder called Summer inside Campaigns"*
- *"List all my folders"*
- *"What's the total size of the Projects folder?"*

---

## Project Structure

```
dobby-ads/
├── backend/
│   ├── src/
│   │   ├── models/        User.js, Folder.js, Image.js
│   │   ├── routes/        auth.js, folders.js, images.js
│   │   ├── middleware/    auth.js (JWT protect)
│   │   ├── utils/         upload.js (Multer), folderUtils.js
│   │   └── index.js
│   └── uploads/           (image files stored here)
├── frontend/
│   └── src/
│       ├── api/           axios.js
│       ├── context/       AuthContext.jsx
│       ├── components/    Navbar, FolderCard, ImageCard, Modals
│       └── pages/         LoginPage, SignupPage, DashboardPage
└── mcp-server/
    └── index.js
```
