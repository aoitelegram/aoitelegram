export default {
  name: "$emitData",
  callback: (context) => {
    context.argsCheck(2);
    const [eventName, ...eventData] = context.splits;
    if (context.isError) return;

    if (!context.telegram?.customEvent) {
      context.sendError(`Invalid not incilized class 'CustomEvent'`);
      return;
    }

    context.telegram.customEvent.emit(eventName, ...eventData);
  },
};
