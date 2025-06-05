// Jira API konfigürasyonu
export interface JiraConfig {
  baseUrl: string;
  email: string;
  apiToken: string;
}

// Board tipi
export interface Board {
  id: number;
  name: string;
  type: string;
  location?: {
    displayName: string;
  };
}

// Issue tipi
export interface Issue {
  key: string;
  fields: {
    summary: string;
    status: {
      name: string;
    };
    assignee?: {
      displayName: string;
    };
    priority?: {
      name: string;
    };
    issuetype: {
      name: string;
    };
    created: string;
    updated: string;
  };
} 
 