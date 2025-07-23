"use client"

import { useTheme } from 'next-themes';
import { MoonIcon , SunIcon } from '@heroicons/react/24/outline';

export default function ToggleSwitch() {
    const { theme, setTheme } = useTheme();

    function handleToggle() {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    }

    return (
        <button
            onClick={handleToggle}
            className={`transition duration-300 ease-in-out transform hover:scale-110`}
        >
            {theme === 'dark' ?
                <MoonIcon className={`w-6 h-6 text-blue-500 transition-opacity duration-500 opacity-100`}/>
                :
                <SunIcon className={`w-6 h-6 text-yellow-400 transition-opacity duration-500 opacity-100`}/>}

        </button>
    );
}
