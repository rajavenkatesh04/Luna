// app/lib/definitions.ts

// ==================================
// 1. Core Platform Models
// These define the main entities of our application: Users and the Workspaces they own.
// ==================================

export type User = {
    uid: string;
    email: string;
    displayName: string;
    organizationId: string; // The primary organization/workspace this user owns.
    collaboratingOn?: string[]; // An array of Event docIds they are an admin for.
};

export type Organization = {
    id: string;
    name: string;
    ownerUid: string;
    subscriptionTier: 'free' | 'pro' | 'enterprise';
};

export type AttendeeSession = {
    id: string; // Can be anonymous ID or user ID if they choose to sign in
    eventId: string;
    deviceId: string; // Generated browser fingerprint for anonymous users
    displayName?: string; // Optional - they can set this themselves
    joinedAt: { seconds: number; nanoseconds: number; };
    lastSeen: { seconds: number; nanoseconds: number; };
    isActive: boolean; // Updated via heartbeat to track who's still viewing
};


// ==================================
// 2. Event-Specific Models
// These define the structure of an Event and all the content within it.
// ==================================

export type Event = {
    docId: string;
    id: string;
    organizationId: string;
    title: string;
    description: string;
    // Enhanced admin structure with clearer permissions
    admins: {
        [uid: string]: {
            role: 'owner' | 'admin';
            addedBy: string;
            addedAt: string | { seconds: number; nanoseconds: number; };
            // Specific permissions for granular control
            canInviteAdmins: boolean;
            canCreateAnnouncements: boolean;
            canDeleteAnnouncements: boolean;
        };
    };
    // Analytics tracking
    totalViews: number; // Lifetime view count
    activeViewers: number; // Current active viewers
    subscriberCount: number; // People who've created attendee sessions
    isActive: boolean;
    createdAt: string | { seconds: number; nanoseconds: number; };
};

export type Announcement = {
    id: string;
    authorName: string;
    authorId: string;
    title: string;
    content: string;
    isPinned?: boolean;
    createdAt: {
        seconds: number;
        nanoseconds: number;
    };
};

export type Poll = {
    id: string;
    eventId: string;
    creatorUid: string;
    question: string;
    options: { [optionText: string]: number };
    voters?: string[];
    isPinned?: boolean;
    createdAt: {
        seconds: number;
        nanoseconds: number;
    };
};


// ==================================
// 3. System Models
// These are used for internal processes, like invitations.
// ==================================

export type Invite = {
    id: string;
    type: 'event-admin';
    organizationId: string;
    eventId: string;
    inviterUid: string; // Who sent the invitation
    inviteeEmail: string; // Email of person being invited
    proposedRole: 'admin'; // What role they'll have if they accept
    status: 'pending' | 'accepted' | 'declined' | 'expired';
    createdAt: { seconds: number; nanoseconds: number; };
    expiresAt: { seconds: number; nanoseconds: number; };
    acceptedBy?: string; // uid when accepted
    acceptedAt?: { seconds: number; nanoseconds: number; };
    declinedAt?: { seconds: number; nanoseconds: number; };
};
