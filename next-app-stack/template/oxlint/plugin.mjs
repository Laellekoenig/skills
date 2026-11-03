import arrayObjectBlankLine, {
  RULE_NAME as arrayObjectBlankLineRuleName,
} from "./rules/array-object-blank-line.mjs"
import jsxSiblingBlankLine, {
  RULE_NAME as jsxSiblingBlankLineRuleName,
} from "./rules/jsx-sibling-blank-line.mjs"
import noTry, { RULE_NAME as noTryRuleName } from "./rules/no-try.mjs"
import noVoidResultTypes, {
  RULE_NAME as noVoidResultTypesRuleName,
} from "./rules/no-void-result-types.mjs"

// Project rules, loaded by `.oxlintrc.json` through `jsPlugins`.
const plugin = {
  meta: { name: "local" },
  rules: {
    [arrayObjectBlankLineRuleName]: arrayObjectBlankLine,
    [jsxSiblingBlankLineRuleName]: jsxSiblingBlankLine,
    [noTryRuleName]: noTry,
    [noVoidResultTypesRuleName]: noVoidResultTypes,
  },
}

export default plugin
