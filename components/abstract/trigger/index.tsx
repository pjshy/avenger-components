import * as React from 'react'

const EventHandlerList = ['onClick', 'onMouseDown', 'onMouseEnter', 'onMouseLeave', 'onFocus', 'onBlur'] as const

export const Trigger: React.SFC<React.HTMLAttributes<HTMLElement>> = React.memo((props) => {
  const { children, ...restProps } = props

  if (!React.isValidElement<React.HTMLAttributes<HTMLElement>>(children)) {
    throw new Error('The children in <Trigger /> is not a valid react element')
  }

  const childProps = children.props

  const mixinEventProps = mixinEvent(childProps, restProps)

  return React.cloneElement(children, { ...childProps, ...restProps, ...mixinEventProps })
})

function mixinEvent (...propsArgs: React.HTMLAttributes<HTMLElement>[]): React.HTMLAttributes<HTMLElement> {
  const newProps: React.HTMLAttributes<HTMLElement> = {}

  return EventHandlerList.reduce((props, hanlder) => {
    props[hanlder] = (e: React.MouseEvent<HTMLElement> | React.FocusEvent<HTMLElement>) => {
      propsArgs.forEach((propsOne) => {
        // todo
        const fn = propsOne[hanlder] as any
        fn && fn(e)
      })
    }
    return props
  }, newProps)
}
