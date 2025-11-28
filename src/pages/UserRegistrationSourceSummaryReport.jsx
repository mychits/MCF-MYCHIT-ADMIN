// import { useState, useEffect } from "react";
// import api from "../instance/TokenInstance";
// import DataTable from "../components/layouts/Datatable";
// import moment from "moment";

// const UserRegistrationSourceSummaryReport = () => {
//   const [trackTableData, setTracktableData] = useState([]);
//   const [agents, setAgents] = useState([]);
//   const [employees, setEmployees] = useState([]);
//   const [filterType, setFilterType] = useState("All");
//   const [selectedAgents, setSelectedAgents] = useState("All");
//   const [selectedId, setSelectedId] = useState("all");

//   useEffect(() => {
//     const fetchAgent = async () => {
//       try {
//         const response =await  api.get("/agent/get");
//         console.info(response, "agentfdadfaf");
//         setAgents(response?.data?.agent || []);
//       } catch (error) {
//         console.error("unable to fetch agents", error);
//       }
//     };
//     fetchAgent();
//   }, []);
//   useEffect(() => {
//     const fetchEmployee = async () => {
//       try {
//         const response = await api.get("/employee");
//         console.info(response, "employeefdadfaf");
//         setEmployees(response?.data?.employee || []);
//       } catch (error) {
//         console.error("unable to fetch employee", error.message);
//       }
//     };
//     fetchEmployee();
//   }, []);
//   useEffect(() => {
//     const fetchUserRegistrationSourceSummaryReport = async () => {
//       try {
//         const params = {};

//         if (filterType === "agent" && selectedId !== "all") {
//           params.agentId = selectedId;
//         }

//         if (filterType === "employee" && selectedId !== "all") {
//           params.employeeId = selectedId;
//         }
//         const response = await api.get("/user/installed/agents", {params});

//         const formattedData = response?.data?.data?.map((item, index) => ({
//           _id: item?._id,
//           slNo: index + 1,
//           userName: item?.full_name || "-",
//           userPhone: item?.phone_number || "-",
//           referredType: item?.referral_type || "-",
//           referredBy: item?.agent?.name || item?.employee?.name || "Admin",
//         }));
//         setTracktableData(formattedData);
//       } catch (error) {
//         console.error(
//           "unable to fetch track source of registration of user",
//           error.message
//         );
//       }
//       // }finally{
//       //
//       // }
//     };
//     fetchUserRegistrationSourceSummaryReport();
//   }, [filterType, selectedId]);

//   const trackColumns = [
//     { key: "slNo", header: "Sl No" },
//     { key: "userName", header: "Name" },
//     { key: "userPhone", header: "Phone Number" },
//     { key: "referredType", header: "Referred Type" },
//     { key: "referredBy", header: "Referred By" },
//   ];
//   return (
//     <div className="p-3">
//       <div className="mb-10">
//         <h1 className="text-2xl font-bold text-gray-800">
//           Reports —{" "}
//           <span className="text-blue-600">User Mobile Tracking Report</span>
//         </h1>
//       </div>

//       {/* Filters */}
//       <div className="flex gap-3 mb-5">
//         {/* Filter Type */}
//         <select
//           className="border p-2 rounded"
//           value={filterType}
//           onChange={(e) => {
//             setFilterType(e.target.value);
//             setSelectedId("all");
//           }}
//         >
//           <option value="all">All</option>
//           <option value="agent">Agent</option>
//           <option value="employee">Employee</option>
//         </select>

//         {/* Dynamic Select (Agent / Employee) */}
//         {filterType !== "all" && (
//           <select
//             className="border p-2 rounded"
//             value={selectedId}
//             onChange={(e) => setSelectedId(e.target.value)}
//           >
//             <option value="all">All</option>

//             {filterType === "agent" &&
//               agents.map((a) => (
//                 <option key={a._id} value={a._id}>
//                   {a.name}
//                 </option>
//               ))}

//             {filterType === "employee" &&
//               employees.map((emp) => (
//                 <option key={emp._id} value={emp._id}>
//                   {emp.name}
//                 </option>
//               ))}
//           </select>
//         )}
//       </div>

//       {/* Table */}
//       <DataTable columns={trackColumns} data={trackTableData} />
//     </div>
//   );
// };

// const UserRegistrationSourceSummaryReport = () => {
//   const [trackTableData, setTracktableData] = useState([]);
//   const [agents, setAgents] = useState([]);
//   const [employees, setEmployees] = useState([]);

//   const [filterType, setFilterType] = useState("all");
//   const [selectedId, setSelectedId] = useState("all");

//   // Date Filters
//   const today = new Date();
//   const formatDate = (date) => date.toLocaleDateString("en-CA");

//   const todayString = formatDate(today);
//   const [selectedFromDate, setSelectedFromDate] = useState(todayString);
//   const [selectedDate, setSelectedDate] = useState(todayString);

//   const [selectedLabel, setSelectedLabel] = useState("Today");
//   const [showFilterField, setShowFilterField] = useState(false);

//   const groupOptions = [
//     { value: "Today", label: "Today" },
//     { value: "Yesterday", label: "Yesterday" },
//     { value: "ThisMonth", label: "This Month" },
//     { value: "LastMonth", label: "Last Month" },
//     { value: "ThisYear", label: "This Year" },
//     { value: "Custom", label: "Custom" },
//   ];

//   // ---------------------------------------------------- //
//   // APPLY DATE FILTERS
//   // ---------------------------------------------------- //
//   const handleSelectFilter = (value) => {
//     setSelectedLabel(value);
//     setShowFilterField(false);

//     const today = new Date();

