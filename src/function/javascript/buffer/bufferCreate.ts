export default {
  name: "$bufferCreate",
  callback: (context) => {
    context.argsCheck(1);
    const [name, ...content] = context.splits;
    if (context.isError) return;

    if (context.buffer.has(name)) {
      context.sendError(
        `The specified variable ${name} does exist for the buffer`,
      );
      return;
    }

    const buffer = Buffer.from(content.join(" "));
    return context.buffer.set(name, buffer).size;
  },
};
