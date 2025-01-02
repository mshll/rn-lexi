import { XStack, Button, Text } from 'tamagui';
import { ChevronLeft, ChevronRight } from '@tamagui/lucide-icons';
import { useGame } from '../contexts/GameContext';
import { formatDayNumber } from '../utils/wordUtil';
import Calendar from './Calendar';

const DayNavigation = () => {
  const { currentDay, todayNumber, isCurrentDay, navigateDay } = useGame();

  return (
    <XStack justifyContent="center" alignItems="center" gap="$4" marginBottom="$4">
      <Button
        icon={ChevronLeft}
        backgroundColor="$color3"
        color="$color12"
        onPress={() => navigateDay(-1)}
        disabled={currentDay <= todayNumber - 30}
      />
      <Text color="$color12" fontSize="$6">
        {isCurrentDay ? "Today's Puzzle" : formatDayNumber(currentDay)}
      </Text>
      <Button icon={ChevronRight} backgroundColor="$color3" color="$color12" onPress={() => navigateDay(1)} disabled={currentDay >= todayNumber} />
      <Calendar />
    </XStack>
  );
};

export default DayNavigation;
