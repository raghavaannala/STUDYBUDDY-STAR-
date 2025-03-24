import { useState, useEffect } from 'react';
import { db } from '@/config/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  serverTimestamp,
  DocumentData 
} from 'firebase/firestore';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface Group {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  members: string[];
  privateId: string;
  createdAt: string;
  updatedAt: string;
}

export function TestGroups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const testUserId = 'test-user-123'; // This would normally come from authentication

  const convertFirestoreDoc = (doc: { id: string; data: () => DocumentData }): Group => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      description: data.description || '',
      createdBy: data.createdBy,
      members: data.members,
      privateId: data.privateId,
      createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate().toISOString() || new Date().toISOString()
    };
  };

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError('');
      
      const groupsQuery = query(
        collection(db, 'groups'),
        where('members', 'array-contains', testUserId)
      );

      const querySnapshot = await getDocs(groupsQuery);
      const fetchedGroups = querySnapshot.docs.map(convertFirestoreDoc);
      
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
      
      const groupData = {
        name: `Test Group ${new Date().toLocaleTimeString()}`,
        description: 'A test study group',
        createdBy: testUserId,
        members: [testUserId],
        privateId: Math.random().toString(36).substring(2, 8),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'groups'), groupData);
      console.log('Created group with ID:', docRef.id);
      
      // Fetch updated groups list
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
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Test Groups</h1>
        <div className="space-x-4">
          <Button 
            onClick={createTestGroup} 
            disabled={loading}
          >
            Create Test Group
          </Button>
          <Button 
            onClick={fetchGroups} 
            disabled={loading}
            variant="outline"
          >
            Refresh Groups
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : groups.length === 0 ? (
        <div className="text-center text-gray-500">No groups found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map(group => (
            <Card key={group.id} className="p-4">
              <h3 className="font-bold mb-2">{group.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{group.description}</p>
              <p className="text-xs text-gray-500">
                Created: {new Date(group.createdAt).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">
                Members: {group.members.length}
              </p>
              <p className="text-xs text-gray-500">
                Private ID: {group.privateId}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 