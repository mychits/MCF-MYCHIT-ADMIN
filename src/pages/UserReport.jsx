/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import CircularLoader from "../components/loaders/CircularLoader";
import { Select } from "antd";
import Navbar from "../components/layouts/Navbar";
import filterOption from "../helpers/filterOption";
const UserReport = () => {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [TableDaybook, setTableDaybook] = useState([]);
  const [TableAuctions, setTableAuctions] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [group, setGroup] = useState([]);
  const [commission, setCommission] = useState("");
  const [TableEnrolls, setTableEnrolls] = useState([]);
  const [TableEnrollsDate, setTableEnrollsDate] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [groupPaid, setGroupPaid] = useState("");
  const [groupToBePaid, setGroupToBePaid] = useState("");
  const [fromDate, setFromDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [toDate, setToDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [totalAmount, setTotalAmount] = useState(0);
  const [groupPaidDate, setGroupPaidDate] = useState("");
  const [groupToBePaidDate, setGroupToBePaidDate] = useState("");
  const [detailsLoading, setDetailLoading] = useState(false);
  const [basicLoading, setBasicLoading] = useState(false);
  const [dateLoading, setDateLoading] = useState(false);
  const [EnrollGroupId, setEnrollGroupId] = useState({
    groupId: "",
    ticket: "",
  });
  const [TotalToBepaid, setTotalToBePaid] = useState("");
  const [Totalpaid, setTotalPaid] = useState("");
  const [Totalprofit, setTotalProfit] = useState("");
  const [NetTotalprofit, setNetTotalProfit] = useState("");
  const [selectedAuctionGroupId, setSelectedAuctionGroupId] = useState("");
  const [filteredAuction, setFilteredAuction] = useState([]);
  const [groupInfo, setGroupInfo] = useState({});

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [selectedPaymentMode, setSelectedPaymentMode] = useState("");
  const [selectedCustomers, setSelectedCustomers] = useState("");
  const [payments, setPayments] = useState([]);
  const [availableTickets, setAvailableTickets] = useState([]);
  const [screenLoading, setScreenLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("groupDetails");
  const [searchText, setSearchText] = useState("");
  const [groupDetails, setGroupDetails] = useState(" ");
  const [loanCustomers, setLoanCustomers] = useState([]);
  const [borrowersData, setBorrowersData] = useState([]);
  const [borrowerId, setBorrowerId] = useState("No");
  const [filteredBorrowerData, setFilteredBorrowerData] = useState([]);
  const [filteredDisbursement, setFilteredDisbursement] = useState([]);
  const [disbursementLoading, setDisbursementLoading] = useState(false);
  const onGlobalSearchChangeHandler = (e) => {
    setSearchText(e.target.value);
  };
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const [formData, setFormData] = useState({
    group_id: "",
    user_id: "",
    ticket: "",
    receipt_no: "",
    pay_date: "",
    amount: "",
    pay_type: "cash",
    transaction_id: "",
  });

  const BasicLoanColumns = [
    { key: "id", header: "SL. NO" },
    { key: "pay_date", header: "Payment Date" },
    { key: "receipt_no", header: "Receipt No" },
    { key: "amount", header: "Amount" },
    { key: "pay_type", header: "Payment Type" },
    { key: "balance", header: "Balance" },
  ];
  const DisbursementColumns = [
    { key: "id", header: "SL. NO" },
    { key: "pay_date", header: "Disbursed Date" },
    { key: "transaction_date", header: "Transaction Date" },
    { key: "amount", header: "Amount" },
    { key: "receipt_no", header: "Receipt No" },
    { key: "pay_type", header: "Payment Type" },
    { key: "disbursement_type", header: "Disbursement Type" },
    { key: "disbursed_by", header: "Disbursed By" },
    { key: "balance", header: "Balance" },
  ];
  useEffect(() => {
    const fetchAllLoanPaymentsbyId = async () => {
      setBorrowersData([]);
      setBasicLoading(true);

      try {
        const response = await api.get(
          `/loan-payment/get-all-loan-payments/${EnrollGroupId.ticket}`
        );

        if (response.data && response.data.length > 0) {
          let balance = 0;
          const formattedData = response.data.map((loanPayment, index) => {
            balance += Number(loanPayment.amount);
            return {
              _id: loanPayment._id,
              id: index + 1,
              pay_date: formatPayDate(loanPayment?.pay_date),
              amount: loanPayment.amount,
              receipt_no: loanPayment.receipt_no,
              pay_type: loanPayment.pay_type,
              balance,
            };
          });
          formattedData.push({
            _id: "",
            id: "",
            pay_date: "",
            receipt_no: "",
            amount: "",
            pay_type: "",
            balance,
          });
          setBorrowersData(formattedData);
        } else {
          setBorrowersData([]);
        }
      } catch (error) {
        console.error("Error fetching loan payment data:", error);
        setBorrowersData([]);
      } finally {
        setBasicLoading(false);
      }
    };

    if (EnrollGroupId.groupId === "Loan") fetchAllLoanPaymentsbyId();
  }, [EnrollGroupId.ticket]);

  useEffect(() => {
    const fetchGroupById = async () => {
      try {
        const response = await api.get(
          `/group/get-by-id-group/${EnrollGroupId.groupId}`
        );
        if (response.status >= 400) throw new Error("API ERROR");
        setGroupDetails(response.data);
      } catch (err) {
        console.log("Failed to fetch group details by ID:", err.message);
      }
    };
    if (EnrollGroupId.groupId !== "Loan") fetchGroupById();
  }, [EnrollGroupId?.ticket]);

  useEffect(() => {
    setScreenLoading(true);

    const fetchGroups = async () => {
      setDetailLoading(true);
      try {
        const response = await api.get("/user/get-user");
        setGroups(response.data);
        setScreenLoading(false);
        setDetailLoading(false);
      } catch (error) {
        console.error("Error fetching group data:", error);
      } finally {
        setDetailLoading(false);
      }
    };
    fetchGroups();
  }, []);

  useEffect(() => {
    const fetchBorrower = async () => {
      try {
        setLoanCustomers([]);
        const response = await api.get(
          `/loans/get-borrower-by-user-id/${selectedGroup}`
        );
        if (response.data) {
          const filteredBorrowerData = response.data.map((loan, index) => ({
            sl_no: index + 1,
            loan: loan.loan_id,
            loan_amount: loan.loan_amount,
            tenure: loan.tenure,
            service_charge: loan.service_charges,
          }));
          setFilteredBorrowerData(filteredBorrowerData);
        }
        setLoanCustomers(response.data);

        if (response.status >= 400) throw new Error("Failed to send message");
      } catch (err) {
        console.log("failed to fetch loan customers", err.message);
        setFilteredBorrowerData([]);
      }
    };
    setBorrowersData([]);
    setBorrowerId("No");
    fetchBorrower();
  }, [selectedGroup]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await api.get(`/user/get-user-by-id/${selectedGroup}`);
        setGroup(response.data);
      } catch (error) {
        console.error("Error fetching group data:", error);
      }
    };
    fetchGroups();
  }, [selectedGroup]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await api.get("/user/get-user");
        setFilteredUsers(response.data);
      } catch (error) {
        console.error("Error fetching group data:", error);
      }
    };
    fetchGroups();
  }, []);
  // disbursement report

  useEffect(() => {
    const fetchDisbursement = async () => {
      try {
        setDisbursementLoading(true);
        const response = await api.get(
          `/payment-out/get-payment-out-report-daybook`,
          {
            params: {
              userId: selectedGroup,
            },
          }
        );

        if (response.data) {
          const formattedData = response.data.map((payment, index) => {
            let balance = 0;

            balance += Number(payment.amount);
            return {
              _id: payment._id,
              id: index + 1,
              disbursement_type: payment.disbursement_type,
              pay_date: formatPayDate(payment?.pay_date),
              transaction_date: formatPayDate(payment.createdAt),
              amount: payment.amount,
              receipt_no: payment.receipt_no,
              pay_type: payment.pay_type,
              disbursed_by: payment.admin_type?.name,
              balance,
            };
          });

          setFilteredDisbursement(formattedData);
        } else {
          setFilteredDisbursement([]);
        }
      } catch (error) {
        console.error("Error fetching disbursement data", error, error.message);
        setFilteredDisbursement([]);
      } finally {
        setDisbursementLoading(false);
      }
    };
    if (selectedGroup) fetchDisbursement();
  }, [selectedGroup]);
  const handleGroupPayment = async (groupId) => {
    setSelectedAuctionGroupId(groupId);
    setSelectedGroup(groupId);
    handleGroupAuctionChange(groupId);
  };

  const handleEnrollGroup = (event) => {
    const value = event.target.value;

    if (value) {
      const [groupId, ticket] = value.split("|");
      // for loan group id is "Loan" ticket is loan object Id
      setEnrollGroupId({ groupId, ticket });
    } else {
      setEnrollGroupId({ groupId: "", ticket: "" });
    }
  };

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await api.get(`/payment/get-report-daybook`, {
          params: {
            pay_date: selectedDate,
            groupId: selectedAuctionGroupId,
            userId: selectedCustomers,
            pay_type: selectedPaymentMode,
          },
        });

        if (response.data && response.data.length > 0) {
          setFilteredAuction(response);
          const paymentData = response.data;
          const totalAmount = paymentData.reduce(
            (sum, payment) => sum + Number(payment.amount || 0),
            0
          );
          setPayments(totalAmount);
          const formattedData = response.data.map((group, index) => ({
            id: index + 1,
            group: group.group_id.group_name,
            name: group.user_id?.full_name,
            phone_number: group.user_id.phone_number,
            ticket: group.ticket,
            amount: group.amount,
            mode: group.pay_type,
          }));
          setTableDaybook(formattedData);
        } else {
          setFilteredAuction([]);
        }
      } catch (error) {
        console.error("Error fetching payment data:", error);
        setFilteredAuction([]);
        setPayments(0);
      }
    };

    fetchPayments();
  }, [
    selectedAuctionGroupId,
    selectedDate,
    selectedPaymentMode,
    selectedCustomers,
  ]);
  const loanColumns = [
    { key: "sl_no", header: "SL. No" },
    { key: "loan", header: "Loan ID" },
    { key: "loan_amount", header: "Loan Amount" },
    { key: "service_charge", header: "Service Charge" },
    { key: "tenure", header: "Tenure" },
  ];
  const columns = [
    { key: "id", header: "SL. NO" },
    { key: "group", header: "Group Name" },
    { key: "name", header: "Customer Name" },
    { key: "phone_number", header: "Customer Phone Number" },
    { key: "ticket", header: "Ticket" },
    { key: "amount", header: "Amount" },
    { key: "mode", header: "Payment Mode" },
  ];

  const handleGroupAuctionChange = async (groupId) => {
    setFilteredAuction([]);
    if (groupId) {
      try {
        const response = await api.post(
          `/enroll/get-user-tickets-report/${groupId}`
        );

        if (response.data && response.data.length > 0) {
          setFilteredAuction(response.data);

          const formattedData = response.data
            .map((group, index) => {
              const groupName = group?.enrollment?.group?.group_name || "";
              const tickets = group?.enrollment?.tickets || "";
              const groupType = group?.enrollment?.group?.group_type;
              const groupInstall =
                parseInt(group?.enrollment?.group?.group_install) || 0;
              const auctionCount = parseInt(group?.auction?.auctionCount) || 0;
              const totalPaidAmount = group?.payments?.totalPaidAmount || 0;
              const totalProfit = group?.profit?.totalProfit || 0;
              const totalPayable = group?.payable?.totalPayable || 0;
              const firstDividentHead =
                group?.firstAuction?.firstDividentHead || 0;

              if (!group?.enrollment?.group) {
                return null;
              }

              return {
                id: index + 1,
                group: groupName,
                ticket: tickets,

                totalBePaid:
                  groupType === "double"
                    ? groupInstall * auctionCount + groupInstall
                    : totalPayable + groupInstall + totalProfit,

                profit: totalProfit,

                toBePaidAmount:
                  groupType === "double"
                    ? groupInstall * auctionCount + groupInstall
                    : totalPayable + groupInstall + firstDividentHead,

                paidAmount: totalPaidAmount,

                balance:
                  groupType === "double"
                    ? groupInstall * auctionCount +
                      groupInstall -
                      totalPaidAmount
                    : totalPayable +
                      groupInstall +
                      firstDividentHead -
                      totalPaidAmount,
              };
            })
            .filter((item) => item !== null);

          setTableAuctions(formattedData);
          setCommission(0);

          const totalToBePaidAmount = formattedData.reduce((sum, group) => {
            return sum + (group?.totalBePaid || 0);
          }, 0);
          setTotalToBePaid(totalToBePaidAmount);

          const totalNetToBePaidAmount = formattedData.reduce((sum, group) => {
            return sum + (group?.toBePaidAmount || 0);
          }, 0);
          setNetTotalProfit(totalNetToBePaidAmount);

          const totalPaidAmount = response.data.reduce(
            (sum, group) => sum + (group?.payments?.totalPaidAmount || 0),
            0
          );
          setTotalPaid(totalPaidAmount);

          const totalProfit = response.data.reduce(
            (sum, group) => sum + (group?.profit?.totalProfit || 0),
            0
          );
          setTotalProfit(totalProfit);
        } else {
          setFilteredAuction([]);
          setCommission(0);
        }
      } catch (error) {
        console.error("Error fetching enrollment data:", error);
        setFilteredAuction([]);
        setCommission(0);
      }
    } else {
      setFilteredAuction([]);
      setCommission(0);
    }
  };

  const Auctioncolumns = [
    { key: "id", header: "SL. NO" },
    { key: "group", header: "Group Name" },
    { key: "ticket", header: "Ticket" },
    { key: "totalBePaid", header: "Amount to be Paid" },
    { key: "profit", header: "Profit" },
    { key: "toBePaidAmount", header: "Net To be Paid" },
    { key: "paidAmount", header: "Amount Paid" },
    { key: "balance", header: "Balance" },
  ];

  const formatPayDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  useEffect(() => {
    const fetchEnroll = async () => {
      setTableEnrolls([]);
      setBasicLoading(true);

      try {
        setIsLoading(true);
        const response = await api.get(
          `/enroll/get-user-payment?group_id=${EnrollGroupId.groupId}&ticket=${EnrollGroupId.ticket}&user_id=${selectedGroup}`
        );

        if (response.data && response.data.length > 0) {
          setFilteredUsers(response.data);

          const Paid = response.data;
          setGroupPaid(Paid[0].groupPaidAmount);

          const toBePaid = response.data;
          setGroupToBePaid(toBePaid[0].totalToBePaidAmount);

          let balance = 0;
          const formattedData = response.data.map((group, index) => {
            balance += Number(group.amount);
            return {
              _id: group._id,
              id: index + 1,
              date: formatPayDate(group?.pay_date),
              amount: group.amount,
              receipt: group.receipt_no,
              old_receipt: group.old_receipt_no,
              type: group.pay_type,
              balance,
            };
          });
          formattedData.push({
            id: "",
            date: "",
            amount: "",
            receipt: "",
            old_receipt: "",
            type: "",
            balance,
          });

          setTableEnrolls(formattedData);
        } else {
          setFilteredUsers([]);
          setTableEnrolls([]);
        }
      } catch (error) {
        console.error("Error fetching enrollment data:", error);
        setFilteredUsers([]);
        setTableEnrolls([]);
      } finally {
        setBasicLoading(false);
        setIsLoading(false);
      }
    };
    if (EnrollGroupId.groupId !== "Loan") fetchEnroll();
  }, [selectedGroup, EnrollGroupId.groupId, EnrollGroupId.ticket]);

  const Basiccolumns = [
    { key: "id", header: "SL. NO" },
    { key: "date", header: "Date" },
    { key: "amount", header: "Amount" },
    { key: "receipt", header: "Receipt No" },
    { key: "old_receipt", header: "Old Receipt No" },
    { key: "type", header: "Payment Type" },
    { key: "balance", header: "Balance" },
  ];

  const formatDate = (dateString) => {
    const parts = dateString.split("-");
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateString;
  };
  const formattedFromDate = formatDate(fromDate);
  const formattedToDate = formatDate(toDate);

  useEffect(() => {
    const fetchEnroll = async () => {
      try {
        const response = await api.get(
          `/group-report/get-group-enroll-date/${selectedGroup}?fromDate=${formattedFromDate}&toDate=${formattedToDate}`
        );
        if (response.data && response.data.length > 0) {
          setFilteredUsers(response.data);

          const Paid = response.data;
          setGroupPaidDate(Paid[0].groupPaidAmount || 0);

          const toBePaid = response.data;
          setGroupToBePaidDate(toBePaid[0].totalToBePaidAmount);

          const totalAmount = response.data.reduce(
            (sum, group) => sum + parseInt(group.amount),
            0
          );
          setTotalAmount(totalAmount);
          const formattedData = response.data.map((group, index) => ({
            id: index + 1,
            name: group?.user?.full_name,
            phone_number: group?.user?.phone_number,
            ticket: group.ticket,
            amount_to_be_paid:
              parseInt(group.group.group_install) + group.totalToBePaidAmount,
            amount_paid: group.totalPaidAmount,
            amount_balance:
              parseInt(group.group.group_install) +
              group.totalToBePaidAmount -
              group.totalPaidAmount,
          }));
          setTableEnrollsDate(formattedData);
        } else {
          setFilteredUsers([]);
          setTotalAmount(0);
        }
      } catch (error) {
        console.error("Error fetching enrollment data:", error);
        setFilteredUsers([]);
        setTotalAmount(0);
      }
    };
    fetchEnroll();
  }, [selectedGroup, formattedFromDate, formattedToDate]);

  const Datecolumns = [
    { key: "id", header: "SL. NO" },
    { key: "name", header: "Customer Name" },
    { key: "phone_number", header: "Customer Phone Number" },
    { key: "ticket", header: "Ticket" },
    { key: "amount_to_be_paid", header: "Amount to be Paid" },
    { key: "amount_paid", header: "Amount Paid" },
    { key: "amount_balance", header: "Amount Balance" },
  ];

  useEffect(() => {
    if (groupInfo && formData.bid_amount) {
      const commission = (groupInfo.group_value * 5) / 100 || 0;
      const win_amount =
        (groupInfo.group_value || 0) - (formData.bid_amount || 0);
      const divident = (formData.bid_amount || 0) - commission;
      const divident_head = groupInfo.group_members
        ? divident / groupInfo.group_members
        : 0;
      const payable = (groupInfo.group_install || 0) - divident_head;
      setFormData((prevData) => ({
        ...prevData,
        group_id: groupInfo._id,
        commission,
        win_amount,
        divident,
        divident_head,
        payable,
      }));
    }
  }, [groupInfo, formData.bid_amount]);

  useEffect(() => {
    if (selectedGroup) {
      api
        .post(`/enroll/get-next-tickets/${selectedGroup}`)
        .then((response) => {
          setAvailableTickets(response.data.availableTickets || []);
        })
        .catch((error) => {
          console.error("Error fetching available tickets:", error);
        });
    } else {
      setAvailableTickets([]);
    }
  }, [selectedGroup]);
  if (screenLoading)
    return (
      <div className="w-screen m-24">
        <CircularLoader color="text-green-600" />
      </div>
    );

  return (
    <>
      <div className="w-screen min-h-screen">
        <div className="flex mt-30">
          <Navbar
            onGlobalSearchChangeHandler={onGlobalSearchChangeHandler}
            visibility={true}
          />
          <div className="flex-grow p-7">
            <h1 className="text-2xl font-bold text-center">
              Reports - Customer
            </h1>
            <div className="mt-6 mb-8">
              <div className="mb-2">
                <div className="flex justify-center items-center w-full gap-4 bg-blue-50    p-2 w-30 h-40  rounded-3xl  border   space-x-2  ">
                  <div className="mb-2">
                    <label
                      className="block text-lg text-gray-500 text-center  font-semibold mb-2"
                      htmlFor={"SS"}
                    >
                      Customer
                    </label>
                    <Select
                      id="SS"
                      value={selectedAuctionGroupId || undefined}
                      onChange={handleGroupPayment}
                      showSearch
                      popupMatchSelectWidth={false}
                      placeholder="Search or Select Customer"
                      filterOption={(input, option) =>
                        option.children
                          .toString()
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      style={{ height: "50px", width: "600px" }}
                    >
                      {groups.map((group) => (
                        <option key={group._id} value={group._id}>
                          {group.full_name} - {group.phone_number}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>
              {selectedGroup && (
                <>
                  <div className="mt-6 mb-8">
                    <div className="flex justify-start border-b border-gray-300 mb-4">
                      <button
                        className={`px-6 py-2 font-medium ${
                          activeTab === "groupDetails"
                            ? "border-b-2 border-blue-500 text-blue-500"
                            : "text-gray-500"
                        }`}
                        onClick={() => handleTabChange("groupDetails")}
                      >
                        Customer Details
                      </button>
                      <button
                        className={`px-6 py-2 font-medium ${
                          activeTab === "basicReport"
                            ? "border-b-2 border-blue-500 text-blue-500"
                            : "text-gray-500"
                        }`}
                        onClick={() => handleTabChange("basicReport")}
                      >
                        Customer Ledger
                      </button>

                      <button
                        className={`px-6 py-2 font-medium ${
                          activeTab === "disbursement"
                            ? "border-b-2 border-blue-500 text-blue-500"
                            : "text-gray-500"
                        }`}
                        onClick={() => handleTabChange("disbursement")}
                      >
                        PayOut | Disbursement
                      </button>
                    </div>

                    {activeTab === "groupDetails" && (
                      <>
                        {detailsLoading ? (
                          <p>loading...</p>
                        ) : (
                          <div className="mt-10">
                            <div className="flex gap-4">
                              <div className="flex flex-col flex-1">
                                <label className="mb-1 text-sm font-medium text-gray-700">
                                  Name
                                </label>
                                <input
                                  type="text"
                                  placeholder="Enter Name"
                                  value={group.full_name}
                                  readOnly
                                  className="border border-gray-300 rounded px-4 py-2 shadow-sm outline-none w-full"
                                />
                              </div>
                              <div className="flex flex-col flex-1">
                                <label className="mb-1 text-sm font-medium text-gray-700">
                                  Email
                                </label>
                                <input
                                  type="text"
                                  placeholder="Enter Email"
                                  value={group.email}
                                  readOnly
                                  className="border border-gray-300 rounded px-4 py-2 shadow-sm outline-none w-full"
                                />
                              </div>
                              <div className="flex flex-col flex-1">
                                <label className="mb-1 text-sm font-medium text-gray-700">
                                  Phone Number
                                </label>
                                <input
                                  type="text"
                                  placeholder="Enter Phone Number"
                                  value={group.phone_number}
                                  readOnly
                                  className="border border-gray-300 rounded px-4 py-2 shadow-sm outline-none w-full"
                                />
                              </div>
                            </div>
                            <div className="flex gap-4 mt-5">
                              <div className="flex flex-col flex-1">
                                <label className="mb-1 text-sm font-medium text-gray-700">
                                  Adhaar Number
                                </label>
                                <input
                                  type="text"
                                  placeholder="Enter Adhaar Number"
                                  value={group.adhaar_no}
                                  readOnly
                                  className="border border-gray-300 rounded px-4 py-2 shadow-sm outline-none w-full"
                                />
                              </div>
                              <div className="flex flex-col flex-1">
                                <label className="mb-1 text-sm font-medium text-gray-700">
                                  Pan Number
                                </label>
                                <input
                                  type="text"
                                  placeholder="Enter Pan Number"
                                  value={group.pan_no}
                                  readOnly
                                  className="border border-gray-300 rounded px-4 py-2 shadow-sm outline-none w-full"
                                />
                              </div>
                              <div className="flex flex-col flex-1">
                                <label className="mb-1 text-sm font-medium text-gray-700">
                                  Pincode
                                </label>
                                <input
                                  type="text"
                                  placeholder="Enter Pincode"
                                  value={group.pincode}
                                  readOnly
                                  className="border border-gray-300 rounded px-4 py-2 shadow-sm outline-none w-full"
                                />
                              </div>
                            </div>
                            <div className="flex gap-4 mt-5">
                              <div className="flex flex-col flex-1">
                                <label className="mb-1 text-sm font-medium text-gray-700">
                                  Address
                                </label>
                                <input
                                  type="text"
                                  placeholder="Address"
                                  value={group.address}
                                  readOnly
                                  className="border border-gray-300 rounded px-4 py-2 shadow-sm outline-none w-full"
                                />
                              </div>
                            </div>
                            <div className="mt-10">
                              <h3 className="text-lg font-medium mb-4">
                                Enrolled Groups
                              </h3>
                              {filteredAuction &&
                              filteredAuction.length > 0 &&
                              !isLoading ? (
                                <div className="mt-5">
                                  <DataTable
                                    data={filterOption(
                                      TableAuctions,
                                      searchText
                                    )}
                                    columns={Auctioncolumns}
                                    exportedFileName={`CustomerReport-${
                                      TableAuctions.length > 0
                                        ? TableAuctions[0].date +
                                          " to " +
                                          TableAuctions[
                                            TableAuctions.length - 1
                                          ].date
                                        : "empty"
                                    }.csv`}
                                  />
                                  {/* yes you can */}
                                  {filteredBorrowerData.length > 0 && (
                                    <div className="mt-10">
                                      <h3 className="text-lg font-medium mb-4">
                                        Loan Details
                                      </h3>
                                      <DataTable
                                        data={filteredBorrowerData}
                                        columns={loanColumns}
                                        exportedFileName={`CustomerReport.csv`}
                                      />
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <CircularLoader isLoading={isLoading} />
                              )}
                            </div>
                            <div className="flex gap-4 mt-5">
                              <div className="flex flex-col flex-1">
                                <label className="mb-1 text-sm font-medium text-gray-700">
                                  Total Amount to be Paid
                                </label>
                                <input
                                  type="text"
                                  placeholder="-"
                                  value={TotalToBepaid}
                                  readOnly
                                  className="border border-gray-300 rounded px-4 py-2 shadow-sm outline-none w-full"
                                />
                              </div>
                              <div className="flex flex-col flex-1">
                                <label className="mb-1 text-sm font-medium text-gray-700">
                                  Total Profit
                                </label>
                                <input
                                  type="text"
                                  placeholder="-"
                                  value={Totalprofit}
                                  readOnly
                                  className="border border-gray-300 rounded px-4 py-2 shadow-sm outline-none w-full"
                                />
                              </div>
                              <div className="flex flex-col flex-1">
                                <label className="mb-1 text-sm font-medium text-gray-700">
                                  Total Net To be Paid
                                </label>
                                <input
                                  type="text"
                                  placeholder="-"
                                  value={NetTotalprofit}
                                  readOnly
                                  className="border border-gray-300 rounded px-4 py-2 shadow-sm outline-none w-full"
                                />
                              </div>
                              <div className="flex flex-col flex-1">
                                <label className="mb-1 text-sm font-medium text-gray-700">
                                  Total Amount Paid
                                </label>
                                <input
                                  type="text"
                                  placeholder="-"
                                  value={Totalpaid}
                                  readOnly
                                  className="border border-gray-300 rounded px-4 py-2 shadow-sm outline-none w-full"
                                />
                              </div>
                              <div className="flex flex-col flex-1">
                                <label className="mb-1 text-sm font-medium text-gray-700">
                                  Total Balance
                                </label>
                                <input
                                  type="text"
                                  placeholder="-"
                                  value={NetTotalprofit - Totalpaid}
                                  readOnly
                                  className="border border-gray-300 rounded px-4 py-2 shadow-sm outline-none w-full"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {activeTab === "basicReport" && (
                      <>
                        <div>
                          <div className="flex gap-4">
                            <div className="flex flex-col flex-1">
                              <label className="mb-1 text-sm font-medium text-gray-700">
                                Groups and Tickets
                              </label>
                              <select
                                value={
                                  EnrollGroupId.groupId
                                    ? `${EnrollGroupId.groupId}|${EnrollGroupId.ticket}`
                                    : ""
                                }
                                onChange={handleEnrollGroup}
                                className="border border-gray-300 rounded px-6 py-2 shadow-sm outline-none w-full max-w-md"
                              >
                                <option value="">Select Group | Ticket</option>
                                {filteredAuction.map((group) => {
                                  if (group?.enrollment?.group) {
                                    return (
                                      <option
                                        key={group.enrollment.group._id}
                                        value={`${group.enrollment.group._id}|${group.enrollment.tickets}`}
                                      >
                                        {group.enrollment.group.group_name} |{" "}
                                        {group.enrollment.tickets}
                                      </option>
                                    );
                                  }
                                  return null;
                                })}
                                {loanCustomers.map((loan) => (
                                  <option
                                    key={loan._id}
                                    value={`Loan|${loan._id}`}
                                  >
                                    {`${loan.loan_id} | ₹${loan.loan_amount}`}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {(TableEnrolls && TableEnrolls.length > 0) ||
                          (borrowersData.length > 0 && !basicLoading) ? (
                            <div className="mt-10">
                              <DataTable
                                printHeaderKeys={[
                                  "Customer Name",
                                  "Customer Id",
                                  "Phone Number",
                                  "Ticket Number",
                                  "Group Name",
                                  "Start Date",
                                  "End Date",
                                ]}
                                printHeaderValues={[
                                  group.full_name,
                                  group.customer_id,
                                  group.phone_number,
                                  EnrollGroupId.ticket,
                                  groupDetails.group_name,
                                  new Date(
                                    groupDetails.start_date
                                  ).toLocaleDateString("en-GB"),
                                  new Date(
                                    groupDetails.end_date
                                  ).toLocaleDateString("en-GB"),
                                ]}
                                data={
                                  EnrollGroupId.groupId === "Loan"
                                    ? borrowersData
                                    : TableEnrolls
                                }
                                columns={
                                  EnrollGroupId.groupId === "Loan"
                                    ? BasicLoanColumns
                                    : Basiccolumns
                                }
                              />
                            </div>
                          ) : (
                            <CircularLoader isLoading={basicLoading} />
                          )}
                        </div>
                      </>
                    )}
                    {activeTab === "disbursement" && (
                      <div className="flex flex-col flex-1">
                        <label className="mb-1 text-sm  text-gray-700 font-bold">
                          Disbursement
                        </label>

                        {disbursementLoading ? (
                          <CircularLoader />
                        ) : filteredDisbursement?.length > 0 ? (
                          <div className="mt-10">
                            <DataTable
                              data={filteredDisbursement}
                              columns={DisbursementColumns}
                            />
                          </div>
                        ) : (
                          <div className="p-40  w-full flex justify-center items-center ">
                            No Disbursement Data Found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserReport;
