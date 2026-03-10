import { useState, useEffect, useMemo } from "react";
import { Form, Input, DatePicker, TimePicker, Button, Select, notification, Popconfirm, Spin, Modal, Radio } from "antd";
import { EditOutlined, DeleteOutlined, CheckCircleOutlined, PrinterOutlined, DownOutlined, UpOutlined, AppstoreOutlined, UnorderedListOutlined, StopOutlined, CloseOutlined, ClockCircleOutlined } from '@ant-design/icons';
import Sidebar from "../components/layouts/Sidebar";
import Navbar from "../components/layouts/Navbar";
import ModalComponent from "../components/modals/Modal";
import DataTable from "../components/layouts/Datatable";
import CircularLoader from "../components/loaders/CircularLoader";
import dayjs from "dayjs";
import API from "../instance/TokenInstance";
import image from "../assets/images/logoWB.png"

const { Option } = Select;

function BidRequest() {
    const [api, contextHolder] = notification.useNotification();

    // Modal States
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm] = Form.useForm();
    const [openActionId, setOpenActionId] = useState(null);
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editGroups, setEditGroups] = useState([]);
    const [selectedEditGroupIndex, setSelectedEditGroupIndex] = useState(0);
    const [isGroupStatsOpen, setIsGroupStatsOpen] = useState(true);

    // View Mode State for Group Stats
    const [groupViewMode, setGroupViewMode] = useState('grid'); // 'grid' or 'list'
    
    // New State for Toggle View (All / Upcoming)
    const [viewType, setViewType] = useState('upcoming'); 

    // Store RAW data
    const [rawBidRequests, setRawBidRequests] = useState([]);
    const [loadingTable, setLoadingTable] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [customerBalance, setCustomerBalance] = useState(null);
    const [loadingBalance, setLoadingBalance] = useState(false);
    const [showBalance, setShowBalance] = useState(false);

    // Filter States
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [selectedGroupFilter, setSelectedGroupFilter] = useState("all");
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);

    const handleOpenCreatePage = () => {
        window.open('/bid-request/create', '_blank', 'noopener,noreferrer');
    };

    useEffect(() => {
        const handleFocus = () => {
            fetchBidRequests();
        };
        window.addEventListener('focus', handleFocus);
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [viewType]); // Added viewType dependency

    const fetchCustomerBalance = async (enrollmentId) => {
        if (!enrollmentId) return;
        setLoadingBalance(true);
        try {
            const response = await API.get(`/bid-request/get-balance/${enrollmentId}`);
            if (response.data?.data?.length > 0) {
                setCustomerBalance(response.data.data[0].balance);
            } else {
                setCustomerBalance(0);
            }
        } catch (error) {
            setCustomerBalance(0);
        } finally {
            setLoadingBalance(false);
        }
    };

    const fetchUsers = async () => {
        try {
            setLoadingUsers(true);
            const response = await API.get("/user/get-user");
            setUsers(response.data || []);
            setLoadingUsers(false);
        } catch (error) {
            setLoadingUsers(false);
        }
    };

    const fetchAuctionCount = async (groupId) => {
        if (!groupId) return 0;
        try {
            const response = await API.get(`/auction/get-group-auction/${groupId}`);
            return response.data ? response.data.length : 0;
        } catch (error) {
            return 0;
        }
    };

    const fetchEditCustomerDetails = async (userId, selectedEnrollmentId = null) => {
        try {
            const response = await API.post(`/enroll/get-user-tickets-report/${userId}`);
            if (response.data && response.data.length > 0) {
                const groupsDataPromise = response.data.map(async (item) => {
                    const enrollment = item?.enrollment;
                    const groupData = enrollment?.group;
                    const groupId = groupData?._id;
                    const auctionsDone = await fetchAuctionCount(groupId);

                    const referredBy =
                        (groupData?.agent?.name && groupData?.agent?.phone_number)
                            ? `${groupData.agent.name} | ${groupData.agent.phone_number}`
                            : (groupData?.referred_customer?.full_name && groupData?.referred_customer?.phone_number)
                                ? `${groupData.referred_customer.full_name} | ${groupData.referred_customer.phone_number}`
                                : (groupData?.referred_lead?.lead_name && groupData?.referred_lead?.agent_number)
                                    ? `${groupData.referred_lead.lead_name} | ${groupData.referred_lead.agent_number}`
                                    : "N/A";

                    return {
                        id: groupId,
                        bid_request_code: groupData?.bid_request_code,
                        groupName: groupData?.group_name || "No Group Name",
                        ticketNumber: enrollment?.tickets || enrollment?.ticket_number || "N/A",
                        startDate: groupData?.start_date ? groupData.start_date.split("T")[0] : "N/A",
                        endDate: groupData?.end_date ? groupData.end_date.split("T")[0] : "N/A",
                        auctionsDone: auctionsDone,
                        fullEnrollment: enrollment,
                        enrollmentId: enrollment?._id,
                        referredBy: referredBy
                    };
                });

                const groupsData = await Promise.all(groupsDataPromise);
                setEditGroups(groupsData);

                if (groupsData.length > 0) {
                    let defaultIndex = 0;
                    if (selectedEnrollmentId) {
                        const foundIndex = groupsData.findIndex(g => g.enrollmentId === selectedEnrollmentId);
                        if (foundIndex !== -1) {
                            defaultIndex = foundIndex;
                        }
                    }
                    setSelectedEditGroupIndex(defaultIndex);
                    const selectedGroup = groupsData[defaultIndex];
                    editForm.setFieldsValue({
                        groupName: selectedGroup.groupName,
                        ticketNumber: selectedGroup.ticketNumber,
                        selectedGroupIndex: defaultIndex,
                        startDate: selectedGroup.startDate,
                        endDate: selectedGroup.endDate,
                        auctionsDone: selectedGroup.auctionsDone,
                        referredBy: selectedGroup.referredBy
                    });
                }
            } else {
                setEditGroups([]);
                editForm.setFieldsValue({
                    groupName: "No Groups Found",
                    ticketNumber: "N/A",
                    selectedGroupIndex: undefined,
                    referredBy: "N/A"
                });
            }
        } catch (error) {
            console.error("Error fetching customer details:", error);
            api.error({ message: "Error", description: "Failed to fetch customer group details." });
        }
    };

    const handleEditGroupSelect = async (index) => {
        setSelectedEditGroupIndex(index);
        const selectedGroup = editGroups[index];
        if (selectedGroup) {
            editForm.setFieldsValue({
                groupName: selectedGroup.groupName,
                ticketNumber: selectedGroup.ticketNumber,
                selectedGroupIndex: index,
                startDate: selectedGroup.startDate,
                endDate: selectedGroup.endDate,
                auctionsDone: selectedGroup.auctionsDone,
                referredBy: selectedGroup.referredBy
            });
            await fetchCustomerBalance(selectedGroup.enrollmentId);
        }
    };

    const handleOpenEditModal = async (item) => {
  setOpenActionId(null);
  setEditingId(item._id);
  setShowBalance(true);
  setIsEditModalOpen(true);
  
  const userObj = typeof item.subscriberId === 'object' ? item.subscriberId : {};
  const userId = userObj._id || item.subscriberId;
        const nameToDisplay = userObj.full_name || userObj.name || item.subscriberName || item.userName || "";
        const phoneToDisplay = userObj.phone_number || userObj.mobile || item.mobileNumber || item.mobileNumberRaw || "";
        const customerIdToDisplay = (typeof userObj === 'object') ? (userObj.customer_id || "N/A") : "N/A";

        const referredByFromTable =
            (item?.agent?.name && item?.agent?.phone_number)
                ? `${item.agent.name} | ${item.agent.phone_number}`
                : (item?.referred_customer?.full_name && item?.referred_customer?.phone_number)
                    ? `${item.referred_customer.full_name} | ${item.referred_customer.phone_number}`
                    : (item?.referred_lead?.lead_name && item?.referred_lead?.agent_number)
                        ? `${item.referred_lead.lead_name} | ${item.referred_lead.agent_number}`
                        : item.referredBy || "N/A";

        editForm.setFieldsValue({
    subscriberId: userId,
    subscriberName: nameToDisplay,
    mobileNumber: phoneToDisplay,
    customerId: customerIdToDisplay,
    auctionDate: item.auctionDate ? dayjs(item.auctionDate) : null,
    auctionTime: item.auction_time ? dayjs(item.auction_time, "HH:mm") : null,
    referredBy: referredByFromTable,
    requestDate: item.createdAt ? dayjs(item.createdAt) : dayjs(),
    groupName: item.groupName,
    ticketNumber: item.ticketNumber,
    enrollmentId: item.enrollmentId,
    // Ensure groupId is set correctly:
    groupId: item.groupId?._id || item.groupId || item.groupId?.id
  });

        setCustomerBalance(item.auctions?.balance || 0);
  
  if (users.length === 0) await fetchUsers();
  

  await fetchEditCustomerDetails(userId, item.enrollmentId);
  
  if (item.enrollmentId) {
    await fetchCustomerBalance(item.enrollmentId);
  }
};

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        editForm.resetFields();
        setEditGroups([]);
        setCustomerBalance(null);
        setShowBalance(false);
        setEditingId(null);
    };


   const updateStatus = async (newStatus) => {
  try {
    setLoading(true);

    const values = await editForm.validateFields();
    const groupIndex = values.selectedGroupIndex ?? selectedEditGroupIndex;
    const selectedGroup = editGroups[groupIndex];


    if (!selectedGroup) {
      api.error({ 
        message: "Error", 
        description: "Group details not found. Please select a valid group." 
      });
      setLoading(false);
      return;
    }

   
    const auctionDate = values.auctionDate?.format('YYYY-MM-DD');
    const auctionTime = values.auctionTime?.format('HH:mm');
    const requestDate = values.requestDate?.format('YYYY-MM-DD');

    
    const payload = {
      subscriberId: values.subscriberId,
      subscriberName: values.subscriberName,
      mobileNumber: values.mobileNumber,
      customerId: values.customerId,
      groupName: selectedGroup.groupName,
      ticketNumber: selectedGroup.ticketNumber,
      auctionDate: auctionDate,          
      auction_time: auctionTime,      
      auctionTime: auctionTime,          
      referredBy: values.referredBy,     
      referred_by: values.referredBy,    
      groupId: selectedGroup.id,        
      enrollmentId: selectedGroup.enrollmentId,
      status: newStatus,
      requestDate: requestDate,         
      updatedBy: users.find(u => u._id === values.subscriberId)?._id 
    };


    console.log('📤 Sending payload:', payload); // Debug log

    // 6. API Call
    const response = await API.put(`/bid-request/update/${editingId}`, payload);
    
    // 7. Success handling
    const statusMessages = {
      'Pending': 'Bid Request moved to Pending successfully',
      'Accept': 'Bid Request accepted successfully',
      'Decline': 'Bid Request declined successfully',
      'Rejected': 'Bid Request rejected for non-payment successfully'
    };
    
    api.success({
      message: "Status Updated",
      description: statusMessages[newStatus] || `Status updated to ${newStatus}`
    });
    
    handleCloseEditModal();
    fetchBidRequests();
    
  } catch (error) {
    console.error('❌ Update Error:', error);
    
    // Extract meaningful error message
    let errorMessage = "Failed to update status.";
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data?.errors) {
      // Handle validation errors array
      errorMessage = Object.values(error.response.data.errors)
        .flat()
        .join(', ');
    } else if (error.errorFields) {
      // Antd form validation errors
      errorMessage = error.errorFields
        .map(f => `${f.name.join('.')}: ${f.errors.join(', ')}`)
        .join('; ');
    }
    
    api.error({ 
      message: "Update Failed", 
      description: errorMessage 
    });
    
  } finally {
    setLoading(false);
  }
};

    const handleSetPending = async () => {
        await updateStatus('Pending');
    };

    const handleSetAccept = async () => {
        await updateStatus('Accept');
    };

    const handleSetDecline = async () => {
        await updateStatus('Decline');
    };

    const handleSetRejected = async () => {
        await updateStatus('Rejected');
    };

    const handleDelete = async (id) => {
        setOpenActionId(null);
        try {
            await API.delete(`/bid-request/delete/${id}`);
            api.success({ message: "Deleted", description: "Deleted successfully." });
            fetchBidRequests();
        } catch (error) {
            api.error({ message: "Error", description: "Failed to delete." });
        }
    };

    const confirmDelete = (id) => {
        Modal.confirm({
            title: 'Are you sure delete this bid request?',
            content: 'This action cannot be undone.',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk() {
                handleDelete(id);
            },
        });
    };

    const handlePrint = (item) => {
        setOpenActionId(null);
        const userObj = typeof item.subscriberId === 'object' ? item.subscriberId : {};
        const userName = item.subscriberName || userObj.full_name || "test_Yogesh B S";
        const userPhone = item.mobileNumber || userObj.phone_number || "9964217276";
        const groupName = item.groupName || (item.groupId?.group_name) || "test_MCF-1L-CG-50M";
        const balance = item.auctions?.balance || -3000;
        const ticketNumber = item.ticketNumber || "29";
        const customerId = (typeof userObj === 'object') ? (userObj.customer_id || userObj._id || "N/A") : "N/A";

        const requestDate = item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-') : '24-02-2026';
        const auctionDate = item.auctionDate ? new Date(item.auctionDate).toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-') : '28-02-2026';

        const printWindow = window.open('', '_blank');

        const generateForm = () => `
      <div class="flex flex-col h-full p-3 font-serif text-[11px] text-black">
        <div class="flex justify-between items-center border-b-2 border-black pb-2 mb-3">
          <div class="flex items-center gap-2">
            <img src="${image}" alt="Logo" class="h-12 w-auto" />
            <div class="">
              <h1 class="text-sm font-bold text-blue-900 uppercase leading-tight ml-6">VIJAYA VINAYAK CHIT FUNDS (P) LTD</h1>
              <h1 class="text-xl font-extrabold text-yellow-600 uppercase text-center ml-3">Bid Requesting Letter</h1>
            </div>
          </div>
        </div>
        <div class="flex-grow space-y-3">
          <div class="grid grid-cols-4 gap-3">
            <div class="flex items-center">
              <span class="w-10 font-semibold">Date:</span>
              <div class="border-b border-black flex-grow h-4 pl-1 text-black">${requestDate}</div>
            </div>
            <div class="col-span-3 flex items-center ml-40">
              <span class="w-10 font-semibold">Place:</span>
              <div class="border-b border-black flex-grow h-4 pl-1 text-black">Bangalore</div>
            </div>
          </div>
          <div class="flex items-center py-1 px-1 rounded">
            <span class="w-32 font-bold text-black">Subscriber Name:</span>
            <div class="border-b border-black flex-grow h-4 pl-1 text-black">${userName}</div>
          </div>
          <div class="flex items-center py-1 px-1 rounded">
            <span class="w-32 font-bold text-black">Subscriber ID:</span>
            <div class="border-b border-black flex-grow h-4 pl-1 text-black">${customerId}</div>
          </div>
          <div class="flex items-center">
            <span class="w-32 font-semibold">Mobile Number:</span>
            <div class="border-b border-black flex-grow h-4 pl-1 text-black">${userPhone}</div>
          </div>
          <div class="flex items-center">
            <span class="w-32 font-semibold">Group Name:</span>
            <div class="border-b border-black flex-grow h-4 pl-1 text-black">${groupName}</div>
          </div>
          <div class="flex items-center">
            <span class="w-32 font-semibold">Ticket No:</span>
            <div class="border-b border-black flex-grow h-4 pl-1 text-black">${ticketNumber}</div>
          </div>
          <div class="flex items-center text-[10px] text-black">
            <span class="w-32 font-semibold">Current Status:</span>
            <span class="ml-2">
              <span class="font-bold ${balance <= 0 ? 'text-green-700' : 'text-red-600'}">
                ${balance <= 0 ? 'Excess: ' : 'Due: '}₹ ${Math.abs(balance)}
              </span>
            </span>
          </div>
          <div class="border border-gray-400 rounded p-2 bg-gray-50">
            <div class="font-bold text-xs mb-1 uppercase text-yellow-600 border-b border-gray-300 pb-0.5">Chit Requesting Details</div>
            <div class="grid grid-cols-3 gap-2">
              <div>
                <span class="font-semibold block text-[10px]">Installment</span>
                <div class="border-b border-black h-4 pl-1 text-black"></div>
              </div>
              <div>
                <span class="font-semibold block text-[10px]">Month</span>
                <div class="border-b border-black h-4 pl-1 text-black">${new Date(auctionDate).toLocaleString('default', { month: 'long' })}</div>
              </div>
              <div>
                <span class="font-semibold block text-[10px]">Date</span>
                <div class="border-b border-black h-4 pl-1 text-black">${auctionDate}</div>
              </div>
            </div>
          </div>
          <div class="mt-4 pt-2 border-t border-gray-300">
            <div class="flex justify-between items-end">
              <div>
                <div class="h-8 border-b border-black w-48 mb-1"></div>
                <span class="font-bold text-xs">Employee Signature</span>
              </div>
              <div class="text-[9px] italic">
                <div class="h-8 border-b border-black w-48 mb-1"></div>
                <span class="font-bold text-xs">Customer Signature</span>
              </div>
            </div>
          </div>
        </div>
        <div class="mt-2 pt-2 border-t-2 border-dashed border-gray-400 bg-gray-100 p-2 rounded text-[10px]">
          <div class="flex justify-between items-center mb-1">
            <span class="font-bold uppercase text-black">For Office Use Only</span>
            <span class="text-black">ID: ${customerId}</span>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div class="border border-gray-300 bg-white p-1 rounded">
              <span class="block text-[9px] text-black">Check:</span>
              <div class="h-3"></div>
            </div>
            <div class="border border-gray-300 bg-white p-1 rounded">
              <span class="block text-[9px] text-black">Auth:</span>
              <div class="h-3"></div>
            </div>
          </div>
        </div>
      </div>
    `;

        printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bid Request Form</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @media print {
            @page { size: A4 landscape; margin: 0.5cm; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; padding: 0; }
          }
          body { background: #e5e7eb; font-family: 'Times New Roman', serif; }
          .landscape-page {
            width: 29.7cm;
            height: 20cm;
            background: white;
            display: flex;
            margin: 0 auto;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .split-page {
            flex: 1;
            border-right: 2px dashed #ccc;
            padding: 0.5cm;
            box-sizing: border-box;
          }
          .split-page:last-child { border-right: none; }
        </style>
      </head>
      <body>
        <div class="landscape-page">
          <div class="split-page">
            ${generateForm()}
          </div>
          <div class="split-page">
            ${generateForm()}
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 1000);
          };
        </script>
      </body>
      </html>
    `);

        printWindow.document.close();
        printWindow.focus();
    };

    // Updated fetchBidRequests to use viewType
    const fetchBidRequests = async () => {
        try {
            setLoadingTable(true);
            const response = await API.get(`/bid-request/get-all?type=${viewType}`);
            setRawBidRequests(response.data?.data || []);
        } catch (error) {
            setRawBidRequests([]);
        } finally {
            setLoadingTable(false);
        }
    };

    const handleLoadBalance = async () => {
        setShowBalance(true);
        const selectedGroup = editGroups[selectedEditGroupIndex];
        if (selectedGroup?.enrollmentId) {
            await fetchCustomerBalance(selectedGroup.enrollmentId);
        }
    };

    const uniqueGroups = useMemo(() => {
        const groups = rawBidRequests.map(item => {
            const groupObject = item?.groupId || {};
            return item.groupName || (typeof groupObject === 'object' ? groupObject.group_name : "N/A");
        }).filter((value, index, self) => value && self.indexOf(value) === index);
        return groups;
    }, [rawBidRequests]);

    const filteredBidRequests = useMemo(() => {
        return rawBidRequests.filter(item => {
            if (selectedStatus !== "all" && item.status !== selectedStatus) {
                return false;
            }
            if (selectedGroupFilter !== "all") {
                const groupObject = item?.groupId || {};
                const groupName = item.groupName || (typeof groupObject === 'object' ? groupObject.group_name : "N/A");
                if (groupName !== selectedGroupFilter) {
                    return false;
                }
            }
            if (fromDate || toDate) {
                const itemDate = item.createdAt ? dayjs(item.createdAt) : null;
                if (!itemDate) return false;
                if (fromDate && itemDate.isBefore(dayjs(fromDate), 'day')) {
                    return false;
                }
                if (toDate && itemDate.isAfter(dayjs(toDate), 'day')) {
                    return false;
                }
            }
            return true;
        });
    }, [rawBidRequests, selectedStatus, selectedGroupFilter, fromDate, toDate]);

    const summaryStats = useMemo(() => {
        const totalRequests = rawBidRequests.length;
        const pendingRequests = rawBidRequests.filter(item => item.status === "Pending").length;
        const acceptRequests = rawBidRequests.filter(item => item.status === "Accept").length;
        const declineRequests = rawBidRequests.filter(item => item.status === "Decline").length;
        const rejectedRequests = rawBidRequests.filter(item => item.status === "Rejected").length;
        const totalBalance = rawBidRequests.reduce((sum, item) => sum + (item.auctions?.balance || 0), 0);

        const groupStats = {};
        rawBidRequests.forEach(item => {
            const groupObject = item?.groupId || {};
            const groupName = item.groupName || (typeof groupObject === 'object' ? groupObject.group_name : "Unknown");
            if (!groupStats[groupName]) {
                groupStats[groupName] = {
                    total: 0,
                    pending: 0,
                    accept: 0,
                    decline: 0,
                    rejected: 0
                };
            }
            groupStats[groupName].total++;
            if (item.status === "Pending") groupStats[groupName].pending++;
            if (item.status === "Accept") groupStats[groupName].accept++;
            if (item.status === "Decline") groupStats[groupName].decline++;
            if (item.status === "Rejected") groupStats[groupName].rejected++;
        });

        return {
            totalRequests,
            pendingRequests,
            acceptRequests,
            declineRequests,
            rejectedRequests,
            totalBalance,
            groupStats
        };
    }, [rawBidRequests]);

    const formattedBidData = useMemo(() => {
        return filteredBidRequests.map((item, index) => {
            const userObject = item?.subscriberId || {};
            const groupObject = item?.groupId || {};
            const userName = item.subscriberName || (typeof userObject === 'object' ? userObject.full_name : "N/A");
            const userPhone = item.mobileNumber || (typeof userObject === 'object' ? userObject.phone_number : "N/A");
            const userId = (typeof userObject === 'object') ? userObject._id : userObject;
            const customerId = (typeof userObject === 'object') ? (userObject.customer_id || "N/A") : "N/A";
            const groupName = item.groupName || (typeof groupObject === 'object' ? groupObject.group_name : "N/A");
            const auctions = item?.auctions || {};
            const balance = auctions?.balance || 0;

            const referredBy =
                (item?.agent?.name && item?.agent?.phone_number)
                    ? `${item.agent.name} | ${item.agent.phone_number}`
                    : (item?.referred_customer?.full_name && item?.referred_customer?.phone_number)
                        ? `${item.referred_customer.full_name} | ${item.referred_customer.phone_number}`
                        : (item?.referred_lead?.lead_name && item?.referred_lead?.agent_number)
                            ? `${item.referred_lead.lead_name} | ${item.referred_lead.agent_number}`
                            : "N/A";

            return {
                ...item,
                id: index + 1,
                userName,
                groupName,
                customerId,
                mobileNumber: userPhone,
                date: item.createdAt ? item.createdAt.split("T")[0] : "-",
                ticketNumber: item.ticketNumber || "-",
                auctionDate: item.auctionDate ? item.auctionDate.split("T")[0] : "-",
                auctionTime: item.auction_time
                    ? dayjs(item.auction_time, "HH:mm").format("h:mm A")
                    : "-",
                referredBy: referredBy,
                status: item.status || "Pending",
                balanceValue: balance,
                subscriberName: item.subscriberName || userName,
                subscriberId: userId,
                enrollmentId: item.enrollmentId,
                mobileNumberRaw: item.mobileNumber || userPhone,
                action: (
                    <div className="relative text-center">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setOpenActionId(openActionId === item._id ? null : item._id);
                            }}
                            className="p-2 rounded-full hover:bg-gray-200"
                        >
                            ⋮
                        </button>
                        {openActionId === item._id && (
                            <div className="absolute right-6 top-10 bg-white border rounded-lg shadow-lg w-40 z-50">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenEditModal(item);
                                        setOpenActionId(null);
                                    }}
                                    className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 text-blue-600"
                                >
                                    <EditOutlined />
                                    <span>Edit</span>
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handlePrint(item);
                                    }}
                                    className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 text-green-600"
                                >
                                    <PrinterOutlined />
                                    <span>Print</span>
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        confirmDelete(item._id);
                                        setOpenActionId(null);
                                    }}
                                    className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 text-red-600"
                                >
                                    <DeleteOutlined />
                                    <span>Delete</span>
                                </button>
                            </div>
                        )}
                    </div>
                )
            };
        });
    }, [filteredBidRequests, openActionId]);

    const columns = [
        { key: "id", header: "SL. NO" },
        { key: "bid_request_code", header:"Bid Request Code"},
        { key: "date", header: "Request Date" },
        { key: "userName", header: "Subscriber Name" },
        { key: "customerId", header: "Customer Id" },
        { key: "groupName", header: "Group Name" },
        { key: "ticketNumber", header: "Ticket" },
        { key: "auctionDate", header: "Auction Date" },
        { key: "auctionTime", header: "Auction Time" },
        { key: "referredBy", header: "Referred By" },
        { key: "balanceValue", header: "Balance" },
        { key: "status", header: "Status" },
        { key: "action", header: "Action" },
    ];

    useEffect(() => {
        fetchBidRequests();
    }, [viewType]); // Fetch data when viewType changes

    return (
        <>
            {contextHolder}
            <Navbar />
            <div className="flex w-screen mt-14">
                <Sidebar />
                <div className="w-full p-4 min-h-[80vh]">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 mt-6">
                        <div className="text-center md:text-left space-y-2 ml-4">
                            <h1 className="text-3xl font-bold text-gray-800">Bid Management</h1>
                            <p className="text-gray-500">Submit a new bid request for an auction</p>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* View Toggle Added Here */}
                            <Radio.Group 
                                value={viewType} 
                                onChange={(e) => setViewType(e.target.value)}
                                buttonStyle="solid"
                                size="large"
                            >
                                <Radio.Button value="upcoming">Upcoming</Radio.Button>
                                <Radio.Button value="all">All</Radio.Button>
                            </Radio.Group>

                            <Button
                                type="primary"
                                size="large"
                                onClick={handleOpenCreatePage}
                                className="h-10 px-6 text-lg font-semibold bg-blue-800 hover:bg-blue-700 rounded-md shadow-lg"
                            >
                                + Bid Request
                            </Button>
                        </div>
                    </div>

                    {/* Filter Cards Section - 5 Cards in Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                        {/* Total Requests */}
                        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-500">Total Requests</p>
                                    <p className="text-2xl font-bold">{summaryStats.totalRequests}</p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-full">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                                Total Balance: ₹{summaryStats.totalBalance.toLocaleString("en-IN")}
                            </div>
                        </div>

                        {/* Pending Requests */}
                        <div
                            className={`bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500 cursor-pointer hover:shadow-lg transition-all ${selectedStatus === 'Pending' ? 'ring-2 ring-yellow-500 bg-yellow-50' : ''}`}
                            onClick={() => setSelectedStatus(selectedStatus === 'Pending' ? 'all' : 'Pending')}
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-500">Pending Requests</p>
                                    <p className="text-2xl font-bold text-yellow-600">{summaryStats.pendingRequests}</p>
                                </div>
                                <div className="p-3 bg-yellow-100 rounded-full">
                                    <ClockCircleOutlined className="text-yellow-600 text-xl" />
                                </div>
                            </div>
                        </div>

                        {/* Approved Requests */}
                        <div
                            className={`bg-white rounded-lg shadow p-4 border-l-4 border-green-500 cursor-pointer hover:shadow-lg transition-all ${selectedStatus === 'Accept' ? 'ring-2 ring-green-500 bg-green-50' : ''}`}
                            onClick={() => setSelectedStatus(selectedStatus === 'Accept' ? 'all' : 'Accept')}
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-500">Accept Requests</p>
                                    <p className="text-2xl font-bold text-green-600">{summaryStats.acceptRequests}</p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-full">
                                    <CheckCircleOutlined className="text-green-600 text-xl" />
                                </div>
                            </div>
                        </div>

                        {/* Declined Requests */}
                        <div
                            className={`bg-white rounded-lg shadow p-4 border-l-4 border-red-500 cursor-pointer hover:shadow-lg transition-all ${selectedStatus === 'Decline' ? 'ring-2 ring-red-500 bg-red-50' : ''}`}
                            onClick={() => setSelectedStatus(selectedStatus === 'Decline' ? 'all' : 'Decline')}
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-500">Decline Requests</p>
                                    <p className="text-2xl font-bold text-red-600">{summaryStats.declineRequests}</p>
                                </div>
                                <div className="p-3 bg-red-100 rounded-full">
                                    <CloseOutlined className="text-red-600 text-xl" />
                                </div>
                            </div>
                        </div>

                        {/* Reject for Non-Payment */}
                        <div
                            className={`bg-white rounded-lg shadow p-4 border-l-4 border-orange-500 cursor-pointer hover:shadow-lg transition-all ${selectedStatus === 'Rejected' ? 'ring-2 ring-orange-500 bg-orange-50' : ''}`}
                            onClick={() => setSelectedStatus(selectedStatus === 'Rejected' ? 'all' : 'Rejected')}
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-500">Rejected (Non-Payment)</p>
                                    <p className="text-2xl font-bold text-orange-600">{summaryStats.rejectedRequests}</p>
                                </div>
                                <div className="p-3 bg-orange-100 rounded-full">
                                    <StopOutlined className="text-orange-600 text-xl" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Group-wise Cards with View Toggle */}
                    {Object.keys(summaryStats.groupStats).length > 0 && (
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <div 
                                    className="flex items-center cursor-pointer"
                                    onClick={() => setIsGroupStatsOpen(!isGroupStatsOpen)}
                                >
                                    <h3 className="text-lg font-semibold mr-2">Group-wise Statistics</h3>
                                    <button className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                                        {isGroupStatsOpen ?
                                            <UpOutlined className="text-gray-600" /> :
                                            <DownOutlined className="text-gray-600" />
                                        }
                                    </button>
                                </div>

                                {/* View Toggle Buttons */}
                                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-md">
                                    <button
                                        className={`p-2 rounded ${groupViewMode === 'grid' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                                        onClick={() => setGroupViewMode('grid')}
                                    >
                                        <AppstoreOutlined />
                                    </button>
                                    <button
                                        className={`p-2 rounded ${groupViewMode === 'list' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                                        onClick={() => setGroupViewMode('list')}
                                    >
                                        <UnorderedListOutlined />
                                    </button>
                                </div>
                            </div>

                            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isGroupStatsOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                
                                {/* GRID VIEW */}
                                {groupViewMode === 'grid' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {Object.entries(summaryStats.groupStats).map(([groupName, stats]) => (
                                            <div
                                                key={groupName}
                                                className={`relative bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 transition-all duration-200 cursor-pointer overflow-hidden
                                                    ${selectedGroupFilter === groupName
                                                        ? 'border-blue-500 shadow-lg shadow-blue-100 bg-blue-50/50'
                                                        : 'border-gray-200 hover:border-blue-300 hover:shadow-md hover:shadow-blue-50'
                                                    }`}
                                                onClick={() => setSelectedGroupFilter(selectedGroupFilter === groupName ? 'all' : groupName)}
                                            >
                                                <div className={`h-1.5 w-full ${selectedGroupFilter === groupName ? 'bg-blue-500' : 'bg-gradient-to-r from-blue-400 to-purple-400'}`} />
                                                <div className="p-4">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <p className="text-sm font-semibold text-gray-800 truncate max-w-[140px] pr-2" title={groupName}>
                                                            {groupName}
                                                        </p>
                                                        <div className={`px-2 py-1 rounded-full text-xs font-bold ${stats.total > 5 ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                            Total: {stats.total}
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-4 gap-1 mt-2 text-center">
                                                        <div className={`p-1 rounded ${stats.pending > 0 ? 'bg-yellow-50' : 'bg-gray-50'}`}>
                                                            <div className="text-[10px] text-gray-500">Pend</div>
                                                            <div className={`text-sm font-bold ${stats.pending > 0 ? 'text-yellow-600' : 'text-gray-400'}`}>{stats.pending}</div>
                                                        </div>
                                                        <div className={`p-1 rounded ${stats.accept > 0 ? 'bg-green-50' : 'bg-gray-50'}`}>
                                                            <div className="text-[10px] text-gray-500">Appr</div>
                                                            <div className={`text-sm font-bold ${stats.accept > 0 ? 'text-green-600' : 'text-gray-400'}`}>{stats.accept}</div>
                                                        </div>
                                                        <div className={`p-1 rounded ${stats.decline > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
                                                            <div className="text-[10px] text-gray-500">Decl</div>
                                                            <div className={`text-sm font-bold ${stats.decline > 0 ? 'text-red-600' : 'text-gray-400'}`}>{stats.decline}</div>
                                                        </div>
                                                        <div className={`p-1 rounded ${stats.rejected > 0 ? 'bg-orange-50' : 'bg-gray-50'}`}>
                                                            <div className="text-[10px] text-gray-500">Rej</div>
                                                            <div className={`text-sm font-bold ${stats.rejected > 0 ? 'text-orange-600' : 'text-gray-400'}`}>{stats.rejected}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* LIST VIEW */}
                                {groupViewMode === 'list' && (
                                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Group Name</th>
                                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Pending</th>
                                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Accept</th>
                                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Decline</th>
                                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Rejected</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {Object.entries(summaryStats.groupStats).map(([groupName, stats]) => (
                                                    <tr 
                                                        key={groupName} 
                                                        className={`${selectedGroupFilter === groupName ? 'bg-blue-50' : ''} hover:bg-gray-50 cursor-pointer transition-colors`}
                                                        onClick={() => setSelectedGroupFilter(selectedGroupFilter === groupName ? 'all' : groupName)}
                                                    >
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {groupName}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                                            <span className="px-3 py-1 inline-flex text-sm font-bold leading-5 text-blue-700 bg-blue-100 rounded-full">
                                                                {stats.total}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                                            <span className={`px-3 py-1 inline-flex text-sm font-bold leading-5 rounded-full ${stats.pending > 0 ? 'text-yellow-700 bg-yellow-100' : 'text-gray-500 bg-gray-100'}`}>
                                                                {stats.pending}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                                            <span className={`px-3 py-1 inline-flex text-sm font-bold leading-5 rounded-full ${stats.accept > 0 ? 'text-green-700 bg-green-100' : 'text-gray-500 bg-gray-100'}`}>
                                                                {stats.accept}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                                            <span className={`px-3 py-1 inline-flex text-sm font-bold leading-5 rounded-full ${stats.decline > 0 ? 'text-red-700 bg-red-100' : 'text-gray-500 bg-gray-100'}`}>
                                                                {stats.decline}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                                            <span className={`px-3 py-1 inline-flex text-sm font-bold leading-5 rounded-full ${stats.rejected > 0 ? 'text-orange-700 bg-orange-100' : 'text-gray-500 bg-gray-100'}`}>
                                                                {stats.rejected}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Filter Controls */}
                    <div className="bg-white rounded-lg shadow p-4 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status Filter</label>
                                <Select
                                    value={selectedStatus}
                                    onChange={setSelectedStatus}
                                    className="w-full"
                                    size="large"
                                >
                                    <Option value="all">All Status</Option>
                                    <Option value="Pending">Pending</Option>
                                    <Option value="Accept">Accept</Option>
                                    <Option value="Decline">Decline</Option>
                                    <Option value="Rejected">Rejected</Option>
                                </Select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Group Filter</label>
                                <Select
                                    value={selectedGroupFilter}
                                    onChange={setSelectedGroupFilter}
                                    className="w-full"
                                    size="large"
                                    showSearch
                                    filterOption={(input, option) =>
                                        option.children.toLowerCase().includes(input.toLowerCase())
                                    }
                                >
                                    <Option value="all">All Groups</Option>
                                    {uniqueGroups.map(group => (
                                        <Option key={group} value={group}>{group}</Option>
                                    ))}
                                </Select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <DatePicker
                                        style={{ width: '100%' }}
                                        value={fromDate}
                                        onChange={setFromDate}
                                        format="DD-MM-YYYY"
                                        placeholder="From Date"
                                        size="large"
                                    />
                                    <DatePicker
                                        style={{ width: '100%' }}
                                        value={toDate}
                                        onChange={setToDate}
                                        format="DD-MM-YYYY"
                                        placeholder="To Date"
                                        size="large"
                                    />
                                </div>
                            </div>
                        </div>

                        {(selectedStatus !== "all" || selectedGroupFilter !== "all" || fromDate || toDate) && (
                            <div className="mt-3 flex justify-end">
                                <Button
                                    onClick={() => {
                                        setSelectedStatus("all");
                                        setSelectedGroupFilter("all");
                                        setFromDate(null);
                                        setToDate(null);
                                    }}
                                    className="text-white bg-blue-500"
                                >
                                    Clear All Filters
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-lg shadow p-4 min-h-[400px]">
                        {loadingTable ? (
                            <CircularLoader isLoading={true} />
                        ) : filteredBidRequests.length === 0 ? (
                            <CircularLoader isLoading={false} failure={true} data="Bid Requests" />
                        ) : (
                            <DataTable
                                data={formattedBidData}
                                columns={columns}
                                exportedFileName="Bid Requests.csv"
                                exportedPdfName="Bid Requests"
                                printHeaderKeys={[
                                    "Total Requests",
                                    "Total Balance",
                                    "Pending Requests",
                                    "Accept Requests",
                                    "Decline Requests"
                                ]}
                                printHeaderValues={[
                                    summaryStats.totalRequests.toString(),
                                    `₹ ${summaryStats.totalBalance.toLocaleString("en-IN")}`,
                                    summaryStats.pendingRequests.toString(),
                                    summaryStats.acceptRequests.toString(),
                                    summaryStats.declineRequests.toString()
                                ]}
                            />
                        )}
                    </div>

                    {/* Larger Edit Modal */}
                    <ModalComponent isVisible={isEditModalOpen} onClose={handleCloseEditModal}>
                        <div className="w-full max-w-6xl bg-white shadow-inner font-sans text-sm text-gray-800 rounded-lg">
                            <div className="border-b-2 border-blue-900 p-6 mb-6">
                                <h2 className="text-center text-2xl font-bold text-blue-900 uppercase tracking-wider">
                                    Edit Bid Request
                                </h2>
                            </div>

                            <Form form={editForm} layout="vertical" className="px-8">
                                <div className="mb-6">
                                    <h3 className="font-bold text-blue-900 mb-3 border-b pb-1">Subscriber Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                                        <Form.Item name="subscriberId" hidden><Input /></Form.Item>
                                        <div>
                                            <label className="block font-semibold text-gray-700 mb-1">Subscriber Name</label>
                                            <Form.Item name="subscriberName" className="mb-0">
                                                <Input readOnly className="bg-gray-100 border-gray-300 font-semibold" />
                                            </Form.Item>
                                        </div>
                                        <div>
                                            <label className="block font-semibold text-gray-700 mb-1">Mobile Number</label>
                                            <Form.Item name="mobileNumber" className="mb-0">
                                                <Input readOnly className="bg-gray-100 border-gray-300 font-semibold" />
                                            </Form.Item>
                                        </div>
                                        <div>
                                            <label className="block font-semibold text-gray-700 mb-1">Customer ID</label>
                                            <Form.Item name="customerId" className="mb-0">
                                                <Input readOnly className="bg-gray-100 border-gray-300 font-semibold" />
                                            </Form.Item>
                                        </div>
                                    </div>

                                    {editGroups.length > 0 ? (
                                        <div className="space-y-3">
                                            <label className="block font-semibold text-gray-700">
                                                Select Group for Bid Request <span className="text-red-500">*</span>
                                            </label>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <Form.Item name="selectedGroupIndex" rules={[{ required: true, message: 'Required!' }]} className="mb-3">
                                                    <Select
                                                        placeholder="Choose which group..."
                                                        onChange={handleEditGroupSelect}
                                                        value={selectedEditGroupIndex}
                                                        className="w-full"
                                                        size="large"
                                                    >
                                                        {editGroups.map((group, index) => (
                                                            <Option key={group.id} value={index}>
                                                                {group.groupName} (Ticket: {group.ticketNumber})
                                                            </Option>
                                                        ))}
                                                    </Select>
                                                </Form.Item>
                                               
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                                <div>
                                                    <label className="block font-semibold text-gray-700 mb-1">Group Start Date</label>
                                                    <Form.Item name="startDate" className="mb-0">
                                                        <Input readOnly className="bg-blue-50 border-blue-200 text-blue-900 font-semibold h-10" />
                                                    </Form.Item>
                                                </div>
                                                <div>
                                                    <label className="block font-semibold text-gray-700 mb-1">Group End Date</label>
                                                    <Form.Item name="endDate" className="mb-0">
                                                        <Input readOnly className="bg-blue-50 border-blue-200 text-blue-900 font-semibold h-10" />
                                                    </Form.Item>
                                                </div>
                                                <div>
                                                    <label className="block font-semibold text-gray-700 mb-1">Auctions Done</label>
                                                    <Form.Item name="auctionsDone" className="mb-0">
                                                        <Input readOnly className="bg-green-50 border-green-200 text-green-900 font-bold text-center h-10" />
                                                    </Form.Item>
                                                </div>
                                                <div>
                                                    <label className="block font-semibold text-gray-700 mb-1">Ticket Number</label>
                                                    <Form.Item name="ticketNumber" className="mb-0">
                                                        <Input readOnly className="bg-gray-100 border-gray-300 font-semibold h-10" />
                                                    </Form.Item>
                                                </div>
                                            </div>
                                            <div className="mb-4">
                                                <label className="block font-semibold text-gray-700 mb-1">Group Name</label>
                                                <Form.Item name="groupName" className="mb-0">
                                                    <Input readOnly className="bg-gray-100 border-gray-300 font-semibold h-10" />
                                                </Form.Item>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 flex justify-center items-center">
                                            <Spin size="large" />
                                        </div>
                                    )}
                                </div>

                                <div className="mb-8">
                                    <h3 className="font-bold text-blue-900 mb-3 border-b pb-1">Auction Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block font-semibold text-gray-700 mb-1">Auction Date <span className="text-red-500">*</span></label>
                                            <Form.Item name="auctionDate" rules={[{ required: true, message: 'Required!' }]} className="mb-0">
                                                <DatePicker style={{ width: '100%' }} className="border-gray-400 h-10" format="DD-MM-YYYY" />
                                            </Form.Item>
                                        </div>
                                        <div>
                                            <label className="block font-semibold text-gray-700 mb-1">Auction Time <span className="text-red-500">*</span></label>
                                            <Form.Item name="auctionTime" rules={[{ required: true, message: 'Required!' }]} className="mb-0">
                                                <TimePicker style={{ width: '100%' }} className="border-gray-400 h-10" format="h:mm A" use12Hours />
                                            </Form.Item>
                                        </div>
                                        <div>
                                            <label className="block font-semibold text-gray-700 mb-1">Request Date</label>
                                            <Form.Item name="requestDate" className="mb-0">
                                                <DatePicker style={{ width: '100%' }} className="border-gray-400 h-10" format="DD-MM-YYYY" />
                                            </Form.Item>
                                        </div>
                                    </div>
                                </div>

                                {/* Balance Display */}
                                <div className="mb-6">
                                    <div className="p-4 bg-gray-50 border rounded-lg flex justify-between items-center">
                                        <span className="font-semibold text-gray-700 text-lg">Current Due Balance:</span>
                                        <span className={`font-bold text-2xl ${customerBalance <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {customerBalance !== null ? `₹ ${customerBalance.toLocaleString("en-IN")}` : 'Loading...'}
                                        </span>
                                    </div>
                                </div>

                                <Form.Item name="enrollmentId" hidden><Input /></Form.Item>
                                <Form.Item name="groupId" hidden><Input /></Form.Item>

                                {/* Status Buttons - WhatsApp removed */}
                                <div className="mb-6">
                                    <h3 className="font-bold text-blue-900 mb-3 border-b pb-1">Update Status</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                        {/* Pending Button */}
                                        <Popconfirm
                                            title="Set to Pending?"
                                            description="This will update the status to Pending."
                                            onConfirm={handleSetPending}
                                            okText="Yes"
                                            cancelText="No"
                                        >
                                            <Button
                                                type="default"
                                                loading={loading}
                                                className="h-14 font-bold border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                                                icon={<ClockCircleOutlined />}
                                                disabled={editGroups.length === 0}
                                                block
                                            >
                                                Pending
                                            </Button>
                                        </Popconfirm>

                                        {/* Accept Button */}
                                        <Popconfirm
                                            title="Approve Request?"
                                            description="This will update the status to Accepted."
                                            onConfirm={handleSetAccept}
                                            okText="Yes"
                                            cancelText="No"
                                        >
                                            <Button
                                                type="primary"
                                                loading={loading}
                                                disabled={editGroups.length === 0}
                                                className="h-14 font-bold bg-green-600 hover:bg-green-700 border-green-600"
                                                icon={<CheckCircleOutlined />}
                                                block
                                            >
                                                Accept
                                            </Button>
                                        </Popconfirm>

                                        {/* Declined Button */}
                                        <Popconfirm
                                            title="Decline Request?"
                                            description="This will update the status to Decline."
                                            onConfirm={handleSetDecline}
                                            okText="Yes"
                                            cancelText="No"
                                        >
                                            <Button
                                                type="primary"
                                                danger
                                                loading={loading}
                                                className="h-14 font-bold"
                                                icon={<CloseOutlined />}
                                                disabled={editGroups.length === 0}
                                                block
                                            >
                                                Decline
                                            </Button>
                                        </Popconfirm>

                                        {/* Rejected Non-Payment Button */}
                                        <Popconfirm
                                            title="Reject for Non-Payment?"
                                            description="This will set status to Rejected for non-payment."
                                            onConfirm={handleSetRejected}
                                            okText="Yes"
                                            cancelText="No"
                                        >
                                            <Button
                                                type="primary"
                                                danger
                                                loading={loading}
                                                className="h-14 font-bold bg-orange-600 hover:bg-orange-700 border-orange-600"
                                                icon={<StopOutlined />}
                                                 disabled={editGroups.length === 0}
                                                block
                                            >
                                                Reject<br/>(Non-Pay)
                                            </Button>
                                        </Popconfirm>

                                        {/* Cancel/Close Button */}
                                        <Button
                                            onClick={handleCloseEditModal}
                                            className="h-14 font-semibold border-gray-400"
                                            block
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            </Form>
                        </div>
                    </ModalComponent>
                </div>
            </div>
        </>
    );
}

export default BidRequest;