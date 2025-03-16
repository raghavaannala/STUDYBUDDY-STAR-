import React, { useState, useEffect } from 'react';
import { groupApi } from '../services/api';

export const TestGroups: React.FC = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const testUserId = 'test-user-123'; // We'll use this for testing

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Attempting to fetch groups...');
      const fetchedGroups = await groupApi.getUserGroups(testUserId);
      console.log('Fetched groups:', fetchedGroups);
      setGroups(fetchedGroups);
    } catch (err) {
      console.error('Error fetching groups:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch groups');
    } finally {
      setLoading(false);
    }
  };

  const createTestGroup = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Creating test group...');
      const newGroup = await groupApi.createGroup({
        name: 'Test Group ' + new Date().toISOString(),
        description: 'Test Description',
        userId: testUserId
      });
      console.log('Group created successfully:', newGroup);
      await fetchGroups();
    } catch (err) {
      console.error('Error creating group:', err);
      setError(err instanceof Error ? err.message : 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Test Groups Component</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={fetchGroups}
          disabled={loading}
          style={{ marginRight: '10px' }}
        >
          {loading ? 'Loading...' : 'Refresh Groups'}
        </button>

        <button 
          onClick={createTestGroup}
          disabled={loading}
        >
          Create Test Group
        </button>
      </div>

      {error && (
        <div style={{ color: 'red', marginBottom: '20px' }}>
          Error: {error}
        </div>
      )}

      <div>
        <h2>Groups ({groups.length}):</h2>
        {groups.map(group => (
          <div 
            key={group.id}
            style={{ 
              border: '1px solid #ccc',
              padding: '10px',
              marginBottom: '10px'
            }}
          >
            <h3>{group.name}</h3>
            <p>{group.description}</p>
            <p>Members: {group.members.join(', ')}</p>
            <p>Created by: {group.createdBy}</p>
            <p>Private ID: {group.privateId}</p>
          </div>
        ))}
      </div>
    </div>
  );
}; 