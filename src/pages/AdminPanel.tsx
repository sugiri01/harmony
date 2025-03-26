
import React, { useState, useEffect } from 'react';
import { useRequireAuth, assignRole, removeRole } from '../utils/authUtils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';

interface UserWithRoles extends User {
  isAdmin: boolean;
}

const AdminPanel = () => {
  const { isLoading, isAdmin } = useRequireAuth(true);
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    
    try {
      // Get all users
      const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
      
      if (usersError) throw usersError;
      
      // Get admin role assignments
      const { data: adminRoles, error: rolesError } = await supabase
        .from('user_role_assignments')
        .select('user_id')
        .eq('role', 'admin');
      
      if (rolesError) throw rolesError;
      
      // Create a set of admin user IDs for quick lookup
      const adminUserIds = new Set(adminRoles?.map(role => role.user_id) || []);
      
      // Combine the data
      const usersWithRoles = usersData?.users.map(user => ({
        ...user,
        isAdmin: adminUserIds.has(user.id)
      })) || [];
      
      setUsers(usersWithRoles);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error(error.message || 'Error fetching users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleRoleChange = async (userId: string, makeAdmin: boolean) => {
    if (makeAdmin) {
      const success = await assignRole(userId, 'admin');
      if (success) {
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userId ? { ...user, isAdmin: true } : user
          )
        );
      }
    } else {
      const success = await removeRole(userId, 'admin');
      if (success) {
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userId ? { ...user, isAdmin: false } : user
          )
        );
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-harmony-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-glass p-6 border border-gray-100">
          <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-800">User Role Management</h1>
            <button 
              onClick={fetchUsers}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Refresh
            </button>
          </div>
          
          {loadingUsers ? (
            <div className="flex justify-center my-8">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-harmony-500"></div>
            </div>
          ) : (
            <>
              {users.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No users found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-left">
                        <th className="px-4 py-3 text-sm font-medium text-gray-600">User</th>
                        <th className="px-4 py-3 text-sm font-medium text-gray-600">Email</th>
                        <th className="px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                        <th className="px-4 py-3 text-sm font-medium text-gray-600">Admin Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {users.map(user => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-harmony-100 flex items-center justify-center text-harmony-600 font-medium">
                                {(user.user_metadata?.full_name || user.email || '?')[0].toUpperCase()}
                              </div>
                              <div className="ml-3">
                                <p className="font-medium text-gray-800">{user.user_metadata?.full_name || 'Unknown'}</p>
                                <p className="text-sm text-gray-500">{user.id.substring(0, 8)}...</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-gray-700">{user.email}</td>
                          <td className="px-4 py-4">
                            {user.email_confirmed_at ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <label className="inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox"
                                checked={user.isAdmin}
                                onChange={() => handleRoleChange(user.id, !user.isAdmin)}
                                className="sr-only peer"
                              />
                              <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-harmony-300 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-harmony-600"></div>
                              <span className="ms-3 text-sm font-medium text-gray-700 peer-checked:text-harmony-700">
                                {user.isAdmin ? 'Admin' : 'User'}
                              </span>
                            </label>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
