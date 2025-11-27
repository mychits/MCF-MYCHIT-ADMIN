/* eslint-disable no-unused-vars */
import { useEffect, useState, useMemo } from "react";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import CircularLoader from "../components/loaders/CircularLoader";
import { Select } from "antd";
import Navbar from "../components/layouts/Navbar";
import filterOption from "../helpers/filterOption";



// const PaymentSummary = () => {
//   const [searchText, setSearchText] = useState("");
//   const [usersData, setUsersData] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [payloads, setPayloads] = useState({
//     pay_date: "",
//     payment_type: "",
//   });
//   const [selectedLabel, setSelectedLabel] = useState("");
//   const [showFilterField, setShowFilterField] = useState(false);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setIsLoading(true);
//         const params = {};
//         if (payloads.pay_date) params.pay_date = payloads.pay_date;
//         if (payloads.payment_type) params.payment_type = payloads.payment_type;

//         const response = await api.get("/user/get-daily-payments", {
//           params,
//         });
//         const rawData = response.data;

//         let count = 0;
//         const processed = [];

//         rawData.forEach((usr) => {
//           if (usr?.data) {
//             usr.data.forEach((item) => {
//               const enroll = item.enrollment;
//               const pay = item.payments;
//               const auction = item.auction;
//               const firstAuction = item.firstAuction;

//               if (enroll?.group) {
//                 count++;

//                 const latestAmount = pay?.latestPaymentAmount || 0;
//                 const totalPaid = pay?.totalPaidAmount || 0;

//                 const totalPayable =
//                   enroll.group.group_type === "double"
//                     ? Number(enroll.group.group_install) * Number(auction?.auctionCount || 0) +
//                       Number(enroll.group.group_install)
//                     : Number(pay.totalPayable) +
//                       Number(enroll.group.group_install) +
//                       Number(firstAuction?.firstDividentHead || 0);

//                 const balance = totalPayable - totalPaid;

//                 let status = "Not Paid";
//                 if (latestAmount > 0 || balance <= 0) {
//                   status = "Paid";
//                 }

//                 processed.push({
//                   sl_no: count,
//                   _id: usr._id,
//                   userName: usr.userName,
//                   userPhone: usr.phone_number,
//                   customerId: usr.customer_id,
//                   groupName: enroll.group.group_name,
//                   groupValue: enroll.group.group_value,
//                   payment_type: enroll.payment_type,
//                   paymentsTicket: pay.ticket || 0,
//                   latestPaymentAmount: latestAmount,
//                   latestPaymentDate: pay.latestPaymentDate,
//                   latestCollectedBy: pay.latestCollectedBy || "N/A",
//                   amountPaid: totalPaid,
//                   amountToBePaid: totalPayable,
//                   balance: balance,
//                   status,
//                 });
//               }
//             });
//           }
//         });

//         setUsersData(processed);
//       } catch (error) {
//         console.error("Error fetching report:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchData();
//   }, [payloads]);

//   const handleSelectFilter = (value) => {
//     setSelectedLabel(value);
//     setShowFilterField(false);
//     const today = new Date();
//     const formatDate = (date) => date.toISOString().split("T")[0];

//     switch (value) {
//       case "Today":
//         setPayloads((prev) => ({ ...prev, pay_date: formatDate(today) }));
//         break;
//       case "Yesterday":
//         const yest = new Date(today);
//         yest.setDate(today.getDate() - 1);
//         setPayloads((prev) => ({ ...prev, pay_date: formatDate(yest) }));
//         break;
//       case "TwoDaysAgo":
//         const twoDays = new Date(today);
//         twoDays.setDate(today.getDate() - 2);
//         setPayloads((prev) => ({ ...prev, pay_date: formatDate(twoDays) }));
//         break;
//       case "Custom":
//         setShowFilterField(true);
//         break;
//       default:
//         setPayloads((prev) => ({ ...prev, pay_date: "" }));
//     }
//   };

//   const filteredData = useMemo(() => {
//     return usersData.filter((item) =>
//       filterOption([item], searchText).length > 0
//     );
//   }, [usersData, searchText]);

//   const handlePaymentTypeChange = (value) => {
//     setPayloads((prev) => ({ ...prev, payment_type: value }));
//   };

//   const columns = [
//     { key: "sl_no", header: "SL. NO" },
//     { key: "latestPaymentDate", header: "Payment Date" },
//     { key: "userName", header: "Customer Name" },
//     { key: "userPhone", header: "Phone Number" },
//     { key: "groupName", header: "Group Name" },
//     { key: "groupValue", header: "Group Value" },
//     { key: "payment_type", header: "Payment Type" },
//     { key: "paymentsTicket", header: "Ticket" },
//     { key: "latestPaymentAmount", header: "Latest Amount" },
//     { key: "amountToBePaid", header: "Amount To be Paid" },
//     { key: "amountPaid", header: "Amount Paid" },
//     { key: "balance", header: "Balance" },
//     {
//       key: "status",
//       header: "Status",
//       render: (row) => (
//         <span
//           className={`px-3 py-1 rounded-full text-white ${
//             row.status === "Paid" ? "bg-green-500" : "bg-red-500"
//           }`}
//         >
//           {row.status}
//         </span>
//       ),
//     },
//     { key: "latestCollectedBy", header: "Collected By" },
//   ];

