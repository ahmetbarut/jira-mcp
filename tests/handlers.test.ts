import { describe, test, expect, beforeEach } from '@jest/globals';
import { 
  handleGetBoards, 
  handleGetIssues, 
  handleGetCurrentUserInfo,
  handleSearchUser,
  handleGetServerInfo,
  handleAddCommentToIssue,
  handleGetIssueDetail
} from '../src/handlers.js';
import { getJiraConfig } from '../src/jiraApi.js';
import {
  mockBoards,
  mockBoardDetail,
  mockIssues,
  mockCurrentUser,
  mockServerInfo,
  mockSearchUsers,
  mockComment,
  mockIssueDetail,
  mockFetchResponse
} from './mocks/jiraApiMocks.js';

// Mock fetch globally
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('Jira MCP Handlers', () => {
  let config: any;

  beforeEach(() => {
    // Reset environment variables
    process.env.JIRA_BASE_URL = 'https://test.atlassian.net';
    process.env.JIRA_EMAIL = 'test@example.com';
    process.env.JIRA_API_TOKEN = 'test-token';
    
    config = getJiraConfig();
    mockFetch.mockClear();
  });

  describe('handleGetBoards', () => {
    test('should return formatted scrum boards', async () => {
      mockFetch.mockResolvedValueOnce(mockFetchResponse(mockBoards) as any);

      const result = await handleGetBoards(config);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://test.atlassian.net/rest/agile/1.0/board?type=scrum',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': expect.stringContaining('Basic'),
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          })
        })
      );

      expect(result.content).toHaveLength(1);
      expect(result.content[0].text).toContain('# Jira Scrum Boards');
      expect(result.content[0].text).toContain('Test Scrum Board');
      expect(result.content[0].text).toContain('Another Scrum Board');
    });

    test('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce(mockFetchResponse({}, 404) as any);

      await expect(handleGetBoards(config)).rejects.toThrow('Jira API error: 404');
    });
  });

  describe('handleGetIssues', () => {
    test('should return user issues for a board', async () => {
      // First call for board details
      mockFetch.mockResolvedValueOnce(mockFetchResponse(mockBoardDetail) as any);
      // Second call for issues
      mockFetch.mockResolvedValueOnce(mockFetchResponse(mockIssues) as any);

      const result = await handleGetIssues(config, '1');

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenNthCalledWith(1, 
        'https://test.atlassian.net/rest/agile/1.0/board/1',
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenNthCalledWith(2,
        'https://test.atlassian.net/rest/api/3/search?jql=assignee%3DcurrentUser()%20AND%20project%3D%22TEST%22',
        expect.any(Object)
      );

      expect(result.content[0].text).toContain('# Benim Taskların - Test Scrum Board');
      expect(result.content[0].text).toContain('TEST-1');
      expect(result.content[0].text).toContain('TEST-2');
    });

    test('should handle board without project key', async () => {
      const boardWithoutProject = { ...mockBoardDetail, location: {} };
      mockFetch.mockResolvedValueOnce(mockFetchResponse(boardWithoutProject) as any);

      await expect(handleGetIssues(config, '1')).rejects.toThrow('Board project key not found');
    });
  });

  describe('handleGetCurrentUserInfo', () => {
    test('should return current user information', async () => {
      mockFetch
        .mockResolvedValueOnce(mockFetchResponse(mockCurrentUser) as any)
        .mockResolvedValueOnce(mockFetchResponse(mockServerInfo) as any);

      const result = await handleGetCurrentUserInfo(config);

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenNthCalledWith(1,
        'https://test.atlassian.net/rest/api/3/myself',
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenNthCalledWith(2,
        'https://test.atlassian.net/rest/api/3/serverInfo',
        expect.any(Object)
      );

      expect(result.content[0].text).toContain('# Current User - Complete Data');
      expect(result.content[0].text).toContain('Test User');
      expect(result.content[0].text).toContain('test@example.com');
    });
  });

  describe('handleSearchUser', () => {
    test('should search and return users', async () => {
      mockFetch.mockResolvedValueOnce(mockFetchResponse(mockSearchUsers) as any);

      const result = await handleSearchUser(config, 'john');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://test.atlassian.net/rest/api/3/user/search?query=john',
        expect.any(Object)
      );

      expect(result.content[0].text).toContain('# User Search Results for "john"');
      expect(result.content[0].text).toContain('John Doe');
      expect(result.content[0].text).toContain('Jane Smith');
    });

    test('should handle special characters in search query', async () => {
      mockFetch.mockResolvedValueOnce(mockFetchResponse([]) as any);

      await handleSearchUser(config, 'user@domain.com');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://test.atlassian.net/rest/api/3/user/search?query=user%40domain.com',
        expect.any(Object)
      );
    });
  });

  describe('handleGetServerInfo', () => {
    test('should return server information', async () => {
      mockFetch.mockResolvedValueOnce(mockFetchResponse(mockServerInfo) as any);

      const result = await handleGetServerInfo(config);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://test.atlassian.net/rest/api/3/serverInfo',
        expect.any(Object)
      );

      expect(result.content[0].text).toContain('# Jira Server Information');
      expect(result.content[0].text).toContain('https://test.atlassian.net');
      expect(result.content[0].text).toContain('1001.0.0-SNAPSHOT');
    });
  });

  describe('handleAddCommentToIssue', () => {
    test('should add comment to issue with ADF format', async () => {
      mockFetch.mockResolvedValueOnce(mockFetchResponse(mockComment) as any);

      const result = await handleAddCommentToIssue(config, 'TEST-1', 'Test comment');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://test.atlassian.net/rest/api/3/issue/TEST-1/comment',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': expect.stringContaining('Basic'),
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }),
          body: expect.stringContaining('"type":"doc"')
        })
      );

      // Verify ADF format is used
      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1]?.body as string);
      expect(body.body.type).toBe('doc');
      expect(body.body.content[0].type).toBe('paragraph');
      expect(body.body.content[0].content[0].text).toBe('Test comment');

      expect(result.content[0].text).toContain('# ✅ Comment Added');
      expect(result.content[0].text).toContain('comment-123');
      expect(result.content[0].text).toContain('TEST-1');
    });

    test('should handle comment creation errors', async () => {
      mockFetch.mockResolvedValueOnce(mockFetchResponse({ error: 'Invalid issue' }, 400) as any);

      await expect(handleAddCommentToIssue(config, 'INVALID', 'comment')).rejects.toThrow('Jira API error: 400');
    });
  });

  describe('handleGetIssueDetail', () => {
    test('should return detailed issue information', async () => {
      mockFetch.mockResolvedValueOnce(mockFetchResponse(mockIssueDetail) as any);

      const result = await handleGetIssueDetail(config, 'TEST-123');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://test.atlassian.net/rest/api/3/issue/TEST-123',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': expect.stringContaining('Basic'),
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          })
        })
      );

      expect(result.content).toHaveLength(1);
      const text = result.content[0].text;
      
      // Check main structure
      expect(text).toContain('# 📋 Issue Details: TEST-123');
      expect(text).toContain('```json');
      
      // Check that JSON contains expected fields
      expect(text).toContain('"key": "TEST-123"');
      expect(text).toContain('"summary": "Detailed test issue"');
      expect(text).toContain('"name": "In Progress"');
      expect(text).toContain('"name": "Story"');
      expect(text).toContain('"name": "High"');
      expect(text).toContain('"displayName": "John Doe"');
      expect(text).toContain('"displayName": "Jane Smith"');
      expect(text).toContain('"frontend"');
      expect(text).toContain('"urgent"');
      expect(text).toContain('"UI"');
      expect(text).toContain('"Backend"');
      expect(text).toContain('"1.0.0"');
      expect(text).toContain('"0.9.0"');
      expect(text).toContain('"TEST-100"');
      expect(text).toContain('"TEST-124"');
      expect(text).toContain('"TEST-125"');
    });

    test('should handle issue not found error', async () => {
      mockFetch.mockResolvedValueOnce(mockFetchResponse({ error: 'Issue not found' }, 404) as any);

      await expect(handleGetIssueDetail(config, 'NONEXISTENT-1')).rejects.toThrow('Jira API error: 404');
    });

    test('should handle issue with minimal fields', async () => {
      const minimalIssue = {
        key: 'TEST-456',
        id: '456',
        fields: {
          summary: 'Minimal issue',
          description: null,
          status: {
            name: 'Open',
            statusCategory: { name: 'To Do' }
          },
          issuetype: {
            name: 'Task',
            iconUrl: null
          },
          priority: null,
          assignee: null,
          reporter: null,
          project: {
            key: 'TEST',
            name: 'Test Project',
            projectTypeKey: 'software'
          },
          labels: [],
          components: [],
          fixVersions: [],
          versions: [],
          created: '2023-01-01T10:00:00.000Z',
          updated: '2023-01-01T10:00:00.000Z',
          duedate: null,
          timeoriginalestimate: null,
          timeestimate: null,
          timespent: null,
          resolution: null,
          environment: null,
          parent: null,
          subtasks: []
        }
      };

      mockFetch.mockResolvedValueOnce(mockFetchResponse(minimalIssue) as any);

      const result = await handleGetIssueDetail(config, 'TEST-456');

      expect(result.content[0].text).toContain('TEST-456');
      expect(result.content[0].text).toContain('"summary": "Minimal issue"');
      expect(result.content[0].text).toContain('"description": null');
      expect(result.content[0].text).toContain('"assignee": null');
      expect(result.content[0].text).toContain('"name": "No Priority"');
      expect(result.content[0].text).toContain('```json');
    });
  });

  describe('Configuration errors', () => {
    test('should throw error when environment variables are missing', () => {
      delete process.env.JIRA_BASE_URL;
      
      expect(() => getJiraConfig()).toThrow('Missing Jira configuration');
    });
  });
}); 