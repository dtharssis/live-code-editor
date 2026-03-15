import { VariableType } from '../value-objects/types';

export interface Variable {
  key:   string;
  value: string;
  type:  VariableType;
}

export interface VariableStore {
  values: Record<string, string>;
  meta:   Record<string, VariableType>;
}
