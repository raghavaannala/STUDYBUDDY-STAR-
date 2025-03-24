import { useState, useEffect } from 'react';
import { db, auth, googleProvider, checkFirebaseInitialized } from '@/config/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { signInWithPopup, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const COLLECTIONS = {
  STUDY_GROUPS: 'studyGroups',
  GROUP_CHATS: 'groupChats',
  TEST: 'test_collection'
};

const FirestoreTest = () => {
  const [user, setUser] = useState<any>(null);
  const [testResult, setTestResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [documents, setDocuments] = useState<any[]>([]);
  const [groupName, setGroupName] = useState('Test Group');
  const [groupDesc, setGroupDesc] = useState('Test Description');
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);

  // Check Firebase initialization
  useEffect(() => {
    const ready = checkFirebaseInitialized();
    setIsFirebaseReady(ready);
    if (!ready) {
      setError('Firebase is not properly initialized');
    } else {
      setTestResult('Firebase initialized and ready');
    }
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    if (!isFirebaseReady) return;

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setTestResult(`Signed in as ${currentUser.displayName || currentUser.email}`);
      } else {
        setTestResult('Not signed in');
      }
    });

    return () => unsubscribe();
  }, [isFirebaseReady]);

  const signIn = async () => {
    if (!isFirebaseReady) {
      setError('Firebase is not initialized');
      return;
    }

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
    if (!isFirebaseReady) return;
    
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setTestResult('Signed out successfully');
    } catch (err) {
      setError(`Error signing out: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const testWrite = async () => {
    if (!isFirebaseReady) {
      setError('Firebase is not initialized');
      return;
    }

    setError('');
    setTestResult('Testing Firestore write...');
    
    try {
      if (!user) {
        setError('Please sign in first');
        return;
      }
      
      // Try to add a document to test collection
      const docData = {
        text: 'Test document',
        createdAt: new Date(),
        userId: user.uid
      };
      
      const docRef = await addDoc(collection(db, COLLECTIONS.TEST), docData);
      setTestResult(`Successfully wrote to Firestore. Document ID: ${docRef.id}`);
    } catch (err) {
      console.error('Firestore write error:', err);
      setError(`Write error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const testRead = async () => {
    if (!isFirebaseReady) {
      setError('Firebase is not initialized');
      return;
    }

    setError('');
    setTestResult('Testing Firestore read...');
    
    try {
      // Get all documents from test collection
      const querySnapshot = await getDocs(collection(db, COLLECTIONS.TEST));
      
      const docs: any[] = [];
      querySnapshot.forEach((doc) => {
        docs.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setDocuments(docs);
      setTestResult(`Found ${docs.length} documents in test collection`);
    } catch (err) {
      console.error('Firestore read error:', err);
      setError(`Read error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const createGroup = async () => {
    if (!isFirebaseReady) {
      setError('Firebase is not initialized');
      return;
    }

    setError('');
    setTestResult('Creating group...');
    
    try {
      if (!user) {
        setError('Please sign in first');
        return;
      }
      
      // Create group data
      const groupData = {
        name: groupName,
        description: groupDesc,
        privateId: Math.random().toString(36).substring(2, 8).toUpperCase(),
        members: [user.uid],
        createdAt: new Date(),
        createdBy: user.uid
      };
      
      // Add to Firestore
      const docRef = await addDoc(collection(db, COLLECTIONS.STUDY_GROUPS), groupData);
      setTestResult(`Group created successfully! ID: ${docRef.id}`);
    } catch (err) {
      console.error('Group creation error:', err);
      setError(`Group creation error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const getGroups = async () => {
    if (!isFirebaseReady) {
      setError('Firebase is not initialized');
      return;
    }

    setError('');
    setTestResult('Getting groups...');
    
    try {
      if (!user) {
        setError('Please sign in first');
        return;
      }
      
      // Query for user's groups
      const q = query(
        collection(db, COLLECTIONS.STUDY_GROUPS),
        where('members', 'array-contains', user.uid)
      );
      
      const querySnapshot = await getDocs(q);
      
      const groupDocs: any[] = [];
      querySnapshot.forEach((doc) => {
        groupDocs.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setDocuments(groupDocs);
      setTestResult(`Found ${groupDocs.length} groups for user`);
    } catch (err) {
      console.error('Get groups error:', err);
      setError(`Get groups error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <Card className="w-full max-w-xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Firestore Test Panel</CardTitle>
        <CardDescription>Test Firebase and Firestore functionality</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 p-3 rounded text-sm">
          <p><strong>Firebase Status:</strong> {isFirebaseReady ? '✅ Ready' : '❌ Not initialized'}</p>
          <p><strong>Auth Status:</strong> {user ? `✅ Signed in as ${user.displayName}` : '❌ Not signed in'}</p>
        </div>
        
        {!user ? (
          <Button onClick={signIn} variant="default" className="w-full">Sign in</Button>
        ) : (
          <div className="space-y-2">
            <Button onClick={signOut} variant="outline" className="w-full">Sign out</Button>
            
            <div className="flex flex-col space-y-2 pt-4">
              <h3 className="font-medium">Basic Firestore Tests</h3>
              <div className="flex gap-2">
                <Button onClick={testWrite} variant="outline" className="flex-1">Test Write</Button>
                <Button onClick={testRead} variant="outline" className="flex-1">Test Read</Button>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2 pt-4">
              <h3 className="font-medium">Group Tests</h3>
              
              <div className="space-y-2">
                <Label htmlFor="groupName">Group Name</Label>
                <Input 
                  id="groupName"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="groupDesc">Description</Label>
                <Input 
                  id="groupDesc"
                  value={groupDesc}
                  onChange={(e) => setGroupDesc(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={createGroup} variant="default" className="flex-1">Create Group</Button>
                <Button onClick={getGroups} variant="outline" className="flex-1">Get Groups</Button>
              </div>
            </div>
          </div>
        )}
        
        {testResult && (
          <div className="p-3 bg-green-50 rounded-md text-green-800 text-sm whitespace-pre-wrap">
            {testResult}
          </div>
        )}
        
        {error && (
          <div className="p-3 bg-red-50 rounded-md text-red-800 text-sm">
            {error}
          </div>
        )}
        
        {documents.length > 0 && (
          <div className="pt-4">
            <h3 className="font-medium mb-2">Results ({documents.length})</h3>
            <div className="max-h-60 overflow-y-auto border rounded-md p-2">
              {documents.map((doc) => (
                <div key={doc.id} className="p-2 mb-2 bg-gray-50 rounded text-xs">
                  <div><strong>ID:</strong> {doc.id}</div>
                  {Object.entries(doc).filter(([key]) => key !== 'id').map(([key, value]) => (
                    <div key={key}>
                      <strong>{key}:</strong> {JSON.stringify(value)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-sm text-gray-500">
        Check the console for detailed logs
      </CardFooter>
    </Card>
  );
};

export default FirestoreTest; 