export interface Exercise {
  name: string;
  sets: number;
  reps?: number;
  duration?: string;
  restSeconds?: number;
}

export interface Workout {
  id: string;
  name: string;
  category: string;
  duration: number;
  calories: number;
  level: string;
  accentColor: string;
  exercises: Exercise[];
}

export const WORKOUTS: Workout[] = [
  {
    id: "1",
    name: "Upper Body Power",
    category: "Strength",
    duration: 45,
    calories: 320,
    level: "Intermediate",
    accentColor: "#7C3AED",
    exercises: [
      { name: "Push-ups", sets: 4, reps: 15, restSeconds: 60 },
      { name: "Dumbbell Rows", sets: 4, reps: 12, restSeconds: 90 },
      { name: "Shoulder Press", sets: 3, reps: 10, restSeconds: 90 },
      { name: "Bicep Curls", sets: 3, reps: 12, restSeconds: 60 },
      { name: "Tricep Dips", sets: 3, reps: 15, restSeconds: 60 },
    ],
  },
  {
    id: "2",
    name: "Fat Burn HIIT",
    category: "HIIT",
    duration: 30,
    calories: 450,
    level: "Intermediate",
    accentColor: "#EF4444",
    exercises: [
      { name: "Burpees", sets: 4, duration: "40s", restSeconds: 20 },
      { name: "Jump Squats", sets: 4, duration: "40s", restSeconds: 20 },
      { name: "Mountain Climbers", sets: 4, duration: "40s", restSeconds: 20 },
      { name: "High Knees", sets: 4, duration: "40s", restSeconds: 20 },
    ],
  },
  {
    id: "3",
    name: "Lower Body Sculpt",
    category: "Strength",
    duration: 40,
    calories: 280,
    level: "Beginner",
    accentColor: "#EC4899",
    exercises: [
      { name: "Squats", sets: 4, reps: 15, restSeconds: 60 },
      { name: "Lunges", sets: 3, reps: 12, restSeconds: 60 },
      { name: "Glute Bridges", sets: 4, reps: 20, restSeconds: 45 },
      { name: "Calf Raises", sets: 3, reps: 20, restSeconds: 30 },
    ],
  },
  {
    id: "4",
    name: "Core & Abs",
    category: "Fat Loss",
    duration: 25,
    calories: 190,
    level: "Beginner",
    accentColor: "#10B981",
    exercises: [
      { name: "Plank", sets: 3, duration: "60s", restSeconds: 45 },
      { name: "Crunches", sets: 4, reps: 20, restSeconds: 30 },
      { name: "Leg Raises", sets: 3, reps: 15, restSeconds: 30 },
      { name: "Russian Twists", sets: 3, reps: 20, restSeconds: 30 },
    ],
  },
  {
    id: "5",
    name: "Mobility Flow",
    category: "Mobility",
    duration: 20,
    calories: 80,
    level: "All Levels",
    accentColor: "#22D3EE",
    exercises: [
      { name: "Cat-Cow Stretch", sets: 2, reps: 10, restSeconds: 20 },
      { name: "Hip Flexor Stretch", sets: 2, duration: "30s", restSeconds: 20 },
      { name: "Shoulder Rolls", sets: 2, reps: 10, restSeconds: 15 },
      { name: "Pigeon Pose", sets: 2, duration: "45s", restSeconds: 20 },
    ],
  },
  {
    id: "6",
    name: "Home Full Body",
    category: "Home",
    duration: 35,
    calories: 260,
    level: "Beginner",
    accentColor: "#F59E0B",
    exercises: [
      { name: "Jump Jacks", sets: 3, duration: "45s", restSeconds: 30 },
      { name: "Push-ups", sets: 3, reps: 12, restSeconds: 60 },
      { name: "Bodyweight Squats", sets: 3, reps: 15, restSeconds: 45 },
      { name: "Superman", sets: 3, reps: 12, restSeconds: 30 },
    ],
  },
];

export function getWorkoutById(id: string): Workout | undefined {
  return WORKOUTS.find((w) => w.id === id);
}
