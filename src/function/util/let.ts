import { AoiFunction } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$let")
  .setBrackets(true)
  .setFields({ required: true })
  .setFields({ required: true })
  .onCallback(async (context, func) => {
    func.checkArguments();

    const [name, value] = await func.resolveFields(context);
    context.variable.set(name, value);
    return func.resolve();
  });
