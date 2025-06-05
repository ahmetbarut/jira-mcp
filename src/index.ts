import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

import { getJiraConfig } from './jiraApi.js';
import { toolDefinitions } from './tools.js';
import { 
  handleGetBoards, 
  handleGetIssues, 
  handleGetCurrentUserInfo, 
  handleSearchUser, 
  handleGetServerInfo,
  handleAddCommentToIssue
} from './handlers.js';

const server = new Server(
  {
    name: 'jira-mcp-server',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool listesini tanımla
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: toolDefinitions,
  };
});

// Tool çağrılarını işle
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const config = getJiraConfig();

  try {
    switch (name) {
      case 'get_boards': {
        return await handleGetBoards(config);
      }

      case 'get_issues': {
        const { boardId } = args as { boardId: string };
        return await handleGetIssues(config, boardId);
      }

      // Deneysel kullanıcı bilgisi tool'ları
      case 'get_current_user_info': {
        return await handleGetCurrentUserInfo(config);
      }

      case 'search_user': {
        const { query } = args as { query: string };
        return await handleSearchUser(config, query);
      }

      case 'get_server_info': {
        return await handleGetServerInfo(config);
      }

      case 'add_comment_to_issue': {
        const { issueIdOrKey, body } = args as { issueIdOrKey: string, body: string };
        return await handleAddCommentToIssue(config, issueIdOrKey, body);
      }

      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${name}`
        );
    }
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Error executing tool ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Jira MCP server running on stdio');
}

runServer().catch(console.error);
