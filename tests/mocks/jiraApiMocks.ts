// Mock Jira API responses and utilities

export const mockBoards = {
  values: [
    {
      id: 1,
      name: 'Test Scrum Board',
      type: 'scrum',
      location: {
        displayName: 'Test Project',
        projectKey: 'TEST'
      }
    },
    {
      id: 2,
      name: 'Another Scrum Board',
      type: 'scrum',
      location: {
        displayName: 'Another Project',
        projectKey: 'ANOTHER'
      }
    }
  ]
};

export const mockBoardDetail = {
  id: 1,
  name: 'Test Scrum Board',
  type: 'scrum',
  location: {
    displayName: 'Test Project',
    projectKey: 'TEST'
  }
};

export const mockIssues = {
  total: 2,
  issues: [
    {
      key: 'TEST-1',
      fields: {
        summary: 'Test issue 1',
        status: { name: 'In Progress' },
        assignee: { displayName: 'John Doe' },
        priority: { name: 'High' },
        issuetype: { name: 'Story' },
        created: '2023-01-01T10:00:00.000Z',
        updated: '2023-01-02T10:00:00.000Z'
      }
    },
    {
      key: 'TEST-2',
      fields: {
        summary: 'Test issue 2',
        status: { name: 'To Do' },
        assignee: null,
        priority: { name: 'Medium' },
        issuetype: { name: 'Bug' },
        created: '2023-01-01T11:00:00.000Z',
        updated: '2023-01-02T11:00:00.000Z'
      }
    }
  ]
};

export const mockCurrentUser = {
  accountId: 'test-account-id',
  displayName: 'Test User',
  emailAddress: 'test@example.com',
  active: true,
  timeZone: 'Europe/Istanbul',
  locale: 'en_US',
  name: 'testuser'
};

export const mockServerInfo = {
  baseUrl: 'https://test.atlassian.net',
  version: '1001.0.0-SNAPSHOT',
  buildNumber: 100000,
  buildDate: '2023-01-01T00:00:00.000Z',
  serverTime: '2023-01-01T12:00:00.000Z',
  serverTitle: 'JIRA'
};

export const mockSearchUsers = [
  {
    accountId: 'user-1',
    displayName: 'John Doe',
    emailAddress: 'john@example.com',
    active: true
  },
  {
    accountId: 'user-2',
    displayName: 'Jane Smith',
    emailAddress: 'jane@example.com',
    active: true
  }
];

export const mockComment = {
  id: 'comment-123',
  author: {
    accountId: 'test-account-id',
    displayName: 'Test User'
  },
  body: {
    type: 'doc',
    version: 1,
    content: [
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Test comment'
          }
        ]
      }
    ]
  },
  created: '2023-01-01T12:00:00.000Z'
};

export const mockIssueDetail = {
  key: 'TEST-123',
  id: '12345',
  fields: {
    summary: 'Detailed test issue',
    description: 'This is a detailed description of the test issue',
    status: {
      name: 'In Progress',
      statusCategory: {
        name: 'In Progress'
      }
    },
    issuetype: {
      name: 'Story',
      iconUrl: 'https://test.atlassian.net/icons/story.png'
    },
    priority: {
      name: 'High',
      iconUrl: 'https://test.atlassian.net/icons/high.png'
    },
    assignee: {
      displayName: 'John Doe',
      emailAddress: 'john@example.com',
      accountId: 'john-account-id'
    },
    reporter: {
      displayName: 'Jane Smith',
      emailAddress: 'jane@example.com',
      accountId: 'jane-account-id'
    },
    project: {
      key: 'TEST',
      name: 'Test Project',
      projectTypeKey: 'software'
    },
    labels: ['frontend', 'urgent'],
    components: [
      { name: 'UI' },
      { name: 'Backend' }
    ],
    fixVersions: [
      { name: '1.0.0' }
    ],
    versions: [
      { name: '0.9.0' }
    ],
    created: '2023-01-01T10:00:00.000Z',
    updated: '2023-01-02T15:30:00.000Z',
    duedate: '2023-01-15',
    timeoriginalestimate: 28800,
    timeestimate: 14400,
    timespent: 14400,
    resolution: {
      name: 'Fixed',
      description: 'A fix for this issue is checked into the tree and tested.'
    },
    environment: 'Production environment',
    parent: {
      key: 'TEST-100',
      fields: {
        summary: 'Parent epic issue'
      }
    },
    subtasks: [
      {
        key: 'TEST-124',
        fields: {
          summary: 'Subtask 1',
          status: { name: 'Done' }
        }
      },
      {
        key: 'TEST-125',
        fields: {
          summary: 'Subtask 2',
          status: { name: 'In Progress' }
        }
      }
    ]
  }
};

// Mock fetch response helper
export function mockFetchResponse(data: any, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data))
  });
} 