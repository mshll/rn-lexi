import { StatusBar } from 'expo-status-bar';
import { TamaguiProvider, Theme } from 'tamagui';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useState } from 'react';
import tamaguiConfig from './tamagui.config';
import MainScreen from './src/screens/MainScreen';
import { GameProvider } from './src/contexts/GameContext';

export default function App() {
  const [isDark, setIsDark] = useState(false);

  return (
    <SafeAreaProvider>
      <TamaguiProvider config={tamaguiConfig}>
        <Theme name={isDark ? 'dark' : 'light'}>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <GameProvider>
            <MainScreen isDark={isDark} setIsDark={setIsDark} />
          </GameProvider>
        </Theme>
      </TamaguiProvider>
    </SafeAreaProvider>
  );
}
