import React, { useEffect, useState, useMemo } from "react";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import CircularLoader from "../components/loaders/CircularLoader";
import { Select, Input } from "antd";
import Navbar from "../components/layouts/Navbar";
import filterOption from "../helpers/filterOption";
import { FaWhatsapp } from "react-icons/fa";
import { notification } from "antd";
import Sidebar from "../components/layouts/Sidebar";
import { FaUsers, FaCheckCircle } from "react-icons/fa";


const LeadReferredByWhatsappMessage = () => {
  const [searchText, setSearchText] = useState("");
  const [usersData, setUsersData] = useState([]);
  const [groupFilter, setGroupFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [activeUserData, setActiveUserData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [notifier, contextHolder] = notification.useNotification();
  const [selectAll, setSelectAll] = useState(false);
  const [auctionData, setAuctionData] = useState([]);
  const today = new Date();
  const todayString = today.toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayString);
  const [selectedLabel, setSelectedLabel] = useState("All");
  //const groupOptions = [...new Set(usersData.map((u) => u.groupName))];
  const groupOptions = [
    ...new Set(
      usersData
        .filter(
          (u) =>
            u.groupName !== undefined &&
            u.groupName !== "" &&
            u.groupName !== "   "
        )
        .map((u) => u.groupName)
    ),
  ];
  // const filteredUsers = useMemo(() => {
  //   const filtered = usersData.filter((u) => {
  //     const matchGroup = groupFilter ? u.groupName === groupFilter : true;
  //     const enrollmentDate = new Date(u.enrollmentDate);
  //     const filterEnrollDate = selectedDate === u.enrollDate
  //     const matchFromDate = fromDate
  //       ? enrollmentDate >= new Date(fromDate)
  //       : true;
  //     const matchToDate = toDate ? enrollmentDate <= new Date(toDate) : true;
  //     return matchGroup && matchFromDate && matchToDate && filterEnrollDate;
  //   });

  //   return filtered.map((user, index) => {
  //     const isSelected = !!activeUserData[user._id]?.info?.status;

  //     return {
  //       ...user,
  //       sl_no: index + 1,
  //       checkBoxs: (
  //         <input
  //           type="checkbox"
  //           checked={isSelected}
  //           onChange={(e) => {
  //             setActiveUserData((prev) => ({
  //               ...prev,
  //               [user._id]: {
  //                 info: {
  //                   status: e.target.checked,
  //                   leadPhone: user.leadPhone,
  //                   groupName: user.groupName,
  //                   userName: user.userName,
  //                   referredBy: user.referredBy,
  //                 },
  //               },
  //             }));
  //           }}
  //         />
  //       ),
  //       isSelected,
  //     };
  //   });
  // }, [
  //   usersData,
  //   groupFilter,
  //   fromDate,
  //   toDate,
  //   searchText,
  //   activeUserData,
  //   searchText,
  //   selectedDate
  // ]);

  //   const filteredUsers = useMemo(() => {
  //   const filtered = usersData.filter((u) => {
  //     const matchGroup = groupFilter ? u.groupName === groupFilter : true;
  //     const enrollmentDate = new Date(u.enrollmentDate);

  //     const matchSingleDate = selectedDate
  //       ? u.enrollDate === selectedDate
  //       : true;

  //     const matchFromDate = fromDate
  //       ? enrollmentDate >= new Date(fromDate)
  //       : true;

  //     const matchToDate = toDate
  //       ? enrollmentDate <= new Date(toDate)
  //       : true;

  //     return matchGroup && matchFromDate && matchToDate && matchSingleDate;
  //   });

  //   return filtered.map((user, index) => {
  //     const isSelected = !!activeUserData[user._id]?.info?.status;

  //     return {
  //       ...user,
  //       sl_no: index + 1,
  //       checkBoxs: (
  //         <input
  //           type="checkbox"
  //           checked={isSelected}
  //           onChange={(e) => {
  //             setActiveUserData((prev) => ({
  //               ...prev,
  //               [user._id]: {
  //                 info: {
  //                   status: e.target.checked,
  //                   leadPhone: user.leadPhone,
  //                   groupName: user.groupName,
  //                   userName: user.userName,
  //                   referredBy: user.referredBy,
  //                 },
  //               },
  //             }));
  //           }}
  //         />
  //       ),
  //       isSelected,
  //     };
  //   });
  // }, [
  //   usersData,
  //   groupFilter,
  //   fromDate,
  //   toDate,
  //   selectedDate,
  //   activeUserData,
  // ]);

  const filteredUsers = useMemo(() => {
    const filtered = usersData.filter((u) => {
      const matchGroup = groupFilter ? u.groupName === groupFilter : true;

      const matchSingleDate = selectedDate
        ? new Date(u.enrollDate).toISOString().split("T")[0] === selectedDate
        : true;

      const matchFromDate = fromDate
        ? new Date(u.enrollDate) >= new Date(fromDate)
        : true;

      const matchToDate = toDate
        ? new Date(u.enrollDate) <= new Date(toDate)
        : true;

      return matchGroup && matchFromDate && matchToDate && matchSingleDate;
    });

    return filtered.map((user, index) => {
      const isSelected = !!activeUserData[user._id]?.info?.status;

      return {
        ...user,
        sl_no: index + 1,
        checkBoxs: (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              setActiveUserData((prev) => ({
                ...prev,
                [user._id]: {
                  info: {
                    status: e.target.checked,
                    leadPhone: user.leadPhone,
                    groupName: user.groupName,
                    leadName: user.leadName,
                    referredBy: user.referredBy,
                  },
                },
              }));
            }}
          />
        ),
        isSelected,
      };
    });
  }, [usersData, groupFilter, fromDate, toDate, selectedDate, activeUserData]);

  const handleSelectFilter = (value) => {
    setSelectedLabel(value);

    const today = new Date();
    const formatDate = (date) => date.toLocaleDateString("en-CA");

    if (value === "Today") {
      setSelectedDate(formatDate(today));
      setFromDate("");
      setToDate("");
    } else if (value === "Yesterday") {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      setSelectedDate(formatDate(yesterday));
      setFromDate("");
      setToDate("");
    } else if (value === "TwoDaysAgo") {
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      setSelectedDate(formatDate(twoDaysAgo));
      setFromDate("");
      setToDate("");
    } else if (value === "ThisWeek") {
      const day = today.getDay(); // Sunday=0, Monday=1, ...
      const diffToMonday = day === 0 ? 6 : day - 1; // adjust if today is Sunday
      const monday = new Date(today);
      monday.setDate(today.getDate() - diffToMonday);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      setFromDate(formatDate(monday));
      setToDate(formatDate(sunday));
      setSelectedDate("");
    } else if (value === "LastWeek") {
      const day = today.getDay();
      const diffToMonday = day === 0 ? 6 : day - 1;
      const thisMonday = new Date(today);
      thisMonday.setDate(today.getDate() - diffToMonday);
      const lastMonday = new Date(thisMonday);
      lastMonday.setDate(thisMonday.getDate() - 7);
      const lastSunday = new Date(lastMonday);
      lastSunday.setDate(lastMonday.getDate() + 6);
      setFromDate(formatDate(lastMonday));
      setToDate(formatDate(lastSunday));
      setSelectedDate("");
    } else if (value === "ThisMonth") {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      setFromDate(formatDate(start));
      setToDate(formatDate(end));
      setSelectedDate("");
    } else if (value === "LastMonth") {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0);
      setFromDate(formatDate(start));
      setToDate(formatDate(end));
      setSelectedDate("");
    } else if (value === "ThisYear") {
      const start = new Date(today.getFullYear(), 0, 1);
      const end = new Date(today.getFullYear(), 11, 31);
      setFromDate(formatDate(start));
      setToDate(formatDate(end));
      setSelectedDate("");
    } else if (value === "All") {
      const start = new Date(2000, 0, 1);
      const end = today;
      setFromDate(formatDate(start));
      setToDate(formatDate(end));
      setSelectedDate("");
    } else if (value === "Custom") {
      // user selects manually → don’t override
    }
  };

  useEffect(() => {
    handleSelectFilter("All");
  }, []);

  const visibleSelectedCount = useMemo(() => {
    return filteredUsers.filter((user) => user.isSelected).length;
  }, [filteredUsers]);

  const sendWhatsapp = async () => {
    const key = "updatable";
    try {
      notifier.open({
        key,
        message: "Sending Messages Via Whatsapp..",
        description: "Processing...",
        className: "bg-green-300 rounded-lg font-bold",
        duration: 2,
      });

      const visibleActiveUsers = {};
      filteredUsers.forEach((user) => {
        if (user.isSelected && activeUserData[user._id]) {
          visibleActiveUsers[user._id] = activeUserData[user._id];
        }
      });

      const test = await api.post("/whatsapp/lead-referred-by-message", {
        receivers: visibleActiveUsers,
      });
      // console.info(test, "hghgfghgff");

      const newActiveUserData = { ...activeUserData };
      filteredUsers.forEach((user) => {
        if (user.isSelected) {
          delete newActiveUserData[user._id];
        }
      });
      setActiveUserData(newActiveUserData);

      notifier.open({
        key,
        message: "Whatsapp Messages Has Been Sent Successfully",
        description: "Success",
        className: "bg-green-300 rounded-lg font-bold",
        duration: 2,
      });
    } catch (err) {
      notifier.open({
        key,
        message: "Failed to Send Whatsapp",
        description: err.message || "Something went wrong",
        className: "bg-red-300 rounded-lg font-bold",
        duration: 2,
      });
    }
  };
  useEffect(() => {
    // Automatically update selectAll based on filteredUsers
    const allChecked =
      filteredUsers.length > 0 &&
      filteredUsers.every((user) => activeUserData[user._id]?.info?.status);
    setSelectAll(allChecked);
  }, [filteredUsers, activeUserData]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const reportResponse = await api.get("/lead/get-lead");

      const usersList = [];
      const tempActive = {};
      const data = reportResponse.data?.map((lead, index) => {
        const id = lead._id;
        //  const groupId = lead?.group_id;
        const leadName = lead?.lead_name;
        const leadPhone = lead?.lead_phone;
        const groupName = lead?.group_id?.group_name;
        const enrollDate = lead?.createdAt.split("T")[0];
        const referredBy = lead?.lead_agent?.name;

        tempActive[id] = {
          info: {
            status: false,
          },
        };

        const tempUsr = {
          _id: id,
          leadName,
          leadPhone,
          groupName,
          // groupId,
          enrollmentDate: lead?.group_id?.createdAt,
          enrollDate,
          referredBy,
          // leadenrollDate,
        };
        usersList.push(tempUsr);

        return {
          slNo: index + 1,
          groupName,
          leadName,
          leadPhone,
          //  groupId,
          referredBy,
          enrollDate,
        };
      });
      console.info(data, "jkgnsdkgjsbng");

      setAuctionData(data);
      setUsersData(usersList); // ✅ update usersData for filtering + checkboxes
      setActiveUserData(tempActive);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const Auctioncolumns = [
    { key: "sl_no", header: "SL. NO" },
    { key: "checkBoxs", header: "Select User" },
    { key: "leadName", header: "Lead Name" },
    { key: "leadPhone", header: "Phone Number" },
    { key: "enrollDate", header: "Joined on" },
    { key: "referredBy", header: "Referred By" },
    // { key: "customerId", header: "Customer Id" },
    { key: "groupName", header: "Group Name" },
    //  {key: "paymentsTicket", header: "Ticket"},
  ];

  return (
    <div className="w-screen">
      <div className="flex mt-30">
        <Navbar
          onGlobalSearchChangeHandler={(e) => setSearchText(e.target.value)}
          visibility={true}
        />
        <Sidebar />

        <div className="flex-grow p-7">
          <h1 className="text-2xl font-bold text-center mt-32">
            Lead ReferredBy Message
          </h1>
          {contextHolder}
          <div className="mt-6 mb-8">
            <div className="flex justify-start border-b border-gray-300 mb-4"></div>
            {isLoading ? (
              <div className="w-full">
                <CircularLoader color="text-green-600" />
              </div>
            ) : (
              <div className="mt-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8 mb-6">
  <div className="bg-blue-100 rounded-xl p-6 shadow flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-600">Total Customers</p>
      <p className="text-3xl font-bold text-blue-700">
        {filteredUsers.length}
      </p>
    </div>
    <FaUsers className="text-blue-600 text-4xl" />
  </div>

  <div className="bg-green-100 rounded-xl p-6 shadow flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-600">Selected Customers</p>
      <p className="text-3xl font-bold text-green-700">
        {visibleSelectedCount}
      </p>
    </div>
    <FaCheckCircle className="text-green-600 text-4xl" />
  </div>
</div>
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Group
                    </label>
                    <Select
                      style={{ width: 200 }}
                      allowClear
                      placeholder="--All groups--"
                      onChange={(value) => setGroupFilter(value)}
                      value={groupFilter || undefined}
                      className="w-full max-w-xs h-11 "
                    >
                      {groupOptions.map((group) => (
                        <Select.Option key={group} value={group}>
                          {group}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>

                  <div className="flex flex-col space-y-2 mb-5">
                    <label className="font-medium">Select Date Filter</label>
                    <select
                      className="border p-2 rounded text-sm"
                      value={selectedLabel}
                      onChange={(e) => handleSelectFilter(e.target.value)}
                    >
                      <option value="Today">Today</option>
                      <option value="Yesterday">Yesterday</option>
                      <option value="TwoDaysAgo">Two Days Ago</option>
                      <option value="ThisWeek">This Week</option>
                      <option value="LastWeek">Last Week</option>
                      <option value="ThisMonth">This Month</option>
                      <option value="LastMonth">Last Month</option>
                      <option value="ThisYear">This Year</option>
                      <option value="All">All</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </div>

                  {selectedLabel && (
                    <div className="mb-2">
                      <label>Date</label>
                      <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => {
                          setSelectedDate(e.target?.value?.split("T")[0]);
                        }}
                        className="border border-gray-300 rounded px-4 py-2 shadow-sm outline-none w-full max-w-xs"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-5">
                      Select All
                    </label>
                    <input
                      type="checkbox"
                      className="ml-4 w-4 h-4 mb-3"
                      checked={selectAll}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setSelectAll(checked); // Set global checkbox state

                        const updatedData = { ...activeUserData };

                        // Loop through all filtered users and apply the selection
                        filteredUsers.forEach((user) => {
                          updatedData[user._id] = {
                            info: {
                              status: checked,
                              leadPhone: user.leadPhone,
                              groupName: user.groupName,
                              leadName: user.leadName,
                              referredBy: user.referredBy,
                              // groupId: user.groupId?._id || user.groupId,
                              //  userId: user.userId,
                            },
                          };
                        });

                        setActiveUserData(updatedData);
                      }}
                    />
                  </div>
                </div>
                <div className="flex justify-end mb-4">
                  <button
                    onClick={sendWhatsapp}
                    className="relative bg-green-600 text-white px-4 py-2 rounded shadow-md hover:bg-green-700 transition duration-200 flex items-center"
                  >
                    {visibleSelectedCount > 0 && (
                      <div
                        className="min-w-6 h-6 absolute -right-3 -top-2 shadow-lg hover:bg-red-600 bg-red-400 rounded-full text-white flex items-center justify-center text-xs"
                        title={`Message will be sent to total ${visibleSelectedCount} customers`}
                      >
                        <span>{visibleSelectedCount}</span>
                      </div>
                    )}
                    <FaWhatsapp className="mr-2" size={20} />
                    WhatsApp
                  </button>
                </div>
                <DataTable
                  data={filteredUsers}
                  columns={Auctioncolumns}
                  catcher="_id"
                  exportedPdfName="Bid Winner"
                  printHeaderKeys={["Group Name"]}
                  printHeaderValues={[groupFilter]}
                  exportedFileName={`Bid Winner.csv`}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadReferredByWhatsappMessage;
