const moment = require("moment");

const calculateEndTime = (startTime, movieDuration) => {
  const start = moment(startTime, "HH:mm");

  const end = start.clone().add(movieDuration + 20, "minutes");

  return end.format("HH:mm");
};

const convertToMinutes = (time) => {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
};

module.exports = {
  calculateEndTime,
  convertToMinutes,
};
