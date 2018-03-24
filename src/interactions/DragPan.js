import Base from './Base';

class DragPan extends Base {
  constructor (options = {}) {
    super(options);
    this._active = options.hasOwnProperty('active') ? options['active'] : true;
  }
}

export default DragPan
