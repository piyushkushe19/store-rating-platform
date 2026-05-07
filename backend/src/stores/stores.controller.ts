import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { StoresService } from './stores.service';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Stores')
@ApiBearerAuth('access-token')
@Roles(Role.USER)
@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Get()
  @ApiOperation({ summary: 'Get all stores (with optional search)' })
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'address', required: false })
  getAllStores(
    @CurrentUser('id') userId: string,
    @Query('name') name?: string,
    @Query('address') address?: string,
  ) {
    return this.storesService.getAllStores(userId, name, address);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search stores by name and address' })
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'address', required: false })
  searchStores(
    @CurrentUser('id') userId: string,
    @Query('name') name?: string,
    @Query('address') address?: string,
  ) {
    return this.storesService.getAllStores(userId, name, address);
  }
}
