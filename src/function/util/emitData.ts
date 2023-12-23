export default {
  name: "$emitData",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(2, error, "$emitData");
    const [eventName, ...eventData] = await ctx.getEvaluateArgs();
    event.telegram?.customEvent.emit(eventName, ...eventData);
  },
};
