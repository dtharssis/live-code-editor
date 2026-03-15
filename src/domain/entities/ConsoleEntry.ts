import { ConsoleLevel } from '../value-objects/types';

export interface ConsoleEntry {
  id:        string;
  level:     ConsoleLevel;
  message:   string;
  source?:   string;
  timestamp: number;
}
