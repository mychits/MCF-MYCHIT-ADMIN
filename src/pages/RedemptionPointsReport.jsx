import { useState, useEffect } from "react";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import Navbar from "../components/layouts/Navbar";
import {Select} from "antd"

// const RedemptionPointsReport = () => {
//   const [employees, setEmployees] = useState([]);
//   const [employeeId, setEmployeeId] = useState("");
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [rewardDataTable, setRewardDataTable] = useState([]);
//   const [loading, setLoading] = useState(false);

//   /* ================= FETCH EMPLOYEES ================= */
//   useEffect(() => {
//     const fetchEmployees = async () => {
//       try {
//         const res = await api.get("/agent/get-employee");
//         console.info(res);
//         setEmployees(res.data?.employee || []);
//       } catch (err) {
//         console.error("Unable to fetch employees", err);
//       }
//     };
//     fetchEmployees();
//   }, []);

//   /* ================= FETCH REWARD POINTS ================= */
//   const fetchRewardPoints = async () => {
//     if (!employeeId || !fromDate || !toDate) {
//       alert("Please select Employee, From Date and To Date");
//       return;
//     }

//     try {
//       setLoading(true);

//       const res = await api.post("/reward-points/redemption", {
//         employee_id: employeeId,
//         from_date: fromDate,
//         to_date: toDate,
//       });
//       console.info(res, "redemption");

//       const formattedData = res.data?.data?.map((reward, index) => ({
//         id: reward._id,
//         slNo: index + 1,
//         usedPoints: reward.points_used ?? "-",
//         redemptionType: reward.redemption_type ?? "-",
//         amount: reward.amount ?? "-",
//         description: reward.description || "-",
//       }));

//       setRewardDataTable(formattedData || []);
//     } catch (err) {
//       console.error("Unable to fetch reward points", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ================= TABLE COLUMNS ================= */
//   const rewardColumns = [
//     { key: "slNo", header: "Sl No" },
//     { key: "usedPoints", header: "Used Points" },
//     { key: "redemptionType", header: "Redemption Type" },
//     { key: "amount", header: "Amount" },
//     { key: "description", header: "Description" },
//   ];

//   return (
//     <div>
//       <Navbar />

//       <div className="flex mt-20">
//         <div className="flex-grow p-7">
//           <h1 className="text-2xl font-semibold mb-5">
//             Reports - Reward Points
//           </h1>

//           {/* ================= FILTERS ================= */}
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//             {/* Employee */}
//             <select
//               className="border p-2 rounded"
//               value={employeeId}
//               onChange={(e) => setEmployeeId(e.target.value)}
//             >
//               <option value="">Select Employee</option>
//               {employees.map((emp) => (
//                 <option key={emp._id} value={emp._id}>
//                   {emp.name}
//                 </option>
//               ))}
//             </select>

//             {/* From Date */}
//             <input
//               type="date"
//               className="border p-2 rounded"
//               value={fromDate}
//               onChange={(e) => setFromDate(e.target.value)}
//             />

//             {/* To Date */}
//             <input
//               type="date"
//               className="border p-2 rounded"
//               value={toDate}
//               onChange={(e) => setToDate(e.target.value)}
//             />

//             {/* Search Button */}
//             <button
//               onClick={fetchRewardPoints}
//               className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700"
//             >
//               {loading ? "Loading..." : "Search"}
//             </button>
//           </div>

//           {/* ================= TABLE ================= */}
//           <DataTable data={rewardDataTable} columns={rewardColumns} />
//         </div>
//       </div>
//     </div>
//   );
// };

// const RedemptionPointsReport = () => {
//   /* ================= COMMON STATES ================= */
//   const [reportType, setReportType] = useState(""); // EMPLOYEE | CUSTOMER
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [tableData, setTableData] = useState([]);

//   /* ================= EMPLOYEE ================= */
//   const [employees, setEmployees] = useState([]);
//   const [employeeId, setEmployeeId] = useState("");

//   /* ================= CUSTOMER ================= */
//   const [customers, setCustomers] = useState([]);
//   const [customerId, setCustomerId] = useState("");

