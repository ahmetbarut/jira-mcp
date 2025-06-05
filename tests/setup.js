// Global test setup for Jest (CommonJS format)

// Mock environment variables
process.env.JIRA_BASE_URL = 'https://test.atlassian.net';
process.env.JIRA_EMAIL = 'test@example.com';
process.env.JIRA_API_TOKEN = 'test-token';

// Mock fetch globally
global.fetch = jest.fn();

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
}); 