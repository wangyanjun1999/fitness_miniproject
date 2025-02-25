import { useMemo } from 'react';
import type { Exercise } from '../types/database';

interface ExerciseGroups {
  warmup: Exercise[];
  strength: Exercise[];
  cardio: Exercise[];
}

export const useExerciseGroups = (exercises: Exercise[]): ExerciseGroups => {
  return useMemo(() => {
    const warmup = exercises.filter(e => e.exercise_type === 'warmup');
    const strength = exercises.filter(e => e.exercise_type === 'strength');
    const cardio = exercises.filter(e => e.exercise_type === 'cardio');

    return {
      warmup,
      strength,
      cardio
    };
  }, [exercises]);
};