import { v4 as uuidv4 } from 'uuid';

interface GroupMember {
  id: string;
  name: string;
  joinedAt: Date;
}

interface CollaborativeGroup {
  id: string;
  name: string;
  pin: string;
  createdAt: Date;
  members: GroupMember[];
  messages: GroupMessage[];
}

interface GroupMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
}

class CollaborateGroupService {
  private groups: Map<string, CollaborativeGroup>;
  private storage: Storage;
  private readonly STORAGE_KEY = 'collaborate_groups';

  constructor() {
    this.groups = new Map();
    this.storage = window.localStorage;
    this.loadGroups();
  }

  private loadGroups(): void {
    const storedGroups = this.storage.getItem(this.STORAGE_KEY);
    if (storedGroups) {
      const parsedGroups = JSON.parse(storedGroups);
      parsedGroups.forEach((group: CollaborativeGroup) => {
        // Convert string dates back to Date objects
        group.createdAt = new Date(group.createdAt);
        group.members.forEach(member => {
          member.joinedAt = new Date(member.joinedAt);
        });
        group.messages.forEach(message => {
          message.timestamp = new Date(message.timestamp);
        });
        this.groups.set(group.id, group);
      });
    }
  }

  private saveGroups(): void {
    const groupsArray = Array.from(this.groups.values());
    this.storage.setItem(this.STORAGE_KEY, JSON.stringify(groupsArray));
  }

  private generatePin(): string {
    // Generate a 6-digit PIN
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  createGroup(name: string, creatorName: string): { group: CollaborativeGroup; pin: string } {
    const pin = this.generatePin();
    const creatorId = uuidv4();
    
    const newGroup: CollaborativeGroup = {
      id: uuidv4(),
      name,
      pin,
      createdAt: new Date(),
      members: [{
        id: creatorId,
        name: creatorName,
        joinedAt: new Date()
      }],
      messages: []
    };

    this.groups.set(newGroup.id, newGroup);
    this.saveGroups();

    return { group: newGroup, pin };
  }

  joinGroup(pin: string, memberName: string): CollaborativeGroup {
    const group = Array.from(this.groups.values()).find(g => g.pin === pin);
    if (!group) {
      throw new Error('Group not found. Please check the PIN and try again.');
    }

    const newMember: GroupMember = {
      id: uuidv4(),
      name: memberName,
      joinedAt: new Date()
    };

    group.members.push(newMember);
    this.saveGroups();

    return group;
  }

  sendMessage(groupId: string, senderId: string, content: string): GroupMessage {
    const group = this.groups.get(groupId);
    if (!group) {
      throw new Error('Group not found');
    }

    const sender = group.members.find(member => member.id === senderId);
    if (!sender) {
      throw new Error('Sender not found in group');
    }

    const newMessage: GroupMessage = {
      id: uuidv4(),
      senderId,
      senderName: sender.name,
      content,
      timestamp: new Date()
    };

    group.messages.push(newMessage);
    this.saveGroups();

    return newMessage;
  }

  getGroupMessages(groupId: string): GroupMessage[] {
    const group = this.groups.get(groupId);
    if (!group) {
      throw new Error('Group not found');
    }
    return [...group.messages];
  }

  getGroupMembers(groupId: string): GroupMember[] {
    const group = this.groups.get(groupId);
    if (!group) {
      throw new Error('Group not found');
    }
    return [...group.members];
  }

  leaveGroup(groupId: string, memberId: string): void {
    const group = this.groups.get(groupId);
    if (!group) {
      throw new Error('Group not found');
    }

    const memberIndex = group.members.findIndex(member => member.id === memberId);
    if (memberIndex === -1) {
      throw new Error('Member not found in group');
    }

    group.members.splice(memberIndex, 1);

    // If no members left, delete the group
    if (group.members.length === 0) {
      this.groups.delete(groupId);
    }

    this.saveGroups();
  }
}

export const collaborateGroupService = new CollaborateGroupService(); 