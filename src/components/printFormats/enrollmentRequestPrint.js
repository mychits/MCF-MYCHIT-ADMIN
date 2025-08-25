import api from "../../instance/TokenInstance";
import jsPDF from "jspdf";
import imageInput from "../../assets/images/Agent.png";

const handleEnrollmentRequestPrint = async (id) => {
    
    try {
        const response = await api.get(`/user/get-user-by-id/${id}`);
      
        const enroll = response.data;

        const doc = new jsPDF("p", "mm", "a4");

        doc.setFillColor(201, 216, 250);
        doc.rect(
            0,
            0,
            doc.internal.pageSize.getWidth(),
            doc.internal.pageSize.getHeight(),
            "F"
        );

        // customer,nominee,bank details box text field
        const drawTextBox1 = (
            text,
            x,
            y,
            padding = 4,
            lineHeight = 12,
            radius = 2
        ) => {
            const pageWidth = doc.internal.pageSize.getWidth();
            console.log(pageWidth);
            const margin = 15; 
            const availableWidth = pageWidth - 2 * margin; 
            console.log(availableWidth);
           
            const boxWidth = availableWidth + 10;
            console.log(boxWidth);
            const boxHeight = lineHeight;

            // Shadow effect (smoothed)
            // doc.setDrawColor(180);
            // doc.setFillColor(153, 153, 153); // shadow color
            // doc.roundedRect(
            //     x + 1.5,
            //     y + 1.5,
            //     boxWidth,
            //     boxHeight,
            //     radius,
            //     radius,
            //     "F"
            // );

            // Main text box with fill
            doc.setDrawColor(0);
            doc.setFillColor(0, 38, 124); // background color for the box
            doc.roundedRect(x, y, boxWidth, boxHeight, radius, radius, "FD");

            // Add text
            doc.setTextColor(255, 255, 255); // text color
            doc.text(text, x + padding, y + lineHeight - 4);
        };

        //customer name and address text field
        const drawTextBox3 = (
            text,
            x,
            y,
            padding = 4,
            lineHeight = 12,
            radius = 2
        ) => {
            const pageWidth = doc.internal.pageSize.getWidth();
            console.log(pageWidth);
            const margin = 15; // 15mm margin from left and right side of the page

            const availableWidth = pageWidth - 2 * margin; // Space available between left and right margin
            console.log(availableWidth);
            //const textWidth = doc.getTextWidth(text);

            // Set the box width to either available width or text width + padding
            //const boxWidth = Math.min(availableWidth, textWidth + padding * 2);
            const boxWidth = availableWidth + 10;
            console.log(boxWidth);
            const boxHeight = lineHeight;

            // Shadow effect (smoothed)
            // doc.setDrawColor(180);
            // doc.setFillColor(153, 153, 153); // shadow color
            // doc.roundedRect(
            //     x + 1.5,
            //     y + 1.5,
            //     boxWidth,
            //     boxHeight,
            //     radius,
            //     radius,
            //     "F"
            // );

            // Main text box with fill
            doc.setDrawColor(0);
            doc.setFillColor(255, 255, 255); // background color for the box
            doc.roundedRect(x, y, boxWidth, boxHeight, radius, radius, "FD");

            // Add text
            doc.setTextColor(0, 0, 0); // text color
            doc.text(text, x + padding, y + lineHeight - 4);
        };

        // chit enrollment form text field
        const drawTextBox2 = (text, y, lineHeight = 12, radius = 2) => {
            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 1;
            const boxWidth = pageWidth - 2 * margin;
            const boxHeight = lineHeight;
            const x = margin;

            // Shadow effect
            // doc.setDrawColor(180);
            // doc.setFillColor(153, 153, 153); // shadow color
            // doc.roundedRect(
            //     x + 1,
            //     y + 1,
            //     boxWidth,
            //     boxHeight,
            //     radius,
            //     radius,
            //     "F"
            // );

            // Main box
            doc.setDrawColor(0);
            doc.setFillColor(0, 38, 124); // blue background
            doc.roundedRect(x, y, boxWidth, boxHeight, radius, radius, "FD");

            // Center-aligned text inside the box
            const textWidth = doc.getTextWidth(text);
            const textX = x + (boxWidth - textWidth) / 2;

            doc.setTextColor(255, 255, 255); // white text
            doc.text(text, textX, y + lineHeight - 4);
        };

        // 2 text field in a same row
        const drawTextBox = (
            text,
            x,
            y,
            padding = 4,
            lineHeight = 12,
            radius = 2
        ) => {
            const pageWidth = doc.internal.pageSize.getWidth();
            console.log(pageWidth);
            const margin = 15; // 15mm margin from left and right side of the page

            const availableWidth = pageWidth - 2 * margin; // Space available between left and right margin
            console.log(availableWidth);
            //const textWidth = doc.getTextWidth(text);

            // Set the box width to either available width or text width + padding
            //const boxWidth = Math.min(availableWidth, textWidth + padding * 2);
            const boxWidth = availableWidth / 2;
            console.log(boxWidth);
            const boxHeight = lineHeight;




            // Shadow effect (smoothed)
            // doc.setDrawColor(180);
            // doc.setFillColor(153, 153, 153); // shadow color
            // doc.roundedRect(
            //     x + 1.5,
            //     y + 1.5,
            //     boxWidth,
            //     boxHeight,
            //     radius,
            //     radius,
            //     "F"
            // );



            // Main text box with fill
            doc.setDrawColor(0);
            doc.setFillColor(255, 255, 255); // background color for the box
            doc.roundedRect(x, y, boxWidth, boxHeight, radius, radius, "FD");

            // Add text
            doc.setTextColor(0, 0, 0); // text color
            doc.text(text, x + padding, y + lineHeight - 4);
        };

        // Header
        doc.addImage(imageInput, "PNG", 90, 3, 30, 30);
        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        drawTextBox2("CHIT ENROLLMENT FORM", 35);

        doc.setFontSize(12);
        drawTextBox(`APP NO:`, 10, 50);
        drawTextBox(`Date: ${new Date().toLocaleDateString("en-GB")}`, 110, 50);

        drawTextBox(`Referral Name:`, 10, 65);
        drawTextBox(`Customer ID: ${enroll?.customer_id || "CUSXXXX"}`, 110, 65);

        // Customer Details
        doc.setFontSize(15);
        drawTextBox1("Customer Details:", 10, 85);

        doc.setFontSize(12);
        drawTextBox3(`Name: ${enroll?.full_name}`, 10, 100);
        drawTextBox(
            `DOB: ${enroll?.dateofbirth?.split("T")[0] || "YYYY-MM-DD"}`,
            10,
            115
        );
        drawTextBox(`Gender: ${enroll?.gender || ""}`, 110, 115);
        drawTextBox(`Phone: ${enroll?.phone_number}`, 10, 130);
        drawTextBox(`Email: ${enroll?.email}`, 110, 130);
        drawTextBox(
            `Marital Status: ${enroll?.marital_status || ""}`,
            10,
            145
        );
        drawTextBox(
            `Nationality: ${enroll?.nationality || "Indian"}`,
            110,
            145
        );
        drawTextBox3(`Address: ${enroll?.address}`, 10, 160);
        drawTextBox(`Village: ${enroll?.village || ""}`, 10, 175);
        drawTextBox(`Taluk: ${enroll?.taluk || ""}`, 110, 175);
        drawTextBox(`District: ${enroll?.district}`, 10, 190);
        drawTextBox(`State: ${enroll?.state}`, 110, 190);
        drawTextBox(`Pincode: ${enroll?.pincode}`, 10, 205);
        drawTextBox(`Father: ${enroll?.father_name || ""}`, 110, 205);
        drawTextBox(`Aadhaar No: ${enroll?.adhaar_no}`, 10, 220);
        drawTextBox(`PAN No: ${enroll?.pan_no || ""}`, 110, 220);

        doc.setFontSize(11);
        doc.text(
            "I / We hereby authorize the MYCHITS MOBILE APP to send me SMS alerts and Email to the above",
            12,
            240
        );
        doc.text("Mobile and Email ID provided by me", 12, 245);
        doc.text("Signature of the Subscriber", 10, 265);


        // multiple line at bottom of text field #lines
        const drawTextBoxWithMultipleLines = (y, lineHeight = 8) => {
            const docWidth = doc.internal.pageSize.getWidth();
            const margin = 0.1;
            const x = margin;
            const boxWidth = docWidth - 2 * margin;

            const lines = [
                {
                    text: "VIJAYA VINAYAK CHIT FUNDS PRIVATE LIMITED",
                    color: [212, 175, 55], // Gold
                },
                {
                    text: "#11/36-25, 3rd Floor, 2nd Main, Kathriguppe Main Road, Banshankari 3rd Stage, Bengaluru-560085",
                    color: [255, 255, 255], // White
                },
                {
                    text: "Mob: 9483900777 | Ph: 080-4979 8763 | Email: info.mychits@gmail.com | Website: www.mychits.co.in",
                    color: [255, 255, 255], // White
                },
            ];

            const boxHeight = lineHeight * lines.length;

            // Optional shadow
            doc.setDrawColor(180);
            doc.setFillColor(128, 128, 128);
            doc.rect(x + 1.5, y + 1.5, boxWidth, boxHeight, "F");

            // Main background box
            doc.setDrawColor(0);
            doc.setFillColor(0, 38, 124); // Blue
            doc.rect(x, y, boxWidth, boxHeight, "FD");

            // Render each line, centered
            lines.forEach((line, index) => {
                doc.setTextColor(...line.color);
                const textWidth = doc.getTextWidth(line.text);
                const textX = x + (boxWidth - textWidth) / 2;
                const textY = y + index * lineHeight; // no vertical spacing subtracted
                doc.text(line.text, textX, textY + lineHeight * 0.75); // center vertically in line box
            });
        };
        drawTextBoxWithMultipleLines(273);

        // Second Page
        doc.addPage();
        doc.setFillColor(201, 216, 250);
        doc.rect(
            0,
            0,
            doc.internal.pageSize.getWidth(),
            doc.internal.pageSize.getHeight(),
            "F"
        );

        doc.addImage(imageInput, "PNG", 90, 3, 30, 30);

        doc.setFontSize(20);
        drawTextBox2("CHIT ENROLLMENT FORM", 35);

        doc.setFontSize(18);
        doc.setTextColor(0, 38, 124); // RGB color
        doc.text("Profile Image", 10, 70);
        //doc.addImage(imageInput1, "PNG", 10, 75, 40, 40);

        // Nominee Details
        doc.setFontSize(15);
        drawTextBox1("Nominee Details:", 10, 120);
        doc.setFontSize(12);
        drawTextBox(`Name: ${enroll?.nominee_name || ""}`, 10, 135);
        drawTextBox(
            `DOB: ${enroll?.nominee_dateofbirth?.split("T")[0] || ""}`,
            110,
            135
        );
        drawTextBox(
            `Relationship: ${enroll?.nominee_relationship || ""}`,
            10,
            150
        );
        drawTextBox(
            `Phone: ${enroll?.nominee_phone_number || ""}`,
            110,
            150
        );

        // Bank Details
        doc.setFontSize(15);
        drawTextBox1("Bank Details:", 10, 165);
        doc.setFontSize(12);
        drawTextBox(`Bank Name: ${enroll?.bank_name || ""}`, 10, 180);
        drawTextBox(
            `Branch Name: ${enroll?.bank_branch_name || ""}`,
            110,
            180
        );
        drawTextBox(
            `Account No: ${enroll?.bank_account_number || ""}`,
            10,
            195
        );
        drawTextBox(
            `IFSC Code: ${enroll?.bank_IFSC_code || ""}`,
            110,
            195
        );

        // Declaration
        doc.setFontSize(11);
        const declaration = [
            "Dear Sir,",
            "I / We request you to register & take me/ us a chit holder upon the terms and conditions",
            "laid down by your company & hereby agree & accept all terms and conditions such allotment of chits.",
            "I / We received a copy of rules & regulation terms and condition of your company (Chit rules under ",
            " act 1982)",
            "I / We have read completely or caused to be read translated and completely understood the rules.",
        ];
        let y = 215;
        declaration.forEach((line) => {
            doc.text(line, 12, y);
            y += 7;
        });
        doc.text("Signature of the Subscriber", 10, y + 15);


        // multiple line at bottom of text field #lines
        const drawTextBoxWithMultipleLines1 = (y, lineHeight = 8) => {
            const docWidth = doc.internal.pageSize.getWidth();
            const margin = 0.1;
            const x = margin;
            const boxWidth = docWidth - 2 * margin;

            const lines = [
                {
                    text: "VIJAYA VINAYAK CHIT FUNDS PRIVATE LIMITED",
                    color: [212, 175, 55], // Gold
                },
                {
                    text: "#11/36-25, 3rd Floor, 2nd Main, Kathriguppe Main Road, Banshankari 3rd Stage, Bengaluru-560085",
                    color: [255, 255, 255], // White
                },
                {
                    text: "Mob: 9483900777 | Ph: 080-4979 8763 | Email: info.mychits@gmail.com | Website: www.mychits.co.in",
                    color: [255, 255, 255], // White
                },
            ];

            const boxHeight = lineHeight * lines.length;

            // Optional shadow
            doc.setDrawColor(180);
            doc.setFillColor(128, 128, 128);
            doc.rect(x + 1.5, y + 1.5, boxWidth, boxHeight, "F");

            // Main background box
            doc.setDrawColor(0);
            doc.setFillColor(0, 38, 124); // Blue
            doc.rect(x, y, boxWidth, boxHeight, "FD");

            // Render each line, centered
            lines.forEach((line, index) => {
                doc.setTextColor(...line.color);
                const textWidth = doc.getTextWidth(line.text);
                const textX = x + (boxWidth - textWidth) / 2;
                const textY = y + (index + 1) * lineHeight - 2; // -2 nudges up to eliminate spacing
                doc.text(line.text, textX, textY);
            });
        };
        drawTextBoxWithMultipleLines1(274);


        const customerName = `${enroll?.full_name?.replace(/\s+/g, "_")}`  || "EnrollmentForm";
        doc.save(`${customerName}_EnrollmentForm.pdf`);

    } catch (error) {
        console.error("Error generating PDF:", error);
    }
};
export default handleEnrollmentRequestPrint;    