const BIRTHDAY_TIME_ZONE = "Europe/Dublin";
const BIRTHDAY_MONTH = 4;
const BIRTHDAY_MONTH_INDEX = BIRTHDAY_MONTH - 1;
const BIRTHDAY_DAY = 6;

type TimeZoneParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

export type BirthdayCountdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  arrived: boolean;
  targetLabel: string;
};

const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: BIRTHDAY_TIME_ZONE,
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  hourCycle: "h23",
});

const targetLabelFormatter = new Intl.DateTimeFormat("en-IE", {
  timeZone: BIRTHDAY_TIME_ZONE,
});

const getTimeZoneParts = (date: Date): TimeZoneParts => {
  const parts = dateTimeFormatter.formatToParts(date);
  const getPart = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0);

  return {
    year: getPart("year"),
    month: getPart("month"),
    day: getPart("day"),
    hour: getPart("hour"),
    minute: getPart("minute"),
    second: getPart("second"),
  };
};

const toWallClockTimestamp = ({ year, month, day, hour, minute, second }: TimeZoneParts) =>
  Date.UTC(year, month - 1, day, hour, minute, second);

const getTargetYear = ({ year, month, day }: TimeZoneParts) =>
  month > BIRTHDAY_MONTH || (month === BIRTHDAY_MONTH && day > BIRTHDAY_DAY) ? year + 1 : year;

const formatTargetLabel = (year: number) =>
  targetLabelFormatter.format(new Date(Date.UTC(year, BIRTHDAY_MONTH_INDEX, BIRTHDAY_DAY, 12, 0, 0)));

export const getBirthdayCountdown = (date = new Date()): BirthdayCountdown => {
  const nowInDublin = getTimeZoneParts(date);

  if (nowInDublin.month === BIRTHDAY_MONTH && nowInDublin.day === BIRTHDAY_DAY) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      arrived: true,
      targetLabel: formatTargetLabel(nowInDublin.year),
    };
  }

  const targetYear = getTargetYear(nowInDublin);
  const currentWallClockTimestamp = toWallClockTimestamp(nowInDublin);
  const targetWallClockTimestamp = Date.UTC(targetYear, BIRTHDAY_MONTH_INDEX, BIRTHDAY_DAY, 0, 0, 0);
  const difference = Math.max(targetWallClockTimestamp - currentWallClockTimestamp, 0);

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    arrived: false,
    targetLabel: formatTargetLabel(targetYear),
  };
};

export { BIRTHDAY_TIME_ZONE };