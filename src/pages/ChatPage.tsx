import { Chat } from '../components/Chat';
import { useEffect } from 'react';

export default function ChatPage() {
  useEffect(() => {
    console.log('ChatPage mounted');
  }, []);

  return (
    <div className="min-h-screen bg-background" style={{ border: '2px solid red' }}>
      <header className="border-b">
        <div className="container mx-auto py-4">
          <h1 className="text-2xl font-bold">Study Buddy Chat</h1>
          <p className="text-muted-foreground">Collaborate and learn together</p>
        </div>
      </header>
      <main className="container mx-auto py-6">
        <Chat />
      </main>
    </div>
  );
} 