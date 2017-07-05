// Converts temperature format
export default function kelvinToFahrenheit(k) {
  if (typeof k !== 'number') {
    throw new Error(`Input ${k} must be a number.`);
  }
  return Math.round(9*(k - 273) / 5) + 32;
}
