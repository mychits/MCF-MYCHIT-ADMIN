import { useEffect, useState } from "react";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import Navbar from "../components/layouts/Navbar";
import { Select, DatePicker, Spin } from "antd";
const { MonthPicker } = DatePicker;
const { Option } = Select;
import { PiMoneyDuotone } from "react-icons/pi";

// const EmployeeDeductionReport = () => {
//   const [allEmployeeSalary, setAllEmployeeSalary] = useState([]);
//   const [allEmployees, setAllEmployees] = useState([]);
//   const [allSalaryTable, setAllSalaryTable] = useState([]);
//   const [summary, setSummary] = useState({
//     totalEsi: 0,
//     totalEpf: 0,
//     totalIt: 0,
//     totalpt: 0,
//     totalAdditionalDeductions: 0,
//     addPaymentsListSummary: "",
//     dedPaymentsListSummary: "",
//     totalRemainingBalance: 0,
//   });

//   const [isLoading, setIsLoading] = useState(false);
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [selectedMonthYear, setSelectedMonthYear] = useState(null);

//   // Fetch all employees
//   useEffect(() => {
//     const fetchEmployee = async () => {
//       try {
//         const response = await api.get("/agent/get-employee");
//         setAllEmployees(response?.data?.employee || []);
//       } catch (error) {
//         console.error("unable to fetch employee");
//       }
//     };
//     fetchEmployee();
//   }, []);

//   // Format salary rows
//   const formatSalaryData = (salaryList) => {
//     return salaryList.map((s, index) => {
//       const addTotal = Array.isArray(s?.additional_payments)
//         ? s.additional_payments.reduce((acc, cur) => acc + (cur.value || 0), 0)
//         : 0;

//       const dedTotal = Array.isArray(s?.additional_deductions)
//         ? s.additional_deductions.reduce(
//             (acc, cur) => acc + (cur.value || 0),
//             0
//           )
//         : 0;

//       const addListStr = Array.isArray(s?.additional_payments)
//         ? s.additional_payments
//             .map((ele) => `${ele.name}:${ele.value}`)
//             .join(" | ")
//         : "N/A";

//       const dedListStr = Array.isArray(s?.additional_deductions)
//         ? s.additional_deductions
//             .map((ele) => `${ele.name}:${ele.value}`)
//             .join(" | ")
//         : "N/A";

//       return {
//         _id: s?._id,
//         slNo: index + 1,
//         employeeCode: s?.employee_id?.employeeCode || "N/A",
//         employeeName: s?.employee_id?.name || "N/A",
//         employeePhone: s?.employee_id?.phone_number || "N/A",
//         employeeSalary: s?.employee_id?.salary || "N/A",
//         salaryMonth: s?.salary_month || "N/A",
//         salaryYear: s?.salary_year || "N/A",
//         totalSalaryPayable: s?.total_salary_payable || 0,
//         netPayable: s?.net_payable || 0,
//         paidAmount: s?.paid_amount || 0,
//         remainingBalance: s?.remaining_balance || 0,
//         paidDays: s?.paid_days || 0,
//         paidDate: s?.pay_date?.split("T")[0] || "N/A",
//         addPaymentsList: addListStr,
//         dedPaymentsList: dedListStr,
//         addPayments: addTotal,
//         dedPayments: dedTotal,
//         earningBasic: s?.earnings?.basic || 0,
//         earningHra: s?.earnings?.hra || 0,
//         earningTravelAllowance: s?.earnings?.travel_allowance || 0,
//         earningMedicalAllowance: s?.earnings?.medical_allowance || 0,
//         earningBenifits: s?.earnings?.basket_of_benifits || 0,
//         earningPerformanceBonus: s?.earnings?.performance_bonus || 0,
//         earningOthers: s?.earnings?.other_allowances || 0,
//         earningConveyance: s?.earnings?.conveyance || 0,
//         deductIT: s?.deductions?.income_tax || 0,
//         deductESI: s?.deductions?.esi || 0,
//         deductEPF: s?.deductions?.epf || 0,
//         deductPT: s?.deductions?.professional_tax || 0,
//         deductSalaryAdvance: s?.deductions?.salary_advance || 0,
//         salaryPaymentMethod: s?.payment_method || "N/A",
//         status: s?.status || "N/A",
//       };
//     });
//   };

