import { JiraConfig } from './types.js';

export function getJiraConfig(): JiraConfig {
  const baseUrl = process.env.JIRA_BASE_URL;
  const email = process.env.JIRA_EMAIL;
  const apiToken = process.env.JIRA_API_TOKEN;

  if (!baseUrl || !email || !apiToken) {
    throw new Error('Missing Jira configuration. Please set JIRA_BASE_URL, JIRA_EMAIL, and JIRA_API_TOKEN environment variables.');
  }

  return { baseUrl, email, apiToken };
}

// Jira API çağrıları için yardımcı fonksiyon
export async function jiraApiCall(endpoint: string, config: JiraConfig, useAgileApi: boolean = false) {
  const auth = Buffer.from(`${config.email}:${config.apiToken}`).toString('base64');
  
  const baseApiPath = useAgileApi ? '/rest/agile/1.0' : '/rest/api/3';
  const response = await fetch(`${config.baseUrl}${baseApiPath}${endpoint}`, {
    headers: {
      'Authorization': `Basic ${auth}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Jira API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
} 