import React from 'react';
import { ScheduledProject, Day, Hour, MasterProject } from '../../types';
import { PlusIcon } from '../common/icons';
import { useMasterProjects } from '../../contexts/MasterProjectsContext';
import { EPSILON } from '../../constants';

interface TimeSlotCellProps {
    day: Day;
    hour: Hour;
    projects: ScheduledProject[];
    onAddClick: (day: Day, hour: Hour) => void;
    onEditClick: (project: ScheduledProject, day: Day, hour: Hour) => void;
}

const TimeSlotCell: React.FC<TimeSlotCellProps> = ({ day, hour, projects, onAddClick, onEditClick }) => {
    const { masterProjects } = useMasterProjects();
    const totalWeight = projects.reduce((sum, p) => sum + p.probability, 0);

    return (
        <td className="border-l border-b border-gray-700 h-24 p-0.5">
            <div 
                className="relative w-full h-full flex flex-col"
            >
                {projects.map(project => {
                    const blockHeight = project.probability;

                    return (
                        <button
                            type="button"
                            key={project.id}
                            onClick={() => onEditClick(project, day, hour)}
                            className="w-full flex-shrink-0 relative overflow-hidden group cursor-pointer text-left"
                            style={{ height: `${blockHeight}%`, backgroundColor: project.color }}
                            title={`${project.name} (${project.probability.toFixed(0)}%)`}
                            aria-label={`Edit ${project.name} (${project.probability.toFixed(0)}%)`}
                        >
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            {blockHeight > 15 && (
                                <div className="p-1 text-white text-xs font-semibold select-none">
                                    <p className="truncate">{project.name}</p>
                                    {blockHeight > 30 && <p className="opacity-70">{project.probability.toFixed(0)}%</p>}
                                </div>
                            )}
                        </button>
                    );
                })}
                 {totalWeight < 100 - EPSILON && masterProjects.length > 0 && (
                    <button
                        type="button"
                        onClick={() => onAddClick(day, hour)}
                        className="flex-grow w-full flex items-center justify-center text-gray-400 hover:bg-gray-700/50 hover:text-white transition-colors"
                        aria-label={`Add project to ${day} at ${hour}:00`}
                        title="Add project"
                    >
                        <PlusIcon className="w-6 h-6" />
                    </button>
                )}
            </div>
        </td>
    );
};

export default React.memo(TimeSlotCell);