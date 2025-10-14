import { useEffect, useState, useMemo } from "react";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import Navbar from "../components/layouts/Navbar";
import { Button, message } from "antd";
import CircularLoader from "../components/loaders/CircularLoader";
import CustomAlertDialog from "../components/alerts/CustomAlertDialog";
import Sidebar from "../components/layouts/Sidebar";


// const EmployeeAttendanceReport = () => {
//   const [tableAttendanceData, setTableAttendanceData] = useState([]);
//   const [screenLoading, setScreenLoading] = useState(true);
//   const [selectedDate, setSelectedDate] = useState("");
//   const [searchText, setSearchText] = useState("");
//   const [activeUserData, setActiveUserData] = useState({});
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [selectAll, setSelectAll] = useState(false);
//   //const [reloadTrigger, setReloadTrigger] = useState(0);
//     const [alertConfig, setAlertConfig] = useState({
//       visibility: false,
//       message: "Something went wrong!",
//       type: "info",
//     });

//  const formatDate = (date) => {
//   if (!date) return "-";
//   const d = new Date(date);
//   const day = String(d.getDate()).padStart(2, "0");
//   const month = String(d.getMonth() + 1).padStart(2, "0");
//   const year = d.getFullYear();
//   return `${day}-${month}-${year}`;
// };

//   const filterOption = (data, searchText) => {
//     if (!searchText) return data;
//     return data.filter((item) =>
//       item.EmployeeName.toLowerCase().includes(searchText.toLowerCase())
//     );
//   };

//   // Fetch attendance
//   useEffect(() => {
//     const fetchAttendanceReport = async () => {
//       setScreenLoading(true);
//       try {

//         const getISODate = (date) => {
//   const d = new Date(date);
//   const year = d.getFullYear();
//   const month = String(d.getMonth() + 1).padStart(2, "0");
//   const day = String(d.getDate()).padStart(2, "0");
//   return `${year}-${month}-${day}`;
// };

// const currentDate = getISODate(selectedDate || new Date());

//         //const currentDate = new Date(selectedDate).toISOString().split("T")[0]
      

//         const response = await api.get(
//           `/employee-attendance/employees/date/${currentDate}`
//         );

//         const formattedData =
//           response?.data?.agentAttendanceData?.map((attend, index) => {
//             const details = attend?.attendance_details || {};
//             const isApproved =
//               details?.approval_status?.toLowerCase() === "approved";

//             return {
//               _id: attend?._id,
//               id: index + 1,
//               EmployeeName: attend?.employee_name || "-",
//               Status: details?.status || "Absent",
//               ApprovalStatus: details?.approval_status || "Pending",
//               // Date: details?.date
//               //   ? new Date(details.date).toLocaleDateString("en-GB")
//               //   : "-",
//               Date: details?.date ? formatDate(details.date) : "-",
//               Time: details?.time || "-",
//               attendanceId: details?._id,
//               Approved: isApproved,
//             };
//           }) || [];

//         setTableAttendanceData(formattedData);

//         const activeMap = {};
//         formattedData.forEach((item) => {
//           activeMap[item._id] = { info: { status: item.Approved } };
//         });
//         setActiveUserData(activeMap);
//       } catch (error) {
//         console.error("Failed to load attendance data", error);
//         //  message.error("Failed to load attendance data");
//       } finally {
//         setScreenLoading(false);
//       }
//     };

//     fetchAttendanceReport();
//   }, [selectedDate]);

//   // Toggle employee status
//   const handleStatusToggle = (id) => {
//     setTableAttendanceData((prevData) =>
//       prevData.map((item) =>
//         item._id === id
//           ? {
//               ...item,
//               Status: item.Status === "Present" ? "Absent" : "Present",
//             }
//           : item
//       )
//     );
//   };

//   const handleCheckboxChange = (id, checked) => {
//     setActiveUserData((prev) => ({
//       ...prev,
//       [id]: { info: { status: checked } },
//     }));

//     setTableAttendanceData((prevData) =>
//       prevData.map((item) =>
//         item._id === id
//           ? {
//               ...item,
//               Approved: checked,
//               ApprovalStatus: checked ? "Approved" : "Pending",
//             }
//           : item
//       )
//     );
//   };

