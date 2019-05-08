import * as React from 'react'
import { findDOMNode } from 'react-dom'
import PopperJS, { Placement, ReferenceObject, PopperOptions } from 'popper.js'

import Animation from './Animation'

interface PopupProps {
  visible: boolean
  destroyOnHide: boolean
  placement?: Placement
  offset?: number | string
  reference: Element | ReferenceObject | (() => Element | ReferenceObject) | null
  boundariesElement?: Element | PopperJS.Boundary | (() => Element | PopperJS.Boundary)
  className?: string
  transitionName?: string
  hiddenClassName?: string
  style?: React.CSSProperties
  zIndex?: number
  onPopupHide?: () => void
  onClick?: React.MouseEventHandler<HTMLElement>
  onMouseDown?: React.MouseEventHandler<HTMLElement>
  onMouseEnter?: React.MouseEventHandler<HTMLElement>
  onMouseLeave?: React.MouseEventHandler<HTMLElement>
  onOpen?: (node?: HTMLElement, isAppearing?: boolean) => void
  onHide?: (node?: HTMLElement) => void
}

export default class Popup extends React.PureComponent<PopupProps> {
  static defaultProps: Partial<PopupProps> = {
    visible: false,
    destroyOnHide: true,
    boundariesElement: 'viewport',
  }

  private popperInstance: PopperJS | null = null

  private popupRef = React.createRef<HTMLDivElement>()

  updatePosition = () => {
    if (this.popperInstance) {
      this.popperInstance.scheduleUpdate()
    }
  }

  componentDidMount () {
    this.updatePopperInstance()
  }

  componentWillUnmount () {
    this.destroyPopperInstance()
  }

  componentDidUpdate (preProps: PopupProps) {
    const { visible, placement, offset } = this.props
    if (visible) {
      if (
        !this.popperInstance ||
        placement !== preProps.placement ||
        offset !== preProps.offset
      ) {
        this.updatePopperInstance()
      } else {
        this.updatePosition()
      }
    }
  }

  render () {
    const { destroyOnHide, children, transitionName, style, zIndex, visible } = this.props
    const popupStyle = style || {}

    if (zIndex) {
      popupStyle.zIndex = zIndex
    }

    return (
      <Animation
        appear={ true }
        in={ visible }
        classNames={ transitionName }
        unmountOnExit={ destroyOnHide }
        onEntered={ this.onEntered }
        onExited={ this.onExited }
      >
        <div
          ref={ this.popupRef }
          onClick={ this.props.onClick }
          onMouseDown={ this.props.onMouseDown }
          onMouseEnter={ this.props.onMouseEnter }
          onMouseLeave={ this.props.onMouseLeave }
          className={ this.props.className }
          style={ popupStyle }
        >
          { children }
        </div>
      </Animation>
    )
  }

  private getPopperOptions = (): PopperOptions => {
    return {
      placement: this.props.placement || 'bottom',
      modifiers: {
        offset: { offset: this.props.offset || '0' },
        computeStyle: { gpuAcceleration: false },
        preventOverflow: { boundariesElement: this.getBoundariesElement() },
      },
    }
  }

  // https://popper.js.org/popper-documentation.html#modifiers..preventOverflow.boundariesElement
  private getBoundariesElement (): Element | PopperJS.Boundary {
    if (this.props.boundariesElement) {
      if (typeof this.props.boundariesElement === 'function') {
        return this.props.boundariesElement()
      }
      return this.props.boundariesElement
    }
    return 'scrollParent'
  }

  private getReferenceElement () {
    if (typeof this.props.reference === 'function') {
      return this.props.reference()
    }
    return this.props.reference
  }

  private getPopupElement () {
    if (!this.popupRef.current) {
      return null
    }
    const el = findDOMNode(this.popupRef.current)
    if (el instanceof Element) {
      return el
    }
    throw new Error('Popper content should be a element node')
  }

  private updatePopperInstance = () => {
    this.destroyPopperInstance()

    const options = this.getPopperOptions()
    const referenceElement = this.getReferenceElement()
    const popperElement = this.getPopupElement()

    if (!referenceElement || !popperElement) {
      return
    }

    this.popperInstance = new PopperJS(referenceElement, popperElement, options)
  }

  private destroyPopperInstance = () => {
    if (this.popperInstance) {
      this.popperInstance.destroy()
      this.popperInstance = null
    }
  }

  private onEntered = (node?: HTMLElement, isAppearing?: boolean) => {
    if (this.props.onOpen) {
      this.props.onOpen(node, isAppearing)
    }
  }

  private onExited = (node?: HTMLElement) => {
    if (this.props.onHide) {
      this.props.onHide(node)
    }
    this.destroyPopperInstance()
  }
}
