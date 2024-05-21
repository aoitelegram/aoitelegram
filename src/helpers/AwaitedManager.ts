import { getObjectKey } from "../utils/";
import { Collection } from "@telegram.ts/collection";
import { AoijsTypeError } from "../classes/AoiError";
import type { AoiClient } from "../classes/AoiClient";
import type { Container } from "../classes/core/Container";
import { ArgsType, AoiFunction } from "../classes/AoiFunction";
import type { CommandData, ReturnPrimitive } from "../classes/AoiTyping";

class AwaitedManager {
  private readonly telegram: AoiClient;
  private readonly awaiteds: Collection<string, CommandData<{ name: string }>> =
    new Collection();

  constructor(telegram: AoiClient) {
    this.telegram = telegram;
  }

  registerAwaited(description: CommandData<{ name: string }>): void {
    if (this.awaiteds.has(description.name)) {
      throw new AoijsTypeError(
        `The awaited '${description.name}' already exists`,
      );
    }

    this.awaiteds.set(description.name, description);
  }

  handleAwaited(): void {
    this.telegram.on("addAwaited", async (event, context) => {
      const awaitedDescription = this.awaiteds.get(event.name);
      if (!awaitedDescription) return;

      for (let index = 1; index <= event.count; index++) {
        this.telegram.ensureCustomFunction([
          new AoiFunction()
            .setName("$awaitedData")
            .setBrackets(true)
            .setFields({
              name: "property",
              required: false,
              type: [ArgsType.String],
            })
            .onCallback(async (ctx, func) => {
              const key = await func.resolveAllFields(ctx);
              const response = getObjectKey(event.outData, key);
              return func.resolve(response);
            }),
          new AoiFunction()
            .setName("$break")
            .setBrackets(false)
            .onCallback((ctx, func) => {
              ctx.stopCode = true;
              return func.reject();
            }),
          new AoiFunction()
            .setName("$continue")
            .setBrackets(false)
            .onCallback((ctx, func) => {
              ctx.stopCode = true;
              return func.reject();
            }),
          new AoiFunction()
            .setName("$index")
            .setBrackets(false)
            .onCallback((ctx, func) => func.resolve(index)),
        ]);

        await this.telegram.evaluateCommand(
          awaitedDescription,
          context.eventData,
        );
      }
    });
  }
}

export { AwaitedManager };
