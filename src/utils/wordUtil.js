import seedrandom from 'seedrandom';
import { five_char_words } from '../data/words';

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
 * Based on the current day of the year, returns a pseudorandom word from our word bank.
 *
 * @returns The "word of the day" -- which is a pseudorandomly selected word.
 */
const getWordOfTheDay = () => {
  const date = new Date();

  if (isSameDate(date) && cached_idx !== -1) {
    return five_char_words[cached_idx];
  }

  cached_date = date; // Cache the date
  const rng = seedrandom(getDayDiff(date).toString());
  let idx = Math.floor(rng() * five_char_words.length);
  cached_idx = idx; // Cache the index.
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

export { getWordOfTheDay, getDayDiff as getDayOfYear, isCharInWord, isWordValid };
