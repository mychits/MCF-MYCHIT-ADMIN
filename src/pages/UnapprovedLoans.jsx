import { useEffect, useState } from "react";
import {
  message,
  Dropdown,
  Menu,
  Button,
  Input,
  Form,
  Modal,
  Select,
  DatePicker,
} from "antd";
import {
  MoreOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import Sidebar from "../components/layouts/Sidebar";
import Navbar from "../components/layouts/Navbar";
import DataTable from "../components/layouts/Datatable";
import api from "../instance/TokenInstance";
import CircularLoader from "../components/loaders/CircularLoader";
import moment from "moment";
import { fieldSize } from "../data/fieldSize";

const { Option } = Select;
const { TextArea } = Input;

const UnapprovedLoans = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form] = Form.useForm();

  // Fetch master data (Users, Agents, Employees)
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [usersRes, agentsRes, employeesRes] = await Promise.all([
          api.get("/user/get-user"),
          api.get("/agent/get"),
          api.get("/employee"),
        ]);

        setUsers(usersRes.data);
        setAgents(agentsRes.data?.agent);
        setEmployees(employeesRes.data?.employee);
      } catch (error) {
        console.error("Error fetching master data:", error);
        message.error("Failed to load initial data");
        setLoading(false);
      }
    };

    fetchMasterData();
  }, []);

  // Fetch Loan Approval Requests
  useEffect(() => {
    const fetchLoans = async () => {
      if (users.length === 0) return;

      try {
        setLoading(true);

        // Fetching from Loan Approval Requests Model
        const loanRes = await api.get("/loans/get-loan-approval-request");
        const loans = loanRes.data.data || [];

        const formatted = loans.map((loan, index) => {
          const user = users.find((u) => u._id === loan.user_id);

          const menu = (
            <Menu>
              <Menu.Item
                key="approve"
                onClick={() => handleApproveClick(loan, user)}
              >
                Approve
              </Menu.Item>
              <Menu.Item
                key="delete"
                onClick={() => handleDeleteClick(loan._id)}
              >
                Delete
              </Menu.Item>
            </Menu>
          );

          return {
            id: index + 1,
            loanId: loan._id,
            customer_name: user?.full_name || "-",
            phone_number: user?.phone_number || "-",
            address: user?.address || "-",
            loan_amount: loan.loan_amount,
            loan_purpose: loan.loan_purpose,
            
            // EXACT LOGIC FROM UNAPPROVED CUSTOMER
            // Taking createdAt from the API response and splitting the timestamp
            createdAt: loan.createdAt ? loan.createdAt.split("T")[0] : "-",
            
            approval_status: (
              <span className="inline-block px-3 py-1 text-sm font-medium text-yellow-800 bg-yellow-100 rounded-full">
                {loan.approval_status}
              </span>
            ),
            actions: (
              <Dropdown overlay={menu} trigger={["click"]}>
                <Button
                  type="text"
                  icon={<MoreOutlined />}
                  onClick={(e) => e.preventDefault()}
                />
              </Dropdown>
            ),
          };
        });

        setTableData(formatted);
      } catch (err) {
        console.error(err);
        message.error("Failed to fetch loan requests");
      } finally {
        setLoading(false);
      }
    };

    fetchLoans();
  }, [users]);

  const handleApproveClick = async (loan, user) => {
    setSelectedLoan(loan);
    setSelectedUser(user);

    const userId = user?._id || loan.user_id;

    form.setFieldsValue({
      borrower: userId,
      loan_amount: loan.loan_amount,
      loan_purpose: loan.loan_purpose,
    });

    setShowApprovalModal(true);
  };

  const handleDeleteClick = async (loanId) => {
    try {
      await api.delete(`/loans/delete-loan-request/${loanId}`);
      message.success("Loan request deleted successfully");
      window.location.reload();
    } catch (err) {
      console.error(err);
      message.error("Failed to delete loan request");
    }
  };

  const handleApproveLoan = async () => {
    try {
      const formValues = form.getFieldsValue();

      if (!formValues.start_date || !formValues.end_date) {
        message.error("Please select Start Date and End Date");
        return;
      }

      const formattedStartDate = moment(formValues.start_date).format("YYYY-MM-DD");
      const formattedEndDate = moment(formValues.end_date).format("YYYY-MM-DD");

      await api.put(`/loans/update-loan-approval-request/${selectedLoan._id}`, {
        approval_status: "approved",
      });

      const loanData = {
        borrower: formValues.borrower,
        loan_amount: Number(formValues.loan_amount),
        tenure: Number(formValues.tenure),
        service_charges: Number(formValues.service_charges),
        daily_payment_amount: Number(formValues.daily_payment_amount),
        start_date: formattedStartDate,
        end_date: formattedEndDate,
        note: formValues.note || "",
        referred_type: formValues.referred_type,
        referred_customer: formValues.referred_customer || "",
        referred_employee: formValues.referred_employee || "",
        referred_agent: formValues.referred_agent || "",
        approval_status: "approved",
      };

      await api.post("/loans/add-borrower", loanData);

      message.success("Loan approved successfully");
      setShowApprovalModal(false);
      window.location.reload();
    } catch (err) {
      console.error(err);
      message.error("Failed to approve loan");
    }
  };

  const columns = [
    { key: "id", header: "SL.NO" },
    { key: "customer_name", header: "Customer Name" },
    { key: "phone_number", header: "Phone Number" },
    { key: "address", header: "Address" },
    { key: "loan_amount", header: "Loan Amount" },
    { key: "loan_purpose", header: "Loan Purpose" },
    { key: "createdAt", header: "Created Date" }, // <--- Column Added Here
    { key: "approval_status", header: "Approval Status" },
    { key: "actions", header: "Actions" },
  ];

  return (
    <div className="flex mt-20">
      <Sidebar />
      <Navbar visibility />

      <div className="flex-grow p-7">
        <h1 className="text-2xl font-semibold mb-6">
          Unapproved Loan Requests
        </h1>

        {!loading && tableData.length > 0 ? (
          <DataTable
            data={tableData}
            columns={columns}
            exportedPdfName="Unapproved Loans"
            exportedFileName="unapproved_loans.csv"
          />
        ) : (
          <CircularLoader
            isLoading={loading}
            failure={tableData.length === 0 && !loading}
            data="Loan Requests"
          />
        )}
      </div>

      <Modal
        title="Approve Loan Request"
        open={showApprovalModal}
        onCancel={() => {
          setShowApprovalModal(false);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleApproveLoan}>
          {/* Borrower */}
          <Form.Item
            name="borrower"
            className="mt-10"
            label="Borrower Name"
            rules={[{ required: true, message: "Please select borrower" }]}
          >
            <Select
              className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
              showSearch
              placeholder="Select Or Search Borrower Name"
              popupMatchSelectWidth={false}
              filterOption={(input, option) => {
                const text = option?.children?.toString().toLowerCase() || "";
                return text.includes(input.toLowerCase());
              }}
            >
              {users.map((user) => (
                <Select.Option key={user._id} value={user._id}>
                  {user.customer_id} | {user.full_name} | {user.phone_number}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* Loan Amount & Tenure */}
          <div className="flex flex-row justify-between space-x-4">
            <Form.Item
              name="loan_amount"
              label="Loan Amount"
              className="w-1/2"
              rules={[{ required: true, message: "Enter loan amount" }]}
            >
              <Input
                type="number"
                placeholder="Enter Loan Amount"
                className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
              />
            </Form.Item>

            <Form.Item
              name="tenure"
              label="Tenure (Days)"
              className="w-1/2"
              rules={[{ required: true, message: "Enter tenure" }]}
            >
              <Input
                type="number"
                placeholder="Enter Tenure in Days"
                className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
              />
            </Form.Item>
          </div>

          <div className="flex gap-4">
            <Form.Item
              name="service_charges"
              label="Service Charges"
              className="w-1/2"
              rules={[{ required: true, message: "Enter service charges" }]}
            >
              <Input
                type="number"
                placeholder="Enter Service Charges"
                className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
              />
            </Form.Item>

            <Form.Item
              name="daily_payment_amount"
              label="Daily Payment Amount"
              className="w-1/2"
              rules={[
                { required: true, message: "Enter daily payment amount" },
              ]}
            >
              <Input
                type="number"
                placeholder="Enter Daily Payment"
                className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
              />
            </Form.Item>
          </div>

          {/* Dates */}
          <div className="flex gap-4">
            <Form.Item
              name="start_date"
              label="Start Date"
              className="w-1/2"
              rules={[{ required: true, message: "Select start date" }]}
            >
              <DatePicker
                className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                format="DD/MM/YYYY"
              />
            </Form.Item>

            <Form.Item
              name="end_date"
              label="End Date"
              className="w-1/2"
              rules={[{ required: true, message: "Select end date" }]}
            >
              <DatePicker
                className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                format="DD/MM/YYYY"
              />
            </Form.Item>
          </div>

          <Form.Item
            name="referred_type"
            label="Referred Type"
            rules={[{ required: true, message: "Select referred type" }]}
          >
            <Select
              placeholder="Select Referred Type"
              className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
              showSearch
              popupMatchSelectWidth={false}
              filterOption={(input, option) => {
                const text = option?.children?.toString().toLowerCase() || "";
                return text.includes(input.toLowerCase());
              }}
            >
              {["Self Joining", "Customer", "Employee", "Agent", "Others"].map(
                (type) => (
                  <Select.Option key={type} value={type}>
                    {type}
                  </Select.Option>
                ),
              )}
            </Select>
          </Form.Item>

          {/* Conditional Fields */}
          <Form.Item noStyle shouldUpdate={(prev, curr) => prev.referred_type !== curr.referred_type}>
            {({ getFieldValue }) => {
              const type = getFieldValue("referred_type");

              if (type === "Customer") {
                return (
                  <Form.Item
                    name="referred_customer"
                    label="Referred Customer"
                    rules={[{ required: true, message: "Select customer" }]}
                  >
                    <Select
                      placeholder="Select Referred Customer"
                      className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                      showSearch
                      popupMatchSelectWidth={false}
                      filterOption={(input, option) =>
                        option?.children?.toString().toLowerCase().includes(input.toLowerCase())
                      }
                    >
                      {users.map((user) => (
                        <Select.Option key={user._id} value={user._id}>
                          {user.full_name} | {user.phone_number}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                );
              }

              if (type === "Employee") {
                return (
                  <Form.Item
                    name="referred_employee"
                    label="Referred Employee"
                    rules={[{ required: true, message: "Select employee" }]}
                  >
                    <Select
                      placeholder="Select Employee"
                      className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                      showSearch
                      popupMatchSelectWidth={false}
                      filterOption={(input, option) =>
                        option?.children?.toString().toLowerCase().includes(input.toLowerCase())
                      }
                    >
                      {employees.map((emp) => (
                        <Select.Option key={emp._id} value={emp._id}>
                          {emp.name} | {emp.phone_number}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                );
              }

              if (type === "Agent") {
                return (
                  <Form.Item
                    name="referred_agent"
                    label="Referred Agent"
                    rules={[{ required: true, message: "Select agent" }]}
                  >
                    <Select
                      placeholder="Select Agent"
                      className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                      showSearch
                      popupMatchSelectWidth={false}
                      filterOption={(input, option) =>
                        option?.children?.toString().toLowerCase().includes(input.toLowerCase())
                      }
                    >
                      {agents.map((agent) => (
                        <Select.Option key={agent._id} value={agent._id}>
                          {agent.name} | {agent.phone_number}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                );
              }

              if (type === "Others") {
                return (
                  <Form.Item
                    name="referred_others"
                    label="Referred By"
                    rules={[{ required: true, message: "Enter reference name" }]}
                  >
                    <Input
                      placeholder="Enter reference name"
                      className="h-14 rounded-lg"
                    />
                  </Form.Item>
                );
              }

              return null;
            }}
          </Form.Item>

          {/* Note */}
          <Form.Item name="note" label="Note">
            <Input.TextArea rows={3} placeholder="Specify note if any" />
          </Form.Item>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <Button onClick={() => setShowApprovalModal(false)}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              icon={<CheckCircleOutlined />}
            >
              Approve Loan
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default UnapprovedLoans;