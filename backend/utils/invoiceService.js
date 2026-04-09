const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const generateInvoice = (booking, user) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });

    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));

    // ================= HEADER =================
    doc.fontSize(18).text("INVOICE", { align: "center" }).moveDown(1);

    // ================= TWO COLUMN SECTION =================
    const leftX = 40;
    const rightX = 320;
    let y = 100;

    // LEFT SIDE
    doc.fontSize(10);
    doc.text(`Date of issue: ${new Date().toDateString()}`, leftX, y);
    doc.text(`Place of supply: Maharashtra`, leftX, y + 15);
    doc.text(`Booking ID: ${booking._id}`, leftX, y + 30);

    doc.moveDown();

    doc.text("Customer", leftX, y + 60);
    doc.text(`Name: ${user.name}`, leftX, y + 75);
    doc.text(`Email: ${user.email}`, leftX, y + 90);

    // RIGHT SIDE
    doc.text("Invoice issued by", rightX, y);
    doc.text("BigTree Entertainment Pvt. Ltd.", rightX, y + 15);

    doc.text("Invoice issued on behalf of", rightX, y + 45);
    doc.text("Biswa Kalyan Rath_Maharashtra", rightX, y + 60);
    doc.text("PAN: BJYPB8723M", rightX, y + 75);
    doc.text("GSTIN: 27BJYPB8723M1ZF", rightX, y + 90);

    // ================= TABLE =================
    let tableY = 220;

    doc.moveTo(leftX, tableY).lineTo(550, tableY).stroke();

    doc.fontSize(10).text("Item Description", leftX, tableY + 5);
    doc.text("Qty", 350, tableY + 5);
    doc.text("Price", 400, tableY + 5);
    doc.text("Total", 470, tableY + 5);

    tableY += 20;
    doc.moveTo(leftX, tableY).lineTo(550, tableY).stroke();

    // ROW
    doc.text(
      `${booking.movieTitle}\n${booking.selectedDate}\n${booking.seats
      ?.map((seat) => `${seat.seatId} (${seat.category})`)
      .join(", ")}`,
      leftX,
      tableY + 5,
    );

    doc.text("1", 350, tableY + 5);
    doc.text(`₹${booking.ticketPrice}`, 400, tableY + 5);
    doc.text(`₹${booking.ticketPrice}`, 470, tableY + 5);

    tableY += 60;
    doc.moveTo(leftX, tableY).lineTo(550, tableY).stroke();

    // ================= TAX =================
    doc.moveDown();

    doc.text(`CGST (9%): ₹${booking.cgst}`, { align: "right" });
    doc.text(`SGST (9%): ₹${booking.sgst}`, { align: "right" });

    // ================= TOTAL =================
    doc.moveDown();

    doc
      .fontSize(12)
      .text(`Grand Total: ₹${booking.totalAmount}`, { align: "right" });

    // ================= FOOTER =================
    doc.moveDown();

    doc
      .fontSize(9)
      .text(
        "Note: Convenience fee pertains to services by BigTree Entertainment Pvt. Ltd.",
        { align: "left" },
      );

    doc.text(`Transaction ID: ${booking.paymentId} | Payment Mode: UPI`, {
      align: "left",
    });

    doc.end();
  });
};

module.exports = generateInvoice;
