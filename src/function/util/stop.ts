import { AoiFunction } from "@structures/AoiFunction";

export default new AoiFunction()
    .setName("$stop")
    .setBrackets(false)
    .onCallback(async (ctx, func) => {
        ctx.stopCode = true;
        return func.resolve();
    })