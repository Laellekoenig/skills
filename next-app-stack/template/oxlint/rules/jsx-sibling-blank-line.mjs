const RULE_NAME = "jsx-sibling-blank-line"
const MESSAGE_ID = "missingBlankLine"

// Requires a blank line between sibling JSX elements that start on their own
// lines. Expression containers count as elements when they render JSX, as in
// `{isOpen && <Panel />}`. Inline text and text expressions like
// `{t("label")}` are left alone.
const jsxSiblingBlankLine = {
  meta: {
    type: "layout",
    docs: {
      description: "Require a blank line between sibling JSX elements.",
    },
    fixable: "whitespace",
    schema: [],
    messages: {
      [MESSAGE_ID]: "Leave a blank line between sibling JSX elements.",
    },
  },

  create(context) {
    const containersWithJsx = new Set()

    function isElementLike(node) {
      return (
        node.type === "JSXElement"
        || node.type === "JSXFragment"
        || containersWithJsx.has(node)
      )
    }

    function checkChildren(node) {
      const { children } = node

      for (let index = 1; index < children.length - 1; index++) {
        const separator = children[index]
        const next = children[index + 1]

        if (
          isElementLike(children[index - 1])
          && isElementLike(next)
          && isLineBreakWithoutBlankLine(separator)
        ) {
          context.report({
            node: next,
            messageId: MESSAGE_ID,
            fix: fixer =>
              fixer.replaceText(separator, separator.raw.replace("\n", "\n\n")),
          })
        }
      }
    }

    return {
      "JSXElement, JSXFragment"(node) {
        markEnclosingContainer(node, containersWithJsx)
      },

      "JSXElement:exit": checkChildren,

      "JSXFragment:exit": checkChildren,
    }
  },
}

export default jsxSiblingBlankLine
export { RULE_NAME }

function markEnclosingContainer(node, containersWithJsx) {
  let current = node.parent

  while (
    current
    && current.type !== "JSXElement"
    && current.type !== "JSXFragment"
  ) {
    if (current.type === "JSXExpressionContainer") {
      containersWithJsx.add(current)
      return
    }

    current = current.parent
  }
}

function isLineBreakWithoutBlankLine(node) {
  return (
    node.type === "JSXText"
    && /^\s*\n\s*$/.test(node.raw)
    && !/\n\s*\n/.test(node.raw)
  )
}
