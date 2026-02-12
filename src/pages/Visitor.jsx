import React, { useEffect, useState } from "react";
import API from "../instance/TokenInstance";
import { notification, Pagination } from "antd";
import { Link } from "react-router-dom";
import Sidebar from "../components/layouts/Sidebar";
import Navbar from "../components/layouts/Navbar";
import { NavbarMenu } from "../data/menu";

import {
    Users,
    IndianRupee,
    ChevronRight,
    Zap,
    ClipboardCheck,
    Lightbulb, // Added for Quick Tips
} from "lucide-react";

import DataTable from "../components/layouts/Datatable";

function Visitor() {
    return (
        <>
            <Navbar />

            {/* ---------------- LAYOUT ---------------- */}
            <div className="flex w-screen mt-14 bg-gray-50 min-h-screen">
                <Sidebar />

                {/* MAIN CONTENT AREA */}
                <div className="flex-1 p-6 md:p-8 overflow-y-auto">

                    {/* HEADER */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                            Visitor Details
                        </h2>
                        <p className="text-gray-500 mt-2 text-sm">
                            Overview of portal visitors and activity.
                        </p>
                    </div>

                    {/* ================= CARD SECTION (Matching UserMenu Style) ================= */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Visitor Card */}
                        <Link to="/visitor-list" className="group block">
                            <div className="relative h-full overflow-hidden rounded-xl bg-white border border-blue-200 shadow-md hover:shadow-lg transition-all duration-300">
                                
                                {/* Background Gradient Blob */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-600 to-blue-700 opacity-5 group-hover:opacity-10 rounded-full -mr-16 -mt-16 transition-all duration-300 blur-xl" />

                                <div className="relative p-7">
                                    
                                    {/* Icon */}
                                    <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-50 rounded-lg mb-5 group-hover:scale-105 transition-transform duration-300">
                                        <Users size={28} className="text-blue-600" />
                                    </div>

                                    {/* Text Content */}
                                    <div className="mb-5">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-950 transition-colors">
                                            Visitor List
                                        </h3>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            Manage visitor records and daily logs efficiently.
                                        </p>
                                    </div>

                                    {/* Bottom Stats & Arrow */}
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 group-hover:border-gray-200 transition-colors">
                                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide group-hover:text-gray-700 transition-colors">
                                            Active Visitors
                                        </span>
                                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 opacity-0 group-hover:opacity-100 transform translate-x-1 group-hover:translate-x-0 transition-all duration-300">
                                            <ChevronRight className="w-4 h-4 text-white" />
                                        </div>
                                    </div>
                                </div>

                                {/* Top Accent Line on Hover */}
                                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                        </Link>


                    </div>
                    {/* ================= END CARD SECTION ================= */}

                    {/* ================= QUICK TIPS SECTION (Updated to Match Reference Style) ================= */}
                    <div className="mt-16 p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <Zap className="w-6 h-6 text-blue-600 mt-1" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">Quick Tips</h3>
                                <p className="text-slate-700 mb-2">
                                    Use the <span className="font-bold">Visitor List</span> to manage visitor information, update entry/exit times, and track visitor history all in one place.
                                </p>
                                <p className="text-slate-700">
                                    Click on the card above to view all registered visitors or add a new entry using the "+ Add Details" button inside the list.
                                </p>
                            </div>
                        </div>
                    </div>
                    {/* ================= END QUICK TIPS ================= */}

                </div>
            </div>
        </>
    );
}

export default Visitor;