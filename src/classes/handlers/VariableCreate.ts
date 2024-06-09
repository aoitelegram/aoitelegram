import { getObjectKey } from "@utils/Helpers";
import type { AoiClient } from "../AoiClient";
import { ArgsType, AoiFunction } from "../AoiFunction";

function onVariableCreate(telegram: AoiClient): void {
  telegram.database.on("create", async (newVariable) => {
    const events = telegram.events.get("variableCreate");
    if (!events) return;

    for (const event of events) {
      telegram.ensureCustomFunction(
        new AoiFunction()
          .setName("$newVariable")
          .setBrackets(true)
          .setFields({
            name: "property",
            type: [ArgsType.Any],
            required: false,
          })
          .onCallback(async (context, func) => {
            const options = await func.resolveAllFields(context);
            const result = getObjectKey(newVariable, options);
            return func.resolve(result);
          }),
      );

      await telegram.evaluateCommand(event, { newVariable, telegram });
    }
  });
}

export default onVariableCreate;
