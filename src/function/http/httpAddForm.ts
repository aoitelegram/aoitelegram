import { HttpID } from "../index";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$httpAddForm")
  .setBrackets(false)
  .onCallback((context, func) => {
    const httpData = context.variable.get(HttpID);
    httpData["form"] = new FormData();
    context.variable.set(HttpID, httpData);
    return func.resolve(true);
  });
