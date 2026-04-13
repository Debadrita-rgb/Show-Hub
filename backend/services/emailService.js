const sgMail = require("@sendgrid/mail");
const { buildEmailTemplate } = require("../templates/emailTemplate");
const generateInvoice = require("../utils/invoiceService");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Retry function
const sendWithRetry = async (msg, retries = 3) => {
  try {
    await sgMail.send(msg);
    console.log("✅ Email sent successfully");
  } catch (error) {
    console.error(`❌ Email failed. Retries left: ${retries}`, error.message);

    if (retries > 0) {
      await new Promise((res) => setTimeout(res, 5000)); // wait 5 sec
      return sendWithRetry(msg, retries - 1);
    } else {
      console.error("🚨 Email permanently failed");
    }
  }
};

// Main background function
const sendBookingEmail = async (booking, user, theater, movie) => {
  try {
//     console.log("📧 Preparing email...");
// console.log("Template function:", buildEmailTemplate);

    const msg = buildEmailTemplate(booking, user, theater, movie);

    const pdfBuffer = await generateInvoice(booking, user);

    msg.attachments = [
      {
        content: pdfBuffer.toString("base64"),
        filename: "invoice.pdf",
        type: "application/pdf",
        disposition: "attachment",
      },
    ];

    await sendWithRetry(msg);
  } catch (err) {
    console.error("❌ Background email error:", err.message);
  }
};

module.exports = sendBookingEmail;
