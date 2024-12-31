import { useState, useEffect, useRef } from 'react';
import { Text, XStack, YStack, Button, useWindowDimensions, Clipboard } from 'tamagui';
import { getWordOfTheDay, isWordValid, isCharInWord, getWinText, getDayOfYear } from '../utils/wordUtil';
import { Moon, Sun, Share2 } from '@tamagui/lucide-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Share } from 'react-native';
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

        const status = getLetterStatus(letter, index, guess);
        // Only update if the new state is better than the current one
        if (!newKeyboardState[letter] || (status === 'present' && newKeyboardState[letter] === 'absent')) {
          newKeyboardState[letter] = status;
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
        setGameOverMessage(getWinText());
      } else if (newGuesses.length === MAX_ATTEMPTS) {
        setGameOver(true);
        setGameOverMessage(`The word was: ${targetWord.toUpperCase()}`);
      }
      return;
    }

    if (currentGuess.length < WORD_LENGTH) {
      setCurrentGuess((prev) => prev + key);
    }
  };

  const getLetterStatus = (letter, index, guess) => {
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

  const generateShareText = () => {
    const dayNumber = getDayOfYear(new Date()) - 9131;
    const header = `Lexi ${randomEmoji} ${dayNumber} ${guesses.length}/${MAX_ATTEMPTS}\n\n`;

    const grid = guesses
      .map((guess) =>
        guess
          .split('')
          .map((letter, index) => {
            const status = getLetterStatus(letter, index, guess);
            return status === 'correct' ? '🟩' : status === 'present' ? '🟨' : '⬛';
          })
          .join('')
      )
      .join('\n');

    return header + grid;
  };

  const handleShare = async () => {
    try {
      const shareText = generateShareText();
      await Share.share({
        message: shareText,
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <YStack f={1} backgroundColor="$color1">
      <YStack f={1} padding="$4" paddingTop={insets.top} paddingBottom={insets.bottom}>
        <XStack justifyContent="space-between" alignItems="center" marginBottom="$4">
          <Text fontSize="$9" fontWeight="bold" color="$color12">
            Lexi {randomEmoji}
          </Text>
          <XStack gap="$2">
            {gameOver && <Button onPress={handleShare} icon={Share2} backgroundColor="$color3" color="$color12" />}
            <Button onPress={() => setIsDark(!isDark)} icon={isDark ? Moon : Sun} backgroundColor="$color3" color="$color12" />
          </XStack>
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
