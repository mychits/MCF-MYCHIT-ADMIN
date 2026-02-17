/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import API from "../instance/TokenInstance";
import { notification, Pagination } from "antd";
import { Link } from "react-router-dom";
import Sidebar from "../components/layouts/Sidebar";
import Navbar from "../components/layouts/Navbar";
import { NavbarMenu } from "../data/menu";
import { Users, IndianRupee, ChevronRight, Zap, ClipboardCheck, X, Eye, UserPlus, AlertCircle } from "lucide-react"; // Added AlertCircle
import DataTable from "../components/layouts/Datatable";
import BaseURL from "../instance/BaseUrl";
import CircularLoader from "../components/loaders/CircularLoader";


function Supports() {
    const [api, contextHolder] = notification.useNotification();

    // --- LOADING STATE ---
    const [isLoading, setIsLoading] = useState(true);

    // --- IMAGE PREVIEW STATE ---
    const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
    const [previewImageSrc, setPreviewImageSrc] = useState("");

    const [complaints, setComplaints] = useState([]);
    const [totalComplaints, setTotalComplaints] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [activeTab, setActiveTab] = useState(null);

    // State for Admins/Sub-Admins fetched from /admin/get-sub-admins
    const [agents, setAgents] = useState([]);

    const [assignListModalOpen, setAssignListModalOpen] = useState(false);
    const [assignMode, setAssignMode] = useState(false);
    const [openActionId, setOpenActionId] = useState(null);
    const [viewMode, setViewMode] = useState("view");
    const [viewEditModalOpen, setViewEditModalOpen] = useState(false);
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [selectedAgent, setSelectedAgent] = useState("");


    const [filters, setFilters] = useState({
        subject: "",
        department: "",
        assignedTo: "",
        status: "",
        fromDate: "",
        toDate: "",
    });

    // --- HELPER: Format Date to DD/MM/YYYY ---
    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // --- HELPER: GET ASSIGNEE NAME ---
    // Matches logic from reference: resolves ID to Name using the fetched 'agents' list
    const getAssigneeName = (item) => {
        // 1. If name is explicitly stored (denormalized), use it
        if (item.assignedToName) return item.assignedToName;

        // 2. Handle null/undefined
        if (!item.assignedTo) return "Unassigned";

        // 3. Handle case where assignedTo is an Object
        if (typeof item.assignedTo === "object" && item.assignedTo.name) {
            return item.assignedTo.name;
        }

        // 4. Handle case where assignedTo is a String ID
        // Look up the ID in the 'agents' list fetched from /admin/get-sub-admins
        if (typeof item.assignedTo === "string") {
            const agent = agents.find(a => String(a._id) === String(item.assignedTo));
            return agent ? agent.name : "Unknown Admin";
        }

        return "Unassigned";
    };

    const designationCategories = {
        "Management & Leadership": [
            "Director",
            "Sales Manager",
            "Assistant Office Manager",
            "Senior Coordinator",
        ],
        "Sales & Collection": [
            "Sales with Collection",
            "Collection Procurement Executive",
        ],
        "Office & Administration": [
            "Front Office Executive",
            "Office Assistant",
        ],
        "Technical / IT": [
            "Full Stack Developer",
        ],
        "Creative": [
            "Graphic Designer",
        ],
        "OTHERS": [
            "others",
        ],
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value,
        }));
        setCurrentPage(1);
    };

    // --- NEW: Handle Dashboard Card Click ---
    const handleCardClick = (status) => {
        if (filters.status === status) {
            // If already selected, clear the filter
            setFilters(prev => ({ ...prev, status: "" }));
        } else {
            // Set the filter
            setFilters(prev => ({ ...prev, status: status }));
        }
    };

    const handleAttachmentClick = (url, fileName) => {
        if (fileName && fileName.toLowerCase().endsWith('.pdf')) {
            window.open(url, '_blank');
        } else {
            setPreviewImageSrc(url);
            setImagePreviewOpen(true);
        }
    };

    const columns = [
        { key: "sl", header: "SL" },
        { key: "name", header: "Name" },
        { key: "mobile", header: "Mobile" },
        { key: "subject", header: "Subject" },
        { key: "assignedName", header: "Assigned To" },
        { key: "status", header: "Status" },
        { key: "createdAtFormatted", header: "Date" },
    ];

    const tablecolumns = [
        { key: "sl", header: "SL" },
        { key: "name", header: "Name" },
        { key: "subject", header: "Subject" },
        { key: "assignedName", header: "Assigned To" },
        { key: "status", header: "Status" },
        { key: "date", header: "Date" },
        { key: "action", header: "Action" },
    ];

    const filteredComplaints = complaints.filter(item => {
        if (filters.subject && item.subject !== filters.subject) return false;
        if (filters.department) {
            const designationTitle =
                typeof item.designation === "object"
                    ? item.designation?.title
                    : item.designation;
            const allowedDesignations = designationCategories[filters.department] || [];
            if (!allowedDesignations.includes(designationTitle)) return false;
        }
        if (filters.assignedTo) {
            if (filters.assignedTo === "Unassigned") {
                if (item.assignedTo) return false;
            } else {
                const assignedId =
                    typeof item.assignedTo === "object"
                        ? item.assignedTo?._id
                        : item.assignedTo;
                if (String(assignedId) !== String(filters.assignedTo)) return false;
            }
        }
        if (filters.status && item.status !== filters.status) return false;

        const itemDate = new Date(item.createdAt).setHours(0, 0, 0, 0);
        if (filters.fromDate && itemDate < new Date(filters.fromDate).setHours(0, 0, 0, 0)) return false;
        if (filters.toDate && itemDate > new Date(filters.toDate).setHours(23, 59, 59, 999)) return false;

        return true;
    });

    const assignedCount = complaints.filter(c => c.assignedTo).length;
    const unassignedCount = complaints.filter(c => !c.assignedTo).length;

    // Dashboard Card Counts
    const openCount = complaints.filter(c => c.status === "Open").length;
    const pendingCount = complaints.filter(c => c.status === "is Pending").length;
    const closedCount = complaints.filter(c => c.status === "Closed").length;

    const tableData1 = filteredComplaints.map((item, index) => ({
        _id: item._id,
        sl: (currentPage - 1) * 10 + index + 1,
        name: item.name,
        subject: item.subject,
        // Use helper to get name
        assignedName: getAssigneeName(item),
        status: item.status,
        date: formatDate(item.createdAt),
        action: (
            <div className="relative text-center">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setOpenActionId(openActionId === item._id ? null : item._id);
                    }}
                    className="p-2 rounded-full hover:bg-gray-200"
                >
                    ⋮
                </button>
                {openActionId === item._id && (
                    <div className="absolute right-6 top-10 bg-white border rounded-lg shadow-lg w-40 z-50">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleView(item._id);
                                setOpenActionId(null);
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 text-green-600"
                        >
                            <Eye size={18} />
                            <span>View</span>
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedComplaint(item);
                                setSelectedAgent("");
                                setViewMode("assign");
                                setViewEditModalOpen(true);
                                setOpenActionId(null);
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 text-blue-600"
                        >
                            <UserPlus size={18} />
                            <span>Assign</span>
                        </button>
                    </div>
                )}
            </div>
        ),
    }));

    const tableData = complaints.map((item, index) => ({
        _id: item._id,
        sl: (currentPage - 1) * 10 + index + 1,
        name: item.name,
        mobile: item.mobile,
        subject: item.subject,
        // Use helper to get name
        assignedName: getAssigneeName(item),
        status: item.status,
        createdAtFormatted: formatDate(item.createdAt),
    }));

    const openAssignModal = (complaint) => {
        setSelectedComplaint(complaint);
        setAssignModalOpen(true);
    };

    // --- IMPLEMENTED UPDATE LOGIC FROM REFERENCE CODE ---
    const confirmAssign = async () => {
        if (!selectedComplaint || !selectedAgent) return;

        // 1. Find the admin object from the fetched list (matches reference logic)
        const agent = agents.find((a) => a._id === selectedAgent);

        if (!agent) {
            notify("error", "Error", "Selected Admin not found in list");
            return;
        }

        try {
            // 2. Update Complaint using the Reference Logic Payload
            await updateComplaint(selectedComplaint._id, {
                assignedTo: agent._id,         // ID
                assignedToName: agent.name,   // Name
                status: "is Pending",          // Keeping "is Pending" to match your existing filters
            });

            notify(
                "success",
                "Assigned Successfully",
                `Complaint assigned to ${agent.name}`
            );

            // Close modals
            setAssignModalOpen(false);
            setViewEditModalOpen(false);
            setSelectedAgent("");
            setSelectedComplaint(null);

            // Refresh table to see updates
            fetchComplaints(currentPage);

        } catch (error) {
            console.error("Update Complaint Error:", error);
            notify("error", "Error", "Failed to assign complaint");
        }
    };

    const notify = (type, title, description) => {
        api[type]({
            title,
            description,
            placement: "top",
            duration: 2,
            getContainer: () => document.body,
            style: { lineHeight: "1.2" },
        });
    };

    const fetchComplaints = async (page = 1, isModal = false) => {
        try {
            if (!isModal) setIsLoading(true);
            const res = await API.get(`complaints/all?page=${page}`);
            setComplaints(res.data.data);
            setTotalComplaints(res.data.total);
            if (isModal) {
                setModalTotal(res.data.total || 0);
                setModalPage(res.data.currentPage || 1);
            } else {
                setTotalComplaints(res.data.total || 0);
                setTotalPages(res.data.totalPages || 1);
                setCurrentPage(res.data.currentPage || 1);
            }
        } catch (error) {
            notify("error", "Error", "Failed to load complaints");
        } finally {
            if (!isModal) setIsLoading(false);
        }
    };

    useEffect(() => {
        if (assignListModalOpen) {
            fetchComplaints(1, true);
        }
    }, [assignListModalOpen]);

    useEffect(() => {
        fetchComplaints(currentPage);
    }, [currentPage]);

    // --- IMPLEMENTED FETCH AGENTS LOGIC FROM REFERENCE CODE ---
    useEffect(() => {
        const fetchAgents = async () => {
            try {
                // Fetch from /admin/get-sub-admins as requested
                const res = await API.get("/admin/get-sub-admins");

                // Reference logic: setAgents(res.data || [])
                const agentsList = Array.isArray(res.data) ? res.data : [];
                setAgents(agentsList);

                console.log("Fetched Admins (Sub-Admins):", agentsList);
            } catch (error) {
                console.error("Fetch agents error:", error);
                setAgents([]);
            }
        };
        fetchAgents();
    }, []);

    const updateComplaint = async (id, data) => {
        try {
            const res = await API.put(`complaints/update/${id}`, data);
            return res.data;
        } catch (error) {
            console.error("Update Complaint Error:", error?.response?.data || error.message);
            throw error;
        }
    };

    const handleView = async (id) => {
        try {
            const res = await API.get(`/complaints/${id}`);
            setSelectedComplaint(res.data);
            setViewMode("view");
            setViewEditModalOpen(true);
        } catch (err) {
            console.error("Fetch complaint failed", err);
        }
    };

    return (
        <>
            {contextHolder}
            <Navbar />
            <div className="flex w-screen mt-14">
                <Sidebar />
                <div className="flex-col w-full p-4">
                    <CircularLoader
                        isLoading={isLoading}
                        failure={!isLoading && complaints.length === 0}
                        data="Complaints"
                    />
                    {!isLoading && complaints.length > 0 && (
                        <>
                            <div className="relative flex items-center mb-4">
                                {activeTab && (
                                    <button
                                        onClick={() => {
                                            if (assignMode) {
                                                setAssignMode(false);
                                            } else {
                                                setActiveTab(null);
                                            }
                                        }}
                                        className="absolute left-0 px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300 text-sm"
                                    >
                                        ← Back
                                    </button>
                                )}

                                <h2 className="mx-auto text-2xl font-bold my-5">
                                    Admin Support
                                </h2>
                            </div>


                            {!activeTab && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                                    <div onClick={() => setActiveTab("complaints")} className="group cursor-pointer">
                                        <div className="relative overflow-hidden rounded-xl bg-white border border-blue-200 shadow-md hover:shadow-lg transition-all duration-300">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-600 to-blue-700 opacity-5 group-hover:opacity-10 rounded-full -mr-16 -mt-16 blur-xl" />
                                            <div className="relative p-7">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-50 rounded-lg">
                                                            <span className="text-3xl">📝</span>
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-bold text-gray-900">Tickets</h3>
                                                            <p className="text-sm text-gray-600">View all tickets</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-4xl font-bold text-blue-600">{complaints.length}</p>
                                                        <p className="text-xs text-gray-500 uppercase">Tickets</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between pt-4 mt-6 border-t border-gray-100">
                                                    <span className="text-xs font-medium text-gray-500 uppercase">Open Tickets</span>
                                                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 opacity-0 group-hover:opacity-100 transition">
                                                        <ChevronRight className="w-4 h-4 text-white" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-blue-700 opacity-0 group-hover:opacity-100 transition" />
                                        </div>
                                    </div>
                                    <div onClick={() => setActiveTab("assign")} className="group cursor-pointer">
                                        <div className="relative overflow-hidden rounded-xl bg-white border border-blue-200 shadow-md hover:shadow-lg transition-all duration-300">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-600 to-green-700 opacity-5 group-hover:opacity-10 rounded-full -mr-16 -mt-16 blur-xl" />
                                            <div className="relative p-9">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="inline-flex items-center justify-center w-12 h-12 bg-green-50 rounded-lg">
                                                            <span className="text-2xl">👤</span>
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-bold text-gray-900">Assign</h3>
                                                            <p className="text-sm text-gray-600">Assign tickets to staff</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-6 text-right">
                                                        <div>
                                                            <p className="text-3xl font-bold text-green-600">{assignedCount}</p>
                                                            <p className="text-xs text-gray-500">Assigned</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-3xl font-bold text-red-500">{unassignedCount}</p>
                                                            <p className="text-xs text-gray-500">Unassigned</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between pt-3 mt-4 border-t border-gray-100">
                                                    <span className="text-xs font-medium text-gray-500 uppercase">Staff Assignment</span>
                                                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-green-600 to-green-700 opacity-0 group-hover:opacity-100 transition">
                                                        <ChevronRight className="w-4 h-4 text-white" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-600 to-green-700 opacity-0 group-hover:opacity-100 transition" />
                                        </div>
                                    </div>
                                    <div className="mt-16 p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                                        <div className="flex gap-4">
                                            <div className="flex-shrink-0">
                                                <Zap className="w-6 h-6 text-blue-600 mt-1" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-slate-900">Quick Tips</h3>
                                                <ul className="list-disc list-inside text-slate-700 space-y-1">
                                                    <li className="flex gap-2"><span>👉</span> View and manage all support requests in one place</li>
                                                    <li className="flex gap-2"><span>👉</span> Assign complaints to staff easily</li>
                                                    <li className="flex gap-2"><span>👉</span> Track complaint status and resolution progress</li>
                                                    <li className="flex gap-2"><span>👉</span> Improve response time and customer satisfaction</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "complaints" && (
                                <div className="bg-white rounded-xl shadow border border-gray-300 w-full overflow-x-auto p-4">
                                    <p className="text-gray-500 text-sm mb-4">Showing {filteredComplaints.length} of {complaints.length} complaints</p>
                                    <DataTable
                                        data={tableData}
                                        columns={columns}
                                        catcher="_id"
                                        exportedFileName="Complaints"
                                        exportedPdfName="Complaints Report"
                                        isExportEnabled={true}
                                    />
                                </div>
                            )}

                            {activeTab === "assign" && (
                                <>
                                    {/* --- DASHBOARD CARDS SECTION --- */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                                        {/* Open Card */}
                                        <div
                                            onClick={() => handleCardClick("Open")}
                                            className={`relative overflow-hidden rounded-xl bg-white shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border-2 ${filters.status === "Open" ? "border-orange-500 ring-1 ring-orange-500" : "border-transparent"}`}
                                        >
                                            <div className="p-6 bg-orange-300">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 text-orange-600 rounded-lg">
                                                            <AlertCircle size={24} />
                                                        </div>
                                                        <div className="">
                                                            <h3 className="text-lg font-bold text-gray-900">Open</h3>
                                                            <p className="text-sm text-gray-600">New complaints</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-3xl font-bold text-orange-600">{openCount}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Pending Card */}
                                        <div
                                            onClick={() => handleCardClick("is Pending")}
                                            className={`relative overflow-hidden rounded-xl bg-white shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border-2 ${filters.status === "is Pending" ? "border-yellow-500 ring-1 ring-yellow-500" : "border-transparent"}`}
                                        >
                                            <div className="p-6 bg-yellow-300">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 text-yellow-600 rounded-lg">
                                                            <Zap size={24} />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-bold text-gray-900">Pending</h3>
                                                            <p className="text-sm text-gray-600">In progress</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Closed Card */}
                                        <div
                                            onClick={() => handleCardClick("Closed")}
                                            className={`relative overflow-hidden rounded-xl bg-white shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border-2 ${filters.status === "Closed" ? "border-green-500 ring-1 ring-green-500" : "border-transparent"}`}
                                        >
                                            <div className="p-6 bg-green-300">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 text-green-600 rounded-lg">
                                                            <ClipboardCheck size={24} />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-bold text-gray-900">Closed</h3>
                                                            <p className="text-sm text-gray-600">Resolved issues</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-3xl font-bold text-green-600">{closedCount}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* ✅ NEW: Total Tickets Card */}
                                        <div
                                            onClick={() => handleCardClick("")}
                                            className={`relative overflow-hidden rounded-xl bg-white shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border-2 ${filters.status === "" ? "border-blue-500 ring-1 ring-blue-500" : "border-transparent"}`}
                                        >
                                            <div className="p-6 bg-blue-300">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-lg">
                                                            <Users size={24} />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-bold text-gray-900">Total</h3>
                                                            <p className="text-sm text-gray-600">All tickets</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-3xl font-bold text-blue-600">{complaints.length}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>


                                    <div className="mb-4 border rounded-lg p-4 bg-gray-50">
                                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                            <div className="flex flex-col">
                                                <label className="block text-sm font-medium text-gray-700 pb-2">Subject</label>
                                                <select name="subject" value={filters.subject} onChange={handleFilterChange} className="border rounded px-3 py-2 text-sm">
                                                    <option value="">All Subjects</option>
                                                    {[...new Set(complaints.map(c => c.subject))].map(subject => (
                                                        <option key={subject} value={subject}>{subject}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="flex flex-col">
                                                <label className="block text-sm font-medium text-gray-700 pb-2">Assigned To</label>
                                                <select name="assignedTo" value={filters.assignedTo} onChange={handleFilterChange} className="border rounded px-3 py-2 text-sm">
                                                    <option value="">All Assignees</option>
                                                    <option value="Unassigned">Unassigned</option>
                                                    {agents.map(agent => (
                                                        <option key={agent._id} value={agent._id}>{agent.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="flex flex-col">
                                                <label className="block text-sm font-medium text-gray-700 pb-2">Status</label>
                                                <select name="status" value={filters.status} onChange={handleFilterChange} className="border rounded px-3 py-2 text-sm">
                                                    <option value="">All Status</option>
                                                    <option value="Open">Open</option>
                                                    <option value="is Pending">Pending</option>
                                                    <option value="Closed">Closed</option>
                                                </select>
                                            </div>
                                            <div className="flex flex-col">
                                                <label className="block text-sm font-medium text-gray-700 pb-2">From Date</label>
                                                <input type="date" name="fromDate" value={filters.fromDate} onChange={handleFilterChange} className="border rounded px-3 py-2 text-sm" />
                                            </div>
                                            <div className="flex flex-col">
                                                <label className="block text-sm font-medium text-gray-700 pb-2">To Date</label>
                                                <input type="date" name="toDate" value={filters.toDate} onChange={handleFilterChange} className="border rounded px-3 py-2 text-sm" />
                                            </div>
                                        </div>
                                        <div className="mt-3">
                                            <button onClick={() => setFilters({ subject: "", department: "", assignedTo: "", status: "", fromDate: "", toDate: "" })} className="px-4 py-2 bg-blue-200 rounded text-sm hover:bg-blue-300">Reset Filters</button>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-xl shadow border border-gray-300 w-full overflow-x-auto p-4">
                                        <p className="text-gray-500 text-sm mb-4">Total {totalComplaints} complaints (Page {filteredComplaints.length})</p>
                                        <DataTable
                                            data={tableData1}
                                            columns={tablecolumns}
                                            catcher="_id"
                                            isExportEnabled={true}
                                            exportedFileName="Complaints"
                                            exportedPdfName="Complaints Report"
                                        />
                                    </div>
                                </>
                            )}
                        </>
                    )}

                    {assignModalOpen && (
                        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg p-6 w-[400px]">
                                <h3 className="text-lg font-bold mb-4">Assign Complaint</h3>
                                <select className="w-full border rounded px-3 py-2 mb-4" value={selectedAgent} onChange={(e) => setSelectedAgent(e.target.value)}>
                                    <option value="">Select Employee</option>
                                    {agents.map((agent) => (
                                        <option key={agent._id} value={agent._id}>{agent.name} | {agent.email}</option>
                                    ))}
                                </select>
                                <div className="flex justify-end gap-3">
                                    <button onClick={() => setAssignModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                                    <button onClick={confirmAssign} className="px-4 py-2 bg-blue-600 text-white rounded" disabled={!selectedAgent}>Assign</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {viewEditModalOpen && selectedComplaint && (
                        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                            <div className="bg-white rounded-xl shadow-lg w-[95%] max-w-4xl max-h-[90vh] overflow-auto p-6 relative">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-semibold text-gray-800">Complaint Details</h3>
                                    <button onClick={() => setViewEditModalOpen(false)} className="text-gray-500 hover:text-black"><X size={24} /></button>
                                </div>
                                <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                        <input value={selectedComplaint.name || ""} readOnly className="w-full border rounded-md px-3 py-2 bg-gray-100 text-gray-700 cursor-not-allowed" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
                                        <input value={selectedComplaint.mobile || ""} readOnly className="w-full border rounded-md px-3 py-2 bg-gray-100 text-gray-700 cursor-not-allowed" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                        <input value={selectedComplaint.subject || ""} readOnly className="w-full border rounded-md px-3 py-2 bg-gray-100 text-gray-700 cursor-not-allowed" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                        <input value={selectedComplaint.designation?.title || selectedComplaint.designation || ""} readOnly className="w-full border rounded-md px-3 py-2 bg-gray-100 text-gray-700 cursor-not-allowed" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                                        <input value={getAssigneeName(selectedComplaint)} readOnly className="w-full border rounded-md px-3 py-2 bg-gray-100 text-gray-700 cursor-not-allowed" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <input value={selectedComplaint.status || ""} readOnly className="w-full border rounded-md px-3 py-2 bg-gray-100 text-gray-700 cursor-not-allowed" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                        <input value={formatDate(selectedComplaint.createdAt)} readOnly className="w-full border rounded-md px-3 py-2 bg-gray-100 text-gray-700 cursor-not-allowed" />
                                    </div>
                                    <div></div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                        <textarea rows={4} value={selectedComplaint.message || ""} readOnly className="w-full border rounded-md px-3 py-2 bg-gray-100 text-gray-700 cursor-not-allowed" />
                                    </div>
                                    {selectedComplaint.attachments?.length > 0 && (
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Attachments (Click to View)</label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                                {selectedComplaint.attachments.map((file, index) => {
                                                    const fileUrl = `${BaseURL}/complaints/${selectedComplaint._id}/attachment/${index}`;
                                                    return (
                                                        <div
                                                            key={index}
                                                            onClick={() => handleAttachmentClick(fileUrl, file.originalName)}
                                                            className="border rounded-lg p-3 bg-gray-50 flex flex-col items-center cursor-pointer hover:shadow-md transition group"
                                                        >
                                                            <div className="relative w-full h-32 flex items-center justify-center overflow-hidden rounded bg-white">
                                                                <img
                                                                    src={fileUrl}
                                                                    alt={file.originalName}
                                                                    className="h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                                                />
                                                                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                                                    <span className="text-white text-xs bg-black/50 px-2 py-1 rounded">Click to Expand</span>
                                                                </div>
                                                            </div>
                                                            <p className="text-sm text-gray-700 truncate w-full text-center mt-2" title={file.originalName}>📎 {file.originalName}</p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                    {viewMode === "assign" && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                                            <select value={selectedAgent} onChange={(e) => setSelectedAgent(e.target.value)} className="w-full border rounded-md px-3 py-2">
                                                <option value="">Select Employee</option>
                                                {agents.map(agent => (
                                                    <option key={agent._id} value={agent._id}>{agent.name} | {agent.email}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </form>
                                <div className="flex justify-end mt-6 gap-3">
                                    <button onClick={() => setViewEditModalOpen(false)} className="px-4 py-2 border rounded-md hover:bg-gray-100">Cancel</button>
                                    {viewMode === "assign" && (
                                        <button onClick={confirmAssign} disabled={!selectedAgent} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">Assign</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {imagePreviewOpen && (
                        <div
                            className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
                            onClick={() => setImagePreviewOpen(false)}
                        >
                            <button
                                onClick={(e) => { e.stopPropagation(); setImagePreviewOpen(false); }}
                                className="absolute top-4 right-4 text-white hover:text-gray-300 bg-black/50 rounded-full p-2"
                                title="Close"
                            >
                                <X size={32} />
                            </button>
                            <img
                                src={previewImageSrc}
                                alt="Full Preview"
                                className="max-w-full max-h-[90vh] object-contain rounded shadow-2xl"
                            />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default Supports;