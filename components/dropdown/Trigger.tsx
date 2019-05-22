import * as React from 'react'
import { findDOMNode } from 'react-dom'
import { Placement } from 'popper.js'

import { Portal } from 'components/abstract'

import Popup from './Popup'
import Mask from './Mask'
import { contains, addEventListener } from './utils'

export interface TriggerProps {
  action: Array<'click' | 'hover' | 'focus'>
  hideAction: Array<'click' | 'mouseLeave' | 'blur'>
  showAction: Array<'click' | 'mouseEnter' | 'focus'>
  mouseEnterDelay: number
  mouseLeaveDelay: number
  focusDelay: number
  blurDelay: number

  content: JSX.Element | React.ReactNode | null
  placement: Placement
  offset?: number | string

  defaultPopupVisible?: boolean
  popupVisible?: boolean

  onPopupVisibleChange?: (visible: boolean) => void
  getPopupContainer?: (trigger: HTMLElement) => HTMLElement

  onClick?: React.MouseEventHandler<HTMLElement>
  onMouseDown?: React.MouseEventHandler<HTMLElement>
  onMouseEnter?: React.MouseEventHandler<HTMLElement>
  onMouseLeave?: React.MouseEventHandler<HTMLElement>
  onFocus?: React.FocusEventHandler<HTMLElement>
  onBlur?: React.FocusEventHandler<HTMLElement>

  // for popup
  className?: string
  style?: React.CSSProperties
  destroyPopupOnHide?: boolean
  popupTransitionName?: string
  popupHiddenClassName?: string

  // hook
  onPopupOpen?: (node?: HTMLElement, isAppearing?: boolean) => void
  onPopupHide?: (node?: HTMLElement) => void

  // for mask
  mask?: boolean
  maskClassName?: string

  zIndex?: number
}

export type Action = 'click' | 'hover' | 'focus'

type EventHandler = 'onClick' | 'onMouseDown' | 'onMouseEnter' | 'onMouseLeave' | 'onFocus' | 'onBlur'

interface TriggerState {
  popupVisible: boolean
}

interface TriggerContextProps {
  onPopupMouseDown: ((e: React.MouseEvent<HTMLElement>) => void) | null
}

const TriggerContext = React.createContext<TriggerContextProps>({ onPopupMouseDown: null })

function noop () {
  // noop
}

/**
 * @todo Refactor Trigger Component
 * @body This component is so big and complex. we need a good way to compose with single component
 */
export default class Trigger extends React.PureComponent<TriggerProps, TriggerState> {
  static defaultProps: Partial<TriggerProps> = {
    action: ['hover'],
    hideAction: [],
    showAction: [],
    mouseEnterDelay: 0,
    mouseLeaveDelay: 0.1,
    focusDelay: 0,
    blurDelay: 0.15,
    placement: 'bottom',
  }

  static contextType = TriggerContext

  private delayTimer: number | null = null

  private hasPopupMouseDown = false

  private mousedownTimer: number | null = null

  private clickOutsideHandler: (() => void) | null = null

  private popupRef = React.createRef<Popup>()

  private get popupVisible () {
    if (this.isDumb()) {
      return !!this.props.popupVisible
    }
    return this.state.popupVisible
  }

  private get isClickToShow () {
    const { action, showAction } = this.props
    return action.indexOf('click') !== -1 || showAction.indexOf('click') !== -1
  }

  private get isClickToHidden () {
    const { action, hideAction } = this.props
    return action.indexOf('click') !== -1 || hideAction.indexOf('click') !== -1
  }

  private get isHoverToShow () {
    const { action, showAction } = this.props
    return action.indexOf('hover') !== -1 || showAction.indexOf('mouseEnter') !== -1
  }

  private get isHoverToHidden () {
    const { action, hideAction } = this.props
    return action.indexOf('hover') !== -1 || hideAction.indexOf('mouseLeave') !== -1
  }

  private get isFocusToShow () {
    const { action, showAction } = this.props
    return action.indexOf('focus') !== -1 || showAction.indexOf('focus') !== -1
  }

  private get isFocusToHidden () {
    const { action, hideAction } = this.props
    return action.indexOf('focus') !== -1 || hideAction.indexOf('blur') !== -1
  }

