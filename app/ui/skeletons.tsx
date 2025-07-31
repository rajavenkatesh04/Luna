const shimmer =
    'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

// =================================================================================
// --- DASHBOARD OVERVIEW SKELETONS ---
// =================================================================================

function DashboardCardSkeleton() {
    return (
        <div className={`${shimmer} relative overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900`}>
            <div className="flex items-center">
                <div className="h-5 w-5 rounded-md bg-gray-200 dark:bg-zinc-800" />
                <div className="ml-2 h-4 w-20 rounded-md bg-gray-200 dark:bg-zinc-800" />
            </div>
            <div className="mt-2 flex items-center justify-center rounded-xl bg-gray-50 px-4 py-8 dark:bg-black/50">
                <div className="h-7 w-8 rounded-md bg-gray-200 dark:bg-zinc-800" />
            </div>
        </div>
    );
}

export function DashboardCardsSkeleton() {
    return (
        <>
            <DashboardCardSkeleton />
            <DashboardCardSkeleton />
        </>
    );
}

// =================================================================================
// --- EVENTS LIST SKELETONS (NEW) ---
// =================================================================================

function EventLinkSkeleton() {
    return (
        <div className={`${shimmer} relative overflow-hidden rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900`}>
            <div className="mb-3 flex items-center gap-3">
                <div className="h-6 w-1/2 rounded-md bg-gray-200 dark:bg-zinc-800" />
                <div className="h-5 w-14 rounded-md bg-gray-200 dark:bg-zinc-800" />
            </div>
            <div className="h-4 w-full rounded-md bg-gray-200 dark:bg-zinc-800" />
            <div className="mt-4 border-t border-gray-200 pt-4 dark:border-zinc-800">
                <div className="h-4 w-1/3 rounded-md bg-gray-200 dark:bg-zinc-800" />
            </div>
        </div>
    );
}

export function EventsListSkeleton() {
    return (
        <div className="space-y-4 py-8">
            <EventLinkSkeleton />
            <EventLinkSkeleton />
            <EventLinkSkeleton />
        </div>
    );
}

// =================================================================================
// --- RECENT EVENTS SKELETONS ---
// =================================================================================

function RecentEventRowSkeleton() {
    return (
        <div className="flex flex-row items-center justify-between py-4">
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <div className="h-5 w-40 rounded-md bg-gray-200 dark:bg-zinc-800" />
                    <div className="h-5 w-14 rounded-md bg-gray-200 dark:bg-zinc-800" />
                </div>
                <div className="mt-2 h-4 w-3/4 rounded-md bg-gray-200 dark:bg-zinc-800" />
            </div>
            <div className="ml-4 h-9 w-20 flex-shrink-0 rounded-md bg-gray-200 dark:bg-zinc-800" />
        </div>
    );
}

export function RecentEventsSkeleton() {
    return (
        <div className={`${shimmer} relative w-full overflow-hidden`}>
            <div className="mb-4 h-7 w-48 rounded-md bg-gray-200 dark:bg-zinc-800" />
            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="divide-y divide-gray-200 dark:divide-zinc-800">
                    <RecentEventRowSkeleton />
                    <RecentEventRowSkeleton />
                    <RecentEventRowSkeleton />
                </div>
            </div>
        </div>
    );
}

// =================================================================================
// --- SIDENAV SKELETON ---
// =================================================================================

export function SideNavSkeleton() {
    return (
        <div className={`${shimmer} relative flex h-full flex-col overflow-hidden bg-white px-3 py-4 dark:bg-zinc-900 md:px-2`}>
            <div className="mb-2 h-40 rounded-md bg-gray-200 dark:bg-zinc-800" />
            <div className="flex grow flex-row justify-between md:flex-col md:space-x-0 md:space-y-2">
                <div className="space-y-2">
                    <div className="h-[48px] rounded-md bg-gray-200 dark:bg-zinc-800" />
                    <div className="h-[48px] rounded-md bg-gray-200 dark:bg-zinc-800" />
                    <div className="h-[48px] rounded-md bg-gray-200 dark:bg-zinc-800" />
                </div>
                <div className="hidden h-auto w-full grow rounded-md md:block" />
                <div>
                    <div className="flex w-full items-center border-t border-gray-200 py-3 dark:border-zinc-800">
                        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-zinc-800" />
                        <div className="ml-2 hidden min-w-0 space-y-2 md:block">
                            <div className="h-4 w-24 rounded-md bg-gray-200 dark:bg-zinc-800" />
                            <div className="h-3 w-32 rounded-md bg-gray-200 dark:bg-zinc-800" />
                        </div>
                    </div>
                    <div className="h-[48px] w-full rounded-md bg-gray-200 dark:bg-zinc-800" />
                </div>
            </div>
        </div>
    );
}

