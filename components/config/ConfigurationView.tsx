import React, { useState } from 'react';
import ProjectScheduleEditor from './ProjectScheduleEditor';
import ProjectsView from './ProjectsView';
import TemplatesView from './TemplatesView';
import { ArrowUturnLeftIcon, CalendarDaysIcon, TagIcon, ListBulletIcon } from '../common/icons';
import { useMasterProjects } from '../../contexts/MasterProjectsContext';

type ConfigTab = 'schedule' | 'projects' | 'templates';

interface ConfigurationViewProps {
  onBackToDashboard: () => void;
}

const ConfigurationView: React.FC<ConfigurationViewProps> = ({ onBackToDashboard }) => {
  const [activeTab, setActiveTab] = useState<ConfigTab>('schedule');
  const { masterProjects } = useMasterProjects();

  const renderTabContent = () => {
    if (masterProjects.length === 0 && (activeTab === 'schedule' || activeTab === 'templates')) {
        const tabName = activeTab === 'schedule' ? 'schedule' : 'template';
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 text-gray-400">
                <TagIcon className="w-16 h-16 text-gray-500 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Create a Project First</h3>
                <p className="max-w-md mb-6">
                    You need to have at least one master project before you can create a {tabName}. 
                    Projects are the main items you'll be scheduling.
                </p>
                <button
                  onClick={() => setActiveTab('projects')}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition-colors"
                >
                  <TagIcon className="w-5 h-5" />
                  Go to Projects
                </button>
            </div>
        );
    }

    switch (activeTab) {
      case 'schedule':
        return <ProjectScheduleEditor />;
      case 'projects':
        return <ProjectsView />;
      case 'templates':
        return <TemplatesView />;
      default:
        return null;
    }
  };
  
  const getTabIconClass = (tab: ConfigTab) => {
    return activeTab === tab ? 'text-indigo-400' : 'text-gray-400 group-hover:text-white';
  };

  return (
    <div className="flex flex-col h-full bg-gray-800/50 rounded-lg border border-gray-700 shadow-xl overflow-hidden">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-4">
            <button
              onClick={onBackToDashboard}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-md bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
              title="Back to Dashboard"
              aria-label="Back to Dashboard"
            >
              <ArrowUturnLeftIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
            <h2 className="text-xl font-bold text-white whitespace-nowrap">Manage Schedule</h2>
        </div>

        <nav className="w-full md:w-auto flex items-center border border-gray-700 rounded-lg p-1 bg-gray-900/50">
          <button onClick={() => setActiveTab('schedule')} aria-label="Schedule" className={`group flex flex-1 md:flex-initial justify-center items-center gap-2 px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${activeTab === 'schedule' ? 'bg-indigo-600/30 text-indigo-300' : 'text-gray-400 hover:text-white'}`}>
            <CalendarDaysIcon className={`w-5 h-5 transition-colors ${getTabIconClass('schedule')}`} />
            <span className="hidden sm:inline">Schedule</span>
          </button>
           <button onClick={() => setActiveTab('projects')} aria-label="Projects" className={`group flex flex-1 md:flex-initial justify-center items-center gap-2 px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${activeTab === 'projects' ? 'bg-indigo-600/30 text-indigo-300' : 'text-gray-400 hover:text-white'}`}>
            <TagIcon className={`w-5 h-5 transition-colors ${getTabIconClass('projects')}`} />
            <span className="hidden sm:inline">Projects</span>
          </button>
          <button onClick={() => setActiveTab('templates')} aria-label="Templates" className={`group flex flex-1 md:flex-initial justify-center items-center gap-2 px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${activeTab === 'templates' ? 'bg-indigo-600/30 text-indigo-300' : 'text-gray-400 hover:text-white'}`}>
            <ListBulletIcon className={`w-5 h-5 transition-colors ${getTabIconClass('templates')}`} />
            <span className="hidden sm:inline">Templates</span>
          </button>
        </nav>
      </header>

      <div className="flex-grow p-4">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ConfigurationView;