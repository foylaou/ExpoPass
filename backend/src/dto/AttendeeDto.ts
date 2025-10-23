// ============================================
// 1. src/dto/AttendeeDto.ts
// ============================================
export interface CreateAttendeeDto {
    event_id: string;
    name: string;
    email?: string;
    company?: string;
    title?: string;
    phone?: string;
    avatar_url?: string;
    badge_number?: string;
}

export interface UpdateAttendeeDto {
    name?: string;
    email?: string;
    company?: string;
    title?: string;
    phone?: string;
    avatar_url?: string;
    badge_number?: string;
}

export interface BatchCreateAttendeeDto {
    event_id: string;
    attendees: Omit<CreateAttendeeDto, 'event_id'>[];
}