  constructor (props: TriggerProps) {
    super(props)

    const visible = this.isDumb() ? !!this.props.popupVisible : !!this.props.defaultPopupVisible
    this.state = { popupVisible: visible }
  }

  componentDidMount () {
    if (this.popupVisible) {
      this.AddOutsideEventListener()
    } else {
      this.clearOutsideHanlder()
    }
  }

  componentDidUpdate () {
    if (this.popupVisible) {
      this.AddOutsideEventListener()
    } else {
      this.clearOutsideHanlder()
    }
  }

  componentWillUnmount () {
    this.clearDelayTimer()
    this.clearMouseDownTimer()
    this.clearOutsideHanlder()
  }

  render () {
    const trigger = this.getTrigger()
    const portal = this.getPortal()

    return (
      <TriggerContext.Provider value={{ onPopupMouseDown: this.onPopupMouseDown }}>
        { [trigger, portal] }
      </TriggerContext.Provider>
    )
  }

  forceUpdatePosition = () => {
    if (this.popupRef.current) {
      this.popupRef.current.updatePosition()
    }
  }

  private getTiggerEle = () => {
    return findDOMNode(this) as Element
  }

  private getTrigger () {
    const { children } = this.props
    const trigger = React.Children.only(children)

    if (!React.isValidElement(trigger)) {
      throw new Error('The <Dropdown />\'s children must be a react element')
    }

    const props: React.HTMLAttributes<HTMLElement> = {}

    if (this.isClickToShow || this.isClickToHidden) {
      props.onClick = this.onClick
      props.onMouseDown = this.onMouseDown
    } else {
      props.onClick = this.createTwoChain('onClick')
      props.onMouseDown = this.createTwoChain('onMouseDown')
    }

    if (this.isHoverToShow) {
      props.onMouseEnter = this.onMouseEnter
    } else {
      props.onMouseEnter = this.createTwoChain('onMouseEnter')
    }

    if (this.isHoverToHidden) {
      props.onMouseLeave = this.onMouseLeave
    } else {
      props.onMouseLeave = this.createTwoChain('onMouseLeave')
    }

    if (this.isFocusToShow) {
      props.onFocus = this.onFocus
    } else {
      props.onFocus = this.createTwoChain('onFocus')
    }

    if (this.isFocusToHidden) {
      props.onBlur = this.onBlur
    } else {
      props.onBlur = this.createTwoChain('onBlur')
    }

    return React.cloneElement(trigger, { ...props, key: 'trigger' })
  }

  private getPortal () {
    // 为了实现动画，必须保证 dom 的连续性
    // 所以一旦存在动画并且 popup 已经 mount 过，则保证 domTree 不被卸载
    if (this.popupVisible || this.popupRef.current) {
      return (
        <Portal
          key={ 'portal' }
          getContainer={ this.getContainer }
        >
          { this.getMask() }
          { this.getPopup() }
        </Portal>
      )
    }
    return null
  }

  private getMask () {
    const { maskClassName, zIndex } = this.props
    if (this.popupVisible && this.props.mask) {
      return (
        <Mask
          className={ maskClassName }
          zIndex={ zIndex }
        />
      )
    }
    return null
  }

  private getContainer = () => {
    const container = this.props.getPopupContainer ?
      this.props.getPopupContainer(findDOMNode(this) as HTMLElement) : window.document.body
    return container
  }

  private getPopup = () => {
    const { props } = this
    return (
      <Popup
        key={ 'popup' }
        ref={ this.popupRef }
        visible={ this.popupVisible }
        destroyOnHide={ this.props.destroyPopupOnHide }
        placement={ props.placement }
        offset={ this.props.offset }
        reference={ this.getTiggerEle }
        className={ props.className }
        transitionName={ props.popupTransitionName }
        hiddenClassName={ props.popupHiddenClassName }
        style={ props.style }
        zIndex={ props.zIndex }
        onMouseDown={ this.onPopupMouseDown }
        onMouseEnter={ this.isHoverToShow ? this.onMouseEnter : noop }
        onMouseLeave={ this.isHoverToHidden ? this.onMouseLeave : noop }
        onOpen={ this.props.onPopupOpen }
        onHide={ this.props.onPopupHide }
      >
        { props.content || <span /> }
      </Popup>
    )
  }

