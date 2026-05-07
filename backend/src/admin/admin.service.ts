import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateAdminUserDto,
  CreateStoreDto,
  UserFilterDto,
  StoreFilterDto,
} from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboard() {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.store.count(),
      this.prisma.rating.count(),
    ]);

    return { totalUsers, totalStores, totalRatings };
  }

  async createUser(dto: CreateAdminUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        address: dto.address,
        role: dto.role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
      },
    });

    return user;
  }

  async createStore(dto: CreateStoreDto) {
    const existingStore = await this.prisma.store.findUnique({
      where: { email: dto.email },
    });
    if (existingStore) {
      throw new ConflictException('Store with this email already exists');
    }

    const owner = await this.prisma.user.findUnique({
      where: { id: dto.ownerId },
    });

    if (!owner) {
      throw new NotFoundException('Owner not found');
    }

    const existingOwnerStore = await this.prisma.store.findUnique({
      where: { ownerId: dto.ownerId },
    });

    if (existingOwnerStore) {
      throw new ConflictException('This owner already has a store');
    }

    const store = await this.prisma.store.create({
      data: {
        name: dto.name,
        email: dto.email,
        address: dto.address,
        ownerId: dto.ownerId,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return store;
  }

  async getUsers(filter: UserFilterDto) {
    const { name, email, address, role, sortBy = 'createdAt', sortOrder = 'desc' } = filter;

    const where: any = {};
    if (name) where.name = { contains: name, mode: 'insensitive' };
    if (email) where.email = { contains: email, mode: 'insensitive' };
    if (address) where.address = { contains: address, mode: 'insensitive' };
    if (role) where.role = role;

    const validSortFields = ['name', 'email', 'address', 'role', 'createdAt'];
    const orderBy = validSortFields.includes(sortBy)
      ? { [sortBy]: sortOrder }
      : { createdAt: 'desc' as const };

    const users = await this.prisma.user.findMany({
      where,
      orderBy,
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
        store: {
          select: {
            id: true,
            ratings: { select: { rating: true } },
          },
        },
      },
    });

    return users.map((user) => {
      const ratings = user.store?.ratings || [];
      const avgRating =
        ratings.length > 0
          ? ratings.reduce((a, b) => a + b.rating, 0) / ratings.length
          : null;
      return {
        ...user,
        storeRating: avgRating ? parseFloat(avgRating.toFixed(1)) : null,
      };
    });
  }

  async getStores(filter: StoreFilterDto) {
    const { name, email, address, sortBy = 'createdAt', sortOrder = 'desc' } = filter;

    const where: any = {};
    if (name) where.name = { contains: name, mode: 'insensitive' };
    if (email) where.email = { contains: email, mode: 'insensitive' };
    if (address) where.address = { contains: address, mode: 'insensitive' };

    const validSortFields = ['name', 'email', 'address', 'createdAt'];
    const orderBy = validSortFields.includes(sortBy)
      ? { [sortBy]: sortOrder }
      : { createdAt: 'desc' as const };

    const stores = await this.prisma.store.findMany({
      where,
      orderBy,
      include: {
        owner: { select: { id: true, name: true, email: true } },
        ratings: { select: { rating: true } },
      },
    });

    return stores.map((store) => {
      const { ratings, ...rest } = store;
      const avgRating =
        ratings.length > 0
          ? ratings.reduce((a, b) => a + b.rating, 0) / ratings.length
          : null;
      return {
        ...rest,
        averageRating: avgRating ? parseFloat(avgRating.toFixed(1)) : null,
        totalRatings: ratings.length,
      };
    });
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
        store: {
          select: {
            id: true,
            name: true,
            ratings: { select: { rating: true } },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const ratings = user.store?.ratings || [];
    const avgRating =
      ratings.length > 0
        ? ratings.reduce((a, b) => a + b.rating, 0) / ratings.length
        : null;

    return {
      ...user,
      storeRating: avgRating ? parseFloat(avgRating.toFixed(1)) : null,
    };
  }

  async getStoreOwners() {
    return this.prisma.user.findMany({
      where: { role: 'STORE_OWNER', store: null },
      select: { id: true, name: true, email: true },
    });
  }
}
