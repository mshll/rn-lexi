import { useState, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import { getLetterStatus } from '../utils/gameLogic';

export const useKeyboardState = () => {
  const [keyboardState, setKeyboardState] = useState({});
  const { guesses, targetWord, isLoading } = useGame();

  useEffect(() => {
    // Don't update keyboard state while loading or if targetWord is not set
    if (isLoading || !targetWord) return;

    const newKeyboardState = {};
    guesses.forEach((guess) => {
      // First mark all correct letters
      guess.split('').forEach((letter, index) => {
        letter = letter.toLowerCase();
        if (letter === targetWord[index]) {
          newKeyboardState[letter] = 'correct';
        }
      });

      // Then handle present/absent states
      guess.split('').forEach((letter, index) => {
        letter = letter.toLowerCase();
        // Skip if already marked as correct
        if (newKeyboardState[letter] === 'correct') return;

        const status = getLetterStatus(letter, index, guess, targetWord);
        // Only update if the new state is better than the current one
        if (!newKeyboardState[letter] || (status === 'present' && newKeyboardState[letter] === 'absent')) {
          newKeyboardState[letter] = status;
        }
      });
    });
    setKeyboardState(newKeyboardState);
  }, [guesses, targetWord, isLoading]);

  return keyboardState;
};
