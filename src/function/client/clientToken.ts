export default {
  name: "$clientToken",
  callback: (context) => {
    return context.telegram.token;
  },
};