//     if (value === "Today") {
//       const formatted = formatDate(today);
//       setSelectedFromDate(formatted);
//       setSelectedDate(formatted);
//     } else if (value === "Yesterday") {
//       const yesterday = new Date(today);
//       yesterday.setDate(yesterday.getDate() - 1);
//       const formatted = formatDate(yesterday);
//       setSelectedFromDate(formatted);
//       setSelectedDate(formatted);
//     } else if (value === "ThisMonth") {
//       const start = new Date(today.getFullYear(), today.getMonth(), 1);
//       const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
//       setSelectedFromDate(formatDate(start));
//       setSelectedDate(formatDate(end));
//     } else if (value === "LastMonth") {
//       const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
//       const end = new Date(today.getFullYear(), today.getMonth(), 0);
//       setSelectedFromDate(formatDate(start));
//       setSelectedDate(formatDate(end));
//     } else if (value === "ThisYear") {
//       const start = new Date(today.getFullYear(), 0, 1);
//       const end = new Date(today.getFullYear(), 11, 31);
//       setSelectedFromDate(formatDate(start));
//       setSelectedDate(formatDate(end));
//     } else if (value === "Custom") {
//       setShowFilterField(true);
//     }
//   };

//   // ---------------------------------------------------- //
//   // FETCH AGENTS + EMPLOYEES
//   // ---------------------------------------------------- //

//   useEffect(() => {
//     const fetchAgent = async () => {
//       try {
//         const response = await api.get("/agent/get");
//         setAgents(response?.data?.agent || []);
//       } catch (error) {
//         console.error("unable to fetch agents", error);
//       }
//     };
//     fetchAgent();
//   }, []);

//   useEffect(() => {
//     const fetchEmployee = async () => {
//       try {
//         const response = await api.get("/employee");
//         setEmployees(response?.data?.employee || []);
//       } catch (error) {
//         console.error("unable to fetch employee", error);
//       }
//     };
//     fetchEmployee();
//   }, []);

//   // ---------------------------------------------------- //
//   // FETCH USER MOBILE TRACK REPORT
//   // ---------------------------------------------------- //

//   useEffect(() => {
//     const fetchUserRegistrationSourceSummaryReport = async () => {
//       try {
//         let params = {
//           start_date: selectedFromDate,
//           end_date: selectedDate,
//         };

//         if (filterType === "agent" && selectedId !== "all") {
//           params.agentId = selectedId;
//         }
//         if (filterType === "employee" && selectedId !== "all") {
//           params.employeeId = selectedId;
//         }

//         const response = await api.get("/user/installed/agents", { params });

//         const formattedData = response?.data?.data?.map((item, index) => ({
//           _id: item?._id,
//           slNo: index + 1,
//           userName: item?.full_name || "-",
//           userPhone: item?.phone_number || "-",
//           referredType: item?.referral_type || "-",
//           referredBy: item?.agent?.name || item?.employee?.name || "Admin",
//         }));

//         setTracktableData(formattedData);
//       } catch (error) {
//         console.error("unable to fetch track source of registration", error);
//       }
//     };

//     fetchUserRegistrationSourceSummaryReport();
//   }, [filterType, selectedId, selectedFromDate, selectedDate]);

//   // ---------------------------------------------------- //
//   // TABLE COLUMNS
//   // ---------------------------------------------------- //

//   const trackColumns = [
//     { key: "slNo", header: "Sl No" },
//     { key: "userName", header: "Name" },
//     { key: "userPhone", header: "Phone Number" },
//     { key: "referredType", header: "Referred Type" },
//     { key: "referredBy", header: "Referred By" },
//   ];

//   // ---------------------------------------------------- //
//   // UI RETURN
//   // ---------------------------------------------------- //

//   return (
//     <div className="p-3">
//       <div className="mb-10">
//         <h1 className="text-2xl font-bold text-gray-800">
//           Reports — <span className="text-blue-600">User Mobile Tracking Report</span>
//         </h1>
//       </div>

//       {/* FILTERS */}
//       <div className="flex gap-3 mb-5 items-center">

//         {/* TYPE FILTER */}
//         <select
//           className="border p-6 rounded-md"
//           value={filterType}
//           onChange={(e) => {
//             setFilterType(e.target.value);
//             setSelectedId("all");
//           }}
//         >
//           <option value="all">All</option>
//           <option value="agent">Agent</option>
//           <option value="employee">Employee</option>
//         </select>

//         {/* AGENT / EMPLOYEE DROPDOWN */}
//         {filterType !== "all" && (
//           <select
//             className="border  rounded-md p-6"
//             value={selectedId}
//             onChange={(e) => setSelectedId(e.target.value)}
//           >
//             <option value="all">All</option>

//             {filterType === "agent" &&
//               agents.map((a) => (
//                 <option key={a._id} value={a._id}>{a.name}</option>
//               ))}

//             {filterType === "employee" &&
//               employees.map((emp) => (
//                 <option key={emp._id} value={emp._id}>{emp.name}</option>
//               ))}
//           </select>
//         )}

//         {/* DATE FILTER */}
//         <select
//           className="border p-6 rounded-md"
//           value={selectedLabel}
//           onChange={(e) => handleSelectFilter(e.target.value)}
//         >
//           {groupOptions.map((o) => (
//             <option key={o.value} value={o.value}>{o.label}</option>
//           ))}
//         </select>

//         {/* CUSTOM DATE RANGE */}
//         {showFilterField && (
//           <>
//             <input
//               type="date"
//               className="border p-2 rounded"
//               value={selectedFromDate}
//               onChange={(e) => setSelectedFromDate(e.target.value)}
//             />

//             <input
//               type="date"
//               className="border p-2 rounded"
//               value={selectedDate}
//               onChange={(e) => setSelectedDate(e.target.value)}
//             />
//           </>
//         )}
//       </div>

//       {/* TABLE */}
//       <DataTable columns={trackColumns} data={trackTableData} />
//     </div>
//   );
// };

// const UserRegistrationSourceSummaryReport = () => {
//   const [trackTableData, setTracktableData] = useState([]);
//   const [agents, setAgents] = useState([]);
//   const [employees, setEmployees] = useState([]);

