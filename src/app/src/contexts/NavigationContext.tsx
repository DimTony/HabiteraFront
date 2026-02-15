import React, { createContext, useContext, useState, type ReactNode, startTransition } from 'react';
import type { NavigationState } from '../types/navigation.types';
import type { Screen, Tab } from '../types/common.types';

interface NavigationContextType {
  currentScreen: Screen;
  currentTab: Tab;
  navigationHistory: NavigationState[];
  
  // Navigation actions
  navigateToScreen: (screen: Screen, tab?: Tab) => void;
  navigateBack: () => void;
  clearNavigationHistory: () => void;
  setCurrentTab: (tab: Tab) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('initial-login');
  const [currentTab, setCurrentTab] = useState<Tab>('home');
  const [navigationHistory, setNavigationHistory] = useState<NavigationState[]>([]);

  const navigateToScreen = (screen: Screen, tab?: Tab) => {
    startTransition(() => {
      // Push current state to history before navigating
      setNavigationHistory(prev => [...prev, { 
        screen: currentScreen, 
        tab: currentTab 
      }]);
      setCurrentScreen(screen);
      if (tab) {
        setCurrentTab(tab);
      }
    });
  };

  const navigateBack = () => {
    startTransition(() => {
      if (navigationHistory.length > 0) {
        // Pop the last state from history
        const previousState = navigationHistory[navigationHistory.length - 1];
        setNavigationHistory(prev => prev.slice(0, -1));
        setCurrentScreen(previousState.screen);
        if (previousState.tab) {
          setCurrentTab(previousState.tab);
        }
      } else {
        // Fallback to dashboard
        setCurrentScreen('dashboard');
        setCurrentTab('home');
      }
    });
  };

  const clearNavigationHistory = () => {
    setNavigationHistory([]);
  };

  return (
    <NavigationContext.Provider
      value={{
        currentScreen,
        currentTab,
        navigationHistory,
        navigateToScreen,
        navigateBack,
        clearNavigationHistory,
        setCurrentTab
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
