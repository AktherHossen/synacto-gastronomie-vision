import { supabase } from '@/integrations/supabase/client';

interface CreateStaffParams {
  name: string;
  email: string;
  role: string;
}

export async function createStaff({ name, email, role }: CreateStaffParams) {
  // First, check if the user is an admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: currentStaff } = await supabase
    .from('staff')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!currentStaff || currentStaff.role !== 'admin') {
    throw new Error('Not authorized');
  }

  // Create auth user with a random password
  const password = Math.random().toString(36).slice(-8);
  const { data: authUser, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role
      }
    }
  });

  if (authError || !authUser.user) {
    throw new Error(authError?.message || 'Failed to create user');
  }

  // Create staff record
  const { error: staffError } = await supabase.from('staff').insert({
    id: authUser.user.id,
    name,
    email,
    role,
    is_active: true,
    joining_date: new Date().toISOString().split('T')[0]
  });

  if (staffError) {
    // If staff creation fails, we should ideally delete the auth user
    // but Supabase client doesn't provide this functionality
    throw new Error(staffError.message);
  }

  // TODO: Send welcome email with password
  // For now, we'll just return the password so it can be communicated manually
  return { 
    success: true, 
    message: 'Staff member created successfully',
    password 
  };
} 