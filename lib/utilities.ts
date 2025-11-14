export function randomChoice<T>(choices: T[]): T {
  const index = Math.floor(Math.random() * choices.length);
  return choices[index];
}
