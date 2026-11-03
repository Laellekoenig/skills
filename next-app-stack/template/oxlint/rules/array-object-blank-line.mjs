const RULE_NAME = "array-object-blank-line"
const MESSAGE_ID = "missingBlankLine"

// Requires a blank line between adjacent multiline object literals in an
// array, as in a list of table columns. Single-line objects and objects that
// share a line are left alone. Gaps with comments require manual spacing.
const arrayObjectBlankLine = {
  meta: {
    type: "layout",
    docs: {
      description:
        "Require a blank line between multiline objects in an array.",
    },
    fixable: "whitespace",
    schema: [],
    messages: {
      [MESSAGE_ID]: "Leave a blank line between multiline objects in an array.",
    },
  },

  create(context) {
    const { sourceCode } = context

    return {
      ArrayExpression(node) {
        const { elements } = node

        for (let index = 1; index < elements.length; index++) {
          const previous = elements[index - 1]
          const next = elements[index]

          if (!isMultilineObject(previous) || !isMultilineObject(next)) {
            continue
          }

          const range = [previous.range[1], next.range[0]]
          const separator = sourceCode.text.slice(...range)

          if (isLineBreakWithoutBlankLine(separator)) {
            context.report({
              node: next,
              messageId: MESSAGE_ID,
              fix(fixer) {
                if (separator.includes("//") || separator.includes("/*")) {
                  return null
                }

                return fixer.replaceTextRange(
                  range,
                  separator.replace("\n", "\n\n"),
                )
              },
            })
          }
        }
      },
    }
  },
}

export default arrayObjectBlankLine
export { RULE_NAME }

function isMultilineObject(node) {
  return (
    node?.type === "ObjectExpression"
    && node.loc.start.line !== node.loc.end.line
  )
}

function isLineBreakWithoutBlankLine(text) {
  return text.includes("\n") && !/\n\s*\n/.test(text)
}
