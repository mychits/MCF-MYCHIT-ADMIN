import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { BiPrinter } from "react-icons/bi";
import { useParams } from "react-router-dom";
import api from "../instance/TokenInstance";
import mychitsLogo from "../assets/images/mychits.png";
import "../css/BasicPrintReceipt.css"

// const ReceiptComponent = () => {
//   const { id } = useParams();
//   const [payment, setPayment] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [printFormat, setPrintFormat] = useState('vertical'); // 'vertical' or 'horizontal'

//   useEffect(() => {
//     const fetchPayment = async () => {
//       if (!id) return;
//       try {
//         setLoading(true);
//         const response = await api.get(`/payment/get-payment-by-id/${id}`);
//         setPayment(response.data || {});
//       } catch (error) {
//         console.error("Error fetching data:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchPayment();
//   }, [id]);

//   const formatPayDate = (dateString) => {
//     if (!dateString) return "N/A";
//     const d = new Date(dateString);
//     return d.toLocaleDateString("en-IN", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//     });
//   };

//   const handlePrint = async () => {
//     if (printFormat === 'vertical') {
//       window.print();
//     } else if (printFormat === 'horizontal'){
     
//       window.print();
//     }
//   };

//   // Vertical Receipt Component
//   const VerticalReceiptSection = ({ copyType }) => (
//     <div className="pro-receipt">
//       <div className="pro-header">
//         <div className="pro-left">
//           <img src={mychitsLogo} className="pro-logo" alt="" />
//           <div>
//             <h2 className="pro-company">MY CHITS</h2>
//             <p className="pro-address">
//               No.11/36-25, Kathriguppe Main Road,
//               <br />
//               Bangalore - 560085 | 9483900777
//             </p>
//           </div>
//         </div>
//       </div>

//       <div className="pro-title">PAYMENT RECEIPT</div>

//       <div className="pro-box">
//         <div className="pro-row">
//           <div className="pro-item">
//             <span className="lbl">Receipt No:</span>
//             <span>{payment.receipt_no || payment.old_receipt_no}</span>
//           </div>
//           <div className="pro-item">
//             <span className="lbl">Date:</span>
//             <span>{formatPayDate(payment.pay_date)}</span>
//           </div>
//         </div>

//         <div className="pro-row">
//           <div className="pro-item">
//             <span className="lbl">Name:</span>
//             <span>{payment?.user_id?.full_name}</span>
//           </div>
//           <div className="pro-item">
//             <span className="lbl">Mobile:</span>
//             <span>{payment?.user_id?.phone_number}</span>
//           </div>
//         </div>

//         <div className="pro-row">
//           <div className="pro-item">
//             <span className="lbl">Group:</span>
//             <span>{payment?.group_id?.group_name}</span>
//           </div>
//           <div className="pro-item">
//             <span className="lbl">Ticket:</span>
//             <span>{payment?.ticket}</span>
//           </div>
//         </div>
//       </div>

//       <div className="pro-amount-box">
//         <span className="lbl">Received Amount:</span>
//         <span className="val">₹ {payment?.amount}</span>
//       </div>

//       <div className="pro-box">
//         <div className="pro-row">
//           <div className="pro-item">
//             <span className="lbl">Payment Mode:</span>
//             <span>{payment?.pay_type}</span>
//           </div>
//           <div className="pro-item">
//             <span className="lbl">Collected By:</span>
//             <span>{payment?.collected_by?.name || "Admin"}</span>
//           </div>
//         </div>
//       </div>

//       <div className="pro-footer">
//         <div className="sign">Authorized Signature</div>
//       </div>

//       <div className="pro-type-box">{copyType} Copy</div>
//     </div>
//   );

//   // Horizontal Receipt Component
//   const HorizontalReceiptSection = ({ copyType }) => (
//     <div className="pro-receipt">
//       <div className="pro-header">
//         <div className="pro-center">
//           <img src={mychitsLogo} className="pro-logo" />
//           <div>
//             <h2 className="pro-company">MY CHITS</h2>
//             <p className="pro-address">
//               No.11/36-25, 2nd Main, Kathriguppe Main Road,<br />
//               Bangalore - 560085 | 9483900777
//             </p>
//           </div>
//         </div>
       
