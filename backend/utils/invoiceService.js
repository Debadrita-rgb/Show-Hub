const PDFDocument = require("pdfkit");

const formatShowDateTime = (date, time) => {
  const d = new Date(date);

  const formattedDate = d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });

  return `${formattedDate} ${time}`;
};

const generateInvoice = (booking, user) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });

    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));

    const leftX = 40;
    const rightX = 550;

    // ================= LOGO =================
    try {
      doc.image(
        "https://show-hub-frontend.onrender.com/assets/logo-CWqOHdnZ.png",
        40,
        30,
        { width: 80 },
      );
    } catch (e) {}

    // ================= HEADER =================
    doc.fontSize(18).text("INVOICE", 0, 40, { align: "center" });

    doc.fontSize(10);
    doc.text(`Date: ${formatDateTime(new Date())}`, leftX, 90);
    doc.text(`Booking ID: ${booking._id}`, leftX, 105);

    doc.text("Customer:", leftX, 130);
    doc.text(user.name, leftX, 145);
    doc.text(user.email, leftX, 160);

    doc.text("Issued By:", 350, 90);
    doc.text("ShowHub", 350, 105);

    doc.text("Movie:", 350, 130);
    doc.text(booking.movieTitle, 350, 145);

    // ================= TABLE START =================
    let y = 200;

//     const drawRow = (y, item, qty, price, total) => {
// const rowHeight = doc.heightOfString(item, { width: 300 }) + 10;

// doc.rect(leftX, y, 510, rowHeight).stroke();

// doc.text(item, leftX + 5, y + 5, { width: 300 });
// doc.text(qty, 350, y + 5);
// doc.text(price, 400, y + 5);
// doc.text(total, 470, y + 5);

// y += rowHeight;

// doc.text(item, leftX + 5, y + 5, {
//   width: 300,
//   lineGap: 2,
// });      doc.text(qty, 350, y + 5);
//       doc.text(price, 400, y + 5);
//       doc.text(total, 470, y + 5);
//     };

const drawRow = (y, item, qty, price, total) => {
  const rowHeight = doc.heightOfString(item, { width: 300 }) + 10;

  doc.rect(leftX, y, 510, rowHeight).stroke();

  doc.text(item, leftX + 5, y + 5, { width: 300 });
  doc.text(qty, 350, y + 5);
  doc.text(price, 400, y + 5);
  doc.text(total, 470, y + 5);

  return y + rowHeight; // better practice
};

    // HEADER
    drawRow(y, "Item Description", "Qty", "Price", "Total");
    y += 25;

    // ================= ITEM DESCRIPTION =================
    let description = "";

    // 🎬 Movie title
    description += `${booking.movieTitle}\n`;

    // 📅 Correct date + showTime
    description += `${formatShowDateTime(
      booking.showDate,
      booking.showTime,
    )}\n\n`;

    // 💺 Seats section
    booking.seats?.forEach((seat, index) => {
      description += `${index + 1}. ${seat.seatId} (${seat.category}) - ₹${seat.price}\n`;
    });

    // ================= CALCULATIONS =================
    const qty = booking.seats.length;
    const ticketTotal = booking.ticketPrice;
    const cgst = booking.cgst || 0;
    const sgst = booking.sgst || 0;
    const convenienceFee = booking.convenienceFee || 0;

    const totalBeforeTax = ticketTotal;
    const taxAmount = cgst + sgst;
    let grandTotal = totalBeforeTax + taxAmount;

    drawRow(y, description, qty, `₹${ticketTotal}`, `₹${totalBeforeTax}`);

    y += 80;

    // ================= TAX =================
    doc.text(`CGST (9%): ₹${cgst}`, rightX - 150, y);
    y += 15;
    doc.text(`SGST (9%): ₹${sgst}`, rightX - 150, y);
    y += 15;
    doc.text(`Convenience Fee: ₹${convenienceFee}`, rightX - 150, y);

    y += 30;

    // ================= FOOD TABLE =================
    if (booking.foodItems && booking.foodItems.length > 0) {
      doc.font("Helvetica-Bold").text("Food & Beverages", leftX, y);
      doc.font("Helvetica");
      y += 20;

      drawRow(y, "Item", "Qty", "Price", "Total");
      y += 25;

      let foodTotal = 0;

      booking.foodItems.forEach((item) => {
        foodTotal += item.total;

        drawRow(
          y,
          item.name,
          item.quantity,
          `₹${item.price}`,
          `₹${item.total}`,
        );

        y += 25;
      });

      y += 10;
      doc.text(`Food Total: ₹${foodTotal}`, rightX - 150, y);
      y += 30;

      // add to grand total
      grandTotal += foodTotal;
    }

    // ================= FINAL SUMMARY =================
    doc.moveTo(leftX, y).lineTo(rightX, y).stroke();
    y += 10;

    doc.font("Helvetica-Bold");

    doc.text(`Net Amount: ₹${totalBeforeTax}`, leftX, y);
    doc.text(`Tax Amount: ₹${taxAmount}`, 250, y);
    doc.text(`Grand Total: ₹${grandTotal}`, 400, y);

    doc.font("Helvetica");

    // ================= FOOTER =================
    y += 40;

    doc
      .fontSize(9)
      .text(
        "Note: Convenience fee pertains to services provided by ShowHub.",
        leftX,
        y,
      );

    y += 15;

    doc.text(
      `Transaction ID: ${booking.paymentId} | Payment Mode: UPI`,
      leftX,
      y,
    );

    doc.end();
  });
};

module.exports = generateInvoice;
