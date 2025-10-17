// ============================================
// 1. src/dto/ScanDto.ts
// ============================================
export interface CreateScanDto {
    attendee_id: string;
    booth_id: string;
    event_id: string;
    notes?: string;
}

export interface ScanByTokenDto {
    attendee_token: string;
    booth_token: string;
    notes?: string;
}

export interface UpdateScanDto {
    notes?: string;
}
