const Queue = require("bull");

const emailQueue = new Queue("email-queue", {
  redis: {
    host: "127.0.0.1",
    port: 6379,
  },
});

// Logging here (NOT in route)
emailQueue.on("failed", (job, err) => {
  console.error(` Job failed ${job.id}:`, err.message);
});

emailQueue.on("completed", (job) => {
  console.log(`Job completed ${job.id}`);
});

module.exports = emailQueue;
