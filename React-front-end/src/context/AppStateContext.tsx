import React, { createContext, useContext, useState } from 'react';

interface AppState {
  showAttendanceViewer: boolean;
  isMarkingAttendance: boolean;
  showRegistrationInputs: boolean;
}

interface AppStateContextType {
  state: AppState;
  resetState: () => void;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

const initialState: AppState = {
  showAttendanceViewer: false,
  isMarkingAttendance: false,
  showRegistrationInputs: false,
};

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);

  const resetState = () => {
    setState(initialState);
  };

  return (
    <AppStateContext.Provider value={{ state, setState, resetState }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}