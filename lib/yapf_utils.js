'use babel'

import {CompositeDisposable} from 'atom'
import {Range} from 'atom'
import {spawnSync} from 'child_process'

export default class YapfUtils {
  constructor () {
    this.subscriptions = null
  }

  activate () {
    this.subscriptions = new CompositeDisposable
    return this.subscriptions.add(atom.commands.add('atom-workspace', {
      'yapf-utils:format-selection': () => this.formatSelection()
    }))
  }

  deactivate () {
    this.subscriptions.dispose()
  }

  formatSelection () {
    editor = atom.workspace.getActiveTextEditor()
    if (!editor) {
      return
    }
    view = atom.views.getView(editor)
    if (!view) {
      return
    }

    ranges = editor.getSelectedBufferRanges()
    editor.createCheckpoint()

    properties = { invalidate: 'never' }
    markers = []
    ranges.forEach(range => {
      marker = editor.markBufferRange(range, properties)
      markers.push(marker)
    })

    this.formatRanges(markers, editor)
    editor.groupChangesSinceCheckpoint()
    view.focus()
  }

  formatRanges (markers, editor) {
    lines = ""
    markers.forEach(marker => {
      lines = lines.concat(`--lines ${ this.markerToLines(marker) } `)
    })

    style = atom.config.get('yapf-utils.formatBaseStyle')
    command = `${ atom.config.get('yapf-utils.formatExecutable') } ` +
        lines +
        (style.length ? `--style="${ style }"` : "")

    output = spawnSync(
        process.env.SHELL, ['-l', '-c', command], {input: editor.getText(), encoding: 'utf8'})

    if (output.stdout) {
      buffer = editor.getBuffer()
      buffer.setTextViaDiff(output.stdout)
    }

    if (output.stderr) {
      atom.notifications.addWarning(output.stderr)
    }
  }

  markerToLines (marker) {
    range = marker.getBufferRange()
    rows = range.getRows()
    if (rows.length == 1) {
      return (rows[0] + 1) + '-' + (rows[0] + 1)
    }
    return (rows[0] + 1) + '-' + (rows[rows.length - 1])
  }
}
