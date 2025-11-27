// import { useEffect, useState } from "react";
// import Sidebar from "../components/layouts/Sidebar";
// import Navbar from "../components/layouts/Navbar";
// import DataTable from "../components/layouts/Datatable";
// import Modal from "../components/modals/Modal";
// import api from "../instance/TokenInstance";
// import CustomAlertDialog from "../components/alerts/CustomAlertDialog";
// import CircularLoader from "../components/loaders/CircularLoader";
// import { Select, Button, Empty } from "antd";
// import filterOption from "../helpers/filterOption";
// import CircularLoader from "../components/loaders/CircularLoader";

// const ChitAskingMonthReport = () => {
//   const now = new Date();

//   const [selectedDate, setSelectedDate] = useState("");
//   const [customers, setCustomers] = useState([]);
//   const [groups, setGroups] = useState([]); // ⭐ GROUPS DATA
//   const [selectedGroup, setSelectedGroup] = useState(null); // ⭐ SELECTED GROUP

//   const [searchText, setSearchText] = useState("");
//   const [loading, setLoading] = useState(false);

//   const [selectedMonth, setSelectedMonth] = useState(
//     String(now.getMonth() + 1).padStart(2, "0")
//   );
//   const [selectedYear, setSelectedYear] = useState(
//     now.getFullYear().toString()
//   );

//   // Month list
//   const months = [
//     { label: "January", value: "01" },
//     { label: "February", value: "02" },
//     { label: "March", value: "03" },
//     { label: "April", value: "04" },
//     { label: "May", value: "05" },
//     { label: "June", value: "06" },
//     { label: "July", value: "07" },
//     { label: "August", value: "08" },
//     { label: "September", value: "09" },
//     { label: "October", value: "10" },
//     { label: "November", value: "11" },
//     { label: "December", value: "12" },
//   ];

//   // Generate years
//   const years = [];
//   for (let y = 2000; y <= 2040; y++) {
//     years.push({ label: y.toString(), value: y.toString() });
//   }

//   // ⭐ FETCH GROUPS FOR DROPDOWN
//   useEffect(() => {
//     const fetchGroups = async () => {
//       try {
//         const res = await api.get("/group/get-group-admin");
//         setGroups(
//           res.data?.map((g) => ({
//             label: g.group_name,
//             value: g._id,
//           })) || []
//         );
//       } catch (error) {
//         console.log("Error loading groups", error);
//       }
//     };

//     fetchGroups();
//   }, []);

//   // FETCH CUSTOMERS
//   const fetchCustomers = async () => {
//     try {
//       setLoading(true);

//       const finalMonth = `${selectedYear}-${selectedMonth}`;

//       const res = await api.get("/enroll/get-customers-by-chit-asking-month", {
//         params: {
//           chit_asking_month: finalMonth,
//           group_id: selectedGroup || "",
//         },
//       });

//       setCustomers(res.data?.data || []);
//     } catch (error) {
//       console.log("Error loading customers");
//     } finally {
//       setLoading(false);
//     }
//   };

 
//   const formattedData = customers.map((item, index) => ({
//     sl_no: index + 1,
//     customer_name: item?.user_id?.full_name,
//     customer_id: item?.user_id?.customer_id,
//     phone: item?.user_id?.phone_number,
//     group: item?.group_id?.group_name,
//     payment_type: item?.payment_type,
//     chit_asking_month: item?.chit_asking_month,

  
//     referred_by:
//       item?.agent?.name && item?.agent?.phone_number
//         ? `${item.agent.name} | ${item.agent.phone_number}`
//         : item?.referred_customer?.full_name &&
//           item?.referred_customer?.phone_number
//         ? `${item.referred_customer.full_name} | ${item.referred_customer.phone_number}`
//         : item?.referred_lead?.lead_name && item?.referred_lead?.agent_number
//         ? `${item.referred_lead.lead_name} | ${item.referred_lead.agent_number}`
//         : item?.employee?.name && item?.employee?.phone_number
//         ? `${item.employee.name} | ${item.employee.phone_number}`
//         : "N/A",
//   }));

