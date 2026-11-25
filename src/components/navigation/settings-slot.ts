import {createContext, type ReactNode} from "react";

// The settings button, given by the application so that every game bar can show it
export const SettingsSlot = createContext<ReactNode>(null);
