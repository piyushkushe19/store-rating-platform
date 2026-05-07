import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OwnerService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(userId: string) {
    const store = await this.prisma.store.findUnique({
      where: { ownerId: userId },
      include: {
        ratings: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!store) {
      throw new NotFoundException('No store found for this owner');
    }

    const avgRating =
      store.ratings.length > 0
        ? store.ratings.reduce((a, b) => a + b.rating, 0) / store.ratings.length
        : null;

    return {
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
      },
      averageRating: avgRating ? parseFloat(avgRating.toFixed(1)) : null,
      totalRatings: store.ratings.length,
    };
  }

  async getRatings(userId: string) {
    const store = await this.prisma.store.findUnique({
      where: { ownerId: userId },
    });

    if (!store) {
      throw new NotFoundException('No store found for this owner');
    }

    const ratings = await this.prisma.rating.findMany({
      where: { storeId: store.id },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return ratings.map((r) => ({
      id: r.id,
      rating: r.rating,
      createdAt: r.createdAt,
      user: r.user,
    }));
  }
}
