import { useState, useEffect } from 'react';
import { XStack, YStack, Button, Text, Sheet } from 'tamagui';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from '@tamagui/lucide-icons';
import { useGame } from '../contexts/GameContext';
import { loadGameState } from '../utils/storage';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  addMonths,
  subMonths,
  isSameDay,
  isToday,
  startOfDay,
  isAfter,
  isBefore,
  startOfWeek,
  endOfWeek,
} from 'date-fns';

const Calendar = () => {
  const [open, setOpen] = useState(false);
  const { currentDay, todayNumber, navigateDay } = useGame();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [gameStates, setGameStates] = useState({});

  // Load game states for visible month
  useEffect(() => {
    const loadMonthGameStates = async () => {
      const days = generateCalendarDays();
      const states = {};

      for (const date of days) {
        const dayNum = dateToDayNumber(date);
        if (dayNum <= todayNumber) {
          const state = await loadGameState(dayNum);
          if (state) {
            states[dayNum] = state;
          }
        }
      }

      setGameStates(states);
    };

    if (open) {
      loadMonthGameStates();
    }
  }, [currentMonth, open]);

  // Convert Date to our custom day number (days since Jan 1, 2000)
  const dateToDayNumber = (date) => {
    return Math.floor((startOfDay(date).valueOf() - new Date(2000, 0, 0).valueOf()) / (1000 * 60 * 60 * 24));
  };

  const generateCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    // Include days from previous/next months to fill the weeks
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // 0 = Sunday
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  };

  const handleDaySelect = (date) => {
    const dayNum = dateToDayNumber(date);
    // Only prevent selecting future dates
    if (dayNum <= todayNumber) {
      const diff = dayNum - currentDay;
      navigateDay(diff);
      setOpen(false);
    }
  };

  const navigateMonth = (direction) => {
    const newMonth = direction === 'next' ? addMonths(currentMonth, 1) : subMonths(currentMonth, 1);
    // Don't allow navigating past the current month
    if (isBefore(newMonth, new Date()) || isSameDay(startOfMonth(newMonth), startOfMonth(new Date()))) {
      setCurrentMonth(newMonth);
    }
  };

  const isDateSelectable = (date) => {
    const dayNum = dateToDayNumber(date);
    // Only prevent selecting future dates
    return dayNum <= todayNumber;
  };

  const getDayButtonStyle = (date) => {
    const dayNum = dateToDayNumber(date);
    const isSelected = dayNum === currentDay;
    const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
    const today = startOfDay(new Date());
    const gameState = gameStates[dayNum];

    // Don't show future dates or dates from other months
    if (isAfter(date, today) || !isCurrentMonth) {
      return null;
    }

    const style = {
      backgroundColor: isSelected ? '$color6' : '$color3',
      position: 'relative',
      ...(isSelected && {
        borderWidth: 2,
        borderColor: '$color12',
      }),
    };

    // Style based on game state
    if (gameState) {
      if (gameState.gameOver) {
        style.backgroundColor = gameState.hasWon ? '$green8' : '$red8';
        style.opacity = 0.8;
      } else if (gameState.guesses.length > 0) {
        style.backgroundColor = '$yellow8';
        style.opacity = 0.8;
      }
    }

    return style;
  };

  const renderDayContent = (date) => {
    const dayNum = dateToDayNumber(date);
    const gameState = gameStates[dayNum];

    return (
      <YStack justifyContent="center" alignItems="center" f={1} gap="$1">
        <Text color="$color12" fontSize="$6" textAlign="center">
          {format(date, 'd')}
        </Text>
        {gameState && gameState.guesses.length > 0 && !gameState.gameOver && (
          <Text color="$color12" fontSize="$3" textAlign="center" opacity={0.8}>
            {gameState.guesses.length}/6
          </Text>
        )}
        {gameState && gameState.gameOver && gameState.hasWon && (
          <Text color="$color12" fontSize="$3" textAlign="center">
            {gameState.guesses.length}/6
          </Text>
        )}
      </YStack>
    );
  };

  return (
    <>
      <Button icon={CalendarIcon} backgroundColor="$color3" color="$color12" onPress={() => setOpen(true)} />

      <Sheet modal open={open} onOpenChange={setOpen} snapPoints={[85]} dismissOnSnapToBottom position={0}>
        <Sheet.Overlay />
        <Sheet.Frame padding="$4">
          <Sheet.Handle />

          <YStack gap="$4">
            {/* Title */}
            <Text fontSize="$8" fontWeight="bold" color="$color12" textAlign="center">
              Lexi Archive
            </Text>

            {/* Month Navigation */}
            <XStack justifyContent="space-between" alignItems="center">
              <Button icon={ChevronLeft} size="$4" backgroundColor="$color3" color="$color12" onPress={() => navigateMonth('prev')} />
              <Text fontSize="$7" fontWeight="bold" color="$color12">
                {format(currentMonth, 'MMMM yyyy')}
              </Text>
              <Button
                icon={ChevronRight}
                size="$4"
                backgroundColor="$color3"
                color="$color12"
                onPress={() => navigateMonth('next')}
                disabled={isSameDay(startOfMonth(currentMonth), startOfMonth(new Date()))}
              />
            </XStack>

            {/* Weekday Headers */}
            <XStack justifyContent="space-between">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <Text key={day} color="$color11" fontSize="$5" width={45} textAlign="center">
                  {day}
                </Text>
              ))}
            </XStack>

            {/* Calendar Grid */}
            <YStack gap="$3">
              {chunk(generateCalendarDays(), 7).map((week, weekIndex) => (
                <XStack key={weekIndex} justifyContent="space-between">
                  {week.map((date) => {
                    const buttonStyle = getDayButtonStyle(date);
                    // Don't render future dates
                    if (!buttonStyle) return <Button key={date.toISOString()} width={45} height={45} opacity={0} disabled />;

                    const isSelectable = isDateSelectable(date);

                    return (
                      <Button
                        key={date.toISOString()}
                        width={45}
                        height={45}
                        p={0}
                        {...buttonStyle}
                        color="$color12"
                        onPress={() => handleDaySelect(date)}
                        disabled={!isSelectable}
                      >
                        {renderDayContent(date)}
                      </Button>
                    );
                  })}
                </XStack>
              ))}
            </YStack>
          </YStack>
        </Sheet.Frame>
      </Sheet>
    </>
  );
};

// Helper function to chunk array into weeks
const chunk = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

export default Calendar;
