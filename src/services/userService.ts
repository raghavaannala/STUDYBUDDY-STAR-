import { rtdb, auth } from '@/config/firebase';
import { ref, set, get, update, query, orderByChild, equalTo } from 'firebase/database';
import { User } from 'firebase/auth';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: number;
  lastActive: number;
  bio?: string;
  interests?: string[];
  isOnline?: boolean;
}

export const createUserProfile = async (user: User): Promise<UserProfile> => {
  try {
    console.log(`[UserService] Creating profile for user: ${user.uid}`);
    
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || 'Anonymous User',
      photoURL: user.photoURL || undefined,
      createdAt: Date.now(),
      lastActive: Date.now(),
      isOnline: true
    };
    
    const userRef = ref(rtdb, `users/${user.uid}`);
    await set(userRef, userProfile);
    
    console.log(`[UserService] User profile created: ${user.uid}`);
    return userProfile;
  } catch (error) {
    console.error('[UserService] Error creating user profile:', error);
    throw error;
  }
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    console.log(`[UserService] Getting profile for user: ${uid}`);
    
    const userRef = ref(rtdb, `users/${uid}`);
    const snapshot = await get(userRef);
    
    if (!snapshot.exists()) {
      console.log(`[UserService] User profile not found: ${uid}`);
      return null;
    }
    
    return snapshot.val() as UserProfile;
  } catch (error) {
    console.error('[UserService] Error getting user profile:', error);
    return null;
  }
};

export const updateUserProfile = async (
  uid: string, 
  updates: Partial<UserProfile>
): Promise<UserProfile | null> => {
  try {
    console.log(`[UserService] Updating profile for user: ${uid}`);
    
    // Don't allow updating the UID or creation timestamp
    const { uid: _, createdAt: __, ...validUpdates } = updates;
    
    // Always update the lastActive timestamp
    validUpdates.lastActive = Date.now();
    
    const userRef = ref(rtdb, `users/${uid}`);
    await update(userRef, validUpdates);
    
    // Get the updated profile
    const snapshot = await get(userRef);
    
    if (!snapshot.exists()) {
      console.log(`[UserService] User profile not found after update: ${uid}`);
      return null;
    }
    
    console.log(`[UserService] User profile updated: ${uid}`);
    return snapshot.val() as UserProfile;
  } catch (error) {
    console.error('[UserService] Error updating user profile:', error);
    return null;
  }
};

export const setUserOnlineStatus = async (uid: string, isOnline: boolean): Promise<boolean> => {
  try {
    console.log(`[UserService] Setting user ${uid} online status to: ${isOnline}`);
    
    const userRef = ref(rtdb, `users/${uid}`);
    await update(userRef, {
      isOnline,
      lastActive: Date.now()
    });
    
    console.log(`[UserService] User online status updated: ${uid}`);
    return true;
  } catch (error) {
    console.error('[UserService] Error updating user online status:', error);
    return false;
  }
};

export const searchUsers = async (query: string): Promise<UserProfile[]> => {
  try {
    console.log(`[UserService] Searching users with query: ${query}`);
    
    if (!query || query.length < 2) {
      return [];
    }
    
    const usersRef = ref(rtdb, 'users');
    const snapshot = await get(usersRef);
    
    if (!snapshot.exists()) {
      return [];
    }
    
    const users: UserProfile[] = [];
    const lowercaseQuery = query.toLowerCase();
    
    snapshot.forEach((childSnapshot) => {
      const user = childSnapshot.val() as UserProfile;
      
      // Simple case-insensitive matching on displayName or email
      if (
        user.displayName.toLowerCase().includes(lowercaseQuery) ||
        user.email.toLowerCase().includes(lowercaseQuery)
      ) {
        users.push(user);
      }
    });
    
    console.log(`[UserService] Found ${users.length} users matching query`);
    return users;
  } catch (error) {
    console.error('[UserService] Error searching users:', error);
    return [];
  }
}; 