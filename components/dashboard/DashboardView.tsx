import React from 'react';
import { ScheduledProject } from '../../types';
import { MoonIcon, ArrowPathIcon, Cog6ToothIcon } from '../common/Icons';

interface DashboardViewProps {
  currentFocus: ScheduledProject | null;
  potentialProjects: ScheduledProject[];
  onReroll: () => void;
  onManageSchedule: () => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ currentFocus, potentialProjects, onReroll, onManageSchedule }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4 md:p-8">
      <h2 className="text-xl md:text-2xl text-gray-400 font-light mb-4">Your focus for this hour is...</h2>
      
      <div className="bg-gray-800 rounded-2xl w-full max-w-md p-6 md:p-8 shadow-lg border border-gray-700 transition-all duration-300">
        {currentFocus ? (
          <div className="flex flex-col items-center">
            <div 
              className="w-16 h-16 rounded-full mx-auto mb-6 flex-shrink-0" 
              style={{ backgroundColor: currentFocus.color }}
            ></div>
            <h1 className="text-3xl md:text-4xl font-bold text-white truncate" title={currentFocus.name}>{currentFocus.name}</h1>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <MoonIcon className="w-16 h-16 text-gray-500 mx-auto mb-6 flex-shrink-0" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-400">Free Time</h1>
            <p className="text-gray-500 mt-2 text-sm">No projects scheduled for this hour.</p>
          </div>
        )}
      </div>
      
      {potentialProjects && potentialProjects.length > 1 && (
        <div className="mt-8 w-full max-w-md">
            <h3 className="text-lg text-gray-400 font-semibold mb-4 text-left">Options for this Hour</h3>
            <ul className="space-y-3">
                {potentialProjects.map(project => {
                    const isSelected = (currentFocus && currentFocus.id === project.id) || (!currentFocus && project.id === 'rest');
                    return (
                        <li
                            key={project.id}
                            className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${isSelected ? 'bg-indigo-500/20 border-indigo-500' : 'bg-gray-800 border-gray-700'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }}></div>
                                <span className="font-medium text-white truncate">{project.name}</span>
                            </div>
                            <span className="font-mono text-gray-300 ml-4">{(project.probability * 100).toFixed(0)}%</span>
                        </li>
                    )
                })}
            </ul>
        </div>
      )}

      <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
        <button 
          onClick={onReroll} 
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition-colors shadow-md"
        >
          <ArrowPathIcon className="w-5 h-5" />
          Re-roll
        </button>
        <button 
          onClick={onManageSchedule} 
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-gray-700 text-gray-300 font-semibold rounded-lg hover:bg-gray-600 transition-colors"
        >
          <Cog6ToothIcon className="w-5 h-5" />
          Manage Schedule
        </button>
      </div>
    </div>
  );
};

export default DashboardView;
