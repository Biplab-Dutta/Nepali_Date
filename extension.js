import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import St from 'gi://St';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

import { MONTHS, adToBs } from './nepcal.js';

let text = null;
let button = null;
let sourceId = null;

function _getNepaliDate() {
  const bs = adToBs(new Date());
  const nepDate = bs
    ? `| ${MONTHS[bs.month]} ${bs.day}, ${bs.year} B.S.`
    : '| Nepali date unavailable';

  if (text) {
    text.set_text(nepDate);
  }

  return true;
}

export default class NepaliDateExtension extends Extension {
  enable() {
    button = new St.Bin({
      style_class: 'panel-button',
      reactive: true,
      can_focus: true,
      x_expand: true,
      y_expand: false,
      track_hover: false,
    });

    text = new St.Label({
      style_class: 'nepcal-label',
      y_expand: true,
      y_align: Clutter.ActorAlign.CENTER,
      text: '',
    });

    button.set_child(text);

    sourceId = GLib.timeout_add_seconds(
      GLib.PRIORITY_DEFAULT,
      1,
      _getNepaliDate
    );

    _getNepaliDate();

    Main.panel._centerBox.insert_child_at_index(button, -1);
  }

  disable() {
    if (sourceId !== null) {
      GLib.source_remove(sourceId);
      sourceId = null;
    }

    if (button !== null) {
      Main.panel._centerBox.remove_child(button);
      button.destroy();
      button = null;
    }

    text?.destroy();
    text = null;
  }
}