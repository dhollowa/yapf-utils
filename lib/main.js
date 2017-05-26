'use babel'

let yapfUtils = null

export function activate () {
  const YapfUtils = require('./yapf_utils')
  yapfUtils = new YapfUtils()
  yapfUtils.activate()
}

export function deactivate () {
  if (yapfUtils) {
    yapfUtils.deactivate()
    yapfUtils.destroy()
    yapfUtils = null
  }
}
