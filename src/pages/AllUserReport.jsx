/* eslint-disable no-unused-vars */
import { useEffect, useState, useMemo, useCallback } from "react";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import CircularLoader from "../components/loaders/CircularLoader";
import { Select, message } from "antd";
import Navbar from "../components/layouts/Navbar";
import filterOption from "../helpers/filterOption";

const AllUserReport = () => {
  const [searchText, setSearchText] = useState("");
  const [screenLoading, setScreenLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usersData, setUsersData] = useState([]);
  const [filters, setFilters] = useState({
    groupFilter: "",
    fromDate: "",
    toDate: ""
  });

  const transformUserData = (userInfo, index) => {
    const groupInstall = parseInt(userInfo?.group_id?.group_install) || 0;
    const groupType = userInfo?.group_id?.group_type;
    const firstInstallment = userInfo?.group_id?.monthly_installment || 0;
    const totalPaidAmount = userInfo?.payments?.totalPaidAmount || 0;
    const auctionCount = parseInt(userInfo?.auctions?.counts) || 0;
    const totalPayable = userInfo?.auctions?.payable || 0;
    const totalProfit = userInfo?.auctions?.profit || 0;
    const firstDividentHead = userInfo?.auctions?.firstDiv || 0;

    return {
      sl_no: index + 1,
      _id: userInfo._id,
      userName: userInfo?.user_id?.full_name || "N/A",
      firstInstallment,
      userPhone: userInfo?.user_id?.phone_number || "N/A",
      customerId: userInfo?.user_id?.customer_id || "N/A",
      collectionArea: userInfo?.user_id?.collection_area?.route_name || "N/A",
      collectionExecutive: userInfo?.user_id?.collection_area?.agent_id
        ?.map(agent => agent.name).join(" | ") || "N/A",
      amountPaid: totalPaidAmount,
      firstInstallmentStatus: (Number(totalPaidAmount) - Number(firstInstallment)) > 0 ? "Paid" : "Not Paid",
      paymentsTicket: userInfo?.tickets || "N/A",
      groupValue: userInfo?.group_id?.group_value || 0,
      groupName: userInfo?.group_id?.group_name || "N/A",
      profit: totalProfit,
      relationshipManager: userInfo?.group_id?.relationship_manager?.name || "N/A",
      reffered_by: userInfo?.agent
        ? userInfo.agent?.name
        : userInfo?.referred_customer
          ? userInfo?.referred_customer?.full_name
          : "N/A",
      payment_type: userInfo?.payment_type || "N/A",
      referred_type: userInfo?.referred_type || "N/A",
      enrollmentDate: userInfo?.createdAt
        ? userInfo?.createdAt.split("T")[0]
        : "",
      totalToBePaid: groupType === "double"
        ? groupInstall * auctionCount + groupInstall
        : totalPayable + groupInstall + totalProfit,
      toBePaidAmount: groupType === "double"
        ? groupInstall * auctionCount + groupInstall
        : totalPayable + groupInstall + firstDividentHead,
      balance: groupType === "double"
        ? groupInstall * auctionCount + groupInstall - totalPaidAmount
        : totalPayable + groupInstall + firstDividentHead - totalPaidAmount,
      chit_asking_month: userInfo?.chit_asking_month || "N/A",
      status: userInfo?.auctions?.isPrized === "true" ? "Prized" : "Un Prized",
      statusDiv: userInfo?.auctions?.isPrized === "true" ? (
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full shadow-sm border border-green-300">
          <span className="font-semibold text-sm">Prized</span>
        </div>
      ) : (
        <div className="inline-flex items-center gap-2 bg-red-100 text-red-800 px-3 py-1 rounded-full shadow-sm border border-red-300">
          <span className="font-semibold text-sm">Un Prized</span>
        </div>
      ),
    };
  };

  // Memoize group options to prevent unnecessary recalculations
  const groupOptions = useMemo(() => 
    [...new Set(usersData.map((u) => u.groupName))], 
    [usersData]
  );

  // Memoize filtered users
  const filteredUsers = useMemo(() => {
    return filterOption(
      usersData.filter((u) => {
        const matchGroup = filters.groupFilter ? u.groupName === filters.groupFilter : true;
        const enrollmentDate = new Date(u.enrollmentDate);
        const matchFromDate = filters.fromDate
          ? enrollmentDate >= new Date(filters.fromDate)
          : true;
        const matchToDate = filters.toDate ? enrollmentDate <= new Date(filters.toDate) : true;
        return matchGroup && matchFromDate && matchToDate;
      }),
      searchText
    );
  }, [usersData, filters, searchText]);

  // Memoize totals calculation
  const totals = useMemo(() => {
    const totalCustomers = filteredUsers.length;
    const groupSet = new Set(filteredUsers.map((user) => user.groupName));
    const totalGroups = filters.groupFilter ? 1 : groupSet.size;

    const totalToBePaid = filteredUsers.reduce(
      (sum, u) => sum + (u.totalToBePaid || 0),
      0
    );
    const totalProfit = filteredUsers.reduce(
      (sum, u) => sum + (u.profit || 0),
      0
    );
    const totalPaid = filteredUsers.reduce(
      (sum, u) => sum + (u.amountPaid || 0),
      0
    );
    const totalBalance = filteredUsers.reduce(
      (sum, u) => sum + (u.balance || 0),
      0
    );

    return {
      totalCustomers,
      totalGroups,
      totalToBePaid,
      totalProfit,
      totalPaid,
      totalBalance,
    };
  }, [filteredUsers, filters.groupFilter]);

  // Handle filter changes
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setScreenLoading(true);
        setError(null);
        
        const reportResponse = await api.get("/user");
        const reportData = reportResponse.data.data.map(transformUserData);
        
        setUsersData(reportData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data. Please try again later.");
        message.error("Failed to load data. Please try again later.");
      } finally {
        setScreenLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Table columns
  const Auctioncolumns = [
    { key: "sl_no", header: "SL. NO" },
    { key: "customerId", header: "Customer Id" },
    { key: "userName", header: "Customer Name" },
    { key: "userPhone", header: "Phone Number" },
    { key: "groupName", header: "Group Name" },
    { key: "groupValue", header: "Group Value" },
    { key: "paymentsTicket", header: "Ticket" },
    { key: "enrollmentDate", header: "Enrollment Date" },
    { key: "referred_type", header: "Referred Type" },
    { key: "reffered_by", header: "Referred By" },
    { key: "chit_asking_month", header: "Chit Asking Month" },
    { key: "relationshipManager", header: "Relationship Manager" },
    { key: "payment_type", header: "Payment Type" },
    { key: "firstInstallment", header: "First Installment" },
    { key: "firstInstallmentStatus", header: "First Installment Status" },
    { key: "amountPaid", header: "Amount Paid" },
    { key: "totalToBePaid", header: "Amount to be Paid" },
    { key: "balance", header: "Balance" },
    { key: "collectionArea", header: "Collection Area" },
    { key: "collectionExecutive", header: "Collection Executive" },
    { key: "statusDiv", header: "Status" },
  ];

  const ExcelColumns = [
    { key: "sl_no", header: "SL. NO" },
    { key: "customerId", header: "Customer Id" },
    { key: "userName", header: "Customer Name" },
    { key: "userPhone", header: "Phone Number" },
    { key: "groupName", header: "Group Name" },
    { key: "groupValue", header: "Group Value" },
    { key: "paymentsTicket", header: "Ticket" },
    { key: "enrollmentDate", header: "Enrollment Date" },
    { key: "referred_type", header: "Referred Type" },
    { key: "reffered_by", header: "Referred By" },
    { key: "relationshipManager", header: "Relationship Manager" },
    { key: "payment_type", header: "Payment Type" },
    { key: "firstInstallment", header: "First Installment" },
    { key: "amountPaid", header: "Amount Paid" },
    { key: "totalToBePaid", header: "Amount to be Paid" },
    { key: "balance", header: "Balance" },
    { key: "collectionArea", header: "Collection Area" },
    { key: "collectionExecutive", header: "Collection Executive" },
    { key: "status", header: "Status" },
  ];

  return (
    <div className="w-screen">
      <div className="flex mt-30">
        <Navbar
          onGlobalSearchChangeHandler={(e) => setSearchText(e.target.value)}
          visibility={true}
        />
        {screenLoading ? (
          <div className="w-full flex justify-center items-center">
            <CircularLoader color="text-green-600" />
            <p className="ml-4">Loading user data...</p>
          </div>
        ) : error ? (
          <div className="w-full flex justify-center items-center p-8">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p>{error}</p>
              <button 
                className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-grow p-7">
            <h1 className="text-2xl font-bold text-center">
              Reports - All Customer
            </h1>

            <div className="mt-6 mb-8">
              <div className="mt-6 mb-8">
                <div className="flex justify-start border-b mb-4"></div>
                <div className="mt-10">
                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Group Filter
                      </label>
                      <Select
                        style={{ width: 200 }}
                        allowClear
                        placeholder="--All groups--"
                        onChange={(value) => handleFilterChange("groupFilter", value)}
                        value={filters.groupFilter || undefined}
                      >
                        {groupOptions.map((group) => (
                          <Select.Option key={group} value={group}>
                            {group}
                          </Select.Option>
                        ))}
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        From Date
                      </label>
                      <input
                        type="date"
                        value={filters.fromDate}
                        onChange={(e) => handleFilterChange("fromDate", e.target.value)}
                        className="border rounded px-2 py-1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        To Date
                      </label>
                      <input
                        type="date"
                        value={filters.toDate}
                        onChange={(e) => handleFilterChange("toDate", e.target.value)}
                        className="border rounded px-2 py-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mt-8 mb-8">
                    <div className="flex flex-col border p-4 rounded shadow">
                      <span className="text-xl font-bold text-gray-700">
                        Total Customers
                      </span>
                      <span className="text-lg font-bold text-blue-600">
                        {totals.totalCustomers}
                      </span>
                    </div>
                    <div className="flex flex-col border p-4 rounded shadow">
                      <span className="text-xl font-bold text-gray-700">
                        Total Groups
                      </span>
                      <span className="text-lg font-bold text-green-600">
                        {totals.totalGroups}
                      </span>
                    </div>
                    <div className="flex flex-col border p-4 rounded shadow">
                      <span className="text-xl font-bold text-gray-700">
                        Amount to be Paid
                      </span>
                      <span className="text-lg font-bold text-blue-600">
                        ₹{totals.totalToBePaid.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex flex-col border p-4 rounded shadow">
                      <span className="text-xl font-bold text-gray-700">
                        Total Profit
                      </span>
                      <span className="text-lg font-bold text-green-600">
                        ₹{totals.totalProfit.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex flex-col border p-4 rounded shadow">
                      <span className="text-xl font-semibold text-gray-700">
                        Total Amount Paid
                      </span>
                      <span className="text-lg font-bold text-indigo-600">
                        ₹{totals.totalPaid.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex flex-col border p-4 rounded shadow">
                      <span className="text-xl font-bold text-gray-700">
                        Total Balance
                      </span>
                      <span className="text-lg font-bold text-red-600">
                        ₹{totals.totalBalance.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                  <DataTable
                    data={filteredUsers}
                    columns={Auctioncolumns}
                    exportCols={ExcelColumns}
                    exportedPdfName={`All Customer Report`}
                    printHeaderKeys={[
                      "From Date",
                      "Group Name",
                      "To Date",
                      "Total Customers",
                      "Total Groups",
                      "Amount to be Paid",
                      "Total Profit",
                      "Total Amount Paid",
                      "Total Balance",
                    ]}
                    printHeaderValues={[
                      filters.fromDate
                        ? new Date(filters.fromDate).toLocaleDateString("en-GB")
                        : "—",
                      filters.groupFilter || "All Groups",
                      filters.toDate
                        ? new Date(filters.toDate).toLocaleDateString("en-GB")
                        : "—",
                      totals.totalCustomers,
                      totals.totalGroups,
                      `₹${totals.totalToBePaid.toLocaleString("en-IN")}`,
                      `₹${totals.totalProfit.toLocaleString("en-IN")}`,
                      `₹${totals.totalPaid.toLocaleString("en-IN")}`,
                      `₹${totals.totalBalance.toLocaleString("en-IN")}`,
                    ]}
                    exportedFileName={`CustomerReport.csv`}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllUserReport;