/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import Sidebar from "../components/layouts/Sidebar";
import Modal from "../components/modals/Modal";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import CustomAlertDialog from "../components/alerts/CustomAlertDialog";
import { Dropdown, Select } from "antd";
import { IoMdMore } from "react-icons/io";
import Navbar from "../components/layouts/Navbar";
import filterOption from "../helpers/filterOption";
import { FaCalculator } from "react-icons/fa";
import CircularLoader from "../components/loaders/CircularLoader";
import { fieldSize } from "../data/fieldSize";
const Pigme = () => {
  const [users, setUsers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [pigmeCustomers, setPigmeCustomers] = useState([]);
  const [tableBorrowers, setTableBorrowers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [showModalUpdate, setShowModalUpdate] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [currentUpdateCustomer, setCurrentUpdateCustomer] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const onGlobalSearchChangeHandler = (e) => {
    const { value } = e.target;
    setSearchText(value);
  };

  const [alertConfig, setAlertConfig] = useState({
    visibility: false,
    message: "Something went wrong!",
    type: "info",
  });

  const [formData, setFormData] = useState({
    customer: "",
    maturity_period: "",
    maturity_interest: "6",
    payable_amount: "",
    start_date: "",
    // end_date: "",
    note: "",
    referred_customer: "",
    referred_employee: "",
    referred_type: "",
    referred_agent: "",
    duration: "12",
  });
  const [errors, setErrors] = useState({});

  const [updateFormData, setUpdateFormData] = useState({
    customer: "",
    maturity_period: "",
    maturity_interest: "6",
    payable_amount: "",
    start_date: "",
    //  end_date: "",
    note: "",
    referred_customer: "",
    referred_employee: "",
    referred_type: "",
    referred_agent: "",
    duration: "12",
  });

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await api.get("/user/get-user");
        if (response.status >= 400)
          throw new Error("Failed to fetch Customers");
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching  Customer Data:", error);
      }
    };
    fetchCustomers();
  }, [reloadTrigger]);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await api.get("/agent/get");
        setAgents(response.data?.agent);
      } catch (err) {
        console.error("Failed to fetch Leads", err);
      }
    };
    fetchAgents();
  }, []);
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await api.get("/employee");
        setEmployees(response?.data?.employee);
      } catch (error) {
        console.error("failed to fetch employees", error);
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    const fetchBorrowers = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/pigme/get-all-pigme-customers");
        setPigmeCustomers(response.data);
        const formattedData = response.data.map((pigmeCustomer, index) => ({
          _id: pigmeCustomer?._id,
          id: index + 1,
          pigme_id: pigmeCustomer?.pigme_id,
          customer_name: pigmeCustomer?.customer?.full_name,
          date: pigmeCustomer?.createdAt,
          maturity_period: pigmeCustomer?.maturity_period,
          maturity_interest: pigmeCustomer?.maturity_interest,
          payable_amount: pigmeCustomer?.payable_amount,
          start_date: pigmeCustomer?.start_date?.split("T")[0],
          duration: pigmeCustomer?.duration,
          //   end_date: pigmeCustomer?.end_date?.split("T")[0],
          note: pigmeCustomer?.note,
          referred_type: pigmeCustomer?.referred_type,
          referred_by:
            pigmeCustomer?.referred_employee?.name &&
            pigmeCustomer?.referred_employee?.phone_number
              ? `${pigmeCustomer.referred_employee.name} | ${pigmeCustomer?.referred_employee?.phone_number}`
              : pigmeCustomer?.referred_agent?.name
              ? `${pigmeCustomer.referred_agent.name} | ${pigmeCustomer.referred_agent.phone_number}`
              : pigmeCustomer?.referred_customer?.full_name &&
                pigmeCustomer?.referred_customer?.phone_number
              ? `${pigmeCustomer.referred_customer.full_name} | ${pigmeCustomer?.referred_customer?.phone_number}`
              : "N/A",
          action: (
            <div className="flex justify-center gap-2" key={pigmeCustomer._id}>
              <Dropdown
                menu={{
                  items: [
                    {
                      key: "1",
                      label: (
                        <div
                          className="text-green-600"
                          onClick={() =>
                            handleUpdateModalOpen(pigmeCustomer._id)
                          }
                        >
                          Edit
                        </div>
                      ),
                    },
                    {
                      key: "2",
                      label: (
                        <div
                          className="text-red-600"
                          onClick={() =>
                            handleDeleteModalOpen(pigmeCustomer._id)
                          }
                        >
                          Delete
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
        setTableBorrowers(formattedData);
      } catch (error) {
        console.error("Error fetching group data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBorrowers();
  }, [reloadTrigger]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = (type) => {
    const newErrors = {};

    const data = type === "addCustomer" ? formData : updateFormData;

    if (!data.customer) {
      newErrors.customer = "Customer Name is required";
    }

    if (!data.maturity_period) {
      newErrors.maturity_period = "Maturity Period is Required";
    }

    if (!data.payable_amount) {
      newErrors.payable_amount = "Payable Amount is required";
    } else if (
      !data.payable_amount ||
      isNaN(data.payable_amount) ||
      data.payable_amount <= 0
    ) {
      newErrors.payable_amount = "Payable Amount must be a positive number";
    }

    if (!data.start_date) {
      newErrors.start_date = "Start Date is required";
    }
    // if (!data.end_date) {
    //   newErrors.end_date = "End Date is required";
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validateForm("addCustomer");
    try {
      if (isValid) {
        const response = await api.post("/pigme/add-pigme-customer", formData, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (response.status >= 400) throw new Error("failed to add Customer");
        setReloadTrigger((prev) => prev + 1);
        setAlertConfig({
          visibility: true,
          message: "Customer Added Successfully",
          type: "success",
        });

        setShowModal(false);
        setFormData({
          customer: "",
          maturity_period: "",
          maturity_interest: "6",
          payable_amount: "",
          start_date: "",
          //  end_date: "",
          note: "",
          referred_customer: "",
          referred_employee: "",
          referred_type: "",
          referred_agent: "",
          duration: "12",
        });
      }
    } catch (error) {
      console.error("Error adding Customer:", error);
    }
  };

  const handleDeleteModalOpen = async (pigmeId) => {
    try {
      const response = await api.get(`pigme/get-pigme/${pigmeId}`);
      setCurrentCustomer(response.data);
      setShowModalDelete(true);
    } catch (error) {
      console.error("Error fetching Pigme:", error);
    }
  };

  const handleUpdateModalOpen = async (pigmeId) => {
    try {
      const response = await api.get(`pigme/get-pigme/${pigmeId}`);
      const PigmeData = response.data;
      const formattedStartDate = PigmeData?.start_date?.split("T")[0];
      const formattedEndDate = PigmeData?.end_date?.split("T")[0];
      setCurrentUpdateCustomer(response.data);
      setUpdateFormData({
        customer: response?.data?.customer._id,
        maturity_period: response?.data?.maturity_period,
        maturity_interest: response?.data?.maturity_interest,
        payable_amount: response?.data?.payable_amount,
        start_date: formattedStartDate,
        //  end_date: formattedEndDate,
        note: response?.data?.note,
        referred_employee: response?.data?.referred_employee?._id || "",
        referred_customer: response?.data?.referred_customer?._id || "",
        referred_agent: response?.data?.referred_agent?._id || "",
        referred_type: response?.data?.referred_type || "",
        duration: response?.data?.duration || "",
      });
      setShowModalUpdate(true);
      setErrors({});
    } catch (error) {
      console.error("Error fetching pigme Customer by ID:", error);
    }
  };

  const handleAntDSelect = (field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: "",
    }));
  };
  const handleAntInputDSelect = (field, value) => {
    console.info(field, value, "hfjgdfgdfg");
    setUpdateFormData((prevData) => ({
      ...prevData,
      referred_employee: "",
      referred_agent: "",
      referred_customer: "",
      [field]: value,
    }));

    setErrors({ ...errors, [field]: "" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateFormData((prevData) => ({ ...prevData, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleDeletePigme = async () => {
    if (currentCustomer) {
      try {
        await api.delete(`/pigme/delete-pigme-customer/${currentCustomer._id}`);
        setReloadTrigger((prev) => prev + 1);
        setAlertConfig({
          message: "Pigme User deleted successfully",
          type: "success",
          visibility: true,
        });
        setShowModalDelete(false);
        setCurrentCustomer(null);
      } catch (error) {
        console.error("Error deleting pigme User:", error);
      }
    }
  };
  const handleUpdate = async (e) => {
    e.preventDefault();
    const isValid = validateForm();
    try {
      if (isValid) {
        await api.patch(
          `/pigme/update-pigme-customer/${currentUpdateCustomer._id}`,
          updateFormData
        );
        setShowModalUpdate(false);
        setReloadTrigger((prev) => prev + 1);
        setAlertConfig({
          message: "Borrower updated successfully",
          type: "success",
          visibility: true,
        });
      }
    } catch (error) {
      console.error("Error updating Borrower:", error);
    }
  };

  const columns = [
    { key: "id", header: "SL. NO" },
    { key: "customer_name", header: "Customer Name" },
    { key: "pigme_id", header: "Pigme ID" },
    { key: "maturity_period", header: "Maturity Period" },
    { key: "payable_amount", header: "Amount" },
    { key: "maturity_interest", header: "Maturity Interest" },
    { key: "referred_type", header: "Referred Type" },
    { key: "referred_by", header: "Referred By" },
    { key: "start_date", header: "Start Date" },
    { key: "duration", header: "Duration" },
    // { key: "end_date", header: "Due Date" },
    { key: "note", header: "Note" },
    { key: "action", header: "Action" },
  ];

  return (
    <>
      <div>
        <Navbar
          visibility={true}
          onGlobalSearchChangeHandler={onGlobalSearchChangeHandler}
        />
        <CustomAlertDialog
          type={alertConfig.type}
          isVisible={alertConfig.visibility}
          message={alertConfig.message}
          onClose={() =>
            setAlertConfig((prev) => ({ ...prev, visibility: false }))
          }
        />
        <div className="flex mt-20">
          <Sidebar />

          <div className="flex-grow p-7">
            <div className="mt-6 mb-8">
              <div className="flex justify-between items-center w-full">
                <h1 className="text-2xl font-semibold">Pigmy</h1>
                <button
                  onClick={() => {
                    setShowModal(true);
                    setErrors({});
                  }}
                  className="ml-4 bg-blue-950 text-white px-4 py-2 rounded shadow-md hover:bg-blue-800 transition duration-200"
                >
                  + Add Pigmy
                </button>
              </div>
            </div>

            {tableBorrowers?.length > 0 && !isLoading ? (
              <DataTable
                catcher="_id"
                updateHandler={handleUpdateModalOpen}
                data={filterOption(tableBorrowers, searchText)}
                columns={columns}
                exportedPdfName="Pigme"
                exportedFileName={`Pigmy.csv`}
              />
            ) : (
              <CircularLoader
                isLoading={isLoading}
                data="Pigme Data"
                failure={tableBorrowers?.length <= 0}
              />
            )}
          </div>
        </div>
        <Modal isVisible={showModal} onClose={() => setShowModal(false)}>
          <div className="py-6 px-5 lg:px-8 text-left">
            <h3 className="mb-4 text-xl font-bold text-gray-900">Add Pigmy</h3>

            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              <div>
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="customer"
                >
                  Select customer Name <span className="text-red-500 ">*</span>
                </label>
                {/* <select
                  name="customer"
                  id="customer"
                  value={formData.customer}
                  onChange={handleChange}
                  required
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                >
                  <option value="" selected hidden>
                    Select Customer Name
                  </option>
                  {users.map((user) => (
                    <option value={user._id}>{user.full_name}</option>
                  ))}
                </select> */}
                <Select
                  className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  placeholder="Select Or Search  customer Name "
                  popupMatchSelectWidth={false}
                  showSearch
                  name="customer"
                  filterOption={(input, option) =>
                    option.children
                      .toString()
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  value={formData?.customer || undefined}
                  onChange={(value) => handleAntDSelect("customer", value)}
                >
                  {users.map((user) => (
                    <Select.Option key={user._id} value={user._id}>
                      {user.customer_id} | {user.full_name} |{" "}
                      {user.phone_number}
                    </Select.Option>
                  ))}
                </Select>
                {errors.customer && (
                  <p className="text-red-500 text-sm mt-1">{errors.customer}</p>
                )}
              </div>
              <div>
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="maturity_period"
                >
                  Select Payment Type <span className="text-red-500 ">*</span>
                </label>
                {/* <select
                  name="maturity_period"
                  id="maturity_period"
                  value={formData.maturity_period}
                  onChange={handleChange}
                  required
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                >
                  <option value="" selected hidden>
                    Select Maturity Period
                  </option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select> */}
                <Select
                  className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  placeholder="Select Or Search  customer Name "
                  popupMatchSelectWidth={false}
                  showSearch
                  name="maturity_period"
                  filterOption={(input, option) =>
                    option.children
                      .toString()
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  value={formData?.maturity_period || undefined}
                  onChange={(value) =>
                    handleAntDSelect("maturity_period", value)
                  }
                >
                  {["Daily", "Weekly", "Monthly"].map((maturity) => (
                    <Select.Option
                      key={maturity}
                      value={maturity?.toLowerCase()}
                    >
                      {maturity}
                    </Select.Option>
                  ))}
                </Select>
                {errors.maturity_period && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.maturity_period}
                  </p>
                )}
              </div>

              <div className="flex flex-row justify-between space-x-4">
                <div className="w-full">
                  <label className="block mb-2 text-sm font-semibold text-gray-800">
                    Referred Type <span className="text-red-500">*</span>
                  </label>
                  <Select
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full`}
                    placeholder="Select Referred Type"
                    popupMatchSelectWidth={false}
                    showSearch
                    name="referred_type"
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    value={formData?.referred_type || undefined}
                    onChange={(value) =>
                      handleAntDSelect("referred_type", value)
                    }
                  >
                    {[
                      "Self Joining",
                      "Customer",
                      "Employee",
                      "Agent",
                      "Others",
                    ].map((refType) => (
                      <Select.Option key={refType} value={refType}>
                        {refType}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
                {formData.referred_type === "Customer" && (
                  <div className="w-full">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="category"
                    >
                      Select Referred Customer{" "}
                      <span className="text-red-500 ">*</span>
                    </label>

                    <Select
                      className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full `}
                      placeholder="Select Or Search Referred Customer"
                      popupMatchSelectWidth={false}
                      showSearch
                      name="referred_customer"
                      filterOption={(input, option) =>
                        option.children
                          .toString()
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      value={formData?.referred_customer || undefined}
                      onChange={(value) =>
                        handleAntDSelect("referred_customer", value)
                      }
                    >
                      {users.map((user) => (
                        <Select.Option key={user._id} value={user._id}>
                          {user.full_name} |{" "}
                          {user.phone_number ? user.phone_number : "No Number"}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                )}
                {formData.referred_type === "Agent" && (
                  <div className="w-full">
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Select Referred Agent{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <Select
                      className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full `}
                      placeholder="Select or Search Referred Agent"
                      popupMatchSelectWidth={false}
                      showSearch
                      name="referred_agent"
                      filterOption={(input, option) =>
                        option.children
                          .toString()
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      value={formData.referred_agent || undefined}
                      onChange={(value) =>
                        handleAntDSelect("referred_agent", value)
                      }
                    >
                      {agents.map((agent) => (
                        <Select.Option key={agent._id} value={agent._id}>
                          {agent.name} | {agent.phone_number}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                )}
                {formData.referred_type === "Employee" && (
                  <div className="w-full">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="category"
                    >
                      Select Referred Employee{" "}
                      <span className="text-red-500 ">*</span>
                    </label>

                    <Select
                      className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full `}
                      placeholder="Select Or Search Referred Employee"
                      popupMatchSelectWidth={false}
                      showSearch
                      name="referred_employee"
                      filterOption={(input, option) => {
                        if (!option || !option.children) return false; // Ensure option and children exist

                        return option.children
                          .toString()
                          .toLowerCase()
                          .includes(input.toLowerCase());
                      }}
                      value={formData?.referred_employee || undefined}
                      onChange={(value) =>
                        handleAntDSelect("referred_employee", value)
                      }
                    >
                      {employees.map((employee) => (
                        <Select.Option key={employee._id} value={employee._id}>
                          {employee.name} | {employee.phone_number}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                )}
              </div>

              <div className="flex flex-row justify-between space-x-4">
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="maturity_interest"
                  >
                    Interest %
                  </label>
                  <input
                    type="text"
                    name="maturity_interest"
                    value={formData.maturity_interest}
                    onChange={handleChange}
                    id="maturity_interest"
                    placeholder="Enter Interest"
                    required
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                  />
                </div>
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="start_date"
                  >
                    Start Date <span className="text-red-500 ">*</span>
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    id="start_date"
                    placeholder="Enter the Date"
                    required
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                  />
                  {errors.start_date && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.start_date}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-row justify-between space-x-4">
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="duration"
                  >
                    Duration <span className="text-red-500 ">*</span>
                  </label>
                  <Select
                    className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                    placeholder="Select Duration"
                    popupMatchSelectWidth={false}
                    showSearch
                    name="duration"
                    filterOption={(input, option) =>
                      option?.children
                        ?.toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    value={formData?.duration || "6 months"}
                    onChange={(value) =>
                      handleAntDSelect("duration", value)
                    }
                  >
                    {[
                      "6 months",
                      "12 months",
                      "18 months",
                      "24 months",
                      "30 months",
                      "36 months",
                      "42 months",
                      "48 months",
                      "54 months",
                      "60 months",
                    ].map((cDuration) => (
                      <Select.Option key={cDuration} value={cDuration}>
                        {cDuration}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="payable_amount"
                  >
                    Payable Amount <span className="text-red-500 ">*</span>
                  </label>
                  <input
                    type="number"
                    name="payable_amount"
                    value={formData.payable_amount}
                    onChange={handleChange}
                    id="tenure"
                    placeholder="Enter Payable Amount"
                    required
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-4"
                  />
                  {errors.payable_amount && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.payable_amount}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="note"
                >
                  Note
                </label>
                <div className="flex w-full gap-2">
                  <input
                    type="text"
                    name="note"
                    value={formData.note}
                    onChange={handleChange}
                    id="note"
                    placeholder="Specify Note if any!"
                    required
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full  p-2.5"
                  />
                  <div
                    className="bg-blue-700 hover:bg-blue-800 w-10 h-10 flex justify-center items-center rounded-md"
                    onClick={() => {
                      window.open("Calculator:///");
                    }}
                  >
                    <FaCalculator color="white" />
                  </div>
                </div>
              </div>
              <div className="w-full flex justify-end">
                <button
                  type="submit"
                  className="w-1/4 text-white bg-blue-700 hover:bg-blue-800
              focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center border-2 border-black"
                >
                  Save Pigmy
                </button>
              </div>
            </form>
          </div>
        </Modal>
        <Modal
          isVisible={showModalUpdate}
          onClose={() => setShowModalUpdate(false)}
        >
          <div className="py-6 px-5 lg:px-8 text-left">
            <h3 className="mb-4 text-xl font-bold text-gray-900">
              Update Pigmy
            </h3>
            <form className="space-y-6" onSubmit={handleUpdate} noValidate>
              <div>
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="customer"
                >
                  Select customer Name <span className="text-red-500 ">*</span>
                </label>
                {/* <select
                  name="customer"
                  id="customer"
                  value={updateFormData.customer}
                  onChange={handleInputChange}
                  required
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                >
                  <option value="" selected hidden>
                    Select Customer Name
                  </option>
                  {users.map((user) => (
                    <option value={user._id}>{user.full_name}</option>
                  ))}
                </select> */}
                <Select
                  className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  placeholder="Select Or Search  customer Name "
                  popupMatchSelectWidth={false}
                  showSearch
                  name="customer"
                  filterOption={(input, option) =>
                    option.children
                      .toString()
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  value={updateFormData?.customer || undefined}
                  onChange={(value) => handleAntInputDSelect("customer", value)}
                >
                  {users.map((user) => (
                    <Select.Option key={user._id} value={user._id}>
                      {user.full_name}
                    </Select.Option>
                  ))}
                </Select>
                {errors.customer && (
                  <p className="text-red-500 text-sm mt-1">{errors.customer}</p>
                )}
              </div>

              <div>
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="maturity_period"
                >
                  Select Payment Type <span className="text-red-500 ">*</span>
                </label>
                <Select
                  className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  placeholder="Select Or Search  customer Name "
                  popupMatchSelectWidth={false}
                  showSearch
                  name="maturity_period"
                  filterOption={(input, option) =>
                    option.children
                      .toString()
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  value={updateFormData?.maturity_period || undefined}
                  onChange={(value) =>
                    handleAntInputDSelect("maturity_period", value)
                  }
                >
                  {["Daily", "Weekly", "Monthly"].map((maturity) => (
                    <Select.Option
                      key={maturity}
                      value={maturity?.toLowerCase()}
                    >
                      {maturity}
                    </Select.Option>
                  ))}
                </Select>
                {errors.maturity_period && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.maturity_period}
                  </p>
                )}
              </div>

              <div className="flex flex-row justify-between space-x-4">
                <div className="w-full">
                  <label className="block mb-2 text-sm font-semibold text-gray-800">
                    Referred Type <span className="text-red-500">*</span>
                  </label>
                  <Select
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full`}
                    placeholder="Select Referred Type"
                    popupMatchSelectWidth={false}
                    showSearch
                    name="referred_type"
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    value={updateFormData?.referred_type || undefined}
                    onChange={(value) =>
                      handleAntInputDSelect("referred_type", value)
                    }
                  >
                    {[
                      "Self Joining",
                      "Customer",
                      "Employee",
                      "Agent",
                      "Others",
                    ].map((refType) => (
                      <Select.Option key={refType} value={refType}>
                        {refType}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
                {updateFormData.referred_type === "Customer" && (
                  <div className="w-full">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="category"
                    >
                      Select Referred Customer{" "}
                      <span className="text-red-500 ">*</span>
                    </label>

                    <Select
                      className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full `}
                      placeholder="Select Or Search Referred Customer"
                      popupMatchSelectWidth={false}
                      showSearch
                      name="referred_customer"
                      filterOption={(input, option) =>
                        option.children
                          .toString()
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      value={updateFormData?.referred_customer || undefined}
                      onChange={(value) =>
                        handleAntInputDSelect("referred_customer", value)
                      }
                    >
                      {users.map((user) => (
                        <Select.Option key={user._id} value={user._id}>
                          {user.full_name} |{" "}
                          {user.phone_number ? user.phone_number : "No Number"}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                )}
                {updateFormData.referred_type === "Agent" && (
                  <div className="w-full">
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Select Referred Agent{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <Select
                      className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full `}
                      placeholder="Select or Search Referred Agent"
                      popupMatchSelectWidth={false}
                      showSearch
                      name="referred_agent"
                      filterOption={(input, option) =>
                        option.children
                          .toString()
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      value={updateFormData.referred_agent || undefined}
                      onChange={(value) =>
                        handleAntInputDSelect("referred_agent", value)
                      }
                    >
                      {agents.map((agent) => (
                        <Select.Option key={agent._id} value={agent._id}>
                          {agent.name} | {agent.phone_number}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                )}
                {updateFormData.referred_type === "Employee" && (
                  <div className="w-full">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="category"
                    >
                      Select Referred Employee{" "}
                      <span className="text-red-500 ">*</span>
                    </label>

                    <Select
                      className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full `}
                      placeholder="Select Or Search Referred Employee"
                      popupMatchSelectWidth={false}
                      showSearch
                      name="referred_employee"
                      filterOption={(input, option) => {
                        if (!option || !option.children) return false; // Ensure option and children exist

                        return option.children
                          .toString()
                          .toLowerCase()
                          .includes(input.toLowerCase());
                      }}
                      value={updateFormData?.referred_employee || undefined}
                      onChange={(value) =>
                        handleAntInputDSelect("referred_employee", value)
                      }
                    >
                      {employees.map((employee) => (
                        <Select.Option key={employee._id} value={employee._id}>
                          {employee.name} | {employee.phone_number}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                )}
              </div>

              <div className="flex flex-row justify-between space-x-4">
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="maturity_interest"
                  >
                    Interest %
                  </label>
                  <input
                    type="text"
                    name="maturity_interest"
                    value={updateFormData.maturity_interest}
                    onChange={handleInputChange}
                    id="maturity_interest"
                    placeholder="Interest"
                    required
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                  />
                </div>
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="start_date"
                  >
                    Start Date <span className="text-red-500 ">*</span>
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={updateFormData.start_date}
                    onChange={handleInputChange}
                    id="start_date"
                    placeholder="Enter the Date"
                    required
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                  />
                  {errors.start_date && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.start_date}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-row justify-between space-x-4">
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="duration"
                  >
                    Duration <span className="text-red-500 ">*</span>
                  </label>
                  <Select
                    className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                    placeholder="Select Duration"
                    popupMatchSelectWidth={false}
                    showSearch
                    name="duration"
                    filterOption={(input, option) =>
                      option?.children
                        ?.toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    value={updateFormData?.duration || "6 months"}
                    onChange={(value) =>
                      handleAntInputDSelect("duration", value)
                    }
                  >
                    {[
                      "6 months",
                      "12 months",
                      "18 months",
                      "24 months",
                      "30 months",
                      "36 months",
                      "42 months",
                      "48 months",
                      "54 months",
                      "60 months",
                    ].map((cDuration) => (
                      <Select.Option key={cDuration} value={cDuration}>
                        {cDuration}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="payable_amount"
                  >
                    Payable Amount <span className="text-red-500 ">*</span>
                  </label>
                  <input
                    type="number"
                    name="payable_amount"
                    value={updateFormData.payable_amount}
                    onChange={handleInputChange}
                    id="tenure"
                    placeholder="Enter Payable Amount"
                    required
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-4"
                  />
                  {errors.payable_amount && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.payable_amount}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="note"
                >
                  Note
                </label>
                <div className="flex w-full gap-2">
                  <input
                    type="text"
                    name="note"
                    value={updateFormData.note}
                    onChange={handleInputChange}
                    id="note"
                    placeholder="Specify Note if any!"
                    required
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full  p-2.5"
                  />
                  <div
                    className="bg-blue-700 hover:bg-blue-800 w-10 h-10 flex justify-center items-center rounded-md"
                    onClick={() => {
                      window.open("Calculator:///");
                    }}
                  >
                    <FaCalculator color="white" />
                  </div>
                </div>
              </div>
              <div className="w-full flex justify-end">
                <button
                  type="submit"
                  className="w-1/4 text-white bg-blue-700 hover:bg-blue-800
              focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center border-2 border-black"
                >
                  Update Pigmy
                </button>
              </div>
            </form>
          </div>
        </Modal>

        <Modal
          isVisible={showModalDelete}
          onClose={() => {
            setShowModalDelete(false);
            setCurrentCustomer(null);
          }}
        >
          <div className="py-6 px-5 lg:px-8 text-left">
            <h3 className="mb-4 text-xl font-bold text-gray-900">
              Delete Pigmy Customer
            </h3>
            {currentCustomer && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleDeletePigme();
                }}
                className="space-y-6"
              >
                <div>
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="groupName"
                  >
                    Please enter{" "}
                    <span className="text-primary font-bold">
                      {currentCustomer.customer.full_name}
                    </span>{" "}
                    to confirm deletion.{" "}
                    <span className="text-red-500 ">*</span>
                  </label>
                  <input
                    type="text"
                    id="borrowerName"
                    placeholder="Enter the Pigmy Customer Name"
                    required
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                  />
                </div>
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
    </>
  );
};

export default Pigme;