//   // Sort salary data by month and year
//   const sortSalaryData = (data) => {
//     const monthOrder = [
//       "January",
//       "February",
//       "March",
//       "April",
//       "May",
//       "June",
//       "July",
//       "August",
//       "September",
//       "October",
//       "November",
//       "December",
//     ];

//     // Sort by year + month order
//     return data.sort((a, b) => {
//       const yearA = Number(a.salaryYear);
//       const yearB = Number(b.salaryYear);

//       if (yearA !== yearB) return yearA - yearB;

//       return (
//         monthOrder.indexOf(a.salaryMonth) - monthOrder.indexOf(b.salaryMonth)
//       );
//     });
//   };

//   // SUMMARY CALCULATION (Based on current filtered / full data)
//   const calculateSummary = (rows) => {
//     const summaryData = {
//       totalEsi: 0,
//       totalEpf: 0,
//       totalIt: 0,
//       totalpt: 0,
//       totalAdditionalDeductions: 0,
//       totalRemainingBalance: 0,
//       addPaymentsListSummary: "",
//       dedPaymentsListSummary: "",
//     };

//     const addListArr = [];
//     const dedListArr = [];

//     rows.forEach((r) => {
//       summaryData.totalEsi += Number(r.deductESI) || 0;
//       summaryData.totalEpf += Number(r.deductEPF) || 0;
//       summaryData.totalIt += Number(r.deductIT) || 0;
//       summaryData.totalpt += Number(r.deductPT) || 0;
//       //   summaryData.totalAdditionalDeductions += Number(r.dedPayments) || 0;
//       //   summaryData.totalRemainingBalance += Number(r.remainingBalance);

//       //   if (r.addPaymentsList && r.addPaymentsList !== "N/A")
//       //     addListArr.push(r.addPaymentsList);
//       //   if (r.dedPaymentsList && r.dedPaymentsList !== "N/A")
//       //     dedListArr.push(r.dedPaymentsList);
//     });

//     // summaryData.addPaymentsListSummary = addListArr.join(" | ");
//     // summaryData.dedPaymentsListSummary = dedListArr.join(" | ");

//     setSummary(summaryData);
//   };

//   // FETCH ALL SALARIES
//   useEffect(() => {
//     const fetchEmployeeAllSalaries = async () => {
//       try {
//         setIsLoading(true);
//         const response = await api.get("/salary-payment/all");
//         const formatted = formatSalaryData(response?.data?.data || []);
//         // Apply sorting before setting the data
//         const sortedData = sortSalaryData(formatted);
//         setAllSalaryTable(sortedData);
//         calculateSummary(sortedData);
//       } catch (error) {
//         console.error("unable to fetch Employee Salary Payment");
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchEmployeeAllSalaries();
//   }, []);

//   // FETCH FILTERED DATA
//   useEffect(() => {
//     const fetchAllEmployeeData = async () => {
//       try {
//         setIsLoading(true);
//         let query = [];
//         if (selectedEmployee) query.push(`employee_id=${selectedEmployee}`);
//         if (selectedMonthYear) {
//           query.push(`month=${selectedMonthYear.month}`);
//           query.push(`year=${selectedMonthYear.year}`);
//         }

//         const url = `/salary-payment/report?${query.join("&")}`;
//         const res = await api.get(url);

//         const formatted = formatSalaryData(res?.data?.data || []);
//         // Apply sorting before setting the data
//         const sortedData = sortSalaryData(formatted);
//         setAllSalaryTable(sortedData);
//         calculateSummary(sortedData);
//       } catch (err) {
//         console.log("unable to fetch filtered employee data");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchAllEmployeeData();
//   }, [selectedEmployee, selectedMonthYear]);

//   // HANDLE MONTH PICKER
//   const handleMonthPick = (value) => {
//     if (!value) return setSelectedMonthYear(null);
//     const monthIndex = value.month();
//     const year = value.year();

//     const monthNames = [
//       "January",
//       "February",
//       "March",
//       "April",
//       "May",
//       "June",
//       "July",
//       "August",
//       "September",
//       "October",
//       "November",
//       "December",
//     ];

//     setSelectedMonthYear({
//       month: monthNames[monthIndex],
//       year,
//     });
//   };

//   const handleReset = () => {
//     setSelectedEmployee(null);
//     setSelectedMonthYear(null);
//   };

//   const columns = [
//     { key: "slNo", header: "SL. NO" },
//     { key: "employeeName", header: "Employee Name" },
//     { key: "employeeCode", header: "Employee ID" },
//     { key: "employeePhone", header: "Phone" },
//     { key: "paidDate", header: "Pay Date" },
//     { key: "salaryMonth", header: "Month" },
//     { key: "salaryYear", header: "Year" },
//     { key: "deductIT", header: "Income Tax" },
//     { key: "deductESI", header: "ESI" },
//     { key: "deductEPF", header: "EPF" },
//     { key: "deductPT", header: "Professional Tax" },
//     // { key: "employeeSalary", header: "Salary" },

//     //  { key: "netPayable", header: "Net Payable" },
//     //  { key: "paidAmount", header: "Paid Amount" },
//   ];

//   const allColumns = [
//     { key: "slNo", header: "Sl No" },
//     { key: "employeeCode", header: "Employee ID" },
//     { key: "employeeName", header: "Name" },
//     { key: "employeePhone", header: "Phone Number" },
//     { key: "employeeSalary", header: "Salary" },
//     { key: "salaryMonth", header: "Month" },
//     { key: "salaryYear", header: "Year" },
//     { key: "totalSalaryPayable", header: "Total Salary Payable" },
//     { key: "netPayable", header: "Net Payable" },
//     { key: "paidAmount", header: "Paid Amount" },
//     { key: "remainingBalance", header: "Remaining Balance" },
//     { key: "paidDays", header: "Paid Days" },
//     { key: "paidDate", header: "Paid Date" },
//     { key: "addPayments", header: "Additional Payments" },
//     { key: "dedPayments", header: "Deduction Payments" },
//     { key: "earningBasic", header: "Basic" },
//     { key: "earningHra", header: "HRA" },
//     { key: "earningTravelAllowance", header: "Travel Allowance" },
//     { key: "earningMedicalAllowance", header: "Medical Allowance" },
//     { key: "earningBenifits", header: "Performance Benifits" },
//     { key: "earningOthers", header: "Other Allowance" },
//     { key: "earningConveyance", header: "Conveyance" },
//     { key: "deductIT", header: "Income Tax" },
//     { key: "deductESI", header: "ESI" },
//     { key: "deductEPF", header: "EPF" },
//     { key: "deductPT", header: "Professional Tax" },
//     { key: "deductSalaryAdvance", header: "SalaryAdvance" },
//     { key: "salaryPaymentMethod", header: "Payment Type" },
//     { key: "status", header: "Status" },
//   ];

//   const printHeaderKeys = [
//     "Employee",
//     "Month",
//     "Year",
//     "Total ESI",
//     "Total PF",
//     "Total IT",
//     "Total PT",
//   ];

//   const printHeaderValues = [
//     selectedEmployee
//       ? allEmployees.find((e) => e._id === selectedEmployee)?.name || "—"
//       : "All Employees",

//     selectedMonthYear?.month || "—",
//     selectedMonthYear?.year || "—",

//     `₹${summary.totalEsi.toLocaleString("en-IN")}`,
//     `₹${summary.totalEpf.toLocaleString("en-IN")}`,
//     summary.totalIt,
//     `₹${summary.totalpt.toLocaleString("en-IN")}`,
//     `₹${summary.totalAdditionalDeductions.toLocaleString("en-IN")}`,
//     `₹${summary.totalRemainingBalance.toLocaleString("en-IN")}`,
//   ];

//   return (
//     <div className="w-screen">
//       <Navbar />
//       <div className="flex-grow p-7">
//         <h1 className="font-bold text-2xl mb-4">Reports - Salary Report</h1>

//         {/* FILTERS */}
//         <div className="flex gap-4 mb-6 items-center">
//           <Select
//             allowClear
//             style={{ width: 300 }}
//             value={selectedEmployee}
//             placeholder="Select Employee"
//             onChange={(value) => setSelectedEmployee(value)}
//           >
//             {allEmployees.map((emp) => (
//               <Option key={emp._id} value={emp._id}>
//                 {emp.name} | {emp.phone_number}
//               </Option>
//             ))}
//           </Select>

//           <MonthPicker
//             style={{ width: 250 }}
//             placeholder="Select Month"
//             onChange={handleMonthPick}
//           />

//           <button
//             onClick={handleReset}
//             className="px-4 py-2 bg-blue-500 text-white rounded"
//           >
//             Reset
//           </button>
//         </div>

//         {/* SUMMARY BOX */}
//         <div className="grid grid-cols-2 gap-4 bg-gray-100 p-4 mb-5 rounded">
//           <div>
//             <b>Total ESI :</b> ₹{summary.totalEsi}
//           </div>
//           <div>
//             <b>Total PF :</b> ₹{summary.totalEpf}
//           </div>
//           <div>
//             <b>Total Income Tax :</b> {summary.totalIt}
//           </div>
//           <div>
//             <b>Total Professional Tax :</b> ₹{summary.totalpt}
//           </div>
//         </div>

//         {isLoading ? (
//           <div className="flex justify-center py-10">
//             <Spin size="large" />
//           </div>
//         ) : (
//           <DataTable
//             columns={columns}
//             data={allSalaryTable}
//             exportCols={columns}
//             isExportEnabled={true}
//             exportedPdfName="Employee Salary Report"
//             printHeaderKeys={printHeaderKeys}
//             printHeaderValues={printHeaderValues}
//             exportedFileName="EmployeeSalaryReport.csv"
//           />
//         )}
//       </div>
//     </div>
//   );
// };




