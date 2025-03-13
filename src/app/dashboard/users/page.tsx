import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { UserRegistrationForm } from '@/components/users/UserRegistrationForm';
import { Role } from '@/types/user';

export const metadata: Metadata = {
  title: 'User Management',
  description: 'Create and manage users in the system.',
};

export default async function UsersPage() {
  const supabase = createServerComponentClient({ cookies });

  // Fetch roles for the form
  const { data: roles } = await supabase
    .from('employee_roles')
    .select('*')
    .order('name');

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-2xl mx-auto">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Create New User</h1>
            <p className="text-muted-foreground">
              Add a new user to the system and assign their role.
            </p>
          </div>

          <UserRegistrationForm roles={roles as Role[]} />
        </div>
      </div>
    </div>
  );
} 