//   const [filterType, setFilterType] = useState("all");
//   const [selectedId, setSelectedId] = useState("all");

//   // ---------------------------------------- //
//   // DATE FILTERS
//   // ---------------------------------------- //
//   const today = new Date();
//   const formatDate = (date) => date.toLocaleDateString("en-CA"); // Returns YYYY-MM-DD

//   const todayStr = formatDate(today);
//   const [selectedFromDate, setSelectedFromDate] = useState(todayStr);
//   const [selectedDate, setSelectedDate] = useState(todayStr);

//   const [selectedLabel, setSelectedLabel] = useState("Today");
//   const [showFilterField, setShowFilterField] = useState(false);

//   const dateOptions = [
//     { value: "Today", label: "Today" },
//     { value: "Yesterday", label: "Yesterday" },
//     { value: "ThisMonth", label: "This Month" },
//     { value: "LastMonth", label: "Last Month" },
//     { value: "ThisYear", label: "This Year" },
//     { value: "Custom", label: "Custom" },
//   ];

//   const handleSelectFilter = (value) => {
//     setSelectedLabel(value);
//     setShowFilterField(false);

//     const today = new Date();

//     if (value === "Today") {
//       const formatted = formatDate(today);
//       setSelectedFromDate(formatted);
//       setSelectedDate(formatted);
//     } else if (value === "Yesterday") {
//       const y = new Date(today);
//       y.setDate(y.getDate() - 1);
//       const formatted = formatDate(y);
//       setSelectedFromDate(formatted);
//       setSelectedDate(formatted);
//     } else if (value === "ThisMonth") {
//       const start = new Date(today.getFullYear(), today.getMonth(), 1);
//       const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
//       setSelectedFromDate(formatDate(start));
//       setSelectedDate(formatDate(end));
//     } else if (value === "LastMonth") {
//       const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
//       const end = new Date(today.getFullYear(), today.getMonth(), 0);
//       setSelectedFromDate(formatDate(start));
//       setSelectedDate(formatDate(end));
//     } else if (value === "ThisYear") {
//       const start = new Date(today.getFullYear(), 0, 1);
//       const end = new Date(today.getFullYear(), 11, 31);
//       setSelectedFromDate(formatDate(start));
//       setSelectedDate(formatDate(end));
//     } else if (value === "Custom") {
//       setShowFilterField(true);
//     }
//   };

//   // ---------------------------------------- //
//   // FETCH AGENTS
//   // ---------------------------------------- //
//   useEffect(() => {
//     const fetchAgent = async () => {
//       try {
//         const resp = await api.get("/agent/get-agent");
//         setAgents(resp?.data || []);
//       } catch (err) {
//         console.error("Unable to fetch agents", err);
//       }
//     };
//     fetchAgent();
//   }, []);

//   // ---------------------------------------- //
//   // FETCH USER TRACKING REPORT
//   // ---------------------------------------- //
//   // useEffect(() => {
//   //   const fetchReport = async () => {
//   //     try {
//   //       // Build params object
//   //       let params = {
//   //         start_date: selectedFromDate,
//   //         end_date: selectedDate,
//   //       };

//   //       // Add agent filter if applicable
//   //       if (filterType === "agent" && selectedId !== "all") {
//   //         params.agentId = selectedId;
//   //       }

//   //       console.log("Fetching report with params:", params); // Debug log

//   //       const response = await api.get("/user/installed/agents", { params });

//   //       const formatted = response?.data?.data?.map((item, index) => ({
//   //         _id: item?._id,
//   //         slNo: index + 1,
//   //         userName: item?.full_name || "-",
//   //         userPhone: item?.phone_number || "-",
//   //         referredType: item?.referral_type || "-",
//   //         referredBy:
//   //           item?.agent?.name || "Admin",
//   //       }));

//   //       setTracktableData(formatted);
//   //     } catch (err) {
//   //       console.error("Error fetching report", err);
//   //     }
//   //   };

//   //   fetchReport();
//   // }, [filterType, selectedId, selectedFromDate, selectedDate]);

//     useEffect(() => {
//     const fetchReport = async () => {
//       try {
//         // Build params object with only the date filters initially
//         let params = {
//           start_date: selectedFromDate,
//           end_date: selectedDate,
//         };

//         // Add agent filter only if filterType is "agent" and a specific agent is selected
//         if (filterType === "agent" && selectedId !== "all") {
//           params.agentId = selectedId;
//         }

//         console.log("Fetching report with params:", params); // Debug log

//         const response = await api.get("/user/installed/agents", { params });

//         const formatted = response?.data?.data?.map((item, index) => ({
//           _id: item?._id,
//           slNo: index + 1,
//           userName: item?.full_name || "-",
//           userPhone: item?.phone_number || "-",
//           referredType: item?.referral_type || "-",
//           referredBy:
//             item?.agent?.name || "Admin",
//         }));

//         setTracktableData(formatted);
//       } catch (err) {
//         console.error("Error fetching report", err);
//       }
//     };

//     fetchReport();
//   }, [filterType, selectedId, selectedFromDate, selectedDate]);

//   // ---------------------------------------- //
//   // TABLE COLUMNS
//   // ---------------------------------------- //
//   const trackColumns = [
//     { key: "slNo", header: "Sl No" },
//     { key: "userName", header: "Name" },
//     { key: "userPhone", header: "Phone Number" },
//     { key: "referredType", header: "Referred Type" },
//     { key: "referredBy", header: "Referred By" },
//   ];

//   // ---------------------------------------- //
//   // UI RETURN
//   // ---------------------------------------- //

//   return (
//     <div className="p-3">
//       <h1 className="text-2xl font-bold text-gray-800 mb-8">
//         Reports — <span className="text-blue-600">User Mobile Tracking Report</span>
//       </h1>

