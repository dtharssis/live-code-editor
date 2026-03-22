import { EditorMode } from '../value-objects/types';

export interface ProjectContent {
  markup: string;
  css:    string;
  js:     string;
}

export type ProjectMap = Record<EditorMode, ProjectContent>;
