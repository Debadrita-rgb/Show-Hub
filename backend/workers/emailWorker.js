const emailQueue = require("../queue/emailQueue");
const sgMail = require("@sendgrid/mail");
const { buildEmailTemplate } = require("../services/emailTemplate");
const generateInvoice = require("../utils/invoiceService");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

emailQueue.process(async (job) => {
  const { booking, user, theater, movie } = job.data;

  try {
    //  Build template
    const msg = buildEmailTemplate(booking, user, theater, movie);

    //  Generate PDF
    const pdfBuffer = await generateInvoice(booking, user);

    //  Attach invoice
    msg.attachments = [
      {
        content: pdfBuffer.toString("base64"),
        filename: "invoice.pdf",
        type: "application/pdf",
        disposition: "attachment",
      },
    ];

    await sgMail.send(msg);

    console.log("✅ Email sent:", booking._id);
  } catch (error) {
    console.error("❌ Email failed:", error.message);
    throw error; // retry trigger
  }
});
