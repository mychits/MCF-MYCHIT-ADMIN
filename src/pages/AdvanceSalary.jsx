import {
  DatePicker,
  Drawer,
  Dropdown,
  Modal,
  Input,
  Form,
  Select,
  Button,
  message,
  Popconfirm,
  Empty,
  InputNumber
} from "antd";
import Navbar from "../components/layouts/Navbar";
import Sidebar from "../components/layouts/Sidebar";
import DataTable from "../components/layouts/Datatable";
import { useEffect, useState, useMemo } from "react";
import API from "../instance/TokenInstance";
import dayjs from "dayjs";
import { IoMdMore } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { MdOutlineMan } from "react-icons/md";
import { RiMoneyRupeeCircleFill } from "react-icons/ri";
import { Flex, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import moment from "moment";
const AdvanceSalary = () => {
  const navigate = useNavigate();
  const [isOpenUpdateModal, setIsOpenUpdateModal] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [employeeDetails, setEmployeeDetails] = useState({});
  const [allSalaryPayments, setAllSalarypayments] = useState([]);
  const [employeeDetailsLoading, setEmployeeDetailsLoading] = useState(false);
  const [currentSalaryId, setCurrentSalaryId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form] = Form.useForm();
  const [updateForm] = Form.useForm();

  const [dataTableLoading, setDataTableLoading] = useState(false);
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
    additional_payments: [],
    additional_deductions: [],
    advance_payments: [],
    calculated_incentive: 0,
    payment_method: "",
    transaction_id: "",
    is_salary_paid: "",
    monthly_business_info: {
      target: 0,
      total_business_closed: 0,
      previous_remaining_target: 0,
      current_remaining_target: 0,
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
    { key: "salaryMonth", header: "Salary Month" },
    { key: "salaryYear", header: "Year" },
    { key: "netPayable", header: "Net Payable" },
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
    additional_payments: [],
    additional_deductions: [],
    advance_payments: [],
    calculated_incentive: 0,
    total_salary_payable: 0,
    paid_amount: 0,
    payment_method: "Cash",
    transaction_id: "",
    target: 0,
    incentive: 0,
    status: "Paid",
  });

  async function getSalaryById(id) {
    try {
      const response = await API.get(`/salary-payment/${id}`);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching salary by ID:", error);
      return null;
    }
  }

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

  const handleEdit = async (id) => {
    try {
      setUpdateLoading(true);
      setIsOpenUpdateModal(true);

      const salaryData = await getSalaryById(id);
      if (salaryData) {
        setCurrentSalaryId(id);
        const yearAsDayjs = dayjs(salaryData.salary_year, "YYYY");

        const paidAmount =
          salaryData.paid_amount || salaryData.total_salary_payable || 0;

        const formData = {
          employee_id: salaryData?.employee_id?._id,
          month: salaryData?.salary_month,
          year: yearAsDayjs,
          earnings: salaryData?.earnings,
          deductions: salaryData?.deductions,
          additional_payments: salaryData?.additional_payments || [],
          additional_deductions: salaryData?.additional_deductions || [],
          advance_payments: salaryData?.advance_payments || [],
          calculated_incentive: salaryData?.calculated_incentive || 0,
          total_salary_payable: salaryData?.total_salary_payable || 0,
          paid_amount: paidAmount, // Use the defaulted value
          payment_method: salaryData?.payment_method || "Cash",
          transaction_id: salaryData?.transaction_id || "",
          pay_date: salaryData?.pay_date
            ? moment(salaryData?.pay_date)
            : moment(),
          attendance_details: salaryData?.attendance_details || {},
          monthly_business_info: salaryData?.monthly_business_info || {
            target: 0,
            total_business_closed: 0,
            previous_remaining_target: 0,
            current_remaining_target: 0,
          },

          is_salary_paid: true,
        };

        setUpdateFormData(formData);
        updateForm.setFieldsValue(formData);
      }
    } catch (error) {
      message.error("Failed to fetch salary details");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleUpdateChange = (changedValues, allValues) => {
    if (changedValues.year && dayjs.isDayjs(changedValues.year)) {
      changedValues.year = changedValues.year.format("YYYY");
    }
    setUpdateFormData({
      ...updateFormData,
      ...changedValues,
      ...allValues,
    });
  };
  const handleUpdateSubmit = async () => {
    try {
      setUpdateLoading(true);
      const formValues = updateForm.getFieldsValue();
      const totalPayable = Number(formValues.total_salary_payable || 0);

      const updateData = {
        ...formValues,
      };

      await API.put(
        `/salary-payment/advance/payment/${currentSalaryId}`,
        updateData
      );
      message.success("Salary updated successfully");
      setIsOpenUpdateModal(false);
      getAllSalary();
    } catch (error) {
      console.error("Error updating salary:", error);
      message.error("Failed to update salary");
    } finally {
      setUpdateLoading(false);
    }
  };
  const handlePrint = (salaryPaymentId) => {
    navigate("/salary-slip-print/" + salaryPaymentId);
  };
  const dropDownItems = (salaryPayment) => {
    const dropDownItemList = [
      {
        key: "1",
        label: (
          <div
            key={salaryPayment?._id}
            className="text-green-600"
            onClick={() => handlePrint(salaryPayment?._id)}>
            Print
          </div>
        ),
      },
      {
        key: "2",
        label: (
          <div
            key={salaryPayment?._id}
            className="text-blue-600"
            onClick={() => handleEdit(salaryPayment._id)}>
            Pay Now
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
      const emp = responseData?.data?.data;
      const updatedEarnings = {
        ...earningsObject,
        ...emp?.earnings,
        salary: emp?.salary || 0,
      };
      const updatedDeductions = {
        ...deductionsObject,
        ...emp?.deductions,
      };
      setEmployeeDetails(emp);
      setFormData((prev) => ({
        ...prev,
        earnings: updatedEarnings,
        deductions: updatedDeductions,
      }));
    } catch (error) {
      setEmployeeDetails({});
    } finally {
      setEmployeeDetailsLoading(false);
    }
  }
  useEffect(() => {
    if (formData.employee_id && formData.month && formData.year) {
      loadTargetAndIncentive();
    }
  }, [formData.employee_id, formData.month, formData.year]);

  useEffect(() => {
    if (formData.employee_id) {
      fetchSalaryDetails();
    }
  }, [formData?.employee_id, formData.month, formData.month]);

  async function getAllSalary() {
    try {
      setDataTableLoading(true);
      const response = await API.get("/salary-payment/advance/pending");
      const responseData = response?.data?.data || [];
      const filteredData = responseData.map((data, index) => ({
        siNo: index + 1,
        _id: data?._id,
        employeeName: data?.employee_id?.name,
        employeeCode: data?.employee_id?.employeeCode,
        salaryMonth: data?.salary_month,
        salaryYear: data?.salary_year,
        netPayable: data?.total_salary_payable,
        paidAmount: data?.paid_amount,
        action: (
          <div className="flex justify-center gap-2">
            <Dropdown
              key={data?._id}
              trigger={["click"]}
              menu={{
                items: dropDownItems(data),
              }}
              placement="bottomLeft">
              <IoMdMore className="text-bold" />
            </Dropdown>
          </div>
        ),
      }));
      setAllSalarypayments([...filteredData]);
    } catch (error) {
      setAllSalarypayments([]);
    } finally {
      setDataTableLoading(false);
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
          <div className="mb-8">
            <h1 className="text-lg text-black font-bold font-mono p-2">
              Quick Navigator
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                to="/hr-menu/salary-management"
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group">
                <RiMoneyRupeeCircleFill
                  className="text-blue-600 group-hover:scale-110 transition-transform"
                  size={24}
                />
                <span className="font-medium text-gray-700 group-hover:text-blue-600">
                  HR / Salary Management
                </span>
              </Link>
              <Link
                to="/staff-menu/employee-menu/employee-statement"
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group">
                <MdOutlineMan className="text-blue-600 group-hover:scale-110 transition-transform text-lg" />
                <span className="font-medium text-gray-700 group-hover:text-blue-600">
                  Employees / Employee Statement
                </span>
              </Link>
            </div>
          </div>
          <h1 className="text-2xl font-semibold">Advances</h1>
          <div className="mt-6 mb-8">
            <div className="mb-10"></div>
            {dataTableLoading ? (
              <Spin
                indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
                className="w-full"
              />
            ) : allSalaryPayments.length > 0 ? (
              <DataTable columns={columns} data={allSalaryPayments} />
            ) : (
              <Empty description="No Advance Data Found" />
            )}
          </div>
        </div>
        <Drawer
          title={
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-indigo-600 rounded-full"></div>
              <span className="text-xl font-semibold text-gray-800">
                Advance Payments
              </span>
            </div>
          }
          width={"70%"}
          className="payment-drawer"
          open={isOpenUpdateModal}
          onClose={() => setIsOpenUpdateModal(false)}
          closable={true}
          footer={
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                size="large"
                onClick={() => setIsOpenUpdateModal(false)}
                className="px-6">
                Cancel
              </Button>
              <Button
                type="primary"
                size="large"
                onClick={handleUpdateSubmit}
                loading={updateLoading}
                className="px-6 bg-indigo-600 hover:bg-indigo-700">
                Update Advance Payments
              </Button>
            </div>
          }>
          <Form
            form={updateForm}
            layout="vertical"
            initialValues={updateFormData}
            onValuesChange={handleUpdateChange}>
            {/* Basic Information */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl mb-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-gray-600 rounded-full"></span>
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Form.Item name="employee_id" label="Employee ID">
                  <Select disabled options={employees} />
                </Form.Item>
                <Form.Item name="month" label="Month">
                  <Select disabled placeholder="Select Month">
                    {months.map((month) => (
                      <Select.Option key={month.value} value={month.value}>
                        {month.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item name="year" label="Year">
                  <DatePicker
                    disabled
                    picker="year"
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </div>
            </div>

            {/* Earnings Section */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-xl mb-6 border border-emerald-200 shadow-sm opacity-80">
              <h3 className="text-lg font-semibold text-emerald-800 mb-5 flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                    clipRule="evenodd"
                  />
                </svg>
                Earnings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  "basic",
                  "hra",
                  "travel_allowance",
                  "medical_allowance",
                  "basket_of_benifits",
                  "performance_bonus",
                  "other_allowances",
                  "conveyance",
                ].map((field) => (
                  <Form.Item
                    key={field}
                    name={["earnings", field]}
                    label={
                      <span className="text-xs font-medium text-emerald-700 uppercase tracking-wide">
                        {field.replace(/_/g, " ")}
                      </span>
                    }>
                    <Input
                      disabled
                      type="number"
                      className="bg-white"
                      prefix={<span className="text-emerald-600">₹</span>}
                    />
                  </Form.Item>
                ))}
              </div>
            </div>

            {/* Deductions Section */}
            <div className="bg-gradient-to-br from-red-50 to-rose-50 p-6 rounded-xl mb-6 border border-red-200 shadow-sm opacity-80">
              <h3 className="text-lg font-semibold text-red-800 mb-5 flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                    clipRule="evenodd"
                  />
                </svg>
                Deductions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {["income_tax", "esi", "epf", "professional_tax"].map(
                  (field) => (
                    <Form.Item
                      key={field}
                      name={["deductions", field]}
                      label={
                        <span className="text-xs font-medium text-red-700 uppercase tracking-wide">
                          {field.replace(/_/g, " ")}
                        </span>
                      }>
                      <Input
                        disabled
                        type="number"
                        className="bg-white"
                        prefix={<span className="text-red-600">₹</span>}
                      />
                    </Form.Item>
                  )
                )}
              </div>
            </div>

            {/* Attendance & Business Section */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl mb-6 border border-blue-200 shadow-sm opacity-80">
              <h3 className="text-lg font-semibold text-blue-800 mb-5 flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
                Attendance & Business
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Form.Item
                  label={
                    <span className="text-xs font-medium text-blue-700 uppercase tracking-wide">
                      Calculated Salary
                    </span>
                  }
                  name={["attendance_details", "calculated_salary"]}>
                  <Input
                    disabled
                    className="bg-white"
                    prefix={<span className="text-blue-600">₹</span>}
                  />
                </Form.Item>
                <Form.Item
                  label={
                    <span className="text-xs font-medium text-blue-700 uppercase tracking-wide">
                      Total Target
                    </span>
                  }
                  name={["monthly_business_info", "target"]}>
                  <Input
                    disabled
                    className="bg-white"
                    prefix={<span className="text-blue-600">₹</span>}
                  />
                </Form.Item>
                <Form.Item
                  label={
                    <span className="text-xs font-medium text-blue-700 uppercase tracking-wide">
                      Incentive
                    </span>
                  }
                  name="calculated_incentive">
                  <Input
                    disabled
                    className="bg-white"
                    prefix={<span className="text-blue-600">₹</span>}
                  />
                </Form.Item>
              </div>
            </div>

            {/* Advance Payments - EDITABLE */}

            {/* Additional Payments Section */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl mb-6 border border-purple-200 shadow-sm opacity-60">
              <h3 className="text-lg font-semibold text-purple-800 mb-5 flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20">
                  <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
                </svg>
                Additional Payments
              </h3>
              <Form.List name="additional_payments">
                {(fields) =>
                  fields.map(({ key, name }) => (
                    <div
                      key={key}
                      className="grid grid-cols-2 gap-4 mb-3 bg-white p-3 rounded-lg">
                      <Form.Item name={[name, "name"]} className="mb-0">
                        <Input disabled className="bg-gray-50" />
                      </Form.Item>
                      <Form.Item name={[name, "value"]} className="mb-0">
                        <Input
                          disabled
                          type="number"
                          className="bg-gray-50"
                          prefix="₹"
                        />
                      </Form.Item>
                    </div>
                  ))
                }
              </Form.List>
            </div>

            {/* Additional Deductions Section */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-xl mb-6 border border-orange-200 shadow-sm opacity-60">
              <h3 className="text-lg font-semibold text-orange-800 mb-5 flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z"
                    clipRule="evenodd"
                  />
                </svg>
                Additional Deductions
              </h3>
              <Form.List name="additional_deductions">
                {(fields) =>
                  fields.map(({ key, name }) => (
                    <div
                      key={key}
                      className="grid grid-cols-2 gap-4 mb-3 bg-white p-3 rounded-lg">
                      <Form.Item name={[name, "name"]} className="mb-0">
                        <Input disabled className="bg-gray-50" />
                      </Form.Item>
                      <Form.Item name={[name, "value"]} className="mb-0">
                        <Input
                          disabled
                          type="number"
                          className="bg-gray-50"
                          prefix="₹"
                        />
                      </Form.Item>
                    </div>
                  ))
                }
              </Form.List>
            </div>

            {/* Payment Details Section */}
            <div className="bg-gradient-to-br from-slate-50 to-gray-100 p-8 rounded-xl border-2 border-slate-300 shadow-lg opacity-80">
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path
                    fillRule="evenodd"
                    d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                    clipRule="evenodd"
                  />
                </svg>
                Payment Summary
                <span className="ml-auto px-3 py-1 bg-slate-200 text-slate-700 text-xs font-semibold rounded-full">
                  View Only
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Form.Item
                  name="total_salary_payable"
                  label={
                    <span className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                      Total Salary Payable
                    </span>
                  }>
                  <Input
                    disabled
                    prefix="₹"
                    className="font-bold text-lg bg-white border-2"
                  />
                </Form.Item>

                <Form.Item
                  name="paid_amount"
                  label={
                    <span className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                      Net Paid Amount
                    </span>
                  }>
                  <Input
                    disabled
                    prefix="₹"
                    className="font-bold text-lg bg-white border-2"
                  />
                </Form.Item>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-300">
                <Form.Item
                  name="payment_method"
                  label={
                    <span className="text-sm font-medium text-slate-700 uppercase tracking-wide">
                      Payment Mode
                    </span>
                  }>
                  <Select disabled className="bg-white" />
                </Form.Item>
                <Form.Item
                  name="transaction_id"
                  label={
                    <span className="text-sm font-medium text-slate-700 uppercase tracking-wide">
                      Transaction ID
                    </span>
                  }>
                  <Input disabled className="bg-white font-mono" />
                </Form.Item>
                <Form.Item
                  name="pay_date"
                  label={
                    <span className="text-sm font-medium text-slate-700 uppercase tracking-wide">
                      Pay Date
                    </span>
                  }>
                  <DatePicker
                    disabled
                    style={{ width: "100%" }}
                    className="bg-white"
                  />
                </Form.Item>
              </div>
            </div>
            <div className="my-4">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl mb-6 border-2 border-indigo-300 shadow-md">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-lg font-semibold text-indigo-800 flex items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                      <path
                        fillRule="evenodd"
                        d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Advance Payments
                    <span className="ml-2 px-2 py-1 bg-indigo-200 text-indigo-800 text-xs font-semibold rounded-full">
                      Editable
                    </span>
                  </h3>
                </div>
             <Form.List name="advance_payments">
  {(fields, { add, remove }) => (
    <>
      {fields.map(({ key, name, ...restField }) => (
        <div
          key={key}
          className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 mb-4 bg-white p-5 rounded-lg shadow-sm border border-indigo-100 items-start"
        >
          {/* Advance Name */}
          <Form.Item
            {...restField}
            name={[name, "name"]}
            label="Advance Name"
            className="mb-0"
            rules={[{ required: true, message: 'Required' }]}
          >
            <Input
              placeholder="e.g., Festival Advance"
              className="w-full h-[40px]"
            />
          </Form.Item>

          {/* Amount - Using InputNumber to force Number type */}
          <Form.Item
            {...restField}
            name={[name, "value"]}
            label="Amount"
            className="mb-0"
            rules={[
              { required: true, message: 'Required' },
              { type: 'number', min: 0, message: 'Must be positive' }
            ]}
          >
            <InputNumber
              prefix="₹"
              placeholder="0"
              className="w-full h-[40px] flex items-center"
              // formatter adds commas for a professional look (e.g., 10,000)
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(value) => value.replace(/\₹\s?|(,*)/g, "")}
            />
          </Form.Item>

          {/* Delete Button */}
          <div className="flex items-end h-[64px]"> 
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              onClick={() => remove(name)}
              className="h-[40px] w-[40px] flex items-center justify-center"
            />
          </div>
        </div>
      ))}

      <Button
        type="dashed"
        onClick={() => add()}
        block
        icon={<PlusOutlined />}
        className="h-12 border-indigo-200 text-indigo-600 hover:text-indigo-700"
      >
        Add Advance Payment
      </Button>
    </>
  )}
</Form.List>
              </div>
            </div>
          </Form>
        </Drawer>
      </div>
    </div>
  );
};
export default AdvanceSalary;
