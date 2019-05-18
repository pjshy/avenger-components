import { configure } from '@storybook/react'
import { setConsoleOptions } from '@storybook/addon-console'

setConsoleOptions({
  panelExclude: []
})

const req = require.context('../../playground', true, /\.stories\.tsx$/)

function loadStories () {
  req.keys().forEach(req)
}

configure(loadStories, module)