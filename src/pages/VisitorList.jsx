import { useState, useEffect } from "react";
import API from "../instance/TokenInstance";
import Sidebar from "../components/layouts/Sidebar";
import Navbar from "../components/layouts/Navbar";
import { Select, Tabs, Badge, Input, Button } from "antd";
// Added Lucide Icons to match the reference implementation style
import { Edit, Trash2 } from "lucide-react"; 
import DataTable from "../components/layouts/Datatable";
import CircularLoader from "../components/loaders/CircularLoader";
import Modal from "../components/modals/Modal";

const fieldSize = { height: "h-14" };

export default function VisitorList() {
  const [openModal, setOpenModal] = useState(false);

  // ADDED STATE: To track which dropdown is open
  const [openActionId, setOpenActionId] = useState(null);

  const [formData, setFormData] = useState({
    visitorType: "Guest",
    name: "",
    phone: "",
    email: "",
    description: "",
    purpose: "",
    dateTime: "",
    meetPerson: "",
    chitGroup: "",
    customerId: "",
    groupNameDisplay: "",
    ticketNumber: ""
  });

  const [errors, setErrors] = useState({});
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [users, setUsers] = useState([]);
  const [customerEnrollments, setCustomerEnrollments] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  // --- HELPER: Get Current Date Time ---
  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // --- HANDLER: Open Modal & Set Date ---
  const handleOpenModal = () => {
    setFormData((prev) => ({
      ...prev,
      dateTime: getCurrentDateTime()
    }));
    setErrors({});
    setOpenModal(true);
  };

  // --- FETCH FUNCTIONS ---
  const fetchVisitors = async () => {
    try {
      setLoading(true);
      const res = await API.get("/visitors");
      let data = [];
      if (Array.isArray(res.data)) {
        data = res.data;
      } else if (res.data.data && Array.isArray(res.data.data)) {
        data = res.data.data;
      } else if (res.data.visitors && Array.isArray(res.data.visitors)) {
        data = res.data.visitors;
      } else {
        data = Object.values(res.data).find(v => Array.isArray(v)) || [];
      }
      setVisitors(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching visitors:", error);
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await API.get("/agent/get");
      let agentList = [];
      if (Array.isArray(response.data)) {
        agentList = response.data;
      } else if (response.data.agent && Array.isArray(response.data.agent)) {
        agentList = response.data.agent;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        agentList = response.data.data;
      } else if (response.data.agents && Array.isArray(response.data.agents)) {
        agentList = response.data.agents;
      }
      setAgents(agentList);
    } catch (error) {
      console.error("Error fetching agents:", error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await API.get("/agent/get-additional-employee-info");
      const employeeData = response.data?.employee || [];
      setEmployees(employeeData);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await API.get("/user/get-user");
      setUsers(response.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchGroups = async () => {
    try {
      setLoadingGroups(true);
      const response = await API.get("/group/get-group-admin");
      setGroups(response.data || []);
      setLoadingGroups(false);
    } catch (error) {
      console.error("Error fetching groups:", error);
      setLoadingGroups(false);
    }
  };

  const fetchCustomerEnrollments = async (userId) => {
    try {
      const response = await API.post(`/enroll/get-user-tickets-report/${userId}`);

      if (response.data && response.data.length > 0) {
        setCustomerEnrollments(response.data);
        const firstEnrollment = response.data[0];
        const groupData = firstEnrollment?.enrollment?.group;

        if (groupData) {
          setFormData((prev) => ({
            ...prev,
            chitGroup: groupData._id,
            groupNameDisplay: groupData.group_name,
            ticketNumber: firstEnrollment?.enrollment?.tickets
          }));
        }
      } else {
        setCustomerEnrollments([]);
        setFormData((prev) => ({
          ...prev,
          chitGroup: "",
          groupNameDisplay: "No Active Group Found"
        }));
      }
    } catch (error) {
      console.error("Error fetching customer enrollments:", error);
      setCustomerEnrollments([]);
    }
  };

  const handleCustomerSelect = (userId) => {
    const selectedUser = users.find((u) => u._id === userId);
    if (selectedUser) {
      setFormData((prev) => ({
        ...prev,
        customerId: userId,
        name: selectedUser.full_name,
        phone: selectedUser.phone_number,
        email: selectedUser.email || ""
      }));
      fetchCustomerEnrollments(userId);
    }
  };

  // CHANGED: Added handleEdit function
  const handleEdit = (record) => {
    setOpenActionId(null); // Close dropdown on edit
    setFormData({
      ...record, // Spread existing data
      visitorType: record.visitorType,
      name: record.name,
      phone: record.phone,
      email: record.email,
      description: record.description,
      purpose: record.purpose,
      dateTime: record.dateTime,
      meetPerson: record.meetPerson,
      chitGroup: record.chitGroup,
      customerId: record.customerId,
      groupNameDisplay: record.groupName || "",
      ticketNumber: record.ticketNumber || ""
    });
    
    setOpenModal(true);

    // If editing a Customer, ensure their enrollment details are loaded
    if (record.visitorType === 'Customers' && record.customerId) {
      handleCustomerSelect(record.customerId);
    }
  };

  // ADDED: Handle Delete Function
  const handleDelete = async (id) => {
    setOpenActionId(null); // Close dropdown on delete
    if (window.confirm("Are you sure you want to delete this visitor?")) {
      try {
        await API.delete(`/visitors/${id}`);
        alert("Visitor Deleted Successfully");
        fetchVisitors();
      } catch (error) {
        console.error("Error deleting visitor:", error);
        alert("Failed to delete visitor");
      }
    }
  };

  useEffect(() => {
    fetchVisitors();
    fetchAgents();
    fetchEmployees();
    fetchUsers();
    fetchGroups();
  }, []);

  // Handles Input Changes (Native & AntD)
  const handleChange = (name, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handles Native Input Changes (Textarea, etc)
  const handleNativeChange = (e) => {
    const { name, value } = e.target;
    handleChange(name, value);
  };

  const validateForm = () => {
    let newErrors = {};

    if (!formData.name) newErrors.name = "Visitor Name is required.";

    if (!formData.phone) {
      newErrors.phone = "Phone Number is required.";
    } else if (!/^[6-9]\d{0,10}$/.test(formData.phone)) {
      newErrors.phone = "Phone must start with 6-9 and be 10 digits.";
    }

    if (!formData.purpose) newErrors.purpose = "Purpose of Visit required.";
    if (!formData.dateTime) newErrors.dateTime = "Date & Time is required.";
    if (!formData.meetPerson) newErrors.meetPerson = "Please select whom to meet.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      // Determine if we are updating or creating
      const isUpdate = !!formData._id; 
      const apiUrl = isUpdate ? `/visitors/${formData._id}` : "/visitors";
      const apiMethod = isUpdate ? API.put : API.post;

      const response = await apiMethod(apiUrl, formData);
      alert(isUpdate ? "Visitor Updated Successfully" : "Visitor Added Successfully");

      // Reset form logic
      const resetState = {
        visitorType: "Guest",
        name: "",
        phone: "",
        email: "",
        description: "",
        purpose: "",
        dateTime: "",
        meetPerson: "",
        chitGroup: "",
        customerId: "",
        groupNameDisplay: "",
        ticketNumber: ""
      };
      
      // Clear ID from reset state if it exists
      if(resetState._id) delete resetState._id;

      setFormData(resetState);
      setOpenModal(false);
      fetchVisitors();
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Unknown error";
      alert(`Failed: ${errorMessage}`);
    }
  };

  const getMeetPersonName = (personId) => {
    if (!personId) return "N/A";
    const agent = agents.find((a) => a._id === personId);
    if (agent) return agent.name;
    const employee = employees.find((e) => e._id === personId);
    if (employee) return employee.name;
    return "N/A";
  };

  const getGroupName = (groupId) => {
    if (!groupId) return "-";
    const group = groups.find((g) => g._id === groupId);
    return group ? group.group_name : "Unknown Group";
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const hoursStr = String(hours).padStart(2, '0');

    return `${day}/${month}/${year} ${hoursStr}:${minutes} ${ampm}`;
  };

  const formattedData = visitors.map((item, index) => {
    const type = (item.visitorType || "Guest").trim();
    return {
      ...item,
      slNo: index + 1,
      visitorId: item.visitorId || "N/A",
      visitorType: type.charAt(0).toUpperCase() + type.slice(1),
      agentName: getMeetPersonName(item.meetPerson),
      groupName: getGroupName(item.chitGroup),
      formattedDate: formatDateTime(item.dateTime),
      purpose: item.purpose || "-",
      description: item.description || "-",
      email: item.email || "-",
      _id: item._id,
      // CHANGED: Added Action Column implementation matching the reference
      action: (
        <div className="relative text-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenActionId(openActionId === item._id ? null : item._id);
            }}
            className="p-2 rounded-full hover:bg-gray-200"
          >
            ⋮
          </button>
          {openActionId === item._id && (
            <div className="absolute right-6 top-10 bg-white border rounded-lg shadow-lg w-40 z-50">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(item);
                  setOpenActionId(null);
                }}
                className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 text-blue-600"
              >
                <Edit size={18} />
                <span>Edit</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(item._id);
                  setOpenActionId(null);
                }}
                className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 text-red-600"
              >
                <Trash2 size={18} />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      ),
    };
  });

  const standardColumns = [
    { key: "slNo", header: "Sl.No" },
    { key: "visitorId", header: "Visitor ID" },
    { key: "name", header: "Visitor Name" },
    { key: "visitorType", header: "Type" },
    { key: "phone", header: "Phone No" },
    { key: "email", header: "Email" },
    { key: "purpose", header: "Purpose" },
    { key: "description", header: "Description" },
    { key: "formattedDate", header: "Date & Time" },
    { key: "agentName", header: "Whom to Meet" },
    { key: "action", header: "Action" }, // Ensure this key exists
  ];

  const customerColumns = [
    { key: "slNo", header: "Sl.No" },
    { key: "visitorId", header: "Visitor ID" },
    { key: "name", header: "Visitor Name" },
    { key: "visitorType", header: "Type" },
    { key: "phone", header: "Phone No" },
    { key: "email", header: "Email" },
    { key: "groupName", header: "Chit Group" },
    { key: "purpose", header: "Purpose" },
    { key: "description", header: "Description" },
    { key: "formattedDate", header: "Date & Time" },
    { key: "agentName", header: "Whom to Meet" },
    { key: "action", header: "Action" }, // Ensure this key exists
  ];

  const counts = {
    All: formattedData.length,
    Guest: formattedData.filter(d => d.visitorType === 'Guest').length,
    Customers: formattedData.filter(d => d.visitorType === 'Customers').length,
    'Sales Leads': formattedData.filter(d => d.visitorType === 'Sales Leads').length,
    Others: formattedData.filter(d => d.visitorType === 'Others').length,
  };

  const tabItems = [
    {
      key: 'All',
      label: <span>All <Badge count={counts.All} style={{ backgroundColor: '#722ed1' }} /></span>,
      children: (
        <DataTable
          data={formattedData}
          columns={customerColumns}
          exportedPdfName="All_Visitors_Report"
          exportedFileName="All_Visitors.csv"
          updateHandler={() => { }}
        />
      )
    },
    {
      key: 'Guest',
      label: <span>Guest <Badge count={counts.Guest} style={{ backgroundColor: '#52c41a' }} /></span>,
      children: (
        <DataTable
          data={formattedData.filter(d => d.visitorType === 'Guest')}
          columns={standardColumns}
          exportedPdfName="Guest_Visitors_Report"
          exportedFileName="Guest_Visitors.csv"
          updateHandler={() => { }}
        />
      )
    },
    {
      key: 'Customers',
      label: <span>Customers <Badge count={counts.Customers} style={{ backgroundColor: '#1890ff' }} /></span>,
      children: (
        <DataTable
          data={formattedData.filter(d => d.visitorType === 'Customers')}
          columns={customerColumns}
          exportedPdfName="Customer_Visitors_Report"
          exportedFileName="Customer_Visitors.csv"
          updateHandler={() => { }}
        />
      )
    },
    {
      key: 'Sales Leads',
      label: <span>Sales Leads <Badge count={counts['Sales Leads']} style={{ backgroundColor: '#722ed1' }} /></span>,
      children: (
        <DataTable
          data={formattedData.filter(d => d.visitorType === 'Sales Leads')}
          columns={standardColumns}
          exportedPdfName="Sales_Leads_Report"
          exportedFileName="Sales_Leads.csv"
          updateHandler={() => { }}
        />
      )
    },
    {
      key: 'Others',
      label: <span>Others <Badge count={counts.Others} style={{ backgroundColor: '#faad14' }} /></span>,
      children: (
        <DataTable
          data={formattedData.filter(d => d.visitorType === 'Others')}
          columns={standardColumns}
          exportedPdfName="Other_Visitors_Report"
          exportedFileName="Other_Visitors.csv"
          updateHandler={() => { }}
        />
      )
    }
  ];

  return (
    <>
      <Navbar />
      <div className="flex w-screen mt-14 min-h-screen">
        <Sidebar />
        <div className="flex-1 p-6 mt-8 relative">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold">Visitor Management</h2>
              <p className="text-gray-500">Segregated visitor records by type.</p>
            </div>
            <button
              onClick={handleOpenModal}
              className=" bg-blue-950 text-white px-4 py-2 rounded shadow-md hover:bg-blue-800 transition duration-200"
            >
              + Add Details
            </button>
          </div>

          <div className="bg-gray-50 rounded-xl shadow-sm border border-gray-200 p-4 min-h-[400px] flex flex-col">

            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <CircularLoader isLoading={true} />
              </div>
            ) : visitors.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <CircularLoader
                  isLoading={false}
                  failure={true}
                  data="Visitors"
                />
              </div>
            ) : (
              <Tabs defaultActiveKey="All" size="large" items={tabItems} />
            )}
          </div>

          {/* --- MODAL COMPONENT --- */}
          <Modal isVisible={openModal} onClose={() => setOpenModal(false)}>
            <div className="py-6 px-5 lg:px-8 text-left">
              <h3 className="mb-4 text-xl font-bold text-gray-900">
                {formData._id ? "Edit Visitor" : "Add Visitor"}
              </h3>
              <form className="space-y-6" onSubmit={handleSubmit} noValidate>

                {/* Visitor Type */}
                <div>
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Visitor Type <span className="text-red-500 ">*</span>
                  </label>
                  <Select
                    value={formData.visitorType}
                    onChange={(value) => {
                      handleChange("visitorType", value);
                      handleChange("chitGroup", "");
                      handleChange("customerId", "");
                      handleChange("groupNameDisplay", "");
                    }}
                    className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                    options={[
                      { value: 'Guest', label: 'Guest' },
                      { value: 'Customers', label: 'Customers' },
                      { value: 'Sales Leads', label: 'Sales Leads' },
                      { value: 'Others', label: 'Others' },
                    ]}
                  />
                  {errors.visitorType && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.visitorType}
                    </p>
                  )}
                </div>

                {/* CUSTOMERS SECTION */}
                {formData.visitorType === 'Customers' && (
                  <div className="animate-fade-in space-y-6">
                    {/* Search */}
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        Search Customer (Type Phone Number) <span className="text-red-500 ">*</span>
                      </label>
                      <Select
                        showSearch
                        placeholder="Search by phone number or name..."
                        value={formData.customerId || undefined}
                        onChange={handleCustomerSelect}
                        filterOption={(input, option) =>
                          (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                        }
                        className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                        options={users.map((user) => ({
                          value: user._id,
                          label: `${user.full_name} - ${user.phone_number}`,
                        }))}
                      />
                      {errors.customerId && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.customerId}
                        </p>
                      )}
                    </div>

                    {/* Name & Phone Row */}
                    <div className="flex flex-row justify-between space-x-4">
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">Customer Name</label>
                        <Input
                          value={formData.name}
                          readOnly
                          className="bg-gray-100 border border-gray-300 h-14 text-gray-600 text-sm rounded-lg w-full p-2.5 cursor-not-allowed"
                        />
                      </div>
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">Phone Number</label>
                        <Input
                          value={formData.phone}
                          readOnly
                          className="bg-gray-100 border border-gray-300 h-14 text-gray-600 text-sm rounded-lg w-full p-2.5 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900">Email</label>
                      <Input
                        value={formData.email}
                        readOnly
                        className="bg-gray-100 border border-gray-300 h-14 text-gray-600 text-sm rounded-lg w-full p-2.5 cursor-not-allowed"
                      />
                    </div>

                    {/* Chit Group */}
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900">Chit Group</label>
                      <Input
                        value={formData.groupNameDisplay || "Select a customer to see group"}
                        readOnly
                        className="bg-gray-100 border border-gray-300 h-14 text-gray-600 text-sm rounded-lg w-full p-2.5 cursor-not-allowed"
                      />
                    </div>
                  </div>
                )}

                {/* GUEST / OTHERS SECTION */}
                {formData.visitorType !== 'Customers' && (
                  <>
                    {/* Name Full Width */}
                    <div>
                      <label
                        className="block mb-2 text-sm font-medium text-gray-900"
                        htmlFor="name"
                      >
                        Visitor Name <span className="text-red-500 ">*</span>
                      </label>
                      <Input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        id="name"
                        placeholder="Enter the Full Name"
                        className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5 ${errors.name ? 'border-red-500' : ''}`}
                      />
                      {errors.name && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    {/* Email & Phone Row */}
                    <div className="flex flex-row justify-between space-x-4">
                      <div className="w-1/2">
                        <label
                          className="block mb-2 text-sm font-medium text-gray-900"
                          htmlFor="email"
                        >
                          Email
                        </label>
                        <Input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={(e) => handleChange("email", e.target.value)}
                          id="email"
                          placeholder="Enter Email"
                          className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5 ${errors.email ? 'border-red-500' : ''}`}
                        />
                        {errors.email && (
                          <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                        )}
                      </div>
                      <div className="w-1/2">
                        <label
                          className="block mb-2 text-sm font-medium text-gray-900"
                          htmlFor="phone"
                        >
                          Phone Number <span className="text-red-500 ">*</span>
                        </label>
                        <Input
                          type="number"
                          name="phone"
                          value={formData.phone}
                          maxLength={10}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (/^[6-9]?\d{0,9}$/.test(value)) {
                              setFormData({ ...formData, phone: value });
                            }
                          }}
                          id="phone"
                          placeholder="Enter Phone Number"
                          className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5 ${errors.phone ? 'border-red-500' : ''}`}
                        />
                        {errors.phone && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Purpose */}
                <div>
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Purpose of Visit <span className="text-red-500 ">*</span>
                  </label>
                  <Select
                    value={formData.purpose}
                    onChange={(value) => handleChange("purpose", value)}
                    className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                    options={[
                      { value: 'Document Sign', label: 'Document Sign' },
                      { value: 'Chit Information', label: 'Chit Information' },
                      { value: 'Auction Bidding', label: 'Auction Bidding' },
                      { value: 'Interview', label: 'Interview' },
                      { value: 'Others', label: 'Others' },
                    ]}
                  />
                  {errors.purpose && (
                    <p className="mt-2 text-sm text-red-600">{errors.purpose}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="description"
                  >
                    Description
                  </label>
                  <Input.TextArea
                    name="description"
                    placeholder="Enter Description"
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5"
                    rows={3}
                  />
                  {errors.description && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.description}
                    </p>
                  )}
                </div>

                {/* Date & Time */}
                <div>
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="dateTime"
                  >
                    Date & Time <span className="text-red-500 ">*</span>
                  </label>
                  <Input
                    type="datetime-local"
                    name="dateTime"
                    value={formData.dateTime}
                    onChange={(e) => handleChange("dateTime", e.target.value)}
                    id="dateTime"
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5 ${errors.dateTime ? 'border-red-500' : ''}`}
                  />
                  {errors.dateTime && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.dateTime}
                    </p>
                  )}
                </div>

                {/* Whom to Meet */}
                <div>
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Whom to Meet <span className="text-red-500 ">*</span>
                  </label>
                  <Select
                    showSearch
                    placeholder="Select an Agent or Employee"
                    optionFilterProp="children"
                    onChange={(value) => handleChange("meetPerson", value)}
                    filterOption={(input, option) =>
                      (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                    }
                    value={formData.meetPerson}
                    className={`bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full ${errors.meetPerson ? 'border-red-500' : ''}`}
                    options={[
                      ...agents.map((agent) => ({
                        value: agent._id,
                        label: `${agent.name} (Agent) - ${agent.designation_id?.title || 'Agent'}`,
                      })),
                      ...employees.map((emp) => ({
                        value: emp._id,
                        label: `${emp.name} (Employee) - ${emp.designation_id?.title || 'Staff'}`,
                      }))
                    ]}
                  />
                  {errors.meetPerson && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.meetPerson}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="w-full flex justify-end">
                  <button
                    type="submit"
                    className="w-1/4 text-white bg-blue-700 hover:bg-blue-800 border-2 border-black
                    focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                  >
                    {formData._id ? "Update Details" : "Submit Details"}
                  </button>
                </div>
              </form>
            </div>
          </Modal>

        </div>
      </div>
    </>
  );
}