// return (
//   <div className="w-screen">
//     <div className="flex">
//       <div className="flex-grow p-8">

//         {/* ⭐ PAGE TITLE */}
//         <div className="mb-6">
//           <h1 className="text-2xl font-bold text-gray-800">
//             Reports — <span className="text-blue-600">Chit Asking Month</span>
//           </h1>
//         </div>

//         {/* ⭐ FILTER CARD */}
//         <div className="bg-white p-6 rounded-xl shadow-lg border mb-8">
//           <div className="flex gap-6 items-end">

//             {/* YEAR FILTER */}
//             <div className="flex flex-col">
//               <label className="mb-1 font-semibold text-gray-700">Year Filter</label>
//               <Select
//                 style={{ width: 150 }}
//                 value={selectedYear}
//                 options={years}
//                 onChange={setSelectedYear}
//                 className="h-12"
//               />
//             </div>

//             {/* MONTH FILTER */}
//             <div className="flex flex-col">
//               <label className="mb-1 font-semibold text-gray-700">Month Filter</label>
//               <Select
//                 style={{ width: 150 }}
//                 value={selectedMonth}
//                 options={months}
//                 onChange={setSelectedMonth}
//                 className="h-12"
//               />
//             </div>

//             {/* GROUP FILTER */}
//             <div className="flex flex-col">
//               <label className="mb-1 font-semibold text-gray-700">Group Filter</label>
//               <Select
//                 style={{ width: 200 }}
//                 value={selectedGroup}
//                 options={[{ label: "All Groups", value: "" }, ...groups]}
//                 onChange={(val) => setSelectedGroup(val)}
//                 className="h-12"
//                 placeholder="Select Group"
//               />
//             </div>

//             {/* CONTINUE BUTTON */}
//             <div className="flex flex-col">
//               <label className="mb-1 opacity-0">.</label>
//               <Button
//                 type="primary"
//                 onClick={fetchCustomers}
//                 loading={loading}
//                 className="h-12"
//               >
//                 Continue
//               </Button>
//             </div>

//           </div>
//         </div>

//         {/* ⭐ TABLE */}
//         <div className="bg-white p-6 rounded-xl shadow-lg border">
//           {formattedData?.length > 0 ? (
//             <DataTable
//             catcher="sl_no"
//             data={formattedData}
//             columns={[
//               { key: "sl_no", header: "SL. NO" },
//               { key: "customer_id", header: "Customer ID" },
//               { key: "customer_name", header: "Customer Name" },
//               { key: "phone", header: "Phone Number" },
//               { key: "group", header: "Group Name" },
//               { key: "payment_type", header: "Payment Type" },
//               { key: "chit_asking_month", header: "Chit Asking Month" },
//               { key: "referred_by", header: "Referred By" },
//             ]}
//           />): (
//             <CircularLoader
//             isLoading={setLoading}
//             failure={formattedData?.lengh <=0}
//             data={"Chit Asking Month Data"}
//             />
//           )}
//         </div>

//       </div>
//     </div>
//   </div>
// );

// };

import { useEffect, useState } from "react";
import Sidebar from "../components/layouts/Sidebar";
import Navbar from "../components/layouts/Navbar";
import DataTable from "../components/layouts/Datatable";
import Modal from "../components/modals/Modal";
import api from "../instance/TokenInstance";
import CustomAlertDialog from "../components/alerts/CustomAlertDialog";
import CircularLoader from "../components/loaders/CircularLoader"; // ✅ removed duplicate import
import { Select, Button, Empty } from "antd";
import filterOption from "../helpers/filterOption";

// const ChitAskingMonthReport = () => {
//   const now = new Date();

//   const [customers, setCustomers] = useState([]);
//   const [groups, setGroups] = useState([]);
//   const [selectedGroup, setSelectedGroup] = useState("");

//   const [loading, setLoading] = useState(false);

//   const [selectedMonth, setSelectedMonth] = useState(""
  
//   );
//     // String(now.getMonth() + 1).padStart(2, "0")
//   const [selectedYear, setSelectedYear] = useState(""
   
//   );
//    // now.getFullYear().toString()

