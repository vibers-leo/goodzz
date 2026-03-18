/**
 * Development script to add admin role to a user
 * Usage: npx tsx scripts/add-admin-role.ts <userId>
 */

import { addRole } from '../src/lib/users';

async function main() {
  const userId = process.argv[2] || 'test-admin-001';

  console.log(`Adding admin role to user: ${userId}`);

  try {
    await addRole(userId, 'admin');
    console.log('✅ Successfully added admin role');
  } catch (error) {
    console.error('❌ Error adding admin role:', error);
    process.exit(1);
  }
}

main();
