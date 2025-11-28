import React, { useState, useEffect } from "react";
import { Select, Spin } from "antd";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";

const groupOptions = [
  { value: "Today", label: "Today" },
  { value: "Yesterday", label: "Yesterday" },
  { value: "ThisMonth", label: "This Month" },
  { value: "LastMonth", label: "Last Month" },
  { value: "ThisYear", label: "This Year" },
  { value: "Custom", label: "Custom" },
];

// const NonConvertedLead = () => {
//   const [loadingPage, setLoadingPage] = useState(true);

//   const [selectedLabel, setSelectedLabel] = useState("ThisMonth");
//   const [selectedFromDate, setSelectedFromDate] = useState("");
//   const [selectedDate, setSelectedDate] = useState("");

//   const [users, setUsers] = useState([]);
//   const [agents, setAgents] = useState([]);
//   const [employees, setEmployees] = useState([]);
//   const [customers, setCustomers] = useState([]);

//   const [customerReferredBy, setCustomerReferredBy] = useState("");
//   const [employeeReferredBy, setEmployeeReferredBy] = useState("");

//   const [leadTableData, setLeadTableData] = useState([]);
//   const [fetchingLeads, setFetchingLeads] = useState(false);

//   // Format date as yyyy-mm-dd
//   const formatDateEnCA = (date) => {
//     if (!date) return "";
//     const d = new Date(date);
//     const yyyy = d.getFullYear();
//     const mm = String(d.getMonth() + 1).padStart(2, "0");
//     const dd = String(d.getDate()).padStart(2, "0");
//     return `${yyyy}-${mm}-${dd}`;
//   };

//   const getIdFromValue = (val) => {
//     if (!val) return "";
//     return val.split("_")[1] || "";
//   };

//   const handleSelectFilter = (value) => {
//     setSelectedLabel(value);

//     const today = new Date();

//     if (value === "Today") {
//       const f = formatDateEnCA(today);
//       setSelectedFromDate(f);
//       setSelectedDate(f);
//     } else if (value === "Yesterday") {
//       const y = new Date(today);
//       y.setDate(y.getDate() - 1);
//       const f = formatDateEnCA(y);
//       setSelectedFromDate(f);
//       setSelectedDate(f);
//     } else if (value === "ThisMonth") {
//       const start = new Date(today.getFullYear(), today.getMonth(), 1);
//       const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
//       setSelectedFromDate(formatDateEnCA(start));
//       setSelectedDate(formatDateEnCA(end));
//     } else if (value === "LastMonth") {
//       const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
//       const end = new Date(today.getFullYear(), today.getMonth(), 0);
//       setSelectedFromDate(formatDateEnCA(start));
//       setSelectedDate(formatDateEnCA(end));
//     } else if (value === "ThisYear") {
//       const start = new Date(today.getFullYear(), 0, 1);
//       const end = new Date(today.getFullYear(), 11, 31);
//       setSelectedFromDate(formatDateEnCA(start));
//       setSelectedDate(formatDateEnCA(end));
//     } else if (value === "Custom") {
//       setSelectedFromDate("");
//       setSelectedDate("");
//     }
//   };

//   // Load dropdowns
//   useEffect(() => {
//     const p1 = api.get("/user/get-user").catch(() => ({ data: [] }));
//     const p2 = api.get("/agent/get").catch(() => ({ data: { agent: [] } }));
//     const p3 = api.get("/employee").catch(() => ({ data: { employee: [] } }));
//     const p4 = api.get("/user/get-user").catch(() => ({ data: { customer: [] } }));

//     Promise.all([p1, p2, p3, p4])
//       .then(([u, a, e, c]) => {
//         setUsers(u?.data || []);
//         setAgents(a?.data?.agent || []);
//         setEmployees(e?.data?.employee || []);
//         setCustomers(c?.data?.customer || []);
//       })
//       .finally(() => setLoadingPage(false));
//   }, []);

