import { formatDuration } from "date-fns";
import { countries } from "./countries";

export const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency,
  }).format(amount);
};

export const formatDurationFromSeconds = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  return formatDuration(
    {
      hours,
      minutes,
    },
    {
      format: ["hours", "minutes"],
      delimiter: ", ",
    },
  );
};

export const formatTimerDuration = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const formattedHours = hours.toString().padStart(2, "0");
  const formattedMinutes = minutes.toString().padStart(2, "0");
  const formattedSeconds = seconds.toString().padStart(2, "0");

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
};

export const getCountryByCode = (code: string) => {
  const foundCountry = Object.values(countries).find((country) => country.code === code);

  if (foundCountry) {
    return foundCountry;
  }

  return null;
};
