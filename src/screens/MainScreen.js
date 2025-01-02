import { useState, useEffect } from 'react';
import { Text, XStack, YStack, Button, useWindowDimensions, Spinner } from 'tamagui';
import { Moon, Sun, Share2, BarChart2 } from '@tamagui/lucide-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Share } from 'react-native';
import { useGame } from '../contexts/GameContext';
import { useKeyboardState } from '../hooks/useKeyboardState';
import { handleGuess, generateShareText, getLetterStatus } from '../utils/gameLogic';
import { getWinText, formatDayNumber } from '../utils/wordUtil';
import { saveDarkMode, loadDarkMode, updateStatistics } from '../utils/storage';
import Grid from '../components/Grid';
import Keyboard from '../components/Keyboard';
import Toast from '../components/Toast';
import DayNavigation from '../components/DayNavigation';
import StatsModal from '../components/StatsModal';
import ConfettiCannon from 'react-native-confetti-cannon';

const WORD_LENGTH = 5;

// Random emoji for title - could be moved to a constants file
const titleEmojis = ['🎯', '🎲', '🎮', '🎪', '🎨', '🧩', '🎱', '🎳', '🎸', '🎭', '🃏'];
const randomEmoji = titleEmojis[Math.floor(Math.random() * titleEmojis.length)];

const MainScreen = ({ isDark, setIsDark }) => {
  const { width: screenWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const keyboardState = useKeyboardState();
  const [toast, setToast] = useState({ show: false, message: '', persistent: false });
  const [showStats, setShowStats] = useState(false);

  const {
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
    isLoading,
    todayNumber,
  } = useGame();

  useEffect(() => {
    if (gameOver) {
      // Update statistics when game is over
      updateStatistics({
        dayNumber: currentDay,
        hasWon,
        guesses,
      });

      // Show stats modal after a short delay, but only for today's puzzle
      if (currentDay === todayNumber) {
        setTimeout(() => {
          setShowStats(true);
        }, 1500); // Delay to allow confetti and toast to show first
      }

      setToast({
        show: true,
        message: hasWon ? getWinText() : `The word was: '${targetWord}'`,
        persistent: true,
      });
    } else {
      setToast({ show: false, message: '', persistent: false });
    }
  }, [gameOver, hasWon, targetWord, currentDay, guesses, todayNumber]);

  const onKeyPress = (key) => {
    if (gameOver) return;

    if (key === '⌫') {
      setCurrentGuess((prev) => prev.slice(0, -1));
      return;
    }

    if (key === 'Enter') {
      if (currentGuess.length !== WORD_LENGTH) return;

      const result = handleGuess(currentGuess, {
        guesses,
        targetWord,
        setGuesses,
        setGameOver,
        setHasWon,
      });

      if (!result.isValid) {
        setToast({ show: true, message: result.message, persistent: false });
        setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 1000);
        return;
      }

      setCurrentGuess('');
      return;
    }

    if (currentGuess.length < WORD_LENGTH) {
      setCurrentGuess((prev) => prev + key);
    }
  };

  const handleShare = async () => {
    try {
      const formattedDate = formatDayNumber(currentDay);
      const shareText = generateShareText(formattedDate, guesses, targetWord, randomEmoji);
      await Share.share({ message: shareText });
    } catch (error) {
      console.log(error);
    }
  };

  // Load saved dark mode preference
  useEffect(() => {
    const loadSavedMode = async () => {
      const savedMode = await loadDarkMode();
      if (savedMode !== null) {
        setIsDark(savedMode);
      }
    };
    loadSavedMode();
    console.log(targetWord);
  }, []);

  // Save dark mode preference when it changes
  const handleThemeToggle = async () => {
    const newMode = !isDark;
    setIsDark(newMode);
    await saveDarkMode(newMode);
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
            <Button onPress={() => setShowStats(true)} icon={BarChart2} backgroundColor="$color3" color="$color12" />
            <Button onPress={handleThemeToggle} icon={isDark ? Moon : Sun} backgroundColor="$color3" color="$color12" />
          </XStack>
        </XStack>

        <DayNavigation />

        {isLoading ? (
          <YStack f={1} justifyContent="center" alignItems="center">
            <Spinner size="large" color="$color12" />
          </YStack>
        ) : (
          <YStack f={1} gap="$2">
            <Grid guesses={guesses} currentGuess={currentGuess} targetWord={targetWord} getLetterStatus={getLetterStatus} />

            <YStack marginTop="auto" position="relative">
              <Toast message={toast.message} show={toast.show} persistent={toast.persistent} />
              <Keyboard onKeyPress={onKeyPress} letterStates={keyboardState} />
            </YStack>
          </YStack>
        )}
      </YStack>

      {hasWon && <ConfettiCannon count={200} origin={{ x: screenWidth / 2, y: 0 }} autoStart={true} fadeOut={true} />}

      <StatsModal open={showStats} onOpenChange={setShowStats} />
    </YStack>
  );
};

export default MainScreen;
