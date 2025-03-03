# `rst-compiler` Changelog

This document only contains breaking changes

## 0.5.0

* Replace enums with raw string to comply with `erasableSyntaxOnly` in TypeScript 5.8
    - `RstNodeType`
    - `RstEnumeratedListType`
    - `PyTokenType`

    If you were referencing these enums as types, then you should not need to make any changes.

    If you were referencing these enums as values, then you can use this search/replace regex:
    - Search: `RstNodeType\.(\w+)`
    - Replace: `'$1'`

## 0.4.0

* Replace `SimpleNameResolver.registerNodeAsTargetable` with `registerExplicitNode` and `registerImplicitNode`

* Replace `SimpleNameResolver.registerExternalTargetableNode` with `registerNodeAsLinkable`

## 0.3.0

* Rename `RstGeneratorOptions.defaultSyntaxLanguage` to `RstGeneratorOptions.defaultCodeDirectiveLanguage`

## 0.2.0

* Rename `RstNode.toJson` to `RstNode.toJSON`