//   const filteredAttendance = useMemo(() => {
//     return filterOption(tableAttendanceData, searchText).map((item, index) => {
//       return {
//         ...item,
//         id: index + 1,
//         ApprovalStatus: (
//           <span
//             className={`px-3 py-1 rounded-full text-sm font-semibold ${
//               item.ApprovalStatus === "Approved"
//                 ? "bg-green-100 text-green-700"
//                 : "bg-red-100 text-red-700"
//             }`}
//           >
//             {item.ApprovalStatus}
//           </span>
//         ),
//         checkBox: (
//           <div className="flex items-center gap-2">
//             <button
//               onClick={() => handleStatusToggle(item._id)}
//               className={`px-5 py-2 rounded-lg font-medium text-white text-sm shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl ${
//                 item.Status === "Present"
//                   ? "bg-gradient-to-r from-green-500 to-green-500"
//                   : "bg-gradient-to-r from-red-500 to-red-500"
//               }`}
//             >
//               {item.Status}
//             </button>

//             {/* Approval checkbox */}
//             <input
//               type="checkbox"
//               checked={item.Approved}
//               disabled={item.ApprovalStatus === "Approved"}
//               onChange={(e) => handleCheckboxChange(item._id, e.target.checked)}
//               className={`w-5 h-5 accent-green-600 ${
//                 item.ApprovalStatus === "Approved"
//                   ? "cursor-not-allowed opacity-50"
//                   : "cursor-pointer"
//               }`}
//             />
//           </div>
//         ),
//       };
//     });
//   }, [tableAttendanceData, activeUserData, searchText]);

//   const handleSelectAll = (checked) => {
//     setSelectAll(checked);
//     const updated = {};
//     filteredAttendance.forEach((item) => {
//       updated[item._id] = { info: { status: checked } };
//     });
//     setActiveUserData((prev) => ({ ...prev, ...updated }));

//     setTableAttendanceData((prevData) =>
//       prevData.map((item) =>
//         filteredAttendance.find((f) => f._id === item._id)
//           ? {
//               ...item,
//               Approved: checked,
//               ApprovalStatus: checked ? "Approved" : "Pending",
//             }
//           : item
//       )
//     );
//   };

//   const handleSubmit = async () => {
//     setIsSubmitting(true);
//     try {
//       const currentUser = JSON.parse(localStorage.getItem("user")) || {};
//       const approvedBy = currentUser?._id;

//       const updatedData = tableAttendanceData.map((row) => ({
//         employee_id: row._id,
//         attendance_id: row.attendanceId,
//         status: row.Status,
//         approval_status: row.ApprovalStatus,
//         approved_by: row.Approved ? approvedBy : null,
//       }));

//       const response = await api.put("/employee-attendance/update-approvals", {
//         updates: updatedData,
//       });

//       if (response.status === 200) {
//        // message.success(" Attendance updated successfully!");
//         // refresh table
//         setSelectedDate(selectedDate); // triggers useEffect reload
//        // setReloadTrigger((prev) => prev + 1);
//       } else {
//         console.warning(" Failed to update attendance.");
//       }
//       setAlertConfig({
//           visibility: true,
//           message: "Employee Attendance Added Successfully",
//           type: "success",
//         });
//     } catch (error) {
//       console.error(" Something went wrong!", error);
//      // message.error(" Something went wrong!");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const AttendanceColumns = [
//     { key: "id", header: "Sl No" },
//     { key: "EmployeeName", header: "Employee Name" },
//     { key: "Status", header: "Status" },
//     { key: "ApprovalStatus", header: "Approval Status" },
//     { key: "Date", header: "Date" },
//     { key: "Time", header: "Time" },
//     { key: "checkBox", header: "Admin Actions" },
//   ];

//   return (
//     <div className="w-screen">
//       <div className="flex mt-30">
//         <Navbar
//           onGlobalSearchChangeHandler={(e) => setSearchText(e.target.value)}
//           visibility={true}
//         />
//         <Sidebar />
//         <CustomAlertDialog
//           type={alertConfig.type}
//           isVisible={alertConfig.visibility}
//           message={alertConfig.message}
//           onClose={() =>
//             setAlertConfig((prev) => ({ ...prev, visibility: false }))
//           }
//         />
//         {screenLoading ? (
//           <div className="w-full flex justify-center items-center h-[70vh]">
//             <CircularLoader color="text-green-600" />
//           </div>
//         ) : (
//           <div className="flex-grow p-7 mt-16">
//             <h1 className="text-2xl font-bold text-center mb-6">
//               Employee Attendance
//             </h1>

