import seedrandom from 'seedrandom';
import { five_char_words } from '../data/words';
import { format } from 'date-fns';

let cached_date = new Date();
let cached_idx = -1;

/**
 * Determines the number of days a specific `Date` has been since 01/01/2000.
 * @param date The `Date` in question
 * @returns The number of days `date` has been since 01/01/2000.
 */
const getDayDiff = (date) => {
  return Math.floor((date.valueOf() - new Date(2000, 0, 0).valueOf()) / (1000 * 60 * 60 * 24));
};

/**
 * Converts a day number back to a Date object
 * @param dayNumber The number of days since 01/01/2000
 * @returns The corresponding Date object
 */
const dayNumberToDate = (dayNumber) => {
  const date = new Date(2000, 0, 0);
  date.setDate(date.getDate() + dayNumber);
  return date;
};

/**
 * Formats a day number into a readable date string
 * @param dayNumber The number of days since 01/01/2000
 * @returns A formatted date string (e.g., "Feb 15, 2024")
 */
const formatDayNumber = (dayNumber) => {
  const date = dayNumberToDate(dayNumber);
  return format(date, 'MMM d, yyyy');
};

/**
 * Determines whether a specific Date is the same as our currently cached date.
 * For our purpose, a Date is the same if the day, month, and full year match.
 * @param date The Date in question.
 * @returns Whether or not a Date's day, month, and full year match the cached date.
 */
const isSameDate = (date) => {
  return date.getDay() === cached_date.getDay() && date.getMonth() === cached_date.getMonth() && date.getFullYear() === cached_date.getFullYear();
};

/**
 * Checks to see if a character is present within a word.
 *
 * @param guess The character in question
 * @param ans The word we are looking to find the character in
 * @returns Whether or not guess is present in ans.
 */
const isCharInWord = (guess, ans) => {
  for (let i = 0; i < ans.length; i++) {
    if (guess === ans[i]) {
      return true;
    }
  }
  return false;
};

/**
 * Based on the provided day number, returns a pseudorandom word from our word bank.
 * If no day is provided, uses the current day.
 * @param {number} [specificDay] - Optional specific day number to get word for
 * @returns The word for the specified day
 */
const getWordOfTheDay = (specificDay) => {
  const date = new Date();
  const dayNumber = specificDay || getDayDiff(date);

  if (!specificDay && isSameDate(date) && cached_idx !== -1) {
    return five_char_words[cached_idx];
  }

  if (specificDay) {
    const rng = seedrandom(dayNumber.toString());
    return five_char_words[Math.floor(rng() * five_char_words.length)];
  }

  cached_date = date; // Cache the date
  const rng = seedrandom(dayNumber.toString());
  let idx = Math.floor(rng() * five_char_words.length);
  cached_idx = idx; // Cache the index only for current day
  return five_char_words[idx];
};

/**
 * Checks to see if a word is valid.
 *
 * @param word The word in question
 * @returns Whether or not the word is valid.
 */
const isWordValid = (word) => {
  return five_char_words.includes(word);
};

const winText = [
  'Splendid!',
  'Nicely Done!',
  'Brilliant!',
  'Fantastic!',
  'Amazing!',
  'Great Job!',
  'Well Done!',
  'Excellent!',
  'Outstanding!',
  'Superb!',
  'Magnificent!',
  'Impressive!',
  'Stellar Work!',
  'You Got It!',
  'Perfect!',
];

const getWinText = () => {
  const rng = seedrandom(getDayDiff(new Date()).toString());
  const idx = Math.floor(rng() * winText.length);
  return winText[idx];
};

export { getWordOfTheDay, getDayDiff as getDayOfYear, isCharInWord, isWordValid, getWinText, formatDayNumber };
