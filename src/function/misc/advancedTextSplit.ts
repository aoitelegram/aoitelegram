export default {
  name: "$advancedTextSplit",
  callback: (context) => {
    context.argsCheck(1);
    let [text, ...fields] = context.splits;
    if (context.isError) return;

    let currentIndex = 0;
    while (currentIndex < fields.length) {
      let delimiter = fields[currentIndex];
      let position = fields[currentIndex + 1];
      currentIndex += 2;
      position = Number(position) - 1 || 0;
      text = text.split(delimiter)[position] || "";
    }

    return text;
  },
};
