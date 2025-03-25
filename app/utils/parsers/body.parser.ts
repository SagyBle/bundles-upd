export const parseBody = (formData: FormData): Record<string, any> => {
  let body: Record<string, any> = {};
  formData.forEach((value, key) => {
    body[key] = value;
  });
  return body;
};
