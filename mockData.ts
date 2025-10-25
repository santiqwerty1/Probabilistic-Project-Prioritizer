
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
      { id: 'proj-3-mon-8', masterId: 'proj-3', name: 'Admin & Emails', color: '#F97316', probability: 50 },
    ],
    9: [
      { id: 'proj-1-mon-9', masterId: 'proj-1', name: 'Deep Work', color: '#3B82F6', probability: 100 },
    ],
    10: [
      { id: 'proj-1-mon-10', masterId: 'proj-1', name: 'Deep Work', color: '#3B82F6', probability: 100 },
    ],
    13: [
      { id: 'proj-3-mon-13', masterId: 'proj-3', name: 'Admin & Emails', color: '#F97316', probability: 50 },
      { id: 'proj-2-mon-13', masterId: 'proj-2', name: 'Learning', color: '#22C55E', probability: 50 },
    ],
    17: [
        { id: 'proj-4-mon-17', masterId: 'proj-4', name: 'Fitness', color: '#EF4444', probability: 100 },
    ]
  },
  Tuesday: {
    9: [
      { id: 'proj-2-tue-9', masterId: 'proj-2', name: 'Learning', color: '#22C55E', probability: 70 },
    ],
    11: [
      { id: 'proj-1-tue-11', masterId: 'proj-1', name: 'Deep Work', color: '#3B82F6', probability: 50 },
    ],
    14: [
      { id: 'proj-3-tue-14', masterId: 'proj-3', name: 'Admin & Emails', color: '#F97316', probability: 100 },
    ],
  },
  Wednesday: {
    9: [
      { id: 'proj-1-wed-9', masterId: 'proj-1', name: 'Deep Work', color: '#3B82F6', probability: 90 },
    ],
    14: [
        { id: 'proj-2-wed-14', masterId: 'proj-2', name: 'Learning', color: '#22C55E', probability: 70 }
    ],
    18: [
        { id: 'proj-4-wed-18', masterId: 'proj-4', name: 'Fitness', color: '#EF4444', probability: 100 },
    ]
  },
  Thursday: {
    10: [
      { id: 'proj-1-thu-10', masterId: 'proj-1', name: 'Deep Work', color: '#3B82F6', probability: 70 },
    ],
    11: [
      { id: 'proj-1-thu-11', masterId: 'proj-1', name: 'Deep Work', color: '#3B82F6', probability: 30 },
      { id: 'proj-3-thu-11', masterId: 'proj-3', name: 'Admin & Emails', color: '#F97316', probability: 70 },
    ],
  },
  Friday: {
    9: [
        { id: 'proj-1-fri-9', masterId: 'proj-1', name: 'Deep Work', color: '#3B82F6', probability: 70 },
    ],
    16: [
      { id: 'proj-3-fri-16', masterId: 'proj-3', name: 'Admin & Emails', color: '#F97316', probability: 100 },
    ],
     17: [
        { id: 'proj-4-fri-17', masterId: 'proj-4', name: 'Fitness', color: '#EF4444', probability: 100 },
    ]
  },
  Saturday: {
    10: [
      { id: 'proj-2-sat-10', masterId: 'proj-2', name: 'Learning', color: '#22C55E', probability: 60 },
    ],
    11: [
      { id: 'proj-4-sat-11', masterId: 'proj-4', name: 'Fitness', color: '#EF4444', probability: 40 },
    ],
  },
  Sunday: {
    14: [
      { id: 'proj-2-sun-14', masterId: 'proj-2', name: 'Learning', color: '#22C55E', probability: 30 },
    ]
  }
};

export const mockTemplates: DayTemplate[] = [
  {
    id: 'template-1',
    name: 'Productive Workday',
    schedule: {
      8: [{ id: 't1-proj-3-8', masterId: 'proj-3', name: 'Admin & Emails', color: '#F97316', probability: 50 }],
      9: [{ id: 't1-proj-1-9', masterId: 'proj-1', name: 'Deep Work', color: '#3B82F6', probability: 100 }],
      10: [{ id: 't1-proj-1-10', masterId: 'proj-1', name: 'Deep Work', color: '#3B82F6', probability: 100 }],
      11: [{ id: 't1-proj-1-11', masterId: 'proj-1', name: 'Deep Work', color: '#3B82F6', probability: 50 }, { id: 't1-proj-3-11', masterId: 'proj-3', name: 'Admin & Emails', color: '#F97316', probability: 50 }],
      13: [{ id: 't1-proj-2-13', masterId: 'proj-2', name: 'Learning', color: '#22C55E', probability: 100 }],
      14: [{ id: 't1-proj-1-14', masterId: 'proj-1', name: 'Deep Work', color: '#3B82F6', probability: 100 }],
      17: [{ id: 't1-proj-4-17', masterId: 'proj-4', name: 'Fitness', color: '#EF4444', probability: 100 }],
    },
  },
  {
    id: 'template-2',
    name: 'Relaxed Weekend',
    schedule: {
      10: [{ id: 't2-proj-2-10', masterId: 'proj-2', name: 'Learning', color: '#22C55E', probability: 80 }],
      11: [{ id: 't2-proj-4-11', masterId: 'proj-4', name: 'Fitness', color: '#EF4444', probability: 100 }],
      14: [{ id: 't2-proj-2-14', masterId: 'proj-2', name: 'Learning', color: '#22C55E', probability: 50 }],
    }
  }
];