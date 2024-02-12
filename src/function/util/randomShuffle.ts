export default {
  name: "$randomShuffle",
  callback: (context) => {
    context.argsCheck(1);
    const [...textArray] = context.splits;
    if (context.isError) return;

    function shuffleArray(inputArray) {
      for (let i = inputArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [inputArray[i], inputArray[j]] = [inputArray[j], inputArray[i]];
      }
      return inputArray;
    }

    const randomText =
      shuffleArray(textArray)[Math.floor(Math.random() * textArray.length)];

    return randomText;
  },
};
