/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import Sidebar from "../components/layouts/Sidebar";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import CustomAlert from "../components/alerts/CustomAlert";
import CircularLoader from "../components/loaders/CircularLoader";
import Navbar from "../components/layouts/Navbar";
import { Select, Dropdown, Modal as AntModal, DatePicker, Tag, Switch, Tooltip } from "antd";
import { IoMdMore } from "react-icons/io";
import { FaGavel, FaEye } from "react-icons/fa";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

const AuctionPage = () => {
  const [auctions, setAuctions] = useState([]);
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewLoader, setViewLoader] = useState(false);
  const [searchText, setSearchText] = useState("");

  const [filters, setFilters] = useState({
    groupId: "",
    userId: "",
    auctiontype: "",
    prized: false,
    startDate: "",
    endDate: ""
  });

  const [showModalView, setShowModalView] = useState(false);
  const [currentAuction, setCurrentAuction] = useState(null);

  const [alertConfig, setAlertConfig] = useState({
    visibility: false,
    message: "",
    type: "info",
  });

  const columns = [
    { key: "id", header: "SL. NO" },
    { key: "auction_date", header: "Auction Date" },
    { key: "group_name", header: "Group Name" },
    { key: "user_name", header: "Winner Name" },
    { key: "ticket", header: "Ticket" },
    { key: "win_amount", header: "Winning Amount" },
    { key: "bid_amount", header: "Bid Amount" },
    { key: "dividend", header: "Dividend" },
    { key: "auction_type", header: "Type" },
    { key: "prized", header: "Prized" },
    { key: "action", header: "Action" },
  ];
  const exportColumns = [

    { key: "id", header: "SL. NO" },
    { key: "auction_date", header: "Auction Date" },
    { key: "group_name", header: "Group Name" },
    { key: "user_name", header: "Winner Name" },
    { key: "ticket", header: "Ticket" },
    { key: "win_amount_raw", header: "Winning Amount" },
    { key: "bid_amount", header: "Bid Amount" },
    { key: "dividend_raw", header: "Dividend" },
    
    { key: "auction_type_raw", header: "Type" },
    { key: "prized_raw", header: "Prized" },
    { key: "action", header: "Action" },
  ];

  const fetchInitialData = async () => {
    try {
      const [groupRes, userRes] = await Promise.all([
        api.get("/group/get-group-admin"),
        api.get("user/verified")
      ]);
      setGroups(groupRes.data || []);
      setUsers(userRes.data?.data || []);
    } catch (error) {
      console.error("Error fetching initial data", error);
    }
  };

  const fetchFilteredAuctions = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (filters.groupId) params.groupId = filters.groupId;
      if (filters.userId) params.userId = filters.userId;
      if (filters.auctiontype) params.auctiontype = filters.auctiontype;
      if (filters.prized) params.prized = filters.prized;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const response = await api.get("/auction", { params });

      if (response.data && response.data?.data) {
        const formattedData = response.data?.data.map((item, index) => ({
          ...item,
          id: index + 1,
          auction_date: item.auction_date ? dayjs(item?.auction_date).format("YYYY-MM-DD") : "N/A",
          group_name: item.group_id?.group_name || "N/A",
          user_name: item.user_id?.full_name || "N/A",
          win_amount: `₹${item.win_amount?.toLocaleString()}`,
          win_amount_raw: item?.win_amount,
          dividend: `₹${item?.divident?.toLocaleString()}`,
          dividend_raw: item?.divident,
          auction_type: <Tag color={item.auction_type === 'free' ? 'purple' : 'blue'}>{item.auction_type?.toUpperCase()}</Tag>,
          auction_type_raw: item?.auction_type,
          prized: <Tag color={item?.isPrized === 'true' ? 'green' : 'red'}>{item?.isPrized ? "Yes" : "No"}</Tag>,
           bid_amount: parseInt(item.divident) + parseInt(item.commission),
          prized_raw:item?.isPrized ? "Yes" : "No",
          action: (
            <div className="flex justify-center">
              <Tooltip title="View Details">
                <button
                  onClick={() => handleViewAuction(item)}
                  className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100"
                >
                  <FaEye />
                </button>
              </Tooltip>
            </div>
          ),
        }));
        console.log(formattedData)
        setAuctions(formattedData);
      }
    } catch (error) {
      setAuctions([]);
      console.error("Error fetching auctions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchFilteredAuctions();
  }, [filters]);

  const handleViewAuction = (auction) => {
    setCurrentAuction(auction);
    setShowModalView(true);
  };

  const onDateRangeChange = (dates) => {
    if (dates) {
      setFilters(prev => ({
        ...prev,
        startDate: dates[0].format("YYYY-MM-DD"),
        endDate: dates[1].format("YYYY-MM-DD")
      }));
    } else {
      setFilters(prev => ({ ...prev, startDate: "", endDate: "" }));
    }
  };

  return (
    <div className="flex">

      <CustomAlert
        type={alertConfig.type}
        isVisible={alertConfig.visibility}
        message={alertConfig.message}
      />

      <div className="flex-grow p-7 bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FaGavel className="text-blue-900" /> Auction Management
          </h1>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Filter by Group</label>
              <Select
                placeholder="All Groups"
                className="w-full h-10 mt-1"
                allowClear
                onChange={(val) => setFilters(prev => ({ ...prev, groupId: val }))}
              >
                {groups.map(g => (
                  <Select.Option key={g._id} value={g._id}>{g.group_name}</Select.Option>
                ))}
              </Select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Filter by Winner</label>
              <Select
                placeholder="All Users"
                className="w-full h-10 mt-1"
                allowClear
                showSearch
                filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                onChange={(val) => setFilters(prev => ({ ...prev, userId: val }))}
              >
                {users.map(u => (
                  <Select.Option key={u._id} value={u._id}>{u.full_name}</Select.Option>
                ))}
              </Select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Auction Date Range</label>
              <RangePicker className="w-full h-10 mt-1" onChange={onDateRangeChange} />
            </div>


            <div className="flex gap-4">
              <div className="flex-grow">
                <label className="text-xs font-bold text-gray-500 uppercase">Auction Type</label>
                <Select
                  placeholder="Type"
                  className="w-full h-10 mt-1"
                  allowClear
                  onChange={(val) => setFilters(prev => ({ ...prev, auctiontype: val }))}
                >
                  <Select.Option value="normal">Normal</Select.Option>
                  <Select.Option value="free">Free</Select.Option>
                </Select>
              </div>
              <div className="flex flex-col items-center">
                <label className="text-xs font-bold text-gray-500 uppercase">Prized</label>
                <Switch
                  className="mt-3"
                  onChange={(val) => setFilters(prev => ({ ...prev, prized: val }))}
                />
              </div>
            </div>

          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          {isLoading ? (
            <CircularLoader isLoading={true} data="Auctions" />
          ) : (
            <DataTable
              data={auctions}
              columns={columns}
              exportCols={exportColumns}
              exportedPdfName="Auction_Report"
            />
          )}
        </div>
      </div>

      <AntModal
        title={<div className="text-xl font-bold border-b pb-2">Auction Detailed Report</div>}
        open={showModalView}
        onCancel={() => setShowModalView(false)}
        footer={null}
        width={600}
      >
        {currentAuction && (
          <div className="grid grid-cols-2 gap-y-4 py-4">
            <DetailItem label="Group Name" value={currentAuction.group_id?.group_name} />
            <DetailItem label="Winner" value={currentAuction.user_id?.full_name} />
            <DetailItem label="Ticket No" value={currentAuction.ticket} />
            <DetailItem label="Auction Date" value={dayjs(currentAuction.auction_date).format("DD-MM-YYYY")} />
            <DetailItem label="Winning Amount" value={`₹${currentAuction.win_amount}`} />
            <DetailItem label="Commission" value={`₹${currentAuction.commission}`} />
            <DetailItem label="Total Dividend" value={`₹${currentAuction.divident}`} />
            <DetailItem label="Dividend Per Head" value={`₹${currentAuction.divident_head}`} />
            <DetailItem label="Payable Amount" value={`₹${currentAuction.payable}`} />
            <DetailItem label="Next Auction Date" value={currentAuction.next_date} />
            <DetailItem
              label="Prized Status"
              value={<Tag color={currentAuction.isPrized ? "green" : "red"}>{currentAuction.isPrized ? "YES" : "NO"}</Tag>}
            />
          </div>
        )}
      </AntModal>
    </div>
  );
};

const DetailItem = ({ label, value }) => (
  <div className="flex flex-col border-b border-gray-50 pb-2 mr-4">
    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
    <span className="text-sm font-semibold text-gray-800">{value || "N/A"}</span>
  </div>
);

export default AuctionPage;