import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import imageInput from "../../assets/images/MyChits.png";

//const safe = (val) => (val == null || val === "" ? "-" : String(val).trim());

const formatAmount = (amount) => {
  if (amount == null || isNaN(amount)) return "-";
  return Math.round(amount);
};

const formatAddress = (addr) => {
  if (!addr) return "-";
  if (typeof addr === "string") return addr;
  if (typeof addr === "object" && !Array.isArray(addr)) {
    const { line1, line2, city, state, pincode } = addr;
    return [line1, line2, city, state, pincode].filter(Boolean).join(", ") || "-";
  }
  return String(addr);
};

const safe = (v) => v ?? "-";

// ====== Report Generator - Updated with Totals Section ======
const CustomerReportPrint = (
  group,
  TableAuctions,
  filteredBorrowerData,
  filteredDisbursement,
  totalsData, // <-- pass { TotalToBepaid, Totalprofit, NetTotalprofit, Totalpaid }
  TableEnrolls
) => {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.width;
  const center = pageWidth / 2;
  const leftX = 20;
  let yPos = 30;


  doc.addImage(imageInput, "PNG", 95, 5, 20, 20);

  // ====== Header ======
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(30, 50, 100);
  doc.text("MyChits", center, yPos, { align: "center" });

  yPos += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.text("#11/36-25, 2nd Main, Kathriguppe Main Road, Bangalore, Karnataka, India - 560070", center, yPos, { align: "center" });

  yPos += 12;
  doc.setDrawColor(200, 200, 200);
  doc.line(leftX, yPos, pageWidth - 20, yPos);
  yPos += 10;

  // ====== Title ======
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(0);
  doc.text("Customer Report", center, yPos, { align: "center" });
  yPos += 8;

  const now = new Date();
  const timestamp =
    now.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) +
    " | " +
    now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Generated on: ${timestamp}`, center, yPos, { align: "center" });
  yPos += 15;

  // #################################################
  // ====== Customer Details Card ======
  // #################################################
  const detailYStart = yPos;
  const cardWidth = pageWidth - 40;
  const cardHeight = 55;
  const innerMargin = 6;

  const labelX1 = leftX + innerMargin;
  const valueX1 = 55;
  const labelX2 = center + 5;
  const valueX2 = center + 35;
  const rowHeight = 8;
  let currentY = detailYStart + 10;

  doc.setDrawColor(180, 180, 180);
  doc.setFillColor(248, 248, 255);
  doc.roundedRect(leftX, detailYStart, cardWidth, cardHeight, 3, 3, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(30, 50, 100);
  doc.text("Customer Information", leftX + innerMargin, detailYStart + 5);

  doc.setDrawColor(220, 220, 220);
  doc.line(leftX, detailYStart + 7, pageWidth - 20, detailYStart + 7);

 const drawCardDetail = (label, value, labelX, valueX, extraMargin = 0) => {
  // apply extra margin if provided
  if (extraMargin > 0) {
    currentY += extraMargin;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);
  doc.text(`${label}:`, labelX, currentY);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(0);
  const maxValWidth =
    valueX === valueX1 ? labelX2 - valueX1 - 10 : pageWidth - 20 - valueX2 - 5;
  doc.text(safe(value), valueX, currentY, { maxWidth: maxValWidth });
};

  drawCardDetail("Full Name", group?.full_name, labelX1, valueX1, 4);
  drawCardDetail("Phone No.", group?.phone_number, labelX2, valueX2);
  currentY += rowHeight;

  drawCardDetail("Email", group?.email, labelX1, valueX1);
  drawCardDetail("Date of Birth", group?.dateofbirth?.split("T")[0], labelX2, valueX2);
  currentY += rowHeight;

  drawCardDetail("Gender", group?.gender, labelX1, valueX1);
  drawCardDetail("Collection Area", group?.collection_area?.route_name, labelX2, valueX2);
  currentY += rowHeight;

  drawCardDetail("Nominee", group?.nominee_name, labelX1, valueX1);
  drawCardDetail("Relationship", group?.nominee_relationship, labelX2, valueX2);
  currentY += rowHeight;

  const addressText = formatAddress(group?.address);
  const addressMaxWidth = pageWidth / 2 - valueX1 - innerMargin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);
  doc.text("Address:", labelX1, currentY);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(0);
  doc.text(addressText, valueX1, currentY, { maxWidth: addressMaxWidth });

  drawCardDetail("Pincode", group?.pincode, labelX2, currentY);

  yPos = detailYStart + cardHeight + 8;

  // ====== Auction Table ======
  // if (TableAuctions?.length > 0) {
  //   autoTable(doc, {
  //     startY: yPos,
  //     head: [["Group ID", "Ticket No.", "Total Payable", "Total Paid", "Balance Due"]],
  //     body: TableAuctions.map((i) => [
  //       safe(i.group),
  //       safe(i.ticket),
  //       formatAmount(i.toBePaidAmount),
  //       formatAmount(i.paidAmount),
  //       formatAmount(i.balance),
  //     ]),
  //     theme: "grid",
  //     headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
  //     bodyStyles: { textColor: 50 },
  //     alternateRowStyles: { fillColor: [245, 250, 255] },
  //     styles: { font: "helvetica", fontSize: 9, cellPadding: 3 },
  //   });
  //   yPos = doc.lastAutoTable.finalY + 12;
  // }

  // ====== Auction Details Table ======

   yPos += 4;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(15);
  doc.setTextColor(80);
  doc.text("Chit Group", center, yPos, { align: "center" });
  yPos += 2;

if (TableAuctions?.length > 0) {
  autoTable(doc, {
    startY: yPos,
    head: [[
      "Customer Status",
      "Removal Reason",
      "Group Name",
      "Ticket",
      "Referrer Type",
      "Referred By",
      "Amount to be Paid",
      "Profit",
      "Net To be Paid",
      "Amount Paid",
      "Balance"
    ]],
    body: TableAuctions.map((i) => [
      safe(i.customer_status),
      safe(i.removal_reason),
      safe(i.group),
      safe(i.ticket),
      safe(i.referred_type),
      safe(i.referrer_name),
      formatAmount(i.totalBePaid),
      formatAmount(i.profit),
      formatAmount(i.toBePaidAmount),
      formatAmount(i.paidAmount),
      formatAmount(i.balance),
    ]),
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
    bodyStyles: { textColor: 50 },
    alternateRowStyles: { fillColor: [245, 250, 255] },
    styles: { font: "helvetica", fontSize: 6, cellPadding: 2 },
  });
  yPos = doc.lastAutoTable.finalY + 12;
}


  yPos += 4;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(15);
  doc.setTextColor(80);
  doc.text("Loan Group", center, yPos, { align: "center" });
  yPos += 2;
  // ====== Loan Table ======
  if (filteredBorrowerData?.length > 0) {
    autoTable(doc, {
      startY: yPos,
      head: [["Loan ID", "Amount Sanctioned", "Tenure", "Service Charge", "Total Paid", "Balance"]],
      body: filteredBorrowerData.map((l) => [
        safe(l.loan),
        formatAmount(l.loan_amount),
        safe(l.tenure),
        formatAmount(l.service_charge),
        formatAmount(l.total_paid_amount),
        formatAmount(l.balance),
      ]),
      theme: "grid",
      headStyles: { fillColor: [52, 152, 219], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 250, 255] },
      styles: { font: "helvetica", fontSize: 9, cellPadding: 3 },
    });
    yPos = doc.lastAutoTable.finalY + 12;
  }

  // ====== Pigme/Disbursement Table ======
  // if (filteredDisbursement?.length > 0) {
  //   autoTable(doc, {
  //     startY: yPos,
  //     head: [["Date", "Amount Disbursed", "Status", "Remarks"]],
  //     body: filteredDisbursement.map((d) => [
  //       d.disbursement_date?.split("T")[0] || "-",
  //       formatAmount(d.amount),
  //       safe(d.status),
  //       safe(d.remarks),
  //     ]),
  //     theme: "grid",
  //     headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
  //     alternateRowStyles: { fillColor: [245, 250, 255] },
  //     styles: { font: "helvetica", fontSize: 9, cellPadding: 3 },
  //   });
  //   yPos = doc.lastAutoTable.finalY + 12;
  // }




  if (filteredDisbursement?.length > 0) {
  yPos += 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(15);
  doc.setTextColor(80);
  doc.text("PayOut / Disbursement", center, yPos, { align: "center" });
  yPos += 4;

  autoTable(doc, {
    startY: yPos,
    head: [[
      "SL. NO",
      "Disbursed Date",
      "Transaction Date",
      "Ticket",
      "Amount",
      "Receipt No",
      "Payment Type",
      "Disbursement Type",
      "Disbursed By",
      "Balance"
    ]],
    body: filteredDisbursement.map((d, index) => [
      index + 1,
      safe(d.pay_date),
      safe(d.transaction_date),
      safe(d.ticket),
      formatAmount(d.amount),
      safe(d.receipt_no),
      safe(d.pay_type),
      safe(d.disbursement_type),
      safe(d.disbursed_by),
      formatAmount(d.balance)
    ]),
    theme: "grid",
    headStyles: { fillColor: [52, 73, 94], textColor: 255, fontStyle: "bold" },
    bodyStyles: { textColor: 50 },
    alternateRowStyles: { fillColor: [245, 250, 255] },
    styles: { font: "helvetica", fontSize: 8, cellPadding: 3 },
  });

  yPos = doc.lastAutoTable.finalY + 12;
}

//     yPos += 10;
//   doc.setFont("helvetica", "normal");
//   doc.setFontSize(15);
//   doc.setTextColor(80);
//   doc.text("Overview", center, yPos, { align: "center" });
// yPos += 2;
  // ====== Totals Section (after Loan & Pigme) ======
  if (totalsData) {
    const { TotalToBepaid, Totalprofit, NetTotalprofit, Totalpaid } = totalsData;
    const balance =
      NetTotalprofit && Totalpaid ? NetTotalprofit - Totalpaid : "-";

    autoTable(doc, {
      startY: yPos,
      head: [["Total To be Paid", "Total Profit", "Net Total To be Paid", "Total Paid", "Balance"]],
      body: [
        [
          formatAmount(TotalToBepaid),
          formatAmount(Totalprofit),
          formatAmount(NetTotalprofit),
          formatAmount(Totalpaid),
          formatAmount(balance),
        ],
      ],
      theme: "grid",
      headStyles: { fillColor: [22, 160, 133], textColor: 255, fontStyle: "bold" },
      bodyStyles: { textColor: 50 },
      styles: { font: "helvetica", fontSize: 9, cellPadding: 3 },
    });
    yPos = doc.lastAutoTable.finalY + 12;
  }
  if (TableEnrolls?.length > 0){

 //  if (group?.TableEnrolls && group.TableEnrolls.length > 0) {
    yPos += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(15);
    doc.setTextColor(80);
    doc.text("Customer Ledger (All Groups & Tickets)", center, yPos, { align: "center" });
    yPos += 4;

    autoTable(doc, {
      startY: yPos,
      head: [["SL. NO", "Date", "Amount", "Receipt No", "Old Receipt No", "Payment Type", "Balance"]],
      body: group.TableEnrolls.map((entry, index) => [
        index + 1,
        safe(entry.date),
        formatAmount(entry.amount),
        safe(entry.receipt),
        safe(entry.old_receipt),
        safe(entry.type),
        formatAmount(entry.balance),
      ]),
      theme: "grid",
      headStyles: { fillColor: [44, 62, 80], textColor: 255, fontStyle: "bold" },
      bodyStyles: { textColor: 50 },
      alternateRowStyles: { fillColor: [245, 250, 255] },
      styles: { font: "helvetica", fontSize: 8, cellPadding: 3 },
    });

    yPos = doc.lastAutoTable.finalY + 12;
  }

  // ====== Footer ======
  const finalY = doc.internal.pageSize.height - 20;
  doc.setDrawColor(220);
  doc.line(leftX, finalY - 5, pageWidth - 20, finalY - 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80);
  doc.text("Issued By: Super Admin", leftX, finalY);

  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text("*** This is a computer generated document, no signature is required ***", center, finalY, {
    align: "center",
  });

  const name = group?.full_name ? group.full_name.replace(/\s+/g, "_") : "Customer";
  doc.save(`CustomerReport_${name}_${new Date().toISOString().split("T")[0]}.pdf`);
};

export default CustomerReportPrint;
