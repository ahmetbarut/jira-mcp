import { JiraConfig, Board, Issue } from './types.js';
import { jiraApiCall } from './jiraApi.js';

export async function handleGetBoards(config: JiraConfig) {
  const boards = await jiraApiCall('/board?type=scrum', config, true);
  
  const formattedBoards = boards.values.map((board: any) => ({
    id: board.id,
    name: board.name,
    type: board.type,
    location: board.location?.displayName || 'No location',
  }));

  return {
    content: [
      {
        type: 'text',
        text: `# Jira Scrum Boards\n\n${JSON.stringify(formattedBoards, null, 2)}`,
      },
    ],
  };
}

export async function handleGetIssues(config: JiraConfig, boardId: string) {
  try {
    // Önce board bilgisini al
    const board = await jiraApiCall(`/board/${boardId}`, config, true);
    
    // Board'un project key'ini al
    const projectKey = board.location?.projectKey;
    
    if (!projectKey) {
      throw new Error('Board project key not found');
    }
    
    // JQL kullanarak sadece kendi taskları getir
    const jql = `assignee=currentUser() AND project="${projectKey}"`;
    const issues = await jiraApiCall(`/search?jql=${encodeURIComponent(jql)}`, config, false);
    
    const formattedIssues = issues.issues.map((issue: any) => ({
      key: issue.key,
      summary: issue.fields.summary,
      status: issue.fields.status.name,
      assignee: issue.fields.assignee?.displayName || 'Unassigned',
      priority: issue.fields.priority?.name || 'No Priority',
      issueType: issue.fields.issuetype.name,
      created: issue.fields.created,
      updated: issue.fields.updated,
    }));

    return {
      content: [
        {
          type: 'text',
          text: `# Benim Taskların - ${board.name} (${issues.total} toplam)\n\n${JSON.stringify(formattedIssues, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    throw new Error(`Failed to get issues: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Deneysel kullanıcı bilgisi handler'ları
export async function handleGetCurrentUserInfo(config: JiraConfig) {
  try {
    const user = await jiraApiCall('/myself', config, false);
    const serverInfo = await jiraApiCall('/serverInfo', config, false);
    
    return {
      content: [
        {
          type: 'text',
          text: `# Current User - Complete Data

## 👤 User Information:
${JSON.stringify(user, null, 2)}

## 🖥️ Server Information:
${JSON.stringify(serverInfo, null, 2)}

## 📊 Quick Summary:
- **Display Name**: ${user.displayName}
- **Email**: ${user.emailAddress}
- **Account ID**: ${user.accountId}
- **Time Zone**: ${user.timeZone}
- **Server Time**: ${serverInfo.serverTime}
- **Active**: ${user.active}
- **All** : ${JSON.stringify(serverInfo, null, 2)}
`,
        },
      ],
    };
  } catch (error) {
    throw new Error(`Failed to get user info: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function handleSearchUser(config: JiraConfig, query: string) {
  try {
    const users = await jiraApiCall(`/user/search?query=${encodeURIComponent(query)}`, config, false);
    
    return {
      content: [
        {
          type: 'text',
          text: `# User Search Results for "${query}"\n\n${JSON.stringify(users, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    throw new Error(`Failed to search user: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function handleGetServerInfo(config: JiraConfig) {
  try {
    const serverInfo = await jiraApiCall('/serverInfo', config, false);
    
    return {
      content: [
        {
          type: 'text',
          text: `# Jira Server Information\n\n**Server Time**: ${serverInfo.serverTime}\n**Base URL**: ${serverInfo.baseUrl}\n**Version**: ${serverInfo.version}\n**Build Date**: ${serverInfo.buildDate}\n**Server Title**: ${serverInfo.serverTitle}`,
        },
      ],
    };
  } catch (error) {
    throw new Error(`Failed to get server info: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function handleAddCommentToIssue(config: JiraConfig, issueIdOrKey: string, body: string) {
  try {
    const auth = Buffer.from(`${config.email}:${config.apiToken}`).toString('base64');
    const url = `${config.baseUrl}/rest/api/3/issue/${issueIdOrKey}/comment`;
    // Atlassian Document Format (ADF) body
    const adfBody = {
      body: {
        type: 'doc',
        version: 1,
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: body,
              },
            ],
          },
        ],
      },
    };
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adfBody),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Jira API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    const comment = await response.json();
    return {
      content: [
        {
          type: 'text',
          text: `# ✅ Comment Added\n\nComment ID: ${comment.id}\nIssue: ${issueIdOrKey}\nBody: ${body}`,
        },
      ],
    };
  } catch (error) {
    throw new Error(`Failed to add comment: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 