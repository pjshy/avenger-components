import * as React from 'react'
import { createPortal } from 'react-dom'
import { Transition } from 'react-transition-group'
import { TransitionStatus } from 'react-transition-group/Transition'

export type SlidePlacement = 'left' | 'right' | 'bottom' | 'top'

export interface SlidePaneProps {
  content: React.ReactNode
  visible: boolean
  placement?: SlidePlacement
  maskClassName?: string
  zIndex?: number
  paneClassName?: string
  onClose?: () => void
}

export const SlidePane: React.SFC<SlidePaneProps> = React.memo((props) => {
  const { maskClassName, zIndex, content, placement, visible, paneClassName } = props

  const container = React.useMemo(getContainer, [])

  const contentRef = React.useRef<HTMLDivElement>(null)

  React.useLayoutEffect(() => {
    document.body.appendChild(container)
    return () => {
      if (container && container.parentElement) {
        container.parentElement.removeChild(container)
      }
    }
  }, [])

  return createPortal(
    <Transition in={visible} timeout={300} unmountOnExit={true}>
      {renderContent}
    </Transition>,
    container,
  )

  function renderContent (status: TransitionStatus) {
    return (
      <div style={{ zIndex }}>
        {getMask(status)}
        {getContent(status)}
      </div>
    )
  }

  function getContainer () {
    const div = document.createElement('div')

    return div
  }

  function getMask (status: TransitionStatus) {
    return <div onClick={props.onClose} />
  }

  function getContent (status: TransitionStatus) {
    const contentElement = contentRef.current
    let distance = 0

    if (contentElement) {
      if (placement === 'right' || placement === 'left') {
        distance = contentElement.offsetWidth
      } else {
        distance = contentElement.offsetHeight
      }
    }

    return (
      <div ref={contentRef}>
        {content}
      </div>
    )
  }
})

SlidePane.defaultProps = {
  placement: 'left',
  visible: false,
}
