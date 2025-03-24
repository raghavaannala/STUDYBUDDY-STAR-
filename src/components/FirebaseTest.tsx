import { useState, useEffect } from 'react';
import { db, auth, googleProvider } from '@/config/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { groupApi } from '@/services/api';

// This will give us access to the correct collection names
const COLLECTIONS = {
  STUDY_GROUPS: 'studyGroups',
  GROUP_CHATS: 'groupChats'
};

const FirebaseTest = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [groups, setGroups] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setTestResult(`Signed in as ${currentUser.displayName || currentUser.email}`);
      } else {
        setTestResult('Not signed in');
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setError('');
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      setTestResult(`Successfully signed in as ${result.user.displayName || result.user.email}`);
    } catch (err) {
      console.error('Sign in error:', err);
      setError(`Error signing in: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const signOut = async () => {
    try {
      await auth.signOut();
      setUser(null);
      setTestResult('Signed out successfully');
    } catch (err) {
      setError(`Error signing out: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const testFirestore = async () => {
    setTestResult('');
    setError('');
    
    try {
      // Check if db is initialized
      if (!db) {
        throw new Error('Firestore is not initialized');
      }
      
      if (!auth.currentUser) {
        setTestResult('Please sign in first to test Firestore permissions');
        return;
      }
      
      setTestResult('Testing Firestore connection...');
      
      // Try to add a test document
      const testCollection = collection(db, 'test_collection');
      const docRef = await addDoc(testCollection, {
        testField: 'This is a test',
        timestamp: new Date(),
        userId: auth.currentUser.uid
      });
      
      setTestResult(prev => prev + `\nSuccessfully added document with ID: ${docRef.id}`);
      
      // Success
      setTestResult(prev => prev + '\nFirestore connection is working!');
    } catch (err) {
      console.error('Firebase test error:', err);
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const testGroups = async () => {
    setGroups([]);
    setError('');
    
    try {
      // Check if db is initialized
      if (!db) {
        throw new Error('Firestore is not initialized');
      }
      
      // Get all documents from studyGroups collection - using the constant
      const studyGroupsCollection = collection(db, COLLECTIONS.STUDY_GROUPS);
      const querySnapshot = await getDocs(studyGroupsCollection);
      
      const groupsData: any[] = [];
      querySnapshot.forEach((doc) => {
        groupsData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setGroups(groupsData);
      
      if (groupsData.length === 0) {
        setTestResult('No study groups found. Try creating one!');
      } else {
        setTestResult(`Found ${groupsData.length} study groups`);
      }
    } catch (err) {
      console.error('Group test error:', err);
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Firebase Connection Test</CardTitle>
        <CardDescription>Test your Firebase connection and authentication</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2">
          {!user ? (
            <Button onClick={signInWithGoogle} variant="default">Sign in with Google</Button>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="p-2 bg-green-50 rounded-md">
                <p>Signed in as: {user.displayName || user.email}</p>
                <p className="text-xs">User ID: {user.uid}</p>
              </div>
              <Button onClick={signOut} variant="outline">Sign Out</Button>
              <Button onClick={testFirestore} variant="outline">Test Firestore Connection</Button>
              <Button onClick={testGroups} variant="outline">Test Study Groups</Button>
            </div>
          )}
        </div>
        
        {testResult && (
          <div className="p-4 bg-green-50 rounded-md text-green-800 whitespace-pre-wrap">
            {testResult}
          </div>
        )}
        
        {error && (
          <div className="p-4 bg-red-50 rounded-md text-red-800">
            {error}
          </div>
        )}
        
        {groups.length > 0 && (
          <div className="mt-4">
            <h3 className="font-medium text-lg mb-2">Study Groups:</h3>
            <ul className="space-y-2">
              {groups.map((group) => (
                <li key={group.id} className="p-2 bg-gray-50 rounded-md">
                  <p className="font-medium">{group.name}</p>
                  <p className="text-sm text-gray-600">{group.description}</p>
                  <p className="text-xs text-gray-500">ID: {group.id} | Join Code: {group.privateId}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-sm text-gray-500">
        Check the console for detailed logs
      </CardFooter>
    </Card>
  );
};

export default FirebaseTest; 