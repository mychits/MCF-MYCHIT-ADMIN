import React, { useState, useEffect } from "react";
import DataTable from "../components/layouts/Datatable";
import Navbar from "../components/layouts/Navbar";
import CircularLoader from "../components/loaders/CircularLoader";
import Sidebar from "../components/layouts/Sidebar";
import API from "../instance/TokenInstance";
import { Tag, Tooltip, message } from 'antd'; // Added message and Tooltip
import dayjs from "dayjs";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CopyOutlined, // Added

  LinkOutlined 
} from '@ant-design/icons';

const PaymentLinkTransactions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [tableTransactions, setTableTransactions] = useState([]);

  // Copy Functionality
  const handleCopyLink = (url) => {
    if (!url) {
      message.warning("No payment link available");
      return;
    }
    navigator.clipboard.writeText(url);
    message.success("Link copied to clipboard!");
  };

  async function getTransactions() {
    try {
      setIsLoading(true);
      const response = await API.get("/cashfree-pg-orders");
      const transactionsData = response.data?.data;
      
      const filteredData = transactionsData.map((order, index) => {
        const status = order?.status;
        const color = status === "ACTIVE" ? "blue" : status === "PAID" ? "green" : "red";
        const icon = status === "ACTIVE" ? <ClockCircleOutlined /> : status === "PAID" ? <CheckCircleOutlined /> : <CloseCircleOutlined />;
        
        const groupsString = (order.groups?.map(g => `${g?.group_id?.group_name} | ${g?.ticket}`) || []).join(" | ");
        const pigmysString = (order.pigmys?.map(p => `${p?.payable_amount} | ${p?.pigme_id}`) || []).join(" | ");
        const loansString = (order.loans?.map(l => `${l?.loan_amount} | ${l?.loan_id}`) || []).join(" | ");

        return ({
          id: index + 1,
          createdAt: order.createdAt ? dayjs(order.createdAt).format("YYYY-MM-DD") : "N/A",
          orderType: order?.order_type,
          user_name: order?.user_id?.full_name,
          phone_number: order?.user_id?.phone_number,
          others: groupsString + pigmysString + loansString,
          status: (
            <Tag color={color} icon={icon} variant="filled">
              {status}
            </Tag>
          ),
          statusRaw: status,
          collectedBy: order?.collected_by || "Online",
          amount:order?.amount,
          action: (
            <div className="flex items-center gap-3">
              <Tooltip title={order.link_url ? "Copy Link" : "No Link"}>
                <button
                  onClick={() => handleCopyLink(order.link_url)}
                  className={`p-2 rounded-full transition-colors ${order.link_url ? 'text-blue-600 hover:bg-blue-50' : 'text-gray-300'}`}
                >
                  <CopyOutlined style={{ fontSize: '16px' }} />
                </button>
              </Tooltip>

              <Tooltip title="View Link">
                <button
                  onClick={() => order.link_url ? window.open(order.link_url, "_blank") : message.info("Link not found")}
                  className={`p-2 rounded-full transition-colors ${order.link_url ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-300'}`}
                >
                  <LinkOutlined style={{ fontSize: '16px' }} />
                </button>
              </Tooltip>
            </div>
          )
        });
      });
      setTableTransactions(filteredData);
    } catch (error) {
      console.error(error);
      setTableTransactions([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getTransactions();
  }, []);

  const columns = [
    { key: "id", header: "SL. NO" },
    { key: "createdAt", header: "Date" },
    { key: "user_name", header: "User Name" },
    { key: "others", header: "Details" },
    { key: "amount", header: "Amount" },
    { key: "status", header: "Status" },
    { key: "collectedBy", header: "Collected By" },
    { key: "action", header: "Actions" } // Added column
  ];

  const exportColumns = [
    { key: "id", header: "SL. NO" },
    { key: "createdAt", header: "Date" },
    { key: "orderType", header: "Order Type" },
    { key: "user_name", header: "User Name" },
    { key: "statusRaw", header: "Status" }
  ];

  return (
    <div>
      <Navbar visibility={true} />
      <div className="flex mt-20">
        <Sidebar />
        <div className="flex-grow p-7 bg-gray-50 min-h-screen">
          <div className="mt-6 mb-8 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">
              Payment Link Transactions
            </h1>
            <button 
              onClick={getTransactions}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-all"
            >
              Refresh Data
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {isLoading ? (
              <div className="p-20">
                <CircularLoader isLoading={isLoading} data="Transactions" />
              </div>
            ) : tableTransactions.length > 0 ? (
              <DataTable
                catcher="_id"
                data={tableTransactions}
                columns={columns}
                exportCols={exportColumns}
                exportedPdfName="Payment_Link_Transactions"
                exportedFileName="Payment_Transactions.csv"
              />
            ) : (
              <div className="p-20 text-center text-gray-400 italic">
                No transactions found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentLinkTransactions;