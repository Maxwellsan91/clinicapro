export function hasTimeOverlap(
  existingStart: Date,
  existingEnd: Date,
  newStart: Date,
  newEnd: Date
) {
  return existingStart < newEnd && existingEnd > newStart;
}

export function formatTimeRange(start: Date, end: Date) {
  const formatter = new Intl.DateTimeFormat("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${formatter.format(start)}-${formatter.format(end)}`;
}
