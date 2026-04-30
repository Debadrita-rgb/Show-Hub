const shouldBeActive = (show) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (show.startDate && show.endDate) {
    const end = new Date(show.endDate);
    end.setHours(0, 0, 0, 0);
    return end >= today;
  }

  if (show.locations && show.locations.length > 0) {
    const validLocations = show.locations.filter((loc) => loc.date);

    if (validLocations.length === 0) return false;

    const latestDate = validLocations.reduce((latest, loc) => {
      const d = new Date(loc.date);
      return d > latest ? d : latest;
    }, new Date(validLocations[0].date));

    latestDate.setHours(0, 0, 0, 0);

    return latestDate >= today;
  }

  return false;
};
export default shouldBeActive;