//       {/* FILTERS */}
//       <div className="flex gap-3 mb-6 items-center">
//         {/* TYPE FILTER */}
//         <select
//           className="border p-2 rounded-md"
//           value={filterType}
//           onChange={(e) => {
//             setFilterType(e.target.value);
//             setSelectedId("all");
//           }}
//         >
//           <option value="all">All</option>
//           <option value="agent">Employee</option>
//         </select>

//         {/* AGENT FILTER */}
//         {filterType !== "all" && (
//           <select
//             className="border p-2 rounded-md"
//             value={selectedId}
//             onChange={(e) => setSelectedId(e.target.value)}
//           >
//             <option value="all">All</option>
//             {agents.map((a) => (
//               <option key={a._id} value={a._id}>
//                 {a.name} | {a.phone_number}
//               </option>
//             ))}
//           </select>
//         )}

//         {/* DATE FILTER */}
//         <select
//           className="border p-2 rounded-md"
//           value={selectedLabel}
//           onChange={(e) => handleSelectFilter(e.target.value)}
//         >
//           {dateOptions.map((o) => (
//             <option key={o.value} value={o.value}>
//               {o.label}
//             </option>
//           ))}
//         </select>

//         {/* CUSTOM DATE RANGE */}
//         {showFilterField && (
//           <>
//             <input
//               type="date"
//               className="border p-2 rounded"
//               value={selectedFromDate}
//               onChange={(e) => setSelectedFromDate(e.target.value)}
//             />

//             <input
//               type="date"
//               className="border p-2 rounded"
//               value={selectedDate}
//               onChange={(e) => setSelectedDate(e.target.value)}
//             />
//           </>
//         )}
//       </div>

//       {/* TABLE */}
//       <DataTable columns={trackColumns} data={trackTableData} />
//     </div>
//   );
// };

import { useEffect, useState } from "react";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import Navbar from "../components/layouts/Navbar";
import CircularLoader from "../components/loaders/CircularLoader";
import SettingSidebar from "../components/layouts/SettingSidebar";
import CustomAlertDialog from "../components/alerts/CustomAlertDialog";
import moment from "moment";
import { Select } from "antd";

// const UserRegistrationSourceSummaryReport = () => {
//   const [trackTableData, setTracktableData] = useState([]);
//   const [agents, setAgents] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [searchText, setSearchText] = useState("");
//   const [alertConfig, setAlertConfig] = useState({
//     visibility: false,
//     message: "Something went wrong!",
//     type: "info",
//   });

//   // Filter states
//   const [filterType, setFilterType] = useState("all");
//   const [selectedId, setSelectedId] = useState("all");
//   const today = new Date();
//   const formatDate = (date) => date.toLocaleDateString("en-CA"); // Returns YYYY-MM-DD
//   const todayStr = formatDate(today);
//   const [selectedFromDate, setSelectedFromDate] = useState(todayStr);
//   const [selectedDate, setSelectedDate] = useState(todayStr);
//   const [selectedLabel, setSelectedLabel] = useState("Today");
//   const [showFilterField, setShowFilterField] = useState(false);

//   const dateOptions = [
//     { value: "Today", label: "Today" },
//     { value: "Yesterday", label: "Yesterday" },
//     { value: "ThisMonth", label: "This Month" },
//     { value: "LastMonth", label: "Last Month" },
//     { value: "ThisYear", label: "This Year" },
//     { value: "Custom", label: "Custom" },
//   ];

//   const onGlobalSearchChangeHandler = (e) => {
//     const { value } = e.target;
//     setSearchText(value);
//   };

//   const handleSelectFilter = (value) => {
//     setSelectedLabel(value);
//     setShowFilterField(false);

//     const today = new Date();

//     if (value === "Today") {
//       const formatted = formatDate(today);
//       setSelectedFromDate(formatted);
//       setSelectedDate(formatted);
//     } else if (value === "Yesterday") {
//       const y = new Date(today);
//       y.setDate(y.getDate() - 1);
//       const formatted = formatDate(y);
//       setSelectedFromDate(formatted);
//       setSelectedDate(formatted);
//     } else if (value === "ThisMonth") {
//       const start = new Date(today.getFullYear(), today.getMonth(), 1);
//       const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
//       setSelectedFromDate(formatDate(start));
//       setSelectedDate(formatDate(end));
//     } else if (value === "LastMonth") {
//       const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
//       const end = new Date(today.getFullYear(), today.getMonth(), 0);
//       setSelectedFromDate(formatDate(start));
//       setSelectedDate(formatDate(end));
//     } else if (value === "ThisYear") {
//       const start = new Date(today.getFullYear(), 0, 1);
//       const end = new Date(today.getFullYear(), 11, 31);
//       setSelectedFromDate(formatDate(start));
//       setSelectedDate(formatDate(end));
//     } else if (value === "Custom") {
//       setShowFilterField(true);
//     }
//   };

//   // Fetch agents
//   useEffect(() => {
//     const fetchAgent = async () => {
//       try {
//         const resp = await api.get("/agent/get-agent");
//         setAgents(resp?.data || []);
//       } catch (err) {
//         console.error("Unable to fetch agents", err);
//         setAlertConfig({
//           visibility: true,
//           message: "Failed to fetch agents",
//           type: "error",
//         });
//       }
//     };
//     fetchAgent();
//   }, []);

//   // Fetch user tracking report
//   useEffect(() => {
//     const fetchReport = async () => {
//       try {
//         setIsLoading(true);

//         // Build params object with only the date filters initially
//         let params = {
//           start_date: selectedFromDate,
//           end_date: selectedDate,
//         };

//         // Add agent filter only if filterType is "agent" and a specific agent is selected
//         if (filterType === "agent" && selectedId !== "all") {
//           params.agentId = selectedId;
//         }

//         console.log("Fetching report with params:", params); // Debug log

//         const response = await api.get("/user/installed/agents", { params });

