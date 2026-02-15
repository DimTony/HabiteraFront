import { useState, useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { SafeArea } from "capacitor-plugin-safe-area";

export interface SafeAreaInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface SafeAreaHookResult {
  safeArea: SafeAreaInsets;
  isLoading: boolean;
  isNative: boolean;
  getSafeAreaStyle: () => React.CSSProperties;
}

export const useSafeArea = (): SafeAreaHookResult => {
  const [safeArea, setSafeArea] = useState<SafeAreaInsets>({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    const getSafeAreaInsets = async () => {
      try {
        if (isNative) {
          const { insets } = await SafeArea.getSafeAreaInsets();
          setSafeArea({
            top: insets.top,
            right: insets.right,
            bottom: insets.bottom,
            left: insets.left,
          });
        } else {
          // Fallback values for web
          setSafeArea({
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
          });
        }
      } catch (error) {
        // console.log("SafeArea not available, using fallback values", error);
        setSafeArea({
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        });
      } finally {
        setIsLoading(false);
      }
    };

    getSafeAreaInsets();
  }, [isNative]);

  // Helper function to get safe area style
  const getSafeAreaStyle = (): React.CSSProperties => ({
    paddingTop: `${safeArea.top}px`,
    paddingRight: `${safeArea.right}px`,
    paddingBottom: `${safeArea.bottom}px`,
    paddingLeft: `${safeArea.left}px`,
  });

  return {
    safeArea,
    isLoading,
    isNative,
    getSafeAreaStyle,
  };
};