//       </div>

//       <div className="pro-title">PAYMENT RECEIPT</div>

//       <div className="pro-box">
//         <div className="pro-row">
//           <div className="pro-item">
//             <span className="lbl">Receipt No:</span>
//             <span>{payment.receipt_no || payment.old_receipt_no}</span>
//           </div>

//           <div className="pro-item">
//             <span className="lbl">Name:</span>
//             <span>{payment?.user_id?.full_name}</span>
//           </div>

//           <div className="pro-item">
//             <span className="lbl">Date:</span>
//             <span>{formatPayDate(payment.pay_date)}</span>
//           </div>
//         </div>

//         <div className="pro-row">
//           <div className="pro-item">
//             <span className="lbl">Mobile:</span>
//             <span>{payment?.user_id?.phone_number}</span>
//           </div>

//           <div className="pro-item">
//             <span className="lbl">Group:</span>
//             <span>{payment?.group_id?.group_name}</span>
//           </div>

//           <div className="pro-item">
//             <span className="lbl">Ticket:</span>
//             <span>{payment?.ticket}</span>
//           </div>
//         </div>
//       </div>

//       <div className="pro-amount-box">
//         <span className="lbl">Received Amount:</span>
//         <span className="val">₹ {payment?.amount}</span>
//       </div>

//       <div className="pro-box">
//         <div className="pro-row">
//           <div className="pro-item">
//             <span className="lbl">Payment Mode:</span>
//             <span>{payment?.pay_type}</span>
//           </div>

//           <div className="pro-item">
//             <span className="lbl">Collected By:</span>
//             <span>{payment?.collected_by?.name || "Admin"}</span>
//           </div>

//           {/* <div className="pro-item">
//             <span className="lbl">Total:</span>
//             <span>₹ {payment?.amount}</span>
//           </div> */}
//         </div>
//       </div>
       

//       <div className="pro-footer">
//         <div className="sign">Authorized Signature</div>
//       </div>
//       <div className="pro-type-box">{copyType} Copy</div>
//     </div>
//   );

//   if (loading)
//     return (
//       <div className="loading-container">
//         <div className="loading-spinner"></div>
//         <p>Loading receipt details...</p>
//       </div>
//     );

//   return (
//     <div className="receipt-container">
//       <div className="print-options-container">
//         <div className="print-button-container">
//           <button onClick={handlePrint} className="print-button">
//             <BiPrinter size={20} /> Print Receipt
//           </button>
//         </div>
        
//         <div className="format-selector">
//           <label className="radio-label">
//             <input
//               type="radio"
//               value="vertical"
//               checked={printFormat === 'vertical'}
//               onChange={() => setPrintFormat('vertical')}
//             />
//             Format 1
//           </label>
//           <label className="radio-label">
//             <input
//               type="radio"
//               value="horizontal"
//               checked={printFormat === 'horizontal'}
//               onChange={() => setPrintFormat('horizontal')}
//             />
//             Format 2
//           </label>
//         </div>
//       </div>

//       {printFormat === 'vertical' ? (
//         // Vertical Format
//         <div className="vertical-format">
//           {/* EXACT HALF-A4 SECTION */}
//           <div className="receipt-wrapper">
//             <div className="side-by-side">
//               <VerticalReceiptSection copyType="Duplicate" />
//               <VerticalReceiptSection copyType="Customer" />
//             </div>
//           </div>

//           {/* EMPTY REMAINING 50% A4 */}
//           <div className="a4-bottom-empty"></div>
//         </div>
//       ) : (
//         // Horizontal Format
//         <div id="receipt-to-print" className="receipt-wrapper horizontal-format">
//           <HorizontalReceiptSection copyType="Duplicate" />
//           <HorizontalReceiptSection copyType="Customer" />
//           <div className="a4-bottom-empty"></div>
//         </div>
//       )}
//     </div>
//   );
// };