//   return (
//     <div className="w-screen">
//       <div className="flex mt-30">
//         <Navbar
//           onGlobalSearchChangeHandler={(e) => setSearchText(e.target.value)}
//           visibility={true}
//         />
//         {isLoading ? (
//           <div className="w-full">
//             <CircularLoader color="text-green-600" />
//           </div>
//         ) : (
//           <div className="flex-grow p-7">
//             <h1 className="text-2xl font-bold text-center">
//               Reports - Payment Summary
//             </h1>
//             <div className="mt-6 mb-8">
//               <div className="flex flex-wrap items-center gap-4 mb-6">
//                 <div>
//                   <label>Filter Date</label>
//                   <Select
//                     showSearch
//                     popupMatchSelectWidth={false}
//                     onChange={handleSelectFilter}
//                     value={selectedLabel || undefined}
//                     placeholder="Select Date"
//                     className="w-full max-w-xs h-11"
//                   >
//                     {["Today", "Yesterday", "TwoDaysAgo", "Custom"].map((option) => (
//                       <Select.Option key={option} value={option}>
//                         {option}
//                       </Select.Option>
//                     ))}
//                   </Select>
//                 </div>
//                 {showFilterField && (
//                   <div>
//                     <label>Select Custom Date</label>
//                     <input
//                       type="date"
//                       value={payloads.pay_date}
//                       onChange={(e) =>
//                         setPayloads((prev) => ({
//                           ...prev,
//                           pay_date: e.target.value,
//                         }))
//                       }
//                       className="w-full max-w-xs h-11 rounded-md"
//                     />
//                   </div>
//                 )}
//                 <div className="text-md font-semibold text-blue-700">
//                   <label>Total Amount</label>
//                   <input
//                     readOnly
//                     className="w-full max-w-xs h-11 rounded-md"
//                     value={`₹ ${filteredData
//                       .reduce((sum, u) => sum + (u.latestPaymentAmount || 0), 0)
//                       .toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
//                   />
//                 </div>
//               </div>
//               <DataTable
//                 data={filteredData}
//                 columns={columns}
//                 exportedPdfName="Payment Summary Report"
//                 printHeaderKeys={["Total Amount Paid",]}
//                 printHeaderValues={[filteredData
//                       .reduce((sum, u) => sum + (u.latestPaymentAmount || 0), 0)
//                       .toLocaleString("en-IN", { minimumFractionDigits: 2 }),]}
//                 exportedFileName={`PaymentSummaryReport.csv`}
//               />
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// const PaymentSummary = () => {
//   const [searchText, setSearchText] = useState("");
//   const [usersData, setUsersData] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [payloads, setPayloads] = useState({
//     pay_date: "",
//     payment_type: "",
//   });
//   const [selectedLabel, setSelectedLabel] = useState("");
//   const [showFilterField, setShowFilterField] = useState(false);

//   const option = [{ key: "Today", value: "Today"},
//                     {key: "Yesterday", value: "Yesterday"},
//                     {key: "TwoDaysAgo", value: "Two Days Ago"},
//                     {key: "Custom", value: "Custom"},
//   ]

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setIsLoading(true);
//         const params = {};
//         if (payloads.pay_date) params.pay_date = payloads.pay_date;
//         if (payloads.payment_type) params.payment_type = payloads.payment_type;

//         const response = await api.get("/user/get-daily-payments", {
//           params,
//         });
//         const rawData = response.data;

//         let count = 0;
//         const processed = [];

//         rawData.forEach((usr) => {
//           if (usr?.data) {
//             usr.data.forEach((item) => {
//               const enroll = item.enrollment;
//               const pay = item.payments;
//               const auction = item.auction;
//               const firstAuction = item.firstAuction;

//               if (enroll?.group) {
//                 count++;

//                 // **UPDATED:** Use totalPaidOnFilteredDate for the daily sum
//                 const dailyPaymentTotal = pay?.totalPaidOnFilteredDate || 0;
//                 // latestPaymentAmount is the amount of the single 'latest' transaction
//                 const latestAmount = pay?.latestPaymentAmount || 0;
//                 const totalPaid = pay?.totalPaidAmount || 0;

//                 const totalPayable =
//                   enroll.group.group_type === "double"
//                     ? Number(enroll.group.group_install) *
//                         Number(auction?.auctionCount || 0) +
//                       Number(enroll.group.group_install)
//                     : Number(pay.totalPayable) +
//                       Number(enroll.group.group_install) +
//                       Number(firstAuction?.firstDividentHead || 0);

