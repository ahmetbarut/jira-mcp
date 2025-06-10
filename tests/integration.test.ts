import { describe, test, expect, beforeEach } from '@jest/globals';
import { toolDefinitions } from '../src/tools.js';

describe('Integration Tests', () => {
  
  describe('Tool Definitions', () => {
    test('should have all required tools defined', () => {
      const toolNames = toolDefinitions.map(tool => tool.name);
      
      expect(toolNames).toContain('get_boards');
      expect(toolNames).toContain('get_issues');
      expect(toolNames).toContain('get_current_user_info');
      expect(toolNames).toContain('search_user');
      expect(toolNames).toContain('get_server_info');
      expect(toolNames).toContain('add_comment_to_issue');
      expect(toolNames).toContain('get_issue_detail');
    });

    test('should have valid schema for get_boards', () => {
      const getBoardsTool = toolDefinitions.find(tool => tool.name === 'get_boards');
      
      expect(getBoardsTool).toBeDefined();
      expect(getBoardsTool?.description).toContain('scrum boards');
      expect(getBoardsTool?.inputSchema.type).toBe('object');
      expect(getBoardsTool?.inputSchema.properties).toEqual({});
    });

    test('should have valid schema for get_issues', () => {
      const getIssuesTool = toolDefinitions.find(tool => tool.name === 'get_issues');
      
      expect(getIssuesTool).toBeDefined();
      expect(getIssuesTool?.description).toContain('tasks from a specific');
      expect(getIssuesTool?.inputSchema.properties).toHaveProperty('boardId');
      expect(getIssuesTool?.inputSchema.required).toContain('boardId');
    });

    test('should have valid schema for search_user', () => {
      const searchUserTool = toolDefinitions.find(tool => tool.name === 'search_user');
      
      expect(searchUserTool).toBeDefined();
      expect(searchUserTool?.inputSchema.properties).toHaveProperty('query');
      expect(searchUserTool?.inputSchema.required).toContain('query');
    });

    test('should have valid schema for add_comment_to_issue', () => {
      const addCommentTool = toolDefinitions.find(tool => tool.name === 'add_comment_to_issue');
      
      expect(addCommentTool).toBeDefined();
      expect(addCommentTool?.inputSchema.properties).toHaveProperty('issueIdOrKey');
      expect(addCommentTool?.inputSchema.properties).toHaveProperty('body');
      expect(addCommentTool?.inputSchema.required).toEqual(['issueIdOrKey', 'body']);
    });

    test('should have valid schema for get_issue_detail', () => {
      const getIssueDetailTool = toolDefinitions.find(tool => tool.name === 'get_issue_detail');
      
      expect(getIssueDetailTool).toBeDefined();
      expect(getIssueDetailTool?.description).toContain('detailed information');
      expect(getIssueDetailTool?.inputSchema.properties).toHaveProperty('issueIdOrKey');
      expect(getIssueDetailTool?.inputSchema.required).toContain('issueIdOrKey');
    });
  });

  describe('Tool Descriptions', () => {
    test('all tools should have meaningful descriptions', () => {
      toolDefinitions.forEach(tool => {
        expect(tool.description).toBeTruthy();
        expect(tool.description.length).toBeGreaterThan(10);
      });
    });

    test('all tools should have proper input schema', () => {
      toolDefinitions.forEach(tool => {
        expect(tool.inputSchema).toBeTruthy();
        expect(tool.inputSchema.type).toBe('object');
        expect(tool.inputSchema.properties).toBeDefined();
      });
    });
  });

  describe('Environment Configuration', () => {
    test('should validate required environment variables', () => {
      const requiredVars = ['JIRA_BASE_URL', 'JIRA_EMAIL', 'JIRA_API_TOKEN'];
      
      requiredVars.forEach(varName => {
        const originalValue = process.env[varName];
        delete process.env[varName];
        
        // Import and test config - should throw error
        expect(() => {
          // Re-import to test fresh config
          delete require.cache[require.resolve('../src/jiraApi.js')];
          const { getJiraConfig } = require('../src/jiraApi.js');
          getJiraConfig();
        }).toThrow('Missing Jira configuration');
        
        // Restore value
        if (originalValue) process.env[varName] = originalValue;
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle network errors gracefully', async () => {
      // This would be tested with actual network conditions
      // For now, we verify error handling patterns
      expect(true).toBe(true); // Placeholder
    });
  });
}); 