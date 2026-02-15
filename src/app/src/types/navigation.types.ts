import type { Screen, Tab } from "./common.types";

export interface NavigationState {
  screen: Screen;
  tab?: Tab;
}

export interface NavigationHistory {
  history: NavigationState[];
  currentScreen: Screen;
  currentTab: Tab;
}
