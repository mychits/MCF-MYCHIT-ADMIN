/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import Sidebar from "../components/layouts/Sidebar";
import Modal from "../components/modals/Modal";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import { Input, Select, Dropdown, DatePicker } from "antd";
import { IoMdMore } from "react-icons/io";
import Navbar from "../components/layouts/Navbar";
import filterOption from "../helpers/filterOption";
import CircularLoader from "../components/loaders/CircularLoader";
import handleEnrollmentRequestPrint from "../components/printFormats/enrollmentRequestPrint";
import CustomAlertDialog from "../components/alerts/CustomAlertDialog";
import { fieldSize } from "../data/fieldSize";
const { RangePicker } = DatePicker;


// const UnApprovedCustomerReport = () => {
//   const [users, setUsers] = useState([]);
//   const [TableUsers, setTableUsers] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [showModal, setShowModal] = useState(false);
//   const [showModalDelete, setShowModalDelete] = useState(false);
//   const [showModalUpdate, setShowModalUpdate] = useState(false);
//   const [currentUser, setCurrentUser] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [currentUpdateUser, setCurrentUpdateUser] = useState(null);
//   const [selectedGroup, setSelectedGroup] = useState({});
//   const [groups, setGroups] = useState([]);
//   const [areas, setAreas] = useState([]);
//   const [files, setFiles] = useState({});
//   const [districts, setDistricts] = useState([]);
//   const [reloadTrigger, setReloadTrigger] = useState(0);
//   const [alertConfig, setAlertConfig] = useState({
//     visibility: false,
//     message: "Something went wrong!",
//     type: "info",
//   });
//   const [errors, setErrors] = useState({});




//   const [searchText, setSearchText] = useState("");
//   const GlobalSearchChangeHandler = (e) => {
//     const { value } = e.target;
//     setSearchText(value);
//   };

//   useEffect(() => {
//     const fetchCollectionArea = async () => {
//       try {
//         const response = await api.get(
//           "/collection-area-request/get-collection-area-data"
//         );

//         setAreas(response.data);
//       } catch (error) {
//         console.error("Error fetching user data:", error);
//       }
//     };
//     fetchCollectionArea();
//   }, [reloadTrigger]);



//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         setIsLoading(true);
//         const response = await api.get("/user/approval-status/false");
//         setUsers(response.data);
//         const formattedData = response.data.map((group, index) => ({
//           _id: group._id,
//           id: index + 1,
//           name: group.full_name,
//           phone_number: group.phone_number,
//           createdAt: group.createdAt?.split("T")[0],
//           address: group.address,
//           pincode: group.pincode,
//           customer_id: group.customer_id,
//           collection_area: group.collection_area?.route_name,
//           approval_status:
//             group.approval_status === "true" ? (
//               <div className="inline-block px-3 py-1 text-sm font-medium text-green-800 bg-red-100 rounded-full shadow-sm">Approved</div>
//             ) : group.approval_status === "false" ? (
//               <div className="inline-block px-3 py-1 text-sm font-medium text-red-800 bg-red-100 rounded-full shadow-sm">
//                 Pending
//               </div>
//             ) : (
//               <div className="inline-block px-3 py-1 text-sm font-medium text-green-800 bg-red-100 rounded-full shadow-sm" >Approved</div>
//             ),
//           action: (
//             <div className="flex justify-center gap-2">
//               <Dropdown
//                 trigger={["click"]}
//                 menu={{
//                   items: [
                   
//                     {
//                       key: "3",
//                       label: (
//                         <div
//                           onClick={() =>
//                             handleEnrollmentRequestPrint(group?._id)
//                           }
//                           className=" text-blue-600 "
//                         >
//                           Print
//                         </div>
//                       ),
//                     },
                  
//                   ],
//                 }}
//                 placement="bottomLeft"
//               >
//                 <IoMdMore className="text-bold" />
//               </Dropdown>
//             </div>
//           ),
//         }));
//         let fData = formattedData.map((ele) => {
//           if (
//             ele?.address &&
//             typeof ele.address === "string" &&
//             ele?.address?.includes(",")
//           )
//             ele.address = ele.address.replaceAll(",", " ");
//           return ele;
//         });
//         if (!fData) setTableUsers(formattedData);
//         if (!fData) setTableUsers(formattedData);
//         setTableUsers(fData);
//       } catch (error) {
//         console.error("Error fetching user data:", error.message);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchUsers();
//   }, [reloadTrigger]);
//   const columns = [
//     { key: "id", header: "SL. NO" },
//     { key: "approval_status", header: "Approval Status" },
//     { key: "customer_id", header: "Customer Id" },
//     { key: "name", header: "Customer Name" },
//     { key: "phone_number", header: "Customer Phone Number" },
//     {key: "createdAt", header: "Joined On"},
//     { key: "address", header: "Customer Address" },
//     { key: "pincode", header: "Customer Pincode" },
//     { key: "collection_area", header: "Area" },
//     { key: "action", header: "Action" },
//   ];

