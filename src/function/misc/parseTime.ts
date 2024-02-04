import ms from "ms";

export default {
  name: "$parseTime",
  callback: (context) => {
    context.argsCheck(1);
    const [time, long] = context.splits;
    if (context.isError) return;

    return ms(isNaN(+time) ? time : +time, {
      long: long == "true",
    });
  },
};
