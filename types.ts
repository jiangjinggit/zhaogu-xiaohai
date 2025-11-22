export enum AppTab {
  TRACKER = 'tracker',
  KNOWLEDGE = 'knowledge',
  ILLNESS = 'illness',
  EMERGENCY = 'emergency'
}

export enum LogType {
  FOOD = 'FOOD',
  MILK = 'MILK',
  WATER = 'WATER',
  POOP = 'POOP',
  SLEEP = 'SLEEP',
  OTHER = 'OTHER'
}

export interface DailyLog {
  id: string;
  timestamp: number;
  type: LogType;
  detail: string; // e.g., "200ml", "Broccoli and Rice", "Yellow soft"
  note?: string;
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface AIResponse {
  text: string;
  sources?: GroundingSource[];
}

export interface EmergencyScenario {
  id: string;
  title: string;
  description: string;
  prompt: string; // To generate visual guide
}