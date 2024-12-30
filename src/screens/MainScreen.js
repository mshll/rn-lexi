import { useState, useEffect, useRef } from 'react';
import { Text, XStack, YStack, Button, useWindowDimensions } from 'tamagui';
import { getWordOfTheDay, isWordValid, isCharInWord } from '../utils/wordUtil';
import { Moon, Sun } from '@tamagui/lucide-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Grid from '../components/Grid';
import Keyboard from '../components/Keyboard';
import Toast from '../components/Toast';
import ConfettiCannon from 'react-native-confetti-cannon';

const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;

const MainScreen = ({ isDark, setIsDark }) => {
  const { width: screenWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [currentGuess, setCurrentGuess] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [targetWord, setTargetWord] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [gameOverMessage, setGameOverMessage] = useState('');
  const [hasWon, setHasWon] = useState(false);
  const [keyboardState, setKeyboardState] = useState({});

  // random emoji for title
  const titleEmojis = ['🎯', '🎲', '🎮', '🎪', '🎨', '🧩', '🎱', '🎳', '🎸', '🎭', '🃏'];
  const randomEmoji = titleEmojis[Math.floor(Math.random() * titleEmojis.length)];

  useEffect(() => {
    setTargetWord(getWordOfTheDay());
  }, []);

  // Update keyboard state after each guess
  useEffect(() => {
    const newKeyboardState = {};
    guesses.forEach((guess) => {
      guess.split('').forEach((letter, index) => {
        letter = letter.toLowerCase();
        const currentState = getLetterStatus(letter, index, guess);
        // Only update if the new state is better than the current one
        if (
          !newKeyboardState[letter] ||
          (newKeyboardState[letter] !== 'correct' &&
            (currentState === 'correct' || (currentState === 'present' && newKeyboardState[letter] === 'absent')))
        ) {
          newKeyboardState[letter] = currentState;
        }
      });
    });
    setKeyboardState(newKeyboardState);
  }, [guesses]);

  const onKeyPress = (key) => {
    if (gameOver) return;

    if (key === '⌫') {
      setCurrentGuess((prev) => prev.slice(0, -1));
      return;
    }

    if (key === 'Enter') {
      if (currentGuess.length !== WORD_LENGTH) return;

      // Check for duplicate guess
      if (guesses.includes(currentGuess)) {
        setToastMessage("You've already tried this word");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 1000);
        return;
      }

      if (!isWordValid(currentGuess.toLowerCase())) {
        setToastMessage('Not in word list');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 1000);
        return;
      }

      const newGuesses = [...guesses, currentGuess];
      setGuesses(newGuesses);
      setCurrentGuess('');

      // Check win
      if (currentGuess.toLowerCase() === targetWord) {
        setGameOver(true);
        setHasWon(true);
        setGameOverMessage('Nicely done!');
      } else if (newGuesses.length === MAX_ATTEMPTS) {
        setGameOver(true);
        setGameOverMessage(`Game Over! The word was: ${targetWord.toUpperCase()}`);
      }
      return;
    }

    if (currentGuess.length < WORD_LENGTH) {
      setCurrentGuess((prev) => prev + key);
    }
  };

  const getLetterStatus = (letter, index, guess) => {
    letter = letter.toLowerCase();
    if (guess[index].toLowerCase() === targetWord[index]) return 'correct';
    if (isCharInWord(letter, targetWord)) return 'present';
    return 'absent';
  };

  return (
    <YStack f={1} backgroundColor="$color1">
      <YStack f={1} padding="$4" paddingTop={insets.top} paddingBottom={insets.bottom}>
        <XStack justifyContent="space-between" alignItems="center" marginBottom="$4">
          <Text fontSize="$9" fontWeight="bold" color="$color12">
            Lexi {randomEmoji}
          </Text>
          <Button onPress={() => setIsDark(!isDark)} icon={isDark ? Moon : Sun} backgroundColor="$color3" color="$color12" />
        </XStack>

        <YStack f={1} gap="$2">
          <Grid guesses={guesses} currentGuess={currentGuess} targetWord={targetWord} getLetterStatus={getLetterStatus} />

          <YStack marginTop="auto" position="relative">
            {/* Invalid word toast */}
            {!gameOver && <Toast message={toastMessage} show={showToast} />}
            {/* Game over toast */}
            <Toast message={gameOverMessage} show={gameOver} persistent />
            <Keyboard onKeyPress={onKeyPress} letterStates={keyboardState} />
          </YStack>
        </YStack>
      </YStack>

      {hasWon && <ConfettiCannon count={200} origin={{ x: screenWidth / 2, y: 0 }} autoStart={true} fadeOut={true} />}
    </YStack>
  );
};

export default MainScreen;
