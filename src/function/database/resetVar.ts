import { AoiManager } from "@structures/AoiManager";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$resetVar")
  .setBrackets(true)
  .setFields({
    name: "variable",
    required: true,
    type: [ArgsType.Any],
  })
  .setFields({
    name: "table",
    required: false,
    type: [ArgsType.Any],
    defaultValue: (context) => context.database.tables[0],
  })
  .onCallback(async (context, func) => {
    if (!(context.database instanceof AoiManager)) {
      return func.reject(
        "You can use this function only if the class for the database is a built-in class.",
      );
    }

    const [variable, table] = await func.resolveFields(context);

    if (!(await context.database.hasTable(table))) {
      return func.reject(`Invalid table "${table}" not found`);
    }

    const allVars = await context.database.findMany(table, ({ key }) => {
      return variable === key;
    });

    for (const { key } of allVars) {
      await context.database.set(
        table,
        key,
        context.database.collection.get(`${variable}_${table}`),
      );
    }

    return func.resolve(allVars.length);
  });
