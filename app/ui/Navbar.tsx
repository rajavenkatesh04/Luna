"use client"

import ToggleSwitch from "@/app/ui/ToggleSwitch";
import Link from "next/link";
import {useState} from "react";

export default function Navbar() {

    const [isOpen, setIsOpen] = useState(false);


    const toggleMobileMenu = () => {
        setIsOpen(!isOpen);
    };

    return(
        <nav className={`max-w-7xl mx-auto backdrop-blur-md border-b border-white/20 sticky top-0 z-50`}>
            <div className={`p-4 flex justify-between items-center`}>
                <Link href={`/`}><h1 className={`text-xl hover:scale-120 hover:bg-clip-text hover:text-transparent hover:bg-gradient-to-r from-green-300 to-emerald-600 transition-transform duration-300`}>Luna.</h1></Link>

                {/*Desktop Navbar*/}
                <div className={`hidden md:block`}>
                    <ul className={`flex gap-4 justify-between`}>
                        <li className={`hover:scale-120 hover:bg-clip-text hover:text-transparent hover:bg-gradient-to-r from-green-300 to-emerald-600 transition-transform duration-300`}><Link href={`/login`}>Login</Link></li>
                        <li className={`hover:scale-120 hover:bg-clip-text hover:text-transparent hover:bg-gradient-to-r from-green-300 to-emerald-600 transition-transform duration-300`}><Link href={`/dashboard`}>Dashboard</Link></li>
                        <li className={`hover:scale-120 hover:bg-clip-text hover:text-transparent hover:bg-gradient-to-r from-green-300 to-emerald-600 transition-transform duration-300`}><ToggleSwitch /></li>
                    </ul>
                </div>

                {/* Hamburger Menu Button */}
                <button
                    onClick={toggleMobileMenu}
                    className={`md:hidden flex flex-col justify-center items-center w-6 h-6 space-y-1 `}
                    aria-label="Toggle mobile menu"
                >
                    {/* These three divs create the classic "hamburger" lines */}
                    <div className={`w-5 h-0.5 bg-current transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
                    <div className={`w-5 h-0.5 bg-current transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`}></div>
                    <div className={`w-5 h-0.5 bg-current transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
                </button>
            </div>

            {/*    Mobile Navbar*/}
            <div className={`overflow-hidden transition-max-height duration-500 ease-in-out ${isOpen ? 'max-h-60' : 'max-h-0'} md:hidden `}>
                <ul className={`border-t space-y-4 p-5`}>
                    <li><Link href={`/signup`} onClick={() => setIsOpen(false)}>Sign Up</Link></li>
                    <li><Link href={`/dashboard`} onClick={() => setIsOpen(false)}>Dashboard</Link></li>
                    <li><ToggleSwitch/></li>
                </ul>
            </div>

        </nav>
    )
}