//             <div className="flex flex-wrap items-center gap-4 mb-6 border-b border-gray-300 pb-4 justify-between">
//               <div className="flex items-center gap-4">
//                 {/* <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Date Filter
//                   </label>
//                   <input
//                     type="date"
//                     value={
//                       selectedDate || new Date().toISOString().split("T")[0]
//                     }
//                     max={new Date().toISOString().split("T")[0]}
//                     onChange={(e) => setSelectedDate(e.target.value)}
//                     className="border rounded px-4 py-2"
//                   />
//                 </div> */}
//                 <div className="flex items-center gap-2">
//   <input
//     type="date"
//     value={selectedDate || new Date().toISOString().split("T")[0]}
//     max={new Date().toISOString().split("T")[0]}
//     onChange={(e) => setSelectedDate(e.target.value)}
//     className="border rounded px-4 py-2"
//   />
//   <span className="text-gray-600 text-sm">
//     (
//     {selectedDate
//       ? `${selectedDate.split("-")[2]}-${selectedDate.split("-")[1]}-${selectedDate.split("-")[0]}`
//       : (() => {
//           const d = new Date();
//           const dd = String(d.getDate()).padStart(2, "0");
//           const mm = String(d.getMonth() + 1).padStart(2, "0");
//           const yyyy = d.getFullYear();
//           return `${dd}-${mm}-${yyyy}`;
//         })()}
//     )
//   </span>
// </div>

//                 <div className="flex items-center mt-6">
//                   <input
//                     type="checkbox"
//                     checked={selectAll}
//                     onChange={(e) => handleSelectAll(e.target.checked)}
//                     className="mr-2"
//                   />
//                   <label className="text-sm font-medium text-gray-700">
//                     Select All
//                   </label>
//                 </div>
//               </div>

//               <div className="flex items-center mt-6">
//                 <Button
//                   type="primary"
//                   loading={isSubmitting}
//                   onClick={handleSubmit}
//                   className="bg-green-600 text-white hover:bg-green-700 px-6 py-2 rounded-lg"
//                 >
//                   Submit Updates
//                 </Button>
//               </div>
//             </div>

//             <DataTable columns={AttendanceColumns} data={filteredAttendance} />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