// =================================================================================
// --- INVITATIONS SKELETONS (NEW) ---
// =================================================================================

function InvitationRowSkeleton() {
    return (
        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="space-y-2">
                <div className="h-4 w-64 rounded-md bg-gray-200 dark:bg-zinc-800" />
                <div className="h-6 w-48 rounded-md bg-gray-200 dark:bg-zinc-800" />
            </div>
            <div className="h-10 w-24 rounded-md bg-gray-200 dark:bg-zinc-800" />
        </div>
    );
}

export function InvitationsSkeleton() {
    return (
        <div className={`${shimmer} mt-6 space-y-4 overflow-hidden`}>
            <InvitationRowSkeleton />
            <InvitationRowSkeleton />
            <InvitationRowSkeleton />
        </div>
    );
}


// =================================================================================
// --- EVENT DETAILS PAGE SKELETON (NEW) ---
// =================================================================================

export function EventDetailsPageSkeleton() {
    return (
        <div className={`${shimmer} relative w-full overflow-hidden`}>
            {/* Breadcrumbs */}
            <div className="h-5 w-1/3 rounded-md bg-gray-200 dark:bg-zinc-800" />

            {/* Header */}
            <div className="mt-8 mb-8">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1 space-y-2">
                        <div className="h-8 w-3/4 rounded-md bg-gray-200 dark:bg-zinc-800" />
                        <div className="h-4 w-full rounded-md bg-gray-200 dark:bg-zinc-800 md:hidden" />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="h-9 w-32 rounded-md bg-gray-200 dark:bg-zinc-800" />
                        <div className="h-9 w-36 rounded-md bg-gray-200 dark:bg-zinc-800" />
                        <div className="h-9 w-12 rounded-md bg-gray-200 dark:bg-zinc-800" />
                        <div className="h-9 w-20 rounded-md bg-gray-200 dark:bg-zinc-800" />
                    </div>
                </div>
                <div className="hidden md:block mt-2 h-4 w-4/5 rounded-md bg-gray-200 dark:bg-zinc-800" />
            </div>

            {/* Tabs */}
            <div className="w-full">
                <div className="border-b border-gray-200 dark:border-zinc-800">
                    <div className="-mb-px flex space-x-8">
                        <div className="h-6 w-28 border-b-2 border-blue-500 py-4" />
                        <div className="h-6 w-20 py-4" />
                        <div className="h-6 w-24 py-4" />
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            <div className="py-6 mt-4 h-64 rounded-lg bg-gray-200 dark:bg-zinc-800" />
        </div>
    );
}


// =================================================================================
// --- EVENT FORM SKELETON (NEW) ---
// =================================================================================

export function EventFormSkeleton() {
    return (
        <div className={`${shimmer} relative w-full overflow-hidden`}>
            <div className="rounded-md border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 md:p-6">
                {/* Title field */}
                <div className="mb-4">
                    <div className="mb-2 h-5 w-20 rounded-md bg-gray-200 dark:bg-zinc-800" />
                    <div className="h-9 w-full rounded-md bg-gray-200 dark:bg-zinc-800" />
                </div>
                {/* Description field */}
                <div className="mb-4">
                    <div className="mb-2 h-5 w-24 rounded-md bg-gray-200 dark:bg-zinc-800" />
                    <div className="h-24 w-full rounded-md bg-gray-200 dark:bg-zinc-800" />
                </div>
            </div>
            {/* Action buttons */}
            <div className="mt-6 flex justify-end gap-4">
                <div className="h-10 w-24 rounded-lg bg-gray-200 dark:bg-zinc-800" />
                <div className="h-10 w-32 rounded-lg bg-gray-200 dark:bg-zinc-800" />
            </div>
        </div>
    );
}


// =================================================================================
// --- ANNOUNCEMENTS TAB SKELETON (NEW) ---
// =================================================================================

function AnnouncementFormSkeleton() {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-2 h-5 w-48 rounded-md bg-gray-200 dark:bg-zinc-800" />
            <div className="mb-2 h-9 w-full rounded-md bg-gray-200 dark:bg-zinc-800" />
            <div className="mb-4 h-24 w-full rounded-md bg-gray-200 dark:bg-zinc-800" />
            <div className="flex items-center justify-between">
                <div className="h-6 w-32 rounded-md bg-gray-200 dark:bg-zinc-800" />
                <div className="h-10 w-40 rounded-md bg-gray-200 dark:bg-zinc-800" />
            </div>
        </div>
    );
}

