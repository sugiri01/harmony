
import { toast } from 'sonner';
import { assignAdminRoleByEmail } from './authUtils';
import { supabase } from '@/integrations/supabase/client';

/**
 * Sets up the initial admin user if they exist in the system
 */
export const setupInitialAdmin = async () => {
  try {
    // Check if we're authenticated first
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.log('Not authenticated, skipping admin setup');
      return;
    }
    
    // Specific email to make admin
    const adminEmail = 'sudhir.giri@argentjobs.in';
    
    // Try to assign admin role
    const result = await assignAdminRoleByEmail(adminEmail);
    
    // Log the result but don't toast to avoid confusing users
    console.log('Admin setup result:', result);
    
    if (result.success) {
      // Only show toast if running in development
      if (import.meta.env.DEV) {
        toast.success(result.message);
      }
    } else {
      // Log failure but don't show toast to users
      console.warn(result.message);
    }
  } catch (error) {
    console.error('Error in setupInitialAdmin:', error);
  }
};
