import { Group, CallState } from '../types';

// API URL configuration
const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://studybuddy-backend.netlify.app/.netlify/functions/api'
  : 'http://localhost:3001/api';

// Debug flag - only enable in development
const DEBUG = process.env.NODE_ENV === 'development';

const handleResponse = async (response: Response) => {
  const responseDetails = {
    url: response.url,
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries())
  };
  
  if (DEBUG) {
    console.log('Raw API Response:', responseDetails);
  }
  
  let responseText;
  try {
    responseText = await response.text();
    if (DEBUG) {
      console.log('Raw response text:', responseText);
    }
    
    // Try to parse as JSON if not empty
    const data = responseText ? JSON.parse(responseText) : null;
    if (DEBUG) {
      console.log('Parsed response data:', data);
    }
    
    if (!response.ok) {
      throw new Error(
        JSON.stringify({
          message: data?.error || `HTTP error! status: ${response.status}`,
          status: response.status,
          data: data,
          details: responseDetails
        })
      );
    }
    return data;
  } catch (error) {
    console.error('API Response Error:', {
      error,
      responseText,
      ...responseDetails
    });
    throw error;
  }
};

export const groupApi = {
  // Create a new group
  createGroup: async (groupData: {
    name: string;
    description?: string;
    userId: string;
    interest?: string;
  }): Promise<Group> => {
    if (!groupData.name || !groupData.userId) {
      console.error('createGroup validation error:', { groupData });
      throw new Error('Name and userId are required');
    }

    const requestData = {
      name: groupData.name,
      description: groupData.description || '',
      userId: groupData.userId,
      interest: groupData.interest || 'programming'
    };

    try {
      console.log('Creating group - Request:', {
        url: `${API_URL}/groups`,
        method: 'POST',
        data: requestData
      });

      const response = await fetch(`${API_URL}/groups`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Create group error:', {
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack
        } : error,
        request: requestData
      });
      throw error;
    }
  },

  // Get user's groups
  getUserGroups: async (userId: string): Promise<Group[]> => {
    if (!userId) {
      console.error('getUserGroups validation error: missing userId');
      throw new Error('User ID is required');
    }

    try {
      const url = `${API_URL}/groups/user/${userId}`;
      console.log('Fetching groups - Request:', {
        url,
        method: 'GET'
      });

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      const groups = await handleResponse(response);
      console.log('Fetched groups result:', {
        userId,
        groupCount: groups?.length,
        groups
      });
      return groups;
    } catch (error) {
      console.error('Fetch groups error:', {
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack
        } : error,
        userId
      });
      throw error;
    }
  },

  // Join a group
  joinGroup: async (privateId: string, userId: string): Promise<Group> => {
    try {
      console.log('Joining group:', { privateId, userId });
      const response = await fetch(`${API_URL}/groups/join`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ privateId, userId }),
        credentials: 'include'
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Failed to join group:', error);
      throw error;
    }
  },

  // Update group call status
  updateGroupCall: async (groupId: string, activeCall: CallState | null): Promise<Group> => {
    try {
      console.log('Updating call status:', { groupId, activeCall });
      const response = await fetch(`${API_URL}/groups/${groupId}/call`, {
        method: 'PATCH',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ activeCall }),
        credentials: 'include'
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Failed to update call status:', error);
      throw error;
    }
  },

  // Delete a group
  deleteGroup: async (groupId: string): Promise<void> => {
    if (!groupId) {
      console.error('deleteGroup validation error: missing groupId');
      throw new Error('Group ID is required');
    }

    try {
      console.log('Deleting group:', { groupId });
      const response = await fetch(`${API_URL}/groups/${groupId}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      await handleResponse(response);
    } catch (error) {
      console.error('Failed to delete group:', error);
      throw error;
    }
  },
}; 