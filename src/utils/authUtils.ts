
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export interface UserSession {
  user: any;
  session: any;
  isLoading: boolean;
  isAdmin: boolean;
}

// Define interfaces for admin API responses to prevent deep type instantiation
interface AdminUser {
  id: string;
  email?: string;
  user_metadata?: Record<string, any>;
  email_confirmed_at?: string | null;
}

interface AdminListUsersResponse {
  users: AdminUser[];
}

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    toast.error(error.message || 'Error during sign in');
    return { data: null, error };
  }
};

export const signUp = async (email: string, password: string, fullName: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });
    
    if (error) throw error;
    toast.success('Registration successful! Please check your email for verification.');
    return { data, error: null };
  } catch (error: any) {
    toast.error(error.message || 'Error during sign up');
    return { data: null, error };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    toast.error(error.message || 'Error during sign out');
    return { error };
  }
};

export const useSession = (): UserSession => {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const fetchUserRole = async (userId: string) => {
      const { data } = await supabase
        .from('user_role_assignments')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .single();
      
      setIsAdmin(!!data);
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          await fetchUserRole(currentSession.user.id);
        } else {
          setIsAdmin(false);
        }
        
        setIsLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        await fetchUserRole(currentSession.user.id);
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, session, isLoading, isAdmin };
};

export const useRequireAuth = (requireAdmin: boolean = false) => {
  const { user, isLoading, isAdmin } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate('/auth');
      } else if (requireAdmin && !isAdmin) {
        toast.error('Admin access required');
        navigate('/');
      }
    }
  }, [user, isLoading, isAdmin, navigate, requireAdmin]);

  return { user, isLoading, isAdmin };
};

export const assignRole = async (userId: string, role: 'admin' | 'user'): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_role_assignments')
      .upsert({ user_id: userId, role });
    
    if (error) throw error;
    toast.success(`${role} role assigned successfully`);
    return true;
  } catch (error: any) {
    toast.error(error.message || `Error assigning ${role} role`);
    return false;
  }
};

export const removeRole = async (userId: string, role: 'admin' | 'user'): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_role_assignments')
      .delete()
      .eq('user_id', userId)
      .eq('role', role);
    
    if (error) throw error;
    toast.success(`${role} role removed successfully`);
    return true;
  } catch (error: any) {
    toast.error(error.message || `Error removing ${role} role`);
    return false;
  }
};

export const assignAdminRoleByEmail = async (email: string): Promise<{success: boolean, message: string}> => {
  try {
    // First try to find the user in profiles table
    const { data: users, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email);
    
    if (userError) throw userError;
    
    if (!users || users.length === 0) {
      // If user not found in profiles, try to find in auth.users
      
      // Completely bypass TypeScript's inference for admin API calls
      const result = await supabase.auth.admin.listUsers();
      
      // Handle each property separately to avoid deep type inference
      const error = result.error;
      
      // Use type assertion with 'any' to completely bypass TypeScript's deep inference
      const userData: any = result.data;
      
      if (error) throw error;
      
      if (!userData || !userData.users || !Array.isArray(userData.users)) {
        return { success: false, message: 'Could not retrieve user list' };
      }
      
      // Find user with matching email with safe property access
      const foundUser = userData.users.find((user: any) => 
        user && typeof user.email === 'string' && user.email === email
      );
      
      if (!foundUser) {
        return { success: false, message: `User with email ${email} not found` };
      }
      
      const success = await assignRole(foundUser.id, 'admin');
      
      if (success) {
        return { success: true, message: `Admin role assigned to ${email}` };
      } else {
        return { success: false, message: `Failed to assign admin role to ${email}` };
      }
    } else {
      const userId = users[0].id;
      const success = await assignRole(userId, 'admin');
      
      if (success) {
        return { success: true, message: `Admin role assigned to ${email}` };
      } else {
        return { success: false, message: `Failed to assign admin role to ${email}` };
      }
    }
  } catch (error: any) {
    console.error('Error assigning admin role by email:', error);
    return { success: false, message: error.message || 'Error assigning admin role by email' };
  }
};
