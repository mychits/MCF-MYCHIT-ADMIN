import { useEffect, useState } from "react";
import API from "../../instance/TokenInstance";
import { notification, Modal, Form, Input, Select } from "antd";
import { CheckCircle, ClipboardCheck, AlertCircle, UserPlus, RotateCcw, LayoutGrid, List, History } from "lucide-react"; 
import Sidebar from "../layouts/Sidebar";
import Navbar from "../layouts/Navbar";
import CircularLoader from "../loaders/CircularLoader";

function EmployeeTasks() {
  const [myTasks, setMyTasks] = useState([]);
  // ADDED: State to store history of tasks I reassigned
  const [myReassignedHistory, setMyReassignedHistory] = useState([]); 
  
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("list");

  // Filter State
  const [filterStatus, setFilterStatus] = useState("is Pending");

  // Lists for Dropdowns
  const [employees, setEmployees] = useState([]);
  
  // Modal States
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const [completionForm] = Form.useForm();
  const [reassignForm] = Form.useForm();

  // --- FETCH USER ID ---
  const userStr = localStorage.getItem("user");
  const loggedInUser = userStr ? JSON.parse(userStr) : null;
  const myId = loggedInUser?._id;

  // Fetch Employees for Reassignment
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await API.get("/admin/get-sub-admins");
        setEmployees(res.data || []);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (!myId) return;

    const fetchMyTasks = async () => {
      try {
        setIsLoading(true);
        const res = await API.get("/complaints/all");
        const complaints = res.data?.data || res.data || [];

        // 1. Tasks currently assigned to me
        const assignedToMe = complaints.filter((item) => {
          if (!item.assignedTo) return false;
          let assignedId = null;
          if (typeof item.assignedTo === "object" && item.assignedTo._id) {
            assignedId = item.assignedTo._id;
          } else if (typeof item.assignedTo === "string") {
            assignedId = item.assignedTo;
          }
          return String(assignedId) === String(myId);
        });

        // 2. Tasks I have reassigned to others (History)
        const myReassignedHistory = complaints.filter((item) => {
            if (!item.reassignedBy) return false;
            let reassignedId = null;
            if (typeof item.reassignedBy === "object" && item.reassignedBy._id) {
                reassignedId = item.reassignedBy._id;
            } else if (typeof item.reassignedBy === "string") {
                reassignedId = item.reassignedBy;
            }
            return String(reassignedId) === String(myId);
        });

        setMyTasks(assignedToMe);
        setMyReassignedHistory(myReassignedHistory);

      } catch (error) {
        console.error("Error fetching tasks:", error);
        notification.error({ message: "Error", description: "Failed to load tasks" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyTasks();
  }, [myId]);

  // --- CALCULATE COUNTS ---
  const pendingCount = myTasks.filter(t => t.status !== "Closed").length;
  const closedCount = myTasks.filter(t => t.status === "Closed").length;
  const reassignCount = myReassignedHistory.length;

  // --- FILTER LOGIC ---
  // Determine which list to show based on the active card
  let tasksToRender = [];

  if (filterStatus === "Reassigned") {
    // If Reassigned card is clicked, show the history
    tasksToRender = myReassignedHistory;
  } else {
    // Otherwise, show filtered myTasks (Pending/Closed)
    tasksToRender = myTasks.filter(task => {
      if (filterStatus === null) return true;
      return task.status === filterStatus;
    });
  }

  // --- OPEN MODALS ---
  const openCompletionModal = (task) => {
    setSelectedTaskId(task._id);
    setIsCompletionModalOpen(true);
  };

  const openReassignModal = (task) => {
    setSelectedTaskId(task._id);
    setIsReassignModalOpen(true);
  };

  // --- HANDLE REASSIGNMENT ---
  const handleReassignSubmit = async (values) => {
    try {
      const selectedEmployee = employees.find(e => e._id === values.assignedTo);
      const assignedToName = selectedEmployee ? selectedEmployee.name : "";

      const payload = {
        assignedTo: values.assignedTo,
        assignedToName: assignedToName,
        reassignmentNote: values.reassignmentNote,
        reassignedBy: myId, // Save who reassigned it
        status: "is Pending"
      };

      await API.put(`/complaints/update/${selectedTaskId}`, payload);

      notification.success({
        message: "Task Reassigned",
        description: `Task assigned to ${assignedToName}`,
      });

      // Remove from myTasks locally
      setMyTasks((prev) => prev.filter(t => t._id !== selectedTaskId));
      
      // Add to history locally
      setMyReassignedHistory((prev) => [...prev, { ...payload, _id: selectedTaskId, subject: myTasks.find(t=>t._id===selectedTaskId)?.subject, message: myTasks.find(t=>t._id===selectedTaskId)?.message }]);

      setIsReassignModalOpen(false);
      reassignForm.resetFields();
      setSelectedTaskId(null);

    } catch (error) {
      console.error(error);
      notification.error({ message: "Error", description: "Failed to reassign task" });
    }
  };

  // --- HANDLE COMPLETION ---
  const handleCompleteSubmit = async (values) => {
    try {
      const payload = {
        status: "Closed",
        resolutionNote: values.resolutionNote,
      };

      await API.put(`/complaints/update/${selectedTaskId}`, payload);

      notification.success({ message: "Task Completed", description: "Ticket marked as Closed" });

      setMyTasks((prev) =>
        prev.map((task) =>
          task._id === selectedTaskId
            ? { ...task, status: "Closed", resolutionNote: values.resolutionNote }
            : task
        )
      );

      setIsCompletionModalOpen(false);
      completionForm.resetFields();
      setSelectedTaskId(null);

    } catch (error) {
      console.error(error);
      notification.error({ message: "Error", description: "Unable to update task status" });
    }
  };

  const containerClass = viewMode === 'grid'
    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    : "flex flex-col gap-3";

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col mb-2">
        <Navbar />

        <main className="flex-1 pt-20 px-6 mb-5">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">My Assigned Tasks</h1>

            <div className="flex bg-white p-1 rounded-lg border border-gray-300 shadow-sm">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'}`}
              >
                <List size={20} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'}`}
              >
                <LayoutGrid size={20} />
              </button>
            </div>
          </div>

          {/* --- DASHBOARD CARDS --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

            {/* Pending Card */}
            <div
              onClick={() => setFilterStatus(prev => prev === "is Pending" ? null : "is Pending")}
              className={`relative overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border-2 ${filterStatus === "is Pending" ? "border-yellow-500 ring-1 ring-yellow-500 bg-white" : "border-transparent bg-white"}`}
            >
              <div className="p-6 bg-yellow-200 hover:bg-yellow-100 transition rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 text-yellow-600 rounded-lg">
                      <AlertCircle size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Pending</h3>
                      <p className="text-sm text-gray-600">In Progress</p>
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
              onClick={() => setFilterStatus(prev => prev === "Closed" ? null : "Closed")}
              className={`relative overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border-2 ${filterStatus === "Closed" ? "border-green-500 ring-1 ring-green-500 bg-white" : "border-transparent bg-white"}`}
            >
              <div className="p-6 bg-green-200 hover:bg-green-100 transition rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 text-green-600 rounded-lg">
                      <ClipboardCheck size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Closed</h3>
                      <p className="text-sm text-gray-600">Completed Tasks</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-green-600">{closedCount}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reassigned / History Card */}
            <div
              onClick={() => setFilterStatus(prev => prev === "Reassigned" ? null : "Reassigned")}
              className={`relative overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border-2 ${filterStatus === "Reassigned" ? "border-purple-500 ring-1 ring-purple-500 bg-white" : "border-transparent bg-white"}`}
            >
              <div className="p-6 bg-purple-200 hover:bg-purple-100 transition rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 text-purple-600 rounded-lg">
                      <History size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Reassigned</h3>
                      <p className="text-sm text-gray-600">By Me (History)</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-purple-600">{reassignCount}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* --- DATA LIST/GRID SECTION --- */}
          <CircularLoader
            isLoading={isLoading}
            failure={!isLoading && tasksToRender.length === 0}
            data={filterStatus === "Reassigned" ? "History" : "Tasks"}
          />

          {!isLoading && tasksToRender.length > 0 && (
            <div className={containerClass}>
              {tasksToRender.map((task) => (
                <div
                  key={task._id}
                  className="bg-white p-4 rounded-lg shadow border border-gray-200 flex flex-col justify-between hover:shadow-md transition h-full"
                >
                  {/* ROW 1: Content & Buttons */}
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4">

                    {/* Content Area */}
                    <div className="flex-1 min-w-0">
                      {/* Badge */}
                      <div className="mb-2">
                        <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded text-white ${task.status === "Closed" ? "bg-green-600" : "bg-yellow-500"
                          }`}>
                          {task.status}
                        </span>
                      </div>

                      {/* Subject and Description */}
                      <div className="space-y-1">
                        <div className="text-xs">
                          <span className="font-semibold text-gray-500">Subject:</span>
                          <span className="text-gray-900 ml-1 break-words">{task.subject}</span>
                        </div>
                        <div className="text-xs">
                          <span className="font-semibold text-gray-500">Description:</span>
                          <span className="text-gray-900 ml-1 break-words line-clamp-3">{task.message}</span>
                        </div>
                      </div>
                    </div>

                    {/* Button Area */}
                    <div className="md:w-auto w-full flex flex-col items-center gap-2 flex-shrink-0 mt-2">
                      {task.status !== "Closed" ? (
                        <>
                          <button
                            onClick={() => openCompletionModal(task)}
                            className="flex items-center justify-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded shadow-sm transition"
                          >
                            <CheckCircle size={12} /> Mark completed
                          </button>
                          <button
                            onClick={() => openReassignModal(task)}
                            className="flex items-center justify-center gap-1 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs rounded shadow-sm transition"
                          >
                            <UserPlus size={12} /> Re-assign
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center justify-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 text-xs font-medium rounded">
                          <CheckCircle size={12} /> Closed
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ROW 2: Notes */}
                  <div className="mt-3 space-y-2">
                    {task.reassignmentNote && (
                      <div className="p-2 bg-yellow-50 rounded border border-yellow-200 text-[10px]">
                        <p className="font-bold text-yellow-800 mb-0.5 flex items-center gap-1">
                          <RotateCcw size={10} /> Reassigned Note:
                        </p>
                        <p className="text-gray-800">{task.reassignmentNote}</p>
                      </div>
                    )}
                    {task.status === "Closed" && task.resolutionNote && (
                      <div className="p-2 bg-green-50 rounded border border-green-200 text-[10px]">
                        <p className="font-bold text-green-800 mb-0.5 flex items-center gap-1">
                          <CheckCircle size={10} /> Resolved:
                        </p>
                        <p className="text-gray-800">{task.resolutionNote}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* --- COMPLETION MODAL --- */}
      <Modal
        title="Complete Task"
        open={isCompletionModalOpen}
        onCancel={() => { setIsCompletionModalOpen(false); completionForm.resetFields(); }}
        footer={null}
      >
        <Form form={completionForm} layout="vertical" onFinish={handleCompleteSubmit}>
          <Form.Item label="Resolution Note" name="resolutionNote" rules={[{ required: true, message: 'Please add a note!' }]}>
            <Input.TextArea rows={4} placeholder="Describe how you resolved this issue..." />
          </Form.Item>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setIsCompletionModalOpen(false)} className="px-4 py-2 border rounded hover:bg-gray-100">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Submit</button>
          </div>
        </Form>
      </Modal>

      {/* --- REASSIGN MODAL --- */}
      <Modal
        title="Reassign Task"
        open={isReassignModalOpen}
        onCancel={() => { setIsReassignModalOpen(false); reassignForm.resetFields(); }}
        footer={null}
      >
        <Form form={reassignForm} layout="vertical" onFinish={handleReassignSubmit}>
          <Form.Item label="Assign To" name="assignedTo" rules={[{ required: true, message: 'Please select an employee!' }]}>
            <Select
              showSearch
              placeholder="Search employee..."
              filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
              options={employees.map(emp => ({ value: emp._id, label: emp.name }))}
            />
          </Form.Item>
          <Form.Item label="Reason for Reassignment" name="reassignmentNote" rules={[{ required: true, message: 'Please explain why!' }]}>
            <Input.TextArea rows={4} placeholder="Why are you reassigning this task?" />
          </Form.Item>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setIsReassignModalOpen(false)} className="px-4 py-2 border rounded hover:bg-gray-100">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700">Reassign</button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

export default EmployeeTasks;