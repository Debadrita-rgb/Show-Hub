const DateSelector = ({ selectedDate, setSelectedDate }) => {

  const getDates = () => {
    const dates = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date);
    }

    return dates;
  };

  const dates = getDates();

  return (
    <div className="date-row">
      {dates.map((date, index) => (
        <div
          key={index}
          onClick={() => setSelectedDate(date)}
          className={`cursor-pointer px-4 py-2 text-center rounded-md border text-black
    ${
      selectedDate?.toDateString() === date.toDateString()
        ? "bg-purple-600 hover:bg-purple-700"
        : "bg-white"
    }`}
        >
          <p className="text-xs">
            {date.toLocaleDateString("en-US", { weekday: "short" })}
          </p>

          <p className="font-semibold">{date.getDate()}</p>

          <p className="text-xs">
            {date.toLocaleDateString("en-US", { month: "short" })}
          </p>
        </div>
      ))}
    </div>
  );
};

export default DateSelector;