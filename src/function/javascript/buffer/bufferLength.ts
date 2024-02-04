export default {
  name: "$bufferLength",
  callback: (context) => {
    context.argsCheck(1);
    const name = context.inside;
    if (context.isError) return;

    if (!context.buffer.has(name)) {
      context.sendError(
        `The specified variable ${name} does not exist for the buffer`,
      );
      return;
    }

    const buffer = context.buffer.get(name)?.length;
    return buffer;
  },
};
