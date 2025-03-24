import { rtdb, auth } from '@/config/firebase';
import { ref, push, set, get, remove, update, query, orderByChild, equalTo } from 'firebase/database';
import { v4 as uuidv4 } from 'uuid';

export interface Group {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: number;
  members: string[];
  code: string;
  isPublic: boolean;
  tags?: string[];
  activeCall?: {
    initiatedBy: string;
    startedAt: number;
    participants: string[];
    isAudioOnly: boolean;
  };
}

export const createGroup = async (
  nameOrOptions: string | {
    name: string;
    description: string;
    interest?: string;
    privateId?: string;
  },
  description?: string,
  isPublic: boolean = true,
  tags: string[] = []
): Promise<Group> => {
  try {
    let name: string;
    let desc: string;
    
    if (typeof nameOrOptions === 'object') {
      name = nameOrOptions.name;
      desc = nameOrOptions.description;
      // We ignore interest and privateId in the new implementation
    } else {
      name = nameOrOptions;
      desc = description || '';
    }
    
    console.log(`[GroupService] Creating new group: ${name}`);
    
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error('User is not authenticated');
    }
    
    // Generate a unique 6-character group code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const newGroup: Group = {
      id: uuidv4(),
      name,
      description: desc,
      createdBy: userId,
      createdAt: Date.now(),
      members: [userId],
      code,
      isPublic,
      tags
    };
    
    const groupRef = ref(rtdb, `groups/${newGroup.id}`);
    await set(groupRef, newGroup);
    
    console.log(`[GroupService] Group created with ID: ${newGroup.id}`);
    return newGroup;
  } catch (error) {
    console.error('[GroupService] Error creating group:', error);
    throw error;
  }
};

export const getGroupById = async (groupId: string): Promise<Group | null> => {
  try {
    console.log(`[GroupService] Getting group by ID: ${groupId}`);
    
    const groupRef = ref(rtdb, `groups/${groupId}`);
    const snapshot = await get(groupRef);
    
    if (!snapshot.exists()) {
      console.log(`[GroupService] Group not found: ${groupId}`);
      return null;
    }
    
    return snapshot.val() as Group;
  } catch (error) {
    console.error('[GroupService] Error getting group:', error);
    return null;
  }
};

export const getGroupByCode = async (code: string): Promise<Group | null> => {
  try {
    console.log(`[GroupService] Getting group by code: ${code}`);
    
    const groupsRef = ref(rtdb, 'groups');
    const groupQuery = query(groupsRef, orderByChild('code'), equalTo(code));
    
    const snapshot = await get(groupQuery);
    
    if (!snapshot.exists()) {
      console.log(`[GroupService] No group found with code: ${code}`);
      return null;
    }
    
    let group: Group | null = null;
    
    snapshot.forEach((childSnapshot) => {
      group = childSnapshot.val() as Group;
      return true; // Break the forEach loop
    });
    
    return group;
  } catch (error) {
    console.error('[GroupService] Error getting group by code:', error);
    return null;
  }
};

export const getUserGroups = async (userId: string): Promise<Group[]> => {
  try {
    console.log(`[GroupService] Getting groups for user: ${userId}`);
    
    const groupsRef = ref(rtdb, 'groups');
    const snapshot = await get(groupsRef);
    
    if (!snapshot.exists()) {
      return [];
    }
    
    const groups: Group[] = [];
    
    snapshot.forEach((childSnapshot) => {
      const group = childSnapshot.val() as Group;
      if (group.members.includes(userId)) {
        groups.push(group);
      }
    });
    
    console.log(`[GroupService] Found ${groups.length} groups for user`);
    return groups;
  } catch (error) {
    console.error('[GroupService] Error getting user groups:', error);
    return [];
  }
};

export const joinGroupByCode = async (code: string): Promise<Group | null> => {
  try {
    // Clean up the code by removing any whitespace and converting to uppercase
    const cleanCode = code.trim().toUpperCase();
    console.log(`[GroupService] Joining group with code: ${cleanCode} (original: ${code})`);
    
    const userId = auth.currentUser?.uid;
    if (!userId) {
      console.error('[GroupService] User is not authenticated');
      throw new Error('User is not authenticated');
    }
    
    // Debug - log groups in database
    const groupsRef = ref(rtdb, 'groups');
    const groupsSnapshot = await get(groupsRef);
    
    if (!groupsSnapshot.exists()) {
      console.log('[GroupService] No groups found in database');
      return null;
    }
    
    console.log('[GroupService] Groups in database:');
    let foundGroup = null;
    
    const groups = groupsSnapshot.val();
    Object.entries(groups).forEach(([id, groupData]: [string, any]) => {
      console.log(`[GroupService] Group: ${id}, Code: ${groupData.code}`);
      if (groupData.code === cleanCode) {
        console.log(`[GroupService] Found matching group: ${id} with code ${cleanCode}`);
        foundGroup = { id, ...groupData };
      }
    });
    
    if (foundGroup) {
      console.log(`[GroupService] Using found group: ${foundGroup.id} with code ${foundGroup.code}`);
      const group = foundGroup;
      
      if (group.members.includes(userId)) {
        console.log(`[GroupService] User already a member of group: ${group.id}`);
        return group;
      }
      
      // Add user to members
      const updatedMembers = [...group.members, userId];
      
      const groupRef = ref(rtdb, `groups/${group.id}`);
      await update(groupRef, {
        members: updatedMembers
      });
      
      console.log(`[GroupService] User ${userId} joined group: ${group.id}`);
      return {
        ...group,
        members: updatedMembers
      };
    }
    
    // If code wasn't found in direct loop, try the original getGroupByCode method
    console.log(`[GroupService] Trying fallback method for code: ${cleanCode}`);
    const group = await getGroupByCode(cleanCode);
    
    if (!group) {
      console.log(`[GroupService] No group found with code: ${cleanCode}`);
      return null;
    }
    
    if (group.members.includes(userId)) {
      console.log(`[GroupService] User already a member of group: ${group.id}`);
      return group;
    }
    
    // Add user to members
    const updatedMembers = [...group.members, userId];
    
    const groupRef = ref(rtdb, `groups/${group.id}`);
    await update(groupRef, {
      members: updatedMembers
    });
    
    console.log(`[GroupService] User ${userId} joined group: ${group.id}`);
    return {
      ...group,
      members: updatedMembers
    };
  } catch (error) {
    console.error('[GroupService] Error joining group:', error);
    return null;
  }
};

