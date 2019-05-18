declare module '*.styl' {
  const styleObject: {
    [key: string]: string
  }

  export default styleObject
}

declare module '*.md' {
  const markdownRow: string
  export default markdownRow
}