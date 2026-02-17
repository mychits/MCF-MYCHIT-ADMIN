import { useEffect, useState } from "react";
import Sidebar from "../components/layouts/Sidebar";
import Navbar from "../components/layouts/Navbar";
import Modal from "../components/modals/Modal";
import DataTable from "../components/layouts/Datatable";
import api from "../instance/TokenInstance";
import CircularLoader from "../components/loaders/CircularLoader";
import { Dropdown, Select } from "antd";
import { IoMdMore } from "react-icons/io";
import CustomAlertDialog from "../components/alerts/CustomAlertDialog";
import { useLocation } from "react-router-dom";
// const Task = () => {
//   const [agents, setAgents] = useState([]);
//   const [leads, setLeads] = useState([]);
//   const [tasks, setTasks] = useState([]);
//   const [tableTasks, setTableTasks] = useState([]);
//   const [formData, setFormData] = useState({
//     employeeId: "",
//     taskTitle: "Pending  Lead Visit",
//     taskDescription: "",
//     startDate: new Date().toISOString().slice(0, 16),
//     endDate: "",
//     status: "Pending",
//     lead: "",
//   });
//   const location = useLocation();
//   const leadIdFromLocation = location?.state?.leadId || null;
//   const [modalVisible, setModalVisible] = useState(false);
//   const [reloadTrigger, setReloadTrigger] = useState(0);
//   const [currentTask, setCurrentTask] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [alertConfig, setAlertConfig] = useState({
//     visibility: false,
//     message: "Something went wrong!",
//     type: "info",
//   });

//   const fetchAllData = async () => {
//     try {
//       setIsLoading(true);
//       const [agentRes, leadRes, taskRes] = await Promise.all([
//         api.get("/agent/get-agent"),
//         api.get("/lead/get-lead"),
//         api.get("/task/get-tasks"),
//       ]);

//       const agentData = agentRes.data;
//       const leadData = leadRes.data;
//       const taskData = taskRes.data;

//       setAgents(agentData);
//       setLeads(leadData);
//       if (leadIdFromLocation) {
//         setFormData((prev) => ({
//           ...prev,
//           lead: leadIdFromLocation,
//         }));
//         setModalVisible(true); // opens modal with lead selected
//       }
//       setTasks(taskData);

//       const formatted = taskData.map((task, index) => {
//         const emp = agentData.find((a) => a._id === task.employeeId);
        

//         return {
//           _id: task._id,
//           id: index + 1,
//           employeeName:  emp?.name || "N/A",
//           employeeCode: emp?.employeeCode || "N/A",
//           taskTitle: task.taskTitle,
//           status: task.status,
//           lead:
//             task.lead?.name && task.lead?.phone
//               ? `${task.lead.name} (${task.lead.phone})`
//               : "N/A",

//           action: (
//             <Dropdown
//               menu={{
//                 items: [
//                   {
//                     key: "1",
//                     label: (
//                       <div
//                         className="text-green-600"
//                         onClick={() => openEdit(task)}
//                       >
//                         Edit
//                       </div>
//                     ),
//                   },
//                   {
//                     key: "2",
//                     label: (
//                       <div
//                         className="text-red-600"
//                         onClick={() => handleDelete(task._id)}
//                       >
//                         Delete
//                       </div>
//                     ),
//                   },
//                 ],
//               }}
//               placement="bottomLeft"
//             >
//               <IoMdMore className="cursor-pointer" />
//             </Dropdown>
//           ),
//         };
//       });

//       setTableTasks(formatted);
//     } catch (err) {
//       console.error("Error fetching all data", err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAllData();
//   }, [reloadTrigger]);
// useEffect(() => {
//   if (leadIdFromLocation && leads.length > 0) {
//     setFormData((prev) => ({
//       ...prev,
//       lead: leadIdFromLocation,
//       startDate: new Date().toISOString().slice(0, 16),
//     }));
//     setModalVisible(true);
//   }
// }, [leadIdFromLocation, leads])
//   const handleInput = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const payload = {
//         ...formData,
//       };

//       if (currentTask) {
//         await api.put(`/task/update-task/${currentTask}`, payload);

//         setAlertConfig({
//           visibility: true,
//           message: "Task updated successfully",
//           type: "success",
//         });
//         setReloadTrigger((prev) => prev + 1);
//       } else {
//         await api.post("/task/add-task", payload);
//         setReloadTrigger((prev) => prev + 1);
//         setAlertConfig({
//           visibility: true,
//           message: "Task created successfully",
//           type: "success",
//         });
//       }

