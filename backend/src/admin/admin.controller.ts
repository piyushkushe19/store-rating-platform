import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AdminService } from './admin.service';
import {
  CreateAdminUserDto,
  CreateStoreDto,
  UserFilterDto,
  StoreFilterDto,
} from './dto/admin.dto';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Admin')
@ApiBearerAuth('access-token')
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get admin dashboard stats' })
  getDashboard() {
    return this.adminService.getDashboard();
  }

  @Post('users')
  @ApiOperation({ summary: 'Create a new user (any role)' })
  createUser(@Body() dto: CreateAdminUserDto) {
    return this.adminService.createUser(dto);
  }

  @Post('stores')
  @ApiOperation({ summary: 'Create a new store' })
  createStore(@Body() dto: CreateStoreDto) {
    return this.adminService.createStore(dto);
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users with filters' })
  getUsers(@Query() filter: UserFilterDto) {
    return this.adminService.getUsers(filter);
  }

  @Get('stores')
  @ApiOperation({ summary: 'Get all stores with filters' })
  getStores(@Query() filter: StoreFilterDto) {
    return this.adminService.getStores(filter);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user by ID' })
  getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Get('store-owners/available')
  @ApiOperation({ summary: 'Get store owners without a store' })
  getAvailableStoreOwners() {
    return this.adminService.getStoreOwners();
  }
}
