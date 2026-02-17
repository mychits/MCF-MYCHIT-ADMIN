import { useEffect, useState } from "react";
import axios from "axios";
import { notification, Form, Input, DatePicker, Button, Select, Tabs } from "antd";
import { Link } from "react-router-dom";
import Sidebar from "../components/layouts/Sidebar";
import Navbar from "../components/layouts/Navbar";
import { NavbarMenu } from "../data/menu";
import Modal from "../components/modals/Modal";
import API from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import CircularLoader from "../components/loaders/CircularLoader";
import dayjs from "dayjs";

import { Phone, Mail, MessageCircle, Headset, Clock, MapPin } from "lucide-react";

const { Option } = Select;

// ✅ Helper Component for Status Badge (Used in Table)
const CallStatusBadge = ({ status }) => {
  let colorClass = "bg-gray-100 text-gray-700 border-gray-200";
  let icon = "";

  switch (status) {
    case "Hot":
      colorClass = "bg-red-100 text-red-700 border-red-200";
      icon = "🔥";
      break;
    case "Cold":
      colorClass = "bg-blue-100 text-blue-700 border-blue-200";
      icon = "❄️";
      break;
    case "Emergency":
      colorClass = "bg-orange-100 text-orange-700 border-orange-200";
      icon = "🚨";
      break;
    default:
      break;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${colorClass}`}>
      {icon} {status}
    </span>
  );
};

function HelpAndSupport() {
  const [api, contextHolder] = notification.useNotification();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const [enquiries, setEnquiries] = useState([]);
  const [loadingEnquiries, setLoadingEnquiries] = useState(false);

  const [users, setUsers] = useState([]);
  const [customerEnrollments, setCustomerEnrollments] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [adminName, setAdminName] = useState("");

  const [customerType, setCustomerType] = useState("new");
  const [activeTab, setActiveTab] = useState(null);

  // ✅ Tab State for Filtering Enquiries
  const [enquiryTab, setEnquiryTab] = useState("all"); // 'all', 'new', 'existing'

  /* ---------------- NOTIFICATION HELPER ---------------- */
  const notify = (type, title, description) => {
    api[type]({
      title,
      description,
      placement: "top",
      duration: 2,
      getContainer: () => document.body,
      style: { lineHeight: "1.2" },
    });
  };

  // 1. FETCH ENQUIRIES
  const fetchEnquiries = async () => {
    try {
      setLoadingEnquiries(true);
      const response = await API.get("/enquiry/all");
      setEnquiries(response.data || []);
      setLoadingEnquiries(false);
    } catch (error) {
      console.error("Error fetching enquiries:", error);
      setLoadingEnquiries(false);
    }
  };

  // 2. FETCH ADMIN PROFILE
  const fetchAdminProfile = async () => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return;
      const user = JSON.parse(userStr);
      const userId = user._id;
      if (!userId) return;

      const res = await API.get(`/admin/get-admin/${userId}`);
      const name = res.data.name || user.admin_name || "";
      setAdminName(name);
      form.setFieldsValue({ adminName: name });
    } catch (error) {
      console.error("Failed to fetch admin profile:", error);
    }
  };

  // 3. FETCH USERS/CUSTOMERS
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await API.get("/user/get-user");
      setUsers(response.data || []);
      setLoadingUsers(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoadingUsers(false);
    }
  };

  // 4. FETCH CUSTOMER ENROLLMENTS
  const fetchCustomerEnrollments = async (userId) => {
    try {
      const response = await API.post(`/enroll/get-user-tickets-report/${userId}`);

      if (response.data && response.data.length > 0) {
        const firstEnrollment = response.data[0];
        const groupData = firstEnrollment?.enrollment?.group;
        const enrollmentData = firstEnrollment?.enrollment;

        if (groupData) {
          form.setFieldsValue({ groupName: groupData.group_name });
        }
        if (enrollmentData) {
          form.setFieldsValue({
            ticketNumber: enrollmentData.tickets || enrollmentData.ticket_number || "N/A"
          });
        }
      } else {
        form.setFieldsValue({ groupName: "No Active Group Found", ticketNumber: "N/A" });
      }
    } catch (error) {
      console.error("Error fetching customer enrollments:", error);
    }
  };

  // 5. HANDLE CUSTOMER SEARCH SELECTION
  const handleCustomerSelect = (userId) => {
    const selectedUser = users.find((u) => u._id === userId);
    if (selectedUser) {
      // ✅ FIX: Use fallbacks (||) in case API returns different keys (e.g., 'name' vs 'full_name')
      const cName = selectedUser.full_name || selectedUser.name;
      const cPhone = selectedUser.phone_number || selectedUser.mobile;

      form.setFieldsValue({
        searchCustomer: userId, // ✅ CRITICAL: Update the dropdown field itself
        customerId: userId,
        existingCustomerName: cName,
        existingCustomerPhone: cPhone,
      });
      fetchCustomerEnrollments(userId);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  // ✅ UPDATED: Handle Open Modal (Reset Logic)
  const handleOpenModal = () => {
    setIsModalOpen(true);

    // 1. Reset all fields to clear previous entries
    form.resetFields();

    // 2. Reset Customer Type state
    setCustomerType("new");

    // 3. Fetch Admin Profile (This will set the Admin Name automatically)
    fetchAdminProfile();

    // 4. Fetch Users for the search dropdown
    fetchUsers();

    // 5. Set default Date
    form.setFieldsValue({ date: dayjs() });
  };

  // SUBMIT ENQUIRY
  const onFinish = async (values) => {
    try {
      let payload = {
        adminName: values.adminName,
        description: values.description,
        date: values.date ? values.date.format('YYYY-MM-DD') : null,
      };

      if (customerType === 'new') {
        payload.customerType = 'new';
        payload.customerName = values.newCustomerName;
        payload.customerPhone = values.newCustomerPhone;
        payload.purpose = values.purposeNew;
        payload.callStatus = values.callStatus;
      } else {
        payload.customerType = 'old';
        payload.customerId = values.customerId;
        payload.customerName = values.existingCustomerName;
        payload.customerPhone = values.existingCustomerPhone;
        payload.groupName = values.groupName;
        payload.ticketNumber = values.ticketNumber;
        payload.purpose = values.purposeExisting;
        payload.callStatus = values.callStatus;
      }

      await API.post("/enquiry/create", payload);

      notify("success", "Success", "Your enquiry has been submitted successfully!");
      fetchEnquiries();

      setIsModalOpen(false);
      form.resetFields();
      setCustomerType("new");
      setAdminName("");

    } catch (error) {
      console.error("Error submitting enquiry:", error);
      notify("error", "Error", "Failed to submit enquiry");
    }
  };

  // ✅ DYNAMIC COLUMNS BASED ON TAB
  const getEnquiryColumns = (tab) => {
    const baseColumns = [
      { key: "adminName", header: "Admin Name" },
      { key: "customerName", header: "Customer Name" },
      { key: "customerPhone", header: "Phone Number" },
      { key: "purpose", header: "Purpose" },
      {
        key: "callStatus",
        header: "Call Status",
        render: (text) => <CallStatusBadge status={text} />
      },
      { key: "description", header: "Description" },
      { key: "date", header: "Date" },
    ];

    if (tab === 'all') {
      return [
        { key: "customerType", header: "Customer Type" },
        ...baseColumns,
        { key: "groupName", header: "Group" },
        { key: "ticketNumber", header: "Ticket No" },
      ];
    } else if (tab === 'new') {
      return baseColumns;
    } else if (tab === 'existing') {
      return [
        ...baseColumns,
        { key: "groupName", header: "Group" },
        { key: "ticketNumber", header: "Ticket No" },
      ];
    }
    return baseColumns;
  };

  // ✅ FILTER ENQUIRIES BASED ON TAB
  const getFilteredEnquiries = () => {
    if (enquiryTab === 'new') {
      return enquiries.filter(item => item.customerType === 'new');
    } else if (enquiryTab === 'existing') {
      return enquiries.filter(item => item.customerType === 'old');
    }
    return enquiries;
  };

  const formattedEnquiries = getFilteredEnquiries().map((item) => {
    return {
      ...item,
      date: item.date ? dayjs(item.date).format('DD-MM-YYYY') : "-",
      customerType: item.customerType === 'new' ? 'New Customer' : 'Existing Customer'
    };
  });

  const tabItems = [
    {
      key: 'all',
      label: `All (${enquiries.length})`,
      children: null,
    },
    {
      key: 'new',
      label: `New Customer (${enquiries.filter(e => e.customerType === 'new').length})`,
      children: null,
    },
    {
      key: 'existing',
      label: `Existing Customer (${enquiries.filter(e => e.customerType === 'old').length})`,
      children: null,
    },
  ];

  return (
    <>
      {contextHolder}
      <Navbar />

      <div className="flex w-screen mt-14">
        <Sidebar />

        <div className="flex-col w-full p-4">
          <div className="flex items-center gap-3 mb-4 justify-between">
            <div className="flex items-center gap-3">
              {activeTab && (
                <button onClick={() => setActiveTab(null)} className="px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300 text-sm">← Back</button>
              )}
              <h2 className="text-2xl font-bold my-5">Help & Support – Home</h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenModal}
                className="text-white bg-blue-800 text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-300 transition cursor-pointer"
              >
                Enquire Call
              </button>

              <Link
                to="/help-support"
                className="text-white bg-blue-800 text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-300 transition mx-2"
              >
                Raise Ticket
              </Link>
            </div>
          </div>

          {/* ENQUIRY TABS SECTION */}
          <div className="mt-10 min-h-[300px]">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Recent Enquiries Call</h3>

            <Tabs
              activeKey={enquiryTab}
              onChange={(key) => setEnquiryTab(key)}
              items={tabItems}
              className="mb-4"
            />

            {loadingEnquiries ? (
              <div className="flex justify-center items-center h-40">
                <CircularLoader isLoading={true} />
              </div>
            ) : formattedEnquiries.length === 0 ? (
              <div className="bg-white p-6 rounded-lg shadow border text-center text-gray-500">
                <p className="text-lg font-medium">No Enquiries Found</p>
                <p className="text-sm">Click "Enquire Call" to add a new entry.</p>
              </div>
            ) : (
              <DataTable
                data={formattedEnquiries}
                columns={getEnquiryColumns(enquiryTab)}
                exportCols={getEnquiryColumns(enquiryTab)}
                exportedFileName={`Enquiry_Report_${enquiryTab}.csv`}
                exportedPdfName={`Enquiry Report - ${enquiryTab}`}
                isExportEnabled={true}
              />
            )}
          </div>


          {/* ✅ ENQUIRE CALL MODAL (STYLED & VALIDATED) */}
        <Modal isVisible={isModalOpen} onClose={() => setIsModalOpen(false)}>
      <div className="w-full">
        <h2 className="text-xl font-bold mb-6 text-blue-800 border-b pb-2">Enquire Call</h2>

        <Form form={form} layout="vertical" onFinish={onFinish} className="font-sans">

          {/* ADMIN NAME */}
          <Form.Item
            label="Admin Name"
            name="adminName"
            rules={[{ required: true, message: 'Admin Name is required!' }]}
            className="mb-4"
          >
            <Input
              placeholder="Auto-fetched"
              readOnly
              className="bg-gray-50 border-gray-300 text-gray-600 cursor-not-allowed rounded-md shadow-sm"
            />
          </Form.Item>

          {/* CUSTOMER TYPE SELECTOR */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-blue-100">
            <label className="block mb-2 text-sm font-bold text-blue-900">
              Customer Type <span className="text-red-500">*</span>
            </label>
            <Select
              className="w-full rounded-md"
              value={customerType}
              onChange={(value) => {
                setCustomerType(value);
                
                // ✅ FIX: Added 'searchCustomer' to this array
                form.resetFields([
                  'newCustomerName',
                  'newCustomerPhone',
                  'purposeNew',
                  'customerId',
                  'existingCustomerName',
                  'existingCustomerPhone',
                  'groupName',
                  'ticketNumber',
                  'purposeExisting',
                  'searchCustomer', // <--- THIS WAS MISSING
                  'description',
                  'callStatus'
                ]);
                
                form.setFieldsValue({
                  customerType: value,
                  date: dayjs()
                });
              }}
            >
              <Option value="new">New Customer</Option>
              <Option value="existing">Existing Customer</Option>
            </Select>
          </div>

          {/* === NEW CUSTOMER FIELDS === */}
          {customerType === 'new' && (
            <div className="mb-4 p-5 rounded-lg border border-blue-100 bg-blue-50/30">
              <h3 className="text-base font-bold text-blue-900 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-800 p-1 rounded text-xs">NEW</span> Customer Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  label="Customer Name"
                  name="newCustomerName"
                  rules={[{ required: true, message: 'Required!' }]}
                  className="mb-0"
                >
                  <Input placeholder="Enter Customer Name" className="rounded-md" />
                </Form.Item>
                <Form.Item
                  label="Customer Phone"
                  name="newCustomerPhone"
                  rules={[
                    { required: true, message: 'Required!' },
                    {
                      pattern: /^[6-9]\d{9}$/,
                      message: "Phone number must be 10 digits starting with 6-9"
                    }
                  ]}
                  className="mb-0"
                >
                  <Input
                    placeholder="10-digit number"
                    className="rounded-md"
                    maxLength={10}
                    onInput={(e) => {
                      e.target.value = e.target.value.replace(/[^0-9]/g, '');
                    }}
                  />
                </Form.Item>
              </div>
              <div className="mt-4">
                <Form.Item
                  label="Purpose of Call"
                  name="purposeNew"
                  rules={[{ required: true, message: 'Required!' }]}
                >
                  <Select placeholder="Select Purpose" className="rounded-md">
                    <Option value="Group Enquiries">Group Enquiries</Option>
                    <Option value="Sales">Sales</Option>
                    <Option value="Admin">Admin</Option>
                  </Select>
                </Form.Item>
              </div>
            </div>
          )}

          {/* === EXISTING CUSTOMER FIELDS === */}
          {customerType === 'existing' && (
            <div className="mb-4 p-5 rounded-lg border border-gray-200 bg-gray-50">
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="bg-gray-200 text-gray-700 p-1 rounded text-xs">EXISTING</span> Customer Details
              </h3>

              <div className="mb-4">
                <Form.Item
                  label="Search Customer"
                  name="searchCustomer"
                  rules={[{ required: true, message: 'Please search and select a customer!' }]}
                >
                  <Select
                    showSearch
                    placeholder="Search by phone number or name..."
                    onChange={handleCustomerSelect}
                    filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
                    loading={loadingUsers}
                    className="rounded-md"
                    options={users.map((user) => ({
                      value: user._id,
                      label: `${user.full_name || user.name || 'Unknown Name'} - ${user.phone_number || user.mobile || 'No Phone'}`,
                    }))}
                  />
                </Form.Item>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  label="Customer Name"
                  name="existingCustomerName"
                  rules={[{ required: true, message: 'Required!' }]}
                  className="mb-0"
                >
                  <Input
                    placeholder="Select Customer above"
                    readOnly
                    className="bg-gray-100 border-gray-300 text-gray-600 cursor-not-allowed rounded-md"
                  />
                </Form.Item>
                <Form.Item
                  label="Phone Number"
                  name="existingCustomerPhone"
                  rules={[{ required: true, message: 'Required!' }]}
                  className="mb-0"
                >
                  <Input
                    placeholder="Select Customer above"
                    readOnly
                    className="bg-gray-100 border-gray-300 text-gray-600 cursor-not-allowed rounded-md"
                  />
                </Form.Item>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Form.Item
                  label="Group Name"
                  name="groupName"
                  rules={[{ required: true, message: 'Required!' }]}
                  className="mb-0"
                >
                  <Input
                    placeholder="Select Customer to fetch Group"
                    readOnly
                    className="bg-gray-100 border-gray-300 text-gray-600 cursor-not-allowed rounded-md"
                  />
                </Form.Item>
                <Form.Item
                  label="Ticket No"
                  name="ticketNumber"
                  rules={[{ required: true, message: 'Required!' }]}
                  className="mb-0"
                >
                  <Input
                    placeholder="Select Customer to fetch Ticket"
                    readOnly
                    className="bg-gray-100 border-gray-300 text-gray-600 cursor-not-allowed rounded-md"
                  />
                </Form.Item>
              </div>

              <Form.Item name="customerId" hidden><Input /></Form.Item>

              <div className="mt-4">
                <Form.Item
                  label="Purpose of Call"
                  name="purposeExisting"
                  rules={[{ required: true, message: 'Required!' }]}
                >
                  <Select placeholder="Select Purpose" className="rounded-md">
                    <Option value="Bid Request">Bid Request</Option>
                    <Option value="Account Statement">Account Statement</Option>
                    <Option value="Payment Status">Payment Status</Option>
                    <Option value="Action Date">Action Date</Option>
                    <Option value="Documents">Documents</Option>
                    <Option value="New Group Enquire">New Group Enquire</Option>
                  </Select>
                </Form.Item>
              </div>
            </div>
          )}

          {/* === COMMON FIELDS === */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div>
              <Form.Item
                label="Description"
                name="description"
                rules={[{ required: true, message: 'Please input description!' }]}
              >
                <Input.TextArea rows={4} placeholder="Enter Description" className="rounded-md" />
              </Form.Item>
            </div>
            <div>
              <Form.Item
                label="Date"
                name="date"
                rules={[{ required: true, message: 'Please select a date!' }]}
              >
                <DatePicker style={{ width: '100%' }} className="rounded-md" />
              </Form.Item>

              <Form.Item
                label="Call Status"
                name="callStatus"
                rules={[{ required: true, message: 'Please select status!' }]}
              >
                <Select placeholder="Select Call Status" className="w-full rounded-md">
                  <Option value="Hot">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                      🔥 Hot
                    </span>
                  </Option>
                  <Option value="Cold">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                      ❄️ Cold
                    </span>
                  </Option>
                  <Option value="Emergency">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                      🚨 Emergency
                    </span>
                  </Option>
                </Select>
              </Form.Item>
            </div>
          </div>

          {/* Submit Button */}
          <Form.Item className="mt-4 mb-0">
            <Button type="primary" htmlType="submit" block className="bg-blue-600 hover:bg-blue-700 h-10 rounded-md font-semibold shadow-md">
              Submit Enquiry
            </Button>
          </Form.Item>

        </Form>
      </div>
    </Modal>

        </div>
      </div>
    </>
  );
}

export default HelpAndSupport;