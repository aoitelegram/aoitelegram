import { ArgsType, AoiFunction } from "@structures/AoiFunction";

export default new AoiFunction()
.setName("$case")
.setBrackets(true)
.setFields({
    name: "Value",
    type: [ArgsType.Any],
    converType: ArgsType.String,
    required: true,
    rest: false
})
.setFields({
    name: "Code",
    type: [ArgsType.Any],
    required: true,
    rest: false
})
.onCallback(async function(ctx, fn) {
    const commandFunctions = ctx.command.functions
    const parentFunction = commandFunctions.find((f) => f.id === fn.parentID)
    
    if (parentFunction?.structures.name !== "$switch") {
        return fn.reject("$case cannot be used outside $switch!")
    }

    return fn.resolve("")
})