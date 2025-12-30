// src/components/Navbar.jsx
import React from "react";
import { useNavigate } from "react-router";
import { Wrench, LogOut } from "lucide-react"; // icons

export default function Navbar() {
    const navigate = useNavigate();

    return (
        <nav className="absolute top-6 left-1/2 transform -translate-x-1/2 
                w-[90%] md:w-[80%] 
                bg-white/70 backdrop-blur-lg shadow-lg 
                rounded-2xl px-8 py-4 flex justify-between items-center z-50">

            {/* Firm Logo */}
            <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-400 p-2 rounded-full shadow-md">
                    <Wrench className="w-7 h-7 text-white" />
                </div>
                <span className="text-xl md:text-2xl font-bold text-gray-800 font-montserrat">
                    Jay GAJANAN Firm
                </span>
            </div>

            {/* Logout Button */}
            <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 px-5 py-2 
               bg-gradient-to-r from-rose-500 via-red-500 to-pink-500 
               text-white font-semibold rounded-full
               shadow-md hover:shadow-xl hover:scale-105 
               transition-all duration-300 ease-in-out"
            >
                <LogOut className="w-5 h-5" />
                Logout
            </button>
        </nav>

    );
}
