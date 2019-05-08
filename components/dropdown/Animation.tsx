import * as React from 'react'
import { findDOMNode } from 'react-dom'
import { CSSTransition } from 'react-transition-group'
import { EndHandler } from 'react-transition-group/Transition'

interface AnimationProps extends Partial<CSSTransition.CSSTransitionProps> {
  hiddenClassName?: string
  onEntered?: (node?: HTMLElement, isAppearing?: boolean) => void
  onExited?: (node?: HTMLElement) => void
}

export default class Animation extends React.PureComponent<AnimationProps> {
  private get preformAnimation () {
    return !!this.props.classNames
  }

  componentDidMount () {
    if (!this.preformAnimation) {
      this.props.onEntered && this.props.onEntered(this.getContainer(), true)
    }
  }

  componentDidUpdate (preProps: AnimationProps) {
    if (!this.preformAnimation && this.props.in !== preProps.in) {
      if (this.props.in) {
        this.props.onEntered && this.props.onEntered(this.getContainer(), false)
      } else {
        this.props.onExited && this.props.onExited()
      }
    }
  }

  componentWillUnmount () {
    this.props.onExited && this.props.onExited()
  }

  render () {
    // https://reactcommunity.org/react-transition-group/css-transition
    // 参考 CSSTransition 定义一系列动画的 className
    const { classNames, hiddenClassName, children, ...restProps } = this.props

    // 没有定义动画的场景
    if (!this.preformAnimation) {
      return this.props.in ? children : null
    }

    const transitionClassNames = typeof classNames === 'object' ? classNames : {
      appear: `${classNames}-appear`,
      appearActive: `${classNames}-appear-active`,
      enter: `${classNames}-enter`,
      enterActive: `${classNames}-enter-active`,
      enterDone: `${classNames}-enter-done`,
      exit: `${classNames}-exit`,
      exitActive: `${classNames}-exit-active`,
      exitDone: `${classNames}-exit-done`,
    }

    if (hiddenClassName) {
      transitionClassNames.exitDone = hiddenClassName
    }

    return (
      <CSSTransition
        { ...restProps }
        timeout={ 300 }
        classNames={ transitionClassNames }
        addEndListener={ this.onTransitionEnd }
      >
        { children }
      </CSSTransition>
    )
  }

  private getContainer = () => {
    const container = findDOMNode(this)
    if (container && container instanceof HTMLElement) {
      return container
    }
    throw new Error('The Animation chilren is not a HTMLElement')
  }

  private onTransitionEnd: EndHandler = (node, done) => {
    node.addEventListener('transitionend', done, false)
  }
}
