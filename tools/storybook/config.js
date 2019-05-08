import { configure } from '@storybook/react'

function loadStories () {
  require('../../playground/index')
}

configure(loadStories, module)