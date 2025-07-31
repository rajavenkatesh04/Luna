'use client';

import { useState, useRef, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { QrCodeIcon, ArrowDownTrayIcon, DocumentDuplicateIcon, CheckIcon } from '@heroicons/react/24/outline';

export default function QrCodeDisplay({ eventId }: { eventId: string }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [publicUrl, setPublicUrl] = useState('');
    const qrCodeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setPublicUrl(`${window.location.origin}/e/${eventId}`);
        }
    }, [eventId]);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
        setCopied(false);
    };

    const downloadQRCode = () => {
        const canvas = qrCodeRef.current?.querySelector('canvas');
        if (canvas) {
            const pngUrl = canvas
                .toDataURL("image/png")
                .replace("image/png", "image/octet-stream");
            const downloadLink = document.createElement("a");
            downloadLink.href = pngUrl;
            downloadLink.download = `${eventId}-qrcode.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    };

    const copyToClipboard = () => {
        if (publicUrl) {
            navigator.clipboard.writeText(publicUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <>
            <button
                onClick={openModal}
                className="flex items-center gap-2 rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-700 shadow-sm hover:bg-gray-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
                <QrCodeIcon className="h-4 w-4" />
                QR Code
            </button>

            {isModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
                    onClick={closeModal}
                >
                    <div
                        className="flex flex-col items-center rounded-lg border border-gray-200 bg-white p-6 text-center shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-zinc-100">Event QR Code</h3>

                        {/* The white background ensures the QR code is scannable in any mode */}
                        <div className="inline-block rounded-md bg-white p-2" ref={qrCodeRef}>
                            {publicUrl ? (
                                <QRCodeCanvas value={publicUrl} size={192} level="H" includeMargin={true} />
                            ) : (
                                <div style={{ width: 192, height: 192 }} className="flex items-center justify-center bg-gray-200">
                                    <p className="text-xs text-gray-500">Loading...</p>
                                </div>
                            )}
                        </div>
                        <p className="mt-2 max-w-xs break-all text-xs text-gray-500 dark:text-zinc-400">
                            {publicUrl || 'Generating link...'}
                        </p>

                        <div className="mt-6 flex gap-4">
                            <button onClick={downloadQRCode} className="flex items-center gap-2 rounded-md bg-gray-100 px-4 py-2 text-sm text-gray-800 hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700">
                                <ArrowDownTrayIcon className="h-4 w-4" />
                                Download
                            </button>
                            <button onClick={copyToClipboard} className="flex w-[110px] items-center justify-center gap-2 rounded-md bg-gray-100 px-4 py-2 text-sm text-gray-800 hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700">
                                {copied ? <CheckIcon className="h-4 w-4 text-green-500" /> : <DocumentDuplicateIcon className="w-4 h-4" />}
                                {copied ? 'Copied!' : 'Copy Link'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}