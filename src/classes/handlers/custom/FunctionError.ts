import { getObjectKey } from "@aoitelegram/util";
import type { AoiClient } from "../../AoiClient";
import { AoiFunction, ArgsType } from "../../AoiFunction";

function onFunctionError(telegram: AoiClient): void {
  telegram.on(
    "functionError",
    async (container, { errorMessage, functionName, ...outData }) => {
      const events = telegram.events.get("functionError");
      if (!events) return;

      container.telegram.ensureCustomFunction(
        new AoiFunction()
          .setName("$handleError")
          .setBrackets(true)
          .setFields({
            name: "property",
            required: false,
            type: [ArgsType.Any],
          })
          .onCallback(async (context, func) => {
            const options = await func.resolveAllFields(context);

            const result = getObjectKey(
              {
                name: functionName,
                error: errorMessage,
                ...outData,
              },
              options,
            );
            return func.resolve(result);
          }),
      );

      for (const event of events) {
        await telegram.evaluateCommand(event, container.eventData);
      }
    },
  );
}

export default onFunctionError;
