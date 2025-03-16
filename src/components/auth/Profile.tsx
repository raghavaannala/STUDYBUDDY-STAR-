import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/store/useAuth';
import FadeIn from '@/components/animations/FadeIn';

export default function Profile() {
  const { user, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen vibranium-bg pt-20">
      <div className="container mx-auto px-4 py-8">
        <FadeIn>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold vibranium-text">My Profile</h1>
            <Button 
              onClick={() => {
                signOut();
                navigate('/');
              }}
              className="vibranium-button"
            >
              Sign Out
            </Button>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="vibranium-card p-6">
              <h2 className="text-2xl font-semibold mb-4">Account Details</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="text-lg">{user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-lg">{user.email}</p>
                </div>
              </div>
            </Card>

            <Card className="vibranium-card p-6">
              <h2 className="text-2xl font-semibold mb-4">Progress Overview</h2>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Completed Challenges</span>
                    <span>{user.progress?.completedChallenges || 0}</span>
                  </div>
                  <Progress value={
                    ((user.progress?.completedChallenges || 0) / 10) * 100
                  } />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Points</p>
                  <p className="text-2xl font-bold vibranium-text">
                    {user.progress?.totalPoints || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Rank</p>
                  <p className="text-xl vibranium-text">
                    {user.progress?.rank || 'Beginner'}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </FadeIn>
      </div>
    </div>
  );
} 