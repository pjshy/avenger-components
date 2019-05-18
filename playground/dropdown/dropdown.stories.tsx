import * as React from 'react'
import { storiesOf } from '@storybook/react'
import { withInfo } from '@storybook/addon-info'

import { Dropdown } from 'components/dropdown'
import doc from './doc.md'

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

storiesOf('Button', module)
  .addDecorator(withInfo)
  .add(
    'with text',
    () => {
      return <DropdownComponent />
    },
    {
      notes: { markdown: doc }
    }
  )