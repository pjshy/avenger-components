import * as React from 'react'

export const Trigger: React.SFC<React.HTMLAttributes<HTMLElement>> = React.memo((props) => {
  const { children, ...restProps } = props

  if (!React.isValidElement<React.HtmlHTMLAttributes<HTMLElement>>(children)) {
    throw new Error('The children in <Trigger /> is not a valid react element')
  }

  const childProps = children.props

  return React.cloneElement(children, { ...childProps, ...restProps })
})