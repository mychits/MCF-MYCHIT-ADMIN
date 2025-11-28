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

const ConvertedLead = () => {
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

  // ---------- FORMAT DATE ----------
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

  // -------- DATE FILTER SELECT --------
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

  // ---------- LOAD LOOKUPS ----------
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

  // ---------- FETCH WHEN FILTER CHANGES ----------
  useEffect(() => {
    if (selectedFromDate && selectedDate) {
      fetchFilteredLeads();
    } else {
      setLeadTableData([]);
    }
  }, [selectedFromDate, selectedDate, customerReferredBy, employeeReferredBy]);

  // ---------- INITIAL DEFAULT FILTER ----------
  useEffect(() => {
    if (!loadingPage) {
      handleSelectFilter("ThisMonth");
    }
  }, [loadingPage]);

  // ---------- API CALL ----------
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

      const url = `/lead/converted-customer?${params.toString()}`;
      const res = await api.get(url);
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
          (lead?.lead_agent?.name && lead?.lead_agent?.phone_number)
            ? `${lead?.lead_agent?.name} | ${lead?.lead_agent?.phone_number}`
            : (lead?.lead_customer?.full_name && lead?.lead_customer?.phone_number)
            ? `${lead?.lead_customer?.full_name} | ${lead?.lead_customer?.phone_number}`
            : "N/A",
      }));

      setLeadTableData(formatted);
    } catch (e) {
      console.error("Fetch Error:", e);
      setLeadTableData([]);
    } finally {
      setFetchingLeads(false);
    }
  };

  // ---------- TABLE COLUMNS ----------
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

  // ---------- SUMMARY LIKE NON-CONVERTED ----------
  const totalConverted = leadTableData.length;
  const referredByCustomer = leadTableData.filter(l =>
    l.referredBy !== "N/A" &&
    customers.some(c => `${c.full_name} | ${c.phone_number}` === l.referredBy)
  ).length;

  const referredByEmployee = leadTableData.filter(l =>
    l.referredBy !== "N/A" &&
    employees.some(e =>
      `${e.full_name || e.name} | ${e.phone_number}` === l.referredBy
    )
  ).length;

  const otherReferrers = totalConverted - (referredByCustomer + referredByEmployee);

  return (
    <div className="p-5 w-full">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-gray-800">
          Report – Converted Leads
        </h1>
        {loadingPage && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Spin size="small" /> <span>Loading lookups...</span>
          </div>
        )}
      </div>

      {/* FILTER ROW 1 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Date Filter</label>
          <Select
            showSearch
            value={selectedLabel}
            onChange={handleSelectFilter}
            className="w-full h-11"
            popupMatchSelectWidth={false}
          >
            {groupOptions.map((g) => (
              <Select.Option key={g.value} value={g.value}>
                {g.label}
              </Select.Option>
            ))}
          </Select>
        </div>

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
              !isCustomMode ? "bg-gray-100 cursor-not-allowed" : "border-gray-300"
            }`}
          />
        </div>

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
              !isCustomMode ? "bg-gray-100 cursor-not-allowed" : "border-gray-300"
            }`}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Customer Referred By</label>
          <Select
            showSearch
            allowClear
            value={customerReferredBy}
            onChange={(v) => setCustomerReferredBy(v || "")}
            placeholder="Select Customer Referrer"
            className="w-full h-11"
            popupMatchSelectWidth={false}
          >
            <Select.Option value="">All</Select.Option>
            <Select.OptGroup label="Users">
              {users.map((u) => (
                <Select.Option key={u._id} value={`USER_${u._id}`}>
                  {u.full_name} | {u.phone_number}
                </Select.Option>
              ))}
            </Select.OptGroup>
            <Select.OptGroup label="Agents">
              {agents.map((a) => (
                <Select.Option key={a._id} value={`AGENT_${a._id}`}>
                  {a.name} | {a.phone_number}
                </Select.Option>
              ))}
            </Select.OptGroup>
            <Select.OptGroup label="Customers">
              {customers.map((c) => (
                <Select.Option key={c._id} value={`CUS_${c._id}`}>
                  {c.full_name} | {c.phone_number}
                </Select.Option>
              ))}
            </Select.OptGroup>
          </Select>
        </div>
      </div>

      {/* FILTER ROW 2 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Employee Referred By</label>
          <Select
            showSearch
            allowClear
            value={employeeReferredBy}
            onChange={(v) => setEmployeeReferredBy(v || "")}
            placeholder="Select Employee Referrer"
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

      {/* SUMMARY — SAME AS NON-CONVERTED */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="text-center">
          <p className="text-gray-600 text-sm">Total Converted Leads</p>
          <p className="text-xl font-bold text-blue-700">{totalConverted}</p>
        </div>

        <div className="text-center">
          <p className="text-gray-600 text-sm">Referred by Customer</p>
          <p className="text-xl font-bold text-green-700">{referredByCustomer}</p>
        </div>

        <div className="text-center">
          <p className="text-gray-600 text-sm">Referred by Employee</p>
          <p className="text-xl font-bold text-purple-700">{referredByEmployee}</p>
        </div>

        <div className="text-center">
          <p className="text-gray-600 text-sm">Other Referrers</p>
          <p className="text-xl font-bold text-orange-700">{otherReferrers}</p>
        </div>
      </div>

      {/* ✅ REFERRER BREAKDOWN (ADDED HERE) */}
      <div className="bg-white p-4 rounded-lg border mb-5">
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

// const ConvertedLead = () => {
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

//   const [convertedLeads, setConvertedLeads] = useState([]);
//   const [nonConvertedLeads, setNonConvertedLeads] = useState([]);

//   const [loadingData, setLoadingData] = useState(false);

//   // ---------- FORMAT DATE ----------
//   const formatDateEnCA = (date) => {
//     if (!date) return "";
//     const d = new Date(date);
//     const yyyy = d.getFullYear();
//     const mm = String(d.getMonth() + 1).padStart(2, "0");
//     const dd = String(d.getDate()).padStart(2, "0");
//     return `${yyyy}-${mm}-${dd}`;
//   };

//   const getIdFromValue = (val) => (val ? val.split("_")[1] : "");

//   // -------- DATE FILTER SELECT --------
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
//       setSelectedFromDate(formatDateEnCA(new Date(today.getFullYear(), 0, 1)));
//       setSelectedDate(formatDateEnCA(new Date(today.getFullYear(), 11, 31)));
//     } else {
//       setSelectedFromDate("");
//       setSelectedDate("");
//     }
//   };

//   // ---------- LOAD LOOKUPS ----------
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

//   // ---------- FETCH BOTH REPORTS ----------
//   useEffect(() => {
//     if (selectedFromDate && selectedDate) {
//       fetchReports();
//     } else {
//       setConvertedLeads([]);
//       setNonConvertedLeads([]);
//     }
//   }, [selectedFromDate, selectedDate, customerReferredBy, employeeReferredBy]);

//   // ---------- DEFAULT FILTER ----------
//   useEffect(() => {
//     if (!loadingPage) handleSelectFilter("ThisMonth");
//   }, [loadingPage]);

//   // ---------- API CALL ----------
//   const fetchReports = async () => {
//     setLoadingData(true);
//     try {
//       const params = new URLSearchParams();
//       params.append("from_date", selectedFromDate);
//       params.append("to_date", selectedDate);

//       if (customerReferredBy) params.append("customer_id", getIdFromValue(customerReferredBy));
//       if (employeeReferredBy) params.append("agent_id", getIdFromValue(employeeReferredBy));

//       // Converted
//       const converted = await api.get(`/lead/converted-customer?${params.toString()}`);
//       const convertedData = converted?.data?.response || [];

//       setConvertedLeads(
//         convertedData.map((lead, index) => ({
//           id: lead?._id,
//           SlNo: index + 1,
//           LeadName: lead?.lead_name || "",
//           leadPhone: lead?.lead_phone || "",
//           groupName: lead?.group_id?.group_name || "",
//           leadType: lead?.lead_type || "",
//           referredBy:
//             lead?.lead_agent
//               ? `${lead?.lead_agent?.name} | ${lead?.lead_agent?.phone_number}`
//               : lead?.lead_customer
//               ? `${lead?.lead_customer?.full_name} | ${lead?.lead_customer?.phone_number}`
//               : "N/A",
//         }))
//       );

//       // Non Converted
//       const nonConverted = await api.get(`/lead/not-converted-customer?${params.toString()}`);
//       const nonConvertedData = nonConverted?.data?.response || [];

//       setNonConvertedLeads(
//         nonConvertedData.map((lead, index) => ({
//           id: lead?._id,
//           SlNo: index + 1,
//           LeadName: lead?.lead_name || "",
//           Phone: lead?.lead_phone || "",
//           groupName: lead?.group_id?.group_name || "-",
//           reason: lead?.reason || "N/A",
//           referredBy:
//             lead?.lead_agent
//               ? `${lead?.lead_agent?.name} | ${lead?.lead_agent?.phone_number}`
//               : lead?.lead_customer
//               ? `${lead?.lead_customer?.full_name} | ${lead?.lead_customer?.phone_number}`
//               : "N/A",
//         }))
//       );
//     } catch {
//       setConvertedLeads([]);
//       setNonConvertedLeads([]);
//     }
//     setLoadingData(false);
//   };

//   const isCustomMode = selectedLabel === "Custom";

//   // ---------- TABLE COLUMNS ----------
//   const convertedColumns = [
//     { header: "Sl No", key: "SlNo" },
//     { header: "Name", key: "LeadName" },
//     { header: "Phone", key: "leadPhone" },
//     { header: "Group", key: "groupName" },
//     { header: "Lead Type", key: "leadType" },
//     { header: "Referred By", key: "referredBy" },
//   ];

//   const nonConvertedColumns = [
//     { header: "Sl No", key: "SlNo" },
//     { header: "Name", key: "LeadName" },
//     { header: "Phone", key: "Phone" },
//     { header: "Group", key: "groupName" },
//     { header: "Reason", key: "reason" },
//     { header: "Referred By", key: "referredBy" },
//   ];

//   return (
//     <div className="p-5 w-full">
//       <h1 className="text-xl font-semibold text-gray-800 mb-4">
//         Leads Report – Converted & Non-Converted
//       </h1>

//       {/* FILTERS */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
//         {/* Date Filter */}
//         <div>
//           <label className="text-sm font-medium">Date Filter</label>
//           <Select
//             value={selectedLabel}
//             onChange={handleSelectFilter}
//             className="w-full h-11"
//           >
//             {groupOptions.map((g) => (
//               <Select.Option key={g.value} value={g.value}>
//                 {g.label}
//               </Select.Option>
//             ))}
//           </Select>
//         </div>

//         {/* From Date */}
//         <div>
//           <label className="text-sm font-medium">From Date</label>
//           <input
//             type="date"
//             value={selectedFromDate}
//             disabled={!isCustomMode}
//             onChange={(e) => {
//               setSelectedFromDate(e.target.value);
//               setSelectedLabel("Custom");
//             }}
//             className="w-full h-11 border rounded-md px-2"
//           />
//         </div>

//         {/* To Date */}
//         <div>
//           <label className="text-sm font-medium">To Date</label>
//           <input
//             type="date"
//             value={selectedDate}
//             disabled={!isCustomMode}
//             onChange={(e) => {
//               setSelectedDate(e.target.value);
//               setSelectedLabel("Custom");
//             }}
//             className="w-full h-11 border rounded-md px-2"
//           />
//         </div>

//         {/* Customer Referrer */}
//         <div>
//           <label className="text-sm font-medium">Customer Referred By</label>
//           <Select
//             allowClear
//             value={customerReferredBy}
//             onChange={(v) => setCustomerReferredBy(v || "")}
//             className="w-full h-11"
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

//       {/* Employee Referrer */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
//         <div>
//           <label className="text-sm font-medium">Employee Referred By</label>
//           <Select
//             allowClear
//             value={employeeReferredBy}
//             onChange={(v) => setEmployeeReferredBy(v || "")}
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

//       {/* ---------- SUMMARY BOXES ---------- */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//         <div className="bg-blue-50 border p-3 rounded text-center">
//           <p className="text-gray-600 text-sm">Converted Leads</p>
//           <p className="text-xl font-bold text-blue-700">{convertedLeads.length}</p>
//         </div>

//         <div className="bg-yellow-50 border p-3 rounded text-center">
//           <p className="text-gray-600 text-sm">Non Converted Leads</p>
//           <p className="text-xl font-bold text-yellow-700">{nonConvertedLeads.length}</p>
//         </div>

//         <div className="bg-gray-50 border p-3 rounded text-center">
//           <p className="text-gray-600 text-sm">Total Leads</p>
//           <p className="text-xl font-bold text-gray-700">
//             {convertedLeads.length + nonConvertedLeads.length}
//           </p>
//         </div>
//       </div>

      

//       {/* ---------- CONVERTED LEADS TABLE ---------- */}
//       <div className="bg-white p-4 rounded-lg shadow mb-6">
//         <h2 className="text-lg font-semibold text-gray-700 mb-3">Converted Leads</h2>
//         {loadingData ? (
//           <div className="flex justify-center py-10">
//             <Spin />
//           </div>
//         ) : (
//           <DataTable columns={convertedColumns} data={convertedLeads} />
//         )}
//       </div>

//       {/* ---------- NON-CONVERTED LEADS TABLE ---------- */}
//       <div className="bg-white p-4 rounded-lg shadow">
//         <h2 className="text-lg font-semibold text-gray-700 mb-3">
//           Non Converted Leads
//         </h2>
//         {loadingData ? (
//           <div className="flex justify-center py-10">
//             <Spin />
//           </div>
//         ) : (
//           <DataTable columns={nonConvertedColumns} data={nonConvertedLeads} />
//         )}
//       </div>
//     </div>
//   );
// };






export default ConvertedLead;
