'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

type ControllerModeContextValue = {
  isActive: boolean;
  isLoading: boolean;
  refresh: () => Promise<void>;
};

const ControllerModeContext = createContext<ControllerModeContextValue>({
  isActive: false,
  isLoading: true,
  refresh: async () => {},
});

export function useControllerMode() {
  return useContext(ControllerModeContext);
}

export function ControllerModeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth', { credentials: 'same-origin' });
      if (!res.ok) {
        setIsActive(false);
        return;
      }
      const data = (await res.json()) as { authenticated?: boolean };
      setIsActive(Boolean(data.authenticated));
    } catch {
      setIsActive(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onActivate = () => {
      setIsActive(true);
      setIsLoading(false);
    };
    window.addEventListener('controller:activate', onActivate);
    return () => window.removeEventListener('controller:activate', onActivate);
  }, []);

  const value = useMemo(
    () => ({ isActive, isLoading, refresh }),
    [isActive, isLoading, refresh],
  );

  return (
    <ControllerModeContext.Provider value={value}>
      {children}
    </ControllerModeContext.Provider>
  );
}
