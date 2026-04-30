const PDFDocument = require("pdfkit");

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
};

const formatShowDateTime = (date, time) => {
  return `${formatDate(date)} ${time}`;
};

const today = formatDate(new Date());

const generateInvoice = (booking, user, theater) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });

    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));

    const leftX = 40;
    const rightX = 550;

    // ---------------- NORMALIZE DATA ----------------
    let title = "";
    let dateTime = "";
    let location = "";
    let qty = 1;
    let description = "";
    let ticketTotal = 0;

    let theaterName = "";
    let theaterLocation = "";

    if (booking.type === "Movie") {
      title = booking.movieTitle;
      dateTime = formatShowDateTime(booking.showDate, booking.showTime);

      theaterName = theater?.theater_name || "";

      theaterLocation = theater?.location_name || "";

      qty = booking.seats?.length || 0;

      description += `${booking.movieTitle}\n`;
      description += `${dateTime}\n\n`;

      booking.seats?.forEach((seat, index) => {
        description += `${index + 1}. ${seat.seatId} (${seat.category}) - ${seat.price}\n`;
      });

      ticketTotal = booking.ticketPrice;
    }

    if (booking.type === "Show") {
      title = booking.details?.showTitle;

      dateTime = `${booking.details?.date} ${booking.details?.startTime}`;

      theaterLocation = booking.details?.locationName;
      theaterName = booking.details?.theaterName || "";


      qty = booking.details?.seatCount || 1;

      description += `${booking.details?.showTitle}\n`;
      description += `${dateTime}\n`;
      description += `${booking.details?.locationName}\n`;
      seatCount = booking.details?.seatCount;
      ticketTotal = booking.details?.ticketPrice;
    }

    // TAX
    const cgst = booking.cgst || 0;
    const sgst = booking.sgst || 0;
    const convenienceFee = booking.convenienceFee || 0;

    const totalBeforeTax = ticketTotal;
    const taxAmount = cgst + sgst;

    let grandTotal = totalBeforeTax + taxAmount;

    // ---------------- HEADER ----------------
    try {
      doc.image(
        "https://show-hub-frontend.onrender.com/assets/logo-CWqOHdnZ.png",
        40,
        30,
        { width: 80 },
      );
    } catch (e) {}

    doc.fontSize(18).text("INVOICE", 0, 40, { align: "center" });

    doc.fontSize(10);
    doc.text(`Date: ${today}`, leftX, 90);
    doc.text(`Booking ID: ${booking._id}`, leftX, 105);

    doc.text("Customer:", leftX, 130);
    doc.text(user.name, leftX, 145);
    doc.text(user.email, leftX, 160);

    doc.text("Issued By:", 350, 90);
    doc.text("ShowHub", 350, 105);

    doc.text("Title:", 350, 130);
    doc.text(title, 350, 145);

    doc.text("Theater:", 350, 170);
    doc.text(theaterName, 350, 185);

    doc.text("Location:", 350, 200);
    doc.text(theaterLocation, 350, 215);

    // ---------------- TABLE ----------------
    let y = 240;

    const drawRow = (y, item, qty, price, total) => {
      const rowHeight = doc.heightOfString(item, { width: 300 }) + 10;

      doc.rect(leftX, y, 510, rowHeight).stroke();

      doc.text(item, leftX + 5, y + 5, { width: 300 });
      doc.text(qty, 350, y + 5);
      doc.text(price, 400, y + 5);
      doc.text(total, 470, y + 5);

      return y + rowHeight;
    };

    // HEADER ROW
    drawRow(y, "Item Description", "Qty", "Ticket Price", "Total");
    y += 25;

    // MAIN ITEM
    y = drawRow(y, description, qty, `${ticketTotal}`, `${totalBeforeTax}`);

    y += 40;

    // ---------------- TAX ----------------
    doc.text(`CGST: ${cgst}`, rightX - 150, y);
    y += 15;
    doc.text(`SGST: ${sgst}`, rightX - 150, y);
    y += 15;
    doc.text(`Convenience Fee: ${convenienceFee}`, rightX - 150, y);

    y += 30;

    // ---------------- FOOD ----------------
    if (booking.foodItems?.length > 0) {
      doc.font("Helvetica-Bold").text("Food & Beverages", leftX, y);
      doc.font("Helvetica");
      y += 20;

      drawRow(y, "Item", "Qty", "Price", "Total");
      y += 25;

      let foodTotal = 0;

      booking.foodItems.forEach((item) => {
        foodTotal += item.total;

        drawRow(y, item.name, item.quantity, `${item.price}`, `${item.total}`);

        y += 25;
      });

      y += 10;
      doc.text(`Food Total: ${foodTotal}`, rightX - 150, y);
      y += 30;

      grandTotal += foodTotal;
    }

    // ---------------- FINAL ----------------
    doc.moveTo(leftX, y).lineTo(rightX, y).stroke();
    y += 10;

    doc.font("Helvetica-Bold");

    doc.text(`Net Amount: ${totalBeforeTax}`, leftX, y);
    doc.text(`Tax: ${taxAmount}`, 250, y);
    doc.text(`Grand Total: ${grandTotal}`, 400, y);

    doc.font("Helvetica");

    // ---------------- FOOTER ----------------
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
      `Transaction ID: ${booking.paymentId} | Payment Mode: Online`,
      leftX,
      y,
    );

    doc.end();
  });
};

module.exports = generateInvoice;
