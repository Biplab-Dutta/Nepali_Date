export const MONTHS = [
  'Baisakh', 'Jestha', 'Ashar', 'Shrawan', 'Bhadra', 'Ashoj',
  'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra',
];

export const MONTH_DAYS = {
  2074: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2075: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2076: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2077: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2078: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2079: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2080: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2081: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2082: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2083: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2084: [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30],
  2085: [31, 32, 31, 32, 30, 31, 30, 30, 29, 30, 30, 30],
  2086: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2087: [31, 31, 32, 31, 31, 31, 30, 30, 29, 30, 30, 30],
  2088: [30, 31, 32, 32, 30, 31, 30, 30, 29, 30, 30, 30],
  2089: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2090: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
};

export const FIRST_YEAR = 2074;
export const LAST_YEAR = 2090;

const MS_PER_DAY = 86400000;
// 2074 Baisakh 1 = 2017-04-14
const REF_DAY = Date.UTC(2017, 3, 14) / MS_PER_DAY;

const yearLength = y => MONTH_DAYS[y].reduce((a, b) => a + b, 0);

// Calendar-day number of a local date, immune to DST/time-of-day.
const dayNumber = date =>
  Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / MS_PER_DAY;

export function adToBs(date) {
  let rem = dayNumber(date) - REF_DAY;
  if (rem < 0)
    return null;
  for (let y = FIRST_YEAR; y <= LAST_YEAR; y++) {
    if (rem >= yearLength(y)) {
      rem -= yearLength(y);
      continue;
    }
    for (let m = 0; m < 12; m++) {
      if (rem < MONTH_DAYS[y][m])
        return { year: y, month: m, day: rem + 1 };
      rem -= MONTH_DAYS[y][m];
    }
  }
  return null;
}

export function bsToAd(year, month, day) {
  let days = day - 1;
  for (let y = FIRST_YEAR; y < year; y++)
    days += yearLength(y);
  for (let m = 0; m < month; m++)
    days += MONTH_DAYS[year][m];
  const utc = new Date((REF_DAY + days) * MS_PER_DAY);
  return new Date(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate());
}
