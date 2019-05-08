import * as React from 'react'

interface Props {
  zIndex?: number
  className?: string
}

const defaultStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
}

const Mask: React.StatelessComponent<Props> = (props) => {
  const { className, zIndex } = props
  let style: React.CSSProperties = { zIndex }

  if (!className) {
    style = { ...style, ...defaultStyle }
  }

  return <div key={ 'mask' } className={ className } style={ style } />
}

export default Mask
