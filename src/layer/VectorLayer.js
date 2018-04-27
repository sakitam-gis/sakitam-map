import Base from './Base';
import { createCanvas, isEmpty } from '../utils';
import ajax from '../utils/ajax';

class VectorLayer extends Base {
  constructor (options = {}) {
    super(options);

    /**
     * layer service url
     * @type {*|string}
     */
    this.url = options['url'] || '';

    /**
     * json data
     * @type {*|{}}
     * @private
     */
    this._data = options['data'] || {};
  }

  /**
   * load layer
   * @returns {VectorLayer}
   */
  load () {
    if (!this.getMap()) {
      return this;
    }

    /**
     * map size
     * @type {*|string}
     */
    const size = this.getMap().getSize();
    if (!this.canvas_) {
      this.canvas_ = createCanvas(size[0], size[1]);
    } else {
      this.canvas_.width = size[0];
      this.canvas_.height = size[1];
    }
    if (this.url && isEmpty(this._data)) {
      ajax.getJSON(this.url).then(res => {
        if (res.data && res.data.features) {
          this._data = res.data.features;
          this.render();
        }
      })
    } else {
      this.render();
    }
    return this;
  }

  /**
   * re render
   */
  render (options) {
    const map = this.getMap();
    const size = map.getSize();
    const context = this.getContext() || map.getContext();
    context.save();
    context.globalAlpha = this.getOpacity();
    context.fillStyle = '#08304b';
    context.save();
    const data = this._data;
    for (let key in options) {
      context[key] = options[key];
    }
    if (options.bigData) {
      context.save();
      context.beginPath();
      let item;
      for (let i = 0, len = data.length; i < len; i++) {
        item = data[i];
        this._drawInternal(context, item, options);
      }
      let type = options.bigData;
      if (type === 'Point' || type === 'Polygon' || type === 'MultiPolygon') {
        context.fill();
        if ((item.strokeStyle || options.strokeStyle) && options.lineWidth) {
          context.stroke();
        }
      } else if (type === 'LineString') {
        context.stroke();
      }
      context.restore();
    } else {
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        context.save();
        if (item.fillStyle || item._fillStyle) {
          context.fillStyle = item.fillStyle || item._fillStyle;
        }
        if (item.strokeStyle || item._strokeStyle) {
          context.strokeStyle = item.strokeStyle || item._strokeStyle;
        }
        let type = item.geometry.type;
        context.beginPath();
        this._drawInternal(context, item, options);
        if (type === 'Point' || type === 'Polygon' || type === 'MultiPolygon') {
          context.fill();
          if ((item.strokeStyle || options.strokeStyle) && options.lineWidth) {
            context.stroke();
          }
        } else if (type === 'LineString') {
          if (item.lineWidth || item._lineWidth) {
            context.lineWidth = item.lineWidth || item._lineWidth;
          }
          context.stroke();
        }
        context.restore();
      }
    }
    context.restore();
    if (this.getContext()) {
      map.getContext().drawImage(this.canvas_, 0, 0, size[0], size[1])
    }
  }

  /**
   * draw vector shape
   * @param context
   * @param data
   * @param options
   * @private
   */
  _drawInternal (context, data, options) {
    let type = data.geometry.type;
    let coordinates = data.geometry._coordinates || data.geometry.coordinates;
    let symbol = options.symbol || 'circle';
    switch (type) {
      case 'Point':
        let size = data._size || data.size || options._size || options.size || 5;
        if (symbol === 'circle') {
          if (options.bigData === 'Point') {
            context.moveTo(coordinates[0], coordinates[1]);
          }
          context.arc(coordinates[0], coordinates[1], size, 0, Math.PI * 2);
        } else if (symbol === 'rect') {
          context.rect(coordinates[0] - size / 2, coordinates[1] - size / 2, size, size);
        }
        break;
      case 'LineString':
        for (let j = 0; j < coordinates.length; j++) {
          let x = coordinates[j][0];
          let y = coordinates[j][1];
          if (j === 0) {
            context.moveTo(x, y);
          } else {
            context.lineTo(x, y);
          }
        }
        break;
      case 'Polygon':
        this._drawPolygon(context, coordinates);
        break;
      case 'MultiPolygon':
        for (let i = 0; i < coordinates.length; i++) {
          let polygon = coordinates[i];
          this._drawPolygon(context, polygon);
        }
        context.closePath();
        break;
      default:
        console.log('type' + type + 'is not support now!');
        break;
    }
  }

  /**
   * draw polygon
   * @param context
   * @param coordinates
   * @private
   */
  _drawPolygon (context, coordinates) {
    for (let i = 0; i < coordinates.length; i++) {
      let coordinate = coordinates[i];
      context.moveTo(coordinate[0][0], coordinate[0][1]);
      for (let j = 1; j < coordinate.length; j++) {
        context.lineTo(coordinate[j][0], coordinate[j][1]);
      }
      context.lineTo(coordinate[0][0], coordinate[0][1]);
    }
  }
}

export default VectorLayer