//   // FETCH LEADS when filters change
//   useEffect(() => {
//     // Only fetch if both dates are present (even for presets)
//     if (selectedFromDate && selectedDate) {
//       fetchFilteredLeads();
//     } else {
//       // If dates are missing (e.g., Custom with no input), clear table
//       setLeadTableData([]);
//     }
//   }, [selectedFromDate, selectedDate, customerReferredBy, employeeReferredBy]);

//   // INITIALIZE DEFAULT FILTER AFTER DROPDOWNS ARE LOADED (optional but safe)
//   useEffect(() => {
//     if (!loadingPage) {
//       handleSelectFilter("ThisMonth");
//     }
//   }, [loadingPage]);

//   const fetchFilteredLeads = async () => {
//     setFetchingLeads(true);
//     try {
//       const params = new URLSearchParams();
//       params.append("from_date", selectedFromDate);
//       params.append("to_date", selectedDate);

//       if (customerReferredBy) {
//         params.append("customer_id", getIdFromValue(customerReferredBy));
//       }
//       if (employeeReferredBy) {
//         params.append("agent_id", getIdFromValue(employeeReferredBy));
//       }

//       const url = `/lead/not-converted-customer?${params.toString()}`;
//       const res = await api.get(url);
//       const data = res?.data?.response || [];

//       const formatted = data.map((lead, index) => ({
//         id: lead?._id,
//         SlNo: index + 1,
//         LeadName: lead?.lead_name || "",
//         leadPhone: lead?.lead_phone || "",
//         leadProfession: lead?.lead_profession || "",
//         groupName: lead?.group_id?.group_name || "",
//         leadType: lead?.lead_type || "",
//         schemeType: lead?.scheme_type || "",
//         referredBy:
//           (lead?.lead_agent?.name && lead?.lead_agent?.phone_number)
//             ? `${lead?.lead_agent?.name} | ${lead?.lead_agent?.phone_number}`
//             : (lead?.lead_customer?.full_name && lead?.lead_customer?.phone_number)
//             ? `${lead?.lead_customer?.full_name} | ${lead?.lead_customer?.phone_number}`
//             : "N/A",
//       }));

//       setLeadTableData(formatted);
//     } catch (e) {
//       console.error("Fetch Error:", e);
//       setLeadTableData([]);
//     } finally {
//       setFetchingLeads(false);
//     }
//   };

//   const leadColumns = [
//     { header: "Sl No", key: "SlNo" },
//     { header: "Name", key: "LeadName" },
//     { header: "Phone", key: "leadPhone" },
//     { header: "Profession", key: "leadProfession" },
//     { header: "Group", key: "groupName" },
//     { header: "Lead Type", key: "leadType" },
//     { header: "Scheme Type", key: "schemeType" },
//     { header: "Referred By", key: "referredBy" },
//   ];

//   // Disable manual date inputs unless "Custom" is selected
//   const isCustomMode = selectedLabel === "Custom";

//   return (
//     <div className="p-5 w-full">
//       <div className="flex items-center justify-between mb-4">
//         <h1 className="text-xl font-semibold text-gray-800">
//           Report – Non-Converted Leads
//         </h1>
//         {loadingPage && (
//           <div className="flex items-center gap-2 text-sm text-gray-600">
//             <Spin size="small" /> <span>Loading lookups...</span>
//           </div>
//         )}
//       </div>

//       {/* FILTERS ROW 1 */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
//         <div className="space-y-2">
//           <label className="text-sm font-medium">Date Filter</label>
//           <Select
//             showSearch
//             value={selectedLabel}
//             onChange={handleSelectFilter}
//             className="w-full h-11"
//             popupMatchSelectWidth={false}
//           >
//             {groupOptions.map((g) => (
//               <Select.Option key={g.value} value={g.value}>
//                 {g.label}
//               </Select.Option>
//             ))}
//           </Select>
//         </div>

