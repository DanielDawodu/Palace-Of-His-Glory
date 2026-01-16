// scripts/seed.ts
import 'dotenv/config';
import { storage } from '../server/storage';

async function seed() {
  console.log('🌱 Running seed script...');

  try {
    // Users
    const daniel = await storage.getUserByUsernameCaseInsensitive('Daniel');
    if (!daniel) {
      console.log("👤 Creating user 'Daniel'...");
      await storage.createUser({
        username: 'Daniel',
        email: 'danieldawodu07@gmail.com',
        password: 'Daniel@123',
        isAdmin: true,
      });
      console.log("✅ User 'Daniel' created.");
    } else {
      console.log("👤 User 'Daniel' already exists.");
    }

    // Staff
    const existingStaff = await storage.getStaff();
    if (existingStaff.length === 0) {
      console.log('👥 Creating default staff...');
      await storage.createStaff({
        name: 'Pastor Bright Oluwole',
        role: 'Lead Pastor and General Overseer',
        category: 'pastor',
        isLead: true,
        bio: 'Pastor Bright Oluwole is the visionary leader and General Overseer of Palace of His Glory International Ministries.',
        imageUrl: '/pastor-bright.jpg',
      });
      await storage.createStaff({
        name: 'Pastor Oluwakemi Adesanya',
        role: 'Associate Pastor',
        category: 'pastor',
        isLead: false,
        imageUrl: '/pastor-oluwakemi.jpg',
      });
      await storage.createStaff({
        name: 'Pastor Adewale Olusanwo',
        role: 'Associate Pastor',
        category: 'pastor',
        isLead: false,
        imageUrl: '/pastor-adewale.jpg',
      });
      console.log('✅ Default staff created.');
    } else {
      console.log('👥 Staff already exists, skipping creation.');
    }

    // Programmes - reuse defaults
    const existingProgrammes = await storage.getProgrammes();
    if (existingProgrammes.length === 0) {
      console.log('📅 Creating default programmes...');
      const defaultProgrammes = [
        { title: 'Sunday School', description: 'Join us for a time of worship and word.', type: 'weekly', day: 'Sunday', time: '8:00 AM', location: 'Main Auditorium' },
        { title: 'Sunday Service', description: 'Join us for a time of worship and word.', type: 'weekly', day: 'Sunday', time: '9:00 AM', location: 'Main Auditorium' },
        { title: 'Bible Study', description: 'Digging deep into the scriptures.', type: 'weekly', day: 'Tuesday', time: '5:30 PM', location: 'Main Auditorium' },
      ];

      for (const p of defaultProgrammes) {
        await storage.createProgramme(p as any);
      }
      console.log('✅ Default programmes created.');
    } else {
      console.log('📅 Programmes already exist, skipping creation.');
    }

    // Departments
    const existingDepartments = await storage.getDepartments();
    if (existingDepartments.length === 0) {
      console.log('🏛️ Creating default departments...');
      await storage.createDepartment({ name: 'Choir Department', leader: 'Sis. Adebisi', description: 'Leading the congregation in worship.' });
      await storage.createDepartment({ name: 'Ushers Department', leader: 'Sis. Adebanjo', description: 'Maintaining order and welcoming guests.' });
      console.log('✅ Default departments created.');
    } else {
      console.log('🏛️ Departments already exist, skipping creation.');
    }

    console.log('🌱 Seeding complete.');
  } catch (e: any) {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  }
}

seed().then(() => process.exit(0));
