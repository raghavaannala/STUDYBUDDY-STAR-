import { Card } from '@/components/ui/card';
import FadeIn from '@/components/animations/FadeIn';

export default function Settings() {
  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-8">
        <FadeIn>
          <h1 className="text-3xl font-bold mb-8">Settings</h1>
          
          <Card className="p-6 max-w-md">
            <h2 className="text-xl font-semibold mb-6">General Settings</h2>
            <div className="space-y-4">
              <p className="text-gray-400">Additional settings options will be available soon.</p>
            </div>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
} 