const EmployeeAttendanceReport = () => {
  const [tableAttendanceData, setTableAttendanceData] = useState([]);
  const [screenLoading, setScreenLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [searchText, setSearchText] = useState("");
  const [activeUserData, setActiveUserData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  //const [reloadTrigger, setReloadTrigger] = useState(0);
    const [alertConfig, setAlertConfig] = useState({
      visibility: false,
      message: "Something went wrong!",
      type: "info",
    });

 const formatDate = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

  const filterOption = (data, searchText) => {
    if (!searchText) return data;
    return data.filter((item) =>
      item.EmployeeName.toLowerCase().includes(searchText.toLowerCase())
    );
  };

  // Fetch attendance
  useEffect(() => {
    const fetchAttendanceReport = async () => {
      setScreenLoading(true);
      try {

        const getISODate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const currentDate = getISODate(selectedDate || new Date());

        //const currentDate = new Date(selectedDate).toISOString().split("T")[0]
      

        const response = await api.get(
          `/employee-attendance/employees/date/${currentDate}`
        );

        const formattedData =
          response?.data?.agentAttendanceData?.map((attend, index) => {
            const details = attend?.attendance_details || {};
            const isApproved =
              details?.approval_status?.toLowerCase() === "approved";

            return {
              _id: attend?._id,
              id: index + 1,
              EmployeeName: attend?.employee_name || "-",
              Status: details?.status || "Absent",
              ApprovalStatus: details?.approval_status || "Pending",
              // Date: details?.date
              //   ? new Date(details.date).toLocaleDateString("en-GB")
              //   : "-",
              Date: details?.date ? formatDate(details.date) : "-",
              Time: details?.time || "-",
              attendanceId: details?._id,
              Approved: isApproved,
            };
          }) || [];

        setTableAttendanceData(formattedData);

        const activeMap = {};
        formattedData.forEach((item) => {
          activeMap[item._id] = { info: { status: item.Approved } };
        });
        setActiveUserData(activeMap);
      } catch (error) {
        console.error("Failed to load attendance data", error);
        //  message.error("Failed to load attendance data");
      } finally {
        setScreenLoading(false);
      }
    };

    fetchAttendanceReport();
  }, [selectedDate]);

  // Toggle employee status
  const handleStatusToggle = (id) => {
    setTableAttendanceData((prevData) =>
      prevData.map((item) =>
        item._id === id
          ? {
              ...item,
              Status: item.Status === "Present" ? "Absent" : "Present",
            }
          : item
      )
    );
  };

  const handleCheckboxChange = (id, checked) => {
    setActiveUserData((prev) => ({
      ...prev,
      [id]: { info: { status: checked } },
    }));

    setTableAttendanceData((prevData) =>
      prevData.map((item) =>
        item._id === id
          ? {
              ...item,
              Approved: checked,
              ApprovalStatus: checked ? "Approved" : "Pending",
            }
          : item
      )
    );
  };

  const filteredAttendance = useMemo(() => {
    return filterOption(tableAttendanceData, searchText).map((item, index) => {
      return {
        ...item,
        id: index + 1,
        ApprovalStatus: (
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              item.ApprovalStatus === "Approved"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {item.ApprovalStatus}
          </span>
        ),
        checkBox: (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleStatusToggle(item._id)}
              className={`px-5 py-2 rounded-lg font-medium text-white text-sm shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl ${
                item.Status === "Present"
                  ? "bg-gradient-to-r from-green-500 to-green-500"
                  : "bg-gradient-to-r from-red-500 to-red-500"
              }`}
            >
              {item.Status}
            </button>

            {/* Approval checkbox */}
            <input
              type="checkbox"
              checked={item.Approved}
              disabled={item.ApprovalStatus === "Approved"}
              onChange={(e) => handleCheckboxChange(item._id, e.target.checked)}
              className={`w-5 h-5 accent-green-600 ${
                item.ApprovalStatus === "Approved"
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer"
              }`}
            />
          </div>
        ),
      };
    });
  }, [tableAttendanceData, activeUserData, searchText]);

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    const updated = {};
    filteredAttendance.forEach((item) => {
      updated[item._id] = { info: { status: checked } };
    });
    setActiveUserData((prev) => ({ ...prev, ...updated }));

    setTableAttendanceData((prevData) =>
      prevData.map((item) =>
        filteredAttendance.find((f) => f._id === item._id)
          ? {
              ...item,
              Approved: checked,
              ApprovalStatus: checked ? "Approved" : "Pending",
            }
          : item
      )
    );
  };

  // const handleSubmit = async () => {
  //   setIsSubmitting(true);
  //   try {
  //     const currentUser = JSON.parse(localStorage.getItem("user")) || {};
  //     const approvedBy = currentUser?._id;

  //     const updatedData = tableAttendanceData.map((row) => ({
  //       employee_id: row._id,
  //       attendance_id: row.attendanceId,
  //       status: row.Status,
  //       approval_status: row.ApprovalStatus,
  //       approved_by: row.Approved ? approvedBy : null,
  //     }));

  //     const response = await api.put("/employee-attendance/update-approvals", {
  //       updates: updatedData,
  //     });

  //     if (response.status === 200) {
  //      // message.success(" Attendance updated successfully!");
  //       // refresh table
  //       setSelectedDate(selectedDate); // triggers useEffect reload
  //      // setReloadTrigger((prev) => prev + 1);
  //     } else {
  //       console.warning(" Failed to update attendance.");
  //     }
  //     setAlertConfig({
  //         visibility: true,
  //         message: "Employee Attendance Added Successfully",
  //         type: "success",
  //       });
  //   } catch (error) {
  //     console.error(" Something went wrong!", error);
  //    // message.error(" Something went wrong!");
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };
 
