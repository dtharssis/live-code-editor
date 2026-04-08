export type ComponentMethod = 'MANUAL' | 'AI_GENERATED';
export type ComponentStatus = 'DRAFT' | 'SAVED';

export interface ComponentEntity {
  id: string;
  userId: string;
  name: string;
  liquidCode: string;
  cssCode: string;
  jsCode: string;
  schemaJson: string;
  method: ComponentMethod;
  status: ComponentStatus;
  createdAt: Date;
  updatedAt: Date;
}