//   /* ================= FETCH EMPLOYEES ================= */
//   useEffect(() => {
//     const fetchEmployees = async () => {
//       try {
//         const res = await api.get("/agent/get-employee");
//         setEmployees(res.data?.employee || []);
//       } catch (err) {
//         console.error("Employee fetch error", err);
//       }
//     };
//     fetchEmployees();
//   }, []);

//   /* ================= FETCH CUSTOMERS ================= */
//   useEffect(() => {
//     const fetchCustomers = async () => {
//       try {
//         const res = await api.get("/user/get-user"); // adjust if endpoint differs
//         setCustomers(res.data || []);
//       } catch (err) {
//         console.error("Customer fetch error", err);
//       }
//     };
//     fetchCustomers();
//   }, []);

//   /* ================= SEARCH HANDLER ================= */
//   const handleSearch = async () => {
//     if (!fromDate || !toDate) {
//       alert("Please select From Date and To Date");
//       return;
//     }

//     if (reportType === "EMPLOYEE" && !employeeId) {
//       alert("Please select Employee");
//       return;
//     }

//     if (reportType === "CUSTOMER" && !customerId) {
//       alert("Please select Customer");
//       return;
//     }

//     try {
//       setLoading(true);

//       let res;

//       /* ========== EMPLOYEE API ========== */
//       if (reportType === "EMPLOYEE") {
//         res = await api.post("/reward-points/redemption", {
//           employee_id: employeeId,
//           from_date: fromDate,
//           to_date: toDate,
//         });

//         const formatted = res.data?.data?.map((row, index) => ({
//           id: row._id,
//           slNo: index + 1,
//           redemptionType: row.redemption_type,
//           usedPoints: row.points_used,
//           amount: row.amount,
//           description: row.description || "-",
//         }));

//         setTableData(formatted || []);
//       }

//       /* ========== CUSTOMER API ========== */
//       if (reportType === "CUSTOMER") {
//         res = await api.post("/customer-rewards/redemption", {
//           customer_id: customerId,
//           from_date: fromDate,
//           to_date: toDate,
//         });

//         const formatted = res.data?.data?.map((row, index) => ({
//           id: row._id,
//           slNo: index + 1,
//           redemptionType: row.redemption_type,
//           redeemedPoints: row.redeemed_points,
//           redeemedAmount: row.redeemed_amount,
//           totalEarnedPoints: row.total_earned_points,
//           totalEarnedAmount: row.total_earned_amount,
//           balancePoints: row.balance_points_after,
//           balanceAmount: row.balance_value_after,
//           status: row.status,
//         }));

//         setTableData(formatted || []);
//       }
//     } catch (err) {
//       console.error("Search error:", err.response?.data || err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ================= TABLE COLUMNS ================= */

//   const employeeColumns = [
//     { key: "slNo", header: "Sl No" },
//     { key: "redemptionType", header: "Redemption Type" },
//     { key: "usedPoints", header: "Redeemed  Points" },
//     { key: "amount", header: "Redeemed Amount" },
//     { key: "description", header: "Description" },
//   ];

//   const customerColumns = [
//     { key: "slNo", header: "Sl No" },
//     { key: "redemptionType", header: "Redemption Type" },
//     { key: "redeemedPoints", header: "Redeemed Points" },
//     { key: "redeemedAmount", header: "Redeemed Amount" },
//     //{ key: "totalEarnedPoints", header: "Total Earned Points" },
//     //{ key: "totalEarnedAmount", header: "Total Earned Amount" },
//     //{ key: "balancePoints", header: "Balance Points" },
//    // { key: "balanceAmount", header: "Balance Amount" },
//    // { key: "status", header: "Status" },
//   ];

//   return (
//     <div>
//       <Navbar />

//       <div className="flex mt-20">
//         <div className="flex-grow p-7">
//           <h1 className="text-2xl font-semibold mb-6">
//             Redemption Points Report
//           </h1>

//           {/* ================= FILTER SECTION ================= */}
//           <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">

//             {/* Report Type */}
//             <select
//               className="border p-2 rounded"
//               value={reportType}
//               onChange={(e) => {
//                 setReportType(e.target.value);
//                 setTableData([]);
//               }}
//             >
//               <option value="EMPLOYEE">Employee Redemption</option>
//               <option value="CUSTOMER">Customer Redemption</option>
//             </select>