//   const filteredUsers = users.filter((user) =>
//     user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <>
//       <div>
//         <div className="flex mt-20">
          
//           <Navbar
//             onGlobalSearchChangeHandler={GlobalSearchChangeHandler}
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
//               <h1 className="text-2xl font-semibold">Report - Unverified Customers</h1>
//             </div>
//             {TableUsers?.length > 0 && !isLoading ? (
//               <DataTable
//                 catcher="_id"
                
//                 data={filterOption(TableUsers, searchText)}
//                 columns={columns}
//                 exportedPdfName="UnApproved Customers"
//                 exportedFileName={`UnApproved Customers.csv`}
//               />
//             ) : (
//               <CircularLoader
//                 isLoading={isLoading}
//                 failure={TableUsers.length <= 0}
//                 data="Customer Data"
//               />
//             )}
//           </div>
//         </div>
        
        
//       </div>
//     </>
//   );
// };


// const UnApprovedCustomerReport = () => {
//   const [users, setUsers] = useState([]);
//   const [TableUsers, setTableUsers] = useState([]);
//   const [searchText, setSearchText] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [reloadTrigger, setReloadTrigger] = useState(0);
//   const [alertConfig, setAlertConfig] = useState({
//     visibility: false,
//     message: "Something went wrong!",
//     type: "info",
//   });

//   // 🔹 Date Filter States
//   const [selectedLabel, setSelectedLabel] = useState("Today");
//   const now = new Date();
//   const todayString = now.toISOString().split("T")[0];
//   const [selectedFromDate, setSelectedFromDate] = useState(todayString);
//   const [selectedDate, setSelectedDate] = useState(todayString);
//   const [showFilterField, setShowFilterField] = useState(false);

//   // 🔹 Date Filter Options — ✅ Added "All"
//   const groupOptions = [
//     { label: "All", value: "All" }, // ✅ NEW OPTION
//     { label: "Today", value: "Today" },
//     { label: "Yesterday", value: "Yesterday" },
//     { label: "This Month", value: "ThisMonth" },
//     { label: "Last Month", value: "LastMonth" },
//     { label: "This Year", value: "ThisYear" },
//     { label: "Custom", value: "Custom" },
//   ];

//   const formatDate = (date) => date.toLocaleDateString("en-CA");

//   const handleSelectFilter = (value) => {
//     setSelectedLabel(value);
//     setShowFilterField(false);

//     const today = new Date();

//     if (value === "All") {
//       // ✅ Selecting “All” disables date filtering
//       setSelectedFromDate(null);
//       setSelectedDate(null);
//       return;
//     }

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

//   const GlobalSearchChangeHandler = (e) => {
//     const { value } = e.target;
//     setSearchText(value);
//   };

//   // 🔹 Fetch unapproved users
//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         setIsLoading(true);
//         const response = await api.get("/user/approval-status/false");
//         setUsers(response.data);

//         const formattedData = response.data.map((group, index) => ({
//           _id: group._id,
//           id: index + 1,
//           name: group.full_name,
//           phone_number: group.phone_number,
//           createdAt: group.createdAt?.split("T")[0],
//           address: group.address?.replaceAll(",", " "),
//           pincode: group.pincode,
//           customer_id: group.customer_id,
//           collection_area: group.collection_area?.route_name,
//           approval_status:
//             group.approval_status === "true" ? (
//               <div className="inline-block px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full shadow-sm">
//                 Approved
//               </div>
//             ) : (
//               <div className="inline-block px-3 py-1 text-sm font-medium text-red-800 bg-red-100 rounded-full shadow-sm">
//                 Pending
//               </div>
//             ),
//           action: (
//             <div className="flex justify-center gap-2">
//               <Dropdown
//                 trigger={["click"]}
//                 menu={{
//                   items: [
//                     {
//                       key: "3",
//                       label: (
//                         <div
//                           onClick={() => handleEnrollmentRequestPrint(group?._id)}
//                           className="text-blue-600"
//                         >
//                           Print
//                         </div>
//                       ),
//                     },
//                   ],
//                 }}
//                 placement="bottomLeft"
//               >
//                 <IoMdMore className="text-bold" />
//               </Dropdown>
//             </div>
//           ),
//         }));
//         setTableUsers(formattedData);
//       } catch (error) {
//         console.error("Error fetching user data:", error.message);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchUsers();
//   }, [reloadTrigger]);

