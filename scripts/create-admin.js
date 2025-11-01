console.log('--- Starting Admin Creation Script ---');

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

console.log('Dependencies loaded.');

// Load environment variables from .env.local
try {
  dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
  console.log('Environment variables loaded from .env.local');
} catch (e) {
  console.error('Failed to load .env.local', e);
  process.exit(1);
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

console.log(`Supabase URL: ${SUPABASE_URL ? 'Loaded' : 'NOT LOADED'}`);
console.log(`Supabase Service Key: ${SUPABASE_SERVICE_KEY ? 'Loaded' : 'NOT LOADED'}`);

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Error: Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env.local file.');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
console.log('Supabase admin client initialized.');

const adminEmail = 'admin@synacto.com';
const adminPassword = 'admin123';
const adminName = 'System Admin';

async function createAdmin() {
  try {
    console.log(`Attempting to create user: ${adminEmail}...`);

    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = users.find(u => u.email === adminEmail);

    if (existingUser) {
        console.log(`User ${adminEmail} already exists with ID: ${existingUser.id}.`);
    } else {
        console.log(`User ${adminEmail} does not exist. Creating...`);
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: adminEmail,
            password: adminPassword,
            email_confirm: true,
            user_metadata: { name: adminName },
        });

        if (createError) {
            throw new Error(`Error creating user in Supabase Auth: ${createError.message}`);
        }
        console.log('Successfully created user in Supabase Auth.');
    }

    const { data: { users: finalUsers }, error: finalUsersError } = await supabaseAdmin.auth.admin.listUsers({ email: adminEmail });
    if (finalUsersError || finalUsers.length === 0) {
      throw new Error(`Could not retrieve user ID after creation. ${finalUsersError?.message}`);
    }
    const adminUser = finalUsers[0];
    console.log(`User ID is: ${adminUser.id}`);

    console.log('Upserting user into the staff table...');
    const { error: staffError } = await supabaseAdmin
      .from('staff')
      .upsert({
        id: adminUser.id,
        name: adminName,
        email: adminEmail,
        role: 'admin',
        is_active: true,
      });

    if (staffError) {
      throw new Error(`Error upserting user into staff table: ${staffError.message}`);
    }

    console.log('✅ Admin user setup complete!');
    console.log('You can now log in with the following credentials:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);

  } catch (error) {
    console.error('--- SCRIPT FAILED ---');
    console.error(error);
    process.exit(1);
  }
}

createAdmin(); 