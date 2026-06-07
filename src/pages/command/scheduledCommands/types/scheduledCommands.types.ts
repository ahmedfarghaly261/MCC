export interface GoalParameter {
  type: string;
  required: boolean;
  default?: string | number;
}

export interface HTNGoal {
  id: string;
  name: string;
  description: string;

  parameters:
    | Record<string, GoalParameter>
    | [];
}
export interface HTNGoalsResponse {
  status: string;
  data: HTNGoal[];
}

export interface MacroGoalPayload {
  goal_name: string;
  execute_at: string;
  parameters: string[];
}

export interface MacroGoalResponse {
  status: string;
  message: string;
  batch_uuid: string;
  scheduled_ids: number[];
}