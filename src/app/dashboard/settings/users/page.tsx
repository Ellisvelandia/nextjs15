import { requireRole } from '@/lib/auth';
import { ROLES } from '@/types/supabase';
import { getServerClient } from '@/lib/supabase/server';
import UserRoleTable from '@/components/UserRoleTable';

export default async function UserManagementPage() {
  // Only Admin can access this page
  await requireRole(ROLES.ADMIN);
  
  const supabase = await getServerClient();
  
  // Get all users with their roles
  const { data: users, error } = await supabase
    .from('user_profiles')
    .select('*, employee_roles(name, description)');
    
  if (error) {
    console.error('Error fetching users:', error);
    // Handle error appropriately
    return <div>Error loading users</div>;
  }
  
  // Get all available roles
  const { data: roles, error: rolesError } = await supabase
    .from('employee_roles')
    .select('*');
    
  if (rolesError) {
    console.error('Error fetching roles:', rolesError);
    return <div>Error loading roles</div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Role Management</h1>
      </div>
      
      <UserRoleTable users={users} roles={roles} />
    </div>
  );
} 