import React, { useState, useEffect } from "react";
import { Form, Input, DatePicker, Button, Select, notification, InputNumber, Divider } from "antd";
import API from "../instance/TokenInstance";
import dayjs from "dayjs";

const { Option } = Select;
const { TextArea } = Input;

function CreateLoanRequest() {
    const [api, contextHolder] = notification.useNotification();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    // Initialize Date
    useEffect(() => {
        form.setFieldsValue({ dateOfBirth: dayjs(), guarantorDob: dayjs() });
    }, []);

    const onFinish = async (values) => {
        try {
            setLoading(true);
            
            // Format dates
            const payload = {
                ...values,
                dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : null,
                guarantorDob: values.guarantorDob ? values.guarantorDob.format('YYYY-MM-DD') : null,
            };

            const response = await API.post("/loan-request/create", payload);
            
            api.success({ 
                message: "Success", 
                description: "Loan Request submitted successfully!" 
            });
            
            // Close tab after success
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

    return (
        <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
            {contextHolder}
            <div className="w-full max-w-4xl bg-white shadow-lg font-sans text-sm text-gray-800 rounded-lg">
                <div className="border-b-2 border-blue-900 p-6 mb-6 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-blue-900 uppercase tracking-wider">
                        New Loan Request
                    </h2>
                    <Button onClick={() => window.close()}>Close Tab</Button>
                </div>

                <div className="px-8 pb-8">
                    <Form form={form} layout="vertical" onFinish={onFinish}>
                        
                        {/* --- Personal Information --- */}
                        <div className="mb-8">
                            <h3 className="font-bold text-blue-900 mb-4 border-b pb-2 text-lg">
                                Personal Information
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Form.Item name="fullName" label="Full Name" rules={[{ required: true }]}>
                                    <Input placeholder="Enter full name" />
                                </Form.Item>
                                <Form.Item name="dateOfBirth" label="Date of Birth" rules={[{ required: true }]}>
                                    <DatePicker style={{ width: '100%' }} />
                                </Form.Item>
                                <Form.Item name="gender" label="Gender">
                                    <Select placeholder="Select Gender">
                                        <Option value="Male">Male</Option>
                                        <Option value="Female">Female</Option>
                                        <Option value="Other">Other</Option>
                                    </Select>
                                </Form.Item>
                                <Form.Item name="fathersName" label="Father's Name">
                                    <Input placeholder="Father's name" />
                                </Form.Item>
                                <Form.Item name="phoneNumber" label="Phone Number" rules={[{ required: true }]}>
                                    <Input placeholder="10 digit mobile number" />
                                </Form.Item>
                                <Form.Item name="amountOfLoan" label="Amount of Loan Required" rules={[{ required: true }]}>
                                    <InputNumber style={{ width: '100%' }} placeholder="0.00" prefix="₹" />
                                </Form.Item>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <Form.Item name="residenceAddress" label="Residence Address">
                                    <TextArea rows={2} placeholder="Full address" />
                                </Form.Item>
                                <Form.Item name="businessAddress" label="Business Address">
                                    <TextArea rows={2} placeholder="Office address" />
                                </Form.Item>
                                <Form.Item name="occupationIncome" label="Occupation & Income">
                                    <Input placeholder="e.g. Business - 50,000/month" />
                                </Form.Item>
                                <Form.Item name="purposeOfLoan" label="Purpose of Loan" rules={[{ required: true }]}>
                                    <Input placeholder="Why do you need the loan?" />
                                </Form.Item>
                                <Form.Item name="repaymentProcess" label="How Repayment is Processed">
                                    <Select placeholder="Select option">
                                        <Option value="Daily">Daily</Option>
                                        <Option value="Weekly">Weekly</Option>
                                        <Option value="Monthly">Monthly</Option>
                                        <Option value="Quarterly">Quarterly</Option>
                                    </Select>
                                </Form.Item>
                                <Form.Item name="signature" label="Signature (Type Name)">
                                    <Input placeholder="Type your full name as signature" />
                                </Form.Item>
                            </div>
                        </div>

                        <Divider style={{ borderColor: '#1e3a8a' }} />

                        {/* --- Second Party (Guarantor) --- */}
                        <div className="mb-8">
                            <h3 className="font-bold text-blue-900 mb-4 border-b pb-2 text-lg">
                                Second Party (Guarantor)
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Form.Item name="guarantorName" label="Name">
                                    <Input placeholder="Guarantor's full name" />
                                </Form.Item>
                                <Form.Item name="guarantorDob" label="Date of Birth">
                                    <DatePicker style={{ width: '100%' }} />
                                </Form.Item>
                                <Form.Item name="guarantorGender" label="Gender">
                                    <Select placeholder="Select Gender">
                                        <Option value="Male">Male</Option>
                                        <Option value="Female">Female</Option>
                                    </Select>
                                </Form.Item>
                                <Form.Item name="guarantorFathersName" label="Father's Name">
                                    <Input placeholder="Father's name" />
                                </Form.Item>
                                <Form.Item name="guarantorResidenceAddress" label="Residence Address">
                                    <TextArea rows={2} />
                                </Form.Item>
                                <Form.Item name="guarantorPhoneNumber" label="Phone Number">
                                    <Input placeholder="10 digit mobile number" />
                                </Form.Item>
                                <Form.Item name="guarantorBusinessAddress" label="Business Address">
                                    <TextArea rows={2} />
                                </Form.Item>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4 border-t">
                            <Button 
                                onClick={() => window.close()} 
                                className="flex-1 h-12 font-semibold border-gray-400 text-lg"
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="primary" 
                                htmlType="submit" 
                                loading={loading} 
                                className="flex-1 bg-blue-900 hover:bg-blue-800 h-12 font-bold uppercase tracking-wide text-lg"
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

export default CreateLoanRequest;