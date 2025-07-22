export interface User {
    uid: string;
    email: string;
    organisationId: string;
    role: 'user' | 'admin' | 'owner' | 'master' ;
}

export interface Organisation {
    id: string;
    name: string;
    ownerUid: string;
    subscriptionTier: 'free' | 'pro' | 'enterprise';
}

export interface Event {
    id: string;
    title: string;
    description: string;
    organisationId: string;
    creatorUid: string;
    timeStamp: Date;
}

export interface Announcement {
    id: string;
    title: string;
    content: string;
    isPinned?: boolean;
    eventId: string;
    creatorUid: string;
    timeStamp: Date;
}

export interface Poll {
    id: string;
    question: string;
    options: { [optionText: string]: number};
    voters?: string[];
    isPinned?: boolean;
    eventId: string;
    creatorUid: string;
    timeStamp: Date;
}