  private isDumb = () => {
    return this.props.hasOwnProperty('popupVisible')
  }

  private onDocumentClick = (e: MouseEvent) => {
    const root = this.getTiggerEle()
    const target = e.target as HTMLElement
    if (!contains(root, target) && !this.hasPopupMouseDown) {
      this.close()
    }
  }

  private onClick = (e: React.MouseEvent<HTMLElement>) => {
    const nextVisible = !this.popupVisible

    this.fireEvent('onClick', e )
    this.setPopupVisible(nextVisible)
  }

  private onMouseDown = (e: React.MouseEvent<HTMLElement>) => {
    this.fireEvent('onMouseDown', e)
  }

  private onMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    const { mouseEnterDelay } = this.props

    this.fireEvent('onMouseEnter', e)
    this.delaySetPopupVisible(true, mouseEnterDelay)
  }

  private onMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()

    const { mouseLeaveDelay } = this.props

    this.fireEvent('onMouseLeave', e)
    this.delaySetPopupVisible(false, mouseLeaveDelay)
  }

  private onFocus = (e: React.FocusEvent<HTMLElement>) => {
    const { focusDelay } = this.props
    this.fireEvent('onFocus', e)
    this.delaySetPopupVisible(true, focusDelay)
  }

  private onBlur = (e: React.FocusEvent<HTMLElement>) => {
    const { blurDelay } = this.props
    this.fireEvent('onBlur', e)
    this.clearDelayTimer()
    this.delaySetPopupVisible(false, blurDelay)
  }

  private onPopupMouseDown = (e: React.MouseEvent<HTMLElement>) => {
    const context = this.context as TriggerContextProps

    this.hasPopupMouseDown = true
    this.clearMouseDownTimer()
    this.mousedownTimer = window.setTimeout(() => this.hasPopupMouseDown = false, 0)

    if (context.onPopupMouseDown) {
      context.onPopupMouseDown(e)
    }
  }

  private fireEvent = (
    handler: EventHandler,
    event: React.MouseEvent<HTMLElement> | React.FocusEvent<HTMLElement>,
  ) => {
    const children = this.props.children as React.ReactElement
    if (children) {
      const fn = React.Children.only(children).props[handler]
      fn && fn(event)
    }
    if (this.props[handler]) {
      const fn = this.props[handler] as any
      fn(event)
    }
  }

  private createTwoChain = (handler: EventHandler) => {
    const props = this.props
    const children = this.props.children as any
    const childProps = children.props || {}
    if (childProps[handler] && props[handler]) {
      return this.fireEvent
    }
    return childProps[handler] || props[handler]
  }

  private setPopupVisible (visible: boolean) {
    if (this.isDumb()) {
      if (typeof this.props.onPopupVisibleChange === 'function' && visible !== this.popupVisible) {
        this.props.onPopupVisibleChange(visible)
      }
      return
    } else {
      this.setState({ popupVisible: visible })
    }
  }

  private delaySetPopupVisible (visible: boolean, delayTime: number) {
    const delayMS = delayTime * 1000

    this.clearDelayTimer()

    if (delayMS) {
      this.delayTimer = window.setTimeout(() => this.setPopupVisible(visible), delayMS)
    } else {
      this.setPopupVisible(visible)
    }
  }

  private AddOutsideEventListener () {
    if (!this.clickOutsideHandler && this.isClickToHidden) {
      this.clickOutsideHandler = addEventListener('mousedown', this.onDocumentClick)
    }
  }

  private clearDelayTimer () {
    if (this.delayTimer) {
      clearTimeout(this.delayTimer)
      this.delayTimer = null
    }
  }

  private clearMouseDownTimer () {
    if (this.mousedownTimer) {
      clearTimeout(this.mousedownTimer)
      this.mousedownTimer = null
    }
  }

  private clearOutsideHanlder () {
    if (this.clickOutsideHandler) {
      this.clickOutsideHandler()
      this.clickOutsideHandler = null
    }
  }

  private close () {
    this.setPopupVisible(false)
  }
}
