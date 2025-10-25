import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import usePersistentState from '../hooks/usePersistentState';
import { WeeklySchedule } from '../types';
import { mockSchedule } from '../mockData';
import { isWeeklySchedule } from '../utils';

interface ScheduleContextType {
  schedule: WeeklySchedule;
  setSchedule: React.Dispatch<React.SetStateAction<WeeklySchedule>>;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export const useSchedule = () => {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
};

interface ScheduleProviderProps {
  children: ReactNode;
  useMockData: boolean;
}

export const ScheduleProvider: React.FC<ScheduleProviderProps> = ({ children, useMockData }) => {
  const [schedule, setSchedule] = usePersistentState<WeeklySchedule>('schedule', {}, isWeeklySchedule);
  
  const value = useMemo(() => ({
    schedule,
    setSchedule,
  }), [schedule, setSchedule]);

  const mockValue: ScheduleContextType = {
      schedule: mockSchedule,
      setSchedule: () => {},
  };

  return (
    <ScheduleContext.Provider value={useMockData ? mockValue : value}>
      {children}
    </ScheduleContext.Provider>
  );
};