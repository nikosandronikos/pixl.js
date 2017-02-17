import {Rect} from '../../2dGameUtils';
import {mixin, ObservableMixin} from '../../2dGameUtils';

export class ViewPort extends Rect {
	constructor(screenWidth, screenHeight, bounds, x1, y1, x2, y2) {
		super(x1, y1, x2, y2);
		this.screenWidth = screenWidth;
		this.screenHeight = screenHeight;
		this.bounds = bounds;
		this.zoom = 1;
		this.maxZoom = 8;
	}

	_clamp() {
		if (this.x1 < 0) {
			const width = this.width;
			this.x1 = 0;
			this.x2 = width;
		} else if (this.x2 >= this.bounds.x) {
			const width = this.width;
			this.x2 = this.bounds.x;
			this.x1 = this.x2 - width;
		}

		if (this.y1 < 0) {
			const height = this.height;
			this.y1 = 0;
			this.y2 = height;
		} else if (this.y2 >= this.bounds.y) {
			const height = this.height;
			this.y2 = this.bounds.y;
			this.y1 = this.y2 - height;
		}
	}

	move(x, y) {
		if (x >= 0 && x < this.bounds.x);
		this.x1 = x;
		this.y1 = y;
		this.x2 = x + this.width;
		this.y2 = y + this.height;
		this._clamp();
		this.notifyObservers('viewPortUpdate');
	}

	moveBy(x, y) {
		this.x1 += x;
		this.y1 += y;
		this.x2 += x;
		this.y2 += y;
		this._clamp();
		this.notifyObservers('viewPortUpdate');
	}

	lookAtPoint(point) {
		const width = this.width;
		const height = this.height;
		this.x1 = point - (width / 2);
		this.y1 = point - (height / 2);
		this.x2 = this.x1 + width;
		this.y2 = this.y1 + height;
		this._clamp();
		this.notifyObservers('viewPortUpdate');
	}

	lookAtRect(rect) {
		let 	xFit = this.screenWidth / rect.width,
				yFit = this.screenHeight / rect.height;
		const 	mid = rect.midPoint();

		const zoom = Math.min(Math.min(xFit, yFit), this.maxZoom);

		if (zoom >= 1) this.zoom = ~~zoom;
		else {
			xFit = this.screenWidth / this.bounds.x;
			yFit = this.screenHeight / this.bounds.y;
			this.zoom = Math.min(xFit, yFit);
		}

		const 	width = this.screenWidth / this.zoom,
				height = this.screenHeight / this.zoom;

		this.x1 = mid.x - (width / 2);
		this.y1 = mid.y - (height / 2);
		this.x2 = this.x1 + width;
		this.y2 = this.y1 + height;
		this._clamp();
		this.notifyObservers('viewPortUpdate');
	}
}
mixin(ViewPort, ObservableMixin);