//       setModalVisible(false);
//       setFormData({
//         employeeId: "",
//         taskTitle: "Pending Lead Visit",
//         taskDescription: "",
//         startDate: new Date().toISOString().slice(0, 16),
//         endDate: "",
//         status: "Pending",
//         lead: "",
//       });
//       setCurrentTask(null);
//       fetchAllData();
//     } catch (err) {
//       console.error("Task creation error:", err.response?.data || err.message);
//       setAlertConfig({
//         visibility: true,
//         message: "Something went wrong",
//         type: "error",
//       });
//     }
//   };

//   const openEdit = (task) => {
//     setCurrentTask(task._id);
//     setFormData({
//       employeeId:
//         typeof task.employeeId === "object"
//           ? task.employeeId._id
//           : task.employeeId || "",
//       taskTitle: task.taskTitle,
//       taskDescription: task.taskDescription,
//       startDate: task.startDate?.slice(0, 16) || "",
//       endDate: task.endDate?.slice(0, 16) || "",
//       status: task.status || "Pending",
//       lead: typeof task.lead === "object" ? task.lead._id : task.lead || "",
//     });
//     setModalVisible(true);
//   };

//   const handleDelete = async (id) => {
//     try {
//       await api.delete(`/task/delete-task/${id}`);
//       //fetchAllData();
//       setReloadTrigger((prev) => prev + 1);
//       setAlertConfig({
//         visibility: true,
//         message: "Task deleted",
//         type: "success",
//       });
//     } catch (err) {
//       setAlertConfig({
//         visibility: true,
//         message: "Delete failed",
//         type: "error",
//       });
//     }
//   };

//   const columns = [
//     { key: "employeeName", header: "Employee Name" },
//     { key: "employeeCode", header: "Employee ID" },
//     { key: "taskTitle", header: "Task Name" },
//     { key: "status", header: "Task Status" },
//     { key: "lead", header: "Lead" },
//     { key: "action", header: "Action" },
//   ];

//   return (
//     <>
//       <div className="flex mt-20">
//         <Navbar visibility={true} />
//         <CustomAlertDialog
//           type={alertConfig.type}
//           isVisible={alertConfig.visibility}
//           message={alertConfig.message}
//           onClose={() =>
//             setAlertConfig((prev) => ({ ...prev, visibility: false }))
//           }
//         />
//         <Sidebar />

//         <div className="flex-grow p-7">
//           <div className="mt-6 mb-8">
//             <div className="flex justify-between items-center w-full">
//               <h1 className="text-2xl font-semibold">Tasks</h1>
//               <button
//                 onClick={() => {
//                   setModalVisible(true);
//                   setFormData({
//                     employeeId: "",
//                     taskTitle: "",
//                     taskDescription: "",
//                     startDate: "",
//                     endDate: "",
//                     status: "Pending",
//                     lead: "",
//                   });
//                   setCurrentTask(null);
//                 }}
//                 className="ml-4 bg-blue-950 text-white px-4 py-2 rounded shadow-md hover:bg-blue-800 transition duration-200"
//               >
//                 + Add Task
//               </button>
//             </div>
//           </div>

//           {tableTasks.length > 0 && !isLoading ? (
//             <DataTable
//               updateHandler={(id) => openEdit(tasks.find((t) => t._id === id))}
//               data={tableTasks}
//               columns={columns}
//               exportedFileName="Tasks.csv"
//             />
//           ) : (
//             <CircularLoader
//               isLoading={isLoading}
//               failure={!isLoading}
//               data="Task Data"
//             />
//           )}
//         </div>
//       </div>

