import ms from "ms";

export default {
  name: "$await",
  callback: async (context) => {
    const time = +ms(context.inside);
    return new Promise((res) => setTimeout(() => res(""), time));
  },
};
