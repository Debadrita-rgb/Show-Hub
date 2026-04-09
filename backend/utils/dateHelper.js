const formatDate = (dateString) => {
  const date = new Date(dateString);

  const day = date.getDate();

  const getSuffix = (d) => {
    if (d > 3 && d < 21) return "th";
    switch (d % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  const suffix = getSuffix(day);

  const month = date.toLocaleString("en-IN", { month: "long" });
  const year = date.getFullYear();

  return `${day}${suffix} ${month}, ${year}`;
};
module.exports = formatDate
