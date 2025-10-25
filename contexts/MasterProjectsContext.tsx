import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import usePersistentState from '../hooks/usePersistentState';
import { MasterProject } from '../types';
import { mockMasterProjects } from '../mockData';
import { isMasterProjectArray } from '../utils';

interface MasterProjectsContextType {
  masterProjects: MasterProject[];
  setMasterProjects: React.Dispatch<React.SetStateAction<MasterProject[]>>;
}

const MasterProjectsContext = createContext<MasterProjectsContextType | undefined>(undefined);

export const useMasterProjects = () => {
  const context = useContext(MasterProjectsContext);
  if (!context) {
    throw new Error('useMasterProjects must be used within a MasterProjectsProvider');
  }
  return context;
};

interface MasterProjectsProviderProps {
  children: ReactNode;
  useMockData: boolean;
}

export const MasterProjectsProvider: React.FC<MasterProjectsProviderProps> = ({ children, useMockData }) => {
  const [masterProjects, setMasterProjects] = usePersistentState<MasterProject[]>('masterProjects', [], isMasterProjectArray);
  
  const value = useMemo(() => ({
    masterProjects,
    setMasterProjects,
  }), [masterProjects, setMasterProjects]);

  const mockValue: MasterProjectsContextType = {
      masterProjects: mockMasterProjects,
      setMasterProjects: () => {},
  };

  return (
    <MasterProjectsContext.Provider value={useMockData ? mockValue : value}>
      {children}
    </MasterProjectsContext.Provider>
  );
};
