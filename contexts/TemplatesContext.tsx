import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import usePersistentState from '../hooks/usePersistentState';
import { DayTemplate } from '../types';
import { mockTemplates } from '../mockData';
import { isDayTemplateArray } from '../utils';

interface TemplatesContextType {
  templates: DayTemplate[];
  setTemplates: React.Dispatch<React.SetStateAction<DayTemplate[]>>;
}

const TemplatesContext = createContext<TemplatesContextType | undefined>(undefined);

export const useTemplates = () => {
  const context = useContext(TemplatesContext);
  if (!context) {
    throw new Error('useTemplates must be used within a TemplatesProvider');
  }
  return context;
};

interface TemplatesProviderProps {
  children: ReactNode;
  useMockData: boolean;
}

export const TemplatesProvider: React.FC<TemplatesProviderProps> = ({ children, useMockData }) => {
  const [templates, setTemplates] = usePersistentState<DayTemplate[]>('templates', [], isDayTemplateArray);
  
  const value = useMemo(() => ({
    templates,
    setTemplates,
  }), [templates, setTemplates]);

  const mockValue: TemplatesContextType = {
      templates: mockTemplates,
      setTemplates: () => {},
  };

  return (
    <TemplatesContext.Provider value={useMockData ? mockValue : value}>
      {children}
    </TemplatesContext.Provider>
  );
};
