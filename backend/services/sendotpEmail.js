const fs = require("fs");
const handlebars = require("handlebars");
const path = require("path");
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendotpEmail = async ({user, otp }) => {
  try {
    const templatePath = path.join(
      process.cwd(),
      "templates",
      "otpEmail.hbs",
    );

    const source = fs.readFileSync(templatePath, "utf-8");
    const template = handlebars.compile(source);


    const html = template({
      name: user.name || "User",
      otp: otp,
      year: new Date().getFullYear(),
    });

    const subject = "Showhub Login: Here's the 6-digit verification code you requested";

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

    console.log("✅ OTP email sent");
  } catch (err) {
    console.log("❌ OTP Email Error:", err.message);
  }
};

module.exports = sendotpEmail;
