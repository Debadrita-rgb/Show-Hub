const moment = require("moment");

// calculate end time
const calculateEndTime = (startTime, movieDuration) => {
  const start = moment(startTime, "HH:mm");

  // add movie duration + 20 min gap
  const end = start.clone().add(movieDuration + 20, "minutes");

  return end.format("HH:mm");
};

// convert time to minutes (for overlap checking)
const convertToMinutes = (time) => {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
};

module.exports = {
  calculateEndTime,
  convertToMinutes,
};
