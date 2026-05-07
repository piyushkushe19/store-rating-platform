import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { OwnerService } from './owner.service';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Store Owner')
@ApiBearerAuth('access-token')
@Roles(Role.STORE_OWNER)
@Controller('owner')
export class OwnerController {
  constructor(private readonly ownerService: OwnerService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get store owner dashboard' })
  getDashboard(@CurrentUser('id') userId: string) {
    return this.ownerService.getDashboard(userId);
  }

  @Get('ratings')
  @ApiOperation({ summary: 'Get all ratings for owner store' })
  getRatings(@CurrentUser('id') userId: string) {
    return this.ownerService.getRatings(userId);
  }
}