//   // 🔹 Apply date filter on createdAt
//   const filteredByDate =
//     selectedLabel === "All"
//       ? TableUsers // ✅ “All” shows all users
//       : TableUsers.filter((user) => {
//           const joinDate = new Date(user.createdAt);
//           const from = new Date(selectedFromDate);
//           const to = new Date(selectedDate);
//           return joinDate >= from && joinDate <= to;
//         });

//   const columns = [
//     { key: "id", header: "SL. NO" },
//     { key: "approval_status", header: "Approval Status" },
//     { key: "customer_id", header: "Customer Id" },
//     { key: "name", header: "Customer Name" },
//     { key: "phone_number", header: "Customer Phone Number" },
//     { key: "createdAt", header: "Joined On" },
//     { key: "action", header: "Action" },
//   ];

//   return (
//     <>
//       <div className="flex mt-20">
//         <Navbar
//           onGlobalSearchChangeHandler={GlobalSearchChangeHandler}
//           visibility={true}
//         />
//         <CustomAlertDialog
//           type={alertConfig.type}
//           isVisible={alertConfig.visibility}
//           message={alertConfig.message}
//           onClose={() =>
//             setAlertConfig((prev) => ({ ...prev, visibility: false }))
//           }
//         />
//         <div className="flex-grow p-7">
//           <h1 className="text-2xl font-semibold mb-6">
//             Report - Unverified Customers
//           </h1>

//           {/* 🔹 Filter Section */}
//           <div className="mt-6 mb-6 flex flex-wrap gap-6 items-end">
//             <div>
//               <label>Filter</label>
//               <Select
//                 showSearch
//                 popupMatchSelectWidth={false}
//                 onChange={handleSelectFilter}
//                 value={selectedLabel}
//                 placeholder="Search Or Select Filter"
//                 filterOption={(input, option) =>
//                   option.children
//                     .toString()
//                     .toLowerCase()
//                     .includes(input.toLowerCase())
//                 }
//                 className="w-full max-w-xs h-11"
//               >
//                 {groupOptions.map((time) => (
//                   <Select.Option key={time.value} value={time.value}>
//                     {time.label}
//                   </Select.Option>
//                 ))}
//               </Select>
//             </div>

//             {showFilterField && (
//               <div className="flex gap-4">
//                 <div>
//                   <label>From Date</label>
//                   <input
//                     type="date"
//                     value={selectedFromDate}
//                     onChange={(e) => setSelectedFromDate(e.target.value)}
//                     className="border border-gray-300 rounded px-4 py-2 shadow-sm outline-none w-full max-w-xs"
//                   />
//                 </div>
//                 <div>
//                   <label>To Date</label>
//                   <input
//                     type="date"
//                     value={selectedDate}
//                     onChange={(e) => setSelectedDate(e.target.value)}
//                     className="border border-gray-300 rounded px-4 py-2 shadow-sm outline-none w-full max-w-xs"
//                   />
//                 </div>
//               </div>
//             )}
//           </div>

//           {filteredByDate?.length > 0 && !isLoading ? (
//             <DataTable
//               catcher="_id"
//               data={filterOption(filteredByDate, searchText)}
//               columns={columns}
//               exportedPdfName="UnApproved Customers"
//               exportedFileName={`UnApproved_Customers.csv`}
//             />
//           ) : (
//             <CircularLoader
//               isLoading={isLoading}
//               failure={filteredByDate.length <= 0}
//               data="Customer Data"
//             />
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

