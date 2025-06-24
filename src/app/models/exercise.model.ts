
export interface Exercise {
  id?: number;
  name: string;
  description: string;
  primaryMuscleGroup: MuscleGroup;
  secondaryMuscleGroups: MuscleGroup[];
  imageUrl?: string;
  videoUrl?: string;
  difficultyLevel: DifficultyLevel;
  equipmentNeeded?: string;
  caloriesBurned?: number;
  tags: string[];
  riskLevel: RiskLevel;
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
  isRatedByCurrentUser?: boolean;
}

export interface ExerciseListItem {
  id: number;
  name: string;
  primaryMuscleGroup: MuscleGroup;
  imageUrl?: string;
  difficultyLevel: DifficultyLevel;
  averageRating?: number;
  ratingsCount?: number;
}

export enum MuscleGroup {
  CHEST = 'CHEST',
  BACK = 'BACK',
  SHOULDERS = 'SHOULDERS',
  BICEPS = 'BICEPS',
  TRICEPS = 'TRICEPS',
  LEGS = 'LEGS',
  CORE = 'CORE',
  GLUTES = 'GLUTES',
  CALVES = 'CALVES',
  FOREARMS = 'FOREARMS',
  FULL_BODY = 'FULL_BODY'
}

export enum DifficultyLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED'
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}


export interface PageRequest {
  page: number;
  size: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}


export interface ExerciseRating {
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

export interface RatingRequest {
  rating: number;
  comment: string;
}
