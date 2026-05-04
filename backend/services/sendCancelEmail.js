const fs = require("fs");
const handlebars = require("handlebars");
const path = require("path");
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendCancelEmail = async ({
  user,
  booking,
  theater,
  refundAmount,
  cancelType,
  seatIds = [],
  foodItems = [],
}) => {
  try {
    const templatePath = path.join(
      process.cwd(),
      "templates",
      "cancelEmail.hbs",
    );

    const source = fs.readFileSync(templatePath, "utf-8");
    const template = handlebars.compile(source);

    const d = new Date(booking.showDate);
    const formattedDate = d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const cancelledFoodItems =
      booking.foodItems?.filter((item) => item.cancelledQty > 0) || [];

    const foodTotal = cancelledFoodItems.reduce(
      (sum, item) => sum + item.cancelledQty * item.price,
      0,
    );

    const foodHTML =
      cancelledFoodItems.length > 0
        ? `
    <div style="margin-top:20px; background:#fafafa; padding:15px; border-radius:8px;">
      <h4 style="margin-bottom:10px;">🍿 Cancelled Food Items</h4>

      ${cancelledFoodItems
        .map(
          (item) => `
        <div style="
          display:flex; 
          justify-content:space-between; 
          padding:6px 0;
          font-size:13px;
        ">
          <span style="flex:2;">${item.name}</span>
          <span style="flex:1; text-align:center;">x${item.cancelledQty}</span>
          <span style="flex:1; text-align:right;">
            ₹${item.cancelledQty * item.price}
          </span>
        </div>
      `,
        )
        .join("")}

      <hr style="margin:10px 0;" />

      <div style="
        display:flex; 
        justify-content:space-between; 
        font-weight:bold;
      ">
        <span>Food Refund Total</span>
        <span>₹${foodTotal}</span>
      </div>
    </div>
  `
        : "";

    const html = template({
      name: user.name,
      bookingId: booking._id,
      movieTitle: booking.movieTitle,
      theaterName: theater.theater_name,
      location: theater.location_name,
      cancelType,
      refundAmount,
      seats: seatIds.length ? seatIds.join(", ") : null,
      foodHTML,
      date: formattedDate,
      time: booking.showTime,
    });

    let subject = "";

    if (cancelType === "Full") {
      subject = "🎬 Your Booking is Cancelled & Refund Completed";
    } else if (cancelType === "Partial") {
      subject = "🎬 Some Seats Cancelled & Partial Refund Completed";
    } else if (cancelType === "Food") {
      subject = "🍿 Food Items Cancelled & Refund Processed";
    }

    const msg = {
      to: user.email,
      from: {
        email: process.env.EMAIL_USER,
        name: "ShowHub",
      },
      subject: `${subject}`,
      html,
    };

    await sgMail.send(msg);

    console.log("✅ Cancel email sent");
  } catch (err) {
    console.log("❌ Cancel Email Error:", err.message);
  }
};

module.exports = sendCancelEmail;
