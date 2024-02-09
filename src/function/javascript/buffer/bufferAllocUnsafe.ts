export default {
  name: "$bufferAllocUnsafe",
  callback: (context) => {
    context.argsCheck(2);
    const [name, bytes] = context.splits;
    if (context.isError) return;

    if (!context.buffer.has(name)) {
      context.sendError(
        `The specified variable ${name} does not exist for the buffer`,
      );
      return;
    }

    const buffer = Buffer.allocUnsafe(bytes);
    return context.buffer.set(name, buffer);
  },
};
