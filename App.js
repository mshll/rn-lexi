import { StatusBar } from 'expo-status-bar';
import { TamaguiProvider, Theme } from 'tamagui';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useState } from 'react';
import tamaguiConfig from './tamagui.config';
import MainScreen from './src/screens/MainScreen';

export default function App() {
  const [isDark, setIsDark] = useState(false);

  return (
    <SafeAreaProvider>
      <TamaguiProvider config={tamaguiConfig}>
        <Theme name={isDark ? 'dark' : 'light'}>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <MainScreen isDark={isDark} setIsDark={setIsDark} />
        </Theme>
      </TamaguiProvider>
    </SafeAreaProvider>
  );
}
