export interface CallState {
  id: string;
  startedAt: string;
  participants: string[];
  status: 'active' | 'ended';
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  members: string[];
  privateId: string;
  activeCall?: CallState | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  groupId: string;
  userId: string;
  content: string;
  timestamp: Date;
  userName: string;
  isBot?: boolean;
} 