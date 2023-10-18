import { DataFunction } from "context";
import { AoiParse } from "../../classes/AoiParse";

const data: DataFunction = {
  name: "$sendMessage",
  callback: async (ctx, event, database, error) => {
    if (!ctx.argsCheck(1, true, error, "$sendMessage")) return;
    const args = await ctx.evaluateArgs(ctx.getArgs());
//     const replyMessage = ctx.getArgs(1, 2);
    
//     if (args[1]) {
//       event.send(args[0], { 
//         reply_markup: replyMessage,
//       });
//       return "";
//     }
    event.send(args[0]);
    return "";
  },
};

export { data };
