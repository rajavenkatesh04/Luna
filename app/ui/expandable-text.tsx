'use client';

import { useState, useMemo } from 'react';
import { clsx } from 'clsx';

export default function ExpandableText({ text }: { text: string | undefined }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const canBeClamped = useMemo(() => text && text.length > 280, [text]);

    if (!text) {
        return <p className="text-lg italic text-gray-500 dark:text-zinc-500">No description provided.</p>;
    }

    return (
        <div>
            <p className={clsx(
                'text-lg text-gray-600 dark:text-zinc-400 leading-relaxed transition-all duration-500',
                { 'line-clamp-4': !isExpanded && canBeClamped }
            )}>
                {text}
            </p>
            {canBeClamped && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-4 text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                    {isExpanded ? 'Show less' : 'Show more'}
                </button>
            )}
        </div>
    );
}