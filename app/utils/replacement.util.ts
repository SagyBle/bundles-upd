/**
 * Selects a replacement stone from a list of suggestions.
 * Currently a mock — picks one at random.
 *
 * @param suggestedStones - Array of stone objects to choose from
 * @returns A single selected stone or null if list is empty
 */
export function pickBestReplacementStone(suggestedStones: any[]): any | null {
  if (!suggestedStones.length) return null;

  const randomIndex = Math.floor(Math.random() * suggestedStones.length);
  return suggestedStones[randomIndex];
}