//                 const balance = totalPayable - totalPaid;

//                 let status = "Not Paid";
//                 // **LOGIC UPDATE:** Use dailyPaymentTotal instead of latestAmount for daily payment check
//                 if (dailyPaymentTotal > 0 || balance <= 0) {
//                   status = "Paid";
//                 }

//                 processed.push({
//                   sl_no: count,
//                   _id: usr._id,
//                   userName: usr.userName,
//                   userPhone: usr.phone_number,
//                   customerId: usr.customer_id,
//                   groupName: enroll.group.group_name,
//                   groupValue: enroll.group.group_value,
//                   payment_type: enroll.payment_type,
//                   paymentsTicket: pay.ticket || 0,

//                   // **NEW FIELD** for the sum of all payments on the filtered date
//                   dailyPaymentTotal: dailyPaymentTotal,

//                   // Keep latestPaymentAmount for the individual transaction amount
//                   latestPaymentAmount: latestAmount,

//                   latestPaymentDate: pay.latestPaymentDate,
//                   latestCollectedBy: pay.latestCollectedBy || "N/A",
//                   amountPaid: totalPaid,
//                   amountToBePaid: totalPayable,
//                   balance: balance,
//                   status,
//                 });
//               }
//             });
//           }
//         });

//         setUsersData(processed);
//       } catch (error) {
//         console.error("Error fetching report:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchData();
//   }, [payloads]);

//   const handleSelectFilter = (value) => {
//     setSelectedLabel(value);
//     setShowFilterField(false);
//     const today = new Date();
//     const formatDate = (date) => date.toISOString().split("T")[0];

//     switch (value) {
//       case "Today":
//         setPayloads((prev) => ({ ...prev, pay_date: formatDate(today) }));
//         break;
//       case "Yesterday":
//         const yest = new Date(today);
//         yest.setDate(today.getDate() - 1);
//         setPayloads((prev) => ({ ...prev, pay_date: formatDate(yest) }));
//         break;
//       case "TwoDaysAgo":
//         const twoDays = new Date(today);
//         twoDays.setDate(today.getDate() - 2);
//         setPayloads((prev) => ({ ...prev, pay_date: formatDate(twoDays) }));
//         break;
//       case "Custom":
//         setShowFilterField(true);
//         break;
//       default:
//         setPayloads((prev) => ({ ...prev, pay_date: "" }));
//     }
//   };

//   const filteredData = useMemo(() => {
//     return usersData.filter(
//       (item) => filterOption([item], searchText).length > 0
//     );
//   }, [usersData, searchText]);

//   const handlePaymentTypeChange = (value) => {
//     setPayloads((prev) => ({ ...prev, payment_type: value }));
//   };

//   const columns = [
//     { key: "sl_no", header: "SL. NO" },
//     { key: "latestPaymentDate", header: "Payment Date" },
//     { key: "userName", header: "Customer Name" },
//     { key: "userPhone", header: "Phone Number" },
//     { key: "groupName", header: "Group Name" },
//     { key: "groupValue", header: "Group Value" },
//     { key: "payment_type", header: "Payment Type" },
//     { key: "paymentsTicket", header: "Ticket" },

//     { key: "dailyPaymentTotal", header: "Daily Total Paid" },

//     { key: "latestPaymentAmount", header: "Latest Amount" },

//     { key: "amountToBePaid", header: "Amount To be Paid" },
//     { key: "amountPaid", header: "Total Paid (All-Time)" },
//     { key: "balance", header: "Balance" },
//     {
//       key: "status",
//       header: "Status",
//       render: (row) => (
//         <span
//           className={`px-3 py-1 rounded-full text-white ${
//             row.status === "Paid" ? "bg-green-500" : "bg-red-500"
//           }`}
//         >
//           {row.status}
//         </span>
//       ),
//     },
//     { key: "latestCollectedBy", header: "Collected By" },
//   ];

