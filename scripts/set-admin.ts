import { usersService } from '../app/services/users';

async function setAdmin() {
  try {
    const userId = process.argv[2];
    if (!userId) {
      console.error('Please provide a user ID as an argument');
      process.exit(1);
    }

    await usersService.setAdminRole(userId);
    console.log(`Successfully set user ${userId} as admin`);
    process.exit(0);
  } catch (error) {
    console.error('Error setting admin role:', error);
    process.exit(1);
  }
}

setAdmin();
