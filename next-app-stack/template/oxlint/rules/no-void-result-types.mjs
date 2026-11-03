const RULE_NAME = "no-void-result-types"
const MESSAGE_ID = "useNullInsteadOfVoid"

function getIdentifierName(node) {
  if (node && node.type === "Identifier") {
    return node.name
  }

  return null
}

function isVoidType(node) {
  return node?.type === "TSVoidKeyword"
}

function getTypeArgumentNodes(node) {
  if (
    !node.typeArguments
    || node.typeArguments.type !== "TSTypeParameterInstantiation"
  ) {
    return []
  }

  return node.typeArguments.params
}

const noVoidResultTypes = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow void success types for better-result values.",
    },
    schema: [],
    messages: {
      [MESSAGE_ID]: "Use null instead of void for better-result success types.",
    },
  },

  create(context) {
    const resultValueNames = new Set()
    const resultTypeNames = new Set()
    const serializedResultTypeNames = new Set()

    function reportIfVoidType(typeNode) {
      if (isVoidType(typeNode)) {
        context.report({
          node: typeNode,
          messageId: MESSAGE_ID,
        })
      }
    }

    return {
      ImportDeclaration(node) {
        if (node.source.value !== "better-result") {
          return
        }

        for (const specifier of node.specifiers) {
          if (specifier.type !== "ImportSpecifier") {
            continue
          }

          const importedName = getIdentifierName(specifier.imported)
          if (!importedName) {
            continue
          }

          if (importedName === "Result") {
            if (specifier.importKind === "type" || node.importKind === "type") {
              resultTypeNames.add(specifier.local.name)
            } else {
              resultValueNames.add(specifier.local.name)
            }
          }

          if (importedName === "SerializedResult") {
            serializedResultTypeNames.add(specifier.local.name)
          }
        }
      },

      TSTypeReference(node) {
        const typeName = getIdentifierName(node.typeName)
        if (!typeName) {
          return
        }

        const typeArguments = getTypeArgumentNodes(node)
        if (typeArguments.length === 0) {
          return
        }

        if (
          resultTypeNames.has(typeName)
          || serializedResultTypeNames.has(typeName)
        ) {
          reportIfVoidType(typeArguments[0])
        }
      },

      CallExpression(node) {
        if (node.callee.type !== "MemberExpression" || node.callee.computed) {
          return
        }

        const objectName = getIdentifierName(node.callee.object)
        const propertyName = getIdentifierName(node.callee.property)
        if (!objectName || !propertyName) {
          return
        }

        if (
          !resultValueNames.has(objectName)
          || propertyName !== "deserialize"
        ) {
          return
        }

        const typeArguments = getTypeArgumentNodes(node)
        if (typeArguments.length === 0) {
          return
        }

        reportIfVoidType(typeArguments[0])
      },
    }
  },
}

export default noVoidResultTypes
export { RULE_NAME }