//   return (
//     <div className="w-screen">
//       <div className="flex mt-30">
//         <Navbar
//           onGlobalSearchChangeHandler={(e) => setSearchText(e.target.value)}
//           visibility={true}
//         />
//         {isLoading ? (
//           <div className="w-full">
//             <CircularLoader color="text-green-600" />
//           </div>
//         ) : (
//           <div className="flex-grow p-7">
//             <h1 className="text-2xl font-bold text-center">
//               Reports - Payment Summary
//             </h1>
//             <div className="mt-6 mb-8">
//               <div className="flex flex-wrap items-center gap-4 mb-6">
//                 <div>
//                   <label>Filter Date</label>
//                   <Select
//                     showSearch
//                     popupMatchSelectWidth={false}
//                     onChange={handleSelectFilter}
//                     value={selectedLabel || undefined}
//                     placeholder="Select Date"
//                     className="w-full max-w-xs h-11"
//                   >
//                     {option.map(
//                       (option) => (
//                         <Select.Option key={option.key} value={option.key}>
//                           {option.value}
//                         </Select.Option>
//                       )
//                     )}
//                   </Select>
//                 </div>
//                 {showFilterField && (
//                   <div>
//                     <label>Select Custom Date</label>
//                     <input
//                       type="date"
//                       value={payloads.pay_date}
//                       onChange={(e) =>
//                         setPayloads((prev) => ({
//                           ...prev,
//                           pay_date: e.target.value,
//                         }))
//                       }
//                       className="w-full max-w-xs h-11 rounded-md"
//                     />
//                   </div>
//                 )}
//                 <div className="text-md font-semibold text-blue-700">
//                   <label>Total Amount (Filtered Date)</label>
//                   <input
//                     readOnly
//                     className="w-full max-w-xs h-11 rounded-md"
                   
//                     value={`₹ ${filteredData
//                       .reduce((sum, u) => sum + (u.dailyPaymentTotal || 0), 0)
//                       .toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
//                   />
//                 </div>
//               </div>
//               <DataTable
//                 data={filteredData}
//                 columns={columns}
//                 exportedPdfName="Payment Summary Report"
//                 printHeaderKeys={["Total Amount Paid (Filtered Date)"]}
//                 printHeaderValues={[
//                   filteredData
//                     .reduce((sum, u) => sum + (u.dailyPaymentTotal || 0), 0)
//                     .toLocaleString("en-IN", { minimumFractionDigits: 2 }),
//                 ]}
//                 exportedFileName={`PaymentSummaryReport.csv`}
//               />
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// const PaymentSummary = () => {
//   const [searchText, setSearchText] = useState("");
//   const [usersData, setUsersData] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [payloads, setPayloads] = useState({
//     pay_date: "",
//     payment_type: "",
//   });
//   const [selectedLabel, setSelectedLabel] = useState("");
//   const [showFilterField, setShowFilterField] = useState(false);

//   const option = [
//     { key: "Today", value: "Today" },
//     { key: "Yesterday", value: "Yesterday" },
//     { key: "TwoDaysAgo", value: "Two Days Ago" },
//     { key: "Custom", value: "Custom" },
//   ];

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setIsLoading(true);
//         const params = {};
//         if (payloads.pay_date) params.pay_date = payloads.pay_date;
//         if (payloads.payment_type) params.payment_type = payloads.payment_type;

//         const response = await api.get("/user/get-daily-payments", { params });
//         const rawData = response.data;

//         let count = 0;
//         const processed = [];

//         rawData.forEach((usr) => {
//           if (usr?.data) {
//             usr.data.forEach((item) => {
//               const enroll = item.enrollment;
//               const pay = item.payments || {};
//               const auction = item.auction || {};
//               const firstAuction = item.firstAuction || {};

//               // increment row number for every record (group or loan)
//               count++;

//               if (enroll?.type === "Group") {
//                 const dailyPaymentTotal = pay?.totalPaidOnFilteredDate || 0;
//                 const latestAmount = pay?.latestPaymentAmount || 0;
//                 const totalPaid = pay?.totalPaidAmount || 0;

//                 // derive totalPayable from returned payments.totalPayable (preferred) else compute
//                 let totalPayable = Number(pay.totalPayable || 0);
//                 if (!totalPayable) {
//                   // compute using group + auction info (fallback)
//                   const groupInstall = Number(enroll.group?.group_install || 0);
//                   const auctionCount = Number(auction?.auctionCount || 0);
//                   const firstDiv = Number(firstAuction?.firstDividentHead || 0);
//                   if (enroll.group?.group_type === "double") {
//                     totalPayable = groupInstall * auctionCount + groupInstall;
//                   } else {
//                     totalPayable = Number(auction?.totalPayable || 0) + groupInstall + firstDiv;
//                   }
//                 }

//                 const balance = totalPayable - totalPaid;
//                 let status = "Not Paid";
//                 if (dailyPaymentTotal > 0 || balance <= 0) status = "Paid";

