import { getObjectKey } from "@utils/Helpers";
import type { AoiClient } from "../AoiClient";
import { ArgsType, AoiFunction } from "../AoiFunction";

function onVariableUpdate(telegram: AoiClient): void {
  telegram.database.on("update", async (variable) => {
    const events = telegram.events.get("variableUpdate");
    if (!events) return;

    for (const event of events) {
      telegram.ensureCustomFunction(
        new AoiFunction()
          .setName("$variable")
          .setBrackets(true)
          .setFields({
            name: "property",
            type: [ArgsType.Any],
            required: false,
          })
          .onCallback(async (context, func) => {
            const options = await func.resolveAllFields(context);
            const result = getObjectKey(variable, options);
            return func.resolve(result);
          }),
      );

      await telegram.evaluateCommand(event, { variable, telegram });
    }
  });
}

export default onVariableUpdate;
