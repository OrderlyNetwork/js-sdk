export const getOperationStatusColor = (status: string) => {
  if (status === "completed") {
    return "success";
  }
  if (status === "rejected") {
    return "danger";
  }
  return "primary";
};
