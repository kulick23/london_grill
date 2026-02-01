export const formatDate = (value, locale) => {
  const date = new Date(value);
  return date.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const getStatus = (startDate, endDate) => {
  const today = new Date();
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date(startDate);
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  const currentDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  if (currentDay >= startDay && currentDay <= endDay) return 'current';
  if (currentDay < startDay) return 'upcoming';
  return 'past';
};
