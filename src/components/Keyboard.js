import { Text, XStack, YStack, Button } from 'tamagui';

const KEYBOARD_LAYOUT = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Enter', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫'],
];

const Keyboard = ({ onKeyPress }) => {
  return (
    <YStack gap="$2" paddingHorizontal="$1">
      {KEYBOARD_LAYOUT.map((row, i) => (
        <XStack key={i} gap="$1.5" justifyContent="center">
          {row.map((key) => {
            const isWide = key === 'Enter' || key === '⌫';
            return (
              <Button
                key={key}
                onPress={() => onKeyPress(key)}
                f={isWide ? 1.5 : 1}
                height={50}
                px="0"
                backgroundColor="$color4"
                pressStyle={{ backgroundColor: '$color5' }}
                color="$color12"
                fontSize={isWide ? 12 : 18}
              >
                <Text color="$color12" fontSize={isWide ? 12 : 18}>
                  {key}
                </Text>
              </Button>
            );
          })}
        </XStack>
      ))}
    </YStack>
  );
};

export default Keyboard;
