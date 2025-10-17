// ============================================
// 1. src/dto/BoothDto.ts
// ============================================
export interface CreateBoothDto {
    event_id: string;
    booth_number: string;
    booth_name: string;
    company?: string;
    description?: string;
    location?: string;
}

export interface UpdateBoothDto {
    booth_number?: string;
    booth_name?: string;
    company?: string;
    description?: string;
    location?: string;
}

export interface BatchCreateBoothDto {
    event_id: string;
    booths: Omit<CreateBoothDto, 'event_id'>[];
}
