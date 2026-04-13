const fs = require("fs");
const handlebars = require("handlebars");
const path = require("path");

const buildEmailTemplate = (booking, user, theater, movie) => {
  const templatePath = path.join(
    process.cwd(),
    "templates",
    "bookingEmail.hbs",
  );

  const source = fs.readFileSync(templatePath, "utf8");
  const template = handlebars.compile(source);

  const html = template({
    name: user.name,
    bookingId: booking.bookingId || booking._id,
    movieTitle: booking.movieTitle,
    theaterName: theater.theater_name,
    location: theater.location_name,
    date: new Date(booking.showDate).toLocaleDateString("en-IN"),
    time: new Date(booking.showDate).toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
    seats: booking.seats?.map((s) => `${s.seatId} (${s.category})`).join(", "),
    totalAmount: booking.totalAmount,
    movieImage: movie.movieimage,
  });

  return {
    to: user.email,
    from: process.env.EMAIL_USER,
    subject: "🎬 Booking Confirmed - ShowHub",
    html,
  };
};

module.exports = { buildEmailTemplate };