//         <div className="space-y-2">
//           <label className="text-sm font-medium">From Date</label>
//           <input
//             type="date"
//             value={selectedFromDate}
//             onChange={(e) => {
//               setSelectedFromDate(e.target.value);
//               setSelectedLabel("Custom");
//             }}
//             disabled={!isCustomMode} // ←←← KEY FIX
//             className={`w-full h-11 border rounded-lg px-3 ${
//               !isCustomMode ? "bg-gray-100 cursor-not-allowed" : "border-gray-300"
//             }`}
//           />
//         </div>

//         <div className="space-y-2">
//           <label className="text-sm font-medium">To Date</label>
//           <input
//             type="date"
//             value={selectedDate}
//             onChange={(e) => {
//               setSelectedDate(e.target.value);
//               setSelectedLabel("Custom");
//             }}
//             disabled={!isCustomMode} // ←←← KEY FIX
//             className={`w-full h-11 border rounded-lg px-3 ${
//               !isCustomMode ? "bg-gray-100 cursor-not-allowed" : "border-gray-300"
//             }`}
//           />
//         </div>

//         <div className="space-y-2">
//           <label className="text-sm font-medium">Customer Referred By</label>
//           <Select
//             showSearch
//             allowClear
//             value={customerReferredBy}
//             onChange={(v) => setCustomerReferredBy(v || "")}
//             placeholder="Select Customer Referrer"
//             className="w-full h-11"
//             popupMatchSelectWidth={false}
//           >
//             <Select.Option value="">All</Select.Option>
//             <Select.OptGroup label="Users">
//               {users.map((u) => (
//                 <Select.Option key={u._id} value={`USER_${u._id}`}>
//                   {u.full_name} | {u.phone_number}
//                 </Select.Option>
//               ))}
//             </Select.OptGroup>
//             <Select.OptGroup label="Agents">
//               {agents.map((a) => (
//                 <Select.Option key={a._id} value={`AGENT_${a._id}`}>
//                   {a.name} | {a.phone_number}
//                 </Select.Option>
//               ))}
//             </Select.OptGroup>
//             <Select.OptGroup label="Customers">
//               {customers.map((c) => (
//                 <Select.Option key={c._id} value={`CUS_${c._id}`}>
//                   {c.full_name} | {c.phone_number}
//                 </Select.Option>
//               ))}
//             </Select.OptGroup>
//           </Select>
//         </div>
//       </div>

//       {/* FILTERS ROW 2 */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
//         <div className="space-y-2">
//           <label className="text-sm font-medium">Employee Referred By</label>
//           <Select
//             showSearch
//             allowClear
//             value={employeeReferredBy}
//             onChange={(v) => setEmployeeReferredBy(v || "")}
//             placeholder="Select Employee Referrer"
//             className="w-full h-11"
//           >
//             <Select.Option value="">All</Select.Option>
//             {employees.map((e) => (
//               <Select.Option key={e._id} value={`EMP_${e._id}`}>
//                 {e.full_name || e.name} | {e.phone_number}
//               </Select.Option>
//             ))}
//           </Select>
//         </div>
//       </div>

//       {/* SUMMARY BOX */}
// <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">

//   {/* TOP SUMMARY 4-BOX GRID */}
//   <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
//     <div className="text-center">
//       <p className="text-gray-600 text-sm">Total Non-Converted Leads</p>
//       <p className="text-xl font-bold text-blue-700">{leadTableData.length}</p>
//     </div>

//     <div className="text-center">
//       <p className="text-gray-600 text-sm">Referred by Customer</p>
//       <p className="text-xl font-bold text-green-700">
//         {
//           leadTableData.filter(l =>
//             customers.some(c =>
//               `${c.full_name} | ${c.phone_number}` === l.referredBy
//             )
//           ).length
//         }
//       </p>
//     </div>

