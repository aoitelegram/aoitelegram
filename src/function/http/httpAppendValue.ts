import { HttpID } from "../index";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$httpAppendValue")
  .setBrackets(true)
  .setFields({
    name: "key",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "value",
    required: true,
    type: [ArgsType.Any],
  })
  .onCallback(async (context, func) => {
    const [key, value] = await func.resolveFields(context);
    const httpData = context.variable.get(HttpID);

    if ("form" in httpData) {
      return func.reject("To add a value, you need to use $httpAddForm first");
    }

    httpData.form.append(key, value);
    context.variable.set(HttpID, httpData);
    return func.resolve(true);
  });
