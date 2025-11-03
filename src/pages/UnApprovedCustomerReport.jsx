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
      // ✅ Selecting “All” disables date filtering
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
      ? TableUsers // ✅ “All” shows all users
      : TableUsers.filter((user) => {
          const joinDate = new Date(user.createdAt);
          const from = new Date(selectedFromDate);
          const to = new Date(selectedDate);
          return joinDate >= from && joinDate <= to;
        });

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
