/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import api from "../instance/TokenInstance";
import Modal from "../components/modals/Modal";
import { Select, Dropdown } from "antd";
import DataTable from "../components/layouts/Datatable";
import CustomAlert from "../components/alerts/CustomAlert";
import CircularLoader from "../components/loaders/CircularLoader";
import Navbar from "../components/layouts/Navbar";
import filterOption from "../helpers/filterOption";
import { IoMdMore } from "react-icons/io";
import { Link } from "react-router-dom";
import {
  FiFilter,
  FiCalendar,
  FiUsers,
  FiCreditCard,
} from "react-icons/fi";

const CollectionExecutiveReport = () => {
  const [groups, setGroups] = useState([]);
  const [TableDaybook, setTableDaybook] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [selectedAuctionGroupId, setSelectedAuctionGroupId] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredAuction, setFilteredAuction] = useState([]);
  const [groupInfo, setGroupInfo] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [showModalUpdate, setShowModalUpdate] = useState(false);
  const [currentUpdateGroup, setCurrentUpdateGroup] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [receiptNo, setReceiptNo] = useState("");
  const [paymentMode, setPaymentMode] = useState("cash");
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showFilterField, setShowFilterField] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("Today");

  const now = new Date();
  const onGlobalSearchChangeHandler = (e) => {
    setSearchText(e.target.value);
  };
  const todayString = now.toISOString().split("T")[0];
  const [selectedFromDate, setSelectedFromDate] = useState(todayString);
  const [selectedDate, setSelectedDate] = useState(todayString);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState("");
  const [hideAccountType, setHideAccountType] = useState("");
  const [selectedAccountType, setSelectedAccountType] = useState("");
  const [selectedCustomers, setSelectedCustomers] = useState("");
  const [selectedCollectionExecutive, setSelectedCollectionExecutive] = useState("");
  const [payments, setPayments] = useState([]);
  const [showAllPaymentModes, setShowAllPaymentModes] = useState(false);
  const [employees,setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    group_id: "",
    user_id: "",
    ticket: "",
    receipt_no: "",
    pay_date: "",
    amount: "",
    pay_type: "cash",
    transaction_id: "",
    collection_executive:"",
  });
  const [alertConfig, setAlertConfig] = useState({
    visibility: false,
    message: "Something went wrong!",
    type: "info",
  });
  const handleModalClose = () => setShowUploadModal(false);

  useEffect(() => {
    const user = localStorage.getItem("user");
    const userObj = JSON.parse(user);

    if (
      userObj &&
      userObj.admin_access_right_id?.access_permissions?.edit_payment
    ) {
      const showPaymentsModes =
        userObj.admin_access_right_id?.access_permissions?.edit_payment ===
        "true"
          ? true
          : false;
      setShowAllPaymentModes(showPaymentsModes);
    }
  }, []);

  useEffect(() => {
    const user = localStorage.getItem("user");
    const userObj = JSON.parse(user);

    if (
      userObj &&
      userObj.admin_access_right_id?.access_permissions?.edit_payment
    ) {
      const isModify =
        userObj.admin_access_right_id?.access_permissions?.edit_payment ===
        "true"
          ? true
          : false;
      setHideAccountType(isModify);
    }
  }, []);
  useEffect(() => {
    (async () => {
      try {
        const [emplys] = await Promise.all([
          api.get("/agent/collection-executive"),
        
        ]);
        const emps = emplys?.data?.collectionExecutive.map((emp) => ({
          _id: emp?._id?._id,
          full_name: emp?._id?.name,
          phone_number: emp?._id?.phone_number,
          selected_type: "agent_type",
        }));
        setEmployees(emps);
       
      } catch (error) {
     
        setEmployees([]);
      }
    })();
  }, []);
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await api.get("/group/get-group-admin");
        setGroups(response.data);
      } catch (error) {
        console.error("Error fetching group data:", error);
      }
    };
    fetchGroups();
  }, []);

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const response = await api.get("/payment/get-latest-receipt");
        setReceiptNo(response.data);
      } catch (error) {
        console.error("Error fetching receipt data:", error);
      }
    };
    fetchReceipt();
  }, []);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await api.get("/user/get-user");
        setFilteredUsers(response.data);
      } catch (error) {
        console.error("Error fetching group data:", error);
      }
    };
    fetchGroups();
  }, []);

  useEffect(() => {
    if (receiptNo) {
      setFormData((prevData) => ({
        ...prevData,
        receipt_no: receiptNo.receipt_no,
      }));
    }
  }, [receiptNo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleChangeUser = (e) => {
    const { name, value } = e.target;
    const [user_id, ticket] = value.split("-");
    setFormData((prevData) => ({
      ...prevData,
      user_id,
      ticket,
    }));
  };

  const handleGroup = async (event) => {
    const groupId = event.target.value;
    setSelectedGroupId(groupId);
    setFormData((prevFormData) => ({
      ...prevFormData,
      group_id: groupId,
    }));

    handleGroupChange(groupId);

    if (groupId) {
      try {
        const response = await api.get(`/group/get-by-id-group/${groupId}`);
        setGroupInfo(response.data || {});
      } catch (error) {
        console.error("Error fetching group data:", error);
        setGroupInfo({});
      }
    } else {
      setGroupInfo({});
    }
  };

  const groupOptions = [
    { value: "Today", label: "Today" },
    { value: "Yesterday", label: "Yesterday" },
    { value: "ThisMonth", label: "This Month" },
    { value: "LastMonth", label: "Last Month" },
    { value: "ThisYear", label: "This Year" },
    { value: "Custom", label: "Custom" },
  ];

  const handleGroupPayment = async (groupId) => {
    setSelectedAuctionGroupId(groupId);
  };

  const handleSelectFilter = (value) => {
    setSelectedLabel(value);
    setShowFilterField(false);

    const today = new Date();
    const formatDate = (date) => date.toLocaleDateString("en-CA");

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

  const formatPayDate = (dateString) => {
    const date = new Date(dateString);
    const options = { day: "numeric", month: "long", year: "numeric" };
    return date.toLocaleDateString("en-US", options).replace(",", "");
  };

  useEffect(() => {
    const abortController = new AbortController();
    const fetchPayments = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/payment/collection/report`, {
          params: {
            from_date: selectedFromDate,
            to_date: selectedDate,
            groupId: selectedAuctionGroupId,
            userId: selectedCustomers,
            pay_type: selectedPaymentMode,
            account_type: selectedAccountType,
            collection_executive:selectedCollectionExecutive
          },
          signal: abortController.signal,
        });
        console.info(response.data, "testing account type");
        if (response.data && response.data.length > 0) {
          const validPayments = response.data.filter(
            (payment) => payment.group_id !== null
          );

          setFilteredAuction(validPayments);

          const totalAmount = validPayments.reduce(
            (sum, payment) => sum + Number(payment.amount || 0),
            0
          );
          console.info(totalAmount, "check amount");
          setPayments(totalAmount);

          const formattedData = validPayments.map((group, index) => ({
            _id: group?._id,
            id: index + 1,
            date: group?.pay_date,
            group: group?.group_id?.group_name || group.pay_for,
            name: group?.user_id?.full_name,
            category: group?.pay_for || "Chit",
            phone_number: group?.user_id?.phone_number,
            receipt_no: group?.receipt_no,
            old_receipt_no: group?.old_receipt_no,
            ticket: group?.ticket,
            amount: group?.amount,
            transaction_date: group?.createdAt?.split("T")?.[0],
            mode: group?.pay_type,
            account_type: group?.account_type,
            collected_by:
              group?.collected_by?.name ||
              group?.admin_type?.admin_name ||
              "Super Admin",
            action: (
              <div className="flex justify-center gap-2">
                <Dropdown
                  trigger={["click"]}
                  menu={{
                    items: [
                      {
                        key: "1",
                        label: (
                          <Link
                            target="_blank"
                            to={`/print/${group._id}`}
                            className="text-blue-600 "
                          >
                            Print
                          </Link>
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

          setTableDaybook(formattedData);
        } else {
          setFilteredAuction([]);
        }
      } catch (error) {
        console.error("Error fetching payment data:", error);
        setFilteredAuction([]);
        setPayments(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
    return () => {
      abortController.abort();
    };
  }, [
    selectedAuctionGroupId,
    selectedDate,
    selectedPaymentMode,
    selectedCustomers,
    selectedFromDate,
    selectedAccountType,
    selectedCollectionExecutive
  ]);

  const columns = [
    { key: "id", header: "SL. NO" },
    { key: "date", header: "Paid Date" },
    { key: "transaction_date", header: "Transaction Date" },
    { key: "group", header: "Group Name" },
    { key: "name", header: "Customer Name" },
    { key: "category", header: "Category" },
    { key: "phone_number", header: "Customer Phone Number" },
    { key: "receipt_no", header: "Receipt Number" },
    { key: "old_receipt_no", header: "Old Receipt" },
    { key: "ticket", header: "Ticket" },
    { key: "amount", header: "Amount" },
    { key: "mode", header: "Payment Mode" },
    ...(hideAccountType
      ? [{ key: "account_type", header: "Account Type" }]
      : []),
    { key: "collected_by", header: "Collected By" },
   
    { key: "action", header: "Action" },
  ];

  useEffect(() => {
    if (groupInfo && formData.bid_amount) {
      const commission = (groupInfo.group_value * 5) / 100 || 0;
      const win_amount =
        (groupInfo.group_value || 0) - (formData.bid_amount || 0);
      const divident = (formData.bid_amount || 0) - commission;
      const divident_head = groupInfo.group_members
        ? divident / groupInfo.group_members
        : 0;
      const payable = (groupInfo.group_install || 0) - divident_head;

      setFormData((prevData) => ({
        ...prevData,
        group_id: groupInfo._id,
        commission,
        win_amount,
        divident,
        divident_head,
        payable,
      }));
    }
  }, [groupInfo, formData.bid_amount]);

  const handlePaymentModeChange = (e) => {
    const selectedMode = e.target.value;
    setPaymentMode(selectedMode);
    setFormData((prevData) => ({
      ...prevData,
      pay_type: selectedMode,
      transaction_id: selectedMode === "online" ? prevData.transaction_id : "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/payment/add-payment", formData);
      if (response.status === 201) {
        alert("Payment Added Successfully");
        setShowModal(false);
      }
    } catch (error) {
      console.error("Error submitting payment data:", error);
    }
  };

  const handleDeleteModalOpen = async (groupId) => {
    try {
      const response = await api.get(`/payment/get-payment-by-id/${groupId}`);
      setCurrentGroup(response.data);
      setShowModalDelete(true);
    } catch (error) {
      console.error("Error fetching enroll:", error);
    }
  };

  const handleDeleteAuction = async () => {
    if (currentGroup) {
      try {
        await api.delete(`/payment/delete-payment/${currentGroup._id}`);
        alert("Payment deleted successfully");
        setShowModalDelete(false);
        setCurrentGroup(null);
        window.location.reload();
      } catch (error) {
        console.error("Error deleting auction:", error);
      }
    }
  };

  const handleUpdateModalOpen = async (groupId) => {
    try {
      const response = await api.get(`/auction/get-auction-by-id/${groupId}`);
      setCurrentUpdateGroup(response.data);
      setShowModalUpdate(true);
    } catch (error) {
      console.error("Error fetching auction:", error);
    }
  };

  const handleFileSubmit = async (e) => {
    e.preventDefault();

    const formDatas = new FormData();
    const fileInput = e.target.file;
    if (fileInput && fileInput.files[0]) {
      formDatas.append("file", fileInput.files[0]);

      try {
        const response = await api.post(`/payment/payment-excel`, formDatas, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (response.status === 200) {
          alert("File uploaded successfully!");
          window.location.reload();
          setShowUploadModal(false);
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        alert("Failed to upload file.");
      }
    } else {
      alert("Please select a file to upload.");
    }
  };

  return (
    <>
      <div className="min-w-screen bg-gray-50 min-h-screen">
        <div className="flex mt-30">
          <Navbar
            onGlobalSearchChangeHandler={onGlobalSearchChangeHandler}
            visibility={true}
          />
          <CustomAlert
            type={alertConfig.type}
            isVisible={alertConfig.visibility}
            message={alertConfig.message}
          />
          <div className="flex-grow p-6 lg:p-8">
            {/* Header Section */}
            <div className="mb-8 pb-6 border-b border-gray-200">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Collection Executive Report
              </h1>
              <p className="text-gray-600 text-sm">
                View and manage collection reports with advanced filters
              </p>
            </div>

            {/* Filters Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <FiFilter className="text-blue-600" size={20} />
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {/* Filter Option */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiCalendar className="inline mr-2" />
                    Filter Option
                  </label>
                  <Select
                    showSearch
                    popupMatchSelectWidth={false}
                    onChange={handleSelectFilter}
                    value={selectedLabel}
                    placeholder="Select Filter"
                    filterOption={(input, option) =>
                      option.children
                        .toString()
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    className="w-full"
                    size="large"
                  >
                    {groupOptions.map((time) => (
                      <Select.Option key={time.value} value={time.value}>
                        {time.label}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Collection Executive
                  </label>
                  <Select
                    showSearch
                    popupMatchSelectWidth={false}
                    value={selectedCollectionExecutive || null}
                    filterOption={(input, option) =>
                      option.children
                        .toString()
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    placeholder="Select Collection Executive"
                    onChange={(groupId) => setSelectedCollectionExecutive(groupId)}
                    className="w-full"
                    size="large"
                  >
                  
                    {employees.map((group) => (
                      <Select.Option key={group?._id} value={group?._id}>
                        {group?.full_name} - {group.phone_number}
                      </Select.Option>
                    ))}
                  </Select>
                </div>

                {/* Custom Date Range */}
                {showFilterField && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        From Date
                      </label>
                      <input
                        type="date"
                        value={selectedFromDate}
                        onChange={(e) => setSelectedFromDate(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        To Date
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </>
                )}

                {/* Group Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiUsers className="inline mr-2" />
                    Group
                  </label>
                  <Select
                    showSearch
                    popupMatchSelectWidth={false}
                    value={selectedAuctionGroupId}
                    onChange={handleGroupPayment}
                    placeholder="Select Group"
                    filterOption={(input, option) =>
                      option.children
                        .toString()
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    className="w-full"
                    size="large"
                  >
                    <Select.Option value={""}>All</Select.Option>
                    {groups.map((group) => (
                      <Select.Option key={group._id} value={group._id}>
                        {group.group_name}
                      </Select.Option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer
                  </label>
                  <Select
                    showSearch
                    popupMatchSelectWidth={false}
                    value={selectedCustomers}
                    filterOption={(input, option) =>
                      option.children
                        .toString()
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    placeholder="Select Customer"
                    onChange={(groupId) => setSelectedCustomers(groupId)}
                    className="w-full"
                    size="large"
                  >
                    <Select.Option value="">All</Select.Option>
                    {filteredUsers.map((group) => (
                      <Select.Option key={group?._id} value={group?._id}>
                        {group?.full_name} - {group.phone_number}
                      </Select.Option>
                    ))}
                  </Select>
                </div>

                {/* Payment Mode Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiCreditCard className="inline mr-2" />
                    Payment Mode
                  </label>
                  <Select
                    value={selectedPaymentMode}
                    showSearch
                    placeholder="Select Payment Mode"
                    popupMatchSelectWidth={false}
                    onChange={(groupId) => setSelectedPaymentMode(groupId)}
                    filterOption={(input, option) =>
                      option.children
                        .toString()
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    className="w-full"
                    size="large"
                  >
                    <Select.Option value="">All</Select.Option>
                    <Select.Option value="cash">Cash</Select.Option>
                    <Select.Option value="online">Online</Select.Option>
                  </Select>
                </div>

                {/* Account Type Filter */}
                {showAllPaymentModes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Type
                    </label>
                    <Select
                      value={selectedAccountType}
                      showSearch
                      placeholder="Select Account Type"
                      popupMatchSelectWidth={false}
                      onChange={(groupId) => setSelectedAccountType(groupId)}
                      filterOption={(input, option) =>
                        option.children
                          .toString()
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      className="w-full"
                      size="large"
                    >
                      <Select.Option value="">All</Select.Option>
                      <Select.Option value="suspense">Suspense</Select.Option>
                      <Select.Option value="credit">Credit</Select.Option>
                      <Select.Option value="adjustment">
                        Adjustment
                      </Select.Option>
                      <Select.Option value="others">Others</Select.Option>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-md border border-gray-100 p-6 mb-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <p className="text-sm font-semibold text-gray-500 tracking-wide uppercase">
                    Total Amount
                  </p>
                  <p className="text-4xl font-extrabold text-gray-900 mt-1">
                    ₹{payments || 0}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Updated as of {new Date().toLocaleDateString()}
                  </p>
                </div>

                <div className="relative"></div>
              </div>
            </div>

            {/* Data Table Section */}
            {filteredAuction && filteredAuction.length > 0 && !isLoading ? (
              <div>
                <DataTable
                  data={filterOption(TableDaybook, searchText)}
                  columns={columns}
                  exportedPdfName={`Receipt Report`}
                  exportedFileName={`Collection Executive Report.csv`}
                />
                <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">
                      Total Amount:
                    </span>
                    <span className="text-xl font-bold text-gray-900">
                      ₹{payments}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
                <CircularLoader
                  isLoading={isLoading}
                  failure={filteredAuction.length <= 0}
                  data="Collection Executive Report Data"
                />
              </div>
            )}
          </div>
          <Modal isVisible={showModal} onClose={() => setShowModal(false)}>
            <div className="py-6 px-5 lg:px-8 text-left">
              <h3 className="mb-4 text-xl font-bold text-gray-900">
                Add Payment
              </h3>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="w-full">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="category"
                  >
                    Group
                  </label>
                  <select
                    value={selectedGroupId}
                    onChange={handleGroup}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                  >
                    <option value="">Select Group</option>
                    {groups.map((group) => (
                      <option key={group._id} value={group._id}>
                        {group.group_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-full">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="category"
                  >
                    Customers
                  </label>
                  <select
                    name="user_id"
                    value={`${formData.user_id}-${formData.ticket}`}
                    onChange={handleChangeUser}
                    required
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                  >
                    <option value="">Select Customer</option>
                    {filteredUsers.map((user) => (
                      <option
                        key={`${user?.user_id?._id}-${user.tickets}`}
                        value={`${user?.user_id?._id}-${user.tickets}`}
                      >
                        {user?.user_id?.full_name} | {user.tickets}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-row justify-between space-x-4">
                  <div className="w-1/2">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="group_value"
                    >
                      Receipt No.
                    </label>
                    <input
                      type="text"
                      name="receipt_no"
                      value={formData.receipt_no}
                      id="receipt_no"
                      placeholder="Receipt No."
                      readOnly
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                    />
                  </div>
                  <div className="w-1/2">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="group_install"
                    >
                      Payment Date
                    </label>
                    <input
                      type="date"
                      name="pay_date"
                      value={formData.pay_date}
                      id="pay_date"
                      onChange={handleChange}
                      placeholder=""
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                    />
                  </div>
                </div>
                <div className="flex flex-row justify-between space-x-4">
                  <div className="w-1/2">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="group_value"
                    >
                      Amount
                    </label>
                    <input
                      type="text"
                      name="amount"
                      value={formData.amount}
                      id="amount"
                      onChange={handleChange}
                      placeholder="Enter Amount"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                    />
                  </div>
                  <div className="w-1/2">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="pay_mode"
                    >
                      Payment Mode
                    </label>
                    <select
                      name="pay_mode"
                      id="pay_mode"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                      onChange={handlePaymentModeChange}
                    >
                      <option value="cash">Cash</option>
                      <option value="online">Online</option>
                    </select>
                  </div>
                </div>
                {paymentMode === "online" && (
                  <div className="w-full mt-4">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="transaction_id"
                    >
                      Transaction ID
                    </label>
                    <input
                      type="text"
                      name="transaction_id"
                      id="transaction_id"
                      value={formData.transaction_id}
                      onChange={handleChange}
                      placeholder="Enter Transaction ID"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                    />
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full text-white bg-blue-700 hover:bg-blue-800
                              focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                  Add
                </button>
              </form>
            </div>
          </Modal>
          <Modal
            isVisible={showModalUpdate}
            onClose={() => setShowModalUpdate(false)}
          >
            <div className="py-6 px-5 lg:px-8 text-left">
              <h3 className="mb-4 text-xl font-bold text-gray-900">
                View Auction
              </h3>
              <form className="space-y-6" onSubmit={() => {}}>
                <div>
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="email"
                  >
                    Group
                  </label>
                  <input
                    type="text"
                    name="group_id"
                    value={currentUpdateGroup?.group_id?.group_name}
                    onChange={() => {}}
                    id="name"
                    placeholder="Enter the Group Name"
                    readOnly
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                  />
                </div>
                <div className="flex flex-row justify-between space-x-4">
                  <div className="w-1/2">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="group_value"
                    >
                      Group Value
                    </label>
                    <input
                      type="text"
                      name="group_value"
                      value={currentUpdateGroup?.group_id?.group_value}
                      id="group_value"
                      placeholder="select group to check"
                      readOnly
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                    />
                  </div>
                  <div className="w-1/2">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="group_install"
                    >
                      Group Installment
                    </label>
                    <input
                      type="text"
                      name="group_install"
                      value={currentUpdateGroup?.group_id?.group_install}
                      id="group_install"
                      placeholder="select group to check"
                      readOnly
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                    />
                  </div>
                </div>
                <div>
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="email"
                  >
                    User
                  </label>
                  <input
                    type="text"
                    name="group_id"
                    value={`${currentUpdateGroup?.user_id?.full_name} | ${currentUpdateGroup?.ticket}`}
                    onChange={() => {}}
                    id="name"
                    placeholder="Enter the User Name"
                    readOnly
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                  />
                </div>

                <div>
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="email"
                  >
                    Bid Amount
                  </label>
                  <input
                    type="number"
                    name="bid_amount"
                    value={
                      currentUpdateGroup?.group_id?.group_value -
                      currentUpdateGroup?.win_amount
                    }
                    onChange={() => {}}
                    id="name"
                    placeholder="Enter the Bid Amount"
                    readOnly
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                  />
                </div>
                <div className="flex flex-row justify-between space-x-4">
                  <div className="w-1/2">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="group_value"
                    >
                      Commission
                    </label>
                    <input
                      type="text"
                      name="commission"
                      value={currentUpdateGroup?.commission}
                      id="commission"
                      placeholder=""
                      readOnly
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                    />
                  </div>
                  <div className="w-1/2">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="group_install"
                    >
                      Winning Amount
                    </label>
                    <input
                      type="text"
                      name="win_amount"
                      value={currentUpdateGroup?.win_amount}
                      id="win_amount"
                      placeholder=""
                      readOnly
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                    />
                  </div>
                </div>
                <div className="flex flex-row justify-between space-x-4">
                  <div className="w-1/2">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="group_value"
                    >
                      Divident
                    </label>
                    <input
                      type="text"
                      name="divident"
                      value={currentUpdateGroup?.divident}
                      id="divident"
                      placeholder=""
                      readOnly
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                    />
                  </div>
                  <div className="w-1/2">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="group_install"
                    >
                      Divident per Head
                    </label>
                    <input
                      type="text"
                      name="divident_head"
                      value={currentUpdateGroup?.divident_head}
                      id="divident_head"
                      placeholder=""
                      readOnly
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                    />
                  </div>
                  <div className="w-1/2">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="group_install"
                    >
                      Next Payable
                    </label>
                    <input
                      type="text"
                      name="payable"
                      value={currentUpdateGroup?.payable}
                      id="payable"
                      placeholder=""
                      readOnly
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                    />
                  </div>
                </div>
                <div className="flex flex-row justify-between space-x-4">
                  <div className="w-1/2">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="date"
                    >
                      Auction Date
                    </label>
                    <input
                      type="date"
                      name="auction_date"
                      value={currentUpdateGroup?.auction_date}
                      onChange={() => {}}
                      id="date"
                      placeholder="Enter the Date"
                      readOnly
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                    />
                  </div>
                  <div className="w-1/2">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="date"
                    >
                      Next Date
                    </label>
                    <input
                      type="date"
                      name="next_date"
                      value={currentUpdateGroup?.next_date}
                      onChange={() => {}}
                      id="date"
                      placeholder="Enter the Date"
                      readOnly
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                    />
                  </div>
                </div>
              </form>
            </div>
          </Modal>
          <Modal
            isVisible={showModalDelete}
            onClose={() => {
              setShowModalDelete(false);
              setCurrentGroup(null);
            }}
          >
            <div className="py-6 px-5 lg:px-8 text-left">
              <h3 className="mb-4 text-xl font-bold text-gray-900">
                Sure want to delete this Payment ?
              </h3>
              {currentGroup && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleDeleteAuction();
                  }}
                  className="space-y-6"
                >
                  <button
                    type="submit"
                    className="w-full text-white bg-red-700 hover:bg-red-800
                    focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                  >
                    Delete
                  </button>
                </form>
              )}
            </div>
          </Modal>
        </div>
      </div>
    </>
  );
};

export default CollectionExecutiveReport;