//                 processed.push({
//                   sl_no: count,
//                   _id: usr._id,
//                   userName: usr.userName,
//                   userPhone: usr.phone_number,
//                   customerId: usr.customer_id,
//                   recordType: "Group",
//                   groupName: enroll.group?.group_name || "-",
//                   groupValue: enroll.group?.group_value || "-",
//                   payment_type: enroll.payment_type,
//                   paymentsTicket: pay.ticket || enroll.tickets || "-",
//                   dailyPaymentTotal,
//                   latestPaymentAmount: latestAmount,
//                   latestPaymentDate: pay.latestPaymentDate || null,
//                   latestCollectedBy: pay.latestCollectedBy || "N/A",
//                   amountPaid: totalPaid,
//                   amountToBePaid: totalPayable,
//                   balance,
//                   status,
//                 });
//               } else if (enroll?.type === "Loan") {
//                 const dailyPaymentTotal = pay?.totalPaidOnFilteredDate || 0;
//                 const latestAmount = pay?.latestPaymentAmount || 0;
//                 const totalPaid = pay?.totalPaidAmount || 0;
//                 // backend sets payments.totalPayable for loans, fallback to loan_amount + service_charges
//                 const totalPayable =
//                   Number(pay.totalPayable || 0) ||
//                   (Number(enroll.loan_amount || 0) + Number(enroll.service_charges || 0));
//                 const balance = Number(pay.balance ?? (totalPayable - totalPaid));

//                 let status = "Not Paid";
//                 if (dailyPaymentTotal > 0 || balance <= 0) status = "Paid";

//                 processed.push({
//                   sl_no: count,
//                   _id: usr._id,
//                   userName: usr.userName,
//                   userPhone: usr.phone_number,
//                   customerId: usr.customer_id,
//                   recordType: "Loan",
//                   loanId: enroll.loan_id,
//                   groupName: `Loan: ${enroll.loan_id}`,
//                   groupValue: enroll.loan_amount,
//                   loanAmount: enroll.loan_amount,
//                   tenure: enroll.tenure,
//                   service_charges: enroll.service_charges,
//                   payment_type: "Loan",
//                   paymentsTicket: "-",
//                   dailyPaymentTotal,
//                   latestPaymentAmount: latestAmount,
//                   latestPaymentDate: pay.latestPaymentDate || null,
//                   latestCollectedBy: pay.latestCollectedBy || "N/A",
//                   amountPaid: totalPaid,
//                   amountToBePaid: totalPayable,
//                   balance,
//                   status,
//                 });
//               }
//             });
//           }
//         });

//         setUsersData(processed);
//       } catch (error) {
//         console.error("Error fetching report:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchData();
//   }, [payloads]);

//   const handleSelectFilter = (value) => {
//     setSelectedLabel(value);
//     setShowFilterField(false);
//     const today = new Date();
//     const formatDate = (date) => date.toISOString().split("T")[0];

//     switch (value) {
//       case "Today":
//         setPayloads((prev) => ({ ...prev, pay_date: formatDate(today) }));
//         break;
//       case "Yesterday":
//         const yest = new Date(today);
//         yest.setDate(today.getDate() - 1);
//         setPayloads((prev) => ({ ...prev, pay_date: formatDate(yest) }));
//         break;
//       case "TwoDaysAgo":
//         const twoDays = new Date(today);
//         twoDays.setDate(today.getDate() - 2);
//         setPayloads((prev) => ({ ...prev, pay_date: formatDate(twoDays) }));
//         break;
//       case "Custom":
//         setShowFilterField(true);
//         break;
//       default:
//         setPayloads((prev) => ({ ...prev, pay_date: "" }));
//     }
//   };

//   const filteredData = useMemo(() => {
//     return usersData.filter((item) => filterOption([item], searchText).length > 0);
//   }, [usersData, searchText]);

//   const handlePaymentTypeChange = (value) => {
//     setPayloads((prev) => ({ ...prev, payment_type: value }));
//   };

//   const columns = [
//     { key: "sl_no", header: "SL. NO" },
//     { key: "latestPaymentDate", header: "Payment Date" },
//     { key: "userName", header: "Customer Name" },
//     { key: "userPhone", header: "Phone Number" },
//     // { key: "recordType", header: "Record Type" },
//     { key: "groupName", header: "Group / Loan" },
//     { key: "groupValue", header: "Group Value " },
//   //  { key: "loanAmount", header: "Loan Amount" },
//     { key: "payment_type", header: "Payment Type" },
//     { key: "paymentsTicket", header: "Ticket" },
//     { key: "dailyPaymentTotal", header: "Daily Total Paid" },
//     { key: "latestPaymentAmount", header: "Latest Amount" },
//     { key: "amountToBePaid", header: "Amount To be Paid" },
//     { key: "amountPaid", header: "Total Paid (All-Time)" },
//     { key: "balance", header: "Balance" },
//     {
//       key: "status",
//       header: "Status",
//       render: (row) => (
//         <span className={`px-3 py-1 rounded-full text-white ${row.status === "Paid" ? "bg-green-500" : "bg-red-500"}`}>
//           {row.status}
//         </span>
//       ),
//     },
//     { key: "latestCollectedBy", header: "Collected By" },
//   ];

