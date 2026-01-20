#!/usr/bin/env tsx

// MCP Server startup script for Infinity's Reach
import { mcpServer } from '../src/lib/mcpServer.js';

mcpServer.start().catch((error: Error) => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
});
