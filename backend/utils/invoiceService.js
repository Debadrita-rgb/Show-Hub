const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const generateInvoice = (booking, user) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();

    const filePath = path.join(
      __dirname,
      `../invoices/invoice-${booking._id}.pdf`,
    );
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // HEADER
    doc.fontSize(18).text("INVOICE", { align: "center" });

    doc.moveDown();
    doc.fontSize(12).text(`Invoice Number: ${Date.now()}`);
    doc.text(`Date: ${new Date().toDateString()}`);
    doc.text(`Booking ID: ${booking._id}`);

    doc.moveDown();
    doc.text(`Customer Name: ${user.name}`);
    doc.text(`Email: ${user.email}`);

    doc.moveDown();
    doc.text("Movie Details:");
    doc.text(`Movie: ${booking.movieTitle}`);
    doc.text(`Date: ${booking.showDate}`);
    doc.text(`Seats: ${booking.seats.map((s) => s.seatId).join(", ")}`);

    doc.moveDown();
    doc.text("Payment:");
    doc.text(`Ticket Price: ₹${booking.ticketPrice}`);
    doc.text(`Convenience Fee: ₹${booking.convenienceFee}`);
    doc.text(`Total: ₹${booking.totalAmount}`);

    doc.end();

    stream.on("finish", () => resolve(filePath));
    stream.on("error", reject);
  });
};

module.exports = generateInvoice;
