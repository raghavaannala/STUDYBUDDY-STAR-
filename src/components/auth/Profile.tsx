import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { UserMenu } from './UserMenu';
import { auth } from '@/config/firebase';
import { Navigate } from 'react-router-dom';

export default function Profile() {
  const [user, setUser] = useState(auth.currentUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/signin" />;
  }
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)]">
        <Card className="p-8 w-full max-w-md vibranium-card">
          <div className="text-center mb-8">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 mx-auto flex items-center justify-center text-3xl font-bold text-white">
              {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
            </div>
            <h1 className="text-2xl font-bold mt-4">{user.displayName || "User"}</h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-background/50 p-4 rounded-lg">
              <h2 className="font-semibold mb-2">Account Information</h2>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span>{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account Created</span>
                  <span>{user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Sign In</span>
                  <span>{user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString() : "N/A"}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-background/50 p-4 rounded-lg">
              <h2 className="font-semibold mb-2">Verification Status</h2>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Email verified</span>
                {user.emailVerified ? (
                  <span className="text-green-500">Verified</span>
                ) : (
                  <Button variant="outline" size="sm">Verify Email</Button>
                )}
              </div>
            </div>
            
            <div className="flex justify-end">
              <UserMenu />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 