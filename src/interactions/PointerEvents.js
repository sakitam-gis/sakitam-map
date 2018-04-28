import Base from './Base';
import { on, off } from '../utils';

class PointerEvents extends Base {
  constructor (options = {}) {
    super(options);
    this._active = options.hasOwnProperty('active') ? options['active'] : true;

    /**
     * type
     * @type {string}
     * @private
     */
    this._type = 'PointerEvents';
  }

  mounted () {
    const viewport = this.getMap().getViewport();
    on(viewport, 'pointermove', this.handleEvent, this);
  }

  destroyed () {
    const viewport = this.getMap().getViewport();
    off(viewport, 'pointermove', this.handleEvent, this);
  }

  handleEvent (event) {
    if (!this.getActive()) return;
    let stopEvent = false;
    console.log(event)
    return !stopEvent;
  }
}

export default PointerEvents
