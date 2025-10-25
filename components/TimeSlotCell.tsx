import React from 'react';
import { ScheduledProject, Day, Hour, MasterProject } from '../types';

interface TimeSlotCellProps {
    day: Day;
    hour: Hour;
    projects: ScheduledProject[];
    isEditMode: boolean;
    masterProjects: MasterProject[];
    onAddClick: (day: Day, hour: Hour) => void;
    onEditClick: (project: ScheduledProject, day: Day, hour: Hour) => void;
}

const TimeSlotCell: React.FC<TimeSlotCellProps> = ({ day, hour, projects, isEditMode, masterProjects, onAddClick, onEditClick }) => {
    const totalWeight = projects.reduce((sum, p) => sum + p.probability, 0);

    const handleCellClick = () => {
        if (isEditMode && totalWeight < 1 && masterProjects.length > 0) {
            onAddClick(day, hour);
        }
    };

    return (
        <td className="border-l border-b border-gray-700 h-24 p-0.5">
            <div 
                className={`relative w-full h-full flex flex-col ${isEditMode && totalWeight < 1 ? 'cursor-pointer hover:bg-gray-700/50' : ''}`}
                onClick={handleCellClick}
                title={isEditMode && totalWeight < 1 ? 'Add project' : (totalWeight >= 1 ? 'Time slot is fully allocated' : '')}
            >
                {projects.map(project => {
                    const blockHeight = project.probability * 100;

                    return (
                        <div
                            key={project.id}
                            onClick={(e) => {
                                if (isEditMode) {
                                    e.stopPropagation();
                                    onEditClick(project, day, hour);
                                }
                            }}
                            className={`w-full flex-shrink-0 relative overflow-hidden group ${isEditMode ? 'cursor-pointer' : ''}`}
                            style={{ height: `${blockHeight}%`, backgroundColor: project.color }}
                            title={`${project.name} (${project.probability.toFixed(2)})`}
                        >
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            {blockHeight > 15 && (
                                <div className="p-1 text-white text-xs font-semibold select-none">
                                    <p className="truncate">{project.name}</p>
                                    {blockHeight > 30 && <p className="opacity-70">{project.probability.toFixed(2)}</p>}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </td>
    );
};

export default TimeSlotCell;