//   // Month list
//   const months = [
//     { label: "January", value: "01" },
//     { label: "February", value: "02" },
//     { label: "March", value: "03" },
//     { label: "April", value: "04" },
//     { label: "May", value: "05" },
//     { label: "June", value: "06" },
//     { label: "July", value: "07" },
//     { label: "August", value: "08" },
//     { label: "September", value: "09" },
//     { label: "October", value: "10" },
//     { label: "November", value: "11" },
//     { label: "December", value: "12" },
//   ];

//   // Generate years
//   const years = [];
//   for (let y = 2000; y <= 2040; y++) {
//     years.push({ label: y.toString(), value: y.toString() });
//   }

//   // ⭐ Fetch Groups
//   useEffect(() => {
//     const fetchGroups = async () => {
//       try {
//         const res = await api.get("/group/get-group-admin");
//         setGroups(
//           res.data?.map((g) => ({
//             label: g.group_name,
//             value: g._id,
//           })) || []
//         );
//       } catch (error) {
//         console.error("Error loading groups", error);
//       }
//     };

//     fetchGroups();
//   }, []);

//   // ⭐ Fetch Customers Based on Filters
//   const fetchCustomers = async () => {
//     try {
//       setLoading(true);

//       const finalMonth = (!selectedYear && !selectedMonth  )? "":`${selectedYear}-${selectedMonth}`;

//       const res = await api.get("/enroll/get-customers-by-chit-asking-month", {
//         params: {
//           chit_asking_month: finalMonth,
//           group_id: selectedGroup || "",
//         },
//       });

//       setCustomers(res.data?.data || []);
//     } catch (error) {
//       console.error("Error loading customers", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ⭐ Format Table Data
//   const formattedData = customers.map((item, index) => ({
//     sl_no: index + 1,
//     customer_name: item?.user_id?.full_name,
//     customer_id: item?.user_id?.customer_id,
//     phone: item?.user_id?.phone_number,
//     group: item?.group_id?.group_name,
//     groupValue: item?.group_id?.group_value,
//     payment_type: item?.payment_type,
//     chit_asking_month: item?.chit_asking_month,

//     referred_by:
//       item?.agent?.name && item?.agent?.phone_number
//         ? `${item.agent.name} | ${item.agent.phone_number}`
//         : item?.referred_customer?.full_name &&
//           item?.referred_customer?.phone_number
//         ? `${item.referred_customer.full_name} | ${item.referred_customer.phone_number}`
//         : item?.referred_lead?.lead_name && item?.referred_lead?.agent_number
//         ? `${item.referred_lead.lead_name} | ${item.referred_lead.agent_number}`
//         : item?.employee?.name && item?.employee?.phone_number
//         ? `${item.employee.name} | ${item.employee.phone_number}`
//         : "N/A",
//   }));
 




//   return (
//   <div className="w-screen">
//     <div className="flex">
//       <div className="flex-grow p-8">

//         {/* PAGE TITLE */}
//         <div className="mb-6">
//           <h1 className="text-2xl font-bold text-gray-800">
//             Reports — <span className="text-blue-600">Chit Asking Month</span>
//           </h1>
//         </div>

//         {/* SUMMARY CARD */}
//         {formattedData.length > 0 && (
//           <div className="bg-white p-6 rounded-xl shadow-lg border mb-8">
//             <h2 className="text-xl font-semibold mb-4 text-gray-800">Summary</h2>

//             {/* TOTAL CUSTOMERS */}
//             <div className="mb-4">
//               <p className="text-lg font-bold text-blue-700">
//                 Total Customers: {totalCustomers}
//               </p>
//             </div>

//             {/* FLEX GRID */}
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

//               {/* REFERRED BY COUNT */}
//               <div className="bg-gray-50 p-4 rounded-lg border">
//                 <h3 className="text-md font-semibold mb-3 text-gray-700">Referred By</h3>
//                 {Object.entries(referredByCount).map(([name, count]) => (
//                   <div key={name} className="flex justify-between py-1 text-sm">
//                     <span className="text-gray-600">{name}</span>
//                     <span className="font-semibold">{count}</span>
//                   </div>
//                 ))}
//               </div>

