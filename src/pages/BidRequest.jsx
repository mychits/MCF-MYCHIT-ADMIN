import { useState, useEffect, useMemo } from "react";
import { Form, Input, DatePicker, TimePicker, Button, Select, notification, Popconfirm, Spin, Modal } from "antd";
import { EditOutlined, DeleteOutlined, CheckCircleOutlined, PrinterOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
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
    }, []);

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

                    // ✅ STRICT LOGIC FROM Enroll.jsx (Applied to groupData)
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

        // Get referral data
        const referredByFromTable =
            (item?.agent?.name && item?.agent?.phone_number)
                ? `${item.agent.name} | ${item.agent.phone_number}`
                : (item?.referred_customer?.full_name && item?.referred_customer?.phone_number)
                    ? `${item.referred_customer.full_name} | ${item.referred_customer.phone_number}`
                    : (item?.referred_lead?.lead_name && item?.referred_lead?.agent_number)
                        ? `${item.referred_lead.lead_name} | ${item.referred_lead.agent_number}`
                        : item.referredBy || "N/A";

        // Map 'Rejected' from backend to 'Declined' for frontend if needed
        let statusValue = item.status || "Pending";
        if (statusValue === "Rejected") {
            statusValue = "Declined"; // Convert Rejected to Declined for frontend
        }

        editForm.setFieldsValue({
            subscriberId: userId,
            subscriberName: nameToDisplay,
            mobileNumber: phoneToDisplay,
            customerId: customerIdToDisplay,
            auctionDate: item.auctionDate ? dayjs(item.auctionDate) : null,
            auctionTime: item.auction_time ? dayjs(item.auction_time, "HH:mm") : null,
            referredBy: referredByFromTable,
            requestDate: item.createdAt ? dayjs(item.createdAt) : dayjs(),
            status: statusValue, // Use the mapped status
            groupName: item.groupName,
            ticketNumber: item.ticketNumber,
            enrollmentId: item.enrollmentId,
            groupId: item.groupId?._id || item.groupId
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

    const handleEditFinish = async (values) => {
        try {
            setLoading(true);

            // Get the correct group index
            const groupIndex = values.selectedGroupIndex ?? selectedEditGroupIndex;
            const selectedGroup = editGroups[groupIndex];

            const formattedTime = values.auctionTime ? values.auctionTime.format('HH:mm') : null;

            // Get status from form values - this is the key fix
            const currentStatus = values.status || "Pending";

            console.log("Status from form values:", currentStatus); // Debug log

            const payload = {
                subscriberId: values.subscriberId,
                subscriberName: values.subscriberName,
                mobileNumber: values.mobileNumber,
                groupName: selectedGroup?.groupName || values.groupName,
                ticketNumber: selectedGroup?.ticketNumber || values.ticketNumber,
                auctionDate: values.auctionDate ? values.auctionDate.format('YYYY-MM-DD') : null,
                auction_time: formattedTime,
                referred_by: values.referredBy || values.referred_by,
                groupId: selectedGroup?.id || values.groupId,
                enrollmentId: selectedGroup?.enrollmentId || values.enrollmentId,
                status: currentStatus, // Use the captured status
            };

            // Remove undefined/null values
            Object.keys(payload).forEach(key => {
                if (payload[key] === undefined || payload[key] === null) {
                    delete payload[key];
                }
            });

            console.log("Updating bid request:", editingId);
            console.log("Payload:", payload);

            const response = await API.put(`/bid-request/update/${editingId}`, payload);

            if (response.data.success) {
                api.success({
                    message: "Updated",
                    description: `Bid Request updated successfully! Status: ${currentStatus}`
                });

                handleCloseEditModal();
                fetchBidRequests();
            }
        } catch (error) {
            console.error("Update error:", error);
            console.error("Response:", error.response?.data);
            api.error({
                message: "Error",
                description: error.response?.data?.message || "Failed to update request."
            });
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        try {
            setLoading(true);
            const values = editForm.getFieldsValue();

            // Consistent group index resolution
            const groupIndex = values.selectedGroupIndex ?? selectedEditGroupIndex;
            const selectedGroup = editGroups[groupIndex];

            if (!selectedGroup) {
                api.error({ message: "Error", description: "Please select a valid group." });
                setLoading(false);
                return;
            }

            // Fetch fresh balance before proceeding
            await fetchCustomerBalance(selectedGroup.enrollmentId);

            if (customerBalance === null) {
                api.error({ message: "Error", description: "Could not verify balance. Please try again." });
                setLoading(false);
                return;
            }

            const formattedTime = values.auctionTime ? values.auctionTime.format('HH:mm') : null;

            // Prepare common payload
            const commonPayload = {
                subscriberId: values.subscriberId,
                subscriberName: values.subscriberName,
                mobileNumber: values.mobileNumber,
                groupName: selectedGroup?.groupName,
                ticketNumber: selectedGroup?.ticketNumber,
                auctionDate: values.auctionDate ? values.auctionDate.format('YYYY-MM-DD') : null,
                auction_time: formattedTime,
                referred_by: values.referredBy,
                groupId: selectedGroup?.id,
                enrollmentId: selectedGroup?.enrollmentId,
            };

            const rawPhone = values.mobileNumber || values.phone || "";
            let phone = rawPhone.replace(/\D/g, '');
            if (phone.startsWith('91') && phone.length === 12) {
                phone = phone.substring(2);
            }

            if (customerBalance > 0) {
                // Update with status 'Declined'
                await API.put(`/bid-request/update/${editingId}`, {
                    ...commonPayload,
                    status: "Declined"
                });

                const message = `Hello ${values.subscriberName}, your bid request for Group: ${selectedGroup?.groupName} (Ticket: ${selectedGroup?.ticketNumber}) has been DECLINED due to outstanding balance of ${customerBalance}. Please clear your dues.`;

                if (phone.length === 10) {
                    const whatsappUrl = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;
                    window.open(whatsappUrl, '_blank');
                }

                api.warning({
                    message: "Request Declined",
                    description: `Due to outstanding balance (${customerBalance}). Message sent.`
                });

                handleCloseEditModal();
                fetchBidRequests();
                return;
            }

            // Approve when balance is 0 or less
            await API.put(`/bid-request/update/${editingId}`, {
                ...commonPayload,
                status: "Approved"
            });

            const message = `Hello ${values.subscriberName}, your bid request for Group: ${selectedGroup?.groupName} (Ticket: ${selectedGroup?.ticketNumber}) has been APPROVED.`;

            if (phone.length === 10) {
                const whatsappUrl = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, '_blank');
            }

            api.success({
                message: "Approved",
                description: "Bid Request approved successfully!"
            });

            handleCloseEditModal();
            fetchBidRequests();
        } catch (error) {
            console.error(error);
            api.error({ message: "Error", description: "Failed to process request." });
        } finally {
            setLoading(false);
        }
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
        const userEmail = userObj.email || "mychitsdesign@gmail.com";
        const groupName = item.groupName || (item.groupId?.group_name) || "test_MCF-1L-CG-50M";
        const balance = item.auctions?.balance || -3000;
        const ticketNumber = item.ticketNumber || "29";
        const customerId = (typeof userObj === 'object') ? (userObj.customer_id || userObj._id || "N/A") : "N/A";

        // Formatting dates
        const requestDate = item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-') : '24-02-2026';
        const auctionDate = item.auctionDate ? new Date(item.auctionDate).toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-') : '28-02-2026';
        const status = item.status || "Approved";

        const printWindow = window.open('', '_blank');

        // Helper to generate the Form Body
        const generateForm = () => `
      <div class="flex flex-col h-full p-3 font-serif text-[11px] text-black">
        <!-- --- HEADER --- -->
        <div class="flex justify-between items-center border-b-2 border-black pb-2 mb-3">
          <div class="flex items-center gap-2">
            <img src="${image}" alt="Logo" class="h-12 w-auto" />
            <div class="">
              <h1 class="text-sm font-bold text-blue-900 uppercase leading-tight ml-6">VIJAYA VINAYAK CHIT FUNDS (P) LTD</h1>
              <h1 class="text-xl font-extrabold text-yellow-600 uppercase text-center ml-3">Bid Requesting Letter</h1>
            </div>
          </div>
        </div>
        <!-- --- BODY --- -->
        <div class="flex-grow space-y-3">
          <!-- Row 1: Date & Place -->
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
          <!-- Row 2: Agent Name -->
          <div class="flex items-center">
            <span class="w-32 font-semibold">Agent Name:</span>
            <div class="border-b border-black flex-grow h-4 pl-1 text-black"></div>
          </div>
          <!-- Row 3: Subscriber Name -->
          <div class="flex items-center py-1 px-1 rounded">
            <span class="w-32 font-bold text-black">Subscriber Name:</span>
            <div class="border-b border-black flex-grow h-4 pl-1 text-black">${userName}</div>
          </div>
          <div class="flex items-center py-1 px-1 rounded">
            <span class="w-32 font-bold text-black">Subscriber ID:</span>
            <div class="border-b border-black flex-grow h-4 pl-1 text-black">${customerId}</div>
          </div>
          <!-- Row 4: Mobile Number -->
          <div class="flex items-center">
            <span class="w-32 font-semibold">Mobile Number:</span>
            <div class="border-b border-black flex-grow h-4 pl-1 text-black">${userPhone}</div>
          </div>
          <!-- Row 5: Group Name -->
          <div class="flex items-center">
            <span class="w-32 font-semibold">Group Name:</span>
            <div class="border-b border-black flex-grow h-4 pl-1 text-black">${groupName}</div>
          </div>
          <div class="flex items-center">
            <span class="w-32 font-semibold">Chit Value:</span>
            <div class="border-b border-black flex-grow h-4 pl-1 text-black"></div>
          </div>
          <div class="flex items-center">
            <span class="w-32 font-semibold">Ticket No:</span>
            <div class="border-b border-black flex-grow h-4 pl-1 text-black">${ticketNumber}</div>
          </div>
          <!-- Row 7: Guarantor -->
          <div class="flex items-center mt-1">
            <span class="w-32 font-semibold">Guarantor:</span>
            <div class="flex gap-4 text-xs">
              <div class="flex items-center gap-1">
                <div class="w-3 h-3 border border-black rounded-full"></div> Yes
              </div>
              <div class="flex items-center gap-1">
                <div class="w-3 h-3 border border-black rounded-full flex items-center justify-center">
                  <div class="w-1.5 h-1.5 bg-black rounded-full"></div>
                </div> No
              </div>
            </div>
          </div>
          <!-- Row 8: Balance & Status (UPDATED LOGIC) -->
          <div class="flex items-center text-[10px] text-black">
            <span class="w-32 font-semibold">Current Status:</span>
            <span class="ml-2">
              <span class="font-bold ${balance <= 0 ? 'text-green-700' : 'text-red-600'}">
                ${balance <= 0 ? 'Excess: ' : 'Due: '}₹ ${Math.abs(balance)}
              </span>
            </span>
          </div>
          <!-- Row 6: Chit Requesting Box -->
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
          <!-- Row 9: Employee Signature -->
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
        <!-- --- FOOTER: FOR OFFICIAL USE ONLY --- -->
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
          <!-- Left Copy -->
          <div class="split-page">
            ${generateForm()}
          </div>
          <!-- Right Copy -->
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

    const fetchBidRequests = async () => {
        try {
            setLoadingTable(true);
            const response = await API.get("/bid-request/get-all");
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

    // Get unique group names for filter
    const uniqueGroups = useMemo(() => {
        const groups = rawBidRequests.map(item => {
            const groupObject = item?.groupId || {};
            return item.groupName || (typeof groupObject === 'object' ? groupObject.group_name : "N/A");
        }).filter((value, index, self) => value && self.indexOf(value) === index);
        return groups;
    }, [rawBidRequests]);

    // Filtered data based on status, group, and date range
    const filteredBidRequests = useMemo(() => {
        return rawBidRequests.filter(item => {
            // Status filter
            if (selectedStatus !== "all" && item.status !== selectedStatus) {
                return false;
            }
            // Group filter
            if (selectedGroupFilter !== "all") {
                const groupObject = item?.groupId || {};
                const groupName = item.groupName || (typeof groupObject === 'object' ? groupObject.group_name : "N/A");
                if (groupName !== selectedGroupFilter) {
                    return false;
                }
            }
            // Date range filter
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

    // Calculate summary stats for cards
    const summaryStats = useMemo(() => {
        const totalRequests = rawBidRequests.length;
        const pendingRequests = rawBidRequests.filter(item => item.status === "Pending").length;
        const approvedRequests = rawBidRequests.filter(item => item.status === "Approved").length;
        const declinedRequests = rawBidRequests.filter(item => item.status === "Declined").length;
        const totalBalance = rawBidRequests.reduce((sum, item) => sum + (item.auctions?.balance || 0), 0);

        // Group-wise stats
        const groupStats = {};
        rawBidRequests.forEach(item => {
            const groupObject = item?.groupId || {};
            const groupName = item.groupName || (typeof groupObject === 'object' ? groupObject.group_name : "Unknown");
            if (!groupStats[groupName]) {
                groupStats[groupName] = {
                    total: 0,
                    pending: 0,
                    approved: 0,
                    declined: 0
                };
            }
            groupStats[groupName].total++;
            if (item.status === "Pending") groupStats[groupName].pending++;
            if (item.status === "Approved") groupStats[groupName].approved++;
            if (item.status === "Declined") groupStats[groupName].declined++;
        });

        return {
            totalRequests,
            pendingRequests,
            approvedRequests,
            declinedRequests,
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

            // ✅ STRICT LOGIC FROM Enroll.jsx (Applied to groupObject)
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
    }, []);

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
                        <div>
                            <Button
                                type="primary"
                                size="large"
                                onClick={handleOpenCreatePage}
                                className="h-10 px-6 text-lg font-semibold bg-blue-800 hover:bg-blue-700 rounded-md shadow-lg mr-4"
                            >
                                + Bid Request
                            </Button>
                        </div>
                    </div>

                    {/* Filter Cards Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {/* Total Requests Card */}
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

                        {/* Pending Requests Card */}
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
                                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                                Click to {selectedStatus === 'Pending' ? 'clear filter' : 'filter pending'}
                            </div>
                        </div>

                        {/* Approved Requests Card */}
                        <div
                            className={`bg-white rounded-lg shadow p-4 border-l-4 border-green-500 cursor-pointer hover:shadow-lg transition-all ${selectedStatus === 'Approved' ? 'ring-2 ring-green-500 bg-green-50' : ''}`}
                            onClick={() => setSelectedStatus(selectedStatus === 'Approved' ? 'all' : 'Approved')}
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-500">Approved Requests</p>
                                    <p className="text-2xl font-bold text-green-600">{summaryStats.approvedRequests}</p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-full">
                                    <CheckCircleOutlined className="text-green-600 text-xl" />
                                </div>
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                                Click to {selectedStatus === 'Approved' ? 'clear filter' : 'filter approved'}
                            </div>
                        </div>

                        {/* Declined Requests Card */}
                        <div
                            className={`bg-white rounded-lg shadow p-4 border-l-4 border-red-500 cursor-pointer hover:shadow-lg transition-all ${selectedStatus === 'Declined' ? 'ring-2 ring-red-500 bg-red-50' : ''}`}
                            onClick={() => setSelectedStatus(selectedStatus === 'Declined' ? 'all' : 'Declined')}
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-500">Declined Requests</p>
                                    <p className="text-2xl font-bold text-red-600">{summaryStats.declinedRequests}</p>
                                </div>
                                <div className="p-3 bg-red-100 rounded-full">
                                    <DeleteOutlined className="text-red-600 text-xl" />
                                </div>
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                                Click to {selectedStatus === 'Declined' ? 'clear filter' : 'filter declined'}
                            </div>
                        </div>
                    </div>

                    {/* Group-wise Cards */}
                    {Object.keys(summaryStats.groupStats).length > 0 && (
                        <div className="mb-6">
                            {/* Header with Toggle Button */}
                            <div
                                className="flex items-center justify-between cursor-pointer mb-3"
                                onClick={() => setIsGroupStatsOpen(!isGroupStatsOpen)}
                            >
                                <h3 className="text-lg font-semibold">Group-wise Statistics</h3>
                                <button className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                                    {isGroupStatsOpen ?
                                        <UpOutlined className="text-gray-600" /> :
                                        <DownOutlined className="text-gray-600" />
                                    }
                                </button>
                            </div>

                            {/* Cards Section with Animation */}
                            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isGroupStatsOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                                }`}>
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
                                            {/* Top Accent Bar */}
                                            <div className={`h-1.5 w-full ${selectedGroupFilter === groupName ? 'bg-blue-500' : 'bg-gradient-to-r from-blue-400 to-purple-400'}`} />

                                            <div className="p-4">
                                                {/* Header with Group Name and Total Badge */}
                                                <div className="flex justify-between items-start mb-3">
                                                    <p className="text-sm font-semibold text-gray-800 truncate max-w-[140px] pr-2" title={groupName}>
                                                        {groupName}
                                                    </p>
                                                    <div className={`px-2 py-1 rounded-full text-xs font-bold ${stats.total > 5 ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                        Total: {stats.total}
                                                    </div>
                                                </div>

                                                {/* Stats Grid */}
                                                <div className="grid grid-cols-3 gap-2 mt-2">
                                                    {/* Pending Card */}
                                                    <div className={`text-center p-2 rounded-lg ${stats.pending > 0 ? 'bg-yellow-50' : 'bg-gray-50'}`}>
                                                        <div className="text-xs text-gray-500 mb-1">Pending</div>
                                                        <div className={`text-lg font-bold ${stats.pending > 0 ? 'text-yellow-600' : 'text-gray-400'}`}>
                                                            {stats.pending}
                                                        </div>
                                                    </div>

                                                    {/* Approved Card */}
                                                    <div className={`text-center p-2 rounded-lg ${stats.approved > 0 ? 'bg-green-50' : 'bg-gray-50'}`}>
                                                        <div className="text-xs text-gray-500 mb-1">Approved</div>
                                                        <div className={`text-lg font-bold ${stats.approved > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                                                            {stats.approved}
                                                        </div>
                                                    </div>

                                                    {/* Declined Card */}
                                                    <div className={`text-center p-2 rounded-lg ${stats.declined > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
                                                        <div className="text-xs text-gray-500 mb-1">Declined</div>
                                                        <div className={`text-lg font-bold ${stats.declined > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                                                            {stats.declined}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Progress Bar (shows percentage of approved) */}
                                                {stats.total > 0 && (
                                                    <div className="mt-3">
                                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                            <span>Progress</span>
                                                            <span>{Math.round((stats.approved / stats.total) * 100)}%</span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                            <div
                                                                className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                                                                style={{ width: `${(stats.approved / stats.total) * 100}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Bottom Status Bar */}
                                                <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400">
                                                    <span>Click to filter</span>
                                                    {selectedGroupFilter === groupName && (
                                                        <span className="text-blue-500 flex items-center">
                                                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                            Active
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Filter Controls */}
                    <div className="bg-white rounded-lg shadow p-4 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Status Filter */}
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
                                    <Option value="Approved">Approved</Option>
                                    <Option value="Declined">Declined</Option>
                                </Select>
                            </div>

                            {/* Group Filter */}
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

                            {/* Date Range Filter - Takes 2 columns */}
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

                        {/* Clear Filters Button */}
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
                                exportedFileName="Bid_Requests.csv"
                                exportedPdfName="Bid_Requests.pdf"
                                printHeaderKeys={[
                                    "Total Requests",
                                    "Total Balance",
                                    "Pending Requests",
                                    "Approved Requests",
                                    "Declined Requests"
                                ]}
                                printHeaderValues={[
                                    summaryStats.totalRequests.toString(),
                                    `₹ ${summaryStats.totalBalance.toLocaleString("en-IN")}`,
                                    summaryStats.pendingRequests.toString(),
                                    summaryStats.approvedRequests.toString(),
                                    summaryStats.declinedRequests.toString()
                                ]}
                            />
                        )}
                    </div>

                    <ModalComponent isVisible={isEditModalOpen} onClose={handleCloseEditModal}>
                       <div className="w-full max-w-7xl bg-white shadow-inner font-sans text-sm text-gray-800 rounded-lg">
                            <div className="border-b-2 border-blue-900 p-6 mb-6">
                                <h2 className="text-center text-2xl font-bold text-blue-900 uppercase tracking-wider">
                                    Edit Bid Request
                                </h2>
                            </div>

                            <Form form={editForm} layout="vertical" className="px-8">
                                {/* Use a 3-column grid for better space utilization */}
                                <div className="mb-6">
                                    <h3 className="font-bold text-blue-900 mb-3 border-b pb-1">Subscriber Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                                        {/* Subscriber ID (Hidden) */}
                                        <Form.Item name="subscriberId" hidden>
                                            <Input />
                                        </Form.Item>

                                        {/* Name Input - Read Only */}
                                        <div>
                                            <label className="block font-semibold text-gray-700 mb-1">Subscriber Name</label>
                                            <Form.Item name="subscriberName" className="mb-0">
                                                <Input readOnly className="bg-gray-100 border-gray-300 font-semibold" />
                                            </Form.Item>
                                        </div>

                                        {/* Phone Input - Read Only */}
                                        <div>
                                            <label className="block font-semibold text-gray-700 mb-1">Mobile Number</label>
                                            <Form.Item name="mobileNumber" className="mb-0">
                                                <Input readOnly className="bg-gray-100 border-gray-300 font-semibold" />
                                            </Form.Item>
                                        </div>

                                        {/* Customer ID */}
                                        <div>
                                            <label className="block font-semibold text-gray-700 mb-1">Customer ID</label>
                                            <Form.Item name="customerId" className="mb-0">
                                                <Input readOnly className="bg-gray-100 border-gray-300 font-semibold" />
                                            </Form.Item>
                                        </div>
                                    </div>

                                    {/* Group Selector Section - Now in a grid */}
                                    {editGroups.length > 0 ? (
                                        <div className="space-y-3">
                                            <label className="block font-semibold text-gray-700">
                                                Select Group for Bid Request <span className="text-red-500">*</span>
                                            </label>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <Form.Item
                                                    name="selectedGroupIndex"
                                                    rules={[{ required: true, message: 'Required!' }]}
                                                    className="mb-3"
                                                >
                                                    <Select
                                                        placeholder="Choose which group..."
                                                        onChange={handleEditGroupSelect}
                                                        value={selectedEditGroupIndex}
                                                        className="w-full"
                                                        size="large"
                                                        dropdownStyle={{ maxHeight: '400px' }}
                                                        optionLabelProp="label"
                                                    >
                                                        {editGroups.map((group, index) => (
                                                            <Option
                                                                key={group.id}
                                                                value={index}
                                                                label={`${group.groupName} (Ticket: ${group.ticketNumber})`}
                                                                className="py-3"
                                                            >
                                                                <div className="flex flex-col justify-center py-1">
                                                                    <span className="font-semibold text-gray-900 text-base">{group.groupName}</span>
                                                                    <span className="text-xs text-gray-500 mt-0.5">
                                                                        Ticket: {group.ticketNumber} | Auctions: {group.auctionsDone || 0}
                                                                    </span>
                                                                </div>
                                                            </Option>
                                                        ))}
                                                    </Select>
                                                </Form.Item>

                                                {/* Referred By Field - Moved here */}
                                                <div>
                                                    <label className="block font-semibold text-gray-700 mb-1">Referred By</label>
                                                    <Form.Item name="referredBy" className="mb-0">
                                                        <Input readOnly className="bg-yellow-50 border-yellow-200 text-yellow-900 font-semibold h-10" />
                                                    </Form.Item>
                                                </div>
                                            </div>

                                            {/* Group Details Display - Now in a 4-column grid */}
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

                                            {/* Group Name - Full width */}
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

                                {/* --- AUCTION DETAILS SECTION - Now in a 3-column grid --- */}
                                <div className="mb-8">
                                    <h3 className="font-bold text-blue-900 mb-3 border-b pb-1">Auction Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block font-semibold text-gray-700 mb-1">Auction Date <span className="text-red-500">*</span></label>
                                            <Form.Item
                                                name="auctionDate"
                                                rules={[{ required: true, message: 'Required!' }]}
                                                className="mb-0"
                                            >
                                                <DatePicker
                                                    style={{ width: '100%' }}
                                                    className="border-gray-400 h-10"
                                                    placeholder="Select Auction Date"
                                                    format="DD-MM-YYYY"
                                                />
                                            </Form.Item>
                                        </div>
                                        <div>
                                            <label className="block font-semibold text-gray-700 mb-1">Auction Time <span className="text-red-500">*</span></label>
                                            <Form.Item
                                                name="auctionTime"
                                                rules={[{ required: true, message: 'Required!' }]}
                                                className="mb-0"
                                            >
                                                <TimePicker
                                                    style={{ width: '100%' }}
                                                    className="border-gray-400 h-10"
                                                    format="h:mm A"
                                                    use12Hours
                                                    placeholder="Select Time"
                                                />
                                            </Form.Item>
                                        </div>
                                        <div>
                                            <label className="block font-semibold text-gray-700 mb-1">Request Date</label>
                                            <Form.Item name="requestDate" className="mb-0">
                                                <DatePicker
                                                    style={{ width: '100%' }}
                                                    className="border-gray-400 h-10"
                                                    format="DD-MM-YYYY"
                                                    placeholder="Select Request Date"
                                                />
                                            </Form.Item>
                                        </div>
                                    </div>
                                </div>

                                {/* --- ADDITIONAL FIELDS - Now in a 2-column grid --- */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    {/* Status Field */}
                                    <div>
                                        <label className="block font-semibold text-gray-700 mb-1">Status</label>
                                        <Form.Item name="status" className="mb-0">
                                            <Select placeholder="Select Status" size="large">
                                                <Option value="Pending">Pending</Option>
                                                <Option value="Approved">Approved</Option>
                                                <Option value="Declined">Declined</Option>
                                            </Select>
                                        </Form.Item>
                                    </div>

                                    {/* Balance Display */}
                                    <div className="p-3 bg-gray-50 border rounded flex justify-between items-center h-[50px] mt-7">
                                        <span className="font-semibold text-gray-700">Current Due Balance:</span>
                                        <span
                                            className={`font-bold text-lg ${customerBalance <= 0 ? 'text-green-600' : 'text-red-600'}`}
                                        >
                                            {customerBalance !== null ? `₹ ${customerBalance.toLocaleString("en-IN")}` : 'Loading...'}
                                        </span>
                                    </div>
                                </div>

                                {/* Hidden fields */}
                                <Form.Item name="enrollmentId" hidden>
                                    <Input />
                                </Form.Item>
                                <Form.Item name="groupId" hidden>
                                    <Input />
                                </Form.Item>

                                {/* --- BUTTONS SECTION - Now with more space --- */}
                                <div className="flex gap-4 pt-6 border-t mt-4">
                                    <Button
                                        onClick={handleCloseEditModal}
                                        className="flex-1 h-14 font-semibold border-gray-400 text-lg"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="primary"
                                        onClick={handleEditFinish}
                                        loading={loading}
                                        className="flex-1 bg-blue-700 hover:bg-blue-600 h-14 font-bold uppercase tracking-wide text-lg border-blue-700"
                                        icon={<EditOutlined />}
                                    >
                                        Update
                                    </Button>
                                    <Popconfirm
                                        title="Approve Request?"
                                        description="This will update the status to Approved and send a WhatsApp notification. Are you sure?"
                                        onConfirm={handleApprove}
                                        okText="Yes, Approve"
                                        cancelText="No"
                                    >
                                        <Button
                                            type="primary"
                                            loading={loading}
                                            className="flex-1 bg-green-700 hover:bg-green-600 h-14 font-bold uppercase tracking-wide text-lg border-green-700"
                                            icon={<CheckCircleOutlined />}
                                        >
                                            Approve
                                        </Button>
                                    </Popconfirm>
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