function PostedAnnouncementSkeleton() {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2 pr-4">
                    <div className="h-5 w-3/5 rounded-md bg-gray-200 dark:bg-zinc-800" />
                    <div className="h-4 w-full rounded-md bg-gray-200 dark:bg-zinc-800" />
                    <div className="h-4 w-5/6 rounded-md bg-gray-200 dark:bg-zinc-800" />
                </div>
                <div className="h-5 w-5 rounded-md bg-gray-200 dark:bg-zinc-800" />
            </div>
            <div className="mt-3 border-t border-gray-200 pt-3 dark:border-zinc-800">
                <div className="h-4 w-1/2 rounded-md bg-gray-200 dark:bg-zinc-800" />
            </div>
        </div>
    );
}

export function AnnouncementsTabSkeleton() {
    return (
        <div className={`${shimmer} relative w-full overflow-hidden`}>
            <AnnouncementFormSkeleton />
            <div className="mt-8">
                <div className="mb-4 h-6 w-40 rounded-md bg-gray-200 dark:bg-zinc-800" />
                <div className="space-y-4">
                    <PostedAnnouncementSkeleton />
                    <PostedAnnouncementSkeleton />
                </div>
            </div>
        </div>
    );
}


// =================================================================================
// --- ADMINS TAB SKELETON (NEW) ---
// =================================================================================

function AdminRowSkeleton() {
    return (
        <div className="flex items-center justify-between px-6 py-4">
            <div className="space-y-2">
                <div className="h-5 w-32 rounded-md bg-gray-200 dark:bg-zinc-800" />
                <div className="h-4 w-48 rounded-md bg-gray-200 dark:bg-zinc-800" />
            </div>
            <div className="h-5 w-16 rounded-md bg-gray-200 dark:bg-zinc-800" />
        </div>
    );
}

export function AdminsTabSkeleton() {
    return (
        <div className={`${shimmer} w-full space-y-8 overflow-hidden`}>
            {/* Header */}
            <div className="space-y-1">
                <div className="h-6 w-40 rounded-md bg-gray-200 dark:bg-zinc-800" />
                <div className="h-4 w-72 rounded-md bg-gray-200 dark:bg-zinc-800" />
            </div>
            {/* Invite Form */}
            <div className="space-y-2">
                <div className="h-5 w-32 rounded-md bg-gray-200 dark:bg-zinc-800" />
                <div className="flex h-16 items-center gap-3 rounded-lg border border-gray-200 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="h-9 flex-1 rounded-md bg-gray-200 dark:bg-zinc-800" />
                    <div className="h-10 w-28 rounded-md bg-gray-200 dark:bg-zinc-800" />
                </div>
            </div>
            {/* Admin List */}
            <div className="space-y-2">
                <div className="h-5 w-36 rounded-md bg-gray-200 dark:bg-zinc-800" />
                <div className="rounded-lg border border-gray-200 dark:border-zinc-800">
                    <div className="divide-y divide-gray-200 dark:divide-zinc-800">
                        <AdminRowSkeleton />
                        <AdminRowSkeleton />
                    </div>
                </div>
            </div>
        </div>
    );
}

// =================================================================================
// --- PUBLIC ANNOUNCEMENT FEED SKELETONS (NEW) ---
// =================================================================================

function PublicAnnouncementSkeleton() {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-2">
                <div className="h-6 w-1/2 rounded-md bg-gray-200 dark:bg-zinc-800" />
            </div>
            <div className="mt-3 space-y-2">
                <div className="h-4 w-full rounded-md bg-gray-200 dark:bg-zinc-800" />
                <div className="h-4 w-5/6 rounded-md bg-gray-200 dark:bg-zinc-800" />
            </div>
            <div className="mt-4 flex items-center gap-4 border-t border-gray-200 pt-3 dark:border-zinc-800">
                <div className="h-4 w-1/3 rounded-md bg-gray-200 dark:bg-zinc-800" />
            </div>
        </div>
    );
}

export function AnnouncementsFeedSkeleton() {
    return (
        <div className={`${shimmer} w-full space-y-4 overflow-hidden`}>
            <PublicAnnouncementSkeleton />
            <PublicAnnouncementSkeleton />
            <PublicAnnouncementSkeleton />
        </div>
    );
}