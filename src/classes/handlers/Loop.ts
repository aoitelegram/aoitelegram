import type { AoiClient } from "../AoiClient";
import type { CommandData } from "../AoiTyping";
import { ArgsType, AoiFunction } from "../AoiFunction";
import { setInterval, clearInterval } from "long-timeout";

async function loopCommand(
  telegram: AoiClient,
  commandData: CommandData,
  currentIndex: number = 1,
): Promise<boolean> {
  let loopStopped = false;
  telegram.ensureCustomFunction([
    new AoiFunction()
      .setName("$break")
      .setBrackets(false)
      .onCallback((context, func) => {
        loopStopped = true;
        context.stopCode = true;
        return func.resolve();
      }),
    new AoiFunction()
      .setName("$continue")
      .setBrackets(false)
      .onCallback((context, func) => {
        context.stopCode = true;
        return func.reject();
      }),
    new AoiFunction()
      .setName("$index")
      .onCallback((context, func) => func.resolve(currentIndex)),
  ]);

  await telegram.evaluateCommand(commandData, telegram);
  return loopStopped;
}

async function onLoop(telegram: AoiClient): Promise<void> {
  const events = telegram.events.get("loop");
  if (!events) return;

  for (const event of events) {
    let currentIndex = 1;

    const executeLoop = async () => {
      const stopped = await loopCommand(
        telegram,
        event as CommandData,
        currentIndex,
      );
      if (stopped) return true;
      currentIndex++;
      return false;
    };

    if (event.executeOnStartup) {
      const stopped = await executeLoop();
      if (stopped) continue;
    }

    const intervalId = setInterval(async () => {
      const stopped = await executeLoop();
      if (stopped) clearInterval(intervalId);
    }, event?.every || 60000);
  }
}

export default onLoop;