export const leaveGroup = async (groupId: string): Promise<boolean> => {
  try {
    console.log(`[GroupService] Leaving group: ${groupId}`);
    
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error('User is not authenticated');
    }
    
    const group = await getGroupById(groupId);
    
    if (!group) {
      console.log(`[GroupService] Group not found: ${groupId}`);
      return false;
    }
    
    if (!group.members.includes(userId)) {
      console.log(`[GroupService] User not a member of group: ${groupId}`);
      return false;
    }
    
    // Remove user from members
    const updatedMembers = group.members.filter(memberId => memberId !== userId);
    
    const groupRef = ref(rtdb, `groups/${group.id}`);
    
    // If there are no members left, delete the group
    if (updatedMembers.length === 0) {
      await remove(groupRef);
      console.log(`[GroupService] Group deleted: ${groupId}`);
      return true;
    }
    
    // Update the group with the new members list
    await update(groupRef, {
      members: updatedMembers
    });
    
    console.log(`[GroupService] User ${userId} left group: ${groupId}`);
    return true;
  } catch (error) {
    console.error('[GroupService] Error leaving group:', error);
    return false;
  }
};

export const deleteGroup = async (groupId: string): Promise<boolean> => {
  try {
    console.log(`[GroupService] Deleting group: ${groupId}`);
    
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error('User is not authenticated');
    }
    
    const group = await getGroupById(groupId);
    
    if (!group) {
      console.log(`[GroupService] Group not found: ${groupId}`);
      return false;
    }
    
    if (group.createdBy !== userId) {
      console.log(`[GroupService] User not authorized to delete group: ${groupId}`);
      return false;
    }
    
    // Delete the group
    const groupRef = ref(rtdb, `groups/${groupId}`);
    await remove(groupRef);
    
    // Also delete associated chat messages
    const chatRef = ref(rtdb, `chats/${groupId}`);
    await remove(chatRef);
    
    console.log(`[GroupService] Group deleted: ${groupId}`);
    return true;
  } catch (error) {
    console.error('[GroupService] Error deleting group:', error);
    return false;
  }
};

export const startGroupCall = async (
  groupId: string, 
  isAudioOnly: boolean = false
): Promise<boolean> => {
  try {
    console.log(`[GroupService] Starting ${isAudioOnly ? 'audio' : 'video'} call in group: ${groupId}`);
    
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error('User is not authenticated');
    }
    
    const group = await getGroupById(groupId);
    
    if (!group) {
      console.log(`[GroupService] Group not found: ${groupId}`);
      return false;
    }
    
    if (!group.members.includes(userId)) {
      console.log(`[GroupService] User not a member of group: ${groupId}`);
      return false;
    }
    
    // Update group with active call info
    const groupRef = ref(rtdb, `groups/${groupId}`);
    await update(groupRef, {
      activeCall: {
        initiatedBy: userId,
        startedAt: Date.now(),
        participants: [userId],
        isAudioOnly
      }
    });
    
    console.log(`[GroupService] ${isAudioOnly ? 'Audio' : 'Video'} call started in group: ${groupId}`);
    return true;
  } catch (error) {
    console.error('[GroupService] Error starting call:', error);
    return false;
  }
};

export const endGroupCall = async (groupId: string): Promise<boolean> => {
  try {
    console.log(`[GroupService] Ending call in group: ${groupId}`);
    
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error('User is not authenticated');
    }
    
    const group = await getGroupById(groupId);
    
    if (!group) {
      console.log(`[GroupService] Group not found: ${groupId}`);
      return false;
    }
    
    if (!group.activeCall) {
      console.log(`[GroupService] No active call in group: ${groupId}`);
      return true; // Already ended
    }
    
    // Only the initiator or group creator can end the call
    if (group.activeCall.initiatedBy !== userId && group.createdBy !== userId) {
      console.log(`[GroupService] User not authorized to end call: ${groupId}`);
      return false;
    }
    
    // Remove the active call
    const groupRef = ref(rtdb, `groups/${groupId}`);
    await update(groupRef, {
      activeCall: null
    });
    
    // Clean up call signaling data
    const callRef = ref(rtdb, `calls/${groupId}`);
    await remove(callRef);
    
    console.log(`[GroupService] Call ended in group: ${groupId}`);
    return true;
  } catch (error) {
    console.error('[GroupService] Error ending call:', error);
    return false;
  }
}; 