const EmployeeDeductionReport = () => {
  const [allEmployeeSalary, setAllEmployeeSalary] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [allSalaryTable, setAllSalaryTable] = useState([]);
  const [summary, setSummary] = useState({
    totalEsi: 0,
    totalEpf: 0,
    totalIt: 0,
    totalpt: 0,
    totalAdditionalDeductions: 0,
    addPaymentsListSummary: "",
    dedPaymentsListSummary: "",
    totalRemainingBalance: 0,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedMonthYear, setSelectedMonthYear] = useState(null);

  // Fetch all employees
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await api.get("/agent/get-employee");
        setAllEmployees(response?.data?.employee || []);
      } catch (error) {
        console.error("unable to fetch employee");
      }
    };
    fetchEmployee();
  }, []);

  // Format salary rows
  const formatSalaryData = (salaryList) => {
    return salaryList.map((s, index) => {
      const addTotal = Array.isArray(s?.additional_payments)
        ? s.additional_payments.reduce((acc, cur) => acc + (cur.value || 0), 0)
        : 0;

      const dedTotal = Array.isArray(s?.additional_deductions)
        ? s.additional_deductions.reduce(
            (acc, cur) => acc + (cur.value || 0),
            0
          )
        : 0;

      const addListStr = Array.isArray(s?.additional_payments)
        ? s.additional_payments
            .map((ele) => `${ele.name}:${ele.value}`)
            .join(" | ")
        : "N/A";

      const dedListStr = Array.isArray(s?.additional_deductions)
        ? s.additional_deductions
            .map((ele) => `${ele.name}:${ele.value}`)
            .join(" | ")
        : "N/A";

      return {
        _id: s?._id,
        slNo: index + 1,
        employeeCode: s?.employee_id?.employeeCode || "N/A",
        employeeName: s?.employee_id?.name || "N/A",
        employeePhone: s?.employee_id?.phone_number || "N/A",
        employeeSalary: s?.employee_id?.salary || "N/A",
        salaryMonth: s?.salary_month || "N/A",
        salaryYear: s?.salary_year || "N/A",
        totalSalaryPayable: s?.total_salary_payable || 0,
        netPayable: s?.net_payable || 0,
        paidAmount: s?.paid_amount || 0,
        remainingBalance: s?.remaining_balance || 0,
        paidDays: s?.paid_days || 0,
        paidDate: s?.pay_date?.split("T")[0] || "N/A",
        addPaymentsList: addListStr,
        dedPaymentsList: dedListStr,
        addPayments: addTotal,
        dedPayments: dedTotal,
        earningBasic: s?.earnings?.basic || 0,
        earningHra: s?.earnings?.hra || 0,
        earningTravelAllowance: s?.earnings?.travel_allowance || 0,
        earningMedicalAllowance: s?.earnings?.medical_allowance || 0,
        earningBenifits: s?.earnings?.basket_of_benifits || 0,
        earningPerformanceBonus: s?.earnings?.performance_bonus || 0,
        earningOthers: s?.earnings?.other_allowances || 0,
        earningConveyance: s?.earnings?.conveyance || 0,
        deductIT: s?.deductions?.income_tax || 0,
        deductESI: s?.deductions?.esi || 0,
        deductEPF: s?.deductions?.epf || 0,
        deductPT: s?.deductions?.professional_tax || 0,
        deductSalaryAdvance: s?.deductions?.salary_advance || 0,
        salaryPaymentMethod: s?.payment_method || "N/A",
        status: s?.status || "N/A",
      };
    });
  };

  // Sort salary data by month and year
  const sortSalaryData = (data) => {
    const monthOrder = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];

    return data.sort((a, b) => {
      const yearA = Number(a.salaryYear);
      const yearB = Number(b.salaryYear);
      if (yearA !== yearB) return yearA - yearB;
      return monthOrder.indexOf(a.salaryMonth) - monthOrder.indexOf(b.salaryMonth);
    });
  };

  // SUMMARY CALCULATION
  const calculateSummary = (rows) => {
    const summaryData = {
      totalEsi: 0,
      totalEpf: 0,
      totalIt: 0,
      totalpt: 0,
      totalAdditionalDeductions: 0,
      totalRemainingBalance: 0,
      addPaymentsListSummary: "",
      dedPaymentsListSummary: "",
    };

    rows.forEach((r) => {
      summaryData.totalEsi += Number(r.deductESI) || 0;
      summaryData.totalEpf += Number(r.deductEPF) || 0;
      summaryData.totalIt += Number(r.deductIT) || 0;
      summaryData.totalpt += Number(r.deductPT) || 0;
    });

    setSummary(summaryData);
  };

  // FETCH ALL SALARIES
  useEffect(() => {
    const fetchEmployeeAllSalaries = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/salary-payment/all");
        const formatted = formatSalaryData(response?.data?.data || []);
        const sortedData = sortSalaryData(formatted);
        setAllSalaryTable(sortedData);
        calculateSummary(sortedData);
      } catch (error) {
        console.error("unable to fetch Employee Salary Payment");
      } finally {
        setIsLoading(false);
      }
    };
    fetchEmployeeAllSalaries();
  }, []);

  // FETCH FILTERED DATA
  useEffect(() => {
    const fetchAllEmployeeData = async () => {
      try {
        setIsLoading(true);
        let query = [];
        if (selectedEmployee) query.push(`employee_id=${selectedEmployee}`);
        if (selectedMonthYear) {
          query.push(`month=${selectedMonthYear.month}`);
          query.push(`year=${selectedMonthYear.year}`);
        }

        const url = `/salary-payment/report?${query.join("&")}`;
        const res = await api.get(url);

        const formatted = formatSalaryData(res?.data?.data || []);
        const sortedData = sortSalaryData(formatted);
        setAllSalaryTable(sortedData);
        calculateSummary(sortedData);
      } catch (err) {
        console.log("unable to fetch filtered employee data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllEmployeeData();
  }, [selectedEmployee, selectedMonthYear]);

  // HANDLE MONTH PICKER
  const handleMonthPick = (value) => {
    if (!value) return setSelectedMonthYear(null);
    const monthIndex = value.month();
    const year = value.year();

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];

    setSelectedMonthYear({
      month: monthNames[monthIndex],
      year,
    });
  };

  const handleReset = () => {
    setSelectedEmployee(null);
    setSelectedMonthYear(null);
  };

  const columns = [
    { key: "slNo", header: "SL. NO" },
    { key: "employeeName", header: "Employee Name" },
    { key: "employeeCode", header: "Employee ID" },
    { key: "employeePhone", header: "Phone" },
    { key: "paidDate", header: "Pay Date" },
    { key: "salaryMonth", header: "Month" },
    { key: "salaryYear", header: "Year" },
    { key: "deductIT", header: "Income Tax" },
    { key: "deductESI", header: "ESI" },
    { key: "deductEPF", header: "EPF" },
    { key: "deductPT", header: "Professional Tax" },
  ];

  const allColumns = [
    // ... your allColumns definition
  ];

  const printHeaderKeys = [
    "Employee", "Month", "Year", "Total ESI", "Total PF", "Total IT", "Total PT",
  ];

  const printHeaderValues = [
    selectedEmployee ? allEmployees.find((e) => e._id === selectedEmployee)?.name || "—" : "All Employees",
    selectedMonthYear?.month || "—",
    selectedMonthYear?.year || "—",
    `₹${summary.totalEsi.toLocaleString("en-IN")}`,
    `₹${summary.totalEpf.toLocaleString("en-IN")}`,
    `₹${summary.totalIt.toLocaleString("en-IN")}`,
    `₹${summary.totalpt.toLocaleString("en-IN")}`,
  ];

  // --- CORRECTED: Professional Summary Card Component ---
  // It now handles its own icon rendering.
  const DeductionSummaryCard = ({ title, value, iconType, color }) => {
    const getIcon = () => {
      const iconStyle = { width: "24px", height: "24px", color };
      switch (iconType) {
        case "pf":
          return (
            <svg style={iconStyle} fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"></path></svg>
          );
        case "esi":
          return (
            <svg style={iconStyle} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path></svg>
          );
        case "it":
          return (
            <svg style={iconStyle} fill="currentColor" viewBox="0 0 20 20"><path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"></path><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"></path></svg>
          );
        case "pt":
          return (
            <svg style={iconStyle} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm0 4a1 1 0 000 2h6a1 1 0 100-2H7zm0 4a1 1 0 000 2h2a1 1 0 100-2H7z" clipRule="evenodd"></path></svg>
          );
        default:
          return null;
      }
    };

    const isCurrency = !title.toLowerCase().includes("tax");
    return (
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 p-6 border-l-4" style={{ borderLeftColor: color }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">
              {isCurrency ? `₹${value.toLocaleString("en-IN")}` : value.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="p-3 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
            {getIcon()}
          </div>
        </div>
      </div>
    );
  };


  return (
    <div className="w-screen">
      <Navbar />
      <div className="flex-grow p-7">
        <h1 className="font-bold text-2xl mb-4">Reports - Salary Deductions</h1>

        {/* FILTERS */}
        <div className="flex gap-4 mb-6 items-center">
          <Select
            allowClear
            style={{ width: 300 }}
            value={selectedEmployee}
            placeholder="Select Employee"
            onChange={(value) => setSelectedEmployee(value)}
          >
            {allEmployees.map((emp) => (
              <Option key={emp._id} value={emp._id}>
                {emp.name} | {emp.phone_number}
              </Option>
            ))}
          </Select>

          <MonthPicker
            style={{ width: 250 }}
            placeholder="Select Month"
            onChange={handleMonthPick}
          />

          <button
            onClick={handleReset}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Reset
          </button>
        </div>

        {/* --- UPDATED: SUMMARY CARDS SECTION --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <DeductionSummaryCard
            title="Total PF"
            value={summary.totalEpf}
            iconType="pf" // Pass the icon type
            color="#3b82f6" // Blue
          />
          <DeductionSummaryCard
            title="Total ESI"
            value={summary.totalEsi}
            iconType="esi" // Pass the icon type
            color="#10b981" // Green
          />
          <DeductionSummaryCard
            title="Total Income Tax"
            value={summary.totalIt}
            iconType="it" // Pass the icon type
            color="#f59e0b" // Amber
          />
          <DeductionSummaryCard
            title="Total Professional Tax"
            value={summary.totalpt}
            iconType="pt" // Pass the icon type
            color="#5d23aaff" // Red
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Spin size="large" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={allSalaryTable}
            exportCols={columns}
            isExportEnabled={true}
            exportedPdfName="Employee Salary Report"
            printHeaderKeys={printHeaderKeys}
            printHeaderValues={printHeaderValues}
            exportedFileName="EmployeeSalaryReport.csv"
          />
        )}
      </div>
    </div>
  );
};





export default EmployeeDeductionReport;
