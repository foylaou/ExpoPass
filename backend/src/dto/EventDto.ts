import { IsString, IsDateString, IsOptional, MaxLength, IsEnum } from 'class-validator';
import { EventStatus } from '../entities';

export class CreateEventDto {
  @IsString()
  @MaxLength(200)
  eventName!: string;

  @IsString()
  @MaxLength(50)
  eventCode!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  location?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;
}

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  eventName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  eventCode?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  location?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;
}
