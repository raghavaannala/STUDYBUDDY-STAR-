y
// API URL configuration
const API_URL = 'http://localhost:3001/api';

// Debug flag for development
const DEBUG = true;

import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  doc, 
  getDoc, 
  updateDoc, 
  arrayUnion,
  serverTimestamp,
  Timestamp,
  deleteDoc
} from 'firebase/firestore';
import { db, auth, checkFirebaseInitialized } from '@/config/firebase';

// Collection names as constants to avoid typos
const COLLECTIONS = {
  STUDY_GROUPS: 'studyGroups',
  GROUP_CHATS: 'groupChats'
};

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

// Add the correct interface to match the Groups component
interface Group {
  id: string;
  privateId: string;
  name: string;
  description: string;
  interest: string;
  members: string[];
  createdAt: Date;
  createdBy: string;
  activeCall?: {
    initiator: string;
    participants: string[];
    startTime: Date;
  };
}

interface CreateGroupParams {
  name: string;
  description: string;
  interest: string;
  userId: string;
}

interface CallState {
  initiator: string;
  participants: string[];
  startTime: Date;
}

// Firebase Firestore implementation
export const groupApi = {
  createGroup: async (params: CreateGroupParams): Promise<Group> => {
    const { name, description, interest, userId } = params;
    
    // Generate a 6-character private ID for sharing/joining
    const privateId = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    try {
      console.log('Creating group with data:', { name, description, interest, userId });
      
      // Check if Firebase is initialized
      if (!checkFirebaseInitialized()) {
        throw new Error('Firebase is not properly initialized. Please refresh the page and try again.');
      }
      
      // Check userId - this is critical
      if (!userId) {
        console.error('User ID is missing or invalid');
        throw new Error('Cannot create group: User ID is missing or invalid');
      }
      
      // Add document to Firestore
      const groupData = {
        privateId,
        name,
        description,
        interest,
        members: [userId],
        createdAt: serverTimestamp(),
        createdBy: userId
      };
      
      console.log('Initialized groupData:', groupData);
      console.log('Firestore db reference exists:', !!db);
      console.log('Firestore db object:', db);
      
      // Check if Firestore is properly initialized
      if (!db) {
        throw new Error('Firestore database is not initialized');
      }
      
      // Try with a specific error handler for the addDoc operation
      let docRef;
      try {
        console.log('Testing Firestore permissions...');
        
        // Log debugging info about the user
        console.log('Current auth state:', JSON.stringify({
          currentUser: auth?.currentUser ? {
            uid: auth.currentUser.uid,
            email: auth.currentUser.email,
            displayName: auth.currentUser.displayName
          } : null
        }));
        
        // Force a dummy write to test permissions first
        try {
          const testCollection = collection(db, 'permissions_test');
          await addDoc(testCollection, { test: true, timestamp: new Date() });
          console.log('Permissions test successful');
        } catch (permError) {
          console.error('Permission test failed:', permError);
          throw new Error(`Failed permissions test: ${permError instanceof Error ? permError.message : 'Unknown error'}`);
        }
        
        // Now proceed with the actual group creation
        console.log('Creating group in collection:', COLLECTIONS.STUDY_GROUPS);
        docRef = await addDoc(collection(db, COLLECTIONS.STUDY_GROUPS), groupData);
        console.log('Document created with reference ID:', docRef.id);
      } catch (addDocError) {
        console.error('Error in addDoc operation:', addDocError);
        
        if (addDocError.toString().includes('permission-denied') || 
            addDocError.toString().includes('Missing or insufficient permissions')) {
          throw new Error('Permission denied. You may need to sign in again or check your account permissions.');
        }
        
        throw new Error(`Failed to add document to Firestore: ${addDocError instanceof Error ? addDocError.message : 'Unknown error'}`);
      }
      
      // Get the document with the generated ID
      const newGroup: Group = {
        id: docRef.id,
        privateId,
        name,
        description,
        interest, 
        members: [userId],
        createdAt: new Date(),
        createdBy: userId
      };
      
      // Dispatch an event to notify other components
      window.dispatchEvent(new Event('studyGroupsUpdated'));
      
      if (DEBUG) {
        console.log('Created group:', newGroup);
      }
      
      return newGroup;
    } catch (error) {
      console.error('Error creating group:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }
      throw error;
    }
  },
  
  getUserGroups: async (userId: string): Promise<Group[]> => {
    try {
      console.log('Getting groups for user ID:', userId);

      // Check if Firebase is initialized
      if (!checkFirebaseInitialized()) {
        throw new Error('Firebase is not properly initialized. Please refresh the page and try again.');
      }
      
      // Check userId
      if (!userId) {
        console.error('User ID is missing or invalid');
        throw new Error('Cannot fetch groups: User ID is missing or invalid');
      }
      
      console.log('Querying Firestore for groups where user is a member:', userId);
      console.log('Using collection:', COLLECTIONS.STUDY_GROUPS);
      
      // Query Firestore for groups where the user is a member
      const q = query(
        collection(db, COLLECTIONS.STUDY_GROUPS), 
        where('members', 'array-contains', userId)
      );
      
      console.log('Executing Firestore query for user groups');
      const querySnapshot = await getDocs(q);
      const groups: Group[] = [];
      
      console.log('Query returned', querySnapshot.size, 'results');
      
      querySnapshot.forEach((doc) => {
        console.log('Processing group document:', doc.id);
        const data = doc.data();
        groups.push({
          id: doc.id,
          privateId: data.privateId,
          name: data.name,
          description: data.description,
          interest: data.interest,
          members: data.members,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
          createdBy: data.createdBy,
          activeCall: data.activeCall ? {
            initiator: data.activeCall.initiator,
            participants: data.activeCall.participants,
            startTime: data.activeCall.startTime instanceof Timestamp 
              ? data.activeCall.startTime.toDate() 
              : new Date(data.activeCall.startTime)
          } : undefined
        });
      });
      
      if (DEBUG) {
        console.log('Retrieved user groups:', groups);
      }
      
      return groups;
    } catch (error) {
      console.error('Error getting user groups:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }
      throw error;
    }
  },
  
  joinGroup: async (privateId: string, userId: string): Promise<Group> => {
    try {
      // Query for the group with the given privateId
      const q = query(
        collection(db, COLLECTIONS.STUDY_GROUPS), 
        where('privateId', '==', privateId.toUpperCase())
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('Group not found. Please check the code and try again.');
      }
      
      const groupDoc = querySnapshot.docs[0];
      const groupData = groupDoc.data();
      
      // Check if user is already a member
      if (groupData.members.includes(userId)) {
        throw new Error('You are already a member of this group.');
      }
      
      // Add user to group members
      const groupRef = doc(db, COLLECTIONS.STUDY_GROUPS, groupDoc.id);
      await updateDoc(groupRef, {
        members: arrayUnion(userId)
      });
      
      // Get the updated group
      const updatedGroupDoc = await getDoc(groupRef);
      const updatedData = updatedGroupDoc.data();
      
      if (!updatedData) {
        throw new Error('Failed to retrieve updated group data');
      }
      
      // Dispatch an event to notify other components
      window.dispatchEvent(new Event('studyGroupsUpdated'));
      
      const joinedGroup: Group = {
        id: groupDoc.id,
        privateId: updatedData.privateId,
        name: updatedData.name,
        description: updatedData.description,
        interest: updatedData.interest,
        members: updatedData.members,
        createdAt: updatedData.createdAt instanceof Timestamp 
          ? updatedData.createdAt.toDate() 
          : new Date(updatedData.createdAt),
        createdBy: updatedData.createdBy,
        activeCall: updatedData.activeCall ? {
          initiator: updatedData.activeCall.initiator,
          participants: updatedData.activeCall.participants,
          startTime: updatedData.activeCall.startTime instanceof Timestamp 
            ? updatedData.activeCall.startTime.toDate() 
            : new Date(updatedData.activeCall.startTime)
        } : undefined
      };
      
      if (DEBUG) {
        console.log('Joined group:', joinedGroup);
      }
      
      return joinedGroup;
    } catch (error) {
      console.error('Error joining group:', error);
      throw error;
    }
  },
  
  updateGroupCall: async (groupId: string, callState: CallState | null): Promise<Group> => {
    try {
      // Get reference to the group document
      const groupRef = doc(db, COLLECTIONS.STUDY_GROUPS, groupId);
      
      // Update call state
      if (callState) {
        await updateDoc(groupRef, {
          activeCall: {
            initiator: callState.initiator,
            participants: callState.participants,
            startTime: callState.startTime
          }
        });
      } else {
        await updateDoc(groupRef, {
          activeCall: null
        });
      }
      
      // Get the updated group
      const updatedGroupDoc = await getDoc(groupRef);
      const updatedData = updatedGroupDoc.data();
      
      if (!updatedData) {
        throw new Error('Failed to retrieve updated group data');
      }
      
      // Dispatch an event to notify other components
      window.dispatchEvent(new Event('studyGroupsUpdated'));
      
      const updatedGroup: Group = {
        id: groupId,
        privateId: updatedData.privateId,
        name: updatedData.name,
        description: updatedData.description,
        interest: updatedData.interest,
        members: updatedData.members,
        createdAt: updatedData.createdAt instanceof Timestamp 
          ? updatedData.createdAt.toDate() 
          : new Date(updatedData.createdAt),
        createdBy: updatedData.createdBy,
        activeCall: updatedData.activeCall ? {
          initiator: updatedData.activeCall.initiator,
          participants: updatedData.activeCall.participants,
          startTime: updatedData.activeCall.startTime instanceof Timestamp 
            ? updatedData.activeCall.startTime.toDate() 
            : new Date(updatedData.activeCall.startTime)
        } : undefined
      };
      
      if (DEBUG) {
        console.log('Updated group call:', updatedGroup);
      }
      
      return updatedGroup;
    } catch (error) {
      console.error('Error updating group call:', error);
      throw error;
    }
  },
  
  deleteGroup: async (groupId: string): Promise<void> => {
    try {
      // Check if Firebase is initialized
      if (!checkFirebaseInitialized()) {
        throw new Error('Firebase is not properly initialized. Please refresh the page and try again.');
      }
      
      // Get reference to the group document
      const groupRef = doc(db, COLLECTIONS.STUDY_GROUPS, groupId);
      
      // Delete the group document
      await deleteDoc(groupRef);
      
      // Dispatch an event to notify other components
      window.dispatchEvent(new Event('studyGroupsUpdated'));
      
      if (DEBUG) {
        console.log('Deleted group:', groupId);
      }
    } catch (error) {
      console.error('Error deleting group:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }
      throw error;
    }
  },
  
  updateGroup: async (groupId: string, updates: { name?: string; description?: string; interest?: string }): Promise<Group> => {
    try {
      // Check if Firebase is initialized
      if (!checkFirebaseInitialized()) {
        throw new Error('Firebase is not properly initialized. Please refresh the page and try again.');
      }
      
      // Get reference to the group document
      const groupRef = doc(db, COLLECTIONS.STUDY_GROUPS, groupId);
      
      // Update the group document
      await updateDoc(groupRef, updates);
      
      // Get the updated group
      const updatedGroupDoc = await getDoc(groupRef);
      const updatedData = updatedGroupDoc.data();
      
      if (!updatedData) {
        throw new Error('Failed to retrieve updated group data');
      }
      
      // Dispatch an event to notify other components
      window.dispatchEvent(new Event('studyGroupsUpdated'));
      
      const updatedGroup: Group = {
        id: groupId,
        privateId: updatedData.privateId,
        name: updatedData.name,
        description: updatedData.description,
        interest: updatedData.interest,
        members: updatedData.members,
        createdAt: updatedData.createdAt instanceof Timestamp 
          ? updatedData.createdAt.toDate() 
          : new Date(updatedData.createdAt),
        createdBy: updatedData.createdBy,
        activeCall: updatedData.activeCall ? {
          initiator: updatedData.activeCall.initiator,
          participants: updatedData.activeCall.participants,
          startTime: updatedData.activeCall.startTime instanceof Timestamp 
            ? updatedData.activeCall.startTime.toDate() 
            : new Date(updatedData.activeCall.startTime)
        } : undefined
      };
      
      if (DEBUG) {
        console.log('Updated group:', updatedGroup);
      }
      
      return updatedGroup;
    } catch (error) {
      console.error('Error updating group:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }
      throw error;
    }
  }
}; 