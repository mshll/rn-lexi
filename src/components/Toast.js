import { Text, YStack, AnimatePresence } from 'tamagui';

const Toast = ({ message, show }) => {
  return (
    <AnimatePresence>
      {show && (
        <YStack
          animation="quick"
          enterStyle={{ opacity: 0, scale: 0.9 }}
          exitStyle={{ opacity: 0, scale: 0.9 }}
          opacity={1}
          scale={1}
          backgroundColor="$color4"
          paddingVertical="$2"
          paddingHorizontal="$4"
          borderRadius="$4"
          position="absolute"
          bottom="100%"
          marginBottom="$5"
          alignSelf="center"
          zIndex={1}
        >
          <Text color="$color12" textAlign="center" fontSize="$6">
            {message}
          </Text>
        </YStack>
      )}
    </AnimatePresence>
  );
};

export default Toast;
