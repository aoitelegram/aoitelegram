export default {
  name: "$lastName",
  callback: async (ctx, event, database, error) => {
    const lastName = event.from.last_name ?? event.message?.from.last_name;
    return lastName;
  },
};
