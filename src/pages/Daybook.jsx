/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import api from "../instance/TokenInstance";
import Modal from "../components/modals/Modal";
import DataTable from "../components/layouts/Datatable";
import CircularLoader from "../components/loaders/CircularLoader";
import {
  Select,
  Dropdown,
  Input,
  Tag,
  Card,
  Statistic,
  Row,
  Col,
  Empty,
  Typography,
   Divider,
} from "antd";
const { Text, Title } = Typography;
import Navbar from "../components/layouts/Navbar";
import { IoMdMore } from "react-icons/io";
import {
  ArrowUpOutlined,
  ArrowDownOutlined, 
  WalletOutlined, 
  GlobalOutlined, 
  LinkOutlined, 
  SafetyCertificateOutlined,
  BankOutlined,
 
} from "@ant-design/icons";
import { FaIndianRupeeSign } from "react-icons/fa6";
import { Link } from "react-router-dom";
import filterOption from "../helpers/filterOption";
import { numberToIndianWords } from "../helpers/numberToIndianWords";

const Daybook = () => {
  const [groups, setGroups] = useState([]);
  const [TableDaybook, setTableDaybook] = useState([]);
  const [selectedAuctionGroupId, setSelectedAuctionGroupId] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredAuction, setFilteredAuction] = useState([]);
  const todayString = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayString);
  const [showFilterField, setShowFilterField] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState([]);
  const [selectedPaymentFor, setSelectedPaymentFor] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState("");
  const [selectedAccountType, setSelectedAccountType] = useState("");
  const [collectionAgent, setCollectionAgent] = useState("");
  const [collectionAdmin, setCollectionAdmin] = useState("");
  const [agents, setAgents] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("Today");
  const [showAllPaymentModes, setShowAllPaymentModes] = useState(false);

  // New States for IN/OUT
  const [selectedTransactionType, setSelectedTransactionType] = useState("All");
  const [totals, setTotals] = useState({ in: 0, out: 0, net: 0 });
  const [modeTotals, setModeTotals] = useState({
    cash: 0,
    online: 0,
    link: 0,
  });

  const onGlobalSearchChangeHandler = (e) => setSearchText(e.target.value);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.admin_access_right_id?.access_permissions?.edit_payment) {
      setShowAllPaymentModes(
        user.admin_access_right_id.access_permissions.edit_payment === "true",
      );
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, groupsRes, agentsRes, adminsRes] = await Promise.all([
          api.get("/user/get-user"),
          api.get("/group/get-group-admin"),
          api.get("/employee"),
          api.get("/admin/get-sub-admins"),
        ]);
        setFilteredUsers(usersRes.data);
        setGroups(groupsRes.data);
        setAgents(
          agentsRes.data.employee.map((e) => ({
            ...e,
            full_name: e.name,
            selected_type: "agent_type",
          })),
        );
        setAdmins(
          adminsRes.data.map((a) => ({
            ...a,
            full_name: a.name,
            selected_type: "admin_type",
          })),
        );
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, []);

  const handleSelectFilter = (value) => {
    setSelectedLabel(value);
    setShowFilterField(value === "Custom");
    const today = new Date();
    const fmt = (d) => d.toISOString().slice(0, 10);
    if (value === "Today") setSelectedDate(fmt(today));
    else if (value === "Yesterday")
      setSelectedDate(fmt(new Date(today.setDate(today.getDate() - 1))));
    else if (value === "Twodaysago")
      setSelectedDate(fmt(new Date(today.setDate(today.getDate() - 2))));
  };

  useEffect(() => {
    const abortController = new AbortController();
    const fetchPayments = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/payment/daybook`, {
          params: {
            pay_date: selectedDate,
            groupId: selectedAuctionGroupId,
            userId: selectedCustomers,
            pay_type: selectedPaymentMode,
            account_type: selectedAccountType,
            collected_by: collectionAgent,
            admin_type: collectionAdmin,
            pay_for: selectedPaymentFor,
          },
          signal: abortController.signal,
        });

        if (response.data) {
          let tin = 0,
            tout = 0;

          let cash = 0;
          let online = 0;
          let link = 0;

          const formattedData = response.data.map((item, index) => {
            const amt = Number(item.amount || 0);
            if (item.type === "IN") tin += amt;
            else tout += Math.abs(amt);

            return {
              _id: item._id,
              id: index + 1,
              type: (
                <Tag color={item?.type === "IN" ? "green" : "volcano"}>
                  {item?.type ?? "Unknown"}
                </Tag>
              ),
              type_raw: item?.type,
              group: item?.group_id?.group_name || item?.pay_for || "N/A",
              name: item?.user_id?.full_name || "N/A",
              ticket: item?.ticket || "-",
              receipt: item?.receipt_no || "-",
              amount: (
                <span
                  className={
                    item?.type === "IN"
                      ? "text-green-600 font-bold"
                      : "text-red-600 font-bold"
                  }
                >
                  ₹ {Math.abs(amt).toLocaleString("en-IN")}
                </span>
              ),
              amount_raw: amt,
              pay_date: item.pay_date,
              category: item.pay_for ? item.pay_for : "Chit",
              transaction_date: item.createdAt?.split("T")?.[0],
              mode: item?.pay_type,
              account_type: item?.account_type,
              payment_type: item?.payment_type,
              collected_by:
                item?.collected_by?.name ||
                item?.admin_type?.admin_name ||
                "Super Admin",
              action: (
                <Link
                  target="_blank"
                  to={`/print/${item._id}`}
                  className="text-blue-600"
                >
                  Print
                </Link>
              ),
            };
          });

          let chit = 0,
            loan = 0,
            pigme = 0,
            registration = 0;

          response.data.forEach((item) => {
            if (item.type !== "IN") return; // only collections

            const amt = Number(item.amount || 0);
            const pf = (item.pay_for || "Chit").toLowerCase();

            if (pf.includes("loan")) loan += amt;
            else if (pf.includes("pigme")) pigme += amt;
            else if (pf.includes("reg")) registration += amt;
            else chit += amt; // default chit
          });

          response.data.forEach((item) => {
            const amt = Number(item.amount || 0);

            // Only count collections (IN)
            if (item.type !== "IN") return;

            const mode = (item.pay_type || "").toLowerCase();

            if (mode === "cash") cash += amt;
            else if (mode === "online") online += amt;
            else if (mode.includes("link")) link += amt;
          });

          setCategoryTotals({
            chit,
            loan,
            pigme,
            registration,
          });

          setTotals({ in: tin, out: tout, net: tin - tout });
          setModeTotals({
            cash,
            online,
            link,
          });
          setFilteredAuction(response.data);

          const finalTable =
            selectedTransactionType === "All"
              ? formattedData
              : formattedData.filter(
                  (i) => i?.category === selectedTransactionType,
                );

          setTableDaybook(finalTable);
        }
      } catch (error) {
        setTableDaybook([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
    return () => abortController.abort();
  }, [
    selectedAuctionGroupId,
    selectedDate,
    selectedPaymentMode,
    selectedCustomers,
    selectedAccountType,
    collectionAgent,
    collectionAdmin,
    selectedPaymentFor,
    selectedTransactionType,
  ]);

  const [categoryTotals, setCategoryTotals] = useState({
    chit: 0,
    loan: 0,
    pigme: 0,
    registration: 0,
  });

  const columns = [
    { key: "id", header: "SL" },
    { key: "transaction_date", header: "Transaction Date" },
    { key: "payment_type", header: "Payment Type" },
    { key: "pay_date", header: "Payment Date" },
    {
      key: "type",
      header: "Type",
    },
    {
      key: "category",
      header: "Category",
    },
    { key: "group", header: "Group/Reason" },
    { key: "name", header: "Customer" },
    { key: "ticket", header: "Ticket" },
    { key: "receipt", header: "Receipt" },
    {
      key: "amount",
      header: "Amount",
    },
    { key: "mode", header: "Mode" },
    { key: "collected_by", header: "Collected By" },
    { key: "action", header: "Action" },
  ];
  const exportCols = [
    { key: "id", header: "SL" },
    { key: "transaction_date", header: "Transaction Date" },
    { key: "payment_type", header: "Payment Type" },
    { key: "pay_date", header: "Payment Date" },
    {
      key: "type_raw",
      header: "Type",
    },
    { key: "group", header: "Group/Reason" },
    { key: "name", header: "Customer" },
    { key: "ticket", header: "Ticket" },
    { key: "receipt", header: "Receipt" },
    {
      key: "amount_raw",
      header: "Amount",
    },
    { key: "mode", header: "Mode" },
    {
      key: "category",
      header: "Category",
    },
    { key: "collected_by", header: "Collected By" },
  ];

  return (
    <div className="relative flex flex-col [height:calc(100vh-100px)] ">
      <Navbar
        onGlobalSearchChangeHandler={onGlobalSearchChangeHandler}
        visibility={true}
      />
      <div className="flex-grow p-8 bg-slate-50 min-h-screen">
        {/* Professional Header & Summary Dashboard */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Daybook Report</h1>
          <p className="text-slate-500">
            Comprehensive view of daily collections and disbursements
          </p>
        </div>

        {/* <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} md={8}>
            <Card className="shadow-sm border-l-4 border-green-500">
              <Statistic
                title="Total IN (Collections)"
                value={totals.in}
                precision={2}
                prefix={
                  <>
                    <ArrowUpOutlined />₹
                  </>
                }
                valueStyle={{ color: "#059669" }}
              />
            </Card>
            <span className={`text-sm font-mono text-green-700 pl-3`}>
              {numberToIndianWords(totals.in || 0)}
            </span>
          </Col>
          <Col xs={24} md={8}>
            <Card className="shadow-sm border-l-4 border-red-500">
              <Statistic
                title="Total OUT (Payouts)"
                value={totals.out}
                precision={2}
                prefix={
                  <>
                    <ArrowDownOutlined /> ₹
                  </>
                }
                valueStyle={{ color: "#dc2626" }}
              />
            </Card>
            <span className={`text-sm font-mono text-red-700 pl-3`}>
              {numberToIndianWords(totals.out || 0)}
            </span>
          </Col>
          <Col xs={24} md={8}>
            <Card className="shadow-sm border-l-4 border-indigo-500">
              <Statistic
                title="Chit Collections"
                value={categoryTotals.chit}
                precision={2}
                prefix={
                  <>
                    <ArrowDownOutlined /> ₹
                  </>
                }
                valueStyle={{ color: "#4f46e5" }}
              />
            </Card>
            <span className={`text-sm font-mono text-indigo-700 pl-3`}>
              {numberToIndianWords(categoryTotals.chit || 0)}
            </span>
          </Col>
        </Row>
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} md={8}>
            <Card className="shadow-sm border-l-4 border-orange-500">
              <Statistic
                title="Loan Collections"
                value={categoryTotals.loan}
                precision={2}
                prefix={
                  <>
                    <ArrowUpOutlined />₹
                  </>
                }
                valueStyle={{ color: "#d97706" }}
              />
            </Card>
            <span className={`text-sm font-mono text-orange-700 pl-3`}>
              {numberToIndianWords(categoryTotals.loan || 0)}
            </span>
          </Col>
          <Col xs={24} md={8}>
            <Card className="shadow-sm border-l-4 border-green-800">
              <Statistic
                title="Pigme Collections"
                value={categoryTotals.pigme}
                precision={2}
                prefix={
                  <>
                    <ArrowDownOutlined /> ₹
                  </>
                }
                valueStyle={{ color: "#0d9488" }}
              />
            </Card>
            <span className={`text-sm font-mono text-green-800 pl-3`}>
              {numberToIndianWords(categoryTotals.pigme || 0)}
            </span>
          </Col>
          <Col xs={24} md={8}>
            <Card className="shadow-sm border-l-4 border-pink-500">
              <Statistic
                title="Registration Fees"
                value={categoryTotals.registration}
                precision={2}
                prefix={
                  <>
                    <ArrowDownOutlined /> ₹
                  </>
                }
                valueStyle={{ color: "#db2777" }}
              />
            </Card>
            <span className={`text-sm font-mono text-pink-700 pl-3`}>
              {numberToIndianWords(categoryTotals.registration || 0)}
            </span>
          </Col>
        </Row>
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} md={8}>
            <Card className="shadow-sm border-l-4 border-green-500">
              <Statistic
                title="Cash Collection"
                value={modeTotals.cash}
                precision={2}
                prefix={
                  <>
                    <ArrowUpOutlined />₹
                  </>
                }
                valueStyle={{ color: "#15803d" }}
              />
            </Card>
            <span className={`text-sm font-mono text-green-700 pl-3`}>
              {numberToIndianWords(modeTotals.cash || 0)}
            </span>
          </Col>
          <Col xs={24} md={8}>
            <Card className="shadow-sm border-l-4 border-blue-800">
              <Statistic
                title="Online Collection"
                value={modeTotals.online}
                precision={2}
                prefix={
                  <>
                    <ArrowDownOutlined /> ₹
                  </>
                }
                valueStyle={{ color: "#2563eb" }}
              />
            </Card>
            <span className={`text-sm font-mono text-blue-800 pl-3`}>
              {numberToIndianWords(modeTotals.online || 0)}
            </span>
          </Col>
          <Col xs={24} md={8}>
            <Card className="shadow-sm border-l-4 border-purple-500">
              <Statistic
                title="Payment Link Collection"
                value={modeTotals.link}
                precision={2}
                prefix={
                  <>
                    <ArrowDownOutlined /> ₹
                  </>
                }
                valueStyle={{ color: "#7c3aed" }}
              />
            </Card>
            <span className={`text-sm font-mono text-purple-700 pl-3`}>
              {numberToIndianWords(modeTotals.link || 0)}
            </span>
          </Col>
        </Row> */}

        <div className="p-6 bg-gray-50 rounded-2xl">
      {/* SECTION: Overview */}
      <div className="mb-6">
        <Title level={4} className="!mb-4 text-gray-700">Financial Overview</Title>
        <Row gutter={[20, 20]}>
          <Col xs={24} md={12}>
            <Card className="shadow-md hover:shadow-lg transition-all duration-300 border-none rounded-xl bg-gradient-to-br from-white to-green-50/30 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
              <Statistic
                title={<Text strong className="text-gray-500 uppercase tracking-wider text-xs">Total IN (Collections)</Text>}
                value={totals.in}
                precision={2}
                prefix={<ArrowUpOutlined className="text-emerald-500" />}
                valueStyle={{ color: "#065f46", fontWeight: '700', fontSize: '1.8rem' }}
              />
              <div className="mt-2 py-1 px-2 bg-emerald-100/50 rounded inline-block">
                <Text className="text-xs font-medium text-emerald-800 italic">
                  {numberToIndianWords(totals.in || 0)}
                </Text>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card className="shadow-md hover:shadow-lg transition-all duration-300 border-none rounded-xl bg-gradient-to-br from-white to-red-50/30 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500" />
              <Statistic
                title={<Text strong className="text-gray-500 uppercase tracking-wider text-xs">Total OUT (Payouts)</Text>}
                value={totals.out}
                precision={2}
                prefix={<ArrowDownOutlined className="text-rose-500" />}
                valueStyle={{ color: "#9f1239", fontWeight: '700', fontSize: '1.8rem' }}
              />
              <div className="mt-2 py-1 px-2 bg-rose-100/50 rounded inline-block">
                <Text className="text-xs font-medium text-rose-800 italic">
                  {numberToIndianWords(totals.out || 0)}
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      <Divider />

      {/* SECTION: Categories */}
      <div className="mb-6">
        <Title level={4} className="!mb-4 text-gray-700">Category Breakdown</Title>
        <Row gutter={[16, 16]}>
          {[
            { title: "Chit Collections", val: categoryTotals.chit, color: "#6366f1", bg: "indigo", icon: <BankOutlined /> },
            { title: "Loan Collections", val: categoryTotals.loan, color: "#f59e0b", bg: "orange", icon: "₹" },
            { title: "Pigme Collections", val: categoryTotals.pigme, color: "#0d9488", bg: "teal", icon: <WalletOutlined /> },
            { title: "Registration Fees", val: categoryTotals.registration, color: "#db2777", bg: "pink", icon: <SafetyCertificateOutlined /> }
          ].map((item, idx) => (
            <Col xs={24} sm={12} md={6} key={idx}>
              <Card size="small" className="hover:-translate-y-1 transition-transform duration-300 shadow-md border-gray-100 rounded-lg ">
                <Statistic
                  title={<span className="text-gray-400 font-medium">{item.title}</span>}
                  value={item.val}
                  precision={2}
                  prefix={<span style={{ color: item.color, marginRight: 4 }}>{item.icon}</span>}
                  valueStyle={{ color: item.color, fontSize: '1.25rem', fontWeight: '600' }}
                />
                <div className="mt-1">
                  <Text type="secondary" className="text-[10px] uppercase font-mono leading-none">
                    {numberToIndianWords(item.val || 0)}
                  </Text>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* SECTION: Payment Modes */}
      <div className="mb-6">
        <Title level={4} className="!mb-4 text-gray-700">Payment Modes</Title>
        <Row gutter={[16, 16]}>
          {[
            { title: "Cash", val: modeTotals.cash, color: "#16a34a", icon: <WalletOutlined /> },
            { title: "Online", val: modeTotals.online, color: "#2563eb", icon: <GlobalOutlined /> },
            { title: "Payment Link", val: modeTotals.link, color: "#7c3aed", icon: <LinkOutlined /> }
          ].map((mode, idx) => (
            <Col xs={24} md={8} key={idx}>
              <Card className="bg-white border-none rounded-xl shadow-lg">
                <Statistic
                  title={<span className="text-gray-400">{mode.title} Collection</span>}
                  value={mode.val}
                  precision={2}
                  valueStyle={{ color: '#000', fontWeight: 'bold' }}
                  prefix={<span style={{ color: mode.color }}>{mode.icon}</span>}
                />
                <Text className="text-gray-900 text-[11px] font-mono italic">
                  {numberToIndianWords(mode.val || 0)}
                </Text>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>

        

        {/* Existing Filters Card */}
        <div className="bg-white rounded-xl shadow-md border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* New IN/OUT Filter */}
            {/* <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">TRANSACTION TYPE</label>
              <Select className="w-full h-10" value={selectedTransactionType} onChange={setSelectedTransactionType}>
                <Select.Option value="All">All (IN & OUT)</Select.Option>
                <Select.Option value="IN">Payment IN Only</Select.Option>
                <Select.Option value="OUT">Payment OUT Only</Select.Option>
              </Select>
            </div> */}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">
                DATE RANGE
              </label>
              <Select
                className="w-full h-10"
                value={selectedLabel}
                onChange={handleSelectFilter}
                options={[
                  { value: "Today", label: "Today" },
                  { value: "Yesterday", label: "Yesterday" },
                  { value: "Twodaysago", label: "Two Days Ago" },
                  { value: "Custom", label: "Custom" },
                ]}
              />
            </div>

            {showFilterField && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 ">
                  CUSTOM DATE
                </label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="h-10 rounded-md"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">GROUP</label>
              <Select
                className="w-full h-10"
                showSearch
                value={selectedAuctionGroupId}
                onChange={setSelectedAuctionGroupId}
                placeholder="Select Group"
                filterOption={(input, option) =>
                  option?.children
                    ?.toString()
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                <Select.Option value="">All Groups</Select.Option>
                {groups.map((g) => (
                  <Select.Option key={g._id} value={g._id}>
                    {g.group_name}
                  </Select.Option>
                ))}
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">
                CUSTOMER
              </label>
              <Select
                className="w-full h-10"
                showSearch
                value={selectedCustomers}
                onChange={setSelectedCustomers}
                placeholder="Select Customer"
                filterOption={(input, option) =>
                  option?.children
                    ?.toString()
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                <Select.Option value="">All Customers</Select.Option>
                {filteredUsers.map((u) => (
                  <Select.Option key={u._id} value={u?._id}>
                    {u?.full_name} - {u?.phone_number}
                  </Select.Option>
                ))}
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">
                PAYMENT FOR
              </label>
              <Select
                mode="multiple"
                className="w-full min-h-10"
                value={selectedPaymentFor}
                onChange={setSelectedPaymentFor}
                placeholder="Chit, Loan, etc."
              >
                <Select.Option value="Chit">Chit</Select.Option>
                <Select.Option value="Pigme">Pigme</Select.Option>
                <Select.Option value="Loan">Loan</Select.Option>
                <Select.Option value="Registration">
                  Registration Fee
                </Select.Option>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">
                PAYMENT MODE
              </label>
              <Select
                mode="multiple"
                className="w-full min-h-10"
                value={selectedPaymentMode}
                onChange={setSelectedPaymentMode}
                options={[
                  { label: "Cash", value: "cash" },
                  { label: "Online", value: "online" },
                  { label: "Payment Link", value: "Payment Link" },
                ]}
                placeholder="Cash, Online, etc."
              />
            </div>

            {showAllPaymentModes && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">
                  ACCOUNT TYPE
                </label>
                <Select
                  className="w-full h-10"
                  value={selectedAccountType}
                  onChange={setSelectedAccountType}
                  options={[
                    { label: "All", value: "" },
                    { label: "Suspense", value: "suspense" },
                    { label: "Credit", value: "credit" },
                  ]}
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Collection Employee
              </label>
              <Select
                showSearch
                placeholder="Select employee"
                popupMatchSelectWidth={false}
                onChange={(selection) => {
                  const [id, type] = selection.split("|") || [];
                  if (type === "admin_type") {
                    setCollectionAdmin(id);
                    setCollectionAgent("");
                  } else if (type === "agent_type") {
                    setCollectionAgent(id);
                    setCollectionAdmin("");
                  } else {
                    setCollectionAdmin("");
                    setCollectionAgent("");
                  }
                }}
                filterOption={(input, option) =>
                  option.children
                    .toString()
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                className="w-full"
                style={{ height: "44px" }}
              >
                <Select.Option value="">All Employees</Select.Option>
                {[...new Set(agents), ...new Set(admins)].map((dt) => (
                  <Select.Option
                    key={dt?._id}
                    value={`${dt._id}|${dt.selected_type}`}
                  >
                    {dt.selected_type === "admin_type"
                      ? "Admin | "
                      : "Employee | "}
                    {dt.full_name} | {dt.phone_number}
                  </Select.Option>
                ))}
              </Select>
            </div>

            {/* <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">
                TOTAL DISPLAYED
              </label>
              <div className="h-10 px-3 flex items-center bg-blue-50 border border-blue-200 rounded text-blue-700 font-bold">
                ₹ {totals?.net.toLocaleString("en-IN")}
              </div>
              <span
                className={`text-sm font-mono ${totals?.net < 0 ? "text-red-700" : "text-green-700"}`}
              >
                {numberToIndianWords(totals?.net || 0)}
              </span>
            </div> */}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border p-4">
          {isLoading ? (
            <div className="py-20 flex justify-center">
              <CircularLoader isLoading={true} />
            </div>
          ) : TableDaybook?.length <= 0 ? (
            <Empty description="Daybook Data is not found" />
          ) : (
            <DataTable
              data={filterOption(TableDaybook, searchText)}
              columns={columns}
              exportCols={exportCols}
              exportedPdfName={`Daybook_${selectedDate}`}
              printHeaderKeys={[
                "Total IN",
                "Total OUT",
                "Cash Collection",
                "Online Collection",
                "Payment Link",
                "Chit Collections",
                "Loan Collections",
                "Pigme Collections",
                "Registration Fees",
              ]}
              printHeaderValues={[
                `₹ ${totals.in.toLocaleString("en-IN")}`,
                `₹ ${totals.out.toLocaleString("en-IN")}`,
                `₹ ${modeTotals.cash.toLocaleString("en-IN")}`,
                `₹ ${modeTotals.online.toLocaleString("en-IN")}`,
                `₹ ${modeTotals.link.toLocaleString("en-IN")}`,
                `₹ ${categoryTotals.chit.toLocaleString("en-IN")}`,
                `₹ ${categoryTotals.loan.toLocaleString("en-IN")}`,
                `₹ ${categoryTotals.pigme.toLocaleString("en-IN")}`,
                `₹ ${categoryTotals.registration.toLocaleString("en-IN")}`,
              ]}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Daybook;
