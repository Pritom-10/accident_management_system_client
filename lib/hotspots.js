export const PERIODS = [
  ['7', 'Last 7 days'],
  ['30', 'Last 30 days'],
  ['90', 'Last 90 days'],
  ['365', 'Last year'],
  ['all', 'All time'],
];

export const BANDS = [
  ['', 'Any time of day'],
  ['morning', 'Morning (6am to 12pm)'],
  ['afternoon', 'Afternoon (12pm to 5pm)'],
  ['evening', 'Evening (5pm to 9pm)'],
  ['night', 'Night (9pm to 6am)'],
];

export const MIN_OPTIONS = ['2', '3', '5', '10'];

export function heatColor(ratio) {
  if (ratio >= 0.67) return '#DC2626';
  if (ratio >= 0.34) return '#F97316';
  return '#FACC15';
}