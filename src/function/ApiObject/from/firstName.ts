import { DataFunction } from "context";

const data: DataFunction = {
  name: "$firstName",
  callback: async (ctx, event, database, error) => {
    const firstName = event.from.first_name ?? event.message?.from.first_name;
    return firstName;
  },
};

export { data };
