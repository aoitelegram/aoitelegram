export default {
  name: "$entitiesMessage",
  callback: (context) => {
    context.argsCheck(1);
    const [index, path = "type"] = context.splits;
    const entities = context.event.entities || context.event.message?.entities;
    if (context.isError) return;

    if (!entities[Number(index) + 1]) {
      context.sendError("Invalid index");
      return;
    }

    return entities[Number(index) - 1][path];
  },
};