//     <div className="text-center">
//       <p className="text-gray-600 text-sm">Referred by Employee</p>
//       <p className="text-xl font-bold text-purple-700">
//         {
//           leadTableData.filter(l =>
//             employees.some(e =>
//               `${e.full_name || e.name} | ${e.phone_number}` === l.referredBy
//             )
//           ).length
//         }
//       </p>
//     </div>

//     <div className="text-center">
//       <p className="text-gray-600 text-sm">Referred by Agent</p>
//       <p className="text-xl font-bold text-orange-700">
//         {
//           leadTableData.filter(l =>
//             agents.some(a =>
//               `${a.name} | ${a.phone_number}` === l.referredBy
//             )
//           ).length
//         }
//       </p>
//     </div>
//   </div>

//   {/* DETAILED REFERRER NAME WITH COUNT */}
//   <div className="bg-white p-4 rounded-lg border">
//     <h2 className="font-semibold text-gray-700 mb-2">Referrer Breakdown</h2>

//     {leadTableData.length === 0 ? (
//       <p className="text-gray-500 text-sm">No leads available.</p>
//     ) : (
//       <ul className="space-y-1">
//         {[...new Set(leadTableData.map(l => l.referredBy))].map(ref => {
//           if (!ref || ref === "N/A") return null;

//           const count = leadTableData.filter(l => l.referredBy === ref).length;

//           return (
//             <li key={ref} className="flex justify-between border-b py-1">
//               <span className="font-medium text-gray-800">{ref}</span>
//               <span className="font-bold text-blue-700">{count}</span>
//             </li>
//           );
//         })}
//       </ul>
//     )}
//   </div>
// </div>


//       {/* TABLE */}
//       <div className="bg-white shadow rounded-lg p-3 min-h-[200px]">
//         {fetchingLeads ? (
//           <div className="flex justify-center py-16">
//             <Spin />
//           </div>
//         ) : (
//           <DataTable columns={leadColumns} data={leadTableData} />
//         )}
//       </div>
//     </div>
//   );
// };

