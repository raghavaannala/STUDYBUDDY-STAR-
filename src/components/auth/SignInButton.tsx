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
import { useToast } from '@/components/ui/use-toast';
import { UserMenu } from './UserMenu';
import { auth, googleProvider } from '@/config/firebase';
import { 
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';
import { FaGoogle } from 'react-icons/fa';

export function SignInButton() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(auth.currentUser);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    
    return () => unsubscribe();
  }, []);

  // Handle redirects from Google sign-in
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        
        if (result) {
          toast({
            title: "Google Sign-in Successful",
            description: `Welcome, ${result.user.displayName || 'User'}!`,
          });
          
          setOpen(false);
          navigate('/groups');
        }
      } catch (error: any) {
        console.error('Redirect result error:', error);
        
        if (error.code !== 'auth/no-auth-event') {
          toast({
            title: "Google Sign-in Failed",
            description: error.message || "Could not complete the Google sign-in.",
            variant: "destructive",
          });
        }
      }
    };
    
    handleRedirectResult();
  }, [navigate, toast]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setIsLoading(false);
    }
  }, [open]);
  
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      // Configure Google sign-in parameters for better compatibility
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });
      
      // Try sign in with popup
      const result = await signInWithPopup(auth, googleProvider);
      
      toast({
        title: "Google Sign-in Successful",
        description: `Welcome, ${result.user.displayName || 'User'}!`,
      });
      
      setOpen(false);
      navigate('/groups');
    } catch (popupError: any) {
      console.error('Google sign-in popup error:', popupError);
      console.error('Error code:', popupError.code);
      console.error('Error message:', popupError.message);
      
      // If popup is blocked or fails, try redirect method as fallback
      if (
        popupError.code === 'auth/popup-blocked' || 
        popupError.code === 'auth/popup-closed-by-user' ||
        popupError.code === 'auth/cancelled-popup-request'
      ) {
        try {
          toast({
            title: "Using alternative sign-in method",
            description: "Redirecting to Google sign-in...",
          });
          
          // Try redirect method
          await signInWithRedirect(auth, googleProvider);
          return; // This will navigate away from the page
        } catch (redirectError: any) {
          console.error('Google redirect error:', redirectError);
          
          toast({
            title: "Google Sign-in Failed",
            description: redirectError.message || "Could not sign in with Google. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        // Handle other errors
        let errorMessage = "An unexpected error occurred";
        
        if (popupError.code === 'auth/unauthorized-domain') {
          errorMessage = "This domain is not authorized for Firebase authentication. Please add your domain in the Firebase console.";
        } else if (popupError.code === 'auth/operation-not-allowed') {
          errorMessage = "Google sign-in is not enabled for this project.";
        } else {
          errorMessage = popupError.message || "Could not sign in with Google. Please try again.";
        }
        
        toast({
          title: "Google Sign-in Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
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
              Sign In
            </DialogTitle>
            <DialogDescription>
              Sign in with Google to access your account
            </DialogDescription>
          </DialogHeader>
          
          <Button
            type="button"
            className="w-full vibranium-button flex items-center justify-center gap-2 py-6"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              "Connecting..."
            ) : (
              <>
                <FaGoogle className="h-5 w-5" />
                Sign in with Google
              </>
            )}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
} 