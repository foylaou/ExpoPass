// ============================================
// 1. src/dto/BoothDto.ts
// ============================================
export interface CreateBoothDto {
    eventId: string;
    boothNumber: string;
    boothName: string;
    company?: string;
    description?: string;
    location?: string;
}

export interface UpdateBoothDto {
    boothNumber?: string;
    boothName?: string;
    company?: string;
    description?: string;
    location?: string;
}

export interface BatchCreateBoothDto {
    eventId: string;
    booths: Omit<CreateBoothDto, 'eventId'>[];
}