const ReceiptComponent = () => {
  const { id } = useParams();
  const [payment, setPayment] = useState({});
  const [loading, setLoading] = useState(true);
  const [printFormat, setPrintFormat] = useState('vertical'); // 'vertical' or 'horizontal'

  useEffect(() => {
    const fetchPayment = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/payment/get-payment-by-id/${id}`);
        setPayment(response.data || {});
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPayment();
  }, [id]);

  const formatPayDate = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Function to convert number to words
  const numberToWords = (num) => {
    if (num === 0) return "Zero";
    
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const tens = ["", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const twenties = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    
    const numToWords = (n) => {
      if (n < 10) return ones[n];
      if (n < 20) return tens[n - 10];
      if (n < 100) return twenties[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
      if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + numToWords(n % 100) : "");
      if (n < 100000) return numToWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + numToWords(n % 1000) : "");
      if (n < 10000000) return numToWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + numToWords(n % 100000) : "");
      return numToWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + numToWords(n % 10000000) : "");
    };
    
    return numToWords(num);
  };

  const handlePrint = async () => {
    if (printFormat === 'vertical') {
      window.print();
    } else if (printFormat === 'horizontal'){
      window.print();
    }
  };

  // Vertical Receipt Component
  const VerticalReceiptSection = ({ copyType }) => (
    <div className="pro-receipt">
      <div className="pro-header">
        <div className="pro-left">
          <img src={mychitsLogo} className="pro-logo" alt="" />
          <div>
            <h2 className="pro-company">MY CHITS</h2>
            <p className="pro-address">
              No.11/36-25, Kathriguppe Main Road,
              <br />
              Bangalore - 560085 | 9483900777
            </p>
          </div>
        </div>
      </div>

      <div className="pro-title">PAYMENT RECEIPT</div>

      <div className="pro-box">
        <div className="pro-row">
          <div className="pro-item">
            <span className="lbl">Receipt No:</span>
            <span>{payment.receipt_no || payment.old_receipt_no}</span>
          </div>
          <div className="pro-item">
            <span className="lbl">Date:</span>
            <span>{formatPayDate(payment.pay_date)}</span>
          </div>
        </div>

        <div className="pro-row">
          <div className="pro-item">
            <span className="lbl">Name:</span>
            <span>{payment?.user_id?.full_name}</span>
          </div>
          <div className="pro-item">
            <span className="lbl">Mobile:</span>
            <span>{payment?.user_id?.phone_number}</span>
          </div>
        </div>

        <div className="pro-row">
          <div className="pro-item">
            <span className="lbl">Group:</span>
            <span>{payment?.group_id?.group_name}</span>
          </div>
          <div className="pro-item">
            <span className="lbl">Ticket:</span>
            <span>{payment?.ticket}</span>
          </div>
        </div>
      </div>

      <div className="pro-amount-box">
        <span className="lbl">Received Amount:</span>
        <span className="val">₹ {payment?.amount}</span>
      </div>

      <div className="pro-box">
        <div className="pro-row">
          <div className="pro-item">
            <span className="lbl">Payment Mode:</span>
            <span>{payment?.pay_type}</span>
          </div>
          <div className="pro-item">
            <span className="lbl">Collected By:</span>
            <span>{payment?.collected_by?.name || "Admin"}</span>
          </div>
        </div>
      </div>

      <div className="pro-footer-container-vertical">
        <div className="pro-type-box">{copyType} Copy</div>
        <div className="pro-footer">
          <div className="sign">Authorized Signature</div>
        </div>
        
      </div>

    </div>
  );

  // Horizontal Receipt Component
  const HorizontalReceiptSection = ({ copyType }) => (
    <div className="pro-receipt">
      <div className="pro-header">
        <div className="pro-center">
          <img src={mychitsLogo} className="pro-logo" />
          <div>
            <h2 className="pro-company">MY CHITS</h2>
            <p className="pro-address">
              No.11/36-25, 2nd Main, Kathriguppe Main Road,<br />
              Bangalore - 560085 | 9483900777
            </p>
          </div>
        </div>
      </div>

      <div className="pro-title">PAYMENT RECEIPT</div>

      <div className="pro-box">
        <div className="pro-row">
          <div className="pro-item">
            <span className="lbl">Receipt No:</span>
            <span>{payment.receipt_no || payment.old_receipt_no}</span>
          </div>

          <div className="pro-item">
            <span className="lbl">Name:</span>
            <span>{payment?.user_id?.full_name}</span>
          </div>

          <div className="pro-item">
            <span className="lbl">Date:</span>
            <span>{formatPayDate(payment.pay_date)}</span>
          </div>
        </div>

        <div className="pro-row">
          <div className="pro-item">
            <span className="lbl">Mobile:</span>
            <span>{payment?.user_id?.phone_number}</span>
          </div>

          <div className="pro-item">
            <span className="lbl">Group:</span>
            <span>{payment?.group_id?.group_name}</span>
          </div>

          <div className="pro-item">
            <span className="lbl">Ticket:</span>
            <span>{payment?.ticket}</span>
          </div>
        </div>
      </div>

      

      <div className="pro-box">
        <div className="pro-row">
          <div className="pro-item">
            <span className="lbl">Payment Mode:</span>
            <span>{payment?.pay_type}</span>
          </div>

          <div className="pro-item">
            <span className="lbl">Collected By:</span>
            <span>{payment?.collected_by?.name || "Admin"}</span>
          </div>
        </div>
      </div>

      <div className="pro-amount-box">
        <span className="lbl">Received Amount:</span>
        <span className="val">₹ {payment?.amount}</span>
      </div>

      {/* Amount in Words */}
      <div className="pro-amount-words">
        <span className="lbl">Amount in Words:</span>
        <span className="val">{numberToWords(payment?.amount || 0)} Rupees Only</span>
      </div>

      <div className="pro-footer-container">
        <div className="pro-type-box">{copyType} Copy</div>
        <div className="pro-footer">
          <div className="sign">Authorized Signature</div>
        </div>
        
      </div>
    </div>
  );

  if (loading)
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading receipt details...</p>
      </div>
    );

  return (
    <div className="receipt-container">
      <div className="print-options-container">
        <div className="print-button-container">
          <button onClick={handlePrint} className="print-button">
            <BiPrinter size={20} /> Print Receipt
          </button>
        </div>
        
        <div className="format-selector">
          <label className="radio-label">
            <input
              type="radio"
              value="vertical"
              checked={printFormat === 'vertical'}
              onChange={() => setPrintFormat('vertical')}
            />
            Format 1
          </label>
          <label className="radio-label">
            <input
              type="radio"
              value="horizontal"
              checked={printFormat === 'horizontal'}
              onChange={() => setPrintFormat('horizontal')}
            />
            Format 2
          </label>
        </div>
      </div>

      {printFormat === 'vertical' ? (
        // Vertical Format
        <div className="vertical-format">
          {/* EXACT HALF-A4 SECTION */}
          <div className="receipt-wrapper">
            <div className="side-by-side">
              <VerticalReceiptSection copyType="Duplicate" />
              <VerticalReceiptSection copyType="Customer" />
            </div>
          </div>

          {/* EMPTY REMAINING 50% A4 */}
          <div className="a4-bottom-empty"></div>
        </div>
      ) : (
        // Horizontal Format
        <div id="receipt-to-print" className="receipt-wrapper horizontal-format">
          <HorizontalReceiptSection copyType="Duplicate" />
          <div className="cut-line"></div>
          <HorizontalReceiptSection copyType="Customer" />
          <div className="a4-bottom-empty"></div>
        </div>
      )}
    </div>
  );
};










export default ReceiptComponent;
