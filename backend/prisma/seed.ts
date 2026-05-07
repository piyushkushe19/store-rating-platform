import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean up
  await prisma.rating.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('Admin@123', 10);

  // Admin
  const admin = await prisma.user.create({
    data: {
      name: 'System Administrator User',
      email: 'admin@storerating.com',
      password: hashedPassword,
      address: '123 Admin Street, New York, NY 10001',
      role: Role.ADMIN,
    },
  });

  // Store Owners
  const owner1 = await prisma.user.create({
    data: {
      name: 'Coffee House Store Owner',
      email: 'owner1@coffeehouse.com',
      password: hashedPassword,
      address: '456 Coffee Ave, Brooklyn, NY 11201',
      role: Role.STORE_OWNER,
    },
  });

  const owner2 = await prisma.user.create({
    data: {
      name: 'Pizza Palace Restaurant Owner',
      email: 'owner2@pizzapalace.com',
      password: hashedPassword,
      address: '789 Pizza Blvd, Queens, NY 11354',
      role: Role.STORE_OWNER,
    },
  });

  const owner3 = await prisma.user.create({
    data: {
      name: 'Tech Gadgets Electronics Store Owner',
      email: 'owner3@techgadgets.com',
      password: hashedPassword,
      address: '321 Tech Road, Manhattan, NY 10016',
      role: Role.STORE_OWNER,
    },
  });

  // Stores
  const store1 = await prisma.store.create({
    data: {
      name: 'The Coffee House Cafe',
      email: 'contact@coffeehouse.com',
      address: '456 Coffee Ave, Brooklyn, NY 11201',
      ownerId: owner1.id,
    },
  });

  const store2 = await prisma.store.create({
    data: {
      name: 'Pizza Palace Italian Restaurant',
      email: 'contact@pizzapalace.com',
      address: '789 Pizza Blvd, Queens, NY 11354',
      ownerId: owner2.id,
    },
  });

  const store3 = await prisma.store.create({
    data: {
      name: 'Tech Gadgets Electronics Store',
      email: 'contact@techgadgets.com',
      address: '321 Tech Road, Manhattan, NY 10016',
      ownerId: owner3.id,
    },
  });

  // Normal users
  const user1 = await prisma.user.create({
    data: {
      name: 'Regular Platform User Alice',
      email: 'alice@example.com',
      password: hashedPassword,
      address: '100 User Lane, Staten Island, NY 10301',
      role: Role.USER,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Regular Platform User Robert',
      email: 'bob@example.com',
      password: hashedPassword,
      address: '200 Example Blvd, Bronx, NY 10451',
      role: Role.USER,
    },
  });

  const user3 = await prisma.user.create({
    data: {
      name: 'Regular Platform User Carol',
      email: 'carol@example.com',
      password: hashedPassword,
      address: '300 Sample Street, Jersey City, NJ 07302',
      role: Role.USER,
    },
  });

  // Ratings
  await prisma.rating.createMany({
    data: [
      { userId: user1.id, storeId: store1.id, rating: 5 },
      { userId: user2.id, storeId: store1.id, rating: 4 },
      { userId: user3.id, storeId: store1.id, rating: 5 },
      { userId: user1.id, storeId: store2.id, rating: 3 },
      { userId: user2.id, storeId: store2.id, rating: 4 },
      { userId: user1.id, storeId: store3.id, rating: 4 },
      { userId: user3.id, storeId: store3.id, rating: 5 },
    ],
  });

  console.log('✅ Seed complete!');
  console.log('');
  console.log('Demo credentials (all use password: Admin@123):');
  console.log(`  Admin:       ${admin.email}`);
  console.log(`  Store Owner: ${owner1.email}`);
  console.log(`  User:        ${user1.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
