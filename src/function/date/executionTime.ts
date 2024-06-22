import { AoiFunction } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$executionTime")
  .setBrackets(false)
  .onCallback((context, func) => {
    return func.resolve(
      (performance.now() - context.executionTimestamp).toFixed(0),
    );
  });
