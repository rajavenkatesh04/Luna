"use client"

import ToggleSwitch from "@/app/ui/ToggleSwitch";
import Link from "next/link";
import {useState} from "react";

export default function Navbar() {

    const [isOpen, setIsOpen] = useState(false);


    // const toggleMobileMenu = () => {
    //     setIsOpen(!isOpen);
    // };

    return(
        <nav className={`flex mx-auto max-w-7xl justify-between text-center p-4 `}>
            <Link href={`/`}><h1 className={`text-xl hover:scale-120 hover:bg-clip-text hover:text-transparent hover:bg-gradient-to-r from-green-300 to-emerald-600 transition-transform duration-300`}>Luna.</h1></Link>
            <ul className={`flex gap-4 justify-between`}>
                <li className={`hover:scale-120 hover:bg-clip-text hover:text-transparent hover:bg-gradient-to-r from-green-300 to-emerald-600 transition-transform duration-300`}><Link href={`/login`}>Login</Link></li>
                <li className={`hover:scale-120 hover:bg-clip-text hover:text-transparent hover:bg-gradient-to-r from-green-300 to-emerald-600 transition-transform duration-300`}><Link href={`/dashboard`}>Dashboard</Link></li>
                <li className={`hover:scale-120 hover:bg-clip-text hover:text-transparent hover:bg-gradient-to-r from-green-300 to-emerald-600 transition-transform duration-300`}><ToggleSwitch /></li>
            </ul>

        </nav>
    )
}