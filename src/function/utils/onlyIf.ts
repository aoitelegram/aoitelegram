// import { DataFunction } from "context";
// 
// const data: DataFunction = {
//   name: "$onlyIf",
//   callback: async (ctx, event, database, error) => {
//     if (!ctx.argsCheck(2, true, error, "$onlyIf")) return;
// 
//     const [condition] = ctx.getArgs(0, 1);
//     const [ifTrue, replyMessage] = await ctx.evaluateArgs(ctx.getArgs(1, 3));
//     const opIdx = condition.child.findIndex(
//       (node: any) => node.type === "operator",
//     );
//     const opNode = condition.child[opIdx] as any;
// 
//     const [condA, condB] = await ctx.evaluateArgs([
//       { type: "argument", child: condition.child.slice(0, opIdx) },
//       { type: "argument", child: condition.child.slice(opIdx + 1) },
//     ]);
//     
//     console.log(condA, condB)
// 
//     let res: boolean;
// 
//     switch (opNode.value) {
//       case "==":
//         res = condA == condB;
//         break;
//       case "!=":
//         res = condA != condB;
//         break;
//       case ">=":
//         res = condA >= condB;
//         break;
//       case ">":
//         res = condA > condB;
//         break;
//       case "<=":
//         res = condA <= condB;
//         break;
//       case "<":
//         res = condA < condB;
//         break;
//       default:
//         res = false;
//         break;
//     }
// 
//     if (res) {
//       replyMessage ? event.reply(ifTrue) : event.send(ifTrue);
//       return { break: true };
//     }
//     return "";
//   },
// };
// 
// export { data };
// 