export const toolDefinitions = [
  {
    name: 'get_boards',
    description: 'Get all available Jira scrum boards',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_issues',
    description: 'Get current user\'s tasks from a specific Jira board',
    inputSchema: {
      type: 'object',
      properties: {
        boardId: {
          type: 'string',
          description: 'Board ID to get your tasks from',
        },
      },
      required: ['boardId'],
    },
  },
  // Deneysel kullanıcı bilgisi tool'ları
  {
    name: 'get_current_user_info',
    description: 'Get current authenticated user information including login, email, timezone',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'search_user',
    description: 'Search for a user by login name or email',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Username, email, or display name to search for',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_server_info',
    description: 'Get Jira server information including current server time',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'add_comment_to_issue',
    description: 'Add a comment to a specific Jira issue',
    inputSchema: {
      type: 'object',
      properties: {
        issueIdOrKey: {
          type: 'string',
          description: 'The issue key or ID to add a comment to',
        },
        body: {
          type: 'string',
          description: 'The comment text',
        },
      },
      required: ['issueIdOrKey', 'body'],
    },
  },
]; 