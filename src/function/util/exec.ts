import { execSync } from "node:child_process";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$exec")
  .setBrackets(true)
  .setFields({
    name: "command",
    required: true,
    type: [ArgsType.Any],
    converType: ArgsType.String,
  })
  .onCallback(async (context, func) => {
    const [command] = await func.resolveFields(context);

    try {
      return func.resolve(execSync(command).toString());
    } catch (err) {
      return func.reject(`${err}`);
    }
  });
