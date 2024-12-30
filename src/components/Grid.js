import { View, Text, XStack, YStack, Square } from 'tamagui';
import { COLORS } from '../constants/colors';

const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;

const Grid = ({ guesses, currentGuess, targetWord, getLetterStatus }) => {
  return (
    <YStack gap="$2" marginBottom="$4" alignItems="center">
      {Array(MAX_ATTEMPTS)
        .fill(0)
        .map((_, i) => (
          <XStack key={i} gap="$2">
            {Array(WORD_LENGTH)
              .fill(0)
              .map((_, j) => {
                const guessLetter = guesses[i]?.[j] || (i === guesses.length ? currentGuess[j] : '');
                const status = guesses[i] ? getLetterStatus(guessLetter, j, guesses[i]) : 'empty';

                return (
                  <Square
                    key={j}
                    width={60}
                    height={60}
                    borderWidth={2}
                    borderRadius="$2"
                    borderColor={status === 'empty' ? COLORS.emptyBorder : 'transparent'}
                    backgroundColor={COLORS[status]}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize={24} fontWeight="bold" color={COLORS.text}>
                      {guessLetter}
                    </Text>
                  </Square>
                );
              })}
          </XStack>
        ))}
    </YStack>
  );
};

export default Grid;
