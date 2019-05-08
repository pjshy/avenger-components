import * as React from 'react'

import { Dropdown } from '../components/dropdown'

export const DropdownComponent = () => {
  const content = <h1>hello world</h1>

  return (
    <Dropdown
      action={ ['click', 'hover'] }
      content={ content }
    >
      <button>show content</button>
    </Dropdown>
  )
}