//         const formatted = response?.data?.data?.map((item, index) => ({
//           _id: item?._id,
//           slNo: index + 1,
//           userName: item?.full_name || "-",
//           userPhone: item?.phone_number || "-",
//           referredType: item?.referral_type || "-",
//           referredBy: item?.agent?.name || "Admin",
//         }));

//         setTracktableData(formatted);
//       } catch (err) {
//         console.error("Error fetching report", err);
//         setAlertConfig({
//           visibility: true,
//           message: "Failed to fetch user tracking report",
//           type: "error",
//         });
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchReport();
//   }, [filterType, selectedId, selectedFromDate, selectedDate]);

//   // Table columns
//   const trackColumns = [
//     { key: "slNo", header: "Sl No" },
//     { key: "userName", header: "Name" },
//     { key: "userPhone", header: "Phone Number" },
//     { key: "referredType", header: "Referred Type" },
//     { key: "referredBy", header: "Referred By" },
//   ];

//   return (
//     <>
//       <div>
//         <div className="flex mt-20">
//           <Navbar
//             onGlobalSearchChangeHandler={onGlobalSearchChangeHandler}
//             visibility={true}
//           />

//           <CustomAlertDialog
//             type={alertConfig.type}
//             isVisible={alertConfig.visibility}
//             message={alertConfig.message}
//             onClose={() =>
//               setAlertConfig((prev) => ({ ...prev, visibility: false }))
//             }
//           />
//           <div className="flex-grow p-7">
//             <div className="mt-6 mb-8">
//               <div className="flex justify-between items-center w-full">
//                 <h1 className="text-2xl font-semibold">
//                   Reports —{" "}
//                   <span className="text-blue-600">
//                     User Mobile Tracking Report
//                   </span>
//                 </h1>
//               </div>
//             </div>

//             <div className="flex gap-3 mb-6 items-center">
//               {/* TYPE FILTER */}
//               <div className="bg-gray-50 border border-gray-300 rounded-lg w-48">
//                 <Select
//                   className="w-full h-10"
//                   value={filterType}
//                   placeholder="Select Filter Type"
//                   onChange={(value) => {
//                     setFilterType(value);
//                     setSelectedId("all");
//                   }}
//                 >
//                   <Select.Option value="all">All</Select.Option>
//                   <Select.Option value="agent">Employee</Select.Option>
//                 </Select>
//               </div>

//               {/* AGENT FILTER */}
//               {filterType === "agent" && (
//                 <div className="bg-gray-50 border border-gray-300 rounded-lg w-64">
//                   <Select
//                     className="w-full h-10"
//                     showSearch
//                     placeholder="Select Or Search Agent"
//                     popupMatchSelectWidth={false}
//                     filterOption={(input, option) =>
//                       option.children
//                         .toLowerCase()
//                         .includes(input.toLowerCase())
//                     }
//                     value={selectedId !== "all" ? selectedId : undefined}
//                     onChange={(value) => setSelectedId(value)}
//                   >
//                     <Select.Option value="all">All Agents</Select.Option>
//                     {agents.map((agent) => (
//                       <Select.Option key={agent._id} value={agent._id}>
//                         {agent.name} | {agent.phone_number}
//                       </Select.Option>
//                     ))}
//                   </Select>
//                 </div>
//               )}

//               {/* DATE FILTER */}
//               <div className="bg-gray-50 border border-gray-300 rounded-lg w-48">
//                 <Select
//                   className="w-full h-10"
//                   value={selectedLabel}
//                   placeholder="Select Date Range"
//                   onChange={(value) => handleSelectFilter(value)}
//                 >
//                   {dateOptions.map((option) => (
//                     <Select.Option key={option.value} value={option.value}>
//                       {option.label}
//                     </Select.Option>
//                   ))}
//                 </Select>
//               </div>

//               {/* CUSTOM DATE RANGE */}
//               {showFilterField && (
//                 <>
//                   <input
//                     type="date"
//                     className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 h-10 p-2.5"
//                     value={selectedFromDate}
//                     onChange={(e) => setSelectedFromDate(e.target.value)}
//                   />

//                   <input
//                     type="date"
//                     className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 h-10 p-2.5"
//                     value={selectedDate}
//                     onChange={(e) => setSelectedDate(e.target.value)}
//                   />
//                 </>
//               )}
//             </div>

//             {trackTableData && !isLoading ? (
//               <DataTable data={trackTableData} columns={trackColumns} />
//             ) : (
//               <CircularLoader
//                 isLoading={isLoading}
//                 failure={trackTableData.length <= 0}
//                 data="user tracking data"
//               />
//             )}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// const UserRegistrationSourceSummaryReport = () => {
//   const [trackTableData, setTracktableData] = useState([]);
//   const [agents, setAgents] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [searchText, setSearchText] = useState("");
//   const [alertConfig, setAlertConfig] = useState({
//     visibility: false,
//     message: "Something went wrong!",
//     type: "info",
//   });

//   // Filter states
//   const [filterType, setFilterType] = useState("all");
//   const [selectedId, setSelectedId] = useState("all");
//   const today = new Date();
//   const formatDate = (date) => date.toLocaleDateString("en-CA");
//   const todayStr = formatDate(today);
//   const [selectedFromDate, setSelectedFromDate] = useState(todayStr);
//   const [selectedDate, setSelectedDate] = useState(todayStr);
//   const [selectedLabel, setSelectedLabel] = useState("Today");
//   const [showFilterField, setShowFilterField] = useState(false);

//   // Display agent/employee name on top
//   const getTopDisplayFilter = () => {
//     if (filterType === "agent") {
//       if (selectedId === "all") return "All Employees";

//       const found = agents.find((a) => a._id === selectedId);
//       return found ? found.name : "Employee";
//     }
//     return "All";
//   };

//   const dateOptions = [
//     { value: "Today", label: "Today" },
//     { value: "Yesterday", label: "Yesterday" },
//     { value: "ThisMonth", label: "This Month" },
//     { value: "LastMonth", label: "Last Month" },
//     { value: "ThisYear", label: "This Year" },
//     { value: "Custom", label: "Custom" },
//   ];

