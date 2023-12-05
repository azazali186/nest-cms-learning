export const ApiResponse = (
  data: any,
  statusCode: number = 200,
  message: any = null,
  error: any = null,
) => {
  return {
    data,
    statusCode,
    message,
    error,
  };
};