const UnApprovedCustomerReport = () => {
  const [users, setUsers] = useState([]);
  const [TableUsers, setTableUsers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [alertConfig, setAlertConfig] = useState({
    visibility: false,
    message: "Something went wrong!",
    type: "info",
  });

  // 🔹 Date Filter States
  const [selectedLabel, setSelectedLabel] = useState("Today");
  const now = new Date();
  const todayString = now.toISOString().split("T")[0];
  const [selectedFromDate, setSelectedFromDate] = useState(todayString);
  const [selectedDate, setSelectedDate] = useState(todayString);
  const [showFilterField, setShowFilterField] = useState(false);

  // 🔹 Date Filter Options — ✅ Added "All"
  const groupOptions = [
    { label: "All", value: "All" }, // ✅ NEW OPTION
    { label: "Today", value: "Today" },
    { label: "Yesterday", value: "Yesterday" },
    { label: "This Month", value: "ThisMonth" },
    { label: "Last Month", value: "LastMonth" },
    { label: "This Year", value: "ThisYear" },
    { label: "Custom", value: "Custom" },
  ];

  const formatDate = (date) => date.toLocaleDateString("en-CA");

  const handleSelectFilter = (value) => {
    setSelectedLabel(value);
    setShowFilterField(false);

    const today = new Date();

    if (value === "All") {
      // ✅ Selecting "All" disables date filtering
      setSelectedFromDate(null);
      setSelectedDate(null);
      return;
    }

    if (value === "Today") {
      const formatted = formatDate(today);
      setSelectedFromDate(formatted);
      setSelectedDate(formatted);
    } else if (value === "Yesterday") {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const formatted = formatDate(yesterday);
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

  const GlobalSearchChangeHandler = (e) => {
    const { value } = e.target;
    setSearchText(value);
  };

  // 🔹 Fetch unapproved users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/user/approval-status/false");
        setUsers(response.data);

        const formattedData = response.data.map((group, index) => ({
          _id: group._id,
          id: index + 1,
          name: group.full_name,
          phone_number: group.phone_number,
          createdAt: group.createdAt?.split("T")[0],
          address: group.address?.replaceAll(",", " "),
          pincode: group.pincode,
          customer_id: group.customer_id,
          collection_area: group.collection_area?.route_name,
          approval_status:
            group.approval_status === "true" ? (
              <div className="inline-block px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full shadow-sm">
                Approved
              </div>
            ) : (
              <div className="inline-block px-3 py-1 text-sm font-medium text-red-800 bg-red-100 rounded-full shadow-sm">
                Pending
              </div>
            ),
          action: (
            <div className="flex justify-center gap-2">
              <Dropdown
                trigger={["click"]}
                menu={{
                  items: [
                    {
                      key: "3",
                      label: (
                        <div
                          onClick={() => handleEnrollmentRequestPrint(group?._id)}
                          className="text-blue-600"
                        >
                          Print
                        </div>
                      ),
                    },
                  ],
                }}
                placement="bottomLeft"
              >
                <IoMdMore className="text-bold" />
              </Dropdown>
            </div>
          ),
        }));
        setTableUsers(formattedData);
      } catch (error) {
        console.error("Error fetching user data:", error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [reloadTrigger]);

  // 🔹 Apply date filter on createdAt
  const filteredByDate =
    selectedLabel === "All"
      ? TableUsers // ✅ "All" shows all users
      : TableUsers.filter((user) => {
          const joinDate = new Date(user.createdAt);
          const from = new Date(selectedFromDate);
          const to = new Date(selectedDate);
          return joinDate >= from && joinDate <= to;
        });

  // Calculate summary data
  const totalUnapprovedCustomers = filteredByDate.length;
  
  // Count by Collection Area
  const collectionAreaCount = {};
  filteredByDate.forEach((item) => {
    const key = item.collection_area || "Unassigned";
    collectionAreaCount[key] = (collectionAreaCount[key] || 0) + 1;
  });

  // Calculate days between selected dates
  const calculateDaysBetween = () => {
    if (selectedLabel === "All") return 365; // Default to 365 days for "All"
    
    const fromDate = new Date(selectedFromDate);
    const toDate = new Date(selectedDate);
    const diffTime = Math.abs(toDate - fromDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end date
    return diffDays;
  };

  // Calculate average customers per day
  const avgCustomersPerDay = calculateDaysBetween() > 0 
    ? (totalUnapprovedCustomers / calculateDaysBetween()).toFixed(1) 
    : 0;

  // Calculate today's unapproved customers
  const todayUnapproved = TableUsers.filter(user => {
    const today = new Date().toISOString().split("T")[0];
    return user.createdAt === today;
  }).length;

  const columns = [
    { key: "id", header: "SL. NO" },
    { key: "approval_status", header: "Approval Status" },
    { key: "customer_id", header: "Customer Id" },
    { key: "name", header: "Customer Name" },
    { key: "phone_number", header: "Customer Phone Number" },
    { key: "createdAt", header: "Joined On" },
    { key: "action", header: "Action" },
  ];

  return (
    <>
      <div className="flex mt-20">
        <Navbar
          onGlobalSearchChangeHandler={GlobalSearchChangeHandler}
          visibility={true}
        />
        <CustomAlertDialog
          type={alertConfig.type}
          isVisible={alertConfig.visibility}
          message={alertConfig.message}
          onClose={() =>
            setAlertConfig((prev) => ({ ...prev, visibility: false }))
          }
        />
        <div className="flex-grow p-7">
          <h1 className="text-2xl font-semibold mb-6">
            Report - Unverified Customers
          </h1>

          {/* ENHANCED SUMMARY CARDS */}
          {filteredByDate.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Summary</h2>
              
              {/* TOTAL UNAPPROVED CUSTOMERS CARD */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-600 text-white p-6 rounded-xl shadow-lg mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm uppercase tracking-wide">
                      Total Unapproved Customers
                    </p>
                    <p className="text-3xl font-bold mt-1">{totalUnapprovedCustomers}</p>
                    <p className="text-red-100 text-sm mt-1">
                      {selectedLabel === "All" ? "All Time" : selectedLabel}
                    </p>
                  </div>
                  <div className="bg-white bg-opacity-20 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* SUMMARY GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                
                {/* COLLECTION AREA COUNT */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Collection Areas</h3>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {Object.keys(collectionAreaCount).length} Areas
                    </span>
                  </div>
                  <div className="space-y-3">
                    {Object.entries(collectionAreaCount)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 5)
                      .map(([area, count]) => (
                        <div key={area} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                            <span className="text-gray-700 text-sm truncate max-w-xs">{area}</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                              <div 
                                className="bg-blue-500 h-2 rounded-full" 
                                style={{ width: `${(count / totalUnapprovedCustomers) * 100}%` }}
                              ></div>
                            </div>
                            <span className="font-semibold text-gray-800 w-8 text-right">{count}</span>
                          </div>
                        </div>
                      ))}
                    {Object.keys(collectionAreaCount).length > 5 && (
                      <div className="text-center pt-2">
                        <button className="text-blue-600 text-sm font-medium">View All Areas</button>
                      </div>
                    )}
                  </div>
                </div>

                {/* TODAY'S UNAPPROVED */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Today's Unapproved</h3>
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {todayUnapproved} New
                    </span>
                  </div>
                  <div className="flex items-center justify-center py-4">
                    <div className="text-center">
                      <p className="text-5xl font-bold text-red-600">{todayUnapproved}</p>
                      <p className="text-gray-500 text-sm mt-2">Customers awaiting approval today</p>
                    </div>
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
                      <p className="font-semibold text-gray-800">{selectedLabel === "All" ? "All Time" : selectedLabel}</p>
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
                      <p className="text-gray-500 text-sm">Avg. Unapproved/Day</p>
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
                      <p className="text-gray-500 text-sm">Pending Approval Rate</p>
                      <p className="font-semibold text-gray-800">
                        {users.length > 0 
                          ? `${((totalUnapprovedCustomers / users.length) * 100).toFixed(1)}%`
                          : "0%"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 🔹 Filter Section */}
          <div className="mt-6 mb-6 flex flex-wrap gap-6 items-end">
            <div>
              <label>Filter</label>
              <Select
                showSearch
                popupMatchSelectWidth={false}
                onChange={handleSelectFilter}
                value={selectedLabel}
                placeholder="Search Or Select Filter"
                filterOption={(input, option) =>
                  option.children
                    .toString()
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                className="w-full max-w-xs h-11"
              >
                {groupOptions.map((time) => (
                  <Select.Option key={time.value} value={time.value}>
                    {time.label}
                  </Select.Option>
                ))}
              </Select>
            </div>

            {showFilterField && (
              <div className="flex gap-4">
                <div>
                  <label>From Date</label>
                  <input
                    type="date"
                    value={selectedFromDate}
                    onChange={(e) => setSelectedFromDate(e.target.value)}
                    className="border border-gray-300 rounded px-4 py-2 shadow-sm outline-none w-full max-w-xs"
                  />
                </div>
                <div>
                  <label>To Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="border border-gray-300 rounded px-4 py-2 shadow-sm outline-none w-full max-w-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {filteredByDate?.length > 0 && !isLoading ? (
            <DataTable
              catcher="_id"
              data={filterOption(filteredByDate, searchText)}
              columns={columns}
              exportedPdfName="UnApproved Customers"
              exportedFileName={`UnApproved_Customers.csv`}
            />
          ) : (
            <CircularLoader
              isLoading={isLoading}
              failure={filteredByDate.length <= 0}
              data="Customer Data"
            />
          )}
        </div>
      </div>
    </>
  );
};


export default UnApprovedCustomerReport;
