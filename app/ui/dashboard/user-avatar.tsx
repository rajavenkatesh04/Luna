// app/ui/dashboard/user-avatar.tsx

'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function UserAvatar({
                                       name,
                                       imageUrl,
                                   }: {
    name: string;
    imageUrl: string;
}) {
    const [src, setSrc] = useState(imageUrl);
    const fallbackSrc = '/placeholder-user.jpg';

    return (
        <Image
            src={src}
            alt={`${name}'s profile picture`}
            className="h-10 w-10 rounded-full border-2 border-gray-200 dark:border-zinc-700"
            width={40}
            height={40}
            onError={() => setSrc(fallbackSrc)}
        />
    );
}