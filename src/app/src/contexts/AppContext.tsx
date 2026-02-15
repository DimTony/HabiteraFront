import React, { type ReactNode } from "react";
import { AuthProvider } from "./AuthContext";
import { NavigationProvider } from "./NavigationContext";
import { DataProvider } from "./DataContext";
import { UIProvider } from "./UIContext";

/**
 * AppContextProvider - Combines all context providers
 *
 * This component wraps the entire app with all necessary context providers.
 * Order matters: UI context should be outermost, then Auth, Navigation, and Data.
 */
export const AppContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  return (
    <UIProvider>
      <AuthProvider>
        <NavigationProvider>
          <DataProvider>{children}</DataProvider>
        </NavigationProvider>
      </AuthProvider>
    </UIProvider>
  );
};

// Re-export hooks for convenience
export { useAuth } from "./AuthContext";
export { useNavigation } from "./NavigationContext";
export { useData } from "./DataContext";
export { useUI } from "./UIContext";
