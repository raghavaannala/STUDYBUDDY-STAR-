import { CodeDiploMate } from '../components/CodeDiploMate';

export default function CodeAssistant() {
  return (
    <div className="min-h-screen bg-background pt-20">
      <header className="border-b">
        <div className="container mx-auto py-4">
          <h1 className="text-2xl font-bold">Code Assistant</h1>
          <p className="text-muted-foreground">Your AI coding companion powered by Gemini</p>
        </div>
      </header>
      <main className="py-6">
        <CodeDiploMate />
      </main>
    </div>
  );
} 