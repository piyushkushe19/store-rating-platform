import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StoresService {
  constructor(private prisma: PrismaService) {}

  async getAllStores(userId: string, name?: string, address?: string) {
    const where: any = {};
    if (name) where.name = { contains: name, mode: 'insensitive' };
    if (address) where.address = { contains: address, mode: 'insensitive' };

    const stores = await this.prisma.store.findMany({
      where,
      include: {
        ratings: { select: { id: true, userId: true, rating: true } },
      },
      orderBy: { name: 'asc' },
    });

    return stores.map((store) => {
      const { ratings, ...rest } = store;
      const avgRating =
        ratings.length > 0
          ? ratings.reduce((a, b) => a + b.rating, 0) / ratings.length
          : null;
      const userRatingObj = ratings.find((r) => r.userId === userId);
      return {
        ...rest,
        averageRating: avgRating ? parseFloat(avgRating.toFixed(1)) : null,
        totalRatings: ratings.length,
        userRating: userRatingObj?.rating || null,
        userRatingId: userRatingObj?.id || null,
      };
    });
  }
}