//   const onGlobalSearchChangeHandler = (e) => setSearchText(e.target.value);

//   const handleSelectFilter = (value) => {
//     setSelectedLabel(value);
//     setShowFilterField(false);

//     const today = new Date();

//     if (value === "Today") {
//       const formatted = formatDate(today);
//       setSelectedFromDate(formatted);
//       setSelectedDate(formatted);
//     } else if (value === "Yesterday") {
//       const y = new Date(today);
//       y.setDate(y.getDate() - 1);
//       const formatted = formatDate(y);
//       setSelectedFromDate(formatted);
//       setSelectedDate(formatted);
//     } else if (value === "ThisMonth") {
//       const start = new Date(today.getFullYear(), today.getMonth(), 1);
//       const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
//       setSelectedFromDate(formatDate(start));
//       setSelectedDate(formatDate(end));
//     } else if (value === "LastMonth") {
//       const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
//       const end = new Date(today.getFullYear(), today.getMonth(), 0);
//       setSelectedFromDate(formatDate(start));
//       setSelectedDate(formatDate(end));
//     } else if (value === "ThisYear") {
//       const start = new Date(today.getFullYear(), 0, 1);
//       const end = new Date(today.getFullYear(), 11, 31);
//       setSelectedFromDate(formatDate(start));
//       setSelectedDate(formatDate(end));
//     } else if (value === "Custom") {
//       setShowFilterField(true);
//     }
//   };

//   // Fetch agents
//   useEffect(() => {
//     const fetchAgent = async () => {
//       try {
//         const resp = await api.get("/agent/get-agent");
//         setAgents(resp?.data || []);
//       } catch (err) {
//         console.error("Unable to fetch agents", err);
//       }
//     };
//     fetchAgent();
//   }, []);

//   // Fetch report
//   useEffect(() => {
//     const fetchReport = async () => {
//       try {
//         setIsLoading(true);

//         let params = {
//           start_date: selectedFromDate,
//           end_date: selectedDate,
//         };

//         if (filterType === "agent" && selectedId !== "all") {
//           params.agentId = selectedId;
//         }

//         const response = await api.get("/user/installed/agents", { params });

//         const formatted = response?.data?.data?.map((item, index) => ({
//           _id: item?._id,
//           slNo: index + 1,
//           userName: item?.full_name || "-",
//           userPhone: item?.phone_number || "-",
//           referredType: item?.referral_type || "-",
//           referredBy: item?.agent?.name || "Admin",
//         }));

//         setTracktableData(formatted);
//       } catch (err) {
//         console.error("Error fetching report", err);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchReport();
//   }, [filterType, selectedId, selectedFromDate, selectedDate]);

//   // Table columns
//   const trackColumns = [
//     { key: "slNo", header: "Sl No" },
//     { key: "userName", header: "Name" },
//     { key: "userPhone", header: "Phone Number" },
//     { key: "referredType", header: "Referred Type" },
//     { key: "referredBy", header: "Referred By" },
//   ];

//   return (
//     <>
//       <div>
//         <div className="flex mt-20">
//           <Navbar
//             onGlobalSearchChangeHandler={onGlobalSearchChangeHandler}
//             visibility={true}
//           />

//           <div className="flex-grow p-7">
//             <div className="mt-6 mb-8">
//               <h1 className="text-2xl font-semibold">
//                 Reports —{" "}
//                 <span className="text-blue-600">
//                   User Mobile Tracking Report
//                 </span>
//               </h1>
//             </div>

//             {/* TOP CUSTOMER COUNT BAR */}
//             <div className="mb-5 p-4 bg-blue-50 border border-blue-300 rounded-lg">
//               <h2 className="text-xl font-semibold text-blue-700">
//                 Total Customers Added: {trackTableData.length}{" "}
//                 <span className="text-gray-700 text-lg">
//                   ({getTopDisplayFilter()})
//                 </span>
//               </h2>
//             </div>

//             <div className="flex gap-6 mb-6 items-end">
//               {/* DATE FILTER */}
//               <div className="flex flex-col">
//                 <label className="text-sm font-medium mb-1">Date Filter</label>

//                 <div className="bg-gray-50 border border-gray-300 rounded-lg w-48">
//                   <Select
//                     className="w-full h-10"
//                     value={selectedLabel}
//                     onChange={(value) => handleSelectFilter(value)}
//                   >
//                     {dateOptions.map((option) => (
//                       <Select.Option key={option.value} value={option.value}>
//                         {option.label}
//                       </Select.Option>
//                     ))}
//                   </Select>
//                 </div>
//               </div>

//               {/* CUSTOM DATE RANGE */}
//               {showFilterField && (
//                 <div className="flex gap-3 items-end">
//                   <div className="flex flex-col">
//                     <label className="text-sm font-medium mb-1">From</label>
//                     <input
//                       type="date"
//                       className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg h-10 p-2.5"
//                       value={selectedFromDate}
//                       onChange={(e) => setSelectedFromDate(e.target.value)}
//                     />
//                   </div>

//                   <div className="flex flex-col">
//                     <label className="text-sm font-medium mb-1">To</label>
//                     <input
//                       type="date"
//                       className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg h-10 p-2.5"
//                       value={selectedDate}
//                       onChange={(e) => setSelectedDate(e.target.value)}
//                     />
//                   </div>
//                 </div>
//               )}

//               {/* EMPLOYEE FILTER TYPE */}
//               <div className="flex flex-col">
//                 <label className="text-sm font-medium mb-1">
//                   Employee Filter
//                 </label>

