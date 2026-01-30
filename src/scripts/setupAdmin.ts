import { auth, db } from "@/lib/firebase";
import { 
  createUserWithEmailAndPassword, 
  updateProfile 
} from "firebase/auth";
import { 
  doc, 
  setDoc, 
  serverTimestamp,
  collection,
  getDocs
} from "firebase/firestore";

/**
 * Create an admin user in Firebase Authentication and Firestore
 * @param email Admin email address
 * @param password Admin password
 * @param role Admin role ('super_admin' or 'admin')
 * @returns Promise<boolean> indicating success or failure
 */
export const setupAdmin = async (
  email: string, 
  password: string, 
  role: 'super_admin' | 'admin' = 'admin'
): Promise<boolean> => {
  try {
    console.log(`🔧 Creating admin user: ${email}`);
    
    // 1. Create user in Firebase Authentication
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    
    if (!user) {
      console.error('❌ Failed to create user in Firebase Authentication');
      return false;
    }
    
    console.log('✅ User created in Firebase Authentication');
    
    // 2. Update user profile with display name
    await updateProfile(user, {
      displayName: role === 'super_admin' ? 'Super Admin' : 'Admin'
    });
    
    console.log('✅ User profile updated');
    
    // 3. Add user to admins collection in Firestore
    await setDoc(doc(db, "admins", user.uid), {
      email: user.email,
      role: role,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true,
      permissions: role === 'super_admin' 
        ? ['user_management', 'product_management', 'order_management', 'category_management', 'system_settings']
        : ['product_management', 'order_management', 'category_management']
    });
    
    console.log(`✅ Admin user ${email} added to Firestore with role: ${role}`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`👤 Role: ${role}`);
    console.log(`🆔 UID: ${user.uid}`);
    
    return true;
  } catch (error: any) {
    console.error('❌ Error setting up admin:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    return false;
  }
};

/**
 * Setup multiple admin users from an array
 * @param admins Array of admin objects with email, password, and role
 * @returns Promise with success count and failures
 */
export const setupMultipleAdmins = async (
  admins: Array<{ email: string; password: string; role?: 'super_admin' | 'admin' }>
): Promise<{ success: number; failures: number; details: any[] }> => {
  const results = { success: 0, failures: 0, details: [] };
  
  for (const admin of admins) {
    const success = await setupAdmin(
      admin.email, 
      admin.password, 
      admin.role || 'admin'
    );
    
    if (success) {
      results.success++;
      results.details.push({ email: admin.email, status: 'success' });
    } else {
      results.failures++;
      results.details.push({ email: admin.email, status: 'failed' });
    }
  }
  
  console.log(`\n📊 Setup Summary:`);
  console.log(`✅ Successful: ${results.success}`);
  console.log(`❌ Failed: ${results.failures}`);
  console.log(`📋 Total: ${results.success + results.failures}`);
  
  return results;
};

/**
 * Check if an admin user already exists
 * @param email Email to check
 * @returns Promise<boolean> indicating if user exists
 */
export const checkAdminExists = async (email: string): Promise<boolean> => {
  try {
    // This is a simple check - in production you might want to use 
    // Firebase Admin SDK on the backend for better security
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/projects/${import.meta.env.VITE_FIREBASE_PROJECT_ID}/accounts:lookup?key=${import.meta.env.VITE_FIREBASE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: [email]
      })
    });
    
    const data = await response.json();
    return data.users && data.users.length > 0;
  } catch (error) {
    console.error('Error checking if admin exists:', error);
    return false;
  }
};

/**
 * Initialize the first admin if no admins exist
 * This should be called once during initial setup
 */
export const initializeFirstAdmin = async (): Promise<void> => {
  try {
    console.log('🔍 Checking if any admins exist...');
    
    // Check if we have any admins in Firestore
    const adminsCollection = collection(db, "admins");
    const snapshot = await getDocs(adminsCollection);
    
    if (!snapshot.empty) {
      console.log(`✅ Found ${snapshot.docs.length} admin(s) in the system`);
      return;
    }
    
    console.log('⚠️ No admins found. Creating default admin...');
    
    // Create default admin with environment variables or defaults
    const defaultAdmin = {
      email: import.meta.env.VITE_DEFAULT_ADMIN_EMAIL || 'admin@kailashkalamkari.com',
      password: import.meta.env.VITE_DEFAULT_ADMIN_PASSWORD || 'Admin@123456',
      role: 'super_admin' as const
    };
    
    const success = await setupAdmin(
      defaultAdmin.email, 
      defaultAdmin.password, 
      defaultAdmin.role
    );
    
    if (success) {
      console.log('🎉 Default admin created successfully!');
      console.log('⚠️ Please change the default password after first login');
      console.log('🔐 Default credentials:');
      console.log(`   Email: ${defaultAdmin.email}`);
      console.log(`   Password: ${defaultAdmin.password}`);
      console.log(`   Login URL: ${window.location.origin}/admin`);
    } else {
      console.error('❌ Failed to create default admin');
    }
  } catch (error) {
    console.error('❌ Error initializing first admin:', error);
  }
};

// Example usage functions that can be called from browser console

/**
 * Function to create the initial super admin
 * Call this in browser console: createInitialSuperAdmin()
 */
export const createInitialSuperAdmin = async () => {
  const adminData = {
    email: "kailashkalamkari1984@gmail.com",
    password: "Kalamkari@Admin123",
    role: 'super_admin' as const
  };
  
  console.log('🚀 Creating initial super admin...');
  const success = await setupAdmin(adminData.email, adminData.password, adminData.role);
  
  if (success) {
    console.log('🎉 Super admin created successfully!');
    console.log('📧 Email:', adminData.email);
    console.log('🔐 Password:', adminData.password);
    console.log('🌐 Login at:', window.location.origin + '/admin');
  } else {
    console.error('❌ Failed to create super admin');
  }
};

/**
 * Function to create a regular admin
 * Call this in browser console: createAdmin('email@example.com', 'password123')
 */
export const createAdminUser = async (email: string, password: string) => {
  console.log('🚀 Creating admin user...');
  const success = await setupAdmin(email, password, 'admin');
  
  if (success) {
    console.log('🎉 Admin created successfully!');
    console.log('📧 Email:', email);
    console.log('🌐 Login at:', window.location.origin + '/admin');
  } else {
    console.error('❌ Failed to create admin');
  }
};

// Make functions available globally for console access
if (typeof window !== 'undefined') {
  (window as any).createInitialSuperAdmin = createInitialSuperAdmin;
  (window as any).createAdminUser = createAdminUser;
  (window as any).setupAdmin = setupAdmin;
  (window as any).initializeFirstAdmin = initializeFirstAdmin;
  
  console.log('🔧 Admin setup functions available in console:');
  console.log('  - createInitialSuperAdmin()');
  console.log('  - createAdminUser(email, password)');
  console.log('  - setupAdmin(email, password, role)');
  console.log('  - initializeFirstAdmin()');
}

export default setupAdmin;
