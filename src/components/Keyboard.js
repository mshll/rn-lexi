import { Text, XStack, YStack, Button, View, useWindowDimensions } from 'tamagui';
import { COLORS } from '../constants/colors';

const KEYBOARD_LAYOUT = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Enter', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫'],
];

const Keyboard = ({ onKeyPress, letterStates = {} }) => {
  const { width: screenWidth } = useWindowDimensions();

  // Calculate key sizes based on screen width
  const horizontalPadding = 5; // Total horizontal padding
  const gapSize = 6; // Gap between keys
  const availableWidth = screenWidth - horizontalPadding;

  // Use first row (10 keys) as reference for key size
  const regularKeyWidth = Math.floor((availableWidth - 9 * gapSize) / 10);
  const wideKeyWidth = Math.floor(regularKeyWidth * 1.5);
  const keyHeight = Math.floor(regularKeyWidth * 1.8);

  const getKeyBackground = (key) => {
    if (key === 'Enter' || key === '⌫') return COLORS.keyboard.default;
    const state = letterStates[key.toLowerCase()];
    if (!state) return COLORS.keyboard.default;
    return COLORS[state];
  };

  return (
    <YStack gap="$2" paddingHorizontal="$2">
      {/* First row - 10 keys */}
      <XStack gap="$1.5" justifyContent="center">
        {KEYBOARD_LAYOUT[0].map((key) => (
          <Button
            key={key}
            onPress={() => onKeyPress(key)}
            width={regularKeyWidth}
            height={keyHeight}
            backgroundColor={getKeyBackground(key)}
            pressStyle={COLORS.keyboard.pressed}
            color={COLORS.text}
            p={0}
          >
            <Text color={COLORS.text} fontSize={Math.floor(regularKeyWidth * 0.5)}>
              {key}
            </Text>
          </Button>
        ))}
      </XStack>

      {/* Second row - 9 keys */}
      <XStack gap="$1.5" justifyContent="center">
        <View width={regularKeyWidth / 2} />
        {KEYBOARD_LAYOUT[1].map((key) => (
          <Button
            key={key}
            onPress={() => onKeyPress(key)}
            width={regularKeyWidth}
            height={keyHeight}
            backgroundColor={getKeyBackground(key)}
            pressStyle={COLORS.keyboard.pressed}
            color={COLORS.text}
            p={0}
          >
            <Text color={COLORS.text} fontSize={Math.floor(regularKeyWidth * 0.5)}>
              {key}
            </Text>
          </Button>
        ))}
        <View width={regularKeyWidth / 2} />
      </XStack>

      {/* Third row - 9 keys with wide edge keys */}
      <XStack gap="$1.5" justifyContent="center">
        {KEYBOARD_LAYOUT[2].map((key) => {
          const isWide = key === 'Enter' || key === '⌫';
          return (
            <Button
              key={key}
              onPress={() => onKeyPress(key)}
              width={isWide ? wideKeyWidth : regularKeyWidth}
              height={keyHeight}
              backgroundColor={getKeyBackground(key)}
              pressStyle={COLORS.keyboard.pressed}
              color={COLORS.text}
              p={0}
            >
              <Text color={COLORS.text} fontSize={isWide ? Math.floor(regularKeyWidth * 0.35) : Math.floor(regularKeyWidth * 0.5)}>
                {key}
              </Text>
            </Button>
          );
        })}
      </XStack>
    </YStack>
  );
};

export default Keyboard;
