import React, { useEffect, useState, useMemo } from 'react'
import { notification } from "antd";
import api from '../instance/TokenInstance';
import Navbar from '../components/layouts/Navbar';
import Sidebar from '../components/layouts/Sidebar';
import { FaWhatsapp, FaUsers, FaCheckCircle } from "react-icons/fa";
import DataTable from '../components/layouts/Datatable';
import CircularLoader from '../components/loaders/CircularLoader';

const CustomerDueLoanWhatsAppMessage = () => {
  const [searchText, setSearchText] = useState("");
  const [usersData, setUsersData] = useState([]);
  const [activeUserData, setActiveUserData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectAll, setSelectAll] = useState(false);

  const [notifier, contextHolder] = notification.useNotification();


  const fetchData = async () => {
    try {
      setIsLoading(true);

      const res = await api.get("/payment/customers/due-loan-report");
      const list = res.data.loanReports || [];

      const mapped = list
        .filter((loan) => Number(loan.outstanding) > 0)
        .map((loan) => ({
          _id: loan._id,       
          customerName: loan.borrower?.full_name || "-",
          customerPhone: loan.borrower?.phone_number || "-",
          loanID: loan.loan_id || loan._id,
          outstanding: loan.outstanding,
          balance: loan.outstanding,      
          userName: loan.borrower?.full_name || "-",
          userPhone: loan.borrower?.phone_number || "-",
          loanAmount: loan.loan_amount,
          dailyAmount: loan.daily_payment_amount,
          amountToBePaid: loan.amount_payable,
          amountPaid: loan.total_paid_amount,
          dueDays: loan.duedaysCount,
          lastPay: loan.last_payment_amount,
          secondLastPay: loan.second_last_payment_amount,
          thirdLastPay: loan.third_last_payment_amount,
          referredBy: loan.referredBy || "N/A",
        }));

      const tempActive = {};
      mapped.forEach((row) => {
        tempActive[row._id] = {
          info: {
            status: false,
            customerName: row.customerName,
            customerPhone: row.customerPhone,
            loanID: row.loanID,
            outstanding: row.outstanding,
            amountPaid: row.amountPaid,
          },
        };
      });

      setUsersData(mapped);
      setActiveUserData(tempActive);

    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);


  const filterOption = (data, text) => {
    if (!text) return data;
    const search = text.toLowerCase();

    return data.filter((row) =>
      Object.values(row).some((val) =>
        String(val).toLowerCase().includes(search)
      )
    );
  };


  const filteredUsers = useMemo(() => {
    const filtered = filterOption(usersData, searchText);

    return filtered.map((user, index) => {
      const isSelected = !!activeUserData[user._id]?.info?.status;

      return {
        ...user,
        sl_no: index + 1,
        checkBoxs: (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              setActiveUserData((prev) => ({
                ...prev,
                [user._id]: {
                  info: {
                    status: e.target.checked,

                    // ✅ backend required fields
                    customerName: user.customerName,
                    customerPhone: user.customerPhone,
                    loanID: user.loanID,
                    outstanding: user.outstanding,
                    amountPaid: user.amountPaid,
                  },
                },
              }));
            }}
          />
        ),
        isSelected,
      };
    });
  }, [usersData, searchText, activeUserData]);


  useEffect(() => {
    setSelectAll(
      filteredUsers.length > 0 &&
        filteredUsers.every((u) => u.isSelected)
    );
  }, [filteredUsers]);

  const visibleSelectedCount = useMemo(
    () => filteredUsers.filter((u) => u.isSelected).length,
    [filteredUsers]
  );


  const sendWhatsapp = async () => {
    const key = "wa";

    try {
      notifier.open({
        key,
        message: "Sending WhatsApp Messages...",
        duration: 2,
      });

      const payload = {};

      filteredUsers.forEach((user) => {
        if (user.isSelected) {
          payload[user._id] = activeUserData[user._id];
        }
      });

      if (!Object.keys(payload).length) {
        notifier.error({ message: "No users selected" });
        return;
      }

      const res = await api.post(
        "/whatsapp/loan-due-message",
        payload
      );

      notifier.success({
        key,
        message: `Sent: ${res.data.successCount} | Failed: ${res.data.errorCount}`,
      });

      fetchData(); // refresh

    } catch (err) {
      notifier.error({
        key,
        message: "WhatsApp send failed",
        description: err.message,
      });
    }
  };

  // =========================
  // TABLE COLUMNS
  // =========================
  const columns = [
    { key: "sl_no", header: "SL NO" },
    { key: "userName", header: "Customer Name" },
    { key: "userPhone", header: "Phone" },
    { key: "loanAmount", header: "Loan Amount" },
    { key: "dailyAmount", header: "Daily Pay" },
    { key: "amountToBePaid", header: "Expected Payable" },
    { key: "amountPaid", header: "Paid" },
    { key: "balance", header: "Outstanding" },
    { key: "dueDays", header: "Due Days" },
    // { key: "lastPay", header: "Last Pay" },
    // { key: "secondLastPay", header: "2nd Pay" },
    // { key: "thirdLastPay", header: "3rd Pay" },
    { key: "referredBy", header: "Referred By" },
    { key: "checkBoxs", header: "Select" },
  ];
  return (
    <div className="w-screen">
      {contextHolder}

      <div className="flex mt-30">
        <Navbar
          onGlobalSearchChangeHandler={(e) => setSearchText(e.target.value)}
          visibility={true}
        />
        <Sidebar />

        <div className="flex-grow p-7 mt-32">
          <h1 className="text-2xl font-bold text-center">
            OutStanding Loan WhatsApp Messages
          </h1>

          {isLoading ? (
            <CircularLoader color="text-green-600" />
          ) : (
            <>
              {/* SUMMARY CARDS */}
              <div className="grid grid-cols-2 gap-6 mt-8 mb-6">
                <div className="bg-blue-100 p-6 rounded-xl shadow flex justify-between">
                  <div>
                    <p>Total Due Customers</p>
                    <p className="text-3xl font-bold">
                      {filteredUsers.length}
                    </p>
                  </div>
                  <FaUsers size={36} />
                </div>

                <div className="bg-green-100 p-6 rounded-xl shadow flex justify-between">
                  <div>
                    <p>Selected</p>
                    <p className="text-3xl font-bold">
                      {visibleSelectedCount}
                    </p>
                  </div>
                  <FaCheckCircle size={36} />
                </div>
              </div>

              {/* ACTION BAR */}
              <div className="flex justify-between mb-4">
                <div>
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setSelectAll(checked);

                      setActiveUserData((prev) => {
                        const updated = { ...prev };
                        filteredUsers.forEach((user) => {
                          updated[user._id] = {
                            info: {
                              status: checked,
                              balance: user.balance,
                              userPhone: user.userPhone,
                              userName: user.userName,
                              amountPaid: user.amountPaid,
                              //dueDays: user.dueDays,
                            },
                          };
                        });
                        return updated;
                      });
                    }}
                  />{" "}
                  Select All
                </div>

                <button
                  onClick={sendWhatsapp}
                  className="relative bg-green-600 text-white px-4 py-2 rounded flex items-center"
                >
                  {visibleSelectedCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-xs px-2 rounded-full">
                      {visibleSelectedCount}
                    </span>
                  )}
                  <FaWhatsapp className="mr-2" />
                  WhatsApp
                </button>
              </div>

              {/* TABLE */}
              <DataTable
                data={filteredUsers}
                columns={columns}
                catcher="_id"
                exportedPdfName="Loan Due Report"
                exportedFileName="loan_due.csv"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDueLoanWhatsAppMessage;

