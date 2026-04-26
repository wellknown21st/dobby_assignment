#!/usr/bin/env node
/**
 * Dobby Ads MCP Server
 * 
 * Exposes backend actions as MCP-compatible tools so AI assistants
 * like Claude Desktop can interact with the application.
 *
 * Usage: Configure this in Claude Desktop's mcp_servers.json:
 * {
 *   "dobby-ads": {
 *     "command": "node",
 *     "args": ["/path/to/mcp-server/index.js"],
 *     "env": {
 *       "DOBBY_API_URL": "http://localhost:5000/api",
 *       "DOBBY_JWT_TOKEN": "<your-jwt-token>"
 *     }
 *   }
 * }
 */

const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { z } = require('zod');
const axios = require('axios');

const API_URL = process.env.DOBBY_API_URL || 'http://localhost:5000/api';
const JWT_TOKEN = process.env.DOBBY_JWT_TOKEN || '';

// Create axios client with auth
const api = axios.create({
  baseURL: API_URL,
  headers: { Authorization: `Bearer ${JWT_TOKEN}` },
});

// ─── MCP Server Setup ───────────────────────────────────────────────────────
const server = new McpServer({
  name: 'dobby-ads',
  version: '1.0.0',
});

// ─── Tool: list_folders ──────────────────────────────────────────────────────
server.tool(
  'list_folders',
  'List folders. If folder_id is provided, lists sub-folders of that folder. Otherwise lists root folders.',
  {
    folder_id: z.string().optional().describe('Parent folder ID. Omit to list root folders.'),
  },
  async ({ folder_id }) => {
    try {
      if (folder_id) {
        const res = await api.get(`/folders/${folder_id}`);
        const { folder, children, breadcrumb } = res.data;
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                current_folder: {
                  id: folder._id,
                  name: folder.name,
                  total_size: folder.totalSizeFormatted,
                  breadcrumb,
                },
                sub_folders: children.map((f) => ({
                  id: f._id,
                  name: f.name,
                  total_size: f.totalSizeFormatted,
                })),
              }, null, 2),
            },
          ],
        };
      } else {
        const res = await api.get('/folders');
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                root_folders: res.data.folders.map((f) => ({
                  id: f._id,
                  name: f.name,
                  total_size: f.totalSizeFormatted,
                })),
              }, null, 2),
            },
          ],
        };
      }
    } catch (err) {
      return {
        content: [{ type: 'text', text: `Error: ${err.response?.data?.message || err.message}` }],
        isError: true,
      };
    }
  }
);

// ─── Tool: create_folder ────────────────────────────────────────────────────
server.tool(
  'create_folder',
  'Create a new folder. Optionally specify a parent_folder_id to create it inside another folder.',
  {
    name: z.string().describe('Name of the folder to create'),
    parent_folder_id: z.string().optional().describe('ID of the parent folder. Omit for root-level folder.'),
  },
  async ({ name, parent_folder_id }) => {
    try {
      const res = await api.post('/folders', {
        name,
        parent: parent_folder_id || undefined,
      });
      const folder = res.data.folder;
      return {
        content: [
          {
            type: 'text',
            text: `✅ Folder "${folder.name}" created successfully!\nFolder ID: ${folder._id}\nParent: ${parent_folder_id || 'root'}`,
          },
        ],
      };
    } catch (err) {
      return {
        content: [{ type: 'text', text: `Error: ${err.response?.data?.message || err.message}` }],
        isError: true,
      };
    }
  }
);

// ─── Tool: list_images ──────────────────────────────────────────────────────
server.tool(
  'list_images',
  'List all images inside a specific folder.',
  {
    folder_id: z.string().describe('ID of the folder to list images from'),
  },
  async ({ folder_id }) => {
    try {
      const res = await api.get(`/folders/${folder_id}`);
      const { folder, images } = res.data;
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              folder: { id: folder._id, name: folder.name },
              images: images.map((img) => ({
                id: img._id,
                name: img.name,
                filename: img.filename,
                size_bytes: img.size,
                uploaded_at: img.createdAt,
              })),
              total_images: images.length,
            }, null, 2),
          },
        ],
      };
    } catch (err) {
      return {
        content: [{ type: 'text', text: `Error: ${err.response?.data?.message || err.message}` }],
        isError: true,
      };
    }
  }
);

// ─── Tool: delete_folder ────────────────────────────────────────────────────
server.tool(
  'delete_folder',
  'Delete a folder and all its contents (sub-folders and images) permanently.',
  {
    folder_id: z.string().describe('ID of the folder to delete'),
  },
  async ({ folder_id }) => {
    try {
      await api.delete(`/folders/${folder_id}`);
      return {
        content: [{ type: 'text', text: `✅ Folder ${folder_id} deleted successfully.` }],
      };
    } catch (err) {
      return {
        content: [{ type: 'text', text: `Error: ${err.response?.data?.message || err.message}` }],
        isError: true,
      };
    }
  }
);

// ─── Tool: delete_image ────────────────────────────────────────────────────
server.tool(
  'delete_image',
  'Delete a specific image by its ID.',
  {
    image_id: z.string().describe('ID of the image to delete'),
  },
  async ({ image_id }) => {
    try {
      await api.delete(`/images/${image_id}`);
      return {
        content: [{ type: 'text', text: `✅ Image ${image_id} deleted successfully.` }],
      };
    } catch (err) {
      return {
        content: [{ type: 'text', text: `Error: ${err.response?.data?.message || err.message}` }],
        isError: true,
      };
    }
  }
);

// ─── Tool: get_folder_info ──────────────────────────────────────────────────
server.tool(
  'get_folder_info',
  'Get detailed info about a folder including its total size (including nested folders) and breadcrumb path.',
  {
    folder_id: z.string().describe('ID of the folder'),
  },
  async ({ folder_id }) => {
    try {
      const res = await api.get(`/folders/${folder_id}`);
      const { folder, breadcrumb, children, images } = res.data;
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              folder: {
                id: folder._id,
                name: folder.name,
                total_size_bytes: folder.totalSize,
                total_size: folder.totalSizeFormatted,
                created_at: folder.createdAt,
              },
              path: breadcrumb.map((b) => b.name).join(' / '),
              breadcrumb,
              sub_folder_count: children.length,
              image_count: images.length,
            }, null, 2),
          },
        ],
      };
    } catch (err) {
      return {
        content: [{ type: 'text', text: `Error: ${err.response?.data?.message || err.message}` }],
        isError: true,
      };
    }
  }
);

// ─── Start Server ────────────────────────────────────────────────────────────
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('🤖 Dobby Ads MCP Server running on stdio');
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
