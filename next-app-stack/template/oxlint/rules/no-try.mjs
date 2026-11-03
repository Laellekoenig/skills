const RULE_NAME = "no-try"
const MESSAGE_ID = "useBetterResult"

// Disallows try statements so failures flow through better-result instead.
// Where a raw try is unavoidable, disable the rule on that line with a reason.
const noTry = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow try statements in favor of better-result.",
    },
    schema: [],
    messages: {
      [MESSAGE_ID]:
        "Use better-result (Result.try, Result.tryPromise) instead of try/catch.",
    },
  },

  create(context) {
    return {
      TryStatement(node) {
        context.report({
          node,
          messageId: MESSAGE_ID,
        })
      },
    }
  },
}

export default noTry
export { RULE_NAME }