const NonConvertedLead = () => {
  const [loadingPage, setLoadingPage] = useState(true);

  const [selectedLabel, setSelectedLabel] = useState("ThisMonth");
  const [selectedFromDate, setSelectedFromDate] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const [users, setUsers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [customerReferredBy, setCustomerReferredBy] = useState("");
  const [employeeReferredBy, setEmployeeReferredBy] = useState("");

  const [leadTableData, setLeadTableData] = useState([]);
  const [fetchingLeads, setFetchingLeads] = useState(false);

  // FORMAT DATE YYYY-MM-DD
  const formatDateEnCA = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const getIdFromValue = (val) => {
    if (!val) return "";
    return val.split("_")[1] || "";
  };

  // HANDLE DROPDOWN PRESET DATE SELECTION
  const handleSelectFilter = (value) => {
    setSelectedLabel(value);
    const today = new Date();

    if (value === "Today") {
      const f = formatDateEnCA(today);
      setSelectedFromDate(f);
      setSelectedDate(f);
    } else if (value === "Yesterday") {
      const y = new Date(today);
      y.setDate(y.getDate() - 1);
      const f = formatDateEnCA(y);
      setSelectedFromDate(f);
      setSelectedDate(f);
    } else if (value === "ThisMonth") {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      setSelectedFromDate(formatDateEnCA(start));
      setSelectedDate(formatDateEnCA(end));
    } else if (value === "LastMonth") {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0);
      setSelectedFromDate(formatDateEnCA(start));
      setSelectedDate(formatDateEnCA(end));
    } else if (value === "ThisYear") {
      const start = new Date(today.getFullYear(), 0, 1);
      const end = new Date(today.getFullYear(), 11, 31);
      setSelectedFromDate(formatDateEnCA(start));
      setSelectedDate(formatDateEnCA(end));
    } else if (value === "Custom") {
      setSelectedFromDate("");
      setSelectedDate("");
    }
  };

  // LOAD DROPDOWN DATA
  useEffect(() => {
    const p1 = api.get("/user/get-user").catch(() => ({ data: [] }));
    const p2 = api.get("/agent/get").catch(() => ({ data: { agent: [] } }));
    const p3 = api.get("/employee").catch(() => ({ data: { employee: [] } }));
    const p4 = api.get("/user/get-user").catch(() => ({ data: { customer: [] } }));

    Promise.all([p1, p2, p3, p4])
      .then(([u, a, e, c]) => {
        setUsers(u?.data || []);
        setAgents(a?.data?.agent || []);
        setEmployees(e?.data?.employee || []);
        setCustomers(c?.data?.customer || []);
      })
      .finally(() => setLoadingPage(false));
  }, []);

  // FETCH LEADS WHEN FILTER CHANGES
  useEffect(() => {
    if (selectedFromDate && selectedDate) {
      fetchFilteredLeads();
    } else {
      setLeadTableData([]);
    }
  }, [selectedFromDate, selectedDate, customerReferredBy, employeeReferredBy]);

  // DEFAULT LOAD = THIS MONTH
  useEffect(() => {
    if (!loadingPage) {
      handleSelectFilter("ThisMonth");
    }
  }, [loadingPage]);

  const fetchFilteredLeads = async () => {
    setFetchingLeads(true);
    try {
      const params = new URLSearchParams();
      params.append("from_date", selectedFromDate);
      params.append("to_date", selectedDate);

      if (customerReferredBy) {
        params.append("customer_id", getIdFromValue(customerReferredBy));
      }
      if (employeeReferredBy) {
        params.append("agent_id", getIdFromValue(employeeReferredBy));
      }

      const res = await api.get(`/lead/not-converted-customer?${params.toString()}`);
      const data = res?.data?.response || [];

      const formatted = data.map((lead, index) => ({
        id: lead?._id,
        SlNo: index + 1,
        LeadName: lead?.lead_name || "",
        leadPhone: lead?.lead_phone || "",
        leadProfession: lead?.lead_profession || "",
        groupName: lead?.group_id?.group_name || "",
        leadType: lead?.lead_type || "",
        schemeType: lead?.scheme_type || "",
        referredBy:
          lead?.lead_agent?.name
            ? `${lead?.lead_agent?.name} | ${lead?.lead_agent?.phone_number}`
            : lead?.lead_customer?.full_name
            ? `${lead?.lead_customer?.full_name} | ${lead?.lead_customer?.phone_number}`
            : "N/A",
      }));

      setLeadTableData(formatted);
    } catch (error) {
      console.error("Fetch error:", error);
      setLeadTableData([]);
    } finally {
      setFetchingLeads(false);
    }
  };

  // TABLE COLUMNS
  const leadColumns = [
    { header: "Sl No", key: "SlNo" },
    { header: "Name", key: "LeadName" },
    { header: "Phone", key: "leadPhone" },
    { header: "Profession", key: "leadProfession" },
    { header: "Group", key: "groupName" },
    { header: "Lead Type", key: "leadType" },
    { header: "Scheme Type", key: "schemeType" },
    { header: "Referred By", key: "referredBy" },
  ];

  const isCustomMode = selectedLabel === "Custom";

  return (
    <div className="p-5 w-full">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-gray-800">
          Report – Non-Converted Leads
        </h1>
        {loadingPage && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Spin size="small" /> <span>Loading lookups...</span>
          </div>
        )}
      </div>

      {/* FILTERS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">

        {/* DATE FILTER */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Date Filter</label>
          <Select
            value={selectedLabel}
            onChange={handleSelectFilter}
            className="w-full h-11"
          >
            {groupOptions.map((g) => (
              <Select.Option key={g.value} value={g.value}>
                {g.label}
              </Select.Option>
            ))}
          </Select>
        </div>

        {/* FROM DATE */}
        <div className="space-y-2">
          <label className="text-sm font-medium">From Date</label>
          <input
            type="date"
            value={selectedFromDate}
            onChange={(e) => {
              setSelectedFromDate(e.target.value);
              setSelectedLabel("Custom");
            }}
            disabled={!isCustomMode}
            className={`w-full h-11 border rounded-lg px-3 ${
              !isCustomMode ? "bg-gray-100" : "border-gray-300"
            }`}
          />
        </div>

        {/* TO DATE */}
        <div className="space-y-2">
          <label className="text-sm font-medium">To Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setSelectedLabel("Custom");
            }}
            disabled={!isCustomMode}
            className={`w-full h-11 border rounded-lg px-3 ${
              !isCustomMode ? "bg-gray-100" : "border-gray-300"
            }`}
          />
        </div>

        {/* CUSTOMER REFERRED BY */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Customer Referred By</label>
          <Select
            allowClear
            value={customerReferredBy}
            onChange={(v) => setCustomerReferredBy(v || "")}
            className="w-full h-11"
          >
            <Select.Option value="">All</Select.Option>
            {customers.map((c) => (
              <Select.Option key={c._id} value={`CUS_${c._id}`}>
                {c.full_name} | {c.phone_number}
              </Select.Option>
            ))}
          </Select>
        </div>
      </div>

      {/* SECOND ROW FILTERS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        {/* EMPLOYEE REFERRED BY */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Employee Referred By</label>
          <Select
            allowClear
            value={employeeReferredBy}
            onChange={(v) => setEmployeeReferredBy(v || "")}
            className="w-full h-11"
          >
            <Select.Option value="">All</Select.Option>
            {employees.map((e) => (
              <Select.Option key={e._id} value={`EMP_${e._id}`}>
                {e.full_name || e.name} | {e.phone_number}
              </Select.Option>
            ))}
          </Select>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">

        {/* TOP SUMMARY */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Non-Converted Leads</p>
            <p className="text-xl font-bold text-blue-700">{leadTableData.length}</p>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">Referred by Customer</p>
            <p className="text-xl font-bold text-green-700">
              {
                leadTableData.filter((l) =>
                  customers.some(
                    (c) => `${c.full_name} | ${c.phone_number}` === l.referredBy
                  )
                ).length
              }
            </p>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">Referred by Employee</p>
            <p className="text-xl font-bold text-purple-700">
              {
                leadTableData.filter((l) =>
                  employees.some(
                    (e) =>
                      `${e.full_name || e.name} | ${e.phone_number}` === l.referredBy
                  )
                ).length
              }
            </p>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">Referred by Agent</p>
            <p className="text-xl font-bold text-orange-700">
              {
                leadTableData.filter((l) =>
                  agents.some(
                    (a) => `${a.name} | ${a.phone_number}` === l.referredBy
                  )
                ).length
              }
            </p>
          </div>
        </div>

        {/* DETAILED BREAKDOWN */}
        <div className="bg-white p-4 rounded-lg border">
          <h2 className="font-semibold text-gray-700 mb-2">Referrer Breakdown</h2>

          {leadTableData.length === 0 ? (
            <p className="text-gray-500 text-sm">No leads available.</p>
          ) : (
            <ul className="space-y-1">
              {[...new Set(leadTableData.map((l) => l.referredBy))].map((ref) => {
                if (!ref || ref === "N/A") return null;

                const count = leadTableData.filter((l) => l.referredBy === ref).length;

                return (
                  <li key={ref} className="flex justify-between border-b py-1">
                    <span className="font-medium text-gray-800">{ref}</span>
                    <span className="font-bold text-blue-700">{count}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white shadow rounded-lg p-3 min-h-[200px]">
        {fetchingLeads ? (
          <div className="flex justify-center py-16">
            <Spin />
          </div>
        ) : (
          <DataTable columns={leadColumns} data={leadTableData} />
        )}
      </div>
    </div>
  );
};


export default NonConvertedLead;
