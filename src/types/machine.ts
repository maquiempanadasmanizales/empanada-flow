export interface Machine {
  id: string;
  serial: string;
  model: string;
  status: 'RUNNING' | 'STOPPED';
}

export interface ProductionEvent {
  id: string;
  timestamp: number;
  count: number;
}

export interface DowntimeEvent {
  id: string;
  startTime: number;
  endTime: number | null;
  reason: string;
}

export interface Operator {
  id: string;
  name: string;
}

export interface OperatorSession {
  id: string;
  operatorId: string;
  startTime: number;
  endTime: number | null;
}

export interface AppState {
  machine: Machine;
  productionEvents: ProductionEvent[];
  downtimeEvents: DowntimeEvent[];
  operators: Operator[];
  operatorSessions: OperatorSession[];
  demoMode: boolean;
  lastUpdated: number;
}
