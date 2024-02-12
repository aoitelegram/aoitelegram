export default {
  name: "$toLocaleTimeString",
  callback: (context) => {
    return new Date().toLocaleTimeString();
  },
};