//             {/* Employee */}
//             {reportType === "EMPLOYEE" && (
//               <select
//                 className="border p-2 rounded"
//                 value={employeeId}
//                 onChange={(e) => setEmployeeId(e.target.value)}
//               >
//                 <option value="">Select Employee</option>
//                 {employees.map((emp) => (
//                   <option key={emp._id} value={emp._id}>
//                     {emp.name}
//                   </option>
//                 ))}
//               </select>
//             )}

//             {/* Customer */}
//             {reportType === "CUSTOMER" && (
//               <select
//                 className="border p-2 rounded"
//                 value={customerId}
//                 onChange={(e) => setCustomerId(e.target.value)}
//               >
//                 <option value="">Select Customer</option>
//                 {customers.map((cust) => (
//                   <option key={cust._id} value={cust._id}>
//                     {cust.full_name}
//                   </option>
//                 ))}
//               </select>
//             )}

//             {/* From Date */}
//             <input
//               type="date"
//               className="border p-2 rounded"
//               value={fromDate}
//               onChange={(e) => setFromDate(e.target.value)}
//             />

//             {/* To Date */}
//             <input
//               type="date"
//               className="border p-2 rounded"
//               value={toDate}
//               onChange={(e) => setToDate(e.target.value)}
//             />

//             {/* Search */}
//             <button
//               onClick={handleSearch}
//               className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//             >
//               {loading ? "Loading..." : "Search"}
//             </button>
//           </div>

//           {/* ================= TABLE ================= */}
//           <DataTable
//             data={tableData}
//             columns={
//               reportType === "EMPLOYEE" ? employeeColumns : customerColumns
//             }
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

