import { DatePicker, Drawer, Dropdown, Modal } from "antd";
import Navbar from "../components/layouts/Navbar";
import Sidebar from "../components/layouts/Sidebar";
import DataTable from "../components/layouts/Datatable";
import { useEffect, useState } from "react";
import API from "../instance/TokenInstance";
import dayjs from "dayjs";
import { Select, Segmented, Button } from "antd";
import { IoMdMore } from "react-icons/io";
import { Link } from "react-router-dom";

const SalaryPayment = () => {
  const [isOpenAddModal, setIsOpenAddModal] = useState(false);
  const [isOpenUpdateModal, setIsOpenUpdateModal] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [employeeDetails, setEmployeeDetails] = useState({});
  const [allSalaryPayments, setAllSalarypayments] = useState([]);
  const [employeeDetailsLoading, setEmployeeDetailsLoading] = useState(false);
  const [updateFormData, setUpdateFormData] = useState({
    employee_id: "",
    month: "",
    year: "",
    earnings: {
      basic: 0,
      hra: 0,
      travel_allowance: 0,
      medical_allowance: 0,
      basket_of_benifits: 0,
      performance_bonus: 0,
      other_allowances: 0,
      conveyance: 0,
    },
    deductions: {
      income_tax: 0,
      esi: 0,
      epf: 0,
      professional_tax: 0,
    },
  });
  const thisYear = dayjs().format("YYYY");
  const earningsObject = {
    basic: 0,
    hra: 0,
    travel_allowance: 0,
    medical_allowance: 0,
    basket_of_benifits: 0,
    performance_bonus: 0,
    other_allowances: 0,
    conveyance: 0,
  };
  const deductionsObject = {
    income_tax: 0,
    esi: 0,
    epf: 0,
    professional_tax: 0,
  };

  const columns = [
    { key: "siNo", header: "SL. NO" },
    { key: "employeeName", header: "Employee Name" },
    { key: "employeeCode", header: "Employee Id" },
    { key: "transactionId", header: "Transaction Id" },
    { key: "salaryMonth", header: "Salary Month" },
    { key: "salaryYear", header: "Year" },
    { key: "payDate", header: "Pay Date" },
    { key: "netPayable", header: "Net Payable" },
    { key: "paidAmount", header: "Paid Amount" },
    { key: "action", header: "Action" },
  ];
  const months = [
    { label: "January", value: "January", disabled: false },
    { label: "February", value: "February", disabled: false },
    { label: "March", value: "March", disabled: false },
    { label: "April", value: "April", disabled: false },
    { label: "May", value: "May", disabled: false },
    { label: "June", value: "June", disabled: false },
    { label: "July", value: "July", disabled: false },
    { label: "August", value: "August", disabled: false },
    {
      label: "September",
      value: "September",
      disabled: false,
    },
    { label: "October", value: "October", disabled: false },
    { label: "November", value: "November", disabled: false },
    { label: "December", value: "December", disabled: false },
  ];

  const previousMonth = months[dayjs().subtract(2, "month").format("MM")].label;
  const [formData, setFormData] = useState({
    employee_id: "",
    month: previousMonth,
    year: thisYear,
    earnings: {
      basic: 0,
      hra: 0,
      travel_allowance: 0,
      medical_allowance: 0,
      basket_of_benifits: 0,
      performance_bonus: 0,
      other_allowances: 0,
      conveyance: 0,
    },
    deductions: {
      income_tax: 0,
      esi: 0,
      epf: 0,
      professional_tax: 0,
    },
  });

  async function fetchEmployees() {
    try {
      const responseData = await API.get("/employee");

      const filteredEmployee = responseData?.data?.employee?.map((emp) => ({
        value: emp?._id,
        label: `${emp?.name} | ${emp?.phone_number}` || "Unknown Employee",
      }));
      setEmployees(filteredEmployee || []);
    } catch (error) {
      setEmployees([]);
    }
  }
  useEffect(() => {
    fetchEmployees();
  }, []);
  async function getSalaryById() {
    try {
      const response = await API.get("/salary-payment/");
    } catch (error) {}
  }
  const handleEdit = async () => {
    try {
      setUpdateLoading(true);
      setIsOpenUpdateModal(true);
      await getSalaryById();
    } catch (error) {
    } finally {
      setUpdateLoading(false);
    }
  };
  const handleDelete = () => {
    try {
    } catch (error) {}
  };
  const handleUpdateChange = (event) => {};
  const dropDownItems = (data) => {
    const dropDownItemList = [
      {
        key: "1",
        label: (
          <Link
            to={`/print/${data?._id}`}
            className="text-blue-600"
            key={data?._id}
          >
            Print
          </Link>
        ),
      },

      {
        key: "2",
        label: (
          <div key={data?._id} className="text-green-600" onClick={handleEdit}>
            Edit
          </div>
        ),
      },
      {
        key: "3",
        label: (
          <div key={data?._id} className="text-red-600" onClick={handleDelete}>
            Delete
          </div>
        ),
      },
    ];

    return dropDownItemList;
  };
  async function fetchSalaryDetails() {
    try {
      setEmployeeDetailsLoading(true);
      const responseData = await API.get(`/employee/${formData.employee_id}`);
      const filteredEmployeeDetails = responseData?.data?.data;
      const { deductions = deductionsObject, earnings = earningsObject } =
        filteredEmployeeDetails;
      setEmployeeDetails(filteredEmployeeDetails);
      setFormData((prev) => ({ ...prev, deductions, earnings }));
    } catch (error) {
      setEmployeeDetails({});
    } finally {
      setEmployeeDetailsLoading(false);
    }
  }
  useEffect(() => {
    fetchSalaryDetails();
  }, [formData?.employee_id]);

  const handleChange = (name, value) => {
    // setEmployeeDetails({});
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleDeductionsChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      earnings: { ...prev.earnings },
      deductions: { ...prev.deductions, [name]: value },
    }));
  };
  const handleEarningsChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      earnings: { ...prev.earnings, [name]: value },
      deductions: { ...prev.deductions },
    }));
  };
  async function handleCalculateSalary() {
    try {
      console.log(formData, "this s");
    } catch (error) {}
  }
  async function getAllSalary() {
    try {
      const response = await API.get("/salary-payment/all");
      const responseData = response?.data?.data || [];
      const filteredData = responseData.map((data, index) => ({
        siNo: index + 1,
        _id: data?._id,
        employeeName: data?.employee_id?.name,
        employeeCode: data?.employee_id?.employeeCode,
        salaryMonth: data?.salary_month,
        salaryYear: data?.salary_year,
        payDate: new Date(data?.pay_date).toISOString().split("T")[0],
        netPayable: data?.net_payable,
        paidAmount: data?.paid_amount,
        transactionId: data?.transaction_id,
        action: (
          <div className="flex justify-center gap-2">
            <Dropdown
              key={data?._id}
              trigger={["click"]}
              menu={{
                items: dropDownItems(data),
              }}
              placement="bottomLeft"
            >
              <IoMdMore className="text-bold" />
            </Dropdown>
          </div>
        ),
      }));
      setAllSalarypayments([...filteredData]);
    } catch (error) {
      setAllSalarypayments([]);
    }
  }
  useEffect(() => {
    getAllSalary();
  }, []);
  return (
    <div>
      <div className="flex mt-20">
        <Navbar visibility={true} />
        <Sidebar />
        <div className="flex-grow p-7">
          <h1 className="text-2xl font-semibold">Salary Payment</h1>
          <div className="mt-6 mb-8">
            <div className="mb-10">
              <div className="flex justify-end items-center w-full">
                <div>
                  <button
                    onClick={() => setIsOpenAddModal(true)}
                    className="ml-4 bg-blue-950 text-white px-4 py-2 rounded shadow-md hover:bg-blue-800 transition duration-200"
                  >
                    + Add Salary Payment
                  </button>
                </div>
              </div>
            </div>

            <DataTable columns={columns} data={allSalaryPayments} />
          </div>
        </div>

        <Drawer
          title="Add New Salary Payment"
          width={"87%"}
          className="payment-drawer"
          open={isOpenAddModal}
          onClose={() => setIsOpenAddModal(false)}
          closable={true}
        >
          <div className="space-y-6">
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Employee <span className="text-red-600">*</span>
              </label>
              <Select
                showSearch
                optionFilterProp="label"
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                filterSort={(optionA, optionB) =>
                  (optionA?.label ?? "")
                    .toLowerCase()
                    .localeCompare((optionB?.label ?? "").toLowerCase())
                }
                style={{ width: "100%" }}
                placeholder="Search to Select Employee"
                options={employees}
                onChange={(value) => handleChange("employee_id", value)}
              />
            </div>

            {!employeeDetailsLoading ? (
              formData.employee_id &&
              Object.values(employeeDetails).length > 0 && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Year <span className="text-red-600">*</span>
                      </label>
                      <DatePicker
                        value={
                          formData.year ? dayjs(formData.year, "YYYY") : null
                        }
                        onChange={(date, dateString) =>
                          handleChange("year", dateString)
                        }
                        picker="year"
                        style={{ width: "100%" }}
                      />
                    </div>
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Month <span className="text-red-600">*</span>
                      </label>
                      <Segmented
                        className="[&_.ant-segmented-item-selected]:!bg-green-600 [&_.ant-segmented-item-selected]:!text-white"
                        value={formData.month}
                        options={months}
                        onChange={(value) => handleChange("month", value)}
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Employee Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Name
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                          placeholder="Name"
                          value={employeeDetails?.name}
                          disabled
                        />
                      </div>
                      <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                          placeholder="Email"
                          value={employeeDetails?.email}
                          disabled
                        />
                      </div>
                      <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                          placeholder="Phone Number"
                          value={employeeDetails?.phone_number}
                          disabled
                        />
                      </div>
                      <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Joining Date
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                          placeholder="Joining Date"
                          value={employeeDetails?.joining_date?.split("T")[0]}
                          disabled
                        />
                      </div>
                      <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Employee ID
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                          placeholder="Employee Id"
                          value={employeeDetails?.employeeCode}
                          disabled
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-800 mb-4">
                      Earnings
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Basic Salary <span className="text-red-600">*</span>
                        </label>
                        <input
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Enter Basic Salary"
                          onChange={(e) =>
                            handleEarningsChange(e.target.name, e.target.value)
                          }
                          type="text"
                          name="basic"
                          id="basic"
                          value={formData?.earnings?.basic}
                        />
                      </div>
                      <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          House Rent Allowance (HRA)
                        </label>
                        <input
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Enter House Rent Allowance"
                          onChange={(e) =>
                            handleEarningsChange(e.target.name, e.target.value)
                          }
                          type="text"
                          name="hra"
                          id="hra"
                          value={formData?.earnings?.hra}
                        />
                      </div>
                      <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Travel Allowance
                        </label>
                        <input
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Enter Travel Allowance"
                          onChange={(e) =>
                            handleEarningsChange(e.target.name, e.target.value)
                          }
                          type="text"
                          name="travel_allowance"
                          id="travel_allowance"
                          value={formData?.earnings?.travel_allowance}
                        />
                      </div>
                      <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Medical Allowance
                        </label>
                        <input
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Enter Medical Allowance"
                          onChange={(e) =>
                            handleEarningsChange(e.target.name, e.target.value)
                          }
                          type="text"
                          name="medical_allowance"
                          id="medical_allowance"
                          value={formData?.earnings?.medical_allowance}
                        />
                      </div>
                      <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Basket of Benefits
                        </label>
                        <input
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Enter Basket Of Benefits"
                          onChange={(e) =>
                            handleEarningsChange(e.target.name, e.target.value)
                          }
                          type="text"
                          name="basket_of_benifits"
                          id="basket_of_benifits"
                          value={formData?.earnings?.basket_of_benifits}
                        />
                      </div>
                      <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Performance Bonus
                        </label>
                        <input
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Enter Performance Bonus"
                          onChange={(e) =>
                            handleEarningsChange(e.target.name, e.target.value)
                          }
                          type="text"
                          name="performance_bonus"
                          id="performance_bonus"
                          value={formData?.earnings?.performance_bonus}
                        />
                      </div>
                      <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Other Allowances
                        </label>
                        <input
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Enter Other Allowances"
                          onChange={(e) =>
                            handleEarningsChange(e.target.name, e.target.value)
                          }
                          type="text"
                          name="other_allowances"
                          id="other_allowances"
                          value={formData?.earnings?.other_allowances}
                        />
                      </div>
                      <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Conveyance
                        </label>
                        <input
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Enter Conveyance"
                          onChange={(e) =>
                            handleEarningsChange(e.target.name, e.target.value)
                          }
                          type="text"
                          name="conveyance"
                          id="conveyance"
                          value={formData?.earnings?.conveyance}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-red-800 mb-4">
                      Deductions
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Income Tax
                        </label>
                        <input
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="Enter Income Tax"
                          onChange={(e) =>
                            handleDeductionsChange(
                              e.target.name,
                              e.target.value
                            )
                          }
                          type="text"
                          name="income_tax"
                          id="income_tax"
                          value={formData?.deductions?.income_tax}
                        />
                      </div>
                      <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ESI (Employee State Insurance)
                        </label>
                        <input
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="Enter ESI"
                          onChange={(e) =>
                            handleDeductionsChange(
                              e.target.name,
                              e.target.value
                            )
                          }
                          type="text"
                          name="esi"
                          id="esi"
                          value={formData?.deductions?.esi}
                        />
                      </div>
                      <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          EPF (Employee Provident Fund)
                        </label>
                        <input
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="Enter EPF"
                          onChange={(e) =>
                            handleDeductionsChange(
                              e.target.name,
                              e.target.value
                            )
                          }
                          type="text"
                          name="epf"
                          id="epf"
                          value={formData?.deductions?.epf}
                        />
                      </div>
                      <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Professional Tax
                        </label>
                        <input
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="Enter Professional Tax"
                          onChange={(e) =>
                            handleDeductionsChange(
                              e.target.name,
                              e.target.value
                            )
                          }
                          type="text"
                          name="professional_tax"
                          id="professional_tax"
                          value={formData?.deductions?.professional_tax}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Calculate Button */}
                  <div className="flex justify-end pt-4">
                    <Button
                      type="primary"
                      onClick={handleCalculateSalary}
                      size="large"
                      className="px-8"
                    >
                      Calculate Salary
                    </Button>
                  </div>
                </>
              )
            ) : (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-4 text-gray-600">
                    Loading employee details...
                  </p>
                </div>
              </div>
            )}
          </div>
        </Drawer>
        {/* update Drawer */}
        <Drawer
          title="Update Salary"
          width={"50%"}
          className="payment-drawer"
          open={isOpenUpdateModal}
          onClose={() => setIsOpenUpdateModal(false)}
          closable={true}
        >
          <input
            type="text"
            name="employee_name"
            id="employee_name"
            placeholder="Enter Employee Name"
            onChange={handleCalculateSalary}
          />
          <input
            type="text"
            name="employee_phone"
            id="employee_phone"
            placeholder="Enter Employee Phone"
            onChange={handleCalculateSalary}
          />
          <input
            type="text"
            name="salary_month"
            id="salary_month"
            placeholder="Enter Salary Month"
            onChange={handleCalculateSalary}
          />
          <input
            type="text"
            name="salary_year"
            id="salary_year"
            placeholder="Enter Salary Year"
            onChange={handleCalculateSalary}
          />
          <input
            type="text"
            name="pay_date"
            id="pay_date"
            placeholder="Enter Pay Date"
            onChange={handleCalculateSalary}
          />
          <input
            type="text"
            name="net_payable"
            id="net_payable"
            placeholder="Enter Net Payable"
            onChange={handleCalculateSalary}
          />
          <input
            type="text"
            name="paid_amount"
            id="paid_amount"
            placeholder="Enter Paid Amount"
            onChange={handleCalculateSalary}
          />
          <input
            type="text"
            name="paid_days"
            id="paid_days"
            placeholder="Enter Salary Month"
            onChange={handleCalculateSalary}
          />
          <input
            type="text"
            name="remaining_balance"
            id="remaining_balance"
            placeholder="Enter Salary Month"
            onChange={handleCalculateSalary}
          />
          <input
            type="text"
            name="basic"
            id="basic"
            placeholder="Enter Basic Salary"
            onChange={handleCalculateSalary}
          />
          <input
            type="text"
            name="hra"
            id="hra"
            placeholder="Enter HRA"
            onChange={handleCalculateSalary}
          />
          <input
            type="text"
            name="travel_allowance"
            id="travel_allowance"
            placeholder="Enter Travel Allowance"
            onChange={handleCalculateSalary}
          />
          <input
            type="text"
            name="medical_allowance"
            id="medical_allowance"
            placeholder="Enter Medical Allowance"
            onChange={handleCalculateSalary}
          />
          <input
            type="text"
            name="basket_of_benifits"
            id="basket_of_benifits"
            placeholder="Enter Basket of Benifits"
            onChange={handleCalculateSalary}
          />
          <input
            type="text"
            name="performance_bonus"
            id="performance_bonus"
            placeholder="Enter Performance Bonus"
            onChange={handleCalculateSalary}
          />
          <input
            type="text"
            name="other_allowances"
            id="other_allowances"
            placeholder="Enter Other Allowance"
            onChange={handleCalculateSalary}
          />
          <input
            type="text"
            name="conveyance"
            id="conveyance"
            placeholder="Enter Conveyance"
            onChange={handleCalculateSalary}
          />
          <Button color="primary">Calculate Salary</Button>
          <Button color="primary">Update Salary</Button>
        </Drawer>
        <Modal loading={updateLoading}>
          Delete Salary Payment
          <Button>Delete Payment</Button>
        </Modal>
      </div>
    </div>
  );
};

export default SalaryPayment;
