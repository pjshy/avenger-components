import * as React from 'react'
import { Placement } from 'popper.js'

import Trigger, { Action } from './Trigger'
import { addEventListener } from './utils'
import styleNames from './dropdown.component.styl'

export interface DropdownProps {
  content: JSX.Element | null
  action?: Action | Action[]
  autoDestroy?: boolean
  defaultOpened?: boolean
  opened?: boolean
  nested?: boolean
  offset?: number | string
  persistence?: boolean
  arrow?: boolean
  zIndex?: number
  placement?: Placement
  delay?: number
  className?: string
  style?: React.CSSProperties
  mask?: boolean
  maskClassName?: string
  popupTransitionName?: string
  popupHiddenClassName?: string
  mountIn?: () => HTMLElement
  onOpen?: () => void
  onHide?: () => void
  onVisibleChange?: (status: boolean) => void
}

interface States {
  visible: boolean
}

export default class Dropdown extends React.PureComponent<DropdownProps, States> {
  static defaultProps: Partial<DropdownProps> = {
    action: 'click',
    autoDestroy: true,
    popupTransitionName: 'slide',
    persistence: false,
  }

  private triggerRef = React.createRef<Trigger>()

  private clearEscapeListener: (() => void) | null = null

  private get visible () {
    if (this.isDumb()) {
      return this.props.opened
    }
    return this.state.visible
  }

  constructor (props: DropdownProps) {
    super(props)

    this.state = { visible: this.isDumb() ? !!this.props.opened : !!this.props.defaultOpened }
  }

  componentDidMount () {
    this.clearEscapeListener = addEventListener('keyup', this.escapeHandler)
  }

  componentWillUnmount () {
    typeof this.clearEscapeListener === 'function' && this.clearEscapeListener()
  }

  render () {
    const { action, offset, nested, mountIn, delay, autoDestroy, mask, onHide, onOpen, ...restProps } = this.props
    const content = this.getContent()
    if (!content) {
      return null
    }
    return (
      <Trigger
        { ...restProps }
        ref={ this.triggerRef }
        action={ Array.isArray(action) ? action! : [action!] }
        destroyPopupOnHide={ autoDestroy }
        content={ content }
        offset={ offset }
        mouseEnterDelay={ delay }
        getPopupContainer={ nested ? this.findParent : mountIn }
        mask={ nested ? false : mask }
        popupVisible={ this.visible }
        onPopupVisibleChange={ this.setVisible }
        className={ styleNames.dropdown }
        onPopupOpen={ onOpen }
        onPopupHide={ onHide }
      >
        { this.props.children }
      </Trigger>
    )
  }

  close = () => {
    this.setVisible(false)
  }

  open = () => {
    this.setVisible(true)
  }

  forceUpdatePosition = () => {
    if (this.triggerRef.current) {
      this.triggerRef.current.forceUpdatePosition()
    }
  }

  private escapeHandler = (e: KeyboardEvent) => {
    if (e.which === 27 && this.visible) {
      this.close()
    }
  }

  private getContent = () => {
    const { content, arrow, className } = this.props
    if (!content) {
      return null
    }
    const cls = [styleNames['dropdown-container']]
    if (className) {
      cls.push(className)
    }
    if (arrow) {
      cls.push(styleNames['dropdown-with-arrow'])
    }
    return (
      <div className={ cls.join(' ') } onClick={ this.onContenClick }>
        { content }
        { arrow ? this.getArrow() : null }
      </div>
    )
  }

  private getArrow () {
    // https://popper.js.org/popper-documentation.html#modifiers..arrow.element
    return (
      <span
        className={ styleNames['dropdown-arrow']}
        x-arrow='true'
      />
    )
  }

  private isDumb = () => {
    return this.props.hasOwnProperty('opened')
  }

  private findParent = (target: HTMLElement) => {
    return target.parentElement || window.document.body
  }

  private setVisible = (visible: boolean) => {
    if (this.isDumb()) {
      this.props.onVisibleChange && this.props.onVisibleChange(visible)
    } else {
      this.setState({ visible })
    }
  }

  private onContenClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!this.props.persistence) {
      this.close()
    }
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation()
    }
  }
}
