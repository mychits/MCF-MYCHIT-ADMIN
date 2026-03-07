/* eslint-disable react/prop-types */
import { useEffect, useState, useMemo } from "react";
import API from "../instance/TokenInstance";
import { notification, Pagination, Spin } from "antd";
import Sidebar from "../components/layouts/Sidebar";
import Navbar from "../components/layouts/Navbar";
import { Users, ChevronRight, Zap, ClipboardCheck, X, Eye, UserPlus, AlertCircle } from "lucide-react";
import DataTable from "../components/layouts/Datatable";
import BaseURL from "../instance/BaseUrl";
import CircularLoader from "../components/loaders/CircularLoader";
import { MdAssignmentInd } from "react-icons/md";

function Supports() {
  const [api, contextHolder] = notification.useNotification();
  
  // --- LOADING STATE ---
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [allComplaintsForCounts, setAllComplaintsForCounts] = useState([]);
  
  // --- IMAGE PREVIEW STATE ---
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [previewImageSrc, setPreviewImageSrc] = useState("");
  
  // --- DATA STATE ---
  const [complaints, setComplaints] = useState([]);
  const [allComplaints, setAllComplaints] = useState([]); // Store ALL complaints for counts
  const [totalComplaints, setTotalComplaints] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState(null);
  
  // --- AGENTS STATE ---
  const [agents, setAgents] = useState([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  
  // --- MODAL & ACTION STATE ---
  const [openActionId, setOpenActionId] = useState(null);
  const [viewMode, setViewMode] = useState("view");
  const [viewEditModalOpen, setViewEditModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState("");
  
  // --- FILTERS STATE ---
  const [filters, setFilters] = useState({
    subject: "",
    assignedTo: "",
    status: "",
    fromDate: "",
    toDate: "",
  });

  // --- HELPER: Format Date ---
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // --- HELPER: GET ASSIGNEE NAME ---
  const getAssigneeName = (item) => {
    if (item.assignedToName) return item.assignedToName;
    if (!item.assignedTo) return "Unassigned";
    if (typeof item.assignedTo === "object" && item.assignedTo.name) {
      return item.assignedTo.name;
    }
    if (typeof item.assignedTo === "string") {
      const agent = agents.find(a => String(a._id) === String(item.assignedTo));
      return agent ? agent.name : "Unknown Admin";
    }
    return "Unassigned";
  };

  // --- FILTER CHANGE HANDLER ---
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
    setCurrentPage(1);
  };

  // --- DASHBOARD CARD CLICK HANDLER ---
  const handleCardClick = (status) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status === status ? "" : status
    }));
    setCurrentPage(1);
  };

  // --- ATTACHMENT CLICK HANDLER ---
  const handleAttachmentClick = (url, fileName) => {
    if (fileName && fileName.toLowerCase().endsWith('.pdf')) {
      window.open(url, '_blank');
    } else {
      setPreviewImageSrc(url);
      setImagePreviewOpen(true);
    }
  };

  // --- NOTIFICATION HELPER ---
  const notify = (type, title, description) => {
    api[type]({
      title,
      description,
      placement: "top",
      duration: 2,
    });
  };

  // --- FETCH ALL COMPLAINTS (for counts - no filters) ---
  const fetchAllComplaints = async () => {
    try {
      const res = await API.get(`complaints/all-paginated?page=1&limit=1000`);
      if (res.data.success) {
        setAllComplaints(res.data.data || []);
      }
    } catch (error) {
      console.error("Fetch all complaints error:", error);
      setAllComplaints([]);
    }
  };

  // --- FETCH COMPLAINTS (with filters) ---
  const fetchComplaints = async (page = 1) => {
    if (activeTab !== "assign") {
      setInitialLoad(false);
      return;
    }
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 10);
      
      if (filters.status && filters.status !== '') {
        params.append('status', filters.status);
      }
      if (filters.assignedTo && filters.assignedTo !== '') {
        params.append('assignedTo', filters.assignedTo);
      }
      if (filters.fromDate) {
        params.append('fromDate', filters.fromDate);
      }
      if (filters.toDate) {
        params.append('toDate', filters.toDate);
      }
      
      const res = await API.get(`complaints/all-paginated?${params.toString()}`);
      if (res.data.success) {
        setComplaints(res.data.data || []);
        setTotalComplaints(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
        setCurrentPage(res.data.page || 1);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      notify("error", "Error", "Failed to load complaints");
      setComplaints([]);
    } finally {
      setIsLoading(false);
      setInitialLoad(false);
    }
  };

  // --- FETCH AGENTS ---
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoadingAgents(true);
        const res = await API.get("/admin/get-sub-admins");
        const agentsList = Array.isArray(res.data) ? res.data : [];
        setAgents(agentsList);
      } catch (error) {
        console.error("Fetch agents error:", error);
        setAgents([]);
      } finally {
        setLoadingAgents(false);
      }
    };
    fetchAgents();
  }, []);

  // --- FETCH ALL COMPLAINTS FOR COUNTS (once when tab opens) ---
  useEffect(() => {
    if (activeTab === "assign") {
      fetchAllComplaints();
    }
  }, [activeTab]);

  // --- FETCH COMPLAINTS ON TAB/FILTER CHANGE ---
  useEffect(() => {
    if (activeTab === "assign") {
      fetchComplaints(currentPage);
    } else {
      setComplaints([]);
      setInitialLoad(false);
    }
  }, [currentPage, filters, activeTab]);


  useEffect(() => {
  const fetchComplaintsForCounts = async () => {
    try {
      const res = await API.get('complaints/all-paginated?page=1&limit=1000');
      if (res.data.success) {
        setAllComplaintsForCounts(res.data.data || []);
      }
    } catch (error) {
      console.error("Fetch counts error:", error);
    }
  };
  
  fetchComplaintsForCounts();
}, []);

  // --- VIEW COMPLAINT ---
  const handleView = async (id) => {
    try {
      const res = await API.get(`/complaints/${id}`);
      setSelectedComplaint(res.data);
      setViewMode("view");
      setViewEditModalOpen(true);
    } catch (err) {
      console.error("Fetch complaint failed", err);
      notify("error", "Error", "Failed to load complaint details");
    }
  };

  // --- UPDATE COMPLAINT ---
  const updateComplaint = async (id, data) => {
    try {
      const res = await API.put(`complaints/update/${id}`, data);
      return res.data;
    } catch (error) {
      console.error("Update Complaint Error:", error?.response?.data || error.message);
      throw error;
    }
  };

  // --- CONFIRM ASSIGN ---
  const confirmAssign = async () => {
    if (!selectedComplaint || !selectedAgent) return;
    const agent = agents.find((a) => a._id === selectedAgent);
    if (!agent) {
      notify("error", "Error", "Selected Admin not found in list");
      return;
    }
    try {
      await updateComplaint(selectedComplaint._id, {
        assignedTo: agent._id,
        assignedToName: agent.name,
        status: "is Pending",
      });
      notify("success", "Assigned Successfully", `Complaint assigned to ${agent.name}`);
      setAssignModalOpen(false);
      setViewEditModalOpen(false);
      setSelectedAgent("");
      setSelectedComplaint(null);
      if (activeTab === "assign") {
        fetchComplaints(currentPage);
        fetchAllComplaints(); // Refresh counts
      }
    } catch (error) {
      console.error("Update Complaint Error:", error);
      notify("error", "Error", "Failed to assign complaint");
    }
  };

  // --- RESET FILTERS ---
  const resetFilters = () => {
    setFilters({
      subject: "",
      assignedTo: "",
      status: "",
      fromDate: "",
      toDate: "",
    });
    setCurrentPage(1);
  };

  // --- CALCULATE COUNTS (from ALL complaints, NOT filtered) ---