//               {/* GROUP WISE COUNT */}
//               <div className="bg-gray-50 p-4 rounded-lg border">
//                 <h3 className="text-md font-semibold mb-3 text-gray-700">Group Wise Count</h3>
//                 {Object.entries(groupWiseCount).map(([group, count]) => (
//                   <div key={group} className="flex justify-between py-1 text-sm">
//                     <span className="text-gray-600">{group}</span>
//                     <span className="font-semibold">{count}</span>
//                   </div>
//                 ))}
//               </div>

//             </div>
//           </div>
//         )}

//         {/* FILTER CARD */}
//         <div className="bg-white p-6 rounded-xl shadow-lg border mb-8">
//           <div className="flex gap-6 items-end">

//             {/* YEAR FILTER */}
//             <div className="flex flex-col">
//               <label className="mb-1 font-semibold text-gray-700">Year Filter</label>
//               <Select
//                 style={{ width: 150 }}
//                 value={selectedYear || null}
//                 options={years}
//                 placeholder="Select Year"
//                 onChange={setSelectedYear}
//                 className="h-12"
//               />
//             </div>

//             {/* MONTH FILTER */}
//             <div className="flex flex-col">
//               <label className="mb-1 font-semibold text-gray-700">Month Filter</label>
//               <Select
//                 style={{ width: 150 }}
//                 value={selectedMonth || null}
//                 options={months}
//                 placeholder="Select Month"
//                 onChange={setSelectedMonth}
//                 className="h-12"
//               />
//             </div>

//             {/* GROUP FILTER */}
//             <div className="flex flex-col">
//               <label className="mb-1 font-semibold text-gray-700">Group Filter</label>
//               <Select
//                 style={{ width: 200 }}
//                 value={selectedGroup}
//                 options={[{ label: "All Groups", value: "" }, ...groups]}
//                 onChange={(val) => setSelectedGroup(val)}
//                 className="h-12"
//                 placeholder="Select Group"
//               />
//             </div>

//             {/* Continue Button */}
//             <div className="flex flex-col">
//               <label className="mb-1 opacity-0">.</label>
//               <Button
//                 type="primary"
//                 onClick={fetchCustomers}
//                 loading={loading}
//                 className="h-12"
//               >
//                 Continue
//               </Button>
//             </div>

//           </div>
//         </div>

//         {/* TABLE */}
//         <div className="bg-white p-6 rounded-xl shadow-lg border">

//           {loading ? (
//             <CircularLoader isLoading={loading} />
//           ) : formattedData.length > 0 ? (
//             <DataTable
//               catcher="sl_no"
//               data={formattedData}
//               columns={[
//                 { key: "sl_no", header: "SL. NO" },
//                 { key: "customer_id", header: "Customer ID" },
//                 { key: "customer_name", header: "Customer Name" },
//                 { key: "phone", header: "Phone Number" },
//                 { key: "group", header: "Group Name" },
//                 { key: "groupValue", header: "Group Value" },
//                 { key: "payment_type", header: "Payment Type" },
//                 { key: "chit_asking_month", header: "Chit Asking Month" },
//                 { key: "referred_by", header: "Referred By" },
//               ]}
//             />
//           ) : (
//             <Empty description="No Chit Asking Month Data Found" />
//           )}

//         </div>

//       </div>
//     </div>
//   </div>
// );


// };



