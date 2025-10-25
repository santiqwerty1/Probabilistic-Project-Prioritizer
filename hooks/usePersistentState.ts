// FIX: Import React to make React.Dispatch and React.SetStateAction available.
import React, { useState, useEffect } from 'react';

function usePersistentState<T>(
    key: string, 
    initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const storedValue = localStorage.getItem(key);
      if (storedValue) {
        return JSON.parse(storedValue);
      }
    } catch (error) {
      console.error(`Error reading localStorage key “${key}”:`, error);
    }
    return initialValue;
  });

  useEffect(() => {
    try {
      const isEmpty = state === null || 
                      state === undefined || 
                      (Array.isArray(state) && state.length === 0) || 
                      (typeof state === 'object' && !Array.isArray(state) && state !== null && Object.keys(state).length === 0);
      
      if (isEmpty) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(state));
      }
    } catch (error) {
      console.error(`Error setting localStorage key “${key}”:`, error);
    }
  }, [key, state]);

  return [state, setState];
}

export default usePersistentState;