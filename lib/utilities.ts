/**
 * Returns a random element from the given array of choices.
 * @param choices - An array of elements to choose from
 * @returns A randomly selected element from the choices array
 */
export function randomChoice<T>(choices: T[]): T {
  const index = Math.floor(Math.random() * choices.length);
  return choices[index];
}

/**
 * Clamps a number between a minimum and maximum value.
 * @param value - The number to clamp
 * @param min - The minimum allowed value
 * @param max - The maximum allowed value
 * @returns The clamped value (between min and max, inclusive)
 */
export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Returns a random integer between a minimum and maximum value.
 * @param min - The minimum allowed value
 * @param max - The maximum allowed value
 * @returns A random integer between min and max, inclusive
 */
export function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
