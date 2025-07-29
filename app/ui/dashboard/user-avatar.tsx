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
            className="h-10 w-10 rounded-full"
            width={40}
            height={40}
            // The onError event is now safely handled within a Client Component
            onError={() => setSrc(fallbackSrc)}
        />
    );
}