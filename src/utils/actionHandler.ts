export async function handleAction<T>(callback: () => Promise<T>) {
  try {
    const data = await callback();
    return {
      status: 200,
      message: "Operation successful",
      data,
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        status: 400,
        message: error.message,
        data: null,
      };
    }
    return {
      status: 500,
      message: "Unknown error occurred!!!",
      data: null,
    };
  }
}
