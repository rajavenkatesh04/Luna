'use client';

import { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { QrCodeIcon, ArrowDownTrayIcon, DocumentDuplicateIcon, CheckIcon } from '@heroicons/react/24/outline';

export default function QrCodeDisplay({ eventId }: { eventId: string }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const qrCodeRef = useRef<HTMLDivElement>(null);

    const publicUrl = `${window.location.origin}/e/${eventId}`;

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
        navigator.clipboard.writeText(publicUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <>
            <button
                onClick={openModal}
                className="flex items-center gap-2 px-4 py-2 text-sm border rounded-md shadow-sm hover:bg-gray-500"
            >
                <QrCodeIcon className="w-4 h-4" />
                Show QR Code
            </button>

            {isModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
                    onClick={closeModal}
                >
                    <div
                        className="p-6 bg-white rounded-lg shadow-xl text-center flex flex-col items-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Event QR Code</h3>

                        <div className="p-2 bg-gray-100 rounded-md inline-block" ref={qrCodeRef}>
                            <QRCodeCanvas value={publicUrl} size={192} level="H" includeMargin={true} />
                        </div>
                        <p className="mt-2 text-xs text-gray-500 break-all">{publicUrl}</p>

                        <div className="flex gap-4 mt-6">
                            <button onClick={downloadQRCode} className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-200 rounded-md hover:bg-gray-300">
                                <ArrowDownTrayIcon className="w-4 h-4" />
                                Download
                            </button>
                            <button onClick={copyToClipboard} className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-200 rounded-md hover:bg-gray-300">
                                {copied ? <CheckIcon className="w-4 h-4 text-green-600" /> : <DocumentDuplicateIcon className="w-4 h-4" />}
                                {copied ? 'Copied!' : 'Copy Link'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}