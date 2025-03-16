import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { LogIn, UserPlus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/store/useAuth';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const { signIn, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await signIn(email, password, isRegistering ? name : undefined);
      toast({
        title: `${isRegistering ? 'Registration' : 'Sign in'} successful!`,
        description: `Welcome ${isRegistering ? 'to Study Buddy' : 'back'}!`,
      });
      navigate('/groups');
    } catch (error: any) {
      console.error('Error:', error);
      if (!isRegistering) {
        // If user is trying to sign in and fails, suggest registration
        toast({
          title: "Account Not Found",
          description: "It looks like you don't have an account yet. Would you like to register?",
          action: (
            <Button
              variant="secondary"
              onClick={() => {
                setIsRegistering(true);
                setPassword(''); // Clear password for security
              }}
            >
              Register Now
            </Button>
          ),
        });
      } else {
        // Show error for registration attempts
        toast({
          title: "Registration Error",
          description: error.message || "Failed to register. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-md">
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <Card className="p-8 w-full vibranium-card">
          <div className="text-center mb-8">
            {isRegistering ? (
              <UserPlus className="h-12 w-12 text-primary mx-auto mb-4" />
            ) : (
              <LogIn className="h-12 w-12 text-primary mx-auto mb-4" />
            )}
            <h1 className="text-2xl font-bold">{isRegistering ? 'Create Account' : 'Welcome Back'}</h1>
            <p className="text-muted-foreground mt-2">
              {isRegistering ? 'Create your account to get started' : 'Sign in to access your study groups'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={isRegistering}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full vibranium-button"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : (isRegistering ? 'Register' : 'Sign In')}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setEmail('');
                setPassword('');
                setName('');
              }}
              disabled={isLoading}
            >
              {isRegistering 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Register"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default SignIn; 