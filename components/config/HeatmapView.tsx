import React from 'react';
import { useSchedule } from '../../contexts/ScheduleContext';
import { DAYS_OF_WEEK, HOURS_OF_DAY } from '../../constants';

const HeatmapView: React.FC = () => {
    const { schedule } = useSchedule();

    return (
        <div className="w-full h-full flex items-center justify-center p-2 bg-gray-800/20 rounded-lg border border-gray-700 overflow-auto">
            <div
                className="grid gap-1 items-center"
                style={{
                    // 1 auto column for time, 7 fixed 1rem (16px) columns for days
                    gridTemplateColumns: `auto repeat(${DAYS_OF_WEEK.length}, 1rem)`,
                    // 1 auto row for headers, 24 fixed 1rem (16px) rows for hours
                    gridTemplateRows: `auto repeat(${HOURS_OF_DAY.length}, 1rem)`,
                }}
            >
                {/* Top-left empty cell */}
                <div />

                {/* Day Headers */}
                {DAYS_OF_WEEK.map(day => (
                    <div key={day} className="flex items-center justify-center text-xs text-gray-400 font-medium h-6">
                        {day.substring(0, 2)}
                    </div>
                ))}

                {/* Grid Content: Time Labels + Cells */}
                {HOURS_OF_DAY.map(hour => (
                    <React.Fragment key={hour}>
                        {/* Time Label */}
                        <div className="flex items-center justify-end pr-2 text-xs font-mono text-gray-400">
                            {hour.toString().padStart(2, '0')}
                        </div>
                        {/* Cells for this hour */}
                        {DAYS_OF_WEEK.map(day => {
                            const projects = schedule[day]?.[hour] || [];
                            const tooltipText = projects.length > 0
                                ? projects.map(p => `${p.name} (${(p.probability * 100).toFixed(0)}%)`).join('\n')
                                : 'Empty';

                            return (
                                <div
                                    key={`${day}-${hour}`}
                                    className="w-4 h-4 bg-gray-700/50 rounded-sm overflow-hidden flex flex-col"
                                    title={tooltipText}
                                >
                                    {projects.map(project => (
                                        <div
                                            key={project.id}
                                            style={{
                                                height: `${project.probability * 100}%`,
                                                backgroundColor: project.color,
                                            }}
                                        />
                                    ))}
                                </div>
                            );
                        })}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default HeatmapView;