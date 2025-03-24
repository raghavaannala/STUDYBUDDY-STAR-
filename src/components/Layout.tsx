import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { useState } from 'react';

export function Layout({ children }: { children: React.ReactNode }) {
  const [showFounders, setShowFounders] = useState(false);

  const founders = [
    { id: 1, name: 'Raghava' },
    { id: 2, name: 'Deekshit' },
    { id: 3, name: 'Vikas' },
    { id: 4, name: 'Rajkumar' },
    { id: 5, name: 'Anji' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto p-4">
          <h1 
            className="text-2xl font-bold cursor-pointer hover:text-primary transition-colors"
            onClick={() => setShowFounders(true)}
          >
            <span className="italic">Study Buddy</span>
          </h1>
        </div>
      </header>

      <Dialog open={showFounders} onOpenChange={setShowFounders}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl mb-4">Our Founders</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {founders.map((founder) => (
              <div 
                key={founder.id}
                className="p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
              >
                <p className="text-lg">
                  {founder.id}. {founder.name}
                </p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <main>{children}</main>
    </div>
  );
} 