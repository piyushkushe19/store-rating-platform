import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Regular Platform User Alice', minLength: 20, maxLength: 60 })
  @IsString()
  @MinLength(20, { message: 'Name must be at least 20 characters' })
  @MaxLength(60, { message: 'Name must not exceed 60 characters' })
  name: string;

  @ApiProperty({ example: 'alice@example.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({ example: '123 Main Street, New York, NY 10001', maxLength: 400 })
  @IsString()
  @MaxLength(400, { message: 'Address must not exceed 400 characters' })
  address: string;

  @ApiProperty({ example: 'Password@1', description: '8-16 chars, 1 uppercase, 1 special char' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(16, { message: 'Password must not exceed 16 characters' })
  @Matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/, {
    message: 'Password must contain at least one uppercase letter and one special character',
  })
  password: string;
}

export class LoginDto {
  @ApiProperty({ example: 'alice@example.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({ example: 'Password@1' })
  @IsString()
  password: string;
}

export class UpdatePasswordDto {
  @ApiProperty({ example: 'OldPassword@1' })
  @IsString()
  currentPassword: string;

  @ApiProperty({ example: 'NewPassword@1', description: '8-16 chars, 1 uppercase, 1 special char' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(16, { message: 'Password must not exceed 16 characters' })
  @Matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/, {
    message: 'Password must contain at least one uppercase letter and one special character',
  })
  newPassword: string;
}
