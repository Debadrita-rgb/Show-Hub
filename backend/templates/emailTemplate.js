const fs = require("fs");
const handlebars = require("handlebars");
const path = require("path");

const buildEmailTemplate = (booking, user, theater, movie) => {
  const templatePath = path.join(__dirname, "../templates/bookingEmail.hbs");

  const source = fs.readFileSync(templatePath, "utf8");
  const template = handlebars.compile(source);

  // ✅ FORMAT DATE TIME
  const d = new Date(booking.showDate);
  const formattedDate = d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formattedTime = d.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  // ✅ SEATS HTML
  const seatsHTML = booking.seats
    ?.map(
      (seat) => `
      <div style="display:flex; justify-content:space-between; font-size:13px; margin:2px 0;">
        <span>${seat.seatId} (${seat.category})</span>
        <span>₹${seat.price}</span>
      </div>
    `,
    )
    .join("");

  // ✅ FOOD
  const foodTotal =
    booking.foodItems?.reduce((sum, item) => sum + item.total, 0) || 0;

  const foodHTML =
    booking.foodItems && booking.foodItems.length > 0
      ? `
      <div style="margin-top:20px; background:#fafafa; padding:10px; border-radius:6px;">
        <h4>🍿 Food & Beverages</h4>
        ${booking.foodItems
          .map(
            (item) => `
          <div style="display:flex; justify-content:space-between;">
            <span>${item.name} x${item.quantity}</span>
            <span>₹${item.total}</span>
          </div>
        `,
          )
          .join("")}
        <hr/>
        <div style="display:flex; justify-content:space-between; font-weight:bold;">
          <span>Total</span>
          <span>₹${foodTotal}</span>
        </div>
      </div>
    `
      : "";

  // ✅ PASS DATA
  const html = template({
    name: user.name,
    bookingId: booking.bookingId || booking._id,
    movieTitle: booking.movieTitle,
    theaterName: theater.theater_name,
    location: theater.location_name,
    date: formattedDate,
    time: formattedTime,
    totalAmount: booking.totalAmount,
    ticketPrice: booking.ticketPrice,
    convenienceFee: booking.convenienceFee,
    seatsCount: booking.seats?.length || 1,
    movieImage: movie.movieimage,
    seatsHTML,
    foodHTML,
  });

  return {
    to: user.email,
    from: process.env.EMAIL_USER,
    subject: "🎬 Booking Confirmed - ShowHub",
    html,
  };
};

module.exports = { buildEmailTemplate };
