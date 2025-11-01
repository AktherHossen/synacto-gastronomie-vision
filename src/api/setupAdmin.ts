import { supabase } from '@/integrations/supabase/client';

export async function setupInitialAdmin() {
  console.log("Executing setupInitialAdmin with email: admin.reset@synacto.com");
  const adminEmail = 'admin.reset@synacto.com';
  const adminPassword = 'admin123';
  const adminName = 'System Admin';

  try {
    // First check if admin already exists in auth
    const { data: authData } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    });

    if (authData?.user) {
      return {
        success: true,
        message: 'Admin already exists',
        credentials: {
          email: adminEmail,
          password: adminPassword
        }
      };
    }

    // Create admin user in auth
    const { data: authUser, error: authError } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
      options: {
        data: {
          name: adminName,
          role: 'admin'
        },
        emailRedirectTo: window.location.origin
      }
    });

    if (authError) {
      console.error('Auth Error:', authError);
      throw new Error(`Failed to create admin user: ${authError.message}`);
    }

    if (!authUser.user) {
      throw new Error('No user returned from auth signup');
    }

    // Create admin record in staff table
    const { error: staffError } = await supabase.from('staff').insert({
      id: authUser.user.id,
      name: adminName,
      email: adminEmail,
      role: 'admin',
      is_active: true,
      joining_date: new Date().toISOString().split('T')[0]
    });

    if (staffError) {
      console.error('Staff Error:', staffError);
      // If staff creation fails, try to clean up the auth user
      await supabase.auth.admin.deleteUser(authUser.user.id);
      throw new Error(`Failed to create staff record: ${staffError.message}`);
    }

    // Try to sign in immediately to confirm the account works
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    });

    if (signInError) {
      console.error('Sign In Error:', signInError);
      throw new Error(`Account created but unable to sign in: ${signInError.message}`);
    }

    return {
      success: true,
      message: 'Admin user created and verified successfully',
      credentials: {
        email: adminEmail,
        password: adminPassword
      }
    };
  } catch (error: any) {
    console.error('Setup Error:', error);
    throw new Error(error.message || 'Failed to setup admin account');
  }
} 