//   return (
//     <div className="w-screen">
//       <div className="flex mt-30">
//         <Navbar onGlobalSearchChangeHandler={(e) => setSearchText(e.target.value)} visibility={true} />
//         {isLoading ? (
//           <div className="w-full">
//             <CircularLoader color="text-green-600" />
//           </div>
//         ) : (
//           <div className="flex-grow p-7">
//             <h1 className="text-2xl font-bold text-center">Reports - Payment Summary</h1>
//             <div className="mt-6 mb-8">
//               <div className="flex flex-wrap items-center gap-4 mb-6">
//                 <div>
//                   <label>Filter Date</label>
//                   <Select
//                     showSearch
//                     popupMatchSelectWidth={false}
//                     onChange={handleSelectFilter}
//                     value={selectedLabel || undefined}
//                     placeholder="Select Date"
//                     className="w-full max-w-xs h-11"
//                   >
//                     {option.map((option) => (
//                       <Select.Option key={option.key} value={option.key}>
//                         {option.value}
//                       </Select.Option>
//                     ))}
//                   </Select>
//                 </div>
//                 {showFilterField && (
//                   <div>
//                     <label>Select Custom Date</label>
//                     <input
//                       type="date"
//                       value={payloads.pay_date}
//                       onChange={(e) => setPayloads((prev) => ({ ...prev, pay_date: e.target.value }))}
//                       className="w-full max-w-xs h-11 rounded-md"
//                     />
//                   </div>
//                 )}
//                 <div className="text-md font-semibold text-blue-700">
//                   <label>Total Amount </label>
//                   <input
//                     readOnly
//                     className="w-full max-w-xs h-11 rounded-md"
//                     value={`₹ ${filteredData.reduce((sum, u) => sum + (u.dailyPaymentTotal || 0), 0).toLocaleString("en-IN", {
//                       minimumFractionDigits: 2,
//                     })}`}
//                   />
//                 </div>
//               </div>

//               <DataTable
//                 data={filteredData}
//                 columns={columns}
//                 exportedPdfName="Payment Summary Report"
//                 printHeaderKeys={["Total Amount Paid (Filtered Date)"]}
//                 printHeaderValues={[
//                   filteredData.reduce((sum, u) => sum + (u.dailyPaymentTotal || 0), 0).toLocaleString("en-IN", {
//                     minimumFractionDigits: 2,
//                   }),
//                 ]}
//                 exportedFileName={`PaymentSummaryReport.csv`}
//               />
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

const PaymentSummary = () => {
  const [searchText, setSearchText] = useState("");
  const [usersData, setUsersData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [payloads, setPayloads] = useState({
    pay_date: "",
    payment_type: "",
  });
  const [selectedLabel, setSelectedLabel] = useState("");
  const [showFilterField, setShowFilterField] = useState(false);

  const option = [
    { key: "Today", value: "Today" },
    { key: "Yesterday", value: "Yesterday" },
    { key: "TwoDaysAgo", value: "Two Days Ago" },
    { key: "Custom", value: "Custom" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const params = {};
        if (payloads.pay_date) params.pay_date = payloads.pay_date;
        if (payloads.payment_type) params.payment_type = payloads.payment_type;

        const response = await api.get("/user/get-daily-payments", { params });
        const rawData = response.data;

        let count = 0;
        const processed = [];

        rawData.forEach((usr) => {
          if (usr?.data) {
            usr.data.forEach((item) => {
              const enroll = item.enrollment;
              const pay = item.payments || {};
              const auction = item.auction || {};
              const firstAuction = item.firstAuction || {};

              // increment row number for every record (group or loan)
              count++;

              if (enroll?.type === "Group") {
                const dailyPaymentTotal = pay?.totalPaidOnFilteredDate || 0;
                const latestAmount = pay?.latestPaymentAmount || 0;
                const totalPaid = pay?.totalPaidAmount || 0;

                // derive totalPayable from returned payments.totalPayable (preferred) else compute
                let totalPayable = Number(pay.totalPayable || 0);
                if (!totalPayable) {
                  // compute using group + auction info (fallback)
                  const groupInstall = Number(enroll.group?.group_install || 0);
                  const auctionCount = Number(auction?.auctionCount || 0);
                  const firstDiv = Number(firstAuction?.firstDividentHead || 0);
                  if (enroll.group?.group_type === "double") {
                    totalPayable = groupInstall * auctionCount + groupInstall;
                  } else {
                    totalPayable = Number(auction?.totalPayable || 0) + groupInstall + firstDiv;
                  }
                }

                const balance = totalPayable - totalPaid;
                let status = "Not Paid";
                if (dailyPaymentTotal > 0 || balance <= 0) status = "Paid";

                processed.push({
                  sl_no: count,
                  _id: usr._id,
                  userName: usr.userName,
                  userPhone: usr.phone_number,
                  customerId: usr.customer_id,
                  recordType: "Group",
                  groupName: enroll.group?.group_name || "-",
                  groupValue: enroll.group?.group_value || "-",
                  payment_type: enroll.payment_type,
                  paymentsTicket: pay.ticket || enroll.tickets || "-",
                  dailyPaymentTotal,
                  latestPaymentAmount: latestAmount,
                  latestPaymentDate: pay.latestPaymentDate || null,
                  latestCollectedBy: pay.latestCollectedBy || "N/A",
                  amountPaid: totalPaid,
                  amountToBePaid: totalPayable,
                  balance,
                  status,
                });
              } else if (enroll?.type === "Loan") {
                const dailyPaymentTotal = pay?.totalPaidOnFilteredDate || 0;
                const latestAmount = pay?.latestPaymentAmount || 0;
                const totalPaid = pay?.totalPaidAmount || 0;
                // backend sets payments.totalPayable for loans, fallback to loan_amount + service_charges
                const totalPayable =
                  Number(pay.totalPayable || 0) ||
                  (Number(enroll.loan_amount || 0) + Number(enroll.service_charges || 0));
                const balance = Number(pay.balance ?? (totalPayable - totalPaid));

                let status = "Not Paid";
                if (dailyPaymentTotal > 0 || balance <= 0) status = "Paid";

                processed.push({
                  sl_no: count,
                  _id: usr._id,
                  userName: usr.userName,
                  userPhone: usr.phone_number,
                  customerId: usr.customer_id,
                  recordType: "Loan",
                  loanId: enroll.loan_id,
                  groupName: `Loan: ${enroll.loan_id}`,
                  groupValue: enroll.loan_amount,
                  loanAmount: enroll.loan_amount,
                  tenure: enroll.tenure,
                  service_charges: enroll.service_charges,
                  payment_type: "Loan",
                  paymentsTicket: "-",
                  dailyPaymentTotal,
                  latestPaymentAmount: latestAmount,
                  latestPaymentDate: pay.latestPaymentDate || null,
                  latestCollectedBy: pay.latestCollectedBy || "N/A",
                  amountPaid: totalPaid,
                  amountToBePaid: totalPayable,
                  balance,
                  status,
                });
              }
            });
          }
        });

        setUsersData(processed);
      } catch (error) {
        console.error("Error fetching report:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [payloads]);

  const handleSelectFilter = (value) => {
    setSelectedLabel(value);
    setShowFilterField(false);
    const today = new Date();
    const formatDate = (date) => date.toISOString().split("T")[0];

    switch (value) {
      case "Today":
        setPayloads((prev) => ({ ...prev, pay_date: formatDate(today) }));
        break;
      case "Yesterday":
        const yest = new Date(today);
        yest.setDate(today.getDate() - 1);
        setPayloads((prev) => ({ ...prev, pay_date: formatDate(yest) }));
        break;
      case "TwoDaysAgo":
        const twoDays = new Date(today);
        twoDays.setDate(today.getDate() - 2);
        setPayloads((prev) => ({ ...prev, pay_date: formatDate(twoDays) }));
        break;
      case "Custom":
        setShowFilterField(true);
        break;
      default:
        setPayloads((prev) => ({ ...prev, pay_date: "" }));
    }
  };

  const filteredData = useMemo(() => {
    return usersData.filter((item) => filterOption([item], searchText).length > 0);
  }, [usersData, searchText]);

  const handlePaymentTypeChange = (value) => {
    setPayloads((prev) => ({ ...prev, payment_type: value }));
  };

  // Calculate summary metrics
  const totalUsers = new Set(filteredData.map(item => item._id)).size;
  const totalRecords = filteredData.length;
  const groupRecords = filteredData.filter(item => item.recordType === "Group").length;
  const loanRecords = filteredData.filter(item => item.recordType === "Loan").length;
  const totalAmountPaid = filteredData.reduce((sum, item) => sum + (item.amountPaid || 0), 0);
  const totalAmountToBePaid = filteredData.reduce((sum, item) => sum + (item.amountToBePaid || 0), 0);
  const totalBalance = filteredData.reduce((sum, item) => sum + (item.balance || 0), 0);
  const todayTotalPaid = filteredData.reduce((sum, item) => sum + (item.dailyPaymentTotal || 0), 0);
  const paidRecords = filteredData.filter(item => item.status === "Paid").length;
  const unpaidRecords = filteredData.filter(item => item.status === "Not Paid").length;

  const columns = [
    { key: "sl_no", header: "SL. NO" },
    { key: "latestPaymentDate", header: "Payment Date" },
    { key: "userName", header: "Customer Name" },
    { key: "userPhone", header: "Phone Number" },
    { key: "groupName", header: "Group / Loan" },
    { key: "groupValue", header: "Group Value " },
    { key: "payment_type", header: "Payment Type" },
    { key: "paymentsTicket", header: "Ticket" },
    { key: "dailyPaymentTotal", header: "Daily Total Paid" },
    { key: "latestPaymentAmount", header: "Latest Amount" },
    { key: "amountToBePaid", header: "Amount To be Paid" },
    { key: "amountPaid", header: "Total Paid (All-Time)" },
    { key: "balance", header: "Balance" },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-white ${row.status === "Paid" ? "bg-green-500" : "bg-red-500"}`}>
          {row.status}
        </span>
      ),
    },
    { key: "latestCollectedBy", header: "Collected By" },
  ];

  return (
    <div className="w-screen">
      <div className="flex mt-30">
        <Navbar onGlobalSearchChangeHandler={(e) => setSearchText(e.target.value)} visibility={true} />
        {isLoading ? (
          <div className="w-full">
            <CircularLoader color="text-green-600" />
          </div>
        ) : (
          <div className="flex-grow p-7">
            <h1 className="text-2xl font-bold text-center">Reports - Payment Summary</h1>
            
            {/* ENHANCED SUMMARY CARDS */}
            <div className="mb-8 mt-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Payment Overview</h2>
              
              {/* TODAY'S COLLECTION CARD */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm uppercase tracking-wide">
                      Today's Collection
                    </p>
                    <p className="text-3xl font-bold mt-1">₹{todayTotalPaid.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}</p>
                    <p className="text-blue-100 text-sm mt-1">
                      {selectedLabel || "All Time"}
                    </p>
                  </div>
                  <div className="bg-white bg-opacity-20 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* SUMMARY GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                
                {/* TOTAL USERS */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Users</h3>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {totalUsers} Total
                    </span>
                  </div>
                  <div className="text-center py-2">
                    <p className="text-3xl font-bold text-blue-600">{totalUsers}</p>
                    <p className="text-gray-500 text-sm mt-1">Unique Customers</p>
                  </div>
                </div>

                {/* RECORD TYPES */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Record Types</h3>
                    <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {totalRecords} Total
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Groups</span>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full" 
                            style={{ width: `${(groupRecords / totalRecords) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold">{groupRecords}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Loans</span>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full" 
                            style={{ width: `${(loanRecords / totalRecords) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold">{loanRecords}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* TOTAL AMOUNT PAID */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Amount Paid</h3>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      All Time
                    </span>
                  </div>
                  <div className="text-center py-2">
                    <p className="text-3xl font-bold text-green-600">₹{totalAmountPaid.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}</p>
                    <p className="text-gray-500 text-sm mt-1">Total Collected</p>
                  </div>
                </div>

                {/* BALANCE */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Balance</h3>
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      Outstanding
                    </span>
                  </div>
                  <div className="text-center py-2">
                    <p className="text-3xl font-bold text-red-600">₹{totalBalance.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}</p>
                    <p className="text-gray-500 text-sm mt-1">Amount Due</p>
                  </div>
                </div>
              </div>
              
              {/* ADDITIONAL METRICS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-amber-100 text-amber-600 mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Amount To Be Paid</p>
                      <p className="font-semibold text-gray-800">₹{totalAmountToBePaid.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}</p>
                    </div>
                  </div>
                </div>
                
                {/* <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Paid Records</p>
                      <p className="font-semibold text-gray-800">{paidRecords} / {totalRecords}</p>
                    </div>
                  </div>
                </div> */}
                
                {/* <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Unpaid Records</p>
                      <p className="font-semibold text-gray-800">{unpaidRecords} / {totalRecords}</p>
                    </div>
                  </div>
                </div> */}
              </div>
            </div>
            
            <div className="mt-6 mb-8">
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div>
                  <label>Filter Date</label>
                  <Select
                    showSearch
                    popupMatchSelectWidth={false}
                    onChange={handleSelectFilter}
                    value={selectedLabel || undefined}
                    placeholder="Select Date"
                    className="w-full max-w-xs h-11"
                  >
                    {option.map((option) => (
                      <Select.Option key={option.key} value={option.key}>
                        {option.value}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
                {showFilterField && (
                  <div>
                    <label>Select Custom Date</label>
                    <input
                      type="date"
                      value={payloads.pay_date}
                      onChange={(e) => setPayloads((prev) => ({ ...prev, pay_date: e.target.value }))}
                      className="w-full max-w-xs h-11 rounded-md"
                    />
                  </div>
                )}
                {/* <div className="text-md font-semibold text-blue-700">
                  <label>Total Amount </label>
                  <input
                    readOnly
                    className="w-full max-w-xs h-11 rounded-md"
                    value={`₹ ${filteredData.reduce((sum, u) => sum + (u.dailyPaymentTotal || 0), 0).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}`}
                  />
                </div> */}
              </div>

              <DataTable
                data={filteredData}
                columns={columns}
                exportedPdfName="Payment Summary Report"
                printHeaderKeys={["Total Amount Paid (Filtered Date)"]}
                printHeaderValues={[
                  filteredData.reduce((sum, u) => sum + (u.dailyPaymentTotal || 0), 0).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    }),
                ]}
                exportedFileName={`PaymentSummaryReport.csv`}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSummary;
