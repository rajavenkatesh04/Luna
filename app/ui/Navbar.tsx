"use client"

import ToggleSwitch from "@/app/ui/ToggleSwitch";
import Link from "next/link";

export default function Navbar() {
    return(
        <nav className={`px-4 max-w-7xl my-5 mx-auto`}>
            <div className={`flex justify-between border border-gray-700 rounded-md p-4`}>
                <Link href={`/`}><h1 className={`font-bold hover:scale-120 transition-all duration-200`}>Luna.</h1></Link>

                <ul className={`flex gap-4`}>
                    <li><Link href={`/signup`}>Sign Up</Link></li>
                    <li><Link href={`/dashboard`}>Dashboard</Link></li>
                    <li><ToggleSwitch/></li>
                </ul>

            </div>
        </nav>
    )
}
