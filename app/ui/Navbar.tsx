"use client"

import ToggleSwitch from "@/app/ui/ToggleSwitch";
import Link from "next/link";
import {logout} from "@/app/lib/actions";
import {useState} from "react";

export default function Navbar() {

    const [isOpen, setIsOpen] = useState(false);


    const toggleMobileMenu = () => {
        setIsOpen(!isOpen);
    };

    return(
        <nav className={`max-w-7xl mx-auto`}>
            <div className={`p-4 flex justify-between items-center border-b border-b-gray-700`}>
                <Link href={`/`}>
                    <h1 className={`font-bold text-2xl hover:scale-120 transition-all duration-200`}>Luna.</h1>
                </Link>

                {/* Desktop Navbar */}
                <div className={`hidden md:block`}>
                    <ul className={`flex gap-4`}>
                        <li><Link href={`/signup`}>Sign Up</Link></li>
                        <li><Link href={`/dashboard`}>Dashboard</Link></li>
                        <li><ToggleSwitch/></li>
                    </ul>
                </div>

                {/* Hamburger Menu Button - this is what you were missing */}
                <button
                    onClick={toggleMobileMenu}
                    className={`md:hidden flex flex-col justify-center items-center w-6 h-6 space-y-1`}
                    aria-label="Toggle mobile menu"
                >
                    {/* These three divs create the classic "hamburger" lines */}
                    <div className={`w-5 h-0.5 bg-current transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
                    <div className={`w-5 h-0.5 bg-current transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`}></div>
                    <div className={`w-5 h-0.5 bg-current transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
                </button>
            </div>

            {/* Mobile Navbar - improved positioning */}
            <div className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}>
                <ul className={`flex flex-col gap-4 pt-4`}>
                    <li><Link href={`/signup`} onClick={() => setIsOpen(false)}>Sign Up</Link></li>
                    <li><Link href={`/dashboard`} onClick={() => setIsOpen(false)}>Dashboard</Link></li>
                    <li><ToggleSwitch/></li>
                </ul>
            </div>
        </nav>
    )
}