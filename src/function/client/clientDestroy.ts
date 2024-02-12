export default {
  name: "$clientDestroy",
  callback: (context) => {
    if (context.isError) return;
    context.telegram.disconnect();
  },
};
