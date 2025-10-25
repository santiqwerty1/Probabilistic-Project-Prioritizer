import React, { useState, useRef, useLayoutEffect } from 'react';
import { useSchedule } from '../../contexts/ScheduleContext';
import { DAYS_OF_WEEK, HOURS_OF_DAY } from '../../constants';

const TIME_LABEL_WIDTH = 32;
const DAY_HEADER_HEIGHT = 24;
const GRID_GAP = 1;

const HeatmapView: React.FC = () => {
    const { schedule } = useSchedule();
    const containerRef = useRef<HTMLDivElement>(null);
    const [cellWidth, setCellWidth] = useState(0);
    const [cellHeight, setCellHeight] = useState(0);

    useLayoutEffect(() => {
        const calculateCellSize = () => {
            if (!containerRef.current) return;
            const { width, height } = containerRef.current.getBoundingClientRect();
            
            const availableWidth = width - TIME_LABEL_WIDTH - (DAYS_OF_WEEK.length * GRID_GAP);
            const availableHeight = height - DAY_HEADER_HEIGHT - (HOURS_OF_DAY.length * GRID_GAP);

            setCellWidth(Math.max(0, Math.floor(availableWidth / DAYS_OF_WEEK.length)));
            setCellHeight(Math.max(0, Math.floor(availableHeight / HOURS_OF_DAY.length)));
        };

        const resizeObserver = new ResizeObserver(calculateCellSize);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
            calculateCellSize();
        }

        return () => resizeObserver.disconnect();
    }, []);

    if (cellWidth <= 0 || cellHeight <= 0) {
        return <div ref={containerRef} className="w-full h-full p-2 bg-gray-800/20 rounded-lg border border-gray-700" />;
    }

    return (
        <div ref={containerRef} className="w-full h-full p-2 bg-gray-800/20 rounded-lg border border-gray-700 flex items-center justify-center overflow-hidden">
            <div
                className="grid"
                style={{
                    gridTemplateColumns: `${TIME_LABEL_WIDTH}px repeat(${DAYS_OF_WEEK.length}, ${cellWidth}px)`,
                    gridTemplateRows: `${DAY_HEADER_HEIGHT}px repeat(${HOURS_OF_DAY.length}, ${cellHeight}px)`,
                    gap: `${GRID_GAP}px`,
                }}
            >
                {/* Top-left empty cell */}
                <div />

                {/* Day Headers */}
                {DAYS_OF_WEEK.map(day => (
                    <div key={day} className="flex items-center justify-center text-xs text-gray-400 font-medium">
                        {day.substring(0, 2)}
                    </div>
                ))}

                {/* Grid Content: Time Labels + Cells */}
                {HOURS_OF_DAY.map(hour => (
                    <React.Fragment key={hour}>
                        {/* Time Label */}
                        <div className="flex items-center justify-end pr-2 text-xs font-mono text-gray-500">
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
                                    className="bg-gray-700/50 rounded-sm overflow-hidden flex flex-col"
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