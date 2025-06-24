import {MuscleGroup, DifficultyLevel, Exercise} from './exercise.model';

export interface WorkoutPlan {
  id?: number;
  name: string;
  description: string;
  imageUrl?: string;
  difficultyLevel: DifficultyLevel;
  goal: WorkoutGoal;
  estimatedDurationMinutes?: number;
  suggestedFrequencyPerWeek: number;
  equipmentNeeded?: string;
  caloriesBurned?: number;
  tags: string[];
  createdAt?: string;
  author?: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
  isPublic: boolean;
  averageRating?: number;
  ratingsCount?: number;
  participantsCount?: number;
  totalDays?: number;
  isRatedByCurrentUser?: boolean;
  workoutDays: WorkoutDay[];
}

export interface WorkoutDay {
  id?: number;
  dayNumber: number;
  name: string;
  description?: string;
  exercises: WorkoutExercise[];
}

export interface WorkoutExercise {
  id?: number;
  exercise?: Exercise;
  exerciseId?: number;
  order: number;
  setsCount: number;
  repsCount: number;
  restTimeSeconds: number;
  weight?: string;
  notes?: string;
}

export enum WorkoutGoal {
  STRENGTH = 'STRENGTH',
  ENDURANCE = 'ENDURANCE',
  WEIGHT_LOSS = 'WEIGHT_LOSS',
  MUSCLE_GAIN = 'MUSCLE_GAIN',
  GENERAL_FITNESS = 'GENERAL_FITNESS',
  FLEXIBILITY = 'FLEXIBILITY'
}

export interface WorkoutPlanRating {
  id?: number;
  user?: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
  rating: number;
  comment: string;
  createdAt?: string;
}

export interface UserWorkoutPlan {
  id: number;
  workoutPlan: {
    id: number;
    name: string;
    imageUrl?: string;
    difficultyLevel: DifficultyLevel;
    goal: WorkoutGoal;
    suggestedFrequencyPerWeek: number;
    averageRating?: number;
    ratingsCount?: number;
    participantsCount?: number;
    totalDays?: number;
  };
  startDate: string;
  currentDay: number;
  status: WorkoutPlanStatus;
  completionDate?: string;
  progressPercentage: number;
  lastWorkoutDate?: string;
  totalWorkouts?: number;
}

export enum WorkoutPlanStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ABANDONED = 'ABANDONED'
}

export interface WorkoutPlanProgress {
  currentDay: number;
  status: WorkoutPlanStatus;
  progressPercentage: number;
}

export interface JoinWorkoutPlanRequest {
  workoutPlanId: number;
}
