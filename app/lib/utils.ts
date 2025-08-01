export const generatePagination = (currentPage: number, totalPages: number) => {
    // If the total number of pages is 7 or less,
    // display all pages without any ellipsis.
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // If the current page is among the first 3 pages,
    // show the first 3, an ellipsis, and the last 2 pages.
    if (currentPage <= 3) {
        return [1, 2, 3, '...', totalPages - 1, totalPages];
    }

    // If the current page is among the last 3 pages,
    // show the first 2, an ellipsis, and the last 3 pages.
    if (currentPage >= totalPages - 2) {
        return [1, 2, '...', totalPages - 2, totalPages - 1, totalPages];
    }

    // If the current page is somewhere in the middle,
    // show the first page, an ellipsis, the current page and its neighbors,
    // another ellipsis, and the last page.
    return [
        1,
        '...',
        currentPage - 1,
        currentPage,
        currentPage + 1,
        '...',
        totalPages,
    ];
};



export function formatRelativeDate(timestamp: { seconds: number; nanoseconds: number; } | undefined): string {
    if (!timestamp) return '';

    const date = new Date(timestamp.seconds * 1000);
    const now = new Date();

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);

    const timeFormatter = new Intl.DateTimeFormat('en-IN', { timeStyle: 'short' });

    if (date >= startOfToday) {
        return `Today at ${timeFormatter.format(date)}`;
    } else if (date >= startOfYesterday) {
        return `Yesterday at ${timeFormatter.format(date)}`;
    } else {
        const dateFormatter = new Intl.DateTimeFormat('en-IN', { dateStyle: 'long' });
        return dateFormatter.format(date);
    }
}