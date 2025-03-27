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
    
    // Generate a simple 6-digit numeric code that's easier to share
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
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
    // Clean up the code - no need to convert to uppercase since we're using numeric codes now
    const cleanCode = code.trim();
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

// Join an existing group call
export const joinGroupCall = async (groupId: string): Promise<boolean> => {
  try {
    if (!auth.currentUser) {
      console.error("[groupService] Cannot join call: No authenticated user");
      return false;
    }

    // Get a reference to the group
    const groupRef = ref(rtdb, `groups/${groupId}`);
    const snapshot = await get(groupRef);
    
    if (!snapshot.exists()) {
      console.error(`[groupService] Group not found: ${groupId}`);
      return false;
    }
    
    const groupData = snapshot.val();
    
    // Check if there's an active call
    if (!groupData.activeCall) {
      console.error(`[groupService] No active call in group: ${groupId}`);
      return false;
    }
    
    // Get current participants
    const participants = groupData.activeCall.participants || [];
    
    // Add current user if not already in the call
    if (!participants.includes(auth.currentUser.uid)) {
      // Update participants array
      const updatedParticipants = [...participants, auth.currentUser.uid];
      
      // Update the group data with the new participant
      await update(ref(rtdb, `groups/${groupId}/activeCall`), {
        participants: updatedParticipants
      });
      
      console.log(`[groupService] User joined call in group: ${groupId}`);
    } else {
      console.log(`[groupService] User already in call for group: ${groupId}`);
    }
    
    return true;
  } catch (error) {
    console.error("[groupService] Error joining group call:", error);
    return false;
  }
};

// Get all public groups
export const getPublicGroups = async (): Promise<Group[]> => {
  try {
    console.log('[GroupService] Getting all public groups');
    
    const groupsRef = ref(rtdb, 'groups');
    const snapshot = await get(groupsRef);
    
    if (!snapshot.exists()) {
      console.log('[GroupService] No groups found in database');
      return [];
    }
    
    const groups: Group[] = [];
    
    snapshot.forEach((childSnapshot) => {
      const group = childSnapshot.val() as Group;
      if (group.isPublic) {
        groups.push(group);
      }
    });
    
    console.log(`[GroupService] Found ${groups.length} public groups`);
    return groups;
  } catch (error) {
    console.error('[GroupService] Error getting public groups:', error);
    return [];
  }
};

// Search groups by interest/tag
export const searchGroupsByInterest = async (interest: string): Promise<Group[]> => {
  try {
    console.log(`[GroupService] Searching groups with interest: ${interest}`);
    
    if (!interest.trim()) {
      return await getPublicGroups();
    }
    
    const groupsRef = ref(rtdb, 'groups');
    const snapshot = await get(groupsRef);
    
    if (!snapshot.exists()) {
      console.log('[GroupService] No groups found in database');
      return [];
    }
    
    const groups: Group[] = [];
    const searchTerm = interest.toLowerCase().trim();
    
    snapshot.forEach((childSnapshot) => {
      const group = childSnapshot.val() as Group;
      
      // Only include public groups
      if (!group.isPublic) return;
      
      // Check if any tag matches
      const hasTags = group.tags && group.tags.some(tag => 
        tag.toLowerCase().includes(searchTerm) || searchTerm.includes(tag.toLowerCase())
      );
      
      // Check if name or description matches
      const nameMatches = group.name.toLowerCase().includes(searchTerm);
      const descriptionMatches = group.description.toLowerCase().includes(searchTerm);
      
      if (hasTags || nameMatches || descriptionMatches) {
        groups.push(group);
      }
    });
    
    console.log(`[GroupService] Found ${groups.length} groups matching interest: ${interest}`);
    return groups;
  } catch (error) {
    console.error('[GroupService] Error searching groups by interest:', error);
    return [];
  }
}; 