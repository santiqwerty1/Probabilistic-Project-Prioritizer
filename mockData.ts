
import { MasterProject, WeeklySchedule, DayTemplate } from './types';

// Mock Master Projects
export const mockMasterProjects: MasterProject[] = [
  { id: 'proj-1', name: 'Deep Work', color: '#3B82F6' },
  { id: 'proj-2', name: 'Learning', color: '#22C55E' },
  { id: 'proj-3', name: 'Admin & Emails', color: '#F97316' },
  { id: 'proj-4', name: 'Fitness', color: '#EF4444' },
];

// Mock Weekly Schedule - Expanded to look "in full use"
export const mockSchedule: WeeklySchedule = {
  Monday: {
    8: [
      { id: 'proj-3-mon-8', masterId: 'proj-3', name: 'Admin & Emails', color: '#F97316', probability: 0.5 },
    ],
    9: [
      { id: 'proj-1-mon-9', masterId: 'proj-1', name: 'Deep Work', color: '#3B82F6', probability: 1.0 },
    ],
    10: [
      { id: 'proj-1-mon-10', masterId: 'proj-1', name: 'Deep Work', color: '#3B82F6', probability: 1.0 },
    ],
    13: [
      { id: 'proj-3-mon-13', masterId: 'proj-3', name: 'Admin & Emails', color: '#F97316', probability: 0.5 },
      { id: 'proj-2-mon-13', masterId: 'proj-2', name: 'Learning', color: '#22C55E', probability: 0.5 },
    ],
    17: [
        { id: 'proj-4-mon-17', masterId: 'proj-4', name: 'Fitness', color: '#EF4444', probability: 1.0 },
    ]
  },
  Tuesday: {
    9: [
      { id: 'proj-2-tue-9', masterId: 'proj-2', name: 'Learning', color: '#22C55E', probability: 0.7 },
    ],
    11: [
      { id: 'proj-1-tue-11', masterId: 'proj-1', name: 'Deep Work', color: '#3B82F6', probability: 0.5 },
    ],
    14: [
      { id: 'proj-3-tue-14', masterId: 'proj-3', name: 'Admin & Emails', color: '#F97316', probability: 1.0 },
    ],
  },
  Wednesday: {
    9: [
      { id: 'proj-1-wed-9', masterId: 'proj-1', name: 'Deep Work', color: '#3B82F6', probability: 0.9 },
    ],
    14: [
        { id: 'proj-2-wed-14', masterId: 'proj-2', name: 'Learning', color: '#22C55E', probability: 0.7 }
    ],
    18: [
        { id: 'proj-4-wed-18', masterId: 'proj-4', name: 'Fitness', color: '#EF4444', probability: 1.0 },
    ]
  },
  Thursday: {
    10: [
      { id: 'proj-1-thu-10', masterId: 'proj-1', name: 'Deep Work', color: '#3B82F6', probability: 0.7 },
    ],
    11: [
      { id: 'proj-1-thu-11', masterId: 'proj-1', name: 'Deep Work', color: '#3B82F6', probability: 0.3 },
      { id: 'proj-3-thu-11', masterId: 'proj-3', name: 'Admin & Emails', color: '#F97316', probability: 0.7 },
    ],
  },
  Friday: {
    9: [
        { id: 'proj-1-fri-9', masterId: 'proj-1', name: 'Deep Work', color: '#3B82F6', probability: 0.7 },
    ],
    16: [
      { id: 'proj-3-fri-16', masterId: 'proj-3', name: 'Admin & Emails', color: '#F97316', probability: 1.0 },
    ],
     17: [
        { id: 'proj-4-fri-17', masterId: 'proj-4', name: 'Fitness', color: '#EF4444', probability: 1.0 },
    ]
  },
  Saturday: {
    10: [
      { id: 'proj-2-sat-10', masterId: 'proj-2', name: 'Learning', color: '#22C55E', probability: 0.6 },
    ],
    11: [
      { id: 'proj-4-sat-11', masterId: 'proj-4', name: 'Fitness', color: '#EF4444', probability: 0.4 },
    ],
  },
  Sunday: {
    14: [
      { id: 'proj-2-sun-14', masterId: 'proj-2', name: 'Learning', color: '#22C55E', probability: 0.3 },
    ]
  }
};

export const mockTemplates: DayTemplate[] = [
  {
    id: 'template-1',
    name: 'Productive Workday',
    schedule: {
      8: [{ id: 't1-proj-3-8', masterId: 'proj-3', name: 'Admin & Emails', color: '#F97316', probability: 0.5 }],
      9: [{ id: 't1-proj-1-9', masterId: 'proj-1', name: 'Deep Work', color: '#3B82F6', probability: 1.0 }],
      10: [{ id: 't1-proj-1-10', masterId: 'proj-1', name: 'Deep Work', color: '#3B82F6', probability: 1.0 }],
      11: [{ id: 't1-proj-1-11', masterId: 'proj-1', name: 'Deep Work', color: '#3B82F6', probability: 0.5 }, { id: 't1-proj-3-11', masterId: 'proj-3', name: 'Admin & Emails', color: '#F97316', probability: 0.5 }],
      13: [{ id: 't1-proj-2-13', masterId: 'proj-2', name: 'Learning', color: '#22C55E', probability: 1.0 }],
      14: [{ id: 't1-proj-1-14', masterId: 'proj-1', name: 'Deep Work', color: '#3B82F6', probability: 1.0 }],
      17: [{ id: 't1-proj-4-17', masterId: 'proj-4', name: 'Fitness', color: '#EF4444', probability: 1.0 }],
    },
  },
  {
    id: 'template-2',
    name: 'Relaxed Weekend',
    schedule: {
      10: [{ id: 't2-proj-2-10', masterId: 'proj-2', name: 'Learning', color: '#22C55E', probability: 0.8 }],
      11: [{ id: 't2-proj-4-11', masterId: 'proj-4', name: 'Fitness', color: '#EF4444', probability: 1.0 }],
      14: [{ id: 't2-proj-2-14', masterId: 'proj-2', name: 'Learning', color: '#22C55E', probability: 0.5 }],
    }
  }
];
