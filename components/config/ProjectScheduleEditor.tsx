import React, { useState, useEffect, useMemo } from 'react';
import { MasterProject, WeeklySchedule, Day, Hour } from '../../types';
import { DAYS_OF_WEEK, HOURS_OF_DAY, PROJECT_COLORS } from '../../constants';
import { TrashIcon } from '../common/Icons';
import { useSchedule } from '../../contexts/ScheduleContext';

interface ProjectScheduleEditorProps {
    project: MasterProject;
    onSave: (project: MasterProject, scheduleMap: { [key:string]: number }) => void;
    onClose: () => void;
}

const ProjectScheduleEditor: React.FC<ProjectScheduleEditorProps> = ({ project, onSave, onClose }) => {
    const { schedule } = useSchedule();
    const [editedProject, setEditedProject] = useState<MasterProject>(project);
    const [scheduleMap, setScheduleMap] = useState<{ [key: string]: number }>({});
    const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
    const [probabilityInput, setProbabilityInput] = useState<string>("0.5");

    useEffect(() => {
        const newMap: { [key: string]: number } = {};
        for (const day of DAYS_OF_WEEK) {
            for (const hour of HOURS_OF_DAY) {
                const projInstance = schedule[day]?.[hour]?.find(p => p.masterId === project.id);
                if (projInstance) {
                    newMap[`${day}-${hour}`] = projInstance.probability;
                }
            }
        }
        setScheduleMap(newMap);
    }, [project, schedule]);
    
    const otherProjectsWeightMap = useMemo(() => {
        const newMap: { [key: string]: number } = {};
        for (const day of DAYS_OF_WEEK) {
            for (const hour of HOURS_OF_DAY) {
                const otherProjects = schedule[day]?.[hour]?.filter(p => p.masterId !== project.id) || [];
                newMap[`${day}-${hour}`] = otherProjects.reduce((sum, p) => sum + p.probability, 0);
            }
        }
        return newMap;
    }, [project, schedule]);

    const handleCellClick = (day: Day, hour: Hour) => {
        const key = `${day}-${hour}`;
        const newSelection = new Set(selectedCells);
        if (newSelection.has(key)) {
            newSelection.delete(key);
        } else {
            newSelection.add(key);
        }
        setSelectedCells(newSelection);
    };
    
    const handleProbChange = (key: string, change: number) => {
        const currentProb = scheduleMap[key] || 0;
        const newProb = Math.max(0, Math.min(1, currentProb + change));
        
        const otherWeight = otherProjectsWeightMap[key] || 0;
        const cappedProb = Math.min(newProb, 1 - otherWeight);

        const newMap = { ...scheduleMap };
        if (cappedProb > 0.001) {
            newMap[key] = cappedProb;
        } else {
            delete newMap[key];
        }
        setScheduleMap(newMap);
    }

    const handleSliderChange = (newProbString: string) => {
        setProbabilityInput(newProbString);

        const newProb = parseFloat(newProbString);
        if (isNaN(newProb) || selectedCells.size === 0) {
            return;
        }

        const newMap = { ...scheduleMap };
        selectedCells.forEach(key => {
            const otherWeight = otherProjectsWeightMap[key] || 0;
            const cappedProb = Math.min(newProb, 1 - otherWeight);
            if (cappedProb > 0.001) {
                newMap[key] = Math.max(0, cappedProb);
            } else {
                delete newMap[key];
            }
        });
        setScheduleMap(newMap);
    };
    
    const selectPreset = (type: 'weekdays' | 'weekends' | 'all' | 'none' | 'clear') => {
        const newSelection = new Set<string>();
        const weekend: Day[] = ['Saturday', 'Sunday'];
        if (type === 'clear') {
            setScheduleMap({});
            return;
        }
        if (type !== 'none') {
            for (const day of DAYS_OF_WEEK) {
                const isWeekend = weekend.includes(day);
                if ( (type === 'weekdays' && !isWeekend) || (type === 'weekends' && isWeekend) || type === 'all') {
                     for (const hour of HOURS_OF_DAY) {
                        newSelection.add(`${day}-${hour}`);
                     }
                }
            }
        }
        setSelectedCells(newSelection);
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!editedProject.name.trim()){
            // Handle error
            return;
        }
        onSave(editedProject, scheduleMap);
    };
    
    const probAsFloat = parseFloat(probabilityInput);
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-5xl">
            <h2 className="text-2xl font-bold text-white">Edit Schedule for "{project.name}"</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <div>
                     <label htmlFor="projectName" className="block text-sm font-medium text-gray-300 mb-2">Project Name</label>
                     <input type="text" id="projectName" value={editedProject.name} onChange={e => setEditedProject({...editedProject, name: e.target.value})} className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"/>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Color</label>
                    <div className="flex flex-wrap gap-2">
                        {PROJECT_COLORS.map(c => <button type="button" key={c} onClick={() => setEditedProject({...editedProject, color: c})} className={`w-8 h-8 rounded-full transition-transform transform hover:scale-110 ${editedProject.color === c ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-white' : ''}`} style={{backgroundColor: c}} />)}
                    </div>
                </div>
            </div>

            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 space-y-4">
                 <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-gray-300 mr-2">Select:</span>
                    <button type="button" onClick={() => selectPreset('weekdays')} className="px-2 py-1 text-xs bg-gray-700 rounded hover:bg-gray-600">Weekdays</button>
                    <button type="button" onClick={() => selectPreset('weekends')} className="px-2 py-1 text-xs bg-gray-700 rounded hover:bg-gray-600">Weekends</button>
                    <button type="button" onClick={() => selectPreset('all')} className="px-2 py-1 text-xs bg-gray-700 rounded hover:bg-gray-600">All</button>
                    <button type="button" onClick={() => selectPreset('none')} className="px-2 py-1 text-xs bg-gray-700 rounded hover:bg-gray-600">None</button>
                    <button type="button" onClick={() => selectPreset('clear')} className="flex items-center gap-1 px-2 py-1 text-xs bg-red-800/50 text-red-300 rounded hover:bg-red-700/50"><TrashIcon className="w-3 h-3"/> Clear All</button>
                 </div>
                 <div className="space-y-2">
                    <label htmlFor="prob_slider" className="text-sm font-medium text-gray-300">
                        {selectedCells.size > 0 ? `Set Weight for ${selectedCells.size} selected slots:` : 'Bulk Edit Weight (select slots first):'} 
                        <span className="font-bold text-white"> {probAsFloat.toFixed(2)}</span>
                    </label>
                     <div className="flex items-center gap-4">
                        <input 
                            id="prob_slider" 
                            type="range" 
                            value={probabilityInput} 
                            onChange={e => handleSliderChange(e.target.value)} 
                            min="0" 
                            max="1" 
                            step="0.05" 
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={selectedCells.size === 0}
                        />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-800">
                            <th className="p-1 text-xs w-12"></th>
                            {DAYS_OF_WEEK.map(day => <th key={day} className="p-1 text-xs font-medium">{day.substring(0,3)}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {HOURS_OF_DAY.map(hour => (
                            <tr key={hour} className="border-t border-gray-700">
                                <td className="p-1 text-center text-xs text-gray-400 font-mono">{hour % 12 || 12}{hour < 12 ? 'a' : 'p'}</td>
                                {DAYS_OF_WEEK.map(day => {
                                    const key = `${day}-${hour}`;
                                    const prob = scheduleMap[key] || 0;
                                    const isSelected = selectedCells.has(key);
                                    return (
                                        <td key={day} className="border-l border-gray-700 p-0 relative group">
                                            <div 
                                                onClick={() => handleCellClick(day, hour)} 
                                                className={`w-full h-12 text-xs transition-colors cursor-pointer flex items-center justify-center ${isSelected ? 'bg-indigo-500 ring-2 ring-white z-10' : ''}`}
                                                style={{backgroundColor: isSelected ? undefined : `rgba(${parseInt(editedProject.color.slice(1,3),16)},${parseInt(editedProject.color.slice(3,5),16)},${parseInt(editedProject.color.slice(5,7),16)},${prob})`}}
                                            >
                                                {prob > 0 ? <span className="font-semibold text-white pointer-events-none">{prob.toFixed(2)}</span> : ''}
                                                <div className="absolute inset-0 flex items-center justify-between p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                                                   <button type="button" onClick={(e)=>{e.stopPropagation(); handleProbChange(key, -0.05)}} className="w-5 h-5 bg-black/50 rounded-full text-white flex items-center justify-center pointer-events-auto hover:bg-white/30 text-base">-</button>
                                                   <button type="button" onClick={(e)=>{e.stopPropagation(); handleProbChange(key, 0.05)}} className="w-5 h-5 bg-black/50 rounded-full text-white flex items-center justify-center pointer-events-auto hover:bg-white/30 text-base">+</button>
                                                </div>
                                            </div>
                                        </td>
                                    )
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-end items-center pt-4 gap-4">
                <button type="button" onClick={onClose} className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500">Cancel</button>
                <button type="submit" className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500">Save Schedule</button>
            </div>
        </form>
    )
};

export default ProjectScheduleEditor;
