'use client';

import { useState } from 'react';
// Import shadcn UI components - we need to create these files if they don't exist
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { supabaseClient } from '@/lib/supabase/client';

// Define types for our props and data
type Role = {
  id: string;
  name: string;
  description: string;
};

type User = {
  id: string;
  email: string;
  full_name: string;
  role_id: string;
  employee_roles: Role | null;
};

interface UserRoleTableProps {
  users: User[];
  roles: Role[];
}

export default function UserRoleTable({ users, roles }: UserRoleTableProps) {
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<Record<string, string>>({});
  const { toast } = useToast();

  // Setup for role changes
  const handleRoleSelect = (userId: string, roleId: string) => {
    setSelectedRoles({
      ...selectedRoles,
      [userId]: roleId,
    });
  };

  // Function to update a user's role
  const updateUserRole = async (userId: string) => {
    if (!selectedRoles[userId]) return;
    
    setUpdatingUserId(userId);
    
    try {
      const { error } = await supabaseClient
        .from('user_profiles')
        .update({ role_id: selectedRoles[userId] })
        .eq('id', userId);
        
      if (error) throw error;
      
      toast({
        title: "Role updated",
        description: "User role has been updated successfully.",
      });
      
      // We could reload the data here, but for now we'll just update the UI
      // A production app might use SWR or React Query to handle this better
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role.",
        variant: "destructive",
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Current Role</TableHead>
            <TableHead>New Role</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.full_name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.employee_roles?.name || 'No role'}</TableCell>
              <TableCell>
                <Select
                  onValueChange={(value: string) => handleRoleSelect(user.id, value)}
                  defaultValue={user.role_id}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Button 
                  onClick={() => updateUserRole(user.id)}
                  disabled={!selectedRoles[user.id] || updatingUserId === user.id}
                  variant="outline"
                  size="sm"
                >
                  {updatingUserId === user.id ? "Updating..." : "Update Role"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 