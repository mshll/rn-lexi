import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  GAME_STATE: 'lexi_game_state',
  STATISTICS: 'lexi_statistics',
  CURRENT_DAY: 'lexi_current_day',
  COMPLETED_DAYS: 'lexi_completed_days',
  DARK_MODE: 'lexi_dark_mode',
};

export const clearAllData = async () => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
};

const getGameStateKeyForDay = (dayNumber) => `${STORAGE_KEYS.GAME_STATE}_${dayNumber}`;

/**
 * Saves the current game state for a specific day
 */
export const saveGameState = async (gameState) => {
  try {
    const key = getGameStateKeyForDay(gameState.dayNumber);
    await AsyncStorage.setItem(key, JSON.stringify(gameState));
    // Save current day separately for tracking
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_DAY, gameState.dayNumber.toString());
  } catch (error) {
    console.error('Error saving game state:', error);
  }
};

/**
 * Loads the saved game state for a specific day
 */
export const loadGameState = async (dayNumber) => {
  try {
    const key = getGameStateKeyForDay(dayNumber);
    const savedState = await AsyncStorage.getItem(key);
    return savedState ? JSON.parse(savedState) : null;
  } catch (error) {
    console.error('Error loading game state:', error);
    return null;
  }
};

/**
 * Gets the current day being played
 */
export const getCurrentDay = async () => {
  try {
    const currentDay = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_DAY);
    return currentDay ? parseInt(currentDay) : null;
  } catch (error) {
    console.error('Error getting current day:', error);
    return null;
  }
};

/**
 * Updates game statistics
 */
export const updateStatistics = async (gameResult) => {
  try {
    // Check if this day has already been counted
    const completedDaysStr = await AsyncStorage.getItem(STORAGE_KEYS.COMPLETED_DAYS);
    const completedDays = completedDaysStr ? JSON.parse(completedDaysStr) : [];

    // If this day has already been counted, don't update statistics
    if (completedDays.includes(gameResult.dayNumber)) {
      return null;
    }

    // Load existing statistics
    const savedStatsStr = await AsyncStorage.getItem(STORAGE_KEYS.STATISTICS);
    const savedStats = savedStatsStr
      ? JSON.parse(savedStatsStr)
      : {
          gamesPlayed: 0,
          gamesWon: 0,
          guessDistribution: [0, 0, 0, 0, 0, 0],
          currentStreak: 0,
          maxStreak: 0,
          lastPlayedDay: null,
        };

    // Sort completed days to find the last played day
    const sortedDays = [...completedDays, gameResult.dayNumber].sort((a, b) => b - a);
    const lastPlayedDay = sortedDays[1]; // Second element is the previous day (first is current)

    // Calculate new streak
    let newCurrentStreak = savedStats.currentStreak;
    if (gameResult.hasWon) {
      if (lastPlayedDay === null || lastPlayedDay === gameResult.dayNumber - 1) {
        // If this is the first game or was played right after the last game
        newCurrentStreak = savedStats.currentStreak + 1;
      } else if (lastPlayedDay < gameResult.dayNumber - 1) {
        // If there was a gap in play days, start new streak
        newCurrentStreak = 1;
      }
    } else {
      // Reset streak on loss
      newCurrentStreak = 0;
    }

    // Add this day to completed days
    completedDays.push(gameResult.dayNumber);
    await AsyncStorage.setItem(STORAGE_KEYS.COMPLETED_DAYS, JSON.stringify(completedDays));

    // Update statistics
    const newStats = {
      ...savedStats,
      gamesPlayed: savedStats.gamesPlayed + 1,
      gamesWon: savedStats.gamesWon + (gameResult.hasWon ? 1 : 0),
      currentStreak: newCurrentStreak,
      guessDistribution: [...savedStats.guessDistribution],
      lastPlayedDay: gameResult.dayNumber,
    };

    // Update guess distribution if won
    if (gameResult.hasWon) {
      newStats.guessDistribution[gameResult.guesses.length - 1]++;
    }

    // Update max streak
    newStats.maxStreak = Math.max(newStats.maxStreak, newCurrentStreak);

    // Save updated statistics
    await AsyncStorage.setItem(STORAGE_KEYS.STATISTICS, JSON.stringify(newStats));

    return newStats;
  } catch (error) {
    console.error('Error updating statistics:', error);
    return null;
  }
};

/**
 * Loads the saved statistics
 * @returns {Object|null} The saved statistics or null if none exists
 */
export const loadStatistics = async () => {
  try {
    const savedStats = await AsyncStorage.getItem(STORAGE_KEYS.STATISTICS);
    return savedStats ? JSON.parse(savedStats) : null;
  } catch (error) {
    console.error('Error loading statistics:', error);
    return null;
  }
};

/**
 * Saves the dark mode preference
 */
export const saveDarkMode = async (isDark) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.DARK_MODE, JSON.stringify(isDark));
  } catch (error) {
    console.error('Error saving dark mode:', error);
  }
};

/**
 * Loads the dark mode preference
 * @returns {boolean|null} The saved dark mode preference or null if none exists
 */
export const loadDarkMode = async () => {
  try {
    const savedMode = await AsyncStorage.getItem(STORAGE_KEYS.DARK_MODE);
    return savedMode ? JSON.parse(savedMode) : null;
  } catch (error) {
    console.error('Error loading dark mode:', error);
    return null;
  }
};
