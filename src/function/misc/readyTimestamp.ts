export default {
  name: "$readyTimestamp",
  callback: (context) => {
    if (context.isError) return;

    return context.telegram.startTime;
  },
};
