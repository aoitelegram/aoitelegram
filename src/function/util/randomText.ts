import { AoiFunction, ArgsType } from "@structures/AoiFunction";

function shuffleArray(inputArray: any[]): any[] {
  for (let i = inputArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [inputArray[i], inputArray[j]] = [inputArray[j], inputArray[i]];
  }
  return inputArray;
}

export default new AoiFunction()
  .setName("$randomText")
  .setBrackets(true)
  .setFields({
    name: "text",
    rest: true,
    required: true,
    type: [ArgsType.Any],
    converType: ArgsType.String,
  })
  .onCallback(async (context, func) => {
    const texts = await func.resolveFields(context);
    const randomText =
      shuffleArray(texts)[Math.floor(Math.random() * texts.length)];

    return func.resolve(randomText);
  });
