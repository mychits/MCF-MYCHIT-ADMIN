import React, { useEffect, useState } from "react";
import Navbar from "../components/layouts/Navbar";
import Sidebar from "../components/layouts/Sidebar";
import API from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import { DatePicker, Space, Select, Dropdown } from "antd";
const { RangePicker } = DatePicker;
import { IoMdMore } from "react-icons/io";
import { Link, useSearchParams } from "react-router-dom";

const SuspensePayments = () => {
  const [paymentsData, setPaymentsData] = useState([]);
  const [groups, setGroups] = useState([]);
  const today = new Date();
  const dateStringToday = today.toISOString().split("T")[0];

  const [loading, setLoading] = useState(false);
  const [groupFilterLoading, setGroupFilterLoading] = useState(false);
  const [searchParams,setSearchParams] = useSearchParams()
  const [startDate, setStartDate] = useState(searchParams.get("start_date")||null);
  const [endDate, setEndDate] = useState(searchParams.get("end_date")||null);
  const [group, setGroup] = useState(searchParams.get("group_id"));
  
  const handleDeleteModalOpen = () => {};
  const handleViewModalOpen = () => {};
  const handleUpdateModalOpen = () => {};
  
  const dropDownItems = (user) => {
    console.log(user,"this is user")
    const dropDownItemList = [
      {
        key: "1",
        label: (
          <Link to={`/print/${user?._id}`} className="text-blue-600">
            Print
          </Link>
        ),
      },
      {
        key: "2",
        label: (
          <div
            className="text-green-600"
            onClick={() => handleViewModalOpen(user?._id)}
          >
            View
          </div>
        ),
      },
      {
        key: "3",
        label: (
          <div
            className="text-red-600"
            onClick={() => handleDeleteModalOpen(user?._id)}
          >
            Delete
          </div>
        ),
      },
    ];

    return dropDownItemList;
  };
  
  async function getPayments() {
    try {
      setLoading(true);
      const payments = await API.get(`/payment/suspense?group_id=${group}&start_date=${startDate}&end_date=${endDate}`);
      const responseData = payments?.data?.data.map((payment, index) => ({
        key: payment?._id,
        payment_id: payment._id,
        slNo: index + 1,
        customerName: payment?.user_id?.full_name,
        customerId: payment?.user_id?.customer_id,
        customerPhone: payment?.user_id?.phone_number,
        adminType: payment?.admin_type?.admin_name,
        groupName: payment?.group_id?.group_name,
        ticket: payment?.ticket,
        receiptNo: payment.receipt_no,
        amount: payment.amount,
        payType: payment.pay_type,
        payDate: payment.pay_date,
        transactionDate: payment.createdAt.split("T")[0],
        

        action: (
          <div className="flex justify-center gap-2">
            <Dropdown
              key={payment?._id}
              trigger={["click"]}
              menu={{
                items: dropDownItems(payment?.user_id),
              }}
              placement="bottomLeft"
            >
              <IoMdMore className="text-bold cursor-pointer text-xl hover:text-gray-600" />
            </Dropdown>
          </div>
        ),
      }));
      setPaymentsData(responseData);
    } catch (error) {
      setPaymentsData([]);
    } finally {
      setLoading(false);
    }
  }
  
  async function getGroups() {
    try {
      const response = await API.get("/group/get-group-admin");
      const filteredGroups = response?.data?.map((group, index) => ({
        value: group?._id,
        label: group?.group_name,
      }));
      setGroups(filteredGroups);
    } catch (error) {
      setGroups([]);
    }
  }

  useEffect(() => {
    getPayments();
  }, [group, startDate, endDate]);
  
  useEffect(() => {
    getGroups();
  }, []);

  const handleRangeChange = (dates, dateStrings) => {
    if (dates) {
      setStartDate(dateStrings[0]);
      setEndDate(dateStrings[1]);
      const entries = Object.fromEntries(searchParams);
      setSearchParams({...entries,start_date:dateStrings[0],end_date:dateStrings[1]});
    } else {
      setStartDate(null);
      setEndDate(null);
    }
  };
  
  const columns = [
    { key: "slNo", header: "Sl No" },
    { key: "transactionDate", header: "Transaction Date" },
    { key: "payDate", header: "Pay Date" },
    { key: "slNo", header: "Sl No" },
    { key: "customerName", header: "Customer Name" },
    { key: "customerId", header: "Customer Id" },
    { key: "customerPhone", header: "Customer Phone" },
    { key: "groupName", header: "Group Name" },
    { key: "ticket", header: "Ticket" },
    { key: "amount", header: "Amount" },
    { key: "payType", header: "Pay Type" },
    { key: "receiptNo", header: "Receipt No" },
    { key: "adminType", header: "Admin Type" },
    { key: "action", header: "Actions" },
  ];
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Navbar visibility={true} />
      <Sidebar />
      
      <main className="flex-1 p-6  mt-20">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Suspense Payments</h1>
          <p className="text-gray-600">Manage and track suspense payment records</p>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Filters</h2>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <RangePicker 
                onChange={handleRangeChange}
                className="w-64"
               
                size="large"
                placeholder={['Start Date', 'End Date']}
              />
            </div>
            
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">Group</label>
              <Select
                showSearch
                size="large"
                style={{ width: 240 }}  
                placeholder="Select a group"
                optionFilterProp="label"
                filterSort={(optionA, optionB) =>
                  (optionA?.label ?? "")
                    .toLowerCase()
                    .localeCompare((optionB?.label ?? "").toLowerCase())
                }
                value={group}
                options={groups}
                onChange={(value) => {
                  const entries = Object.fromEntries(searchParams)
                  setSearchParams({...entries,group_id:value})
                  setGroup(value)}}
                loading={groupFilterLoading}
                allowClear
              />
            </div>
          </div>
        </div>

        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Payment Records</h2>
            <div className="text-sm text-gray-600">
              Total Records: <span className="font-semibold">{paymentsData.length}</span>
            </div>
          </div>
          
          <DataTable 
            columns={columns} 
            data={paymentsData} 
            loading={loading}
          />
        </div>
      </main>
    </div>
  );
};

export default SuspensePayments;

