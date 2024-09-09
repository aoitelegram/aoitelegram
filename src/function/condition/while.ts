import { ArgsType, AoiFunction } from "@structures/AoiFunction";

export default new AoiFunction()
.setName("$while")
.setBrackets(true)
.setFields({
    name: "Condition",
    type: [ArgsType.Any],
    converType: ArgsType.String,
    required: true,
})
.setFields({
    name: "Code",
    type: [ArgsType.Any],
    required: true,
    rest: false
})
.setVersion("1.0.1")
.setOther("This function is experimental, cannot work as intended.")
.onCallback(async function(ctx, fn) {
    let conditionValue: string[] = await fn.resolveFields(ctx, [0])
    let returnValue: any
    
    let sastifiedCondition = ctx.condition.checkCondition(conditionValue[0])
    while (sastifiedCondition) {
        returnValue = await fn.resolveFields(ctx, [1])

        conditionValue = await fn.resolveFields(ctx, [0])
        sastifiedCondition = ctx.condition.checkCondition(conditionValue[0])
    }

    return fn.resolve(returnValue)
})