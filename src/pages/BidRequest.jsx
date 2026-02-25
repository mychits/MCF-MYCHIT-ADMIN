import { useState, useEffect, useMemo } from "react";
import { Form, Input, DatePicker, Button, Select, notification, Popconfirm, Statistic, Spin, Modal } from "antd";
import { EditOutlined, DeleteOutlined, CheckCircleOutlined, DollarOutlined, WhatsAppOutlined } from '@ant-design/icons';
import Sidebar from "../components/layouts/Sidebar";
import Navbar from "../components/layouts/Navbar";
import ModalComponent from "../components/modals/Modal";
import DataTable from "../components/layouts/Datatable";
import CircularLoader from "../components/loaders/CircularLoader";
import dayjs from "dayjs";
import API from "../instance/TokenInstance";


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

    // Store RAW data
    const [rawBidRequests, setRawBidRequests] = useState([]);
    const [loadingTable, setLoadingTable] = useState(false);

    const [editingId, setEditingId] = useState(null);
    const [customerBalance, setCustomerBalance] = useState(null);
    
    const [loadingBalance, setLoadingBalance] = useState(false);
    const [showBalance, setShowBalance] = useState(false);

    const [enrollmentReportData, setEnrollmentReportData] = useState([]);
    const [loadingReport, setLoadingReport] = useState(false);

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
            // Fetch enrollments/tickets for this user
            const response = await API.post(`/enroll/get-user-tickets-report/${userId}`);

            if (response.data && response.data.length > 0) {
                // Process data to match the structure needed for the Select dropdown
                const groupsDataPromise = response.data.map(async (item) => {
                    const enrollment = item?.enrollment;
                    const groupData = enrollment?.group;
                    const groupId = groupData?._id;
                    const auctionsDone = await fetchAuctionCount(groupId);

                    return {
                        id: groupId,
                        groupName: groupData?.group_name || "No Group Name",
                        ticketNumber: enrollment?.tickets || enrollment?.ticket_number || "N/A",
                        startDate: groupData?.start_date ? groupData.start_date.split("T")[0] : "N/A",
                        endDate: groupData?.end_date ? groupData.end_date.split("T")[0] : "N/A",
                        auctionsDone: auctionsDone,
                        fullEnrollment: enrollment,
                        enrollmentId: enrollment?._id // Crucial: Ensure we store the ID for comparison
                    };
                });

                const groupsData = await Promise.all(groupsDataPromise);

                // Save the list of groups to state for the dropdown
                setEditGroups(groupsData);

                // --- LOGIC TO AUTO-SELECT THE CORRECT GROUP ---
                if (groupsData.length > 0) {
                    let defaultIndex = 0;

                    // If we have a specific enrollmentId from the bid request, find it
                    if (selectedEnrollmentId) {
                        const foundIndex = groupsData.findIndex(g => g.enrollmentId === selectedEnrollmentId);
                        if (foundIndex !== -1) {
                            defaultIndex = foundIndex;
                        }
                    }

                    // Set the selected index state
                    setSelectedEditGroupIndex(defaultIndex);

                    // Update Form Fields with the selected group's details
                    const selectedGroup = groupsData[defaultIndex];
                    editForm.setFieldsValue({
                        groupName: selectedGroup.groupName,
                        ticketNumber: selectedGroup.ticketNumber,
                        selectedGroupIndex: defaultIndex,
                        startDate: selectedGroup.startDate,
                        endDate: selectedGroup.endDate,
                        auctionsDone: selectedGroup.auctionsDone
                    });
                }
            } else {
                // Handle case where user has no groups
                setEditGroups([]);
                editForm.setFieldsValue({
                    groupName: "No Groups Found",
                    ticketNumber: "N/A",
                    selectedGroupIndex: undefined
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
                auctionsDone: selectedGroup.auctionsDone
            });

            // Fetch balance for the NEWLY selected group
            await fetchCustomerBalance(selectedGroup.enrollmentId);
        }
    };

      const handleOpenEditModal = async (item) => {
        setOpenActionId(null);
        setEditingId(item._id);
        // setCustomerBalance(null);
        setShowBalance(true);
        setIsEditModalOpen(true);

        const userObj = typeof item.subscriberId === 'object' ? item.subscriberId : {};
        const userId = userObj._id || item.subscriberId;

        const nameToDisplay = userObj.full_name || userObj.name || item.subscriberName || item.userName || "";
        const phoneToDisplay = userObj.phone_number || userObj.mobile || item.mobileNumber || item.mobileNumberRaw || "";

        editForm.setFieldsValue({
            subscriberId: userId,
            subscriberName: nameToDisplay,
            mobileNumber: phoneToDisplay,
            auctionDate: item.auctionDate ? dayjs(item.auctionDate, "YYYY-MM-DD") : null,
        });

        // 1. Set initial visual balance from table (so user sees something immediately)
        setCustomerBalance( item.auctions?.balance || 0);
        // console.log(item);

        // 2. Fetch User Groups
        if (users.length === 0) await fetchUsers();
        await fetchEditCustomerDetails(userId, item.enrollmentId);

        // 3. Fetch ACTUAL Balance using the specific Enrollment ID from the Bid Request
        // We use item.enrollmentId directly to ensure we are checking the right ticket
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
            const selectedGroup = editGroups[values.selectedGroupIndex || selectedEditGroupIndex];
            const payload = {
                date: values.date ? values.date.format('YYYY-MM-DD') : null,
                subscriberId: values.subscriberId,
                subscriberName: values.subscriberName,
                mobileNumber: values.mobileNumber,
                groupName: selectedGroup?.groupName || values.groupName,
                ticketNumber: selectedGroup?.ticketNumber || values.ticketNumber,
                auctionDate: values.auctionDate ? values.auctionDate.format('YYYY-MM-DD') : null,
                groupId: selectedGroup?.id,
                enrollmentId: selectedGroup?.enrollmentId,
            };

            await API.put(`/bid-request/update/${editingId}`, payload);
            api.success({ message: "Updated", description: "Bid Request updated successfully!" });
            handleCloseEditModal();
            fetchBidRequests();
        } catch (error) {
            api.error({ message: "Error", description: "Failed to update request." });
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        try {
            setLoading(true);

            // 1. Identify the currently selected group
            const values = editForm.getFieldsValue();
            const selectedIndex = values.selectedGroupIndex !== undefined ? values.selectedGroupIndex : selectedEditGroupIndex;
            const selectedGroup = editGroups[selectedIndex];

            if (!selectedGroup) {
                api.error({ message: "Error", description: "Please select a valid group." });
                setLoading(false);
                return;
            }

            // 2. FETCH BALANCE
            await fetchCustomerBalance(selectedGroup.enrollmentId);

            if (customerBalance === null) {
                api.error({ message: "Error", description: "Could not verify balance. Please try again." });
                setLoading(false);
                return;
            }


            // Common Payload fields
            const commonPayload = {
                ...values,
                auctionDate: values.auctionDate ? values.auctionDate.format('YYYY-MM-DD') : null,
                groupId: selectedGroup?.id,
                groupName: selectedGroup?.groupName,
                ticketNumber: selectedGroup?.ticketNumber,
                enrollmentId: selectedGroup?.enrollmentId,
            };

            // Prepare WhatsApp Number
            const rawPhone = values.mobileNumber || values.phone || "";
            let phone = rawPhone.replace(/\D/g, '');
            if (phone.startsWith('91') && phone.length === 12) {
                phone = phone.substring(2);
            }

            // --- SCENARIO A: BALANCE IS NOT 0 (DECLINE) ---
            if (customerBalance > 0) {

                // 1. Update DB to "Declined"
                await API.put(`/bid-request/update/${editingId}`, {
                    ...commonPayload,
                    // status: "Declined"
                });

                // 2. Send WhatsApp "Declined" Message
                const message = `Hello ${values.subscriberName}, your bid request for Group: ${selectedGroup?.groupName} (Ticket: ${selectedGroup?.ticketNumber}) has been DECLINED due to outstanding balance of ${customerBalance}. Please clear your dues.`;

                if (phone.length === 10) {
                    const whatsappUrl = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;
                    window.open(whatsappUrl, '_blank');
                }

                // 3. Show Notification
                api.warning({
                    message: "Request Declined",
                    description: `Due to outstanding balance (${customerBalance}). Message sent.`
                });

                handleCloseEditModal();
                fetchBidRequests();
                return; // Stop execution here
            }

            // --- SCENARIO B: BALANCE IS 0 (APPROVE) ---
            if (customerBalance !== 0 || customerBalance == 0) {

                // 1. Update DB to "Approved"
                await API.put(`/bid-request/update/${editingId}`, {
                    ...commonPayload,
                    status: "Approved"
                });

                // 2. Send WhatsApp "Approved" Message
                const message = `Hello ${values.subscriberName}, your bid request for Group: ${selectedGroup?.groupName} (Ticket: ${selectedGroup?.ticketNumber}) has been APPROVED.`;

                if (phone.length === 10) {
                    const whatsappUrl = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;
                    window.open(whatsappUrl, '_blank');
                }

                // 3. Show Notification
                api.success({
                    message: "Approved",
                    description: "Bid Request approved successfully!"
                });

                handleCloseEditModal();
                fetchBidRequests();
            }

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

    const formattedBidData = useMemo(() => {
        return rawBidRequests.map((item, index) => {
            const userObject = item?.subscriberId || {};
            const groupObject = item?.groupId || {};

            // 1. Derive Table Data (with fallbacks)
            const userName = item.subscriberName || (typeof userObject === 'object' ? userObject.full_name : "N/A");
            const userPhone = item.mobileNumber || (typeof userObject === 'object' ? userObject.phone_number : "N/A");
            const userId = (typeof userObject === 'object') ? userObject._id : userObject;
            const customerId = (typeof userObject === 'object') ? (userObject.customer_id || "N/A") : "N/A";
            const groupName = item.groupName || (typeof groupObject === 'object' ? groupObject.group_name : "N/A");

            const auctions = item?.auctions || {};
            const balance = auctions?.balance || 0;

            return {
                // 2. SPREAD ITEM FIRST: This copies ALL raw fields from DB to the object
                ...item,

                // 3. Add specific fields for the Table (Visuals)
                id: index + 1,
                userName,
                groupName,
                customerId,
                mobileNumber: userPhone, // Formatted for table column
                date: item.createdAt ? item.createdAt.split("T")[0] : "-",
                ticketNumber: item.ticketNumber || "-",
                auctionDate: item.auctionDate ? item.auctionDate.split("T")[0] : "-", // Formatted for table
                status: item.status || "Pending",
                balanceValue: balance,

                // 4. Ensure Modal Keys are set (If DB didn't have them, use derived ones)
                subscriberName: item.subscriberName || userName,
                subscriberId: userId,
                enrollmentId: item.enrollmentId,
                mobileNumberRaw: item.mobileNumber || userPhone, // Ensure phone number is available for modal
                // groupName and ticketNumber are already included via ...item above

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
    }, [rawBidRequests, openActionId]);

    const columns = [
        { key: "id", header: "SL. NO" },
        { key: "date", header: "Request Date" },
        { key: "userName", header: "Subscriber Name" },
        { key: "customerId", header: "Customer Id" },
        { key: "groupName", header: "Group Name" },
        { key: "ticketNumber", header: "Ticket" },
        { key: "auctionDate", header: "Auction Date" },
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

                    <div className="bg-white rounded-lg shadow p-4 min-h-[400px]">
                        {loadingTable ? (
                            <CircularLoader isLoading={true} />
                        ) : rawBidRequests.length === 0 ? (
                            <CircularLoader isLoading={false} failure={true} data="Bid Requests" />
                        ) : (
                            <DataTable
                                data={formattedBidData}
                                columns={columns}
                                exportedFileName="Bid_Requests.csv"
                                exportedPdfName="Bid_Requests.pdf"
                            />
                        )}
                    </div>

                    <ModalComponent isVisible={isEditModalOpen} onClose={handleCloseEditModal}>
                        <div className="w-full max-w-5xl bg-white shadow-inner font-sans text-sm text-gray-800 rounded-lg">
                            <div className="border-b-2 border-blue-900 pb-4 mb-6">
                                <h2 className="text-center text-2xl font-bold text-blue-900 uppercase tracking-wider">
                                    Edit Bid Request
                                </h2>
                            </div>

                            <Form form={editForm} layout="vertical" className="px-6">

                                {/* --- SUBSCRIBER DETAILS SECTION --- */}
                                <div className="mb-6">
                                    <h3 className="font-bold text-blue-900 mb-3 border-b pb-1">Subscriber Details</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                                        {/* Name Input */}
                                        <div>
                                            <label className="block font-semibold text-gray-700 mb-1">Subscriber Name</label>
                                            <Form.Item name="subscriberName" className="mb-0">
                                                <Input readOnly className="bg-gray-100 border-gray-300 font-semibold" />
                                            </Form.Item>
                                        </div>
                                        {/* Phone Input */}
                                        <div>
                                            <label className="block font-semibold text-gray-700 mb-1">Mobile Number</label>
                                            <Form.Item name="mobileNumber" className="mb-0">
                                                <Input readOnly className="bg-gray-100 border-gray-300 font-semibold" />
                                            </Form.Item>
                                        </div>
                                    </div>

                                    {/* Group Selector Section */}
                                    {editGroups.length > 0 ? (
                                        <div className="space-y-3">
                                            <label className="block font-semibold text-gray-700">
                                                Select Group for Bid Request <span className="text-red-500">*</span>
                                            </label>
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

                                            {/* Group Details Display (Start/End Date, Auctions Done) */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
                                            </div>
                                        </div>
                                    ) : (
                                        // ✅ UPDATED: Added Spinner here
                                        <div className="text-center py-4 flex justify-center items-center">
                                            <Spin size="large" />
                                        </div>
                                    )}
                                </div>

                                {/* --- AUCTION DETAILS SECTION --- */}
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
                                    </div>
                                </div>

                                <div className="mb-4 p-3 bg-gray-50 border rounded flex justify-between items-center">
                                    <span className="font-semibold text-gray-700">Current Due Balance:</span>
                                    <span
                                        className={`font-bold text-lg ${customerBalance <= 0 ? 'text-green-600' : 'text-red-600'
                                            }`}
                                    >
                                        {customerBalance !== null ? customerBalance : 'Loading...'}
                                    </span>
                                </div>


                                {/* --- BUTTONS SECTION --- */}
                                <div className="flex gap-3 pt-4 border-t">
                                    <Button
                                        onClick={handleCloseEditModal}
                                        className="flex-1 h-12 font-semibold border-gray-400 text-lg"
                                    >
                                        Cancel
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
                                            className="flex-1 bg-green-700 hover:bg-green-600 h-12 font-bold uppercase tracking-wide text-lg border-green-700"
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