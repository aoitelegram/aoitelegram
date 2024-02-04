export default {
  name: "$bufferCreate",
  callback: (context) => {
    context.argsCheck(1);
    const [name, ...content] = context.splits;
    if (context.isError) return;

    const buffer = Buffer.from(content.join(" "));
    return context.buffer.set(name, buffer).size;
  },
};
