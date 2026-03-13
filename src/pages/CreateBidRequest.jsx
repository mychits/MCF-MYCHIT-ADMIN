import React, { useState, useEffect } from "react";
import { Form, Input, DatePicker, TimePicker, Button, Select, notification, Spin, Tag } from "antd";
import API from "../instance/TokenInstance";
import dayjs from "dayjs";

const { Option } = Select;

function CreateBidRequest() {
    const [api, contextHolder] = notification.useNotification();
    const [createForm] = Form.useForm();
    
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true); 
    const [loading, setLoading] = useState(false);
    const [createGroups, setCreateGroups] = useState([]);
    const [selectedCreateGroupIndex, setSelectedCreateGroupIndex] = useState(0);
    const [selectedEnrollmentId, setSelectedEnrollmentId] = useState(null);

    const fetchUsers = async () => {
        try {
            setLoadingUsers(true);
            const response = await API.get("/user/get-user");
            setUsers(response.data || []);
        } catch (error) {
            console.error("Error fetching users:", error);
            api.error({ message: "Error", description: "Failed to fetch users." });
        } finally {
            setLoadingUsers(false);
        }
    };

    const fetchAuctionInfo = async (groupId, userId, ticketNumber) => {
        if (!groupId) return { count: 0, isPrized: false };
        
        try {
   
            const response = await API.get(`/bid-request/get-group-auction-stats/${groupId}`);
            
            const data = response.data;

            if (!data || !data.success) {
                return { count: 0, isPrized: false };
            }

            const count = data.count || 0;

            const prizedList = data.prizedTickets || [];
            const isPrized = prizedList.some((item) => 
                String(item.user_id) === String(userId) && 
                String(item.ticket) === String(ticketNumber)
            );

            return { count, isPrized };
        } catch (error) { 
            console.error("Error fetching auction stats:", error);
            return { count: 0, isPrized: false }; 
        }
    };

    const fetchCreateCustomerDetails = async (userId) => {
        try {
            const response = await API.post(`/enroll/get-user-tickets-report/${userId}`);
            const dataList = response.data || response.data?.data || [];

            if (dataList && dataList.length > 0) {
                const groupsData = await Promise.all(dataList.map(async (item) => {
                    const enrollment = item?.enrollment;
                    const groupData = enrollment?.group;

                    const ticketNumber = enrollment?.tickets || enrollment?.ticket_number || "N/A";

                    const auctionInfo = await fetchAuctionInfo(groupData?._id, userId, ticketNumber);
                    
                    let referredType = "N/A";
                    let referredBy = "N/A";
                    let agentName = "N/A";

                    if (enrollment?.agent?.name) {
                        referredType = "Agent";
                        agentName = enrollment.agent.name;
                        referredBy = `${enrollment.agent.name} | ${enrollment.agent.phone_number}`;
                    } else if (groupData?.agent?.name) {
                        referredType = "Agent";
                        agentName = groupData.agent.name;
                        referredBy = `${groupData.agent.name} | ${groupData.agent.phone_number}`;
                    } else if (groupData?.referred_customer?.full_name) {
                        referredType = "Customer";
                        referredBy = `${groupData.referred_customer.full_name} | ${groupData.referred_customer.phone_number}`;
                    } else if (groupData?.referred_lead?.lead_name) {
                        referredType = "Lead";
                        referredBy = `${groupData.referred_lead.lead_name} | ${groupData.referred_lead.agent_number}`;
                    }

                    return {
                        id: groupData?._id,
                        groupName: groupData?.group_name || "No Group Name",
                        ticketNumber: ticketNumber,
                        startDate: groupData?.start_date ? groupData.start_date.split("T")[0] : "N/A",
                        endDate: groupData?.end_date ? groupData.end_date.split("T")[0] : "N/A",
                        auctionsDone: auctionInfo.count, 
                        enrollmentId: enrollment?._id,
                        isPrized: auctionInfo.isPrized, 
                        
                        agentName: agentName,
                        referredType: referredType,
                        referredBy: referredBy
                    };
                }));
                
                setCreateGroups(groupsData);
                
                const firstAvailableIndex = groupsData.findIndex(g => !g.isPrized);
                const initialIndex = firstAvailableIndex !== -1 ? firstAvailableIndex : 0;

                if (groupsData.length > 0) {
                    setSelectedCreateGroupIndex(initialIndex);
                    const group = groupsData[initialIndex];
                    setSelectedEnrollmentId(group.enrollmentId);
                    
                    createForm.setFieldsValue({
                        groupName: group.groupName,
                        ticketNumber: group.ticketNumber,
                        selectedGroupIndex: initialIndex,
                        startDate: group.startDate,
                        endDate: group.endDate,
                        auctionsDone: group.auctionsDone,
                        agentName: group.agentName,
                        referredType: group.referredType,
                        referredBy: group.referredBy
                    });

                    if (group.isPrized) {
                        api.warning({ 
                            message: "Ticket Already Prized", 
                            description: "This customer has prized tickets. Please select an available ticket." 
                        });
                    }
                }
            } else {
                api.warning({ 
                    message: "No Tickets Found", 
                    description: "This customer is not enrolled in any active groups." 
                });
                setCreateGroups([]);
                setSelectedEnrollmentId(null);
                createForm.setFieldsValue({ 
                    agentName: "N/A",
                    referredType: "N/A",
                    referredBy: "N/A" 
                });
            }
        } catch (error) {
            console.error("Error fetching customer details:", error);
            api.error({ 
                message: "Error Fetching Details", 
                description: "Could not load customer tickets. Please try again." 
            });
            setCreateGroups([]);
            setSelectedEnrollmentId(null);
        }
    };

    const handleCreateCustomerSelect = (userId) => {
        const selectedUser = users.find((u) => u._id === userId);
        if (selectedUser) {
            const cName = selectedUser.full_name || selectedUser.name;
            const cPhone = selectedUser.phone_number || selectedUser.mobile;
            createForm.setFieldsValue({
                subscriberName: cName,
                mobileNumber: cPhone,
                subscriberId: userId,
                groupName: "Loading...",
                ticketNumber: "Loading...",
                agentName: "Loading...",
                referredType: "Loading...",
                referredBy: "Loading..."
            });
            setCreateGroups([]);
            setSelectedCreateGroupIndex(0);
            setSelectedEnrollmentId(null);
            fetchCreateCustomerDetails(userId);
        }
    };

    const handleCreateGroupSelect = (index) => {
        setSelectedCreateGroupIndex(index);
        const selectedGroup = createGroups[index];
        if (selectedGroup) {
            setSelectedEnrollmentId(selectedGroup.enrollmentId);
            createForm.setFieldsValue({
                groupName: selectedGroup.groupName,
                ticketNumber: selectedGroup.ticketNumber,
                selectedGroupIndex: index,
                startDate: selectedGroup.startDate,
                endDate: selectedGroup.endDate,
                auctionsDone: selectedGroup.auctionsDone,
                agentName: selectedGroup.agentName,
                referredType: selectedGroup.referredType,
                referredBy: selectedGroup.referredBy
            });

            if (selectedGroup.isPrized) {
                api.error({ 
                    message: "Ticket Not Available", 
                    description: "This ticket is already prized. You cannot raise a request for it." 
                });
            }
        }
    };

    const handleCreateFinish = async (values) => {
        try {
            setLoading(true);
            const selectedGroup = createGroups[values.selectedGroupIndex || selectedCreateGroupIndex];
            
            if (!selectedGroup) {
                api.error({ message: "Error", description: "Please select a group first." });
                return;
            }

            if (selectedGroup.isPrized) {
                api.error({ 
                    message: "Request Denied", 
                    description: "This ticket is already prized. Bid request cannot be raised." 
                });
                setLoading(false);
                return;
            }

            const formattedTime = values.auctionTime ? values.auctionTime.format('HH:mm') : null;

            const payload = {
                date: values.date ? values.date.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
                subscriberId: values.subscriberId,
                subscriberName: values.subscriberName,
                mobileNumber: values.mobileNumber,
                groupName: selectedGroup.groupName,
                ticketNumber: selectedGroup.ticketNumber,
                auctionDate: values.auctionDate ? values.auctionDate.format('YYYY-MM-DD') : null,
                auction_time: formattedTime, 
                agentName: selectedGroup.agentName,
                referredType: selectedGroup.referredType,
                referredBy: selectedGroup.referredBy,
                groupId: selectedGroup.id,
                ...(selectedGroup.enrollmentId && { enrollmentId: selectedGroup.enrollmentId }),
            };

            const response = await API.post("/bid-request/create", payload);
            api.success({ 
                message: "Success", 
                description: "Bid Request submitted successfully!" 
            });
            
            setTimeout(() => window.close(), 1500); 
        } catch (error) {
            console.error("Error:", error);
            api.error({ 
                message: "Error", 
                description: error.response?.data?.message || "Failed to save request." 
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        createForm.setFieldsValue({ date: dayjs() });
    }, []);

    const isSubmitDisabled = createGroups.length === 0 || createGroups[selectedCreateGroupIndex]?.isPrized;

    return (
        <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
            {contextHolder}
            <div className="w-full max-w-4xl bg-white shadow-lg font-sans text-sm text-gray-800 rounded-lg">
                <div className="border-b-2 border-blue-900 p-6 mb-6 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-blue-900 uppercase tracking-wider">
                        New Bid Request
                    </h2>
                    <Button onClick={() => window.close()}>Close Tab</Button>
                </div>

                <div className="px-8 pb-8">
                    <Form form={createForm} layout="vertical" onFinish={handleCreateFinish}>
                        <div className="mb-8">
                            <h3 className="font-bold text-blue-900 mb-4 border-b pb-2 text-lg">
                                Subscriber Details
                            </h3>
                            
                            <div className="mb-5">
                                <label className="block font-semibold text-gray-700 mb-2">
                                    Search Customer (Name/Phone) <span className="text-red-500">*</span>
                                </label>
                               <Form.Item 
                                    name="subscriberId" 
                                    rules={[{ required: true, message: 'Please select a customer!' }]} 
                                    className="mb-0"
                                >
                                    <Select
                                        showSearch
                                        placeholder="Type name or phone number..."
                                        onChange={handleCreateCustomerSelect}
                                        loading={loadingUsers}
                                        notFoundContent={loadingUsers ? <Spin size="small" /> : "No customers found"}
                                        filterOption={(input, option) => 
                                            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                                        }
                                        options={users.map((user) => ({
                                            value: user._id,
                                            label: `${user.full_name || user.name || 'Unknown'} - ${user.phone_number || user.mobile || 'No Phone'}`,
                                        }))}
                                        size="large"
                                    />
                                </Form.Item>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">Subscriber Name</label>
                                    <Form.Item name="subscriberName" rules={[{ required: true, message: 'Required!' }]} className="mb-0">
                                        <Input readOnly className="bg-gray-100 border-gray-300" />
                                    </Form.Item>
                                </div>
                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">Mobile Number</label>
                                    <Form.Item name="mobileNumber" rules={[{ required: true, message: 'Required!' }]} className="mb-0">
                                        <Input readOnly className="bg-gray-100 border-gray-300" />
                                    </Form.Item>
                                </div>
                            </div>

                            {createGroups.length > 0 && (
                                <div className="space-y-4">
                                    <label className="block font-semibold text-gray-700 text-lg">
                                        Select Group for Bid Request <span className="text-red-500">*</span>
                                    </label>
                                    <Form.Item 
                                        name="selectedGroupIndex" 
                                        rules={[{ required: true, message: 'Please select a group!' }]} 
                                        className="mb-4" 
                                        initialValue={0}
                                    >
                                        <Select
                                            size="large"
                                            placeholder="Choose which group..."
                                            onChange={handleCreateGroupSelect}
                                            value={selectedCreateGroupIndex}
                                            className="w-full"
                                            dropdownStyle={{ maxHeight: '400px' }}
                                            optionLabelProp="label"
                                        >
                                            {createGroups.map((group, index) => (
                                                <Option 
                                                    key={group.id} 
                                                    value={index} 
                                                    label={`${group.groupName} (Ticket: ${group.ticketNumber})`}
                                                    className="py-3"
                                                    disabled={group.isPrized}
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-gray-900 text-base">{group.groupName}</span>
                                                            <span className="text-xs text-gray-500 mt-0.5">Ticket: {group.ticketNumber}</span>
                                                        </div>
                                                        {group.isPrized && (
                                                            <Tag color="error" className="ml-2 text-xs font-bold">
                                                                Already Prized
                                                            </Tag>
                                                        )}
                                                    </div>
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                        <div>
                                            <label className="block font-semibold text-gray-700 mb-1">Auction Start Date</label>
                                            <Form.Item name="startDate" className="mb-0">
                                                <Input readOnly className="bg-blue-50 border-blue-200 text-blue-900 font-semibold h-10" />
                                            </Form.Item>
                                        </div>
                                        <div>
                                            <label className="block font-semibold text-gray-700 mb-1">Auction End Date</label>
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

                                    {selectedEnrollmentId && (
                                        <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded">
                                            Enrollment ID: {selectedEnrollmentId}
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">Primary Group Name</label>
                                    <Form.Item name="groupName" className="mb-0">
                                        <Input readOnly className="bg-blue-50 border-blue-300 font-semibold" />
                                    </Form.Item>
                                </div>
                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">Primary Ticket Number</label>
                                    <Form.Item name="ticketNumber" className="mb-0">
                                        <Input readOnly className="bg-blue-50 border-blue-300 font-semibold" />
                                    </Form.Item>
                                </div>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h3 className="font-bold text-blue-900 mb-4 border-b pb-2 text-lg">
                                Auction Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">
                                        Auction Date <span className="text-red-500">*</span>
                                    </label>
                                    <Form.Item name="auctionDate" rules={[{ required: true, message: 'Please select auction date!' }]} className="mb-0">
                                        <DatePicker style={{ width: '100%' }} className="border-gray-400 h-10" placeholder="Select Auction Date" format="DD-MM-YYYY" />
                                    </Form.Item>
                                </div>
                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">
                                        Auction Time <span className="text-red-500">*</span>
                                    </label>
                                    <Form.Item name="auctionTime" rules={[{ required: true, message: 'Please select auction time!' }]} className="mb-0">
                                        <TimePicker style={{ width: '100%' }} className="border-gray-400 h-10" format="h:mm A" use12Hours placeholder="Select Time" />
                                    </Form.Item>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4 border-t">
                            <Button onClick={() => window.close()} className="flex-1 h-12 font-semibold border-gray-400 text-lg">Cancel</Button>
                            <Button 
                                type="primary" 
                                htmlType="submit" 
                                loading={loading} 
                                className="flex-1 bg-blue-900 hover:bg-blue-800 h-12 font-bold uppercase tracking-wide text-lg" 
                                disabled={isSubmitDisabled}
                            >
                                Submit Request
                            </Button>
                        </div>
                    </Form>
                </div>
            </div>
        </div>
    );
}

export default CreateBidRequest;