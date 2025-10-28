import { useEffect, useState, useMemo } from "react";
import { DatePicker, Select, message, Card, Row, Col, Statistic, Progress, Tag, Tooltip, Badge } from "antd";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import {
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Calendar,
  Filter,
  Users,

  TrendingUp,
  Clock,
  Info,
  CreditCard,
  FileText,
  UserCheck,
  UserX,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
dayjs.extend(isBetween);

import { FaIndianRupeeSign } from "react-icons/fa6";

import api from "../instance/TokenInstance";
import Navbar from "../components/layouts/Navbar";
import DataTable from "../components/layouts/Datatable";
import CircularLoader from "../components/loaders/CircularLoader";
import SettingSidebar from "../components/layouts/SettingSidebar";

const { RangePicker } = DatePicker;

const PenaltyMonitor = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [penalties, setPenalties] = useState([]);
  const [mode, setMode] = useState("month");
  const [dateRange, setDateRange] = useState([]);
  const [searchText, setSearchText] = useState("");

  const fetchPenaltySettings = async () => {
    try {
      const res = await api.get("/penalty/penalty-settings");
      return res.data || [];
    } catch (err) {
      message.error("Failed to fetch penalty settings");
      return [];
    }
  };

  const fetchDueReportAndProcess = async (from, to) => {
    setIsLoading(true);
    try {
      let penaltySettingsData = penalties;
      if (!penaltySettingsData || penaltySettingsData.length === 0) {
        penaltySettingsData = await fetchPenaltySettings();
        setPenalties(penaltySettingsData);
      }

      const financialRes = await api.get("/user/all-customers-report");
      const financialData = financialRes.data || [];

      const dueDateRes = await api.get("/user/all-customers-auction-report");
      const dueDateData = dueDateRes.data || [];

      const dueDateMap = new Map();
      dueDateData.forEach((usr) => {
        if (!usr?._id || !usr.data) return;
        usr.data.forEach((item) => {
          const enroll = item?.enrollment;
          if (!enroll?.group?._id || !enroll.tickets) return;
          const key = `${usr._id}-${enroll.group._id}-${enroll.tickets}`;
          if (item.due_date) {
            dueDateMap.set(key, item.due_date);
          }
        });
      });

      const processed = [];
      const fromDate = from ? dayjs(from).startOf("day") : null;
      const toDate = to ? dayjs(to).endOf("day") : null;

      for (const usr of financialData) {
        if (!usr?.data) continue;

        for (const item of usr.data) {
          const enroll = item.enrollment;
          if (!enroll?.group) continue;

          const group = enroll.group;
          const enrollmentDate = dayjs(enroll.createdAt);

          const groupInstallment = Number(
            group.group_install || 
            group.monthly_installment || 
            group.weekly_installment || 
            0
          );
          const groupType = group.group_type;
          const auctionCount = Number(item?.auction?.auctionCount || 0);
          const totalPaidAmount = Number(item?.payments?.totalPaidAmount || 0);
          const totalPayable = Number(item?.payable?.totalPayable || 0);
          const totalProfit = Number(item?.profit?.totalProfit || 0);
          const firstDividentHead = Number(item?.firstAuction?.firstDividentHead || 0);

          const totalToBePaid =
            groupType === "double"
              ? groupInstallment * auctionCount + groupInstallment
              : totalPayable + groupInstallment + totalProfit;

          const balance =
            groupType === "double"
              ? groupInstallment * auctionCount + groupInstallment - totalPaidAmount
              : totalPayable + groupInstallment + firstDividentHead - totalPaidAmount;

          if (balance <= 0) continue;

          const key = `${usr._id}-${group._id}-${enroll.tickets}`;
          const dueDateStr = dueDateMap.get(key) || enroll.createdAt;
          const dueDate = dayjs(dueDateStr);

          if (fromDate && toDate && !dueDate.isBetween(fromDate, toDate, null, "[]")) {
            continue;
          }

          const groupRules = penaltySettingsData.filter((p) => p.group_id === group._id);
          let graceDays = 0;
          let penaltyRate = 0;
          let activeRule = null;

          const totalExpectedInstallments = dayjs().diff(enrollmentDate, "month");
          const paidInstallments = groupInstallment > 0 ? Math.floor(totalPaidAmount / groupInstallment) : 0;
          const skippedInstallments = Math.max(0, totalExpectedInstallments - paidInstallments);

          if (groupRules.length > 0) {
            const sorted = [...groupRules].sort((a, b) => (a.no_of_installments || 0) - (b.no_of_installments || 0));
            for (const rule of sorted) {
              if (skippedInstallments >= (rule.no_of_installments || 0)) {
                activeRule = rule;
              }
            }
            if (activeRule) {
              graceDays = Number(activeRule.grace_days || 0);
              penaltyRate = Number(activeRule.penalty_rate || 0);
            }
          }

          if (!activeRule && groupRules.length === 1) {
            const rule = groupRules[0];
            graceDays = Number(rule.grace_days || 0);
            penaltyRate = Number(rule.penalty_rate || 0);
          }

          const graceEndDate = dueDate.add(graceDays, "day");
          const today = dayjs();

          let status = "Paid";
          let penaltyValue = 0;

          if (balance > 0) {
            if (today.isAfter(graceEndDate)) {
              status = "Late";
              penaltyValue = penaltyRate > 0
                ? Number(((balance * penaltyRate) / 100).toFixed(2))
                : 0;
            } else {
              status = "Within Grace";
            }
          }

          const totalPayableWithPenalty = Number((balance + penaltyValue).toFixed(2));

          let firstPaymentDateFormatted = "—";
          try {
            if (usr._id && group._id && enroll.tickets) {
              const firstPayRes = await api.post("/penalty/total-amount", {
                user_id: usr._id,
                group_id: group._id,
                ticket: enroll.tickets,
              });
              if (firstPayRes.data?.firstPayment?.pay_date) {
                const fpDate = dayjs(firstPayRes.data.firstPayment.pay_date);
                if (fpDate.isValid()) {
                  firstPaymentDateFormatted = fpDate.format("DD MMM YYYY");
                }
              }
            }
          } catch (err) {
            console.warn("Failed to fetch first payment date:", usr._id);
          }

          processed.push({
            customer: usr.userName || "—",
            phone: usr.phone_number || "—",
            group: group.group_name || "—",
            ticket: enroll.tickets || "—",
            expected: totalToBePaid || 0,
            paid: totalPaidAmount || 0,
            balance: Number(balance || 0),
            penalty: penaltyValue,
            penaltyRate,
            totalPayable: totalPayableWithPenalty,
            status,
            graceDays,
            due_date: dueDate.format("DD MMM YYYY"),
            graceEndDate: graceEndDate.format("DD MMM YYYY"),
            enrollmentDate: enrollmentDate.format("YYYY-MM-DD"),
            firstPaymentDate: firstPaymentDateFormatted,
            skippedInstallments,
          });
        }
      }

      setData(processed);
    } catch (err) {
      console.error("Error fetching/processing due report:", err);
      message.error("Failed to fetch due report");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      const ps = await fetchPenaltySettings();
      setPenalties(ps);
    })();
  }, []);

  const handleMonthChange = (val) => {
    if (!val) return;
    const from = dayjs(val).startOf("month").format("YYYY-MM-DD");
    const to = dayjs(val).endOf("month").format("YYYY-MM-DD");
    setDateRange([from, to]);
    fetchDueReportAndProcess(from, to);
  };

  const handleRangeChange = (dates) => {
    if (!dates || dates.length !== 2) return;
    const from = dates[0].format("YYYY-MM-DD");
    const to = dates[1].format("YYYY-MM-DD");
    setDateRange([from, to]);
    fetchDueReportAndProcess(from, to);
  };

  const totalExpected = useMemo(() => data.reduce((sum, d) => sum + (Number(d.expected) || 0), 0), [data]);
  const totalPaid = useMemo(() => data.reduce((sum, d) => sum + (Number(d.paid) || 0), 0), [data]);
  const totalPenalty = useMemo(() => data.reduce((sum, d) => sum + (Number(d.penalty) || 0), 0), [data]);
  const totalBalance = useMemo(() => data.reduce((sum, d) => sum + (Number(d.balance) || 0), 0), [data]);
  const paymentProgress = useMemo(() => totalExpected > 0 ? Math.round((totalPaid / totalExpected) * 100) : 0, [totalPaid, totalExpected]);
  const latePaymentsCount = useMemo(() => data.filter(d => d.status === "Late").length, [data]);
  const withinGraceCount = useMemo(() => data.filter(d => d.status === "Within Grace").length, [data]);

  const filteredData = useMemo(() => {
    if (!searchText) return data;
    const s = searchText.trim().toLowerCase();
    return data.filter((r) => {
      return (
        String(r.customer || "").toLowerCase().includes(s) ||
        String(r.phone || "").toLowerCase().includes(s) ||
        String(r.group || "").toLowerCase().includes(s) ||
        String(r.ticket || "").toLowerCase().includes(s)
      );
    });
  }, [searchText, data]);

  const columns = [
    { 
      key: "customer", 
      header: "CUSTOMER", 
      render: (row) => (
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold mr-4">
            {row.customer.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-bold text-gray-900 text-base">{row.customer}</div>
            <div className="text-gray-600 text-sm">{row.phone}</div>
          </div>
        </div>
      ) 
    },
    { 
      key: "group", 
      header: "GROUP", 
      render: (row) => (
        <div className="px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg font-semibold text-base">
          {row.group}
        </div>
      ) 
    },
    {
      key: "enrollmentDate",
      header: "JOINING DATE",
      render: (row) => (
        <div className="text-gray-700 font-medium text-base">
          {row.enrollmentDate ? dayjs(row.enrollmentDate).format("DD MMM YYYY") : "—"}
        </div>
      ),
    },
    { 
      key: "ticket", 
      header: "TICKET", 
      render: (row) => (
        <div className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg font-mono font-bold text-base">
          {row.ticket}
        </div>
      ) 
    },
    { 
      key: "expected", 
      header: "EXPECTED", 
      render: (row) => (
        <div className="font-bold text-gray-900 text-lg">
          <FaIndianRupeeSign className="inline w-4 h-4 mr-1" />
          {Number(row.expected || 0).toLocaleString("en-IN")}
        </div>
      ) 
    },
    { 
      key: "paid", 
      header: "PAID", 
      render: (row) => (
        <div className="font-bold text-green-700 text-lg">
          <FaIndianRupeeSign className="inline w-4 h-4 mr-1" />
          {Number(row.paid || 0).toLocaleString("en-IN")}
        </div>
      ) 
    },
    { 
      key: "balance", 
      header: "BALANCE", 
      render: (row) => (
        <div className="font-bold text-red-600 text-lg">
          <FaIndianRupeeSign className="inline w-4 h-4 mr-1" />
          {Number(row.balance || 0).toLocaleString("en-IN")}
        </div>
      ) 
    },
    {
      key: "skippedInstallments",
      header: "SKIPPED MONTHS",
      render: (row) => (
        <div className={`font-bold text-lg ${row.skippedInstallments > 0 ? "text-red-600" : "text-gray-500"}`}>
          {row.skippedInstallments || 0}
        </div>
      ),
    },
    {
      key: "due_date",
      header: "DUE DATE",
      render: (row) => (
        <div className="flex items-center text-gray-700 font-medium text-base">
          <Calendar className="w-5 h-5 mr-2 text-gray-500" />
          {row.due_date ? dayjs(row.due_date).format("DD MMM YYYY") : "—"}
        </div>
      ),
    },
    {
      key: "penalty",
      header: "PENALTY",
      render: (row) =>
        row.penalty > 0 ? (
          <div className="text-red-600 font-bold text-lg flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            <FaIndianRupeeSign className="inline w-4 h-4 mr-1" />
            {Number(row.penalty).toLocaleString("en-IN")}
          </div>
        ) : (
          <div className="text-gray-400 font-bold text-lg">
            <FaIndianRupeeSign className="inline w-4 h-4 mr-1" />
            0
          </div>
        ),
    },
    {
      key: "penaltyRate",
      header: "PENALTY %",
      render: (row) => (
        row.penaltyRate > 0 ? (
          <div className="px-3 py-2 bg-red-50 text-red-600 rounded-lg font-bold text-base">
            {row.penaltyRate}%
          </div>
        ) : (
          <div className="text-gray-400 font-bold text-lg">—</div>
        )
      ),
    },
    {
      key: "totalPayable",
      header: "TOTAL PAYABLE",
      render: (row) => (
        <div className="font-bold text-gray-900 text-lg">
          <FaIndianRupeeSign className="inline w-4 h-4 mr-1" />
          {Number(row.totalPayable || 0).toLocaleString("en-IN")}
        </div>
      ),
    },
    {
      key: "status",
      header: "STATUS",
      render: (row) => {
        let color = "green";
        let icon = <CheckCircle className="w-5 h-5" />;
        if (row.status === "Late") {
          color = "red";
          icon = <AlertTriangle className="w-5 h-5" />;
        } else if (row.status === "Within Grace") {
          color = "orange";
          icon = <Clock className="w-5 h-5" />;
        }
        return (
          <Tag color={color} icon={icon} className="font-bold text-base px-3 py-1">
            {row.status}
          </Tag>
        );
      },
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="flex mt-20">
        <SettingSidebar />
        <Navbar
          onGlobalSearchChangeHandler={(e) => setSearchText(e.target.value)}
          visibility={true}
        />
        <div className="flex-grow p-8">
          {/* Header Section */}
          <div className="mb-10">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Penalty Monitor</h1>
                <p className="text-lg text-gray-600 mt-1">Track outstanding payments and manage penalties efficiently</p>
              </div>
            </div>
          </div>

          {/* Main Summary Cards */}
          <Row gutter={[24, 24]} className="mb-10">
            <Col xs={24} sm={12} lg={6}>
              <Card className="h-full shadow-xl hover:shadow-2xl transition-all duration-300 border-0 rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
                  <div className="flex items-center justify-between text-white">
                    <div>
                      <div className="text-blue-100 text-sm font-medium mb-1">TOTAL EXPECTED</div>
                      <div className="text-3xl font-bold">
                        ₹{Number(totalExpected || 0).toLocaleString("en-IN")}
                      </div>
                    </div>
                    <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                      <FaIndianRupeeSign className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <Progress 
                    percent={paymentProgress} 
                    showInfo={false} 
                    strokeColor="#3B82F6" 
                    size="small" 
                    className="mb-2"
                  />
                  <div className="text-sm text-gray-600 font-medium">{paymentProgress}% Collected</div>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="h-full shadow-xl hover:shadow-2xl transition-all duration-300 border-0 rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-4">
                  <div className="flex items-center justify-between text-white">
                    <div>
                      <div className="text-green-100 text-sm font-medium mb-1">TOTAL PAID</div>
                      <div className="text-3xl font-bold">
                        ₹{Number(totalPaid || 0).toLocaleString("en-IN")}
                      </div>
                    </div>
                    <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center text-green-600">
                    <ArrowUpRight className="w-5 h-5 mr-1" />
                    <span className="font-semibold">Payments Received</span>
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="h-full shadow-xl hover:shadow-2xl transition-all duration-300 border-0 rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-red-500 to-red-600 p-4">
                  <div className="flex items-center justify-between text-white">
                    <div>
                      <div className="text-red-100 text-sm font-medium mb-1">OUTSTANDING</div>
                      <div className="text-3xl font-bold">
                        ₹{Number(totalBalance || 0).toLocaleString("en-IN")}
                      </div>
                    </div>
                    <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                      <CreditCard className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center text-red-600">
                    <ArrowDownRight className="w-5 h-5 mr-1" />
                    <span className="font-semibold">Pending Amount</span>
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="h-full shadow-xl hover:shadow-2xl transition-all duration-300 border-0 rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4">
                  <div className="flex items-center justify-between text-white">
                    <div>
                      <div className="text-orange-100 text-sm font-medium mb-1">TOTAL PENALTY</div>
                      <div className="text-3xl font-bold">
                        ₹{Number(totalPenalty || 0).toLocaleString("en-IN")}
                      </div>
                    </div>
                    <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                      <AlertTriangle className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center text-orange-600">
                    <AlertTriangle className="w-5 h-5 mr-1" />
                    <span className="font-semibold">Penalty Charges</span>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Status Overview Cards */}
          <Row gutter={[24, 24]} className="mb-10">
            <Col xs={24} sm={8}>
              <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 border-0 rounded-2xl">
                <div className="flex items-center justify-between p-2">
                  <div>
                    <div className="text-gray-500 text-base font-medium mb-2">Late Payments</div>
                    <div className="text-4xl font-bold text-red-600">{latePaymentsCount}</div>
                    <div className="text-sm text-gray-600 mt-2">Requires immediate attention</div>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                    <UserX className="w-8 h-8 text-red-600" />
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 border-0 rounded-2xl">
                <div className="flex items-center justify-between p-2">
                  <div>
                    <div className="text-gray-500 text-base font-medium mb-2">Within Grace Period</div>
                    <div className="text-4xl font-bold text-orange-500">{withinGraceCount}</div>
                    <div className="text-sm text-gray-600 mt-2">Grace period active</div>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                    <Clock className="w-8 h-8 text-orange-500" />
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 border-0 rounded-2xl">
                <div className="flex items-center justify-between p-2">
                  <div>
                    <div className="text-gray-500 text-base font-medium mb-2">Total Customers</div>
                    <div className="text-4xl font-bold text-blue-600">{data.length}</div>
                    <div className="text-sm text-gray-600 mt-2">Active accounts</div>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Filters Section */}
          <Card 
            className="mb-10 shadow-xl hover:shadow-2xl transition-all duration-300 border-0 rounded-2xl" 
            title={
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
                  <Filter className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-xl font-bold text-gray-900">Filter Options</span>
              </div>
            }
          >
            <Row gutter={[24, 24]} align="bottom">
              <Col xs={24} sm={12} md={8}>
                <div className="mb-2">
                  <label className="block text-base font-semibold text-gray-700 mb-3">
                    Filter Mode
                  </label>
                  <Select
                    value={mode}
                    onChange={setMode}
                    className="w-full"
                    size="large"
                    options={[
                      { value: "month", label: "By Month" },
                      { value: "range", label: "Custom Range" },
                    ]}
                  />
                </div>
              </Col>

              {mode === "month" ? (
                <Col xs={24} sm={12} md={8}>
                  <div className="mb-2">
                    <label className="block text-base font-semibold text-gray-700 mb-3">
                      Select Month
                    </label>
                    <DatePicker
                      picker="month"
                      onChange={handleMonthChange}
                      className="w-full"
                      size="large"
                      placeholder="Choose month"
                    />
                  </div>
                </Col>
              ) : (
                <Col xs={24} sm={12} md={8}>
                  <div className="mb-2">
                    <label className="block text-base font-semibold text-gray-700 mb-3">
                      Select Date Range
                    </label>
                    <RangePicker
                      onChange={handleRangeChange}
                      className="w-full"
                      size="large"
                      format="YYYY-MM-DD"
                      placeholder={["Start date", "End date"]}
                    />
                  </div>
                </Col>
              )}
            </Row>
          </Card>

          {/* Table Section */}
          <Card 
            className="shadow-xl hover:shadow-2xl transition-all duration-300 border-0 rounded-2xl" 
            title={
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-3">
                    <FileText className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-xl font-bold text-gray-900">Payment Details</span>
                </div>
                {dateRange.length === 2 && (
                  <div className="text-base text-gray-600 font-medium bg-gray-100 px-4 py-2 rounded-lg">
                    {dayjs(dateRange[0]).format("DD MMM YYYY")} - {dayjs(dateRange[1]).format("DD MMM YYYY")}
                  </div>
                )}
              </div>
            }
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-32">
                <CircularLoader color="text-blue-600" />
              </div>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-32">
                <AlertCircle className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-700 mb-3">
                  No Data Available
                </h3>
                <p className="text-lg text-gray-500">
                  Select a date range to view due reports with penalties
                </p>
              </div>
            ) : (
              <DataTable
                data={filteredData}
                columns={columns}
                exportedFileName={`PenaltyMonitor_${dayjs().format("YYYYMMDD_HHmm")}.csv`}
                printHeaderKeys={["Total Expected", "Total Paid", "Total Balance", "Total Penalty"]}
                printHeaderValues={[
                  `₹${totalExpected.toLocaleString("en-IN")}`,
                  `₹${totalPaid.toLocaleString("en-IN")}`,
                  `₹${totalBalance.toLocaleString("en-IN")}`,
                  `₹${totalPenalty.toLocaleString("en-IN")}`,
                ]}
              />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PenaltyMonitor;