const counts = useMemo(() => ({
  assigned: allComplaintsForCounts.filter(c => c.assignedTo).length,
  unassigned: allComplaintsForCounts.filter(c => !c.assignedTo).length,
  open: allComplaintsForCounts.filter(c => c.status === "Open").length,
  pending: allComplaintsForCounts.filter(c => c.status === "is Pending").length,
  closed: allComplaintsForCounts.filter(c => c.status === "Closed").length,
  total: allComplaintsForCounts.length
}), [allComplaintsForCounts]);

  // --- TABLE DATA (with actions) - EXACT COLUMNS REQUESTED ---
  const tableData1 = useMemo(() => {
    return complaints.map((item, index) => ({
      _id: item._id,
      sl: (currentPage - 1) * 10 + index + 1,
      name: item.name,
      subject: item.subject,
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
  }, [complaints, currentPage, openActionId, agents]);

 // Show loading only when necessary
if (initialLoad && activeTab !== "assign") {
  return (
    <>
      {contextHolder}
      <Navbar />
      <div className="flex w-screen mt-14">
        <Sidebar />
        <div className="flex-col w-full p-4">
          <div className="relative flex items-center mb-4">
            <h2 className="mx-auto text-2xl font-bold my-5">Admin Support</h2>
          </div>
          {/* Show tabs immediately without waiting */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div onClick={() => setActiveTab("assign")} className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-xl bg-white border border-blue-200 shadow-md hover:shadow-lg transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-600 to-green-700 opacity-5 group-hover:opacity-10 rounded-full -mr-16 -mt-16 blur-xl" />
                <div className="relative p-9">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-green-50 rounded-lg">
                        <span className="text-2xl">
                          <MdAssignmentInd />
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Assign</h3>
                        <p className="text-sm text-gray-600">Assign tickets to staff</p>
                      </div>
                    </div>
                    <div className="flex gap-6 text-right">
                      <div>
                        <p className="text-3xl font-bold text-green-600">0</p>
                        <p className="text-xs text-gray-500">Assigned</p>
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-red-500">0</p>
                        <p className="text-xs text-gray-500">Unassigned</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* ... rest of loading screen */}
        </div>
      </div>
    </>
  );
}

 return (
  <>
    {contextHolder}
    <Navbar />
    <div className="flex w-screen mt-14">
      <Sidebar />
      <div className="flex-col w-full p-4">
        <div className="relative flex items-center mb-4">
          {activeTab && (
            <button
              onClick={() => {
                setActiveTab(null);
                resetFilters();
                setCurrentPage(1);
                setComplaints([]);
              }}
              className="absolute left-0 px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300 text-sm"
            >
              ← Back
            </button>
          )}
          <h2 className="mx-auto text-2xl font-bold my-5">Admin Support</h2>
        </div>
        
        {/* Show tabs always - with real counts */}
        {!activeTab && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div onClick={() => setActiveTab("assign")} className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-xl bg-white border border-blue-200 shadow-md hover:shadow-lg transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-600 to-green-700 opacity-5 group-hover:opacity-10 rounded-full -mr-16 -mt-16 blur-xl" />
                <div className="relative p-9">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-green-50 rounded-lg">
                        <span className="text-2xl">
                          <MdAssignmentInd />
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Assign</h3>
                        <p className="text-sm text-gray-600">Assign tickets to staff</p>
                      </div>
                    </div>
                    <div className="flex gap-6 text-right">
                      <div>
                        <p className="text-3xl font-bold text-green-600">{counts.assigned}</p>
                        <p className="text-xs text-gray-500">Assigned</p>
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-red-500">{counts.unassigned}</p>
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
              </div>
            </div>
            <div className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Zap className="w-6 h-6 text-blue-600 mt-1" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Quick Tips</h3>
                  <ul className="list-disc list-inside text-slate-700 space-y-1">
                    <li className="flex gap-2">View and manage all support requests in one place</li>
                    <li className="flex gap-2">Assign complaints to staff easily</li>
                    <li className="flex gap-2">Track complaint status and resolution progress</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

          {/* --- ASSIGN TAB CONTENT --- */}
          {activeTab === "assign" && (
            <>
              {/* Dashboard Cards - Counts from ALL complaints (unchanged) */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">

              <div
                  onClick={() => handleCardClick("")}
                  className={`relative overflow-hidden rounded-xl bg-white shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border-2 ${
                    filters.status === "" ? "border-blue-500 ring-1 ring-blue-500" : "border-transparent"
                  }`}
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
                        <p className="text-3xl font-bold text-blue-600">{counts.total}</p>
                      </div>
                    </div>
                  </div>
                </div>



                {/* Open Card */}
                <div
                  onClick={() => handleCardClick("Open")}
                  className={`relative overflow-hidden rounded-xl bg-white shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border-2 ${
                    filters.status === "Open" ? "border-orange-500 ring-1 ring-orange-500" : "border-transparent"
                  }`}
                >
                  <div className="p-6 bg-orange-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 text-orange-600 rounded-lg">
                          <AlertCircle size={24} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">Open</h3>
                          <p className="text-sm text-gray-600">New complaints</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-orange-600">{counts.open}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pending Card */}
                <div
                  onClick={() => handleCardClick("is Pending")}
                  className={`relative overflow-hidden rounded-xl bg-white shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border-2 ${
                    filters.status === "is Pending" ? "border-yellow-500 ring-1 ring-yellow-500" : "border-transparent"
                  }`}
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
                        <p className="text-3xl font-bold text-yellow-600">{counts.pending}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Closed Card */}
                <div
                  onClick={() => handleCardClick("Closed")}
                  className={`relative overflow-hidden rounded-xl bg-white shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border-2 ${
                    filters.status === "Closed" ? "border-green-500 ring-1 ring-green-500" : "border-transparent"
                  }`}
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
                        <p className="text-3xl font-bold text-green-600">{counts.closed}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total Card */}
              
              </div>

              {/* Filters Section */}
              <div className="mb-4 border rounded-lg p-4 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-700 pb-2">Subject</label>
                    <select
                      name="subject"
                      value={filters.subject}
                      onChange={handleFilterChange}
                      className="border rounded px-3 py-2 text-sm"
                    >
                      <option value="">All Subjects</option>
                      {[...new Set(allComplaints.map(c => c.subject))].map(subject => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-700 pb-2">Assigned To</label>
                    <select
                      name="assignedTo"
                      value={filters.assignedTo}
                      onChange={handleFilterChange}
                      className="border rounded px-3 py-2 text-sm"
                      disabled={loadingAgents}
                    >
                      <option value="">All Assignees</option>
                      <option value="Unassigned">Unassigned</option>
                      {agents.map(agent => (
                        <option key={agent._id} value={agent._id}>{agent.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-700 pb-2">Status</label>
                    <select
                      name="status"
                      value={filters.status}
                      onChange={handleFilterChange}
                      className="border rounded px-3 py-2 text-sm"
                    >
                      <option value="">All Status</option>
                      <option value="Open">Open</option>
                      <option value="is Pending">Pending</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-700 pb-2">From Date</label>
                    <input
                      type="date"
                      name="fromDate"
                      value={filters.fromDate}
                      onChange={handleFilterChange}
                      className="border rounded px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-700 pb-2">To Date</label>
                    <input
                      type="date"
                      name="toDate"
                      value={filters.toDate}
                      onChange={handleFilterChange}
                      className="border rounded px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 bg-blue-200 rounded text-sm hover:bg-blue-300"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>

              {/* Data Table - EXACT COLUMNS REQUESTED */}
              <div className="bg-white rounded-xl shadow border border-gray-300 w-full overflow-x-auto p-4">
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <Spin size="large" tip="Loading complaints..." />
                  </div>
                ) : (
                  <>
                    <p className="text-gray-500 text-sm mb-4">
                      Showing {tableData1.length} of {totalComplaints} complaints (Page {currentPage} of {totalPages})
                    </p>
                    <DataTable
                      data={tableData1}
                      columns={[
                        { key: "sl", header: "SL" },
                        { key: "name", header: "Name" },
                        { key: "subject", header: "Subject" },
                        { key: "assignedName", header: "Assigned To" },
                        { key: "status", header: "Status" },
                        { key: "date", header: "Date" },
                        { key: "action", header: "Action" },
                      ]}
                      catcher="_id"
                      isExportEnabled={true}
                      exportedFileName="Complaints"
                      exportedPdfName="Complaints Report"
                    />
                    {totalPages > 1 && (
                      <div className="flex justify-center mt-4">
                        <Pagination
                          current={currentPage}
                          total={totalComplaints}
                          pageSize={10}
                          onChange={(page) => setCurrentPage(page)}
                          showSizeChanger={false}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}

          {/* --- ASSIGN MODAL --- */}
          {assignModalOpen && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-[400px]">
                <h3 className="text-lg font-bold mb-4">Assign Complaint</h3>
                <select
                  className="w-full border rounded px-3 py-2 mb-4"
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                >
                  <option value="">Select Employee</option>
                  {agents.map((agent) => (
                    <option key={agent._id} value={agent._id}>
                      {agent.name} {agent.email ? `| ${agent.email}` : ''}
                    </option>
                  ))}
                </select>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setAssignModalOpen(false)}
                    className="px-4 py-2 bg-gray-200 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmAssign}
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                    disabled={!selectedAgent}
                  >
                    Assign
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* --- VIEW/EDIT MODAL (with attachments) --- */}
          {viewEditModalOpen && selectedComplaint && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-lg w-[95%] max-w-4xl max-h-[90vh] overflow-auto p-6 relative">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">Complaint Details</h3>
                  <button
                    onClick={() => setViewEditModalOpen(false)}
                    className="text-gray-500 hover:text-black"
                  >
                    <X size={24} />
                  </button>
                </div>
                <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      value={selectedComplaint.name || ""}
                      readOnly
                      className="w-full border rounded-md px-3 py-2 bg-gray-100 text-gray-700 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
                    <input
                      value={selectedComplaint.mobile || ""}
                      readOnly
                      className="w-full border rounded-md px-3 py-2 bg-gray-100 text-gray-700 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <input
                      value={selectedComplaint.subject || ""}
                      readOnly
                      className="w-full border rounded-md px-3 py-2 bg-gray-100 text-gray-700 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <input
                      value={selectedComplaint.designation?.title || selectedComplaint.designation || ""}
                      readOnly
                      className="w-full border rounded-md px-3 py-2 bg-gray-100 text-gray-700 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                    <input
                      value={getAssigneeName(selectedComplaint)}
                      readOnly
                      className="w-full border rounded-md px-3 py-2 bg-gray-100 text-gray-700 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <input
                      value={selectedComplaint.status || ""}
                      readOnly
                      className="w-full border rounded-md px-3 py-2 bg-gray-100 text-gray-700 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      value={formatDate(selectedComplaint.createdAt)}
                      readOnly
                      className="w-full border rounded-md px-3 py-2 bg-gray-100 text-gray-700 cursor-not-allowed"
                    />
                  </div>
                  <div></div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea
                      rows={4}
                      value={selectedComplaint.message || ""}
                      readOnly
                      className="w-full border rounded-md px-3 py-2 bg-gray-100 text-gray-700 cursor-not-allowed"
                    />
                  </div>
                  
                  {/* ✅ ATTACHMENTS SECTION */}
                  {selectedComplaint.attachments && selectedComplaint.attachments.length > 0 && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Attachments (Click to View)
                      </label>
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
                                  <span className="text-white text-xs bg-black/50 px-2 py-1 rounded">
                                    Click to Expand
                                  </span>
                                </div>
                              </div>
                              <p className="text-sm text-gray-700 truncate w-full text-center mt-2" title={file.originalName}>
                                📎 {file.originalName}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {viewMode === "assign" && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                      <select
                        value={selectedAgent}
                        onChange={(e) => setSelectedAgent(e.target.value)}
                        className="w-full border rounded-md px-3 py-2"
                      >
                        <option value="">Select Employee</option>
                        {agents.map(agent => (
                          <option key={agent._id} value={agent._id}>
                            {agent.name} | {agent.email}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </form>
                <div className="flex justify-end mt-6 gap-3">
                  <button
                    onClick={() => setViewEditModalOpen(false)}
                    className="px-4 py-2 border rounded-md hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  {viewMode === "assign" && (
                    <button
                      onClick={confirmAssign}
                      disabled={!selectedAgent}
                      className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                    >
                      Assign
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* --- IMAGE PREVIEW MODAL --- */}
          {imagePreviewOpen && (
            <div
              className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
              onClick={() => setImagePreviewOpen(false)}
            >
              <button
                onClick={(e) => { e.stopPropagation(); setImagePreviewOpen(false); }}
                className="absolute top-4 right-4 text-white hover:text-gray-300 bg-black/50 rounded-full p-2"
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