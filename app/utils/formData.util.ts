export function extractFormData<T extends string>(
  formData: FormData,
  fields: T[],
): Record<T, string> {
  const extractedData = {} as Record<T, string>;

  for (const field of fields) {
    const value = formData.get(field);
    if (!value || typeof value !== "string") {
      throw new Error(`${field} is required.`);
    }
    extractedData[field] = value;
  }

  return extractedData;
}
