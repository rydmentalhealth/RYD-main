// scripts/migrate-to-firebase.ts
import { PrismaClient } from '@prisma/client';
import { userService, sessionService } from '../lib/firebase-service';

const prisma = new PrismaClient();

async function migrateUsers() {
  console.log('Starting user migration...');
  
  try {
    // Get all users from PostgreSQL
    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users to migrate`);

    for (const user of users) {
      try {
        // Check if user already exists in Firebase
        const existingUser = await userService.getUserByEmail(user.email);
        
        if (!existingUser) {
          // Create user in Firebase
          await userService.createUser({
            email: user.email,
            name: user.name || undefined,
            status: user.status as 'PENDING' | 'APPROVED' | 'REJECTED',
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          });
          console.log(`Migrated user: ${user.email}`);
        } else {
          console.log(`User already exists in Firebase: ${user.email}`);
        }
      } catch (error) {
        console.error(`Error migrating user ${user.email}:`, error);
      }
    }
    
    console.log('User migration completed');
  } catch (error) {
    console.error('Error during user migration:', error);
  }
}

async function migrateSessions() {
  console.log('Starting session migration...');
  
  try {
    // Get all sessions from PostgreSQL
    const sessions = await prisma.session.findMany();
    console.log(`Found ${sessions.length} sessions to migrate`);

    for (const session of sessions) {
      try {
        // Get the user to find their Firebase ID
        const user = await prisma.user.findUnique({
          where: { id: session.userId }
        });
        
        if (user) {
          const firebaseUser = await userService.getUserByEmail(user.email);
          
          if (firebaseUser) {
            // Create session in Firebase
            await sessionService.createSession({
              userId: firebaseUser.id!,
              token: session.token,
              expiresAt: session.expiresAt,
            });
            console.log(`Migrated session for user: ${user.email}`);
          }
        }
      } catch (error) {
        console.error(`Error migrating session ${session.id}:`, error);
      }
    }
    
    console.log('Session migration completed');
  } catch (error) {
    console.error('Error during session migration:', error);
  }
}

async function main() {
  console.log('Starting migration from PostgreSQL to Firebase...');
  
  try {
    await migrateUsers();
    await migrateSessions();
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  main();
}

export { main as migrateToFirebase };