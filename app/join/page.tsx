'use client';

import { useState, useRef, ChangeEvent, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { QrCodeIcon } from '@heroicons/react/24/outline';

// This is a placeholder for a real API call to check the event code
async function checkEventCode(code: string): Promise<boolean> {
    console.log("Validating code:", code);
    // In a real app, you would make a fetch request to an API endpoint:
    // const response = await fetch(`/api/events/check?code=${code}`);
    // const data = await response.json();
    // return data.isValid;

    // For demonstration, we'll use a simple mock validation
    return new Promise(resolve => {
        setTimeout(() => {
            if (code === 'LUNA25') {
                resolve(true);
            } else {
                resolve(false);
            }
        }, 1000); // Simulate network delay
    });
}


export default function JoinPage() {
    const [code, setCode] = useState<string[]>(new Array(6).fill(''));
    const [status, setStatus] = useState<'idle' | 'validating' | 'success' | 'error'>('idle');
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const router = useRouter();

    const handleInputChange = async (e: ChangeEvent<HTMLInputElement>, index: number) => {
        const value = e.target.value.toUpperCase();
        if (/^[A-Z0-9]$/.test(value) || value === '') {
            const newCode = [...code];
            newCode[index] = value;
            setCode(newCode);

            // Move to next input if a character is entered
            if (value && index < 5) {
                inputRefs.current[index + 1]?.focus();
            }

            // If all inputs are filled, trigger validation
            if (newCode.every(char => char !== '')) {
                setStatus('validating');
                const fullCode = newCode.join('');
                const isValid = await checkEventCode(fullCode);
                if (isValid) {
                    setStatus('success');
                    setTimeout(() => {
                        router.push(`/e/${fullCode}`);
                    }, 500); // Wait a moment to show success state
                } else {
                    setStatus('error');
                    // Reset code on error after a delay
                    setTimeout(() => {
                        setCode(new Array(6).fill(''));
                        setStatus('idle');
                        inputRefs.current[0]?.focus();
                    }, 1000);
                }
            }
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
        // Move to previous input on backspace if current input is empty
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    return (
        <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
            <div className="w-full max-w-md text-center">
                <h1 className="text-3xl font-bold">Join an Event</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Enter the 6-character event code below.</p>

                <div className="flex justify-center gap-2 md:gap-4 my-8">
                    {code.map((char, index) => (
                        <input
                            key={index}
                            ref={el => inputRefs.current[index] = el}
                            type="text"
                            maxLength={1}
                            value={char}
                            onChange={(e) => handleInputChange(e, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            className={clsx(
                                'w-12 h-14 md:w-16 md:h-20 text-center text-2xl md:text-4xl font-bold rounded-lg border-2 transition-all duration-300',
                                'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                                {
                                    'border-gray-300 dark:border-gray-600': status === 'idle',
                                    'border-blue-500 animate-pulse': status === 'validating',
                                    'border-green-500 text-green-500': status === 'success',
                                    'border-red-500 text-red-500 animate-shake': status === 'error',
                                }
                            )}
                            disabled={status === 'validating' || status === 'success'}
                        />
                    ))}
                </div>

                {status === 'error' && <p className="text-red-500">Invalid code. Please try again.</p>}

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-300 dark:border-gray-700" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="bg-gray-50 dark:bg-gray-900 px-2 text-gray-500">OR</span>
                    </div>
                </div>

                <button className="w-full flex items-center justify-center gap-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 font-medium hover:bg-gray-100 dark:hover:bg-gray-700">
                    <QrCodeIcon className="w-6 h-6" />
                    <span>Scan QR Code (Coming Soon!)</span>
                </button>
            </div>
        </main>
    );
}
