import * as React from 'react'
import { createPortal } from 'react-dom'

interface Props {
  getContainer: () => HTMLElement
}

export default class Portal extends React.PureComponent<Props> {
  private container: HTMLElement | null = null

  componentDidMount () {
    this.createContainer()
  }

  render () {
    if (this.container && this.props.children) {
      return createPortal(this.props.children, this.container)
    }
    return null
  }

  private createContainer () {
    if (!this.container) {
      this.container = this.props.getContainer()
      this.forceUpdate()
    }
  }
}
