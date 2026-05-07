import { Controller, Post, Put, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { RatingsService } from './ratings.service';
import { CreateRatingDto, UpdateRatingDto } from './dto/rating.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Ratings')
@ApiBearerAuth('access-token')
@Roles(Role.USER)
@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a rating for a store' })
  createRating(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateRatingDto,
  ) {
    return this.ratingsService.createRating(userId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing rating' })
  updateRating(
    @CurrentUser('id') userId: string,
    @Param('id') ratingId: string,
    @Body() dto: UpdateRatingDto,
  ) {
    return this.ratingsService.updateRating(userId, ratingId, dto);
  }
}
