/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import Sidebar from "../components/layouts/Sidebar";
import Navbar from "../components/layouts/Navbar";
import DataTable from "../components/layouts/Datatable";
import { Select, Drawer, Tag, Descriptions, Space, Typography } from "antd";
import {
  DollarCircleOutlined,
  TeamOutlined,
  TrophyOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import api from "../instance/TokenInstance";
import CircularLoader from "../components/loaders/CircularLoader";
import CustomAlertDialog from "../components/alerts/CustomAlertDialog";
import moment from "moment";

const { Text, Title } = Typography;

const EmployeeStatement = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [ledgerData, setLedgerData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [alertConfig, setAlertConfig] = useState({
    visibility: false,
    message: "Something went wrong!",
    type: "info",
  });
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [currentDetails, setCurrentDetails] = useState(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await api.get("/employee");
        const employeeData = response.data?.employee || [];
        setEmployees(employeeData);
      } catch (error) {
        console.error("Error fetching employees:", error);
        setAlertConfig({
          visibility: true,
          message: "Failed to load employees",
          type: "error",
        });
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      fetchLedgerData(selectedEmployee);
    }
  }, [selectedEmployee]);

  const fetchLedgerData = async (employeeId) => {
    try {
      setIsLoading(true);
      const response = await api.get(`/employee/ledger/${employeeId}`);
      setLedgerData(response.data.ledger || []);
      const formattedData = (response.data.ledger || []).map((item, index) => {
        const isPositiveBalance = item.balance >= 0;
        const balanceColor = isPositiveBalance
          ? "text-green-600"
          : "text-red-600";

        return {
          id: index + 1,
          month: item.month,
          calculatedSalary: item?.details?.calculated_salary,
          targetAmount: item?.details?.target,
          businessClosed: item?.details?.business_closed,
          isTargetAchieved: item?.details?.is_target_achieved ? "Yes" : "No",

          incentiveEarned: item?.details?.incentive_earned,
          additionalEarnings: item.details?.additional_payments,
          additionalDeductions: item.details?.additional_payments,
          advanceGiven: item.details?.advance_given,
          debit:
            item.debit > 0
              ? item.debit.toLocaleString("en-IN", {
                  style: "currency",
                  currency: "INR",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })
              : "-",
          credit:
            item.credit > 0
              ? item.credit.toLocaleString("en-IN", {
                  style: "currency",
                  currency: "INR",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })
              : "-",
          balance: (
            <span className={balanceColor}>
              {Math.abs(item.balance).toLocaleString("en-IN", {
                style: "currency",
                currency: "INR",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </span>
          ),
          details: item,
          action: (
            <button
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
              onClick={() => showDetailsModal(item)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              View Details
            </button>
          ),
        };
      });

      setTableData(formattedData);
    } catch (error) {
      console.error("Error fetching ledger data:", error);
      setAlertConfig({
        visibility: true,
        message: "Failed to load salary ledger",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmployeeSelect = (value) => {
    setSelectedEmployee(value);
  };

  const showDetailsModal = (item) => {
    setCurrentDetails(item);
    setDrawerVisible(true);
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
    setCurrentDetails(null);
  };

  const columns = [
    { key: "id", header: "SL. NO" },
    { key: "month", header: "Month" },
    { key: "calculatedSalary", header: "Calculated Salary" },
    { key: "targetAmount", header: "Target" },
    { key: "businessClosed", header: "Total Business Closed" },
    { key: "isTargetAchieved", header: "Target Achieved" },
    { key: "incentiveEarned", header: "Incentive" },
    { key: "additionalEarnings", header: "Additional Earnings" },
    { key: "additionalDeductions", header: "Additional Deductions" },
    { key: "advanceGiven", header: "Advance" },
    {
      key: "debit",
      header: (
        <div className="flex items-center">
          <MinusCircleOutlined className="text-red-500 mr-1" />
          Debit (₹)
        </div>
      ),
    },
    {
      key: "credit",
      header: (
        <div className="flex items-center">
          <PlusCircleOutlined className="text-green-500 mr-1" />
          Credit (₹)
        </div>
      ),
    },
    {
      key: "balance",
      header: (
        <div className="flex items-center">
          <DollarCircleOutlined className="mr-1" />
          Balance
        </div>
      ),
      width: 150,
    },
    { key: "action", header: "Action" },
  ];

  const getIncentiveTag = (adjustment) => {
    if (adjustment === 0) return <Tag color="gray">No Incentive</Tag>;
    if (adjustment > 0)
      return (
        <Tag icon={<TrophyOutlined />} color="green">
          +₹{adjustment.toLocaleString()}
        </Tag>
      );
    return (
      <Tag icon={<MinusCircleOutlined />} color="red">
        -₹{Math.abs(adjustment).toLocaleString()}
      </Tag>
    );
  };

  const getTargetAchievementTag = (achievement) => {
    const pct = parseFloat(achievement.replace("%", ""));
    if (pct >= 100) return <Tag color="green">{achievement} (Achieved)</Tag>;
    if (pct >= 80) return <Tag color="blue">{achievement} (Near Target)</Tag>;
    return <Tag color="orange">{achievement} (Below Target)</Tag>;
  };

  return (
    <>
      <div>
        <Navbar
          visibility={true}
          onGlobalSearchChangeHandler={(e) => setSearchText(e.target.value)}
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
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4">
                <h1 className="text-2xl font-semibold flex items-center">
                  <TeamOutlined className="mr-2 text-blue-600" />
                  Employee Salary Ledger
                </h1>

                <div className="w-full sm:w-auto">
                  <Select
                    showSearch
                    size="large"
                    style={{ width: "100%" }}
                    placeholder="Select an employee"
                    optionFilterProp="children"
                    onChange={handleEmployeeSelect}
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    options={employees.map((emp) => ({
                      value: emp._id,
                      label: `${emp.name} ${emp.phone_number}(${
                        emp.employeeCode || "N/A"
                      })`,
                      employee: emp,
                    }))}
                  />
                </div>
              </div>

              {selectedEmployee && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Space>
                    <TeamOutlined className="text-blue-600" />
                    <Text strong>
                      Showing ledger for:{" "}
                      <span className="text-blue-900">
                        {
                          employees.find((e) => e._id === selectedEmployee)
                            ?.name
                        }
                      </span>
                    </Text>
                  </Space>
                </div>
              )}
            </div>

            {selectedEmployee ? (
              <>
                {tableData.length > 0 && !isLoading ? (
                  <DataTable
                    catcher="_id"
                    data={filterOption(tableData, searchText)}
                    columns={columns}
                    exportedPdfName={`Salary_Ledger_${selectedEmployee}`}
                    exportedFileName={`Salary_Ledger_${selectedEmployee}.csv`}
                  />
                ) : (
                  <CircularLoader
                    isLoading={isLoading}
                    failure={tableData.length <= 0 && !isLoading}
                    data={"Salary Ledger Data"}
                  />
                )}

                {ledgerData.length > 0 && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <Title level={4} className="flex items-center">
                      <DollarCircleOutlined className="mr-2 text-gray-600" />
                      Summary
                    </Title>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="p-4 bg-white rounded-lg shadow border border-gray-100">
                        <Text type="secondary" className="text-sm">
                          Total Credits
                        </Text>
                        <Title
                          level={3}
                          className="text-green-600 mb-0 mt-1 flex items-center">
                          <PlusCircleOutlined className="mr-2" />
                          {ledgerData
                            .reduce((sum, item) => sum + item.credit, 0)
                            .toLocaleString("en-IN", {
                              style: "currency",
                              currency: "INR",
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            })}
                        </Title>
                      </div>
                      <div className="p-4 bg-white rounded-lg shadow border border-gray-100">
                        <Text type="secondary" className="text-sm">
                          Total Debits
                        </Text>
                        <Title
                          level={3}
                          className="text-red-600 mb-0 mt-1 flex items-center">
                          <MinusCircleOutlined className="mr-2" />
                          {ledgerData
                            .reduce((sum, item) => sum + item.debit, 0)
                            .toLocaleString("en-IN", {
                              style: "currency",
                              currency: "INR",
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            })}
                        </Title>
                      </div>
                      <div className="p-4 bg-white rounded-lg shadow border border-gray-100">
                        <Text type="secondary" className="text-sm">
                          Current Balance
                        </Text>
                        <Title
                          level={3}
                          className={`mb-0 mt-1 flex items-center ${
                            ledgerData[ledgerData.length - 1]?.balance > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}>
                          {ledgerData[ledgerData.length - 1]?.balance > 0 ? (
                            <PlusCircleOutlined className="mr-2" />
                          ) : (
                            <MinusCircleOutlined className="mr-2" />
                          )}
                          {Math.abs(
                            ledgerData[ledgerData.length - 1]?.balance
                          ).toLocaleString("en-IN", {
                            style: "currency",
                            currency: "INR",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        </Title>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="border-2 border-dashed rounded-xl p-12 text-center text-gray-500 bg-gray-50">
                <div className="flex justify-center mb-4">
                  <div className="bg-blue-100 p-4 rounded-full">
                    <TeamOutlined className="text-blue-600 text-3xl" />
                  </div>
                </div>
                <Title level={4} className="text-gray-700">
                  Select an Employee
                </Title>
                <Text className="mt-2 block">
                  Use the dropdown above to choose an employee and view their
                  detailed salary ledger
                </Text>
              </div>
            )}

            <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200 text-sm">
              <Space>
                <MinusCircleOutlined className="text-red-500" />
                <Text>
                  <strong>Debit:</strong> Amount owed by employee |
                  <PlusCircleOutlined className="text-green-500 ml-2 mr-1" />
                  <strong>Credit:</strong> Amount owed to employee |
                  <DollarCircleOutlined className="ml-2 mr-1" />
                  <strong>Balance:</strong> Running total (Credit - Debit)
                </Text>
              </Space>
            </div>
          </div>
        </div>

        {/* Details Drawer */}
        <Drawer
          title={
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-600 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="font-semibold">
                {currentDetails?.month} Details
              </span>
            </div>
          }
          width={650}
          onClose={closeDrawer}
          visible={drawerVisible}
          bodyStyle={{ paddingBottom: 80 }}
          footer={null}>
          {currentDetails && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <Descriptions title="Monthly Summary" column={1} bordered>
                  <Descriptions.Item label="Status">
                    <Tag color={currentDetails.balance >= 0 ? "green" : "red"}>
                      {currentDetails.balance >= 0
                        ? "Credit Balance"
                        : "Debit Balance"}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Net Amount">
                    <Title
                      level={4}
                      className={
                        currentDetails.balance >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }>
                      {currentDetails.balance.toLocaleString("en-IN", {
                        style: "currency",
                        currency: "INR",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                    </Title>
                  </Descriptions.Item>
                </Descriptions>
              </div>

              <Descriptions title="Salary Components" column={1} bordered>
                <Descriptions.Item label="Base Salary">
                  <Text strong>
                    {currentDetails.details.base_salary.toLocaleString(
                      "en-IN",
                      {
                        style: "currency",
                        currency: "INR",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }
                    )}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Other Payments">
                  <Text type="success" strong>
                    +{" "}
                    {currentDetails.details.other_payments.toLocaleString(
                      "en-IN",
                      {
                        style: "currency",
                        currency: "INR",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }
                    ) || "0"}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Other Deductions">
                  <Text type="danger" strong>
                    -{" "}
                    {currentDetails.details.other_deductions.toLocaleString(
                      "en-IN",
                      {
                        style: "currency",
                        currency: "INR",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }
                    ) || "0"}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Incentive Adjustment">
                  {getIncentiveTag(currentDetails.details.incentive_adjustment)}
                </Descriptions.Item>
              </Descriptions>

              <Descriptions title="Business Performance" column={1} bordered>
                <Descriptions.Item label="Target Achievement">
                  {getTargetAchievementTag(
                    currentDetails.details.target_achievement
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Business Closed">
                  <Text strong>
                    {currentDetails.details.business_closed.toLocaleString(
                      "en-IN",
                      {
                        style: "currency",
                        currency: "INR",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }
                    )}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Target">
                  <Text type="secondary">
                    {currentDetails.details.target.toLocaleString("en-IN", {
                      style: "currency",
                      currency: "INR",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </Text>
                </Descriptions.Item>
              </Descriptions>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <Title level={5} className="flex items-center mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Calculation Details
                </Title>
                <div className="space-y-2 text-gray-700">
                  <p>
                    <span className="font-medium">Base Amount:</span> ₹
                    {currentDetails.details.base_salary.toLocaleString()}
                  </p>
                  <p>
                    <span className="font-medium">+ Other Payments:</span> ₹
                    {currentDetails.details.other_payments.toLocaleString()}
                  </p>
                  <p>
                    <span className="font-medium">+ Incentive:</span>{" "}
                    {currentDetails.details.incentive_adjustment > 0 ? "+" : ""}
                    ₹
                    {Math.abs(
                      currentDetails.details.incentive_adjustment
                    ).toLocaleString()}
                  </p>
                  <p>
                    <span className="font-medium">- Other Deductions:</span> -₹
                    {currentDetails.details.other_deductions.toLocaleString()}
                  </p>
                  <div className="border-t pt-2 mt-2">
                    <p className="font-semibold">
                      Net Amount: {currentDetails.balance >= 0 ? "+" : "-"}₹
                      {Math.abs(currentDetails.balance).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center text-sm text-gray-500 mt-4">
                <p>
                  Data as of {moment().format("MMMM DD, YYYY")} | Calculation
                  based on company policy
                </p>
              </div>
            </div>
          )}
        </Drawer>
      </div>
    </>
  );
};

// Simple filter function similar to your Groups page
const filterOption = (data, searchText) => {
  if (!searchText) return data;

  return data.filter((item) =>
    Object.values(item).some(
      (val) =>
        typeof val === "string" &&
        val.toLowerCase().includes(searchText.toLowerCase())
    )
  );
};

export default EmployeeStatement;
