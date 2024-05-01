import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import St from 'gi://St';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

let text,
  button,
  sourceId = null;

function _getNepaliDate() {
  const nepcal = {
    74: {
      mon_days: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
      tot_days: 365,
    },
    75: {
      mon_days: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
      tot_days: 365,
    },
    76: {
      mon_days: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
      tot_days: 365,
    },
    77: {
      mon_days: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
      tot_days: 366,
    },
    78: {
      mon_days: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
      tot_days: 365,
    },
    79: {
      mon_days: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
      tot_days: 365,
    },
    80: {
      mon_days: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
      tot_days: 365,
    },
    81: {
      mon_days: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
      tot_days: 366,
    },
    82: {
      mon_days: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
      tot_days: 365,
    },
    83: {
      mon_days: [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30],
      tot_days: 365,
    },
    84: {
      mon_days: [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30],
      tot_days: 365,
    },
    85: {
      mon_days: [31, 32, 31, 32, 30, 31, 30, 30, 29, 30, 30, 30],
      tot_days: 365,
    },
    86: {
      mon_days: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
      tot_days: 365,
    },
    87: {
      mon_days: [31, 31, 32, 31, 31, 31, 30, 30, 29, 30, 30, 30],
      tot_days: 366,
    },
    88: {
      mon_days: [30, 31, 32, 32, 30, 31, 30, 30, 29, 30, 30, 30],
      tot_days: 365,
    },
    89: {
      mon_days: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
      tot_days: 365,
    },
    90: {
      mon_days: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
      tot_days: 365,
    },
  };

  const months = [
    'Baisakh',
    'Jestha',
    'Ashar',
    'Shrawan',
    'Bhadra',
    'Ashoj',
    'Kartik',
    'Mangsir',
    'Poush',
    'Magh',
    'Falgun',
    'Chaitra',
  ];

  const ref_date_nep = [2074, 1, 1];
  const ref_date_eng = new Date(2017, 3, 14);
  const inp_date_eng = new Date();

  let day_diff = Math.floor((inp_date_eng - ref_date_eng) / (1000 * 3600 * 24));
  let month_diff = 0;
  let year_diff = 0;
  let stop_loop = false;
  let start_year = '74';

  while (!stop_loop) {
    if (day_diff > nepcal[start_year]['tot_days']) {
      year_diff++;
      day_diff -= nepcal[start_year]['tot_days'];
    } else {
      for (let i = 0; i < nepcal[start_year]['mon_days'].length; i++) {
        let days_mon = nepcal[start_year]['mon_days'][i];
        if (day_diff >= days_mon) {
          month_diff++;
          day_diff -= days_mon;
        } else {
          stop_loop = true;
          break;
        }
      }
    }
    if (!stop_loop) {
      start_year++;
    }
  }

  let date_diff = [year_diff, month_diff, day_diff];

  for (let i = 0; i < ref_date_nep.length; i++) {
    date_diff[i] += ref_date_nep[i];
    if (i == 1) {
      if (date_diff[i] >= 13) {
        date_diff[i] -= 12;
        date_diff[i - 1] += 1;
      }
      var month = months[date_diff[i] - 1];
    }
  }

  let nepDate =
    '|          ' + month + ' ' + date_diff[2] + ', ' + date_diff[0];

  text = new St.Label({
    style_class: 'nepcal-label',
    y_expand: true,
    y_align: Clutter.ActorAlign.CENTER,
    text: nepDate + ' B.S.',
  });
  button.set_child(text);
  sourceId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 1, _getNepaliDate);
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

    _getNepaliDate();

    Main.panel._centerBox.insert_child_at_index(button, -1);
  }

  disable() {
    Main.panel._centerBox.remove_child(button);

    if (button) {
      button.destroy();
      button = null;
    }

    if (sourceId) {
      GLib.source_remove(sourceId);
      sourceId = null;
    }

    text = null;
  }
}
