import { useState, useEffect } from "react";
import { Button, notification } from "antd";
import { PlusOutlined } from '@ant-design/icons';
import Sidebar from "../components/layouts/Sidebar";
import Navbar from "../components/layouts/Navbar";
import DataTable from "../components/layouts/Datatable";
import CircularLoader from "../components/loaders/CircularLoader";
import API from "../instance/TokenInstance";

function LoanRequest() {
    const [api, contextHolder] = notification.useNotification();
    const [rawLoans, setRawLoans] = useState([]);
    const [loadingTable, setLoadingTable] = useState(false);

    const handleOpenCreatePage = () => {
        window.open('/loan-request/create', '_blank', 'noopener,noreferrer');
    };

    // Refresh table when user focuses back on this tab (after closing create tab)
    useEffect(() => {
        const handleFocus = () => {
            fetchLoanRequests();
        };
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, []);

    const fetchLoanRequests = async () => {
        try {
            setLoadingTable(true);
            const response = await API.get("/loan-request/get-all");
            setRawLoans(response.data?.data || []);
        } catch (error) {
            setRawLoans([]);
        } finally {
            setLoadingTable(false);
        }
    };

    useEffect(() => {
        fetchLoanRequests();
    }, []);

    // Format data for table
    const formattedData = rawLoans.map((item, index) => ({
        id: index + 1,
        fullName: item.fullName,
        phoneNumber: item.phoneNumber,
        amount: item.amountOfLoan,
        purpose: item.purposeOfLoan,
        status: item.status,
        date: item.createdAt ? item.createdAt.split("T")[0] : "-",
    }));

    const columns = [
        { key: "id", header: "SL. NO" },
        { key: "date", header: "Request Date" },
        { key: "fullName", header: "Customer Name" },
        { key: "phoneNumber", header: "Phone Number" },
        { key: "amount", header: "Loan Amount" },
        { key: "purpose", header: "Purpose" },
        { key: "status", header: "Status" },
    ];

    return (
        <>
            {contextHolder}
            <Navbar />
            <div className="flex w-screen mt-14">
                <Sidebar />
                <div className="w-full p-4 min-h-[80vh]">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 mt-6">
                        <div className="text-center md:text-left space-y-2 ml-4">
                            <h1 className="text-3xl font-bold text-gray-800">Loan Management</h1>
                            <p className="text-gray-500">Manage loan requests and approvals</p>
                        </div>
                        <div>
                            <Button
                                type="primary"
                                size="large"
                                onClick={handleOpenCreatePage}
                                className="h-10 px-6 text-lg font-semibold bg-blue-800 hover:bg-blue-700 rounded-md shadow-lg mr-4"
                            >
                                + Loan Request
                            </Button>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-4 min-h-[400px]">
                        {loadingTable ? (
                            <CircularLoader isLoading={true} />
                        ) : rawLoans.length === 0 ? (
                            <CircularLoader isLoading={false} failure={true} data="Loan Requests" />
                        ) : (
                            <DataTable
                                data={formattedData}
                                columns={columns}
                                exportedFileName="Loan_Requests.csv"
                                exportedPdfName="Loan Requests.pdf"
                            />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default LoanRequest;