import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRatingDto, UpdateRatingDto } from './dto/rating.dto';

@Injectable()
export class RatingsService {
  constructor(private prisma: PrismaService) {}

  async createRating(userId: string, dto: CreateRatingDto) {
    const store = await this.prisma.store.findUnique({
      where: { id: dto.storeId },
    });
    if (!store) {
      throw new NotFoundException('Store not found');
    }

    const existing = await this.prisma.rating.findUnique({
      where: { userId_storeId: { userId, storeId: dto.storeId } },
    });

    if (existing) {
      throw new ConflictException(
        'You have already rated this store. Use PUT to update.',
      );
    }

    const rating = await this.prisma.rating.create({
      data: { userId, storeId: dto.storeId, rating: dto.rating },
      include: {
        store: { select: { id: true, name: true } },
        user: { select: { id: true, name: true } },
      },
    });

    return rating;
  }

  async updateRating(userId: string, ratingId: string, dto: UpdateRatingDto) {
    const existing = await this.prisma.rating.findUnique({
      where: { id: ratingId },
    });

    if (!existing) {
      throw new NotFoundException('Rating not found');
    }

    if (existing.userId !== userId) {
      throw new ForbiddenException('You can only update your own ratings');
    }

    const rating = await this.prisma.rating.update({
      where: { id: ratingId },
      data: { rating: dto.rating },
      include: {
        store: { select: { id: true, name: true } },
        user: { select: { id: true, name: true } },
      },
    });

    return rating;
  }
}
