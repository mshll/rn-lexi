import { isWordValid, getWinText } from './wordUtil';

export const getLetterStatus = (letter, index, guess, targetWord) => {
  letter = letter.toLowerCase();
  const targetLetter = targetWord[index];

  // First check for correct position
  if (letter === targetLetter) {
    return 'correct';
  }

  // Count total occurrences of this letter in target word
  const totalInTarget = targetWord.split('').filter((l) => l === letter).length;

  // If none exist, return absent immediately
  if (totalInTarget === 0) return 'absent';

  // Count correct positions of this letter in the entire guess
  const correctPositions = guess.split('').filter((l, i) => l.toLowerCase() === targetWord[i] && l.toLowerCase() === letter).length;

  // Count occurrences of this letter up to current position (excluding correct positions)
  let usedInGuess = 0;
  for (let i = 0; i <= index; i++) {
    const currentLetter = guess[i].toLowerCase();
    if (currentLetter === letter && currentLetter !== targetWord[i]) {
      usedInGuess++;
    }
  }

  // Return 'present' if we haven't used up all occurrences of this letter
  if (usedInGuess + correctPositions <= totalInTarget) {
    return 'present';
  }

  return 'absent';
};

export const generateShareText = (formattedDate, guesses, targetWord, emoji) => {
  const header = `Lexi ${emoji} ${formattedDate} ${guesses.length}/6\n\n`;

  const grid = guesses
    .map((guess) =>
      guess
        .split('')
        .map((letter, index) => {
          const status = getLetterStatus(letter, index, guess, targetWord);
          return status === 'correct' ? '🟩' : status === 'present' ? '🟨' : '⬛';
        })
        .join('')
    )
    .join('\n');

  return header + grid;
};

export const handleGuess = (guess, { guesses, targetWord, setGuesses, setGameOver, setHasWon }) => {
  if (guess.length !== 5) return { isValid: false, message: 'Not enough letters' };

  if (!isWordValid(guess.toLowerCase())) {
    return { isValid: false, message: 'Not in word list' };
  }

  if (guesses.includes(guess)) {
    return { isValid: false, message: "You've already tried this word" };
  }

  const newGuesses = [...guesses, guess];
  setGuesses(newGuesses);

  // Check win condition
  if (guess.toLowerCase() === targetWord) {
    setGameOver(true);
    setHasWon(true);
    return { isValid: true, isWin: true, message: getWinText() };
  }

  // Check lose condition
  if (newGuesses.length === 6) {
    setGameOver(true);
    return { isValid: true, isWin: false, message: `The word was: ${targetWord.toUpperCase()}` };
  }

  return { isValid: true };
};