//                 <div className="bg-gray-50 border border-gray-300 rounded-lg w-48">
//                   <Select
//                     className="w-full h-10"
//                     value={filterType}
//                     onChange={(value) => {
//                       setFilterType(value);
//                       setSelectedId("all");
//                     }}
//                   >
//                     <Select.Option value="all">All</Select.Option>
//                     <Select.Option value="agent">Employee</Select.Option>
//                   </Select>
//                 </div>
//               </div>

//               {/* EMPLOYEE DROPDOWN (VISIBLE ONLY IF Employee filter selected) */}
//               {filterType === "agent" && (
//                 <div className="flex flex-col">
//                   <label className="text-sm font-medium mb-1">
//                     Select Employee
//                   </label>

//                   <div className="bg-gray-50 border border-gray-300 rounded-lg w-64">
//                     <Select
//                       className="w-full h-10"
//                       showSearch
//                       placeholder="Select Employee"
//                       popupMatchSelectWidth={false}
//                       value={selectedId !== "all" ? selectedId : undefined}
//                       onChange={(value) => setSelectedId(value)}
//                     >
//                       <Select.Option value="all">All Employees</Select.Option>
//                       {agents.map((agent) => (
//                         <Select.Option key={agent._id} value={agent._id}>
//                           {agent.name} | {agent.phone_number}
//                         </Select.Option>
//                       ))}
//                     </Select>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* TABLE */}
//             {trackTableData && !isLoading ? (
//               <DataTable data={trackTableData} columns={trackColumns} />
//             ) : (
//               <CircularLoader
//                 isLoading={isLoading}
//                 failure={trackTableData.length <= 0}
//                 data="user tracking data"
//               />
//             )}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

