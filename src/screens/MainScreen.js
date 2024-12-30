import { useState, useEffect } from 'react';
import { Text, XStack, YStack, Button } from 'tamagui';
import { getWordOfTheDay, isWordValid, isCharInWord } from '../utils/wordUtil';
import { Moon, Sun } from '@tamagui/lucide-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Grid from '../components/Grid';
import Keyboard from '../components/Keyboard';
import Toast from '../components/Toast';

const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;

const MainScreen = ({ isDark, setIsDark }) => {
  const insets = useSafeAreaInsets();
  const [currentGuess, setCurrentGuess] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [targetWord, setTargetWord] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    setTargetWord(getWordOfTheDay());
  }, []);

  const onKeyPress = (key) => {
    if (gameOver) return;

    if (key === '⌫') {
      setCurrentGuess((prev) => prev.slice(0, -1));
      return;
    }

    if (key === 'Enter') {
      if (currentGuess.length !== WORD_LENGTH) return;
      if (!isWordValid(currentGuess.toLowerCase())) {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 1000);
        return;
      }

      const newGuesses = [...guesses, currentGuess];
      setGuesses(newGuesses);
      setCurrentGuess('');

      if (currentGuess.toLowerCase() === targetWord || newGuesses.length === MAX_ATTEMPTS) {
        setGameOver(true);
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
          <Text fontSize={24} fontWeight="bold" color="$color12">
            JUMBLE
          </Text>
          <Button onPress={() => setIsDark(!isDark)} icon={isDark ? Moon : Sun} backgroundColor="$color3" color="$color12" />
        </XStack>

        <YStack f={1} gap="$2">
          <Grid guesses={guesses} currentGuess={currentGuess} targetWord={targetWord} getLetterStatus={getLetterStatus} />

          <YStack marginTop="auto" position="relative">
            <Toast message="Not in word list!" show={showToast} />
            <Keyboard onKeyPress={onKeyPress} />
          </YStack>
        </YStack>
      </YStack>
    </YStack>
  );
};

export default MainScreen;
