export const retryWithDelay = async <T>(
  operation: () => Promise<T | null>,
  maxAttempts: number = 10,
  delayMs: number = 2000,
): Promise<T | null> => {
  let attempts = 0;

  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  while (attempts < maxAttempts) {
    const result = await operation();
    if (result) {
      return result;
    }

    attempts += 1;
    console.log(`Retrying... (${attempts}/${maxAttempts})`);
    await delay(delayMs);
  }

  console.error("Operation timed out.");
  return null;
};
