import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LogIn } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { auth, googleProvider } from '@/config/firebase';
import { signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { FaGoogle } from 'react-icons/fa';

const SignIn = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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

  return (
    <div className="container mx-auto p-6 max-w-md">
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <Card className="p-8 w-full vibranium-card">
          <div className="text-center mb-8">
            <LogIn className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold">Welcome to StudyBuddy</h1>
            <p className="text-muted-foreground mt-2">
              Sign in with Google to access your study groups
            </p>
          </div>

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
        </Card>
      </div>
    </div>
  );
};

export default SignIn;