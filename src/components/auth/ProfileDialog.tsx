import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProfileDialog = ({ open, onOpenChange }: ProfileDialogProps) => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-bg-200 border-accent-100/20">
        <DialogHeader>
          <DialogTitle className="text-2xl">Your Profile</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            View and manage your account details
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center space-y-4 py-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
            <AvatarFallback className="text-2xl">
              {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="text-center">
            <h3 className="text-xl font-medium">{user.displayName || 'User'}</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          
          <div className="w-full space-y-2 mt-4">
            <div className="flex justify-between items-center p-2 rounded bg-bg-300/50">
              <span>Email</span>
              <span className="text-sm font-mono">{user.email}</span>
            </div>
            
            <div className="flex justify-between items-center p-2 rounded bg-bg-300/50">
              <span>Account ID</span>
              <span className="text-sm font-mono">{user.uid.substring(0, 8)}...</span>
            </div>
            
            <div className="flex justify-between items-center p-2 rounded bg-bg-300/50">
              <span>Email Verified</span>
              <span>{user.emailVerified ? '✅' : '❌'}</span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 mt-4">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button className="bg-accent-100 hover:bg-accent-100/90">
            Edit Profile
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileDialog; 