//       <Modal isVisible={modalVisible} onClose={() => setModalVisible(false)}>
//         <div className="p-6">
//           <h2 className="text-xl font-bold mb-4">
//             {currentTask ? "Edit Task" : "Add Task"}
//           </h2>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium">Lead</label>
//               <select
//                 name="lead"
//                 value={formData.lead}
//                 onChange={handleInput}
//                 className="w-full p-2 border rounded"
//               >
//                 <option value="">Select Lead</option>
//                 {leads.map((lead) => (
//                   <option key={lead._id} value={lead._id}>
//                     {`${lead?.lead_name} - ${lead?.lead_phone}`}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium">
//                 Employee <span className="text-red-500 ">*</span>{" "}
//               </label>
//               <select
//                 name="employeeId"
//                 value={formData.employeeId}
//                 onChange={handleInput}
//                 className="w-full p-2 border rounded"
//                 required
//               >
//                 <option value="">Select Employee</option>
//                 {agents.map((a) => (
//                   <option key={a._id} value={a._id}>
//                     {a.name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium">
//                 Task Title
//                 <span className="text-red-500 ">*</span>
//               </label>
//               <input
//                 type="text"
//                 name="taskTitle"
//                 value={formData.taskTitle || "Pending Lead Visit"}
//                 onChange={handleInput}
//                 className="w-full p-2 border rounded"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium">
//                 Task Description
//                 <span className="text-red-500 ">*</span>
//               </label>
//               <textarea
//                 name="taskDescription"
//                 value={formData.taskDescription}
//                 onChange={handleInput}
//                 className="w-full p-2 border rounded"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium">
//                 Start Date & Time
//                 <span className="text-red-500 ">*</span>
//               </label>
//               <input
//                 type="datetime-local"
//                 name="startDate"
//                 value={formData.startDate}
//                 onChange={handleInput}
//                 className="w-full p-2 border rounded"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium">
//                 End Date & Time
//                 <span className="text-red-500 ">*</span>
//               </label>
//               <input
//                 type="datetime-local"
//                 name="endDate"
//                 value={formData.endDate}
//                 onChange={handleInput}
//                 className="w-full p-2 border rounded"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium">Task Status</label>
//               <select
//                 name="status"
//                 value={formData.status}
//                 onChange={handleInput}
//                 className="w-full p-2 border rounded"
//               >
//                 <option value="Pending">Pending</option>
//                 <option value="In Progress">In Progress</option>
//                 <option value="Completed">Completed</option>
//               </select>
//             </div>

//             <button
//               type="submit"
//               className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//             >
//               Save Task
//             </button>
//           </form>
//         </div>
//       </Modal>
//     </>
//   );
// };
 // adjust paths

const Task = () => {
  const [agents, setAgents] = useState([]);
  const [leads, setLeads] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [tableTasks, setTableTasks] = useState([]);

  const [formData, setFormData] = useState({
    assignedBy: "",
    taskTitle: "Pending Lead Visit",
    taskDescription: "",
    startDate: new Date().toISOString().slice(0, 16),
    endDate: "",
    status: "Pending",
    lead: "",
    assignedTo: "",
    referred_type: "",
    approval_status: "",
  });

  const location = useLocation();
  const { leadId, leadAgentId } = location.state || {}; // Extract both
  const [leadIdState, setLeadIdState] = useState(
    location.state?.leadId || null,
  );
  const [leadAgentIdState] = useState(location.state?.leadAgentId || null);
  const [modalVisible, setModalVisible] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [currentTask, setCurrentTask] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    visibility: false,
    message: "Something went wrong!",
    type: "info",
  });

  // Fetch all data: agents, leads, tasks
  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      const [agentRes, leadRes, taskRes] = await Promise.all([
        api.get("/agent/get-agent"),
        api.get("/lead/get-lead"),
        api.get("/task/get-tasks"),
      ]);

      setAgents(agentRes.data);
      setLeads(leadRes.data);
      setTasks(taskRes.data);

      const formatted = taskRes.data.map((task, index) => {
        // ✅ assigned assignedTo (task owner)
        const owner = agentRes.data.find(
          (a) => a._id === (task.assignedBy?._id || task.assignedBy),
        );

        // ✅ referred assignedTo (if exists)
        const refEmployee = agentRes.data.find(
          (a) => a._id === (task.assignedTo?._id || task.assignedTo),
        );

        // ✅ referred lead (if exists)
        const refLead = leadRes.data.find(
          (l) => l._id === (task.lead?._id || task.lead),
        );

        // ✅ universal display logic
        let referredDisplay = "N/A";

        if (refLead) {
          referredDisplay = `${refLead.lead_name} (${refLead.lead_phone})`;
        } else if (refEmployee) {
          referredDisplay = `${refEmployee.name} (${refEmployee.phone_number})`;
        }

        return {
          _id: task._id,
          id: index + 1,

          employeeName: owner?.name || "N/A",
          employeeCode: owner?.employeeCode || "N/A",

          taskTitle: task.taskTitle,
          status: task.status,
          referredType: task?.referred_type,
          referred: referredDisplay,
           approvalStatus: task?.approval_status,
          action: (
            <Dropdown
              menu={{
                items: [
                  {
                    key: "1",
                    label: (
                      <div
                        className="text-green-600"
                        onClick={() => openEdit(task)}
                      >
                        Edit
                      </div>
                    ),
                  },
                  {
                    key: "2",
                    label: (
                      <div
                        className="text-red-600"
                        onClick={() => handleDelete(task._id)}
                      >
                        Delete
                      </div>
                    ),
                  },
                ],
              }}
              placement="bottomLeft"
            >
              <IoMdMore className="cursor-pointer" />
            </Dropdown>
          ),
        };
      });

      setTableTasks(formatted);
    } catch (err) {
      console.error("Error fetching all data", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [reloadTrigger]);

  const handleAntDSelect = (name, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // reset dependent fields when referred_type changes
      if (name === "referred_type") {
        updated.lead = "";
        updated.assignedTo = "";
      }

      return updated;
    });
  };

  // Auto-fill form when leadId and leadAgentId are passed
  // useEffect(() => {
  //   if (leadId && leads.length > 0 && agents.length > 0 && !currentTask) {
  //     const selectedLead = leads.find((l) => l._id === leadId);
  //     if (!selectedLead) return;

  //     // Use passed leadAgentId, or fallback to lead_agent._id
  //     const finalAgentId = leadAgentId || selectedLead.lead_agent?._id;

  //     // Find agent to ensure it exists
  //     const assignedAgent = agents.find((a) => a._id === finalAgentId);

  //     setFormData((prev) => ({
  //       ...prev,
  //       lead: leadId,
  //       employeeId: assignedAgent ? finalAgentId : "",
  //       taskTitle: "Pending Lead Visit",
  //       startDate: new Date().toISOString().slice(0, 16),
  //       taskDescription: prev.taskDescription, // keep if already set
  //     }));

  //     setModalVisible(true);

  //     // Clear location state to avoid re-triggering
  //     window.history.replaceState({}, document.title);
  //   }
  // }, [leadId, leads, agents, leadAgentId, currentTask]);
  useEffect(() => {
    if (leadIdState && leads.length > 0 && agents.length > 0 && !currentTask) {
      const selectedLead = leads.find((l) => l._id === leadIdState);
      const finalAgentId = leadAgentIdState || selectedLead.lead_agent?._id;
      const assignedAgent = agents.find((a) => a._id === finalAgentId);

      setFormData((prev) => ({
        ...prev,
        lead: leadIdState,
        assignedBy: assignedAgent ? finalAgentId : "",
        taskTitle: "Pending Lead Visit",
        startDate: new Date().toISOString().slice(0, 16),
      }));

      setModalVisible(true);
      setLeadIdState(null); // clear so it won't reopen
    }
  }, [leadIdState, leads, agents, leadAgentIdState, currentTask]);
  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   try {
  //     const payload = { ...formData };

  //     if (currentTask) {
  //       await api.put(`/task/update-task/${currentTask}`, payload);
  //       setAlertConfig({
  //         visibility: true,
  //         message: "Task updated successfully",
  //         type: "success",
  //       });
  //     } else {
  //       await api.post("/task/add-new-task", payload);
  //       setAlertConfig({
  //         visibility: true,
  //         message: "Task created successfully",
  //         type: "success",
  //       });
  //     }

  //     setModalVisible(false);
  //     resetForm();
  //     setReloadTrigger((prev) => prev + 1);
  //   } catch (err) {
  //     console.error("Task creation error:", err.response?.data || err.message);
  //     setAlertConfig({
  //       visibility: true,
  //       message: "Something went wrong",
  //       type: "error",
  //     });
  //   }
  // };
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = { ...formData };

      // ✅ remove empty fields to avoid ObjectId cast error
      if (!payload.assignedTo) delete payload.assignedTo;
      if (!payload.lead) delete payload.lead;
      if (!payload.assignedBy) delete payload.assignedBy;

      // ✅ ensure only one referred_type target is sent
      if (payload.referred_type === "Leads") {
        delete payload.assignedTo;
      }

      if (payload.referred_type === "Employee") {
        delete payload.lead;
      }

      if (currentTask) {
        await api.put(`/task/update-task/${currentTask}`, payload);
        setAlertConfig({
          visibility: true,
          message: "Task updated successfully",
          type: "success",
        });
      } else {
       const res= await api.post("/task/add-new-task", payload);
       console.info(res.data, "test123");
        setAlertConfig({
          visibility: true,
          message: "Task created successfully",
          type: "success",
        });
      }

      setModalVisible(false);
      resetForm();
      setReloadTrigger((prev) => prev + 1);
    } catch (err) {
      console.error("Task creation error:", err.response?.data || err.message);
      setAlertConfig({
        visibility: true,
        message: "Something went wrong",
        type: "error",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      assignedBy: "",
      taskTitle: "Pending Lead Visit",
      taskDescription: "",
      startDate: new Date().toISOString().slice(0, 16),
      endDate: "",
      status: "Pending",
      lead: "",
      assignedTo: "",
      referred_type: "",
      approval_status: "",
    });
    setCurrentTask(null);
  };

  // const openEdit = (task) => {
  //   setCurrentTask(task._id);
  //   setFormData({
  //     employeeId: typeof task.employeeId === "object"
  //       ? task.employeeId._id
  //       : task.employeeId || "",
  //     referred_type: task.lead ? "Leads" : task.employee ? "Employee" : "",
  //     employee: task.employee || "",
  //     taskTitle: task.taskTitle,
  //     taskDescription: task.taskDescription,
  //     startDate: task.startDate?.slice(0, 16) || "",
  //     endDate: task.endDate?.slice(0, 16) || "",
  //     status: task.status || "Pending",
  //     lead: typeof task.lead === "object" ? task.lead._id : task.lead || "",
  //   });
  //   setModalVisible(true);
  // };
  // const openEdit = (task) => {
  //   setCurrentTask(task._id);

  //   const employeeId =
  //     task.employeeId && typeof task.employeeId === "object"
  //       ? task.employeeId._id
  //       : task.employeeId || "";

  //   const leadId =
  //     task.lead && typeof task.lead === "object"
  //       ? task.lead._id
  //       : task.lead || "";

  //   const referredEmployeeId =
  //     task.employee && typeof task.employee === "object"
  //       ? task.employee._id
  //       : task.employee || "";

  //   setFormData({
  //     employeeId,

  //     referred_type: task.lead
  //       ? "Leads"
  //       : task.employee
  //       ? "Employee"
  //       : "",

  //     lead: leadId,
  //     employee: referredEmployeeId,

  //     taskTitle: task.taskTitle || "",
  //     taskDescription: task.taskDescription || "",

  //     startDate: task.startDate
  //       ? new Date(task.startDate).toISOString().slice(0, 16)
  //       : "",

  //     endDate: task.endDate
  //       ? new Date(task.endDate).toISOString().slice(0, 16)
  //       : "",

  //     status: task.status || "Pending",
  //   });

  //   setModalVisible(true);
  // };

  const openEdit = (task) => {
    setCurrentTask(task._id);

    setFormData({
      assignedBy: task.assignedBy?._id || task.assignedBy || "",

      referred_type: task.lead ? "Leads" : task.assignedTo ? "Employee" : "",

      assignedTo: task.assignedTo?._id || task.assignedTo || "",
      lead: task.lead?._id || task.lead || "",

      taskTitle: task.taskTitle,
      taskDescription: task.taskDescription,
      startDate: task.startDate?.slice(0, 16) || "",
      endDate: task.endDate?.slice(0, 16) || "",
      status: task.status || "Pending",
      approval_status: task?.approval_status || "Pending",
    });

    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/task/delete-task/${id}`);
      setReloadTrigger((prev) => prev + 1);
      setAlertConfig({
        visibility: true,
        message: "Task deleted",
        type: "success",
      });
    } catch (err) {
      setAlertConfig({
        visibility: true,
        message: "Delete failed",
        type: "error",
      });
    }
  };

  const columns = [
    { key: "employeeName", header: "Employee Name" },
    { key: "employeeCode", header: "Employee ID" },
    { key: "taskTitle", header: "Task Name" },
    { key: "status", header: "Task Status" },
    {key: "referredType", header: "Referred Type"},
    { key: "referred", header: "Assign to" },
    {key: "approvalStatus", header: "Approval Status"},
    { key: "action", header: "Action" },
  ];

  return (
    <>
      <div className="flex mt-20">
        <Navbar visibility={true} />
        <CustomAlertDialog
          type={alertConfig.type}
          isVisible={alertConfig.visibility}
          message={alertConfig.message}
          onClose={() =>
            setAlertConfig((prev) => ({ ...prev, visibility: false }))
          }
        />
        <Sidebar />

        <div className="flex-grow p-7">
          <div className="mt-6 mb-8">
            <div className="flex justify-between items-center w-full">
              <h1 className="text-2xl font-semibold">Tasks</h1>
              <button
                onClick={() => {
                  setModalVisible(true);
                  resetForm();
                }}
                className="ml-4 bg-blue-950 text-white px-4 py-2 rounded shadow-md hover:bg-blue-800 transition duration-200"
              >
                + Add Task
              </button>
            </div>
          </div>

          {tableTasks.length > 0 && !isLoading ? (
            <DataTable
              updateHandler={(id) => openEdit(tasks.find((t) => t._id === id))}
              data={tableTasks}
              columns={columns}
              exportedPdfName="Task"
              exportedFileName="Tasks.csv"
            />
          ) : (
            <CircularLoader
              isLoading={isLoading}
              failure={!isLoading}
              data="Task Data"
            />
          )}
        </div>
      </div>

      {/* Task Modal */}
      <Modal isVisible={modalVisible} onClose={() => setModalVisible(false)}>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">
            {currentTask ? "Update Task" : "Add Task"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="w-full">
              <label
                className="block mb-2 text-sm font-medium text-gray-900"
                htmlFor="assignedBy"
              >
                Task Assigned By
                <span className="text-red-500">*</span>
              </label>

              <Select
                className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                placeholder="Select Employee"
                popupMatchSelectWidth={false}
                showSearch
                name="assignedBy"
                filterOption={(input, option) => {
                  const text = option?.children?.toString().toLowerCase() || "";
                  return text.includes(input.toLowerCase());
                }}
                value={formData?.assignedBy || undefined}
                onChange={(value) => handleAntDSelect("assignedBy", value)}
              >
                {agents.map((emp) => (
                  <Select.Option key={emp._id} value={emp._id}>
                    {emp.name} | {emp.phone_number}
                  </Select.Option>
                ))}
              </Select>
            </div>

            <div className="w-full">
              <label className="block text-sm font-semibold">
                Assignee Type
                <span className="text-red-500">*</span>
              </label>

              <Select
                className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                placeholder="Select Assignee Type"
                showSearch
                name="referred_type"
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
                value={formData.referred_type || undefined}
                onChange={(value) => handleAntDSelect("referred_type", value)}
              >
                <Select.Option value="Leads">Leads</Select.Option>
                <Select.Option value="Employee">Employee</Select.Option>
              </Select>
            </div>
            {formData.referred_type === "Leads" && (
              <div>
                <label className="block text-sm font-medium">Select Lead</label>

                <Select
                  className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                  showSearch
                  popupMatchSelectWidth={false}
                  placeholder="Select Lead"
                  name="lead"
                  filterOption={(input, option) => {
                  const text = option?.children?.toString().toLowerCase() || "";
                  return text.includes(input.toLowerCase());
                }}
                  value={formData.lead || undefined}
                  onChange={(value) => handleAntDSelect("lead", value)}
                >
                  {leads.map((l) => (
                    <Select.Option key={l._id} value={l._id}>
                      {l.lead_name} | {l.lead_phone}
                    </Select.Option>
                  ))}
                </Select>
              </div>
            )}

            {formData.referred_type === "Employee" && (
              <div>
                <label className="block text-sm font-medium">
                  Select Employee
                </label>

                <Select
                  className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                  showSearch
                  placeholder="Select Employee"
                  name="assignedTo"
                  filterOption={(input, option) => {
                    const text =
                      option?.children?.toString().toLowerCase() || "";
                    return text.includes(input.toLowerCase());
                  }}
                  value={formData.assignedTo || undefined}
                  onChange={(value) => handleAntDSelect("assignedTo", value)}
                >
                  {agents.map((a) => (
                    <Select.Option key={a._id} value={a._id}>
                      {a.name} | {a.phone_number}
                    </Select.Option>
                  ))}
                </Select>
              </div>
            )}

            {/* Description */}

            <div>
              <label className="block text-sm font-medium">
                Task Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="taskDescription"
                value={formData.taskDescription}
                onChange={handleInput}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div className="flex flex-row justify-between space-x-4">
              <div className="w-1/2">
                <label className="block text-sm font-medium">
                  Start Date & Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInput}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              {/* End Date */}
              <div className="w-1/2">
                <label className="block text-sm font-medium">
                  End Date & Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInput}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium">Task Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInput}
                className="w-full p-2 border rounded"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Approval Status</label>
              <select
                name="approval_status"
                value={formData.approval_status}
                onChange={handleInput}
                className="w-full p-2 border rounded"
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
              </select>
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Continue
            </button>
          </form>
        </div>
      </Modal>
    </>
  );
};
export default Task;