const RedemptionPointsReport = () => {
  const [reportType, setReportType] = useState("EMPLOYEE"); // EMPLOYEE | CUSTOMER
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);

  const [summary, setSummary] = useState({
    totalRecords: 0,
    totalPoints: 0,
    totalAmount: 0,
  });

  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState("");

  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState("");

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await api.get("/agent/get-employee");
        setEmployees(res.data?.employee || []);
      } catch (err) {
        console.error("Employee fetch error", err);
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await api.get("/user/get-user");
        setCustomers(res.data || []);
      } catch (err) {
        console.error("Customer fetch error", err);
      }
    };
    fetchCustomers();
  }, []);

  const handleSearch = async () => {
    if (!fromDate || !toDate) {
      alert("Please select From Date and To Date");
      return;
    }

    if (reportType === "EMPLOYEE" && !employeeId) {
      alert("Please select Employee");
      return;
    }

    if (reportType === "CUSTOMER" && !customerId) {
      alert("Please select Customer");
      return;
    }

    try {
      setLoading(true);
      setTableData([]);
      setSummary({ totalRecords: 0, totalPoints: 0, totalAmount: 0 });

      let res;

      if (reportType === "EMPLOYEE") {
        res = await api.post("/reward-points/redemption", {
          employee_id: employeeId,
          from_date: fromDate,
          to_date: toDate,
        });

        const formatted =
          res.data?.data?.map((row, index) => ({
            id: row._id,
            slNo: index + 1,
            redemptionType: row.redemption_type,
            usedPoints: row.points_used,
            amount: row.amount,
            description: row.description || "-",
          })) || [];

        setTableData(formatted);

        setSummary({
          totalRecords: formatted.length,
          totalPoints: formatted.reduce(
            (sum, r) => sum + (r.usedPoints || 0),
            0,
          ),
          totalAmount: formatted.reduce((sum, r) => sum + (r.amount || 0), 0),
        });
      }

      if (reportType === "CUSTOMER") {
        res = await api.post("/customer-rewards/redemption", {
          customer_id: customerId,
          from_date: fromDate,
          to_date: toDate,
        });

        const formatted =
          res.data?.data?.map((row, index) => ({
            id: row._id,
            slNo: index + 1,
            redemptionType: row.redemption_type || "-",
            redeemedPoints: row.redeemed_points || "-",
            redeemedAmount: row.redeemed_amount,
            remarks: row.remarks,
          })) || [];

        setTableData(formatted);

        setSummary({
          totalRecords: formatted.length,
          totalPoints: formatted.reduce(
            (sum, r) => sum + (r.redeemedPoints || 0),
            0,
          ),
          totalAmount: formatted.reduce(
            (sum, r) => sum + (r.redeemedAmount || 0),
            0,
          ),
        });
      }
    } catch (err) {
      console.error("Search error:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  const employeeColumns = [
    { key: "slNo", header: "Sl No" },
    { key: "redemptionType", header: "Redemption Type" },
    { key: "usedPoints", header: "Redeemed Points" },
    { key: "amount", header: "Redeemed Amount" },
    { key: "description", header: "Description" },
  ];

  const customerColumns = [
    { key: "slNo", header: "Sl No" },
    { key: "redemptionType", header: "Redemption Type" },
    { key: "redeemedPoints", header: "Redeemed Points" },
    { key: "redeemedAmount", header: "Redeemed Amount" },
    { key: "remarks", header: "Remarks" },
  ];

  return (
    <div>
      <Navbar />

      <div className="flex mt-20">
        <div className="flex-grow p-7">
          <h1 className="text-2xl font-semibold mb-6">
            Redemption Points Report
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
            <select
              className="border p-2 rounded"
              value={reportType}
              onChange={(e) => {
                setReportType(e.target.value);
                setTableData([]);
                setSummary({ totalRecords: 0, totalPoints: 0, totalAmount: 0 });
              }}
            >
              <option value="EMPLOYEE">Employee </option>
              <option value="CUSTOMER">Customer </option>
            </select>

            {reportType === "EMPLOYEE" && (
              // <select
              //   className="border p-2 rounded"
              //   value={employeeId}
              //   onChange={(e) => setEmployeeId(e.target.value)}
              // >
              //   <option value="">Select Employee</option>
              //   {employees.map((emp) => (
              //     <option key={emp._id} value={emp._id}>
              //       {emp.name}
              //     </option>
              //   ))}
              // </select>
              <Select
                className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-64"
                popupMatchSelectWidth={false}
                showSearch
                placeholder="Select Employee"
                value={employeeId || undefined}
                onChange={(value) => setEmployeeId(value)}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children
                    .toString()
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {employees.map((emp) => (
                  <Select.Option key={emp._id} value={emp._id}>
                    {emp.name} - {emp.phone_number}
                  </Select.Option>
                ))}
              </Select>
            )}

            {reportType === "CUSTOMER" && (
              // <select
              //   className="border p-2 rounded"
              //   value={customerId}
              //   onChange={(e) => setCustomerId(e.target.value)}
              // >
              //   <option value="">Select Customer</option>
              //   {customers.map((cust) => (
              //     <option key={cust._id} value={cust._id}>
              //       {cust.full_name}
              //     </option>
              //   ))}
              // </select>
              <Select
                className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-64 "
                popupMatchSelectWidth={false}
                showSearch
                placeholder="Select Customer"
                value={customerId || undefined}
                onChange={(value) => setCustomerId(value)}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children
                    .toString()
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {customers.map((cust) => (
                  <Select.Option key={cust._id} value={cust._id}>
                    {cust.full_name} - {cust.phone_number}
                  </Select.Option>
                ))}
              </Select>
            )}

            <input
              type="date"
              className="border p-2 rounded ml-16"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />

            <input
              type="date"
              className="border p-2 rounded "
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />

            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {loading ? "Loading..." : "Search"}
            </button>
          </div>

          {tableData.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white shadow rounded p-4 border-l-4 border-blue-600">
                <p className="text-sm text-gray-500">Total Records</p>
                <p className="text-2xl font-bold">{summary.totalRecords}</p>
              </div>

              <div className="bg-white shadow rounded p-4 border-l-4 border-green-600">
                <p className="text-sm text-gray-500">Total Redeemed Points</p>
                <p className="text-2xl font-bold">{summary.totalPoints}</p>
              </div>

              <div className="bg-white shadow rounded p-4 border-l-4 border-purple-600">
                <p className="text-sm text-gray-500">Total Redeemed Amount</p>
                <p className="text-2xl font-bold">₹ {summary.totalAmount}</p>
              </div>
            </div>
          )}

          <DataTable
            data={tableData}
            columns={
              reportType === "EMPLOYEE" ? employeeColumns : customerColumns
            }
          />
        </div>
      </div>
    </div>
  );
};

export default RedemptionPointsReport;
