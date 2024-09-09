import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
.setName("$switch")
.setBrackets(true)
.setFields({
    name: "Value",
    type: [ArgsType.Any],
    converType: ArgsType.String,
    required: true,
    rest: false
})
.setFields({
    name: "Cases",
    type: [ArgsType.Any],
    required: true,
    rest: false
})
.onCallback(async function (ctx, fn) {
    const value: string[] = await fn.resolveFields(ctx, [0])
    // Extracting the case functions.
    const cases = fn.overloads.filter((over) => over.structures.name === "$case")

    // Finding the default case.
    const defaultCase = cases.find((f) => f.fields[0] === "default")
    if (defaultCase) { // Extract it if found.
        const index = cases.findIndex((f) => f.fields[0] === "default")
        cases.splice(index, 1)
    }

    // Control and result variables.
    let executed = false, returnValue: any

    // Executing each case.
    for (const switchCase of cases) {
        const caseValue: string[] = await switchCase.resolveFields(ctx, [0])
        if (caseValue[0] === value[0]) {
            executed = true
            returnValue = await switchCase.resolveFields(ctx, [1])
            break
        }
    }

    // Executing the default case.
    if (defaultCase && !executed) {
        returnValue = await defaultCase.resolveFields(ctx, [1])
    }

    return fn.resolve(returnValue)
})