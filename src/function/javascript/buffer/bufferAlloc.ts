export default {
  name: "$bufferAlloc",
  callback: (context) => {
    context.argsCheck(2);
    const [name, size, fill = 0, encoding = "utf8"] = context.splits;
    if (context.isError) return;

    const buffer = Buffer.alloc(size, fill, encoding);
    return context.buffer.set(name, buffer);
  },
};
