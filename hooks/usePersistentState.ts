
import React, { useState, useEffect } from 'react';
import { CURRENT_DATA_VERSION, migrate } from '../data/migration';

interface VersionedData<T> {
  version: number;
  data: T;
}

// Helper to check if a value is a plain object, used for identifying legacy vs versioned data.
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function usePersistentState<T>(
    key: string, 
    initialValue: T,
    validator?: (data: unknown) => data is T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const storedValue = localStorage.getItem(key);
      if (storedValue) {
        const parsedValue = JSON.parse(storedValue);
        
        const isVersioned = isObject(parsedValue) && typeof parsedValue.version === 'number';
        let dataToValidate: unknown;
        
        if (isVersioned) {
          // FIX: Cast to `unknown` first to satisfy TypeScript's type assertion rules for non-overlapping types.
          const versionedData = parsedValue as unknown as VersionedData<any>;
          
          if (versionedData.version > CURRENT_DATA_VERSION) {
            console.warn(`Stored data for key "${key}" (v${versionedData.version}) is newer than app version (v${CURRENT_DATA_VERSION}). Discarding.`);
            localStorage.removeItem(key);
            return initialValue;
          }
          
          dataToValidate = migrate(versionedData.data, versionedData.version);

        } else {
          // Legacy (unversioned) data is treated as version 0 and migrated.
          console.log(`Found legacy (unversioned) data for key "${key}". Migrating...`);
          dataToValidate = migrate(parsedValue, 0);
        }

        if (!validator || validator(dataToValidate)) {
            return dataToValidate as T;
        } else {
            console.error(`Validation failed for key "${key}" after migration. Discarding stored data.`);
            localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error(`Error reading localStorage key “${key}”:`, error);
      localStorage.removeItem(key);
    }
    return initialValue;
  });

  useEffect(() => {
    try {
      const isEmpty = state === null || 
                      state === undefined || 
                      (Array.isArray(state) && state.length === 0) || 
                      (isObject(state) && Object.keys(state).length === 0);
      
      if (isEmpty) {
        localStorage.removeItem(key);
      } else {
        const dataToStore: VersionedData<T> = {
            version: CURRENT_DATA_VERSION,
            data: state
        };
        localStorage.setItem(key, JSON.stringify(dataToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key “${key}”:`, error);
    }
  }, [key, state]);

  return [state, setState];
}

export default usePersistentState;