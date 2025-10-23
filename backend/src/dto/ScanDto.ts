// ============================================
// 1. src/dto/ScanDto.ts
// ============================================
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateScanDto {
    @IsString()
    @IsNotEmpty()
    attendee_id!: string;

    @IsString()
    @IsNotEmpty()
    booth_id!: string;

    @IsString()
    @IsNotEmpty()
    event_id!: string;

    @IsString()
    @IsOptional()
    notes?: string;
}

export class ScanByTokenDto {
    @IsString()
    @IsNotEmpty()
    attendee_token!: string;

    @IsString()
    @IsNotEmpty()
    booth_token!: string;

    @IsString()
    @IsOptional()
    notes?: string;
}

export class UpdateScanDto {
    @IsString()
    @IsOptional()
    notes?: string;
}
