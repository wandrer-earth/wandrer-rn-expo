import { useCallback } from 'react';
import { useMapStateStore } from '../stores/mapStateStore';
import { useToast } from '../components/Toast';

export const useMapPreferences = () => {
  const { preferences, setPreferences, clearSavedState } = useMapStateStore();
  const { showToast } = useToast();

  const toggleAlwaysStartAtCurrentLocation = useCallback(() => {
    const newValue = !preferences.alwaysStartAtCurrentLocation;
    setPreferences({ alwaysStartAtCurrentLocation: newValue });
    
    showToast(
      newValue 
        ? 'Map will always start at your current location'
        : 'Map will remember your last position',
      'success',
      2000
    );
  }, [preferences.alwaysStartAtCurrentLocation, setPreferences, showToast]);

  const toggleSaveMapPosition = useCallback(() => {
    const newValue = !preferences.saveMapPosition;
    setPreferences({ saveMapPosition: newValue });
    
    if (!newValue) {
      // Clear saved state when disabling position saving
      clearSavedState();
    }
    
    showToast(
      newValue 
        ? 'Map position saving enabled'
        : 'Map position saving disabled',
      'success',
      2000
    );
  }, [preferences.saveMapPosition, setPreferences, clearSavedState, showToast]);

  const setMaxStateAgeDays = useCallback((days: number) => {
    setPreferences({ maxStateAgeDays: days });
    
    showToast(
      `Map position will be kept for ${days} days`,
      'success',
      2000
    );
  }, [setPreferences, showToast]);

  const resetMapPreferences = useCallback(() => {
    setPreferences({
      alwaysStartAtCurrentLocation: false,
      saveMapPosition: true,
      maxStateAgeDays: 7,
    });
    
    showToast(
      'Map preferences reset to defaults',
      'success',
      2000
    );
  }, [setPreferences, showToast]);

  return {
    preferences,
    toggleAlwaysStartAtCurrentLocation,
    toggleSaveMapPosition,
    setMaxStateAgeDays,
    resetMapPreferences,
  };
};