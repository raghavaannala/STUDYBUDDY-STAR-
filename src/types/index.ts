export interface CallState {
  initiator: string;
  participants: string[];
  startTime: Date;
}

export interface Group {
  id: string;
  privateId: string;
  name: string;
  description: string;
  interest: string;
  members: string[];
  createdAt: Date;
  createdBy: string;
  activeCall?: CallState;
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