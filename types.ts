
export type Day = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export type Hour = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23;

export interface MasterProject {
  id: string;
  name: string;
  color: string;
}

export interface ScheduledProject extends MasterProject {
  masterId: string;
  probability: number;
}

export type WeeklySchedule = {
  [key in Day]?: {
    [key in Hour]?: ScheduledProject[];
  };
};

export interface DayTemplate {
  id: string;
  name: string;
  schedule: {
    [key in Hour]?: ScheduledProject[];
  };
}
