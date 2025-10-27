import React, { useEffect, useState } from "react";
import { Select, Radio } from "antd";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import CircularLoader from "../components/loaders/CircularLoader";
import Navbar from "../components/layouts/Navbar";
import Modal from "../components/modals/Modal";
import { GiPartyPopper } from "react-icons/gi";
import { Collapse } from "antd";
import { Link } from "react-router-dom";
import {
  FileTextOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { FaMoneyBill } from "react-icons/fa";
import { MdPayments } from "react-icons/md";
const TargetIncentive = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [dateSelectionMode, setDateSelectionMode] = useState("month");
  const [agentLoading, setAgentLoading] = useState(false);
  const [selectedEmployeeDetails, setSelectedEmployeeDetails] = useState(null);
  const [employeeCustomerData, setEmployeeCustomerData] = useState([]);
  const [commissionTotalDetails, setCommissionTotalDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [commissionForm, setCommissionForm] = useState({
    agent_id: "",
    pay_date: new Date().toISOString().split("T")[0],
    amount: "",
    pay_type: "cash",
    transaction_id: "",
    note: "",
    pay_for: "commission",
    admin_type: "",
  });
  const [errors, setErrors] = useState({});
  const [adminId, setAdminId] = useState("");
  const [adminName, setAdminName] = useState("");
  const [targetData, setTargetData] = useState({
    target: 0,
    achieved: 0,
    remaining: 0,
    startDate: "",
    endDate: "",
    incentiveAmount: 0,
  });
  // Initialize fromDate and toDate with default values
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [isFiltering, setIsFiltering] = useState(false);
  const [tempSelectedMonth, setTempSelectedMonth] = useState(null);
  const [tempFromDate, setTempFromDate] = useState(null);
  const [tempToDate, setTempToDate] = useState(null);
  // Initialize with current month
  useEffect(() => {
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}`;
    setTempSelectedMonth(currentMonth);
    setSelectedMonth(currentMonth);
    // Set current month's date range
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const firstDay = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).toISOString().split("T")[0];
    setTempFromDate(firstDay);
    setTempToDate(lastDay);
    setFromDate(firstDay);
    setToDate(lastDay);
  }, []);
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setAdminId(user._id);
      setAdminName(user.name || "");
    }
  }, []);
  const fetchEmployees = async () => {
    try {
      const res = await api.get("/agent/get-employee");
      setEmployees(res?.data?.employee);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };
  
  // Modified to accept date parameters directly
  const fetchCommissionReport = async (employeeId, startDate, endDate) => {
    if (!employeeId || !startDate || !endDate) return;
    const abortController = new AbortController();
    setLoading(true);
    try {
      let params = {
        start_date: startDate,
        end_date: endDate,
      };
      
      const res = await api.get(`/enroll/employee/${employeeId}/incentive`, {
        params,
        signal: abortController.signal,
      });
      setEmployeeCustomerData(res.data?.incentiveData);
      setCommissionTotalDetails({
        actual_business: res.data?.incentiveSummary?.total_group_value,
        total_actual: res.data?.incentiveSummary?.total_incentive_value,
        total_customers: res.data?.incentiveSummary?.total_enrollments,
        total_groups: res.data?.incentiveSummary?.total_enrollments,
        expected_business: res.data?.incentiveSummary?.total_group_value,
        total_estimated: res.data?.incentiveSummary?.total_incentive_value
      });
    } catch (err) {
      if (err.name !== "AbortController") {
        console.error("Error fetching employee report:", err);
        setEmployeeCustomerData([]);
        setCommissionTotalDetails({});
      }
    } finally {
      if (!abortController.signal.aborted) {
        setLoading(false);
      }
    }
  };
  

  
  // Modified to accept date parameters directly
  const fetchTargetData = async (employeeId, startDate, endDate) => {
    if (!employeeId || !startDate || !endDate) return;
    try {
      const res = await api.get(`/target/employees/${employeeId}`, {
        params: { start_date: startDate, end_date: endDate },
      });
      if (res.data.status && res.data.total_target !== undefined) {
        const totalTarget = Number(res.data.total_target);
        // Now fetch achieved business from incentive report
        let params = {
          start_date: startDate,
          end_date: endDate,
        };
        
        const { data: comm } = await api.get(`/enroll/employee/${employeeId}/incentive`, {
          params,
        });
        let achieved = comm?.incentiveSummary?.total_group_value || 0;
        if (typeof achieved === "string") {
          achieved = Number(achieved.replace(/[^0-9.-]+/g, ""));
        }
        const remaining = Math.max(totalTarget - achieved, 0);
        const difference = achieved - totalTarget;
        const incentiveAmount = difference > 0 ? difference * 0.01 : 0;
        setTargetData({
          target: Math.round(totalTarget),
          achieved: Math.round(achieved),
          remaining: Math.round(remaining),
          difference: Math.round(difference),
          startDate: startDate,
          endDate: endDate,
          incentiveAmount: parseFloat(incentiveAmount.toFixed(2)),
        });
      } else {
        throw new Error("Invalid target response");
      }
    } catch (err) {
      console.error("Error fetching target data:", err);
      setTargetData({
        target: 0,
        achieved: 0,
        remaining: 0,
        difference: 0,
        startDate: "",
        endDate: "",
        incentiveAmount: 0,
      });
    }
  };
  
  const fetchAllCommissionReport = async () => {
    if (!fromDate || !toDate) return;
    const abortController = new AbortController();
    setLoading(true);
    try {
      let params = {
        start_date: fromDate,
        end_date: toDate,
      };
      
      const res = await api.get("/enroll/incentive", {
        params,
        signal: abortController.signal,
      });
      // The new API returns commissionData and commissionSummary
      setEmployeeCustomerData(res.data?.commissionData);
      setCommissionTotalDetails({
        actual_business: res.data?.commissionSummary?.total_group_value,
        total_actual: res.data?.commissionSummary?.total_commission_value,
        total_customers: res.data?.commissionSummary?.total_enrollments,
        total_groups: res.data?.commissionSummary?.total_enrollments,
        expected_business: res.data?.commissionSummary?.total_group_value,
        total_estimated: res.data?.commissionSummary?.total_commission_value
      });
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Error fetching all commission report:", err);
        setEmployeeCustomerData([]);
        setCommissionTotalDetails({});
      }
    } finally {
      if (!abortController.signal.aborted) {
        setLoading(false);
      }
    }
  };
  
  const handleEmployeeChange = (value) => {
    setSelectedEmployeeId(value);
    setSelectedEmployeeDetails(null);
    setEmployeeCustomerData([]);
    setCommissionTotalDetails({});
    setTargetData({
      target: 0,
      achieved: 0,
      remaining: 0,
      startDate: "",
      endDate: "",
      incentiveAmount: 0,
    });
  };
  
  const handleTempMonthChange = (e) => {
    const selectedMonth = e.target.value;
    setTempSelectedMonth(selectedMonth);
    if (selectedMonth) {
      const [year, month] = selectedMonth.split("-");
      const firstDay = `${year}-${month}-01`;
      const lastDay = new Date(year, month, 0).toISOString().split("T")[0];
      setTempFromDate(firstDay);
      setTempToDate(lastDay);
    }
  };
  
  // CORRECTED: We now calculate the date range first and pass it directly to API calls
  const applyFilter = async () => {
    if (!selectedEmployeeId) {
      alert("Please select an employee.");
      return;
    }
    if (dateSelectionMode === "month" && !tempSelectedMonth) {
      alert("Please select a month.");
      return;
    }
    if (dateSelectionMode === "date-range" && (!tempFromDate || !tempToDate)) {
      alert("Please select both From and To dates.");
      return;
    }
    
    // 👇 CRITICAL: Enable summary UI
    setIsFiltering(true);
    
    let startDate, endDate;
    
    // Calculate the date range we want to use
    if (dateSelectionMode === "month") {
      setSelectedMonth(tempSelectedMonth);
      const [year, month] = tempSelectedMonth.split("-");
      startDate = `${year}-${month}-01`;
      endDate = new Date(year, month, 0).toISOString().split("T")[0];
      setFromDate(startDate);
      setToDate(endDate);
    } else {
      startDate = tempFromDate;
      endDate = tempToDate;
      setFromDate(startDate);
      setToDate(endDate);
    }
    
    setLoading(true);
    setAgentLoading(true);
    try {
      if (selectedEmployeeId === "ALL") {
        setSelectedEmployeeDetails(null);
        setTargetData({
          target: 0,
          achieved: 0,
          remaining: 0,
          startDate: "",
          endDate: "",
          incentiveAmount: 0,
        });
        await fetchAllCommissionReport();
      } else {
        const emp = employees.find(e => e._id === selectedEmployeeId);
        setSelectedEmployeeDetails(emp || null);
        // Pass the calculated date range directly to the API calls
        await fetchCommissionReport(selectedEmployeeId, startDate, endDate);
        await fetchTargetData(selectedEmployeeId, startDate, endDate);
      }
    } finally {
      setAgentLoading(false);
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchEmployees();
  }, []);
  
  const handleCommissionChange = (e) => {
    const { name, value } = e.target;
    setCommissionForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };
  
  const validateForm = () => {
    const newErrors = {};
    if (!commissionForm.agent_id) newErrors.agent_id = "Please select an agent";
    if (!commissionForm.amount || isNaN(commissionForm.amount))
      newErrors.amount = "Please enter a valid amount";
    if (commissionForm.pay_type === "online" && !commissionForm.transaction_id)
      newErrors.transaction_id = "Transaction ID is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleCommissionSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const payload = { ...commissionForm, admin_type: adminId };
      await api.post("/payment-out/add-commission-payment", payload);
      alert("Commission Paid Successfully!");
      setShowCommissionModal(false);
    } catch (err) {
      alert("Failed to add payment.");
    }
  };
  
  const processedTableData = employeeCustomerData.map((item, index) => ({
    ...item,
    // Format the numeric values for display
    group_value_digits: item.group_id?.group_value,
    group_ticket:item.ticket || "N/A",
     
    estimated_commission_digits: item?.estimated_commission || 0,
     
    net_incentive_digits: item?.incentive_value || 0,
    incentive_percentage: item?.group_id?.incentives || 0,
      
    total_paid_digits: item?.total_paid_amount || 0,
     
    required_installment_digits: item?.group_id?.monthly_installment || 0,
      
    incentive_released: item.incentive_released ? "Yes" : "No",
    user_name: item.user_id?.full_name || "N/A",
    phone_number: item.user_id?.phone_number || "N/A",
    group_name: item.group_id?.group_name || "N/A",
    start_date: item.group_id?.start_date
      ? new Date(item.group_id.start_date)?.toISOString()?.split("T")?.[0]
      : "N/A",
  }));
  
  const columns = [
    { key: "user_name", header: "Customer Name" },
    { key: "phone_number", header: "Phone Number" },
    { key: "group_name", header: "Group Name" },
    { key: "group_ticket", header: "Ticket No" },
    { key: "group_value_digits", header: "Group Value" },
    { key: "start_date", header: "Start Date" },
    { key: "incentive_percentage", header: "Net Incentive Percentage" },
    { key: "net_incentive_digits", header: "Net  Incentive" },
    { key: "total_paid_digits", header: "Total Paid" },
    { key: "required_installment_digits", header: "First Installment Amount" },
    { key: "incentive_released", header: "Incentive Released" },
  ];
  
  // Get current month for max attribute
  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}`;
  
  return (
    <div className="w-screen min-h-screen">
      <div className="flex mt-30">
        <Navbar visibility={true} />
        <div className="flex-grow p-7">
          <h1 className="text-2xl font-bold text-center ">
            Reports - Incentive
          </h1>
          <div className="mt-11 mb-8">
            <div className="mb-2">
              <div className="flex justify-center items-center w-full gap-4 bg-blue-50 p-2 w-30 h-40 rounded-3xl border   space-x-2">
                <div className="mb-2">
                  <label className="block text-lg text-gray-500 text-center font-semibold mb-2">
                    Employee
                  </label>
                  <Select
                    value={selectedEmployeeId || undefined}
                    onChange={handleEmployeeChange}
                    showSearch
                    popupMatchSelectWidth={false}
                    placeholder="Search or Select Employee"
                    filterOption={(input, option) =>
                      option.children
                        .toString()
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    style={{ height: "50px", width: "600px" }}
                  >
                    <Select.Option value="ALL">All</Select.Option>
                    {employees.map((emp) => (
                      <Select.Option key={emp._id} value={emp._id}>
                        {emp.name} - {emp.phone_number}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
                {/* Date Selection Mode Toggle */}
                <div className="mb-2">
                  <label className="block text-lg text-gray-500 text-center font-semibold mb-2">
                    Date Selection
                  </label>
                  <Radio.Group
                    value={dateSelectionMode}
                    onChange={(e) => setDateSelectionMode(e.target.value)}
                    className="flex space-x-4"
                  >
                    <Radio value="month">By Month</Radio>
                    <Radio value="date-range">By Date Range</Radio>
                  </Radio.Group>
                </div>
                {/* Show appropriate date picker based on selection mode */}
                {dateSelectionMode === "month" ? (
                  <div className="mb-2">
                    <label className="block text-lg text-gray-500 text-center font-semibold mb-2">
                      Month
                    </label>
                    <input
                      type="month"
                      value={tempSelectedMonth || ""}
                      max={currentMonth}
                      onChange={handleTempMonthChange}
                      className="border border-gray-300 rounded px-4 py-2 w-[200px] h-[50px]"
                    />
                  </div>
                ) : (
                  <>
                    <div className="mb-2">
                      <label className="block text-lg text-gray-500 text-center font-semibold mb-2">
                        From Date
                      </label>
                      <input
                        type="date"
                        value={tempFromDate || ""}
                        max={tempToDate || currentMonth}
                        onChange={(e) => setTempFromDate(e.target.value)}
                        className="border border-gray-300 rounded px-4 py-2 w-[200px] h-[50px]"
                      />
                    </div>
                    <div className="mb-2">
                      <label className="block text-lg text-gray-500 text-center font-semibold mb-2">
                        To Date
                      </label>
                      <input
                        type="date"
                        value={tempToDate || ""}
                        min={tempFromDate || ""}
                        max={currentMonth}
                        onChange={(e) => setTempToDate(e.target.value)}
                        className="border border-gray-300 rounded px-4 py-2 w-[200px] h-[50px]"
                      />
                    </div>
                  </>
                )}
                {/* Filter button */}
                <div className="mb-2 flex items-end">
                  <button
                    onClick={applyFilter}
                    className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Filter
                  </button>
                </div>
              </div>
            </div>
          </div>
          {agentLoading ? (
            <div className="flex justify-center py-10">
              <CircularLoader isLoading={true} />
            </div>
          ) : (
            <>
              <div className="my-6">
                <Collapse
                  items={[
                    {
                      key: "1",
                      label: (
                        <span className="font-semibold text-gray-800 text-base">
                          Shortcut Keys
                        </span>
                      ),
                      children: (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          <Link
                            to="/reports/target-commission"
                            className="flex text-base items-center gap-2 border  border-gray-200 rounded-lg px-4 py-2 text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-colors"
                          >
                            <DollarOutlined
                              className="text-blue-500"
                              size={30}
                            />
                            Commission Report
                          </Link>
                          <Link
                            to="/reports/target-incentive"
                            className="flex text-base items-center gap-2 border  border-gray-200 rounded-lg px-4 py-2 text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-colors"
                          >
                            <FileTextOutlined
                              className="text-blue-500"
                              size={30}
                            />
                            Incentive Report
                          </Link>
                          <Link
                            to="/target-commission-incentive"
                            className="flex text-base items-center gap-2 border  border-gray-200 rounded-lg px-4 py-2 text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-colors"
                          >
                            <MdPayments className="text-blue-500" size={30} />
                            Commission or Incentive Payout
                          </Link>
                          <Link
                            to="/payment-menu/payment-in-out-menu/payment-out/salary"
                            className="flex text-base items-center gap-2 border  border-gray-200 rounded-lg px-4 py-2 text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-colors"
                          >
                            <FaMoneyBill className="text-blue-500" size={30} />
                            Salary Payout
                          </Link>
                        </div>
                      ),
                    },
                  ]}
                  defaultActiveKey={["1"]}
                  className="rounded-lg border border-gray-200 bg-white shadow-sm"
                />
              </div>
              {isFiltering && ((dateSelectionMode === "month" && selectedMonth) ||
                (dateSelectionMode === "date-range" && fromDate && toDate)) &&
                (selectedEmployeeId === "ALL" || selectedEmployeeDetails) && (
                  <div className="mb-8 bg-gray-50 rounded-md shadow-md p-6 space-y-4">
                    {selectedEmployeeId !== "ALL" && selectedEmployeeDetails && (
                      <>
                        <div className="flex gap-4">
                          <div className="flex flex-col flex-1">
                            <label className="text-sm font-medium mb-1">Name</label>
                            <input
                              value={selectedEmployeeDetails.name || "-"}
                              readOnly
                              className="border border-gray-300 rounded px-4 py-2 bg-white"
                            />
                          </div>
                          <div className="flex flex-col flex-1">
                            <label className="text-sm font-medium mb-1">Email</label>
                            <input
                              value={selectedEmployeeDetails.email || "-"}
                              readOnly
                              className="border border-gray-300 rounded px-4 py-2 bg-white"
                            />
                          </div>
                          <div className="flex flex-col flex-1">
                            <label className="text-sm font-medium mb-1">Phone Number</label>
                            <input
                              value={selectedEmployeeDetails.phone_number || "-"}
                              readOnly
                              className="border border-gray-300 rounded px-4 py-2 bg-white"
                            />
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <div className="flex flex-col flex-1">
                            <label className="text-sm font-medium mb-1">Adhaar Number</label>
                            <input
                              value={selectedEmployeeDetails.adhaar_no || "-"}
                              readOnly
                              className="border border-gray-300 rounded px-4 py-2 bg-white"
                            />
                          </div>
                          <div className="flex flex-col flex-1">
                            <label className="text-sm font-medium mb-1">PAN Number</label>
                            <input
                              value={selectedEmployeeDetails.pan_no || "-"}
                              readOnly
                              className="border border-gray-300 rounded px-4 py-2 bg-white"
                            />
                          </div>
                          <div className="flex flex-col flex-1">
                            <label className="text-sm font-medium mb-1">Pincode</label>
                            <input
                              value={selectedEmployeeDetails.pincode || "-"}
                              readOnly
                              className="border border-gray-300 rounded px-4 py-2 bg-white"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <label className="text-sm font-medium mb-1">Address</label>
                          <input
                            value={selectedEmployeeDetails.address || "-"}
                            readOnly
                            className="border border-gray-300 rounded px-4 py-2 bg-white"
                          />
                        </div>
                      </>
                    )}
                    {/* ✅ CORRECTED SUMMARY: Two rows */}
                    <div className="flex gap-4">
                      <div className="flex flex-col flex-1">
                        <label className="text-sm font-medium mb-1">Net Business</label>
                        <input
                          value={commissionTotalDetails?.actual_business || "-"}
                          readOnly
                          className="border border-gray-300 rounded px-4 py-2 bg-white text-green-700 font-bold"
                        />
                      </div>
                      <div className="flex flex-col flex-1">
                        <label className="text-sm font-medium mb-1">Incentive (1% each)</label>
                        <input
                          value={commissionTotalDetails?.total_actual || "-"}
                          readOnly
                          className="border border-gray-300 rounded px-4 py-2 bg-white text-green-700 font-bold"
                        />
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex flex-col flex-1">
                        <label className="text-sm font-medium mb-1">Net Customers</label>
                        <input
                          value={commissionTotalDetails?.total_customers || "-"}
                          readOnly
                          className="border border-gray-300 rounded px-4 py-2 bg-white"
                        />
                      </div>
                      <div className="flex flex-col flex-1">
                        <label className="text-sm font-medium mb-1">Total Groups</label>
                        <input
                          value={commissionTotalDetails?.total_groups || "-"}
                          readOnly
                          className="border border-gray-300 rounded px-4 py-2 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}
              {isFiltering && ((dateSelectionMode === "month" && selectedMonth) ||
                (dateSelectionMode === "date-range" && fromDate && toDate)) &&
                selectedEmployeeId &&
                selectedEmployeeId !== "ALL" && (
                  <div className="bg-gray-100  p-4 rounded-lg shadow mb-6">
                    <h2 className="text-lg font-bold text-yellow-800 mb-2">
                      Target Details
                    </h2>
                    {targetData.achieved >= targetData.target && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-green-100 border border-green-400 my-4">
                        <GiPartyPopper size={30} color="green" />
                        <span className="text-green-800 font-semibold">
                          Target Achieved
                        </span>
                      </div>
                    )}
                    <div className="grid md:grid-cols-3 gap-4 bg-gray-50 ">
                      <div>
                        <label className="block font-medium">Target Set</label>
                        <input
                          value={`${targetData.target?.toLocaleString(
                            "en-IN"
                          )}`}
                          readOnly
                          className="border px-3 py-2 rounded w-full bg-gray-50 font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block font-medium">Achieved</label>
                        <input
                          value={`${targetData.achieved?.toLocaleString(
                            "en-IN"
                          )}`}
                          readOnly
                          className="border px-3 py-2 rounded w-full bg-gray-50 font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block font-medium">Difference</label>
                        <input
                          value={`${targetData.difference?.toLocaleString(
                            "en-IN"
                          )}`}
                          readOnly
                          className="border px-3 py-2 rounded w-full bg-gray-50 font-semibold"
                        />
                      </div>
                      {/* MODIFIED: Total Payable now shows incentive amount */}
                      <div>
                        <label className="block font-medium">
                          Total Payable
                        </label>
                        <input
                          readOnly
                          value={`${targetData.incentiveAmount.toLocaleString(
                            "en-IN",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}`}
                          className="border px-3 py-2 rounded w-full bg-gray-50 text-green-700 font-bold"
                        />
                      </div>
                      {/* ADDED: Incentive breakdown for clarity */}
                      <div className="col-span-3">
                        <div className="bg-blue-50 p-3 rounded">
                          <p className="text-sm font-medium text-blue-800">
                            Incentive Breakdown:
                          </p>
                          <ul className="list-disc pl-5 text-sm text-gray-700 mt-1">
                            <li>Up to target (0%): 0.00</li>
                            {targetData.achieved > targetData.target && (
                              <li>
                                Beyond target (1%): 
                                {(
                                  (targetData.achieved - targetData.target) *
                                  0.01
                                ).toLocaleString("en-IN", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              <Modal
                isVisible={showCommissionModal}
                onClose={() => setShowCommissionModal(false)}
                width="max-w-md"
              >
                <div className="py-6 px-5 text-left">
                  <h3 className="mb-4 text-xl font-bold text-gray-900 border-b pb-2">
                    Add Commission Payment
                  </h3>
                  <form className="space-y-4" onSubmit={handleCommissionSubmit}>
                    <div>
                      <label className="block text-sm font-medium">
                        Agent Name
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={
                          employees.find(
                            (emp) => emp._id === commissionForm.agent_id
                          )?.name || ""
                        }
                        className="w-full border p-2 rounded bg-gray-100 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">
                        Payment Date
                      </label>
                      <input
                        type="date"
                        name="pay_date"
                        value={commissionForm.pay_date}
                        onChange={handleCommissionChange}
                        className="w-full border p-2 rounded"
                      />
                    </div>
                    {/* MODIFIED: Total Payable Commission now shows incentive amount */}
                    <div>
                      <label className="block text-sm font-medium">
                        Total Payable Commission
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={`${commissionForm.amount || "0.00"}`}
                        className="w-full border p-2 rounded bg-gray-100 text-green-700 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">
                        Payment Mode
                      </label>
                      <select
                        name="pay_type"
                        value={commissionForm.pay_type}
                        onChange={handleCommissionChange}
                        className="w-full border p-2 rounded"
                      >
                        <option value="cash">Cash</option>
                        <option value="online">Online</option>
                        <option value="cheque">Cheque</option>
                        <option value="bank_transfer">Bank Transfer</option>
                      </select>
                    </div>
                    {commissionForm.pay_type === "online" && (
                      <div>
                        <label className="block text-sm font-medium">
                          Transaction ID
                        </label>
                        <input
                          type="text"
                          name="transaction_id"
                          value={commissionForm.transaction_id}
                          onChange={handleCommissionChange}
                          className="w-full border p-2 rounded"
                        />
                        {errors.transaction_id && (
                          <p className="text-red-500 text-sm">
                            {errors.transaction_id}
                          </p>
                        )}
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium">Note</label>
                      <textarea
                        name="note"
                        value={commissionForm.note}
                        onChange={handleCommissionChange}
                        className="w-full border p-2 rounded"
                      />
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                      <button
                        type="button"
                        onClick={() => setShowCommissionModal(false)}
                        className="px-4 py-2 border rounded"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded"
                      >
                        Save Payment
                      </button>
                    </div>
                  </form>
                </div>
              </Modal>
              {loading ? (
                <CircularLoader isLoading={true} />
              ) : employeeCustomerData.length > 0 ? (
                <>
                  <DataTable
                    data={processedTableData}
                    columns={columns}
                    exportedPdfName={`Incentive Report`}
                    printHeaderKeys={[
                      "Name",
                      "Phone Number",
                      "Month",
                      "Target Set",
                      "Achieved",
                      "Remaining",
                      "Total Payable Commission",
                      "Actual Business",
                      "Actual Commission",
                      "Gross Business",
                      "Gross Commission",
                      "Total Customers",
                      "Total Groups",
                    ]}
                    printHeaderValues={[
                      selectedEmployeeId === "ALL"
                        ? "All Employees"
                        : selectedEmployeeDetails?.name || "-",
                      selectedEmployeeId === "ALL"
                        ? "-"
                        : selectedEmployeeDetails?.phone_number || "-",
                      ((dateSelectionMode === "month" && selectedMonth) ||
                        (dateSelectionMode === "date-range" && fromDate && toDate)) ?
                        dateSelectionMode === "month" ?
                          new Date(`${selectedMonth}-01`).toLocaleString(
                            "default",
                            {
                              month: "long",
                              year: "numeric",
                            }
                          ) :
                          `${new Date(fromDate).toLocaleDateString()} - ${new Date(toDate).toLocaleDateString()}`
                        : "-",
                      `${targetData?.target?.toLocaleString("en-IN") || "0"}`,
                      `${targetData?.achieved?.toLocaleString("en-IN") || "0"
                      }`,
                      `${targetData?.remaining?.toLocaleString("en-IN") || "0"
                      }`,
                      // MODIFIED: Using incentive amount
                      `${targetData?.incentiveAmount?.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }) || "0.00"
                      }`,
                      `${commissionTotalDetails?.actual_business?.toLocaleString(
                        "en-IN"
                      ) || "0"
                      }`,
                      `${commissionTotalDetails?.total_actual?.toLocaleString(
                        "en-IN"
                      ) || "0"
                      }`,
                      `${commissionTotalDetails?.expected_business?.toLocaleString(
                        "en-IN"
                      ) || "0"
                      }`,
                      `${commissionTotalDetails?.total_estimated?.toLocaleString(
                        "en-IN"
                      ) || "0"
                      }`,
                      commissionTotalDetails?.total_customers || "0",
                      commissionTotalDetails?.total_groups || "0",
                    ]}
                    exportedFileName={`IncentiveReport-${selectedEmployeeDetails?.name || "all"
                      }-${dateSelectionMode === "month" ? selectedMonth : `${fromDate}_to_${toDate}`}.csv`}
                  />
                </>
              ) : (
                isFiltering &&
                ((dateSelectionMode === "month" && selectedMonth) ||
                  (dateSelectionMode === "date-range" && fromDate && toDate)) &&
                selectedEmployeeDetails?.name && (
                  <p className="text-center font-bold text-lg">
                    No Incentive Data found.
                  </p>
                )
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
export default TargetIncentive;