const ChitAskingMonthReport = () => {
  const now = new Date();

  const [customers, setCustomers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");

  const [loading, setLoading] = useState(false);

  const [selectedMonth, setSelectedMonth] = useState(
    // String(now.getMonth() + 1).padStart(2, "0")
    ""
  );
  const [selectedYear, setSelectedYear] = useState(
    // now.getFullYear().toString()
    ""
  );

  // Month list
  const months = [
    { label: "January", value: "01" },
    { label: "February", value: "02" },
    { label: "March", value: "03" },
    { label: "April", value: "04" },
    { label: "May", value: "05" },
    { label: "June", value: "06" },
    { label: "July", value: "07" },
    { label: "August", value: "08" },
    { label: "September", value: "09" },
    { label: "October", value: "10" },
    { label: "November", value: "11" },
    { label: "December", value: "12" },
  ];

  // Generate years
  const years = [];
  for (let y = 2000; y <= 2040; y++) {
    years.push({ label: y.toString(), value: y.toString() });
  }

  // ⭐ Fetch Groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await api.get("/group/get-group-admin");
        setGroups(
          res.data?.map((g) => ({
            label: g.group_name,
            value: g._id,
          })) || []
        );
      } catch (error) {
        console.error("Error loading groups", error);
      }
    };

    fetchGroups();
  }, []);

  // ⭐ Fetch Customers Based on Filters
  const fetchCustomers = async () => {
    try {
      setLoading(true);

      const finalMonth =
        !selectedYear && !selectedMonth ? "" : `${selectedYear}-${selectedMonth}`;

      const res = await api.get("/enroll/get-customers-by-chit-asking-month", {
        params: {
          chit_asking_month: finalMonth,
          group_id: selectedGroup || "",
        },
      });

      setCustomers(res.data?.data || []);
    } catch (error) {
      console.error("Error loading customers", error);
    } finally {
      setLoading(false);
    }
  };

  // ⭐ Format Table Data
  const formattedData = customers.map((item, index) => ({
    sl_no: index + 1,
    customer_name: item?.user_id?.full_name,
    customer_id: item?.user_id?.customer_id,
    phone: item?.user_id?.phone_number,
    group: item?.group_id?.group_name,
    groupValue: item?.group_id?.group_value,
    payment_type: item?.payment_type,
    chit_asking_month: item?.chit_asking_month,

    referred_by:
      item?.agent?.name && item?.agent?.phone_number
        ? `${item.agent.name} | ${item.agent.phone_number}`
        : item?.referred_customer?.full_name &&
          item?.referred_customer?.phone_number
        ? `${item.referred_customer.full_name} | ${item.referred_customer.phone_number}`
        : item?.referred_lead?.lead_name && item?.referred_lead?.agent_number
        ? `${item.referred_lead.lead_name} | ${item.referred_lead.agent_number}`
        : item?.employee?.name && item?.employee?.phone_number
        ? `${item.employee.name} | ${item.employee.phone_number}`
        : "N/A",
  }));

  // SUMMARY CALCULATIONS
  const totalCustomers = formattedData.length;

  // Count by Referred By
  const referredByCount = {};
  formattedData.forEach((item) => {
    const key = item.referred_by || "N/A";
    referredByCount[key] = (referredByCount[key] || 0) + 1;
  });

  // Count by Group
  const groupWiseCount = {};
  formattedData.forEach((item) => {
    const groupName = item.group || "N/A";
    groupWiseCount[groupName] = (groupWiseCount[groupName] || 0) + 1;
  });

  return (
    <div className="w-screen">
      <div className="flex">
        <div className="flex-grow p-8">
          {/* PAGE TITLE */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Reports — <span className="text-blue-600">Chit Asking Month</span>
            </h1>
          </div>

          {/* IMPROVED SUMMARY CARD */}
          {formattedData.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Report Summary</h2>

              {/* TOTAL CUSTOMERS CARD */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm uppercase tracking-wide">
                      Total Customers
                    </p>
                    <p className="text-3xl font-bold mt-1">{totalCustomers}</p>
                  </div>
                  <div className="bg-white bg-opacity-20 p-3 rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* SUMMARY GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* REFERRED BY COUNT */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Referral Sources
                    </h3>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {Object.keys(referredByCount).length} Sources
                    </span>
                  </div>
                  <div className="space-y-3">
                    {Object.entries(referredByCount)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 5)
                      .map(([name, count]) => (
                        <div key={name} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                            <span className="text-gray-700 text-sm truncate max-w-xs">
                              {name}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${(count / totalCustomers) * 100}%` }}
                              ></div>
                            </div>
                            <span className="font-semibold text-gray-800 w-8 text-right">
                              {count}
                            </span>
                          </div>
                        </div>
                      ))}
                    {Object.keys(referredByCount).length > 5 && (
                      <div className="text-center pt-2">
                        <button className="text-blue-600 text-sm font-medium">
                          View All Sources
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* GROUP WISE COUNT */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Group Distribution
                    </h3>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {Object.keys(groupWiseCount).length} Groups
                    </span>
                  </div>
                  <div className="space-y-3">
                    {Object.entries(groupWiseCount)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 5)
                      .map(([group, count]) => (
                        <div key={group} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                            <span className="text-gray-700 text-sm truncate max-w-xs">
                              {group}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${(count / totalCustomers) * 100}%` }}
                              ></div>
                            </div>
                            <span className="font-semibold text-gray-800 w-8 text-right">
                              {count}
                            </span>
                          </div>
                        </div>
                      ))}
                    {Object.keys(groupWiseCount).length > 5 && (
                      <div className="text-center pt-2">
                        <button className="text-green-600 text-sm font-medium">
                          View All Groups
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ADDITIONAL METRICS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Selected Period</p>
                      <p className="font-semibold text-gray-800">
                        {selectedMonth && selectedYear
                          ? `${months.find((m) => m.value === selectedMonth)?.label} ${selectedYear}`
                          : "All Time"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-amber-100 text-amber-600 mr-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Active Groups</p>
                      <p className="font-semibold text-gray-800">
                        {Object.keys(groupWiseCount).length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Avg. Customers/Group</p>
                      <p className="font-semibold text-gray-800">
                        {Object.keys(groupWiseCount).length > 0
                          ? (totalCustomers / Object.keys(groupWiseCount).length).toFixed(1)
                          : "0"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FILTER CARD */}
          <div className="bg-white p-6 rounded-xl shadow-lg border mb-8">
            <div className="flex gap-6 items-end">
              {/* YEAR FILTER */}
              <div className="flex flex-col">
                <label className="mb-1 font-semibold text-gray-700">Year Filter</label>
                <Select
                  style={{ width: 150 }}
                  value={selectedYear || null}
                  options={years}
                  placeholder="Select Year"
                  onChange={setSelectedYear}
                  className="h-12"
                />
              </div>

              {/* MONTH FILTER */}
              <div className="flex flex-col">
                <label className="mb-1 font-semibold text-gray-700">Month Filter</label>
                <Select
                  style={{ width: 150 }}
                  value={selectedMonth || null}
                  options={months}
                  placeholder="Select Month"
                  onChange={setSelectedMonth}
                  className="h-12"
                />
              </div>

              {/* GROUP FILTER */}
              <div className="flex flex-col">
                <label className="mb-1 font-semibold text-gray-700">Group Filter</label>
                <Select
                  style={{ width: 200 }}
                  value={selectedGroup}
                  options={[{ label: "All Groups", value: "" }, ...groups]}
                  onChange={(val) => setSelectedGroup(val)}
                  className="h-12"
                  placeholder="Select Group"
                />
              </div>

              {/* Continue Button */}
              <div className="flex flex-col">
                <label className="mb-1 opacity-0">.</label>
                <Button
                  type="primary"
                  onClick={fetchCustomers}
                  loading={loading}
                  className="h-12"
                >
                  Continue
                </Button>
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="bg-white p-6 rounded-xl shadow-lg border">
            {loading ? (
              <CircularLoader isLoading={loading} />
            ) : formattedData.length > 0 ? (
              <DataTable
                catcher="sl_no"
                data={formattedData}
                columns={[
                  { key: "sl_no", header: "SL. NO" },
                  { key: "customer_id", header: "Customer ID" },
                  { key: "customer_name", header: "Customer Name" },
                  { key: "phone", header: "Phone Number" },
                  { key: "group", header: "Group Name" },
                  { key: "groupValue", header: "Group Value" },
                  { key: "payment_type", header: "Payment Type" },
                  { key: "chit_asking_month", header: "Chit Asking Month" },
                  { key: "referred_by", header: "Referred By" },
                ]}
              />
            ) : (
              <Empty description="No Chit Asking Month Data Found" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};



export default ChitAskingMonthReport;
