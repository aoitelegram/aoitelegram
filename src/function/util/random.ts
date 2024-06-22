import { RandomID } from "../index";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$random")
  .setBrackets(true)
  .setFields({
    name: "min",
    required: true,
    type: [ArgsType.Number],
  })
  .setFields({
    name: "max",
    required: true,
    type: [ArgsType.Number],
  })
  .setFields({
    name: "useCache",
    required: false,
    type: [ArgsType.Boolean],
    defaultValue: true,
  })
  .onCallback(async (context, func) => {
    const [min, max, useCache] = await func.resolveFields(context);
    const variableRandom = context.variable.get(RandomID);

    if (min >= max) {
      return func.reject("Minimum value must be less than maximum value");
    }

    const cacheKey = `${min}_${max}`;

    if (useCache && variableRandom?.[cacheKey]) {
      return func.resolve(variableRandom[cacheKey]);
    }

    const randomValue = Math.floor(Math.random() * (max - min + 1)) + min;

    if (useCache) {
      variableRandom[cacheKey] = randomValue;
      context.variable.set(RandomID, variableRandom);
    }

    return randomValue.toString();
  });
