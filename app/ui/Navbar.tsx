"use client"

import ToggleSwitch from "@/app/ui/ToggleSwitch";

export default function Navbar() {
    return(
        <nav className={`max-w-7xl my-5 mx-auto`}>
            <div className={`flex justify-between border border-gray-700 rounded-md p-4`}>
                <h1>Luna.</h1>
                <ToggleSwitch />
            </div>
        </nav>
    )
}
