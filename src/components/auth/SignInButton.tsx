import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/store/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { UserMenu } from './UserMenu';

export function SignInButton() {
  const [open, setOpen] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();
  const { signIn, user, isLoading, clearForm } = useAuth();
  const { toast } = useToast();

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setEmail('');
      setPassword('');
      setName('');
      setIsRegistering(false);
      clearForm();
    }
  }, [open, clearForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password, isRegistering ? name : undefined);
      toast({
        title: `${isRegistering ? 'Registration' : 'Sign in'} successful!`,
        description: `Welcome ${isRegistering ? 'to Study Buddy' : 'back'}!`,
      });
      setOpen(false);
      navigate('/profile');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || `Failed to ${isRegistering ? 'register' : 'sign in'}. Please try again.`,
        variant: 'destructive',
      });
    }
  };

  if (user) {
    return <UserMenu />;
  }

  return (
    <>
      <Button 
        onClick={() => setOpen(true)}
        className="vibranium-button"
      >
        Sign In
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px] vibranium-card">
          <DialogHeader>
            <DialogTitle className="vibranium-text">
              {isRegistering ? 'Create Account' : 'Sign In'}
            </DialogTitle>
            <DialogDescription>
              {isRegistering 
                ? 'Create your account to get started'
                : 'Sign in to your account to continue'
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-4">
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
                onClick={() => setIsRegistering(!isRegistering)}
                disabled={isLoading}
              >
                {isRegistering 
                  ? 'Already have an account? Sign in' 
                  : "Don't have an account? Register"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
} 