import { createContext, useContext, useState, useEffect } from 'react';
import { getWordOfTheDay, getDayOfYear } from '../utils/wordUtil';
import { saveGameState, loadGameState, getCurrentDay } from '../utils/storage';

const GameContext = createContext(null);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export const GameProvider = ({ children }) => {
  const [currentGuess, setCurrentGuess] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [targetWord, setTargetWord] = useState('');
  const [hasWon, setHasWon] = useState(false);
  const [currentDay, setCurrentDay] = useState(getDayOfYear(new Date()));
  const [isCurrentDay, setIsCurrentDay] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const todayNumber = getDayOfYear(new Date());

  const resetGameState = () => {
    setGuesses([]);
    setCurrentGuess('');
    setGameOver(false);
    setHasWon(false);
    setTargetWord('');
  };

  const loadGameForDay = async (dayNum) => {
    setIsLoading(true);
    resetGameState();

    try {
      const savedState = await loadGameState(dayNum);

      if (savedState) {
        setGuesses(savedState.guesses);
        setGameOver(savedState.gameOver);
        setHasWon(savedState.hasWon);
        setTargetWord(savedState.targetWord);
      } else {
        const word = getWordOfTheDay(dayNum);
        setTargetWord(word);
        await saveGameState({
          guesses: [],
          gameOver: false,
          hasWon: false,
          targetWord: word,
          dayNumber: dayNum,
        });
      }
    } catch (error) {
      console.error('Error loading game:', error);
      // Set a fallback word in case of error
      const word = getWordOfTheDay(dayNum);
      setTargetWord(word);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateDay = async (direction) => {
    const newDay = currentDay + direction;
    // Only prevent navigating to future days
    if (newDay > todayNumber) return;

    setCurrentDay(newDay);
    setIsCurrentDay(newDay === todayNumber);
    await loadGameForDay(newDay);
  };

  // Initial load
  useEffect(() => {
    const initializeGame = async () => {
      setCurrentDay(todayNumber);
      setIsCurrentDay(true);
      await loadGameForDay(todayNumber);
    };

    initializeGame();
  }, []);

  // Save game state after each guess
  useEffect(() => {
    if (guesses.length > 0) {
      saveGameState({
        guesses,
        gameOver,
        hasWon,
        targetWord,
        dayNumber: currentDay,
      });
    }
  }, [guesses, gameOver, hasWon, currentDay]);

  const value = {
    currentGuess,
    setCurrentGuess,
    guesses,
    setGuesses,
    gameOver,
    setGameOver,
    targetWord,
    hasWon,
    setHasWon,
    currentDay,
    isCurrentDay,
    todayNumber,
    navigateDay,
    resetGameState,
    isLoading,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