const handleSubmit = async () => {
  setIsSubmitting(true);
  try {
    const currentUser = JSON.parse(localStorage.getItem("user")) || {};
    const approvedBy = currentUser?._id;
    const formattedDate = selectedDate || new Date().toISOString().split("T")[0];

    // ✅ 1️⃣ Only selected (checked) employees
    const selectedEmployees = tableAttendanceData.filter((row) => row.Approved === true);

    if (selectedEmployees.length === 0) {
      setAlertConfig({
        visibility: true,
        message: "Please select at least one employee to approve.",
        type: "info",
      });
      setIsSubmitting(false);
      return;
    }

    // ✅ 2️⃣ Separate new absentees (no attendanceId) and existing records
    const newAbsentees = selectedEmployees.filter((row) => !row.attendanceId);
    const existingUpdates = selectedEmployees.filter((row) => row.attendanceId);

    // ✅ 3️⃣ Save new absent employees only if selected
    if (newAbsentees.length > 0) {
      await api.post("/employee-attendance/save-selected-absent", {
        absentees: newAbsentees.map((row) => ({
          employee_id: row._id,
          status: "Absent",
          approval_status: "Approved",
          approved_by: approvedBy,
          date: formattedDate,
        })),
      });
    }

    // ✅ 4️⃣ Update existing attendance (punched) if selected
    if (existingUpdates.length > 0) {
      const updatedData = existingUpdates.map((row) => ({
        employee_id: row._id,
        attendance_id: row.attendanceId,
        status: row.Status,
        approval_status: "Approved",
        approved_by: approvedBy,
      }));

      await api.put("/employee-attendance/update-approvals", {
        updates: updatedData,
      });
    }

    // ✅ 5️⃣ Final message
    setAlertConfig({
      visibility: true,
      message: "Selected employees updated successfully.",
      type: "success",
    });

    // Refresh table
    setSelectedDate(formattedDate);
  } catch (error) {
    console.error("Something went wrong while submitting attendance:", error);
    setAlertConfig({
      visibility: true,
      message: "Error updating selected employees!",
      type: "error",
    });
  } finally {
    setIsSubmitting(false);
  }
};





  const AttendanceColumns = [
    { key: "id", header: "Sl No" },
    { key: "EmployeeName", header: "Employee Name" },
    { key: "Status", header: "Status" },
    { key: "ApprovalStatus", header: "Approval Status" },
    { key: "Date", header: "Date" },
    { key: "Time", header: "Time" },
    { key: "checkBox", header: "Admin Actions" },
  ];

  return (
    <div className="w-screen">
      <div className="flex mt-30">
        <Navbar
          onGlobalSearchChangeHandler={(e) => setSearchText(e.target.value)}
          visibility={true}
        />
        <Sidebar />
        <CustomAlertDialog
          type={alertConfig.type}
          isVisible={alertConfig.visibility}
          message={alertConfig.message}
          onClose={() =>
            setAlertConfig((prev) => ({ ...prev, visibility: false }))
          }
        />
        {screenLoading ? (
          <div className="w-full flex justify-center items-center h-[70vh]">
            <CircularLoader color="text-green-600" />
          </div>
        ) : (
          <div className="flex-grow p-7 mt-16">
            <h1 className="text-2xl font-bold text-center mb-6">
              Employee Attendance
            </h1>

            <div className="flex flex-wrap items-center gap-4 mb-6 border-b border-gray-300 pb-4 justify-between">
              <div className="flex items-center gap-4">
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Filter
                  </label>
                  <input
                    type="date"
                    value={
                      selectedDate || new Date().toISOString().split("T")[0]
                    }
                    max={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="border rounded px-4 py-2"
                  />
                </div> */}
                <div className="flex items-center gap-2">
  <input
    type="date"
    value={selectedDate || new Date().toISOString().split("T")[0]}
    max={new Date().toISOString().split("T")[0]}
    onChange={(e) => setSelectedDate(e.target.value)}
    className="border rounded px-4 py-2"
  />
  <span className="text-gray-600 text-sm">
    (
    {selectedDate
      ? `${selectedDate.split("-")[2]}-${selectedDate.split("-")[1]}-${selectedDate.split("-")[0]}`
      : (() => {
          const d = new Date();
          const dd = String(d.getDate()).padStart(2, "0");
          const mm = String(d.getMonth() + 1).padStart(2, "0");
          const yyyy = d.getFullYear();
          return `${dd}-${mm}-${yyyy}`;
        })()}
    )
  </span>
</div>

                <div className="flex items-center mt-6">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Select All
                  </label>
                </div>
              </div>

              <div className="flex items-center mt-6">
                <Button
                  type="primary"
                  loading={isSubmitting}
                  onClick={handleSubmit}
                  className="bg-green-600 text-white hover:bg-green-700 px-6 py-2 rounded-lg"
                >
                  Submit Updates
                </Button>
              </div>
            </div>

            <DataTable columns={AttendanceColumns} data={filteredAttendance} />
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeAttendanceReport;