const UserRegistrationSourceSummaryReport = () => {
  const [trackTableData, setTracktableData] = useState([]);
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [alertConfig, setAlertConfig] = useState({
    visibility: false,
    message: "Something went wrong!",
    type: "info",
  });

  // Filter states
  const [filterType, setFilterType] = useState("all");
  const [selectedId, setSelectedId] = useState("all");
  const today = new Date();
  const formatDate = (date) => date.toLocaleDateString("en-CA");
  const todayStr = formatDate(today);
  const [selectedFromDate, setSelectedFromDate] = useState(todayStr);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedLabel, setSelectedLabel] = useState("Today");
  const [showFilterField, setShowFilterField] = useState(false);

  // Display agent/employee name on top
  const getTopDisplayFilter = () => {
    if (filterType === "agent") {
      if (selectedId === "all") return "All Employees";

      const found = agents.find((a) => a._id === selectedId);
      return found ? found.name : "Employee";
    }
    return "All";
  };

  const dateOptions = [
    { value: "Today", label: "Today" },
    { value: "Yesterday", label: "Yesterday" },
    { value: "ThisMonth", label: "This Month" },
    { value: "LastMonth", label: "Last Month" },
    { value: "ThisYear", label: "This Year" },
    { value: "Custom", label: "Custom" },
  ];

  const onGlobalSearchChangeHandler = (e) => setSearchText(e.target.value);

  const handleSelectFilter = (value) => {
    setSelectedLabel(value);
    setShowFilterField(false);

    const today = new Date();

    if (value === "Today") {
      const formatted = formatDate(today);
      setSelectedFromDate(formatted);
      setSelectedDate(formatted);
    } else if (value === "Yesterday") {
      const y = new Date(today);
      y.setDate(y.getDate() - 1);
      const formatted = formatDate(y);
      setSelectedFromDate(formatted);
      setSelectedDate(formatted);
    } else if (value === "ThisMonth") {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      setSelectedFromDate(formatDate(start));
      setSelectedDate(formatDate(end));
    } else if (value === "LastMonth") {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0);
      setSelectedFromDate(formatDate(start));
      setSelectedDate(formatDate(end));
    } else if (value === "ThisYear") {
      const start = new Date(today.getFullYear(), 0, 1);
      const end = new Date(today.getFullYear(), 11, 31);
      setSelectedFromDate(formatDate(start));
      setSelectedDate(formatDate(end));
    } else if (value === "Custom") {
      setShowFilterField(true);
    }
  };

  // Fetch agents
  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const resp = await api.get("/agent/get-agent");
        setAgents(resp?.data || []);
      } catch (err) {
        console.error("Unable to fetch agents", err);
      }
    };
    fetchAgent();
  }, []);

  // Fetch report
  useEffect(() => {
    const fetchReport = async () => {
      try {
        setIsLoading(true);

        let params = {
          start_date: selectedFromDate,
          end_date: selectedDate,
        };

        if (filterType === "agent" && selectedId !== "all") {
          params.agentId = selectedId;
        }

        const response = await api.get("/user/installed/agents", { params });

        const formatted = response?.data?.data?.map((item, index) => ({
          _id: item?._id,
          slNo: index + 1,
          userName: item?.full_name || "-",
          userPhone: item?.phone_number || "-",
          referredType: item?.referral_type || "-",
          referredBy: item?.agent?.name || "Admin",
        }));

        setTracktableData(formatted);
      } catch (err) {
        console.error("Error fetching report", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [filterType, selectedId, selectedFromDate, selectedDate]);

  // Table columns
  const trackColumns = [
    { key: "slNo", header: "Sl No" },
    { key: "userName", header: "Name" },
    { key: "userPhone", header: "Phone Number" },
    { key: "referredType", header: "Referred Type" },
    { key: "referredBy", header: "Referred By" },
  ];

  // Calculate summary data
  const totalCustomers = trackTableData.length;
  
  // Count by Referred Type
  const referredTypeCount = {};
  trackTableData.forEach((item) => {
    const key = item.referredType || "Unknown";
    referredTypeCount[key] = (referredTypeCount[key] || 0) + 1;
  });

  // Count by Referred By
  const referredByCount = {};
  trackTableData.forEach((item) => {
    const key = item.referredBy || "Unknown";
    referredByCount[key] = (referredByCount[key] || 0) + 1;
  });

  // Calculate days between selected dates
  const calculateDaysBetween = () => {
    const fromDate = new Date(selectedFromDate);
    const toDate = new Date(selectedDate);
    const diffTime = Math.abs(toDate - fromDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end date
    return diffDays;
  };

  // Calculate average customers per day
  const avgCustomersPerDay = calculateDaysBetween() > 0 
    ? (totalCustomers / calculateDaysBetween()).toFixed(1) 
    : 0;

  return (
    <>
      <div>
        <div className="flex mt-20">
          <Navbar
            onGlobalSearchChangeHandler={onGlobalSearchChangeHandler}
            visibility={true}
          />

          <div className="flex-grow p-7">
            <div className="mt-6 mb-8">
              <h1 className="text-2xl font-semibold">
                Reports —{" "}
                <span className="text-blue-600">
                  User Mobile Tracking Report
                </span>
              </h1>
            </div>

            {/* ENHANCED SUMMARY CARDS */}
            {trackTableData.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Report Summary</h2>
                
                {/* TOTAL CUSTOMERS CARD */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm uppercase tracking-wide">
                        Total Customers Added
                      </p>
                      <p className="text-3xl font-bold mt-1">{totalCustomers}</p>
                      <p className="text-blue-100 text-sm mt-1">
                        {getTopDisplayFilter()}
                      </p>
                    </div>
                    <div className="bg-white bg-opacity-20 p-3 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* SUMMARY GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  
                  {/* REFERRAL TYPE COUNT */}
                  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">Referral Types</h3>
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {Object.keys(referredTypeCount).length} Types
                      </span>
                    </div>
                    <div className="space-y-3">
                      {Object.entries(referredTypeCount)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([type, count]) => (
                          <div key={type} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                              <span className="text-gray-700 text-sm truncate max-w-xs">{type}</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full" 
                                  style={{ width: `${(count / totalCustomers) * 100}%` }}
                                ></div>
                              </div>
                              <span className="font-semibold text-gray-800 w-8 text-right">{count}</span>
                            </div>
                          </div>
                        ))}
                      {Object.keys(referredTypeCount).length > 5 && (
                        <div className="text-center pt-2">
                          <button className="text-blue-600 text-sm font-medium">View All Types</button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* REFERRAL SOURCE COUNT */}
                  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">Referral Sources</h3>
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {Object.keys(referredByCount).length} Sources
                      </span>
                    </div>
                    <div className="space-y-3">
                      {Object.entries(referredByCount)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([source, count]) => (
                          <div key={source} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                              <span className="text-gray-700 text-sm truncate max-w-xs">{source}</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                                <div 
                                  className="bg-green-500 h-2 rounded-full" 
                                  style={{ width: `${(count / totalCustomers) * 100}%` }}
                                ></div>
                              </div>
                              <span className="font-semibold text-gray-800 w-8 text-right">{count}</span>
                            </div>
                          </div>
                        ))}
                      {Object.keys(referredByCount).length > 5 && (
                        <div className="text-center pt-2">
                          <button className="text-green-600 text-sm font-medium">View All Sources</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* ADDITIONAL METRICS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Selected Period</p>
                        <p className="font-semibold text-gray-800">{selectedLabel}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-amber-100 text-amber-600 mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Avg. Customers/Day</p>
                        <p className="font-semibold text-gray-800">{avgCustomersPerDay}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Active Referrers</p>
                        <p className="font-semibold text-gray-800">{Object.keys(referredByCount).length}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-6 mb-6 items-end">
              {/* DATE FILTER */}
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Date Filter</label>

                <div className="bg-gray-50 border border-gray-300 rounded-lg w-48">
                  <Select
                    className="w-full h-10"
                    value={selectedLabel}
                    onChange={(value) => handleSelectFilter(value)}
                  >
                    {dateOptions.map((option) => (
                      <Select.Option key={option.value} value={option.value}>
                        {option.label}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
              </div>

              {/* CUSTOM DATE RANGE */}
              {showFilterField && (
                <div className="flex gap-3 items-end">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium mb-1">From</label>
                    <input
                      type="date"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg h-10 p-2.5"
                      value={selectedFromDate}
                      onChange={(e) => setSelectedFromDate(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm font-medium mb-1">To</label>
                    <input
                      type="date"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg h-10 p-2.5"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* EMPLOYEE FILTER TYPE */}
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">
                  Employee Filter
                </label>

                <div className="bg-gray-50 border border-gray-300 rounded-lg w-48">
                  <Select
                    className="w-full h-10"
                    value={filterType}
                    onChange={(value) => {
                      setFilterType(value);
                      setSelectedId("all");
                    }}
                  >
                    <Select.Option value="all">All</Select.Option>
                    <Select.Option value="agent">Employee</Select.Option>
                  </Select>
                </div>
              </div>

              {/* EMPLOYEE DROPDOWN (VISIBLE ONLY IF Employee filter selected) */}
              {filterType === "agent" && (
                <div className="flex flex-col">
                  <label className="text-sm font-medium mb-1">
                    Select Employee
                  </label>

                  <div className="bg-gray-50 border border-gray-300 rounded-lg w-64">
                    <Select
                      className="w-full h-10"
                      showSearch
                      placeholder="Select Employee"
                      popupMatchSelectWidth={false}
                      value={selectedId !== "all" ? selectedId : undefined}
                      onChange={(value) => setSelectedId(value)}
                    >
                      <Select.Option value="all">All Employees</Select.Option>
                      {agents.map((agent) => (
                        <Select.Option key={agent._id} value={agent._id}>
                          {agent.name} | {agent.phone_number}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                </div>
              )}
            </div>

            {/* TABLE */}
            {trackTableData && !isLoading ? (
              <DataTable data={trackTableData} columns={trackColumns} />
            ) : (
              <CircularLoader
                isLoading={isLoading}
                failure={trackTableData.length <= 0}
                data="user tracking data"
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserRegistrationSourceSummaryReport;
