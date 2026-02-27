import { useEffect, useState } from "react";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import CircularLoader from "../components/loaders/CircularLoader";
import {
  Select,
  Modal as AntModal,
  DatePicker,
  Tag,
  Empty,
  Tooltip,
} from "antd";
import { FaEye, FaUserShield } from "react-icons/fa";
import dayjs from "dayjs";

import { FaRupeeSign } from "react-icons/fa";

const { RangePicker } = DatePicker;

const PrizedCustomerReport = () => {
  const [reports, setReports] = useState([]);
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [filters, setFilters] = useState({
    groupId: "",
    userId: "",
    adminType: "",
    startDate: "",
    endDate: "",
  });

  const [showModalView, setShowModalView] = useState(false);
  const [currentReport, setCurrentReport] = useState(null);
  const [overview, setOverview] = useState({
    totalPaidAmount: 0,
    totalPayable: 0,
    totalBalance: 0,
  });

  const columns = [
    { key: "id", header: "SL. NO" },
    { key: "payDate", header: "Payment Date" },
    { key: "transactionDate", header: "Transaction Date" },
    { key: "userName", header: "Customer Name" },
    { key: "groupName", header: "Group Name" },
    { key: "ticket", header: "Ticket" },
    { key: "totalPaidAmount", header: "Total Paid Amount" },
    { key: "totalPayable", header: "Total Payable" },
    { key: "balance", header: "Balance" },

    { key: "amount", header: "Payout Amount" },
    { key: "status", header: "Status" },
    { key: "adminName", header: "Handled By" },
    { key: "action", header: "Action" },
  ];

  const exportColumns = [
    { key: "id", header: "SL. NO" },
    { key: "payDate", header: "Payment Date" },
    { key: "transactionDate", header: "Transaction Date" },
    { key: "userName", header: "Customer Name" },
    { key: "groupName", header: "Group Name" },
    { key: "ticket", header: "Ticket" },
    { key: "totalPayableRaw", header: "Total Payable" },
    { key: "totalPaidAmountRaw", header: "Total Paid Amount" },
    { key: "balanceRaw", header: "Balance" },
    { key: "amountRaw", header: "Payout Amount" },
    { key: "statusRaw", header: "Status" },
    { key: "adminName", header: "Handled By" },
  ];

  const fetchInitialData = async () => {
    try {
      const [groupRes, userRes, adminRes] = await Promise.all([
        api.get("/group/get-group-admin"),
        api.get("user/verified"),
        api.get("/admin/get-sub-admins"),
      ]);
      setGroups(groupRes.data || []);
      setUsers(userRes.data?.data || []);
      setAdmins(adminRes.data || []);
    } catch (error) {
      console.error("Error fetching initial data", error);
    }
  };

  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (filters.groupId) params.groupId = filters.groupId;
      if (filters.userId) params.userId = filters.userId;
      if (filters.adminType) params.adminType = filters.adminType;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const response = await api.get("/payment-out/prized", { params });

      if (response.data && response.data.data) {
        if (response.data.overview) {
          setOverview({
            totalPaidAmount: response.data.overview.totalPaidAmount || 0,
            totalPayable: response.data.overview.totalPayable || 0,
            totalBalance: response.data.overview.totalBalance || 0,
          });
        }
        const formattedData = response.data.data.map((item, index) => ({
          ...item,
          id: index + 1,
          payDate: item.pay_date
            ? dayjs(item.pay_date).format("YYYY-MM-DD")
            : "N/A",
          groupName: item.group_details?.group_name || "N/A",
          userName: item.user_details?.full_name || "N/A",
          ticket: item.ticket,
          adminName: item.admin_details?.name || "N/A",
          amount: `₹${item.amount?.toLocaleString("en-IN")}`,
          amountRaw: item.amount,
          transactionDate: item.createdAt
            ? `${item.createdAt.split("T")[0]}`
            : "",
          status: <Tag color="green">PAID</Tag>,
          statusRaw: "PAID",
          balance: `${item.auctions?.balance?.toLocaleString("en-IN")}`,
          balanceRaw: item.auctions?.balance,
          totalPaidAmount: `${item?.payments?.totalPaidAmount?.toLocaleString("en-IN") || 0}`,
          totalPaidAmountRaw: item?.payments?.totalPaidAmount || 0,
          totalPayable: `${item?.auctions?.to_be_paid_amount?.toLocaleString("en-IN") || 0}`,
          totalPayableRaw: item?.auctions?.to_be_paid_amount || 0,

          status_raw: "Paid",
          action: (
            <div className="flex justify-center">
              <Tooltip title="View Receipt">
                <button
                  onClick={() => {
                    setCurrentReport(item);
                    setShowModalView(true);
                  }}
                  className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100"
                >
                  <FaEye />
                </button>
              </Tooltip>
            </div>
          ),
        }));
        setReports(formattedData);
      }
    } catch (error) {
      setReports([]);
      console.error("Error fetching report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [filters]);

  const onDateRangeChange = (dates) => {
    if (dates) {
      setFilters((prev) => ({
        ...prev,
        startDate: dates[0].format("YYYY-MM-DD"),
        endDate: dates[1].format("YYYY-MM-DD"),
      }));
    } else {
      setFilters((prev) => ({ ...prev, startDate: "", endDate: "" }));
    }
  };

  return (
    <div className="flex-1">
      <div className="flex-grow p-7 bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FaRupeeSign className="text-blue-900" /> Prized Customer Report
          </h1>
        </div>

        {/* Filter Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-8 border border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {/* Total Paid */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-5 shadow-md">
              <p className="text-sm opacity-90">Total Paid Amount</p>
              <h2 className="text-2xl font-bold mt-1">
                ₹{overview.totalPaidAmount?.toLocaleString("en-IN")}
              </h2>
            </div>

            {/* Total Payable */}
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl p-5 shadow-md">
              <p className="text-sm opacity-90">Total Payable</p>
              <h2 className="text-2xl font-bold mt-1">
                ₹{overview.totalPayable?.toLocaleString("en-IN")}
              </h2>
            </div>

            {/* Balance */}
            <div className="bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-xl p-5 shadow-md">
              <p className="text-sm opacity-90">Total Balance</p>
              <h2 className="text-2xl font-bold mt-1">
                ₹{overview.totalBalance?.toLocaleString("en-IN")}
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">
                Group
              </label>
              <Select
                placeholder="All Groups"
                className="w-full h-10 mt-1"
                allowClear
                onChange={(val) =>
                  setFilters((prev) => ({ ...prev, groupId: val }))
                }
              >
                {groups.map((g) => (
                  <Select.Option key={g._id} value={g._id}>
                    {g.group_name}
                  </Select.Option>
                ))}
              </Select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">
                Customer
              </label>
              <Select
                placeholder="All Customers"
                className="w-full h-10 mt-1"
                allowClear
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
                onChange={(val) =>
                  setFilters((prev) => ({ ...prev, userId: val }))
                }
              >
                {users.map((u) => (
                  <Select.Option key={u._id} value={u._id}>
                    {u.full_name}
                  </Select.Option>
                ))}
              </Select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">
                Date Range
              </label>
              <RangePicker
                className="w-full h-10 mt-1"
                onChange={onDateRangeChange}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">
                Admin / Staff
              </label>
              <Select
                placeholder="Filtered by Admin"
                className="w-full h-10 mt-1"
                allowClear
                onChange={(val) =>
                  setFilters((prev) => ({ ...prev, adminType: val }))
                }
              >
                {admins.map((a) => (
                  <Select.Option key={a._id} value={a._id}>
                    {a.name}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          {isLoading ? (
            <CircularLoader isLoading={true} data="Reports" />
          ) : reports.length <= 0 ? (
            <Empty description="No Payout Data Found" />
          ) : (
            <DataTable
              data={reports}
              columns={columns}
              exportCols={exportColumns}
              exportedPdfName="Prized_Customer_Payout_Report"
            />
          )}
        </div>
      </div>

      {/* Details Modal */}
      <AntModal
        title={
          <div className="text-xl font-bold border-b pb-2">Payout Details</div>
        }
        open={showModalView}
        onCancel={() => setShowModalView(false)}
        footer={null}
        width={600}
      >
        {currentReport && (
          <div className="grid grid-cols-2 gap-y-4 py-4">
            <DetailItem
              label="Group Name"
              value={currentReport.group_details?.group_name}
            />
            <DetailItem
              label="Customer Name"
              value={currentReport.user_details?.full_name}
            />
            <DetailItem
              label="Payment Date"
              value={dayjs(currentReport.pay_date).format("DD-MM-YYYY")}
            />
            <DetailItem
              label="Disbursement Type"
              value={currentReport.disbursement_type}
            />
            <DetailItem
              label="Payout Amount"
              value={`₹${currentReport.amount?.toLocaleString()}`}
            />
            <DetailItem
              label="Handled By"
              value={currentReport.admin_details?.name}
            />
            <DetailItem label="Payment For" value={currentReport.pay_for} />
            <DetailItem
              label="Status"
              value={<Tag color="green">SUCCESSFUL</Tag>}
            />
          </div>
        )}
      </AntModal>
    </div>
  );
};

const DetailItem = ({ label, value }) => (
  <div className="flex flex-col border-b border-gray-50 pb-2 mr-4">
    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
      {label}
    </span>
    <span className="text-sm font-semibold text-gray-800">
      {value || "N/A"}
    </span>
  </div>
);

export default PrizedCustomerReport;
