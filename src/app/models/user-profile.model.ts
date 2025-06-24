export interface UserProfile {
  id: number;
  height?: number;
  currentWeight?: number;
  trainingExperience?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'PROFESSIONAL';
  weeklyTrainings?: number;
  birthDate?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  goal?: string;
  updatedAt?: string;
}
