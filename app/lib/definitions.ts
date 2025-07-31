export interface User {
    uid: string;
    email: string;
    displayName: string;
    organizationId: string;
    role: 'user' | 'admin' | 'owner' | 'master' ;
}

export interface Organisation {
    id: string;
    name: string;
    ownerUid: string;
    subscriptionTier: 'free' | 'pro' | 'enterprise';
}

// This is the blueprint for a single Event document in Firestore.

export type Event = {
    docId: string;
    id: string;
    title: string;
    description: string;
    ownerUid: string;
    admins: string[];
// When we pass this from a Server to a Client Component, it must be a string.
    createdAt: string | { seconds: number; nanoseconds: number; };
};

export type Announcement = {
    id: string;
    authorName: string;
    authorId: string;
    title: string;
    content: string;
    isPinned?: boolean; // Optional property for pinning
    createdAt: {
        seconds: number;
        nanoseconds: number;
    };
};


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