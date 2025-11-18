import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { BiPrinter } from "react-icons/bi";
import { useParams } from "react-router-dom";
import api from "../instance/TokenInstance";
import mychitsLogo from "../assets/images/mychits.png"; 

const Receipt = () => {
    const { id } = useParams()
    const [payment, setPayment] = useState({});
    const [loading, setLoading] = useState(true);
    const [theme, setTheme] = useState("classic"); // classic, modern, formal, colorful

    useEffect(() => {
        const fetchPayment = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/payment/get-payment-by-id/${id}`);
                if (response.data) {
                    console.log(response.data);
                    setPayment(response.data);
                } else {
                    setPayment({});
                }
            } catch (error) {
                console.error("Error fetching payment data:", error);
                setPayment({});
            } finally {
                setLoading(false);
            }
        };

        fetchPayment();
    }, [id]);

    useEffect(() => {
        console.log(payment);
    }, [payment]);

    const formatPayDate = (dateString) => {
        const date = new Date(dateString);
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    const handlePrint = async () => {
        const receiptElement = document.getElementById("receipt");
        const canvas = await html2canvas(receiptElement, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF("portrait", "mm", "a4");
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
        pdf.save("Receipt.pdf");
    };

    // Enhanced Classic Theme - Beautiful traditional receipt
    const ClassicTheme = () => (
        <div
            id="receipt"
            style={{
                width: "210mm",
                height: "297mm",
                padding: "15mm",
                backgroundColor: "#fafafa",
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                gap: "12mm",
            }}
        >
            {/* Customer Copy */}
            <div
                style={{
                    width: "48%",
                    backgroundColor: "#ffffff",
                    border: "1px solid #e0e0e0",
                    borderRadius: "10px",
                    padding: "20px",
                    boxShadow: "0 3px 10px rgba(0, 0, 0, 0.08)",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* Decorative header */}
                <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "5px",
                    background: "linear-gradient(90deg, #4a90e2, #7b68ee)",
                }}></div>
                
                {/* Logo and Company Info */}
                <div style={{ textAlign: "center", marginBottom: "20px", paddingTop: "10px" }}>
                    <div style={{
                        width: "70px",
                        height: "70px",
                        borderRadius: "50%",
                        backgroundColor: "#f8f9fa",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 12px",
                        border: "2px solid #e9ecef",
                    }}>
                        <img
                            src={mychitsLogo}
                            alt="Company Logo"
                            width="45"
                        />
                    </div>
                    <h1 style={{ 
                        margin: "0 0 5px", 
                        fontSize: "26px", 
                        fontWeight: "bold", 
                        color: "#2c3e50",
                        fontFamily: "'Georgia', serif",
                    }}>MY CHITS</h1>
                    <div style={{
                        fontSize: "11px",
                        color: "#6c757d",
                        lineHeight: "1.4",
                        maxWidth: "250px",
                        margin: "0 auto",
                    }}>
                        <p style={{ margin: "0" }}>No.11/36-25, 2nd Main, Kathriguppe Main Road,</p>
                        <p style={{ margin: "0" }}>Bangalore, 560085</p>
                        <p style={{ margin: "0", fontWeight: "bold" }}> 9483900777</p>
                    </div>
                </div>
                
                {/* Receipt Title with decorative line */}
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                    <div style={{
                        display: "inline-block",
                        padding: "8px 30px",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "20px",
                        border: "1px solid #e9ecef",
                        position: "relative",
                    }}>
                        <h2 style={{ 
                            margin: 0, 
                            fontSize: "18px", 
                            color: "#495057",
                            fontWeight: "600",
                            letterSpacing: "1px",
                        }}>RECEIPT</h2>
                    </div>
                </div>
                
                {/* Receipt Details */}
                <div style={{
                    backgroundColor: "#f8f9fa",
                    padding: "15px",
                    borderRadius: "8px",
                    marginBottom: "15px",
                    border: "1px solid #e9ecef",
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <span style={{ color: "#6c757d", fontSize: "13px" }}>Receipt No:</span>
                        <span style={{ 
                            fontWeight: "bold", 
                            fontSize: "14px", 
                            color: "#2c3e50",
                            fontFamily: "'Courier New', monospace",
                        }}>
                            {payment.receipt_no ? payment.receipt_no : payment.old_receipt_no}
                        </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#6c757d", fontSize: "13px" }}>Date:</span>
                        <span style={{ 
                            fontWeight: "bold", 
                            fontSize: "14px", 
                            color: "#2c3e50" 
                        }}>
                            {formatPayDate(payment.pay_date)}
                        </span>
                    </div>
                </div>
                
                {/* Customer Information */}
                <div style={{ marginBottom: "15px" }}>
                    <h3 style={{ 
                        margin: "0 0 10px", 
                        fontSize: "14px", 
                        color: "#495057",
                        borderBottom: "1px solid #e9ecef",
                        paddingBottom: "5px",
                    }}>Customer Details</h3>
                    <div style={{ paddingLeft: "10px" }}>
                        <p style={{ margin: "5px 0", fontSize: "13px", color: "#495057" }}>
                            <span style={{ fontWeight: "bold", color: "#2c3e50" }}>Name:</span> {payment?.user_id?.full_name}
                        </p>
                        <p style={{ margin: "5px 0", fontSize: "13px", color: "#495057" }}>
                            <span style={{ fontWeight: "bold", color: "#2c3e50" }}>Mobile:</span> {payment?.user_id?.phone_number}
                        </p>
                        <p style={{ margin: "5px 0", fontSize: "13px", color: "#495057" }}>
                            <span style={{ fontWeight: "bold", color: "#2c3e50" }}>Group:</span> {payment?.group_id?.group_name}
                        </p>
                        <p style={{ margin: "5px 0", fontSize: "13px", color: "#495057" }}>
                            <span style={{ fontWeight: "bold", color: "#2c3e50" }}>Ticket:</span> {payment?.ticket}
                        </p>
                    </div>
                </div>
                
                {/* Amount Section with emphasis */}
                <div style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    borderRadius: "8px",
                    padding: "15px",
                    marginBottom: "15px",
                    textAlign: "center",
                    boxShadow: "0 2px 8px rgba(102, 126, 234, 0.3)",
                }}>
                    <p style={{ 
                        margin: "0 0 5px", 
                        color: "#ffffff", 
                        fontSize: "14px",
                        fontWeight: "500",
                    }}>Amount Received</p>
                    <p style={{ 
                        margin: 0, 
                        color: "#ffffff", 
                        fontSize: "22px", 
                        fontWeight: "bold",
                    }}>₹{payment?.amount}</p>
                </div>
                
                {/* Payment Details */}
                <div style={{ marginBottom: "15px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <span style={{ color: "#6c757d", fontSize: "13px" }}>Payment Mode:</span>
                        <span style={{ 
                            fontWeight: "bold", 
                            fontSize: "14px", 
                            color: "#2c3e50",
                            textTransform: "uppercase",
                            fontSize: "12px",
                        }}>
                            {payment?.pay_type}
                        </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <span style={{ color: "#6c757d", fontSize: "13px" }}>Total Amount:</span>
                        <span style={{ 
                            fontWeight: "bold", 
                            fontSize: "14px", 
                            color: "#2c3e50" 
                        }}>
                            ₹{payment?.amount}
                        </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#6c757d", fontSize: "13px" }}>Collected by:</span>
                        <span style={{ 
                            fontWeight: "bold", 
                            fontSize: "14px", 
                            color: "#2c3e50" 
                        }}>
                            {payment?.collected_by?.name || "Admin"}
                        </span>
                    </div>
                </div>
                
                {/* Footer */}
                <div style={{ 
                    borderTop: "2px dashed #dee2e6", 
                    paddingTop: "10px", 
                    textAlign: "center",
                    marginTop: "10px",
                }}>
                    <p style={{ 
                        margin: 0, 
                        fontSize: "12px", 
                        color: "#6c757d",
                        fontStyle: "italic",
                    }}>Customer Copy</p>
                </div>
            </div>

            {/* Admin Copy */}
            <div
                style={{
                    width: "48%",
                    backgroundColor: "#ffffff",
                    border: "1px solid #e0e0e0",
                    borderRadius: "10px",
                    padding: "20px",
                    boxShadow: "0 3px 10px rgba(0, 0, 0, 0.08)",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* Decorative header */}
                <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "5px",
                    background: "linear-gradient(90deg, #28a745, #20c997)",
                }}></div>
                
                {/* Logo and Company Info */}
                <div style={{ textAlign: "center", marginBottom: "20px", paddingTop: "10px" }}>
                    <div style={{
                        width: "70px",
                        height: "70px",
                        borderRadius: "50%",
                        backgroundColor: "#f8f9fa",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 12px",
                        border: "2px solid #e9ecef",
                    }}>
                        <img
                            src={mychitsLogo}
                            alt="Company Logo"
                            width="45"
                        />
                    </div>
                    <h1 style={{ 
                        margin: "0 0 5px", 
                        fontSize: "26px", 
                        fontWeight: "bold", 
                        color: "#2c3e50",
                        fontFamily: "'Georgia', serif",
                    }}>MY CHITS</h1>
                    <div style={{
                        fontSize: "11px",
                        color: "#6c757d",
                        lineHeight: "1.4",
                        maxWidth: "250px",
                        margin: "0 auto",
                    }}>
                        <p style={{ margin: "0" }}>No.11/36-25, 2nd Main, Kathriguppe Main Road,</p>
                        <p style={{ margin: "0" }}>Bangalore, 560085</p>
                        <p style={{ margin: "0", fontWeight: "bold" }}> 9483900777</p>
                    </div>
                </div>
                
                {/* Receipt Title with decorative line */}
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                    <div style={{
                        display: "inline-block",
                        padding: "8px 30px",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "20px",
                        border: "1px solid #e9ecef",
                        position: "relative",
                    }}>
                        <h2 style={{ 
                            margin: 0, 
                            fontSize: "18px", 
                            color: "#495057",
                            fontWeight: "600",
                            letterSpacing: "1px",
                        }}>RECEIPT</h2>
                    </div>
                </div>
                
                {/* Receipt Details */}
                <div style={{
                    backgroundColor: "#f8f9fa",
                    padding: "15px",
                    borderRadius: "8px",
                    marginBottom: "15px",
                    border: "1px solid #e9ecef",
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <span style={{ color: "#6c757d", fontSize: "13px" }}>Receipt No:</span>
                        <span style={{ 
                            fontWeight: "bold", 
                            fontSize: "14px", 
                            color: "#2c3e50",
                            fontFamily: "'Courier New', monospace",
                        }}>
                            {payment.receipt_no ? payment.receipt_no : payment.old_receipt_no}
                        </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#6c757d", fontSize: "13px" }}>Date:</span>
                        <span style={{ 
                            fontWeight: "bold", 
                            fontSize: "14px", 
                            color: "#2c3e50" 
                        }}>
                            {formatPayDate(payment.pay_date)}
                        </span>
                    </div>
                </div>
                
                {/* Customer Information */}
                <div style={{ marginBottom: "15px" }}>
                    <h3 style={{ 
                        margin: "0 0 10px", 
                        fontSize: "14px", 
                        color: "#495057",
                        borderBottom: "1px solid #e9ecef",
                        paddingBottom: "5px",
                    }}>Customer Details</h3>
                    <div style={{ paddingLeft: "10px" }}>
                        <p style={{ margin: "5px 0", fontSize: "13px", color: "#495057" }}>
                            <span style={{ fontWeight: "bold", color: "#2c3e50" }}>Name:</span> {payment?.user_id?.full_name}
                        </p>
                        <p style={{ margin: "5px 0", fontSize: "13px", color: "#495057" }}>
                            <span style={{ fontWeight: "bold", color: "#2c3e50" }}>Mobile:</span> {payment?.user_id?.phone_number}
                        </p>
                        <p style={{ margin: "5px 0", fontSize: "13px", color: "#495057" }}>
                            <span style={{ fontWeight: "bold", color: "#2c3e50" }}>Group:</span> {payment?.group_id?.group_name}
                        </p>
                        <p style={{ margin: "5px 0", fontSize: "13px", color: "#495057" }}>
                            <span style={{ fontWeight: "bold", color: "#2c3e50" }}>Ticket:</span> {payment?.ticket}
                        </p>
                    </div>
                </div>
                
                {/* Amount Section with emphasis */}
                <div style={{
                    background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
                    borderRadius: "8px",
                    padding: "15px",
                    marginBottom: "15px",
                    textAlign: "center",
                    boxShadow: "0 2px 8px rgba(40, 167, 69, 0.3)",
                }}>
                    <p style={{ 
                        margin: "0 0 5px", 
                        color: "#ffffff", 
                        fontSize: "14px",
                        fontWeight: "500",
                    }}>Amount Received</p>
                    <p style={{ 
                        margin: 0, 
                        color: "#ffffff", 
                        fontSize: "22px", 
                        fontWeight: "bold",
                    }}>₹{payment?.amount}</p>
                </div>
                
                {/* Payment Details */}
                <div style={{ marginBottom: "15px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <span style={{ color: "#6c757d", fontSize: "13px" }}>Payment Mode:</span>
                        <span style={{ 
                            fontWeight: "bold", 
                            fontSize: "14px", 
                            color: "#2c3e50",
                            textTransform: "uppercase",
                            fontSize: "12px",
                        }}>
                            {payment?.pay_type}
                        </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <span style={{ color: "#6c757d", fontSize: "13px" }}>Total Amount:</span>
                        <span style={{ 
                            fontWeight: "bold", 
                            fontSize: "14px", 
                            color: "#2c3e50" 
                        }}>
                            ₹{payment?.amount}
                        </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#6c757d", fontSize: "13px" }}>Collected by:</span>
                        <span style={{ 
                            fontWeight: "bold", 
                            fontSize: "14px", 
                            color: "#2c3e50" 
                        }}>
                            {payment?.collected_by?.name || "Admin"}
                        </span>
                    </div>
                </div>
                
                {/* Footer */}
                <div style={{ 
                    borderTop: "2px dashed #dee2e6", 
                    paddingTop: "10px", 
                    textAlign: "center",
                    marginTop: "10px",
                }}>
                    <p style={{ 
                        margin: 0, 
                        fontSize: "12px", 
                        color: "#6c757d",
                        fontStyle: "italic",
                    }}>Admin Copy</p>
                </div>
            </div>
        </div>
    );

    // Modern Theme - Clean and minimalist
    const ModernTheme = () => (
        <div
            id="receipt"
            style={{
                width: "210mm",
                height: "297mm",
                padding: "10mm",
                backgroundColor: "#f8f9fa",
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                gap: "10mm",
            }}
        >
            {/* Customer Copy */}
            <div
                style={{
                    width: "48%",
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    padding: "20px",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
                    <img
                        src={mychitsLogo}
                        alt="Company Logo"
                        width="50"
                        style={{ marginRight: "10px" }}
                    />
                    <div>
                        <h2 style={{ margin: 0, color: "#2c3e50", fontSize: "24px" }}>MY CHITS</h2>
                        <p style={{ margin: 0, fontSize: "11px", color: "#7f8c8d" }}>
                            No.11/36-25, 2nd Main, Kathriguppe Main Road, Bangalore, 560085
                        </p>
                    </div>
                </div>
                
                <div style={{ 
                    backgroundColor: "#3498db", 
                    color: "white", 
                    padding: "10px", 
                    borderRadius: "8px", 
                    textAlign: "center",
                    marginBottom: "20px"
                }}>
                    <h3 style={{ margin: 0, fontSize: "18px" }}>PAYMENT RECEIPT</h3>
                </div>
                
                <div style={{ marginBottom: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                        <span style={{ color: "#7f8c8d", fontSize: "14px" }}>Receipt No:</span>
                        <span style={{ fontWeight: "bold", fontSize: "14px" }}>
                            {payment.receipt_no ? payment.receipt_no : payment.old_receipt_no}
                        </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                        <span style={{ color: "#7f8c8d", fontSize: "14px" }}>Date:</span>
                        <span style={{ fontWeight: "bold", fontSize: "14px" }}>{formatPayDate(payment.pay_date)}</span>
                    </div>
                </div>
                
                <div style={{ 
                    backgroundColor: "#f8f9fa", 
                    padding: "15px", 
                    borderRadius: "8px", 
                    marginBottom: "20px" 
                }}>
                    <p style={{ margin: "0 0 5px", fontSize: "14px" }}>
                        <strong>Name:</strong> {payment?.user_id?.full_name}
                    </p>
                    <p style={{ margin: "0 0 5px", fontSize: "14px" }}>
                        <strong>Mobile:</strong> {payment?.user_id?.phone_number}
                    </p>
                    <p style={{ margin: "0 0 5px", fontSize: "14px" }}>
                        <strong>Group:</strong> {payment?.group_id?.group_name}
                    </p>
                    <p style={{ margin: "0", fontSize: "14px" }}>
                        <strong>Ticket:</strong> {payment?.ticket}
                    </p>
                </div>
                
                <div style={{ 
                    backgroundColor: "#e8f4fc", 
                    borderLeft: "4px solid #3498db", 
                    padding: "15px", 
                    marginBottom: "20px" 
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "16px", fontWeight: "bold", color: "#2c3e50" }}>Amount Received</span>
                        <span style={{ fontSize: "20px", fontWeight: "bold", color: "#3498db" }}>
                            Rs. {payment?.amount}
                        </span>
                    </div>
                </div>
                
                <div style={{ marginBottom: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                        <span style={{ color: "#7f8c8d", fontSize: "14px" }}>Payment Mode:</span>
                        <span style={{ fontWeight: "bold", fontSize: "14px" }}>{payment?.pay_type}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                        <span style={{ color: "#7f8c8d", fontSize: "14px" }}>Total:</span>
                        <span style={{ fontWeight: "bold", fontSize: "14px" }}>Rs. {payment?.amount}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#7f8c8d", fontSize: "14px" }}>Collected by:</span>
                        <span style={{ fontWeight: "bold", fontSize: "14px" }}>
                            {payment?.collected_by?.name || "Admin"}
                        </span>
                    </div>
                </div>
                
                <div style={{ 
                    borderTop: "1px dashed #bdc3c7", 
                    paddingTop: "10px", 
                    textAlign: "center",
                    color: "#7f8c8d",
                    fontSize: "14px"
                }}>
                    Customer Copy
                </div>
            </div>

            {/* Admin Copy */}
            <div
                style={{
                    width: "48%",
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    padding: "20px",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
                    <img
                        src={mychitsLogo}
                        alt="Company Logo"
                        width="50"
                        style={{ marginRight: "10px" }}
                    />
                    <div>
                        <h2 style={{ margin: 0, color: "#2c3e50", fontSize: "24px" }}>MY CHITS</h2>
                        <p style={{ margin: 0, fontSize: "11px", color: "#7f8c8d" }}>
                            No.11/36-25, 2nd Main, Kathriguppe Main Road, Bangalore, 560085
                        </p>
                    </div>
                </div>
                
                <div style={{ 
                    backgroundColor: "#3498db", 
                    color: "white", 
                    padding: "10px", 
                    borderRadius: "8px", 
                    textAlign: "center",
                    marginBottom: "20px"
                }}>
                    <h3 style={{ margin: 0, fontSize: "18px" }}>PAYMENT RECEIPT</h3>
                </div>
                
                <div style={{ marginBottom: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                        <span style={{ color: "#7f8c8d", fontSize: "14px" }}>Receipt No:</span>
                        <span style={{ fontWeight: "bold", fontSize: "14px" }}>
                            {payment.receipt_no ? payment.receipt_no : payment.old_receipt_no}
                        </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                        <span style={{ color: "#7f8c8d", fontSize: "14px" }}>Date:</span>
                        <span style={{ fontWeight: "bold", fontSize: "14px" }}>{formatPayDate(payment.pay_date)}</span>
                    </div>
                </div>
                
                <div style={{ 
                    backgroundColor: "#f8f9fa", 
                    padding: "15px", 
                    borderRadius: "8px", 
                    marginBottom: "20px" 
                }}>
                    <p style={{ margin: "0 0 5px", fontSize: "14px" }}>
                        <strong>Name:</strong> {payment?.user_id?.full_name}
                    </p>
                    <p style={{ margin: "0 0 5px", fontSize: "14px" }}>
                        <strong>Mobile:</strong> {payment?.user_id?.phone_number}
                    </p>
                    <p style={{ margin: "0 0 5px", fontSize: "14px" }}>
                        <strong>Group:</strong> {payment?.group_id?.group_name}
                    </p>
                    <p style={{ margin: "0", fontSize: "14px" }}>
                        <strong>Ticket:</strong> {payment?.ticket}
                    </p>
                </div>
                
                <div style={{ 
                    backgroundColor: "#e8f4fc", 
                    borderLeft: "4px solid #3498db", 
                    padding: "15px", 
                    marginBottom: "20px" 
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "16px", fontWeight: "bold", color: "#2c3e50" }}>Amount Received</span>
                        <span style={{ fontSize: "20px", fontWeight: "bold", color: "#3498db" }}>
                            Rs. {payment?.amount}
                        </span>
                    </div>
                </div>
                
                <div style={{ marginBottom: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                        <span style={{ color: "#7f8c8d", fontSize: "14px" }}>Payment Mode:</span>
                        <span style={{ fontWeight: "bold", fontSize: "14px" }}>{payment?.pay_type}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                        <span style={{ color: "#7f8c8d", fontSize: "14px" }}>Total:</span>
                        <span style={{ fontWeight: "bold", fontSize: "14px" }}>Rs. {payment?.amount}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#7f8c8d", fontSize: "14px" }}>Collected by:</span>
                        <span style={{ fontWeight: "bold", fontSize: "14px" }}>
                            {payment?.collected_by?.name || "Admin"}
                        </span>
                    </div>
                </div>
                
                <div style={{ 
                    borderTop: "1px dashed #bdc3c7", 
                    paddingTop: "10px", 
                    textAlign: "center",
                    color: "#7f8c8d",
                    fontSize: "14px"
                }}>
                    Admin Copy
                </div>
            </div>
        </div>
    );

    // Formal Theme - Professional business style
    const FormalTheme = () => (
        <div
            id="receipt"
            style={{
                width: "210mm",
                height: "297mm",
                padding: "10mm",
                backgroundColor: "#fff",
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                gap: "10mm",
            }}
        >
            {/* Customer Copy */}
            <div
                style={{
                    width: "48%",
                    border: "2px solid #2c3e50",
                    padding: "20px",
                    fontFamily: "serif",
                }}
            >
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                    <img
                        src={mychitsLogo}
                        alt="Company Logo"
                        width="60"
                        style={{ marginBottom: "10px" }}
                    />
                    <h1 style={{ margin: "0", fontSize: "22px", fontWeight: "bold" }}>MY CHITS</h1>
                    <p style={{ margin: "5px 0", fontSize: "12px" }}>
                        No.11/36-25, 2nd Main, Kathriguppe Main Road,<br />
                        Bangalore, 560085<br />
                        Phone: 9483900777
                    </p>
                </div>
                
                <div style={{ 
                    borderTop: "2px solid #2c3e50", 
                    borderBottom: "2px solid #2c3e50", 
                    padding: "10px 0", 
                    textAlign: "center",
                    marginBottom: "20px"
                }}>
                    <h2 style={{ margin: "0", fontSize: "18px" }}>OFFICIAL RECEIPT</h2>
                </div>
                
                <table style={{ width: "100%", marginBottom: "20px", borderCollapse: "collapse" }}>
                    <tbody>
                        <tr>
                            <td style={{ padding: "5px", width: "40%", fontSize: "14px" }}>Receipt No:</td>
                            <td style={{ padding: "5px", fontSize: "14px", fontWeight: "bold" }}>
                                {payment.receipt_no ? payment.receipt_no : payment.old_receipt_no}
                            </td>
                        </tr>
                        <tr>
                            <td style={{ padding: "5px", fontSize: "14px" }}>Date:</td>
                            <td style={{ padding: "5px", fontSize: "14px", fontWeight: "bold" }}>
                                {formatPayDate(payment.pay_date)}
                            </td>
                        </tr>
                    </tbody>
                </table>
                
                <table style={{ width: "100%", marginBottom: "20px", borderCollapse: "collapse" }}>
                    <tbody>
                        <tr>
                            <td style={{ padding: "5px", width: "40%", fontSize: "14px" }}>Customer Name:</td>
                            <td style={{ padding: "5px", fontSize: "14px" }}>{payment?.user_id?.full_name}</td>
                        </tr>
                        <tr>
                            <td style={{ padding: "5px", fontSize: "14px" }}>Mobile Number:</td>
                            <td style={{ padding: "5px", fontSize: "14px" }}>{payment?.user_id?.phone_number}</td>
                        </tr>
                        <tr>
                            <td style={{ padding: "5px", fontSize: "14px" }}>Group Name:</td>
                            <td style={{ padding: "5px", fontSize: "14px" }}>{payment?.group_id?.group_name}</td>
                        </tr>
                        <tr>
                            <td style={{ padding: "5px", fontSize: "14px" }}>Ticket Number:</td>
                            <td style={{ padding: "5px", fontSize: "14px" }}>{payment?.ticket}</td>
                        </tr>
                    </tbody>
                </table>
                
                <table style={{ width: "100%", marginBottom: "20px", borderCollapse: "collapse" }}>
                    <tbody>
                        <tr>
                            <td style={{ padding: "5px", width: "40%", fontSize: "14px" }}>Payment Mode:</td>
                            <td style={{ padding: "5px", fontSize: "14px" }}>{payment?.pay_type}</td>
                        </tr>
                        <tr>
                            <td style={{ padding: "5px", fontSize: "14px" }}>Amount Received:</td>
                            <td style={{ padding: "5px", fontSize: "16px", fontWeight: "bold" }}>
                                Rs. {payment?.amount}
                            </td>
                        </tr>
                        <tr>
                            <td style={{ padding: "5px", fontSize: "14px" }}>Collected By:</td>
                            <td style={{ padding: "5px", fontSize: "14px" }}>
                                {payment?.collected_by?.name || "Admin"}
                            </td>
                        </tr>
                    </tbody>
                </table>
                
                <div style={{ 
                    borderTop: "1px dashed #2c3e50", 
                    paddingTop: "10px", 
                    textAlign: "center",
                    marginTop: "30px"
                }}>
                    <p style={{ margin: "0", fontSize: "14px", fontStyle: "italic" }}>Customer Copy</p>
                </div>
            </div>

            {/* Admin Copy */}
            <div
                style={{
                    width: "48%",
                    border: "2px solid #2c3e50",
                    padding: "20px",
                    fontFamily: "serif",
                }}
            >
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                    <img
                        src={mychitsLogo}
                        alt="Company Logo"
                        width="60"
                        style={{ marginBottom: "10px" }}
                    />
                    <h1 style={{ margin: "0", fontSize: "22px", fontWeight: "bold" }}>MY CHITS</h1>
                    <p style={{ margin: "5px 0", fontSize: "12px" }}>
                        No.11/36-25, 2nd Main, Kathriguppe Main Road,<br />
                        Bangalore, 560085<br />
                        Phone: 9483900777
                    </p>
                </div>
                
                <div style={{ 
                    borderTop: "2px solid #2c3e50", 
                    borderBottom: "2px solid #2c3e50", 
                    padding: "10px 0", 
                    textAlign: "center",
                    marginBottom: "20px"
                }}>
                    <h2 style={{ margin: "0", fontSize: "18px" }}>OFFICIAL RECEIPT</h2>
                </div>
                
                <table style={{ width: "100%", marginBottom: "20px", borderCollapse: "collapse" }}>
                    <tbody>
                        <tr>
                            <td style={{ padding: "5px", width: "40%", fontSize: "14px" }}>Receipt No:</td>
                            <td style={{ padding: "5px", fontSize: "14px", fontWeight: "bold" }}>
                                {payment.receipt_no ? payment.receipt_no : payment.old_receipt_no}
                            </td>
                        </tr>
                        <tr>
                            <td style={{ padding: "5px", fontSize: "14px" }}>Date:</td>
                            <td style={{ padding: "5px", fontSize: "14px", fontWeight: "bold" }}>
                                {formatPayDate(payment.pay_date)}
                            </td>
                        </tr>
                    </tbody>
                </table>
                
                <table style={{ width: "100%", marginBottom: "20px", borderCollapse: "collapse" }}>
                    <tbody>
                        <tr>
                            <td style={{ padding: "5px", width: "40%", fontSize: "14px" }}>Customer Name:</td>
                            <td style={{ padding: "5px", fontSize: "14px" }}>{payment?.user_id?.full_name}</td>
                        </tr>
                        <tr>
                            <td style={{ padding: "5px", fontSize: "14px" }}>Mobile Number:</td>
                            <td style={{ padding: "5px", fontSize: "14px" }}>{payment?.user_id?.phone_number}</td>
                        </tr>
                        <tr>
                            <td style={{ padding: "5px", fontSize: "14px" }}>Group Name:</td>
                            <td style={{ padding: "5px", fontSize: "14px" }}>{payment?.group_id?.group_name}</td>
                        </tr>
                        <tr>
                            <td style={{ padding: "5px", fontSize: "14px" }}>Ticket Number:</td>
                            <td style={{ padding: "5px", fontSize: "14px" }}>{payment?.ticket}</td>
                        </tr>
                    </tbody>
                </table>
                
                <table style={{ width: "100%", marginBottom: "20px", borderCollapse: "collapse" }}>
                    <tbody>
                        <tr>
                            <td style={{ padding: "5px", width: "40%", fontSize: "14px" }}>Payment Mode:</td>
                            <td style={{ padding: "5px", fontSize: "14px" }}>{payment?.pay_type}</td>
                        </tr>
                        <tr>
                            <td style={{ padding: "5px", fontSize: "14px" }}>Amount Received:</td>
                            <td style={{ padding: "5px", fontSize: "16px", fontWeight: "bold" }}>
                                Rs. {payment?.amount}
                            </td>
                        </tr>
                        <tr>
                            <td style={{ padding: "5px", fontSize: "14px" }}>Collected By:</td>
                            <td style={{ padding: "5px", fontSize: "14px" }}>
                                {payment?.collected_by?.name || "Admin"}
                            </td>
                        </tr>
                    </tbody>
                </table>
                
                <div style={{ 
                    borderTop: "1px dashed #2c3e50", 
                    paddingTop: "10px", 
                    textAlign: "center",
                    marginTop: "30px"
                }}>
                    <p style={{ margin: "0", fontSize: "14px", fontStyle: "italic" }}>Admin Copy</p>
                </div>
            </div>
        </div>
    );

    // Colorful Theme - Vibrant and eye-catching
    const ColorfulTheme = () => (
        <div
            id="receipt"
            style={{
                width: "210mm",
                height: "297mm",
                padding: "10mm",
                backgroundColor: "#f0f2f5",
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                gap: "10mm",
            }}
        >
            {/* Customer Copy */}
            <div
                style={{
                    width: "48%",
                    borderRadius: "15px",
                    overflow: "hidden",
                    boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                }}
            >
                <div style={{ backgroundColor: "#ffffff", padding: "20px" }}>
                    <div style={{ textAlign: "center", marginBottom: "15px" }}>
                        <div style={{ 
                            backgroundColor: "#667eea", 
                            width: "80px", 
                            height: "80px", 
                            borderRadius: "50%", 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center",
                            margin: "0 auto 10px"
                        }}>
                            <img
                                src={mychitsLogo}
                                alt="Company Logo"
                                width="50"
                            />
                        </div>
                        <h1 style={{ margin: "0", color: "#764ba2", fontSize: "24px" }}>MY CHITS</h1>
                        <p style={{ margin: "5px 0", fontSize: "11px", color: "#666" }}>
                            No.11/36-25, 2nd Main, Kathriguppe Main Road,<br />
                            Bangalore, 560085<br />
                            Phone: 9483900777
                        </p>
                    </div>
                    
                    <div style={{ 
                        backgroundColor: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)", 
                        padding: "10px", 
                        borderRadius: "10px", 
                        textAlign: "center",
                        marginBottom: "15px"
                    }}>
                        <h2 style={{ margin: "0", color: "#ffffff", fontSize: "18px" }}>PAYMENT RECEIPT</h2>
                    </div>
                    
                    <div style={{ marginBottom: "15px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                            <span style={{ color: "#666", fontSize: "14px" }}>Receipt No:</span>
                            <span style={{ fontWeight: "bold", fontSize: "14px", color: "#764ba2" }}>
                                {payment.receipt_no ? payment.receipt_no : payment.old_receipt_no}
                            </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "#666", fontSize: "14px" }}>Date:</span>
                            <span style={{ fontWeight: "bold", fontSize: "14px", color: "#764ba2" }}>
                                {formatPayDate(payment.pay_date)}
                            </span>
                        </div>
                    </div>
                    
                    <div style={{ 
                        backgroundColor: "#f9f9f9", 
                        padding: "15px", 
                        borderRadius: "10px", 
                        marginBottom: "15px" 
                    }}>
                        <p style={{ margin: "0 0 8px", fontSize: "14px", color: "#333" }}>
                            <span style={{ color: "#667eea", fontWeight: "bold" }}>Name:</span> {payment?.user_id?.full_name}
                        </p>
                        <p style={{ margin: "0 0 8px", fontSize: "14px", color: "#333" }}>
                            <span style={{ color: "#667eea", fontWeight: "bold" }}>Mobile:</span> {payment?.user_id?.phone_number}
                        </p>
                        <p style={{ margin: "0 0 8px", fontSize: "14px", color: "#333" }}>
                            <span style={{ color: "#667eea", fontWeight: "bold" }}>Group:</span> {payment?.group_id?.group_name}
                        </p>
                        <p style={{ margin: "0", fontSize: "14px", color: "#333" }}>
                            <span style={{ color: "#667eea", fontWeight: "bold" }}>Ticket:</span> {payment?.ticket}
                        </p>
                    </div>
                    
                    <div style={{ 
                        background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)", 
                        padding: "15px", 
                        borderRadius: "10px", 
                        marginBottom: "15px",
                        textAlign: "center"
                    }}>
                        <p style={{ margin: "0", color: "#ffffff", fontSize: "16px" }}>Amount Received</p>
                        <p style={{ margin: "5px 0 0", color: "#ffffff", fontSize: "22px", fontWeight: "bold" }}>
                            Rs. {payment?.amount}
                        </p>
                    </div>
                    
                    <div style={{ marginBottom: "15px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                            <span style={{ color: "#666", fontSize: "14px" }}>Payment Mode:</span>
                            <span style={{ fontWeight: "bold", fontSize: "14px", color: "#764ba2" }}>
                                {payment?.pay_type}
                            </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                            <span style={{ color: "#666", fontSize: "14px" }}>Total:</span>
                            <span style={{ fontWeight: "bold", fontSize: "14px", color: "#764ba2" }}>
                                Rs. {payment?.amount}
                            </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "#666", fontSize: "14px" }}>Collected by:</span>
                            <span style={{ fontWeight: "bold", fontSize: "14px", color: "#764ba2" }}>
                                {payment?.collected_by?.name || "Admin"}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div style={{ 
                    backgroundColor: "#667eea", 
                    padding: "10px", 
                    textAlign: "center"
                }}>
                    <p style={{ margin: "0", color: "#ffffff", fontSize: "14px" }}>Customer Copy</p>
                </div>
            </div>

            {/* Admin Copy */}
            <div
                style={{
                    width: "48%",
                    borderRadius: "15px",
                    overflow: "hidden",
                    boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)",
                    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                }}
            >
                <div style={{ backgroundColor: "#ffffff", padding: "20px" }}>
                    <div style={{ textAlign: "center", marginBottom: "15px" }}>
                        <div style={{ 
                            backgroundColor: "#f093fb", 
                            width: "80px", 
                            height: "80px", 
                            borderRadius: "50%", 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center",
                            margin: "0 auto 10px"
                        }}>
                            <img
                                src={mychitsLogo}
                                alt="Company Logo"
                                width="50"
                            />
                        </div>
                        <h1 style={{ margin: "0", color: "#f5576c", fontSize: "24px" }}>MY CHITS</h1>
                        <p style={{ margin: "5px 0", fontSize: "11px", color: "#666" }}>
                            No.11/36-25, 2nd Main, Kathriguppe Main Road,<br />
                            Bangalore, 560085<br />
                            Phone: 9483900777
                        </p>
                    </div>
                    
                    <div style={{ 
                        backgroundColor: "linear-gradient(90deg, #f093fb 0%, #f5576c 100%)", 
                        padding: "10px", 
                        borderRadius: "10px", 
                        textAlign: "center",
                        marginBottom: "15px"
                    }}>
                        <h2 style={{ margin: "0", color: "#ffffff", fontSize: "18px" }}>PAYMENT RECEIPT</h2>
                    </div>
                    
                    <div style={{ marginBottom: "15px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                            <span style={{ color: "#666", fontSize: "14px" }}>Receipt No:</span>
                            <span style={{ fontWeight: "bold", fontSize: "14px", color: "#f5576c" }}>
                                {payment.receipt_no ? payment.receipt_no : payment.old_receipt_no}
                            </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "#666", fontSize: "14px" }}>Date:</span>
                            <span style={{ fontWeight: "bold", fontSize: "14px", color: "#f5576c" }}>
                                {formatPayDate(payment.pay_date)}
                            </span>
                        </div>
                    </div>
                    
                    <div style={{ 
                        backgroundColor: "#f9f9f9", 
                        padding: "15px", 
                        borderRadius: "10px", 
                        marginBottom: "15px" 
                    }}>
                        <p style={{ margin: "0 0 8px", fontSize: "14px", color: "#333" }}>
                            <span style={{ color: "#f093fb", fontWeight: "bold" }}>Name:</span> {payment?.user_id?.full_name}
                        </p>
                        <p style={{ margin: "0 0 8px", fontSize: "14px", color: "#333" }}>
                            <span style={{ color: "#f093fb", fontWeight: "bold" }}>Mobile:</span> {payment?.user_id?.phone_number}
                        </p>
                        <p style={{ margin: "0 0 8px", fontSize: "14px", color: "#333" }}>
                            <span style={{ color: "#f093fb", fontWeight: "bold" }}>Group:</span> {payment?.group_id?.group_name}
                        </p>
                        <p style={{ margin: "0", fontSize: "14px", color: "#333" }}>
                            <span style={{ color: "#f093fb", fontWeight: "bold" }}>Ticket:</span> {payment?.ticket}
                        </p>
                    </div>
                    
                    <div style={{ 
                        background: "linear-gradient(90deg, #f093fb 0%, #f5576c 100%)", 
                        padding: "15px", 
                        borderRadius: "10px", 
                        marginBottom: "15px",
                        textAlign: "center"
                    }}>
                        <p style={{ margin: "0", color: "#ffffff", fontSize: "16px" }}>Amount Received</p>
                        <p style={{ margin: "5px 0 0", color: "#ffffff", fontSize: "22px", fontWeight: "bold" }}>
                            Rs. {payment?.amount}
                        </p>
                    </div>
                    
                    <div style={{ marginBottom: "15px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                            <span style={{ color: "#666", fontSize: "14px" }}>Payment Mode:</span>
                            <span style={{ fontWeight: "bold", fontSize: "14px", color: "#f5576c" }}>
                                {payment?.pay_type}
                            </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                            <span style={{ color: "#666", fontSize: "14px" }}>Total:</span>
                            <span style={{ fontWeight: "bold", fontSize: "14px", color: "#f5576c" }}>
                                Rs. {payment?.amount}
                            </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "#666", fontSize: "14px" }}>Collected by:</span>
                            <span style={{ fontWeight: "bold", fontSize: "14px", color: "#f5576c" }}>
                                {payment?.collected_by?.name || "Admin"}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div style={{ 
                    backgroundColor: "#f093fb", 
                    padding: "10px", 
                    textAlign: "center"
                }}>
                    <p style={{ margin: "0", color: "#ffffff", fontSize: "14px" }}>Admin Copy</p>
                </div>
            </div>
        </div>
    );

    // Loader Component
    const Loader = () => (
        <div style={{ 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center", 
            height: "300px",
            flexDirection: "column"
        }}>
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
            <p style={{ marginTop: "15px" }}>Loading payment details...</p>
        </div>
    );

    // Theme Selector Component
    const ThemeSelector = () => (
        <div style={{ 
            display: "flex", 
            justifyContent: "center", 
            gap: "10px", 
            marginBottom: "20px",
            flexWrap: "wrap"
        }}>
            <button
                onClick={() => setTheme("classic")}
                className={`px-4 py-2 rounded-md shadow transition duration-200 ${
                    theme === "classic" 
                        ? "bg-blue-600 text-white" 
                        : "bg-white text-blue-600 border border-blue-600"
                }`}
            >
                Classic
            </button>
            <button
                onClick={() => setTheme("modern")}
                className={`px-4 py-2 rounded-md shadow transition duration-200 ${
                    theme === "modern" 
                        ? "bg-blue-600 text-white" 
                        : "bg-white text-blue-600 border border-blue-600"
                }`}
            >
                Modern
            </button>
            <button
                onClick={() => setTheme("formal")}
                className={`px-4 py-2 rounded-md shadow transition duration-200 ${
                    theme === "formal" 
                        ? "bg-blue-600 text-white" 
                        : "bg-white text-blue-600 border border-blue-600"
                }`}
            >
                Formal
            </button>
            <button
                onClick={() => setTheme("colorful")}
                className={`px-4 py-2 rounded-md shadow transition duration-200 ${
                    theme === "colorful" 
                        ? "bg-blue-600 text-white" 
                        : "bg-white text-blue-600 border border-blue-600"
                }`}
            >
                Colorful
            </button>
        </div>
    );

    return (
        <div align="center" style={{ marginTop: "80px" }}>
            <ThemeSelector />
            
            <button
                onClick={handlePrint}
                className="border border-blue-400 text-white px-4 py-2 mb-5 rounded-md shadow hover:border-blue-700 transition duration-200 mt-4"
            >
                <BiPrinter color="blue" />
            </button>
            
            {loading ? (
                <Loader />
            ) : (
                <>
                    {theme === "classic" && <ClassicTheme />}
                    {theme === "modern" && <ModernTheme />}
                    {theme === "formal" && <FormalTheme />}
                    {theme === "colorful" && <ColorfulTheme />}
                </>
            )}
        </div>
    );
};

export default Receipt;