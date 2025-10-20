


export interface Attendee {
    id: string;
    name: string;
    email?: string;
    company?: string;
    title?: string;
    phone?: string;
    qrCodeToken: string;
    avatarUrl?: string;
    badgeNumber?: string;

}

export interface CreateAttendee {
    name: string;
    email?: string;
    company?: string;
    title?: string;
    phone?: string;
    avatarUrl?: string;
    badgeNumber?: string;
}


export interface getAllAttendeesRequest {
    eventId: string;
}
export interface getAllAttendeesResponse {
    attendees: Attendee[];
}


//
export interface CreateAttendeeRequest {
    eventId: string;
    name: string;
    email?: string;
    company?: string;
    title?: string;
    phone?: string;
    avatarUrl?: string;
    badgeNumber?: string;
}

export interface SearchAttendeeRequest {
    eventId: string;
    keywords: string;
}


export interface GetAttendeeByTokenRequest {
    token: string;
}

export interface GetAttendeeByIdRequest {
    id: string;
}
export interface CreateAttendeeResponse {
    attendee: Attendee;
}

export interface PutAttendeeByIdRequest {
    id: string;
}
export interface UpdateAttendeeRequest {
    attendee: Attendee;
}


export interface BatchAddAttendeeRequest {
    eventId: string;
    attendee: CreateAttendee[];

}
export interface BatchAttendeeResponse {
    data: Attendee[];
    count: number;
}


