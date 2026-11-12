import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import St from 'gi://St';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

import { MONTHS, MONTH_DAYS, FIRST_YEAR, LAST_YEAR, adToBs, bsToAd } from './nepcal.js';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const AD_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const NepaliDateButton = GObject.registerClass(
class NepaliDateButton extends PanelMenu.Button {
  _init() {
    super._init(0.5, 'Nepali Date');

    this._label = new St.Label({
      style_class: 'nepcal-label',
      y_align: Clutter.ActorAlign.CENTER,
    });
    this.add_child(this._label);

    const item = new PopupMenu.PopupBaseMenuItem({ reactive: false, can_focus: false });
    const box = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'nepcal-calendar', x_expand: true });
    item.add_child(box);
    this.menu.addMenuItem(item);

    const header = new St.BoxLayout({ style_class: 'nepcal-header' });
    this._prevButton = this._navButton('pan-start-symbolic', -1);
    this._nextButton = this._navButton('pan-end-symbolic', 1);
    this._titleLabel = new St.Label({
      style_class: 'nepcal-title',
      x_expand: true,
      x_align: Clutter.ActorAlign.CENTER,
      y_align: Clutter.ActorAlign.CENTER,
    });
    this._subtitleLabel = new St.Label({
      style_class: 'nepcal-subtitle',
      x_align: Clutter.ActorAlign.CENTER,
    });
    const titles = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, x_expand: true });
    titles.add_child(this._titleLabel);
    titles.add_child(this._subtitleLabel);
    header.add_child(this._prevButton);
    header.add_child(titles);
    header.add_child(this._nextButton);
    box.add_child(header);

    this._gridLayout = new Clutter.GridLayout({ column_homogeneous: true });
    this._grid = new St.Widget({ layout_manager: this._gridLayout, style_class: 'nepcal-grid' });
    box.add_child(this._grid);

    this._todayButton = new St.Button({
      style_class: 'button nepcal-today-button',
      x_align: Clutter.ActorAlign.CENTER,
    });
    this._todayButton.connect('clicked', () => this._showToday());
    box.add_child(this._todayButton);

    this.menu.connect('open-state-changed', (_menu, open) => {
      if (open)
        this._showToday();
    });

    this.update();
  }

  _navButton(iconName, delta) {
    const button = new St.Button({
      style_class: 'button nepcal-nav',
      child: new St.Icon({ icon_name: iconName, icon_size: 16 }),
      can_focus: true,
    });
    button.connect('clicked', () => this._shiftMonth(delta));
    return button;
  }

  update() {
    this._today = adToBs(new Date());
    if (!this._today) {
      this._label.set_text('| Nepali date unavailable');
      return;
    }
    const { year, month, day } = this._today;
    this._label.set_text(`| ${MONTHS[month]} ${day}, ${year} B.S.`);
    this._todayButton.label = `Today: ${MONTHS[month]} ${day}, ${year}`;
  }

  _showToday() {
    this.update();
    if (!this._today)
      return;
    this._viewYear = this._today.year;
    this._viewMonth = this._today.month;
    this._renderMonth();
  }

  _shiftMonth(delta) {
    let m = this._viewMonth + delta;
    let y = this._viewYear;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    if (y < FIRST_YEAR || y > LAST_YEAR)
      return;
    this._viewYear = y;
    this._viewMonth = m;
    this._renderMonth();
  }

  _renderMonth() {
    const y = this._viewYear;
    const m = this._viewMonth;
    const daysInMonth = MONTH_DAYS[y][m];
    const firstAd = bsToAd(y, m, 1);
    const lastAd = bsToAd(y, m, daysInMonth);

    this._titleLabel.set_text(`${MONTHS[m]} ${y}`);
    const adSpan = firstAd.getMonth() === lastAd.getMonth()
      ? `${AD_MONTHS[firstAd.getMonth()]} ${firstAd.getFullYear()}`
      : firstAd.getFullYear() === lastAd.getFullYear()
        ? `${AD_MONTHS[firstAd.getMonth()]} – ${AD_MONTHS[lastAd.getMonth()]} ${lastAd.getFullYear()}`
        : `${AD_MONTHS[firstAd.getMonth()]} ${firstAd.getFullYear()} – ${AD_MONTHS[lastAd.getMonth()]} ${lastAd.getFullYear()}`;
    this._subtitleLabel.set_text(adSpan);

    this._prevButton.reactive = !(y === FIRST_YEAR && m === 0);
    this._nextButton.reactive = !(y === LAST_YEAR && m === 11);

    this._grid.destroy_all_children();

    WEEKDAYS.forEach((name, col) => {
      const cls = col === 6 ? 'nepcal-weekday nepcal-saturday' : 'nepcal-weekday';
      this._gridLayout.attach(new St.Label({ text: name, style_class: cls, x_align: Clutter.ActorAlign.CENTER }), col, 0, 1, 1);
    });

    const startCol = firstAd.getDay();
    for (let d = 1; d <= daysInMonth; d++) {
      const slot = startCol + d - 1;
      const col = slot % 7;
      const row = Math.floor(slot / 7) + 1;
      const ad = bsToAd(y, m, d);

      let cls = 'nepcal-day';
      if (col === 6)
        cls += ' nepcal-saturday';
      if (this._today && y === this._today.year && m === this._today.month && d === this._today.day)
        cls += ' nepcal-today';

      const cell = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: cls });
      cell.add_child(new St.Label({ text: `${d}`, style_class: 'nepcal-day-bs', x_align: Clutter.ActorAlign.CENTER }));
      cell.add_child(new St.Label({ text: `${ad.getDate()}`, style_class: 'nepcal-day-ad', x_align: Clutter.ActorAlign.CENTER }));
      this._gridLayout.attach(cell, col, row, 1, 1);
    }
  }
});

export default class NepaliDateExtension extends Extension {
  enable() {
    this._button = new NepaliDateButton();
    Main.panel.addToStatusArea(this.uuid, this._button, -1, 'center');

    this._sourceId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 30, () => {
      this._button.update();
      return GLib.SOURCE_CONTINUE;
    });
  }

  disable() {
    if (this._sourceId) {
      GLib.source_remove(this._sourceId);
      this._sourceId = null;
    }
    this._button?.destroy();
    this._button = null;
  }
}
