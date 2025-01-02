import { useState, useEffect } from 'react';
import { Sheet, YStack, XStack, Text, Button } from 'tamagui';
import { Share2 } from '@tamagui/lucide-icons';
import { Share } from 'react-native';
import { loadStatistics } from '../utils/storage';
import { useGame } from '../contexts/GameContext';
import { generateShareText } from '../utils/gameLogic';
import { formatDayNumber } from '../utils/wordUtil';

const StatsModal = ({ open, onOpenChange }) => {
  const [stats, setStats] = useState(null);
  const { currentDay, todayNumber, guesses, gameOver, hasWon, targetWord } = useGame();

  useEffect(() => {
    if (open) {
      loadStatistics().then((loadedStats) => {
        setStats(
          loadedStats || {
            gamesPlayed: 0,
            gamesWon: 0,
            guessDistribution: [0, 0, 0, 0, 0, 0],
            currentStreak: 0,
            maxStreak: 0,
          }
        );
      });
    }
  }, [open]);

  const calculateWinPercentage = () => {
    if (!stats || stats.gamesPlayed === 0) return 0;
    return Math.round((stats.gamesWon / stats.gamesPlayed) * 100);
  };

  const maxDistribution = Math.max(...(stats?.guessDistribution || [0]));

  const handleShare = async () => {
    try {
      const formattedDate = formatDayNumber(currentDay);
      const shareText = generateShareText(formattedDate, guesses, targetWord, '🎯');
      await Share.share({ message: shareText });
    } catch (error) {
      console.log(error);
    }
  };

  const showShareButton = currentDay === todayNumber && gameOver && hasWon;

  return (
    <Sheet modal open={open} onOpenChange={onOpenChange} dismissOnSnapToBottom position={0} snapPointsMode="fit">
      <Sheet.Overlay />
      <Sheet.Frame padding="$4">
        <Sheet.Handle />

        <YStack gap="$4" pb="$10">
          <Text fontSize="$8" fontWeight="bold" color="$color12" textAlign="center">
            Statistics
          </Text>

          {/* Stats Overview */}
          <XStack justifyContent="space-around" paddingVertical="$4">
            <YStack alignItems="center" gap="$2">
              <Text fontSize="$8" fontWeight="bold" color="$color12">
                {stats?.gamesPlayed || 0}
              </Text>
              <Text fontSize="$4" color="$color11" textAlign="center">
                Played
              </Text>
            </YStack>
            <YStack alignItems="center" gap="$2">
              <Text fontSize="$8" fontWeight="bold" color="$color12">
                {calculateWinPercentage()}%
              </Text>
              <Text fontSize="$4" color="$color11" textAlign="center">
                Win %
              </Text>
            </YStack>
            <YStack alignItems="center" gap="$2">
              <Text fontSize="$8" fontWeight="bold" color="$color12">
                {stats?.currentStreak || 0}
              </Text>
              <Text fontSize="$4" color="$color11" textAlign="center">
                Current{'\n'}Streak
              </Text>
            </YStack>
            <YStack alignItems="center" gap="$2">
              <Text fontSize="$8" fontWeight="bold" color="$color12">
                {stats?.maxStreak || 0}
              </Text>
              <Text fontSize="$4" color="$color11" textAlign="center">
                Max{'\n'}Streak
              </Text>
            </YStack>
          </XStack>

          {/* Guess Distribution */}
          <YStack gap="$2">
            <Text fontSize="$6" fontWeight="bold" color="$color12" textAlign="center">
              Guess Distribution
            </Text>
            {stats?.guessDistribution?.map((count, index) => {
              const isCurrentDayGuesses = currentDay === todayNumber && guesses.length === index + 1;
              return (
                <XStack key={index} alignItems="center" gap="$2">
                  <Text fontSize="$5" color="$color12" width={20}>
                    {index + 1}
                  </Text>
                  <XStack flex={1} height={32} backgroundColor="$color3" opacity={count > 0 ? 1 : 0.5}>
                    <XStack
                      backgroundColor={isCurrentDayGuesses ? '$green8' : '$color4'}
                      width={`${count > 0 ? (count / maxDistribution) * 100 : 0}%`}
                      alignItems="center"
                      justifyContent="flex-end"
                      paddingHorizontal="$2"
                    >
                      <Text color="$color12" fontSize="$4">
                        {count}
                      </Text>
                    </XStack>
                  </XStack>
                </XStack>
              );
            })}

            {/* Share Button */}
            {showShareButton && (
              <Button onPress={handleShare} backgroundColor="$green7" color="$color12" size="$5" marginTop="$4" pressStyle={{ opacity: 0.7 }}>
                <Share2 size={20} />
                <Text fontSize="$5" marginLeft="$1">
                  Share Your Score
                </Text>
              </Button>
            )}
          </YStack>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
};

export default StatsModal;
