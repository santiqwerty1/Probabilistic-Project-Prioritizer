import React, { useState, useEffect, useCallback } from 'react';
import { ScheduledProject } from './types';
import { DAYS_OF_WEEK, UNALLOCATED_PROJECT_ID } from './constants';
import DashboardView from './components/dashboard/DashboardView';
import ConfigurationView from './components/config/ConfigurationView';
import { LightBulbIcon, BugAntIcon } from './components/common/Icons';
import SuggestionsModal from './components/dev/SuggestionsModal';
import { ScheduleProvider, useSchedule } from './contexts/ScheduleContext';
import { ToastProvider } from './contexts/ToastContext';
import ToastContainer from './components/common/ToastContainer';

const AppContent: React.FC = () => {
  const { schedule } = useSchedule();
  const [view, setView] = useState<'dashboard' | 'config'>('dashboard');
  const [currentFocus, setCurrentFocus] = useState<ScheduledProject | null>(null);
  const [potentialProjects, setPotentialProjects] = useState<ScheduledProject[]>([]);

  const selectFocusProject = useCallback(() => {
    const now = new Date();
    const currentDay = DAYS_OF_WEEK[now.getDay()];
    const currentHour = now.getHours() as any;
    const projectsForCurrentHour = schedule[currentDay]?.[currentHour] || [];
    
    const totalWeight = projectsForCurrentHour.reduce((sum, p) => sum + p.probability, 0);
    const unallocatedWeight = 1 - totalWeight;

    const weightedList: ScheduledProject[] = [
      ...projectsForCurrentHour,
      ...(unallocatedWeight > 0.001 ? [{ id: UNALLOCATED_PROJECT_ID, name: 'Unallocated', probability: unallocatedWeight, color: '#6B7280', masterId: UNALLOCATED_PROJECT_ID }] : [])
    ];
    
    setPotentialProjects(weightedList);

    if (weightedList.length === 0) {
      setCurrentFocus(null);
      return;
    }

    let random = Math.random() * (totalWeight + unallocatedWeight);
    let selectedProject: ScheduledProject | null = null;
    for (const project of weightedList) {
      random -= project.probability;
      if (random <= 0) {
        selectedProject = project;
        break;
      }
    }
    
    if(selectedProject?.masterId === UNALLOCATED_PROJECT_ID){
        setCurrentFocus(null);
    } else {
        setCurrentFocus(selectedProject);
    }

  }, [schedule]);

  useEffect(() => {
    selectFocusProject();
    const interval = setInterval(selectFocusProject, 60000);
    return () => clearInterval(interval);
  }, [selectFocusProject]);

  const handleManageSchedule = useCallback(() => setView('config'), []);
  const handleBackToDashboard = useCallback(() => setView('dashboard'), []);
  
  return (
    <div className="h-full flex flex-col">
      {view === 'dashboard' ? (
        <DashboardView 
          currentFocus={currentFocus}
          potentialProjects={potentialProjects}
          onReroll={selectFocusProject}
          onManageSchedule={handleManageSchedule}
        />
      ) : (
        <ConfigurationView 
          onBackToDashboard={handleBackToDashboard}
        />
      )}
    </div>
  );
};


const App: React.FC = () => {
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [devUseMockData, setDevUseMockData] = useState(
    () => localStorage.getItem('devUseMockData') === 'true'
  );

  useEffect(() => {
    localStorage.setItem('devUseMockData', String(devUseMockData));
  }, [devUseMockData]);

  return (
    <ToastProvider>
      <div className="h-screen bg-gray-900 text-gray-100 font-sans flex flex-col">
        <header className="bg-gray-900/80 backdrop-blur-sm z-40 border-b border-gray-700 shrink-0">
            <div className="container mx-auto flex justify-between items-center p-4">
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Project Prioritizer</h1>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDevUseMockData(!devUseMockData)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${devUseMockData ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                  title="Toggle Mock Data"
                >
                  <BugAntIcon className="w-4 h-4" />
                  <span>{devUseMockData ? 'Mock On' : 'Mock Off'}</span>
                </button>
                <button
                  onClick={() => setIsSuggestionsOpen(true)}
                  className="p-2 text-gray-400 hover:text-yellow-400 transition-colors"
                  title="Show Suggestions"
                >
                  <LightBulbIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
        </header>
        
        <main className="container mx-auto p-4 flex-grow flex flex-col">
          <ScheduleProvider useMockData={devUseMockData}>
            <AppContent />
          </ScheduleProvider>
        </main>

        <SuggestionsModal isOpen={isSuggestionsOpen} onClose={() => setIsSuggestionsOpen(false)} />
      </div>
      <ToastContainer />
    </ToastProvider>
  );
};

export default App;