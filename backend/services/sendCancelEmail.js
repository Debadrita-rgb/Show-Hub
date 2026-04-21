const fs = require("fs");
const handlebars = require("handlebars");
const path = require("path");
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendCancelEmail = async ({
  user,
  booking,
  refundAmount,
  cancelType,
  seatIds = [],
}) => {
  try {
    const templatePath = path.join(
      process.cwd(),
      "templates",
      "cancelEmail.hbs",
    );

    const source = fs.readFileSync(templatePath, "utf-8");
    const template = handlebars.compile(source);

    const html = template({
      name: user.name,
      bookingId: booking._id,
      movieTitle: booking.movieTitle,
      theaterName: booking.theater_name,
      cancelType,
      refundAmount,
      seats: seatIds.length ? seatIds.join(", ") : null,
      // showDate: booking.showDate,
      // showTime: booking.showTime,
    });

    const msg = {
      to: user.email,
      from: {
        email: process.env.EMAIL_USER,
        name: "ShowHub",
      },
      subject: "🎬 Booking Cancelled & Refund",
      html,
    };

    await sgMail.send(msg);

    console.log("✅ Cancel email sent");
  } catch (err) {
    console.log("❌ Cancel Email Error:", err.message);
  }
};

module.exports = sendCancelEmail;
