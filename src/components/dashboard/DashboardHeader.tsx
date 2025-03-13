'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function DashboardHeader() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  
  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };
  
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.email?.split('@')[0] || 'User'}
        </p>
      </div>
      
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/settings')}
        >
          Settings
        </Button>
        <Button
          variant="ghost"
          onClick={handleSignOut}
        >
          Sign out
        </Button>
      </div>
    </div>
  );
} 