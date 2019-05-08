import * as React from 'react'
import { storiesOf } from '@storybook/react'

import { DropdownComponent } from './dropdown'

storiesOf('Button', module)
  .add('with text', () => (
    <DropdownComponent />
  ))