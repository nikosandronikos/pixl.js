import {DEG_TO_RAD} from '../../2dGameUtils/src/geometry';
import {mixin, ObservableMixin} from '../../2dGameUtils/src/pattern';

import {SceneryParallaxLayer, ParallaxLayer} from './layer';
import {RenderObject} from './renderObject';
import {ViewPort} from './viewport';

export const Renderer = {
	init: function(width, height) {
		console.log(`Initialising render window ${width}x${height}`);
		this.width = width;
		this.height = height;

		this.pixi = PIXI.autoDetectRenderer(width, height, {antialias: false, resolution: 1});
		PIXI.settings.SCALE_MODE = PIXI.scaleModes.NEAREST;
		document.querySelector('body').appendChild(Renderer.pixi.view);
		this.pixi.view.id = 'renderer';
		this.stage = new PIXI.Container();

		this.bounds = {x: width * 4, y: height * 4};

		this.viewPort = new ViewPort(this.width, this.height, this.bounds, 0, 0, width, height);
		this.viewPort.addObserver('viewPortUpdate', () =>  this.viewPortChanged = true, this);
		this.viewPortChanged = true;
		
		this.viewPortMoveX = 1;
		this.viewPortMoveY = 1;

		this.layers = [];

		this.runningAnimations = [];

		this.frameNo = 0;

		this.debugMarkers = {};
		this.debugLayer = Renderer.createLayer(100);
	},

	_completeLoadAssets(json, completeFn) {
		this.debugMarkers['Center'] = RenderObject.createFromConfig('MarkerCenter', this.debugLayer);
		this.debugMarkers['UL'] = RenderObject.createFromConfig('MarkerUL', this.debugLayer);
		this.debugMarkers['UR'] = RenderObject.createFromConfig('MarkerUR', this.debugLayer);
		this.debugMarkers['LL'] = RenderObject.createFromConfig('MarkerLL', this.debugLayer);
		this.debugMarkers['LR'] = RenderObject.createFromConfig('MarkerLR', this.debugLayer);

		if (completeFn !== undefined)
			completeFn();
	},

	loadAssets: function(assets, completeFn) {
		this.assets = assets;
		PIXI.loader.add(assets.atlas).load(this._completeLoadAssets.bind(this, assets, completeFn));
	},

	_createParallaxTypeLayer(parallax, type) {
		if (parallax < 0 || parallax > 200) throw new RangeError('parallax out of range');

		const layer = new type(parallax);
		this.stage.addChild(layer);
		this.stage.children.sort((a, b) => b.parallax < a.parallax);
		return layer;

	},

	// Parallax is a percentage value representing how
	// fast the layer moves relative to the baseline layer
	// (100%). Values up to 200% are supported.
	createSceneryLayer(parallax) {
		return this._createParallaxTypeLayer(parallax, SceneryParallaxLayer);
	},

	createLayer(parallax) {
		return this._createParallaxTypeLayer(parallax, ParallaxLayer);
	},

	renderFrame: function() {
		this.frameNo ++;
		//this.viewPort.moveBy(this.viewPortMoveX, this.viewPortMoveY);

		if (this.viewPortChanged) {
			//console.log('viewPort changed');
			for (let layer of this.stage.children) {
				layer.scale.set(this.viewPort.zoom, this.viewPort.zoom);
				layer.position.set(~~-(this.viewPort.x * layer.parallaxMod * this.viewPort.zoom), ~~-(this.viewPort.y * layer.parallaxMod * this.viewPort.zoom));
			}
			this.viewPortChanged = false;
		}

		this.debugMarkers['Center'].moveTo(this.viewPort.midPoint().x, this.viewPort.midPoint().y);
		this.debugMarkers['UL'].moveTo(this.viewPort.x1, this.viewPort.y1);
		this.debugMarkers['UR'].moveTo(this.viewPort.x2, this.viewPort.y1);
		this.debugMarkers['LL'].moveTo(this.viewPort.x1, this.viewPort.y2);
		this.debugMarkers['LR'].moveTo(this.viewPort.x2, this.viewPort.y2);

		for (let animName in this.runningAnimations) {
			this.runningAnimations[animName].update(performance.now());
		}

		this.pixi.render(this.stage);
	}
}
