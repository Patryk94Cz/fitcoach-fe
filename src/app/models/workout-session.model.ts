// src/app/models/workout-session.model.ts
import { UserWorkoutPlan } from './workout-plan.model';

export interface WorkoutSession {
  id: number;
  sessionDate: string;
  completedDayNumber: number;
  notes?: string;
  userWorkoutPlan: {
    id: number;
    workoutPlan: {
      id: number;
      name: string;
    }
  };
  exercisePerformances: ExercisePerformance[];
}

export interface ExercisePerformance {
  id: number;
  exercise: {
    id: number;
    name: string;
    primaryMuscleGroup: string;
    imageUrl?: string;
    difficultyLevel: string;
  };
  setsCompleted: number;
  repsCompleted: number;
  weightUsed: string;
  notes?: string;
  orderNumber: number;
}

export interface WorkoutSessionListItem {
  id: number;
  sessionDate: string;
  completedDayNumber: number;
  exercisesCount: number;
  planName: string;
}

export interface WorkoutSessionRequest {
  userWorkoutPlanId: number;
  completedDayNumber: number;
  notes?: string;
  exercisePerformances: ExercisePerformanceRequest[];
}

export interface ExercisePerformanceRequest {
  exerciseId: number;
  setsCompleted: number;
  repsCompleted: number;
  weightUsed: string;
  notes?: string;
  orderNumber: number;
}

export interface ExerciseHistory {
  exerciseName: string;
  history: HistoryEntry[];
}

export interface HistoryEntry {
  date: string;
  setsCompleted: number;
  repsCompleted: number;
  weightUsed: string;
}
