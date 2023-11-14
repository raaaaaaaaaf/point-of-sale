import { format, getTime, formatDistanceToNow } from 'date-fns';

// ----------------------------------------------------------------------

export function fDate(date, newFormat) {
  const fm = newFormat || 'dd MMM yyyy';

  return date ? format(new Date(date), fm) : '';
}

export function fDateTime(timestamp, newFormat) {
  const fm = newFormat || 'dd MMM yyyy p';

  if (timestamp && timestamp.seconds) {
    // Convert Firebase timestamp to JavaScript Date
    const jsDate = new Date(timestamp.seconds * 1000); // Convert seconds to milliseconds
    
    // Format the JavaScript Date object
    return format(jsDate, fm);
  } else {
    return '';
  }
}

export function fTimestamp(date) {
  return date ? getTime(new Date(date)) : '';
}

export function fToNow(date) {
  return date
    ? formatDistanceToNow(new Date(date), {
        addSuffix: true,
      })
    : '';
}
