import {mixin} from '../../2dGameUtils';

import {Renderer} from './renderer';

// A layer that is always the size of the screen
// Generally intended for UI elements
export class ScreenLayer extends PIXI.Container {
    constructor() {
        super();
        // Has no parallax. Setting this to infinity will
        // cause it to always be sorted to the top of the stack of
        // layers.
        // TODO: Call this z-index and separate from the parallax property.
        this.parallax = Infinity;
    }
};

// Requires PIXI.Container interface on class it is mixed into
const ParallaxLayerMixin = {
    initParallaxLayer: function(parallax, viewPort, bounds) {
        this.parallax = parallax;
        this.parallaxMod = parallax / 100;
        this._parallaxXMod = (viewPort.width + (bounds.x - viewPort.width) * this.parallaxMod) / bounds.x;
        this._parallaxYMod = (viewPort.height + (bounds.y - viewPort.height) * this.parallaxMod) / bounds.y;
    },
    parallaxCoord: function(x, y) {
        return {x: x * this._parallaxXMod, y: y * this._parallaxYMod};
    },
    addSprite: function(x, y, image) {
        const sprite = new PIXI.Sprite(PIXI.loader.resources['atlas.json'].textures[image]);
        const coords = this.parallaxCoord(x, y);
        sprite.position.set(~~coords.x, ~~coords.y);
        this.addChild(sprite);
    }
};

//  A container used for scenery.
//  Is optimised based on the following properties
//  - Supports parallax scrolling
//  - Is larger than the viewPort
//  - Has a pool of objects that do not move, but scroll on and off screen
//  - Assumes objects are added in one go and no more are added (support freezing)
//  - Assumes objects are evenly distributed
export class SceneryParallaxLayer extends PIXI.ParticleContainer {
    constructor(parallax, viewPort) {
        super();
        this.initParallaxLayer(parallax, viewPort, viewPort.renderer.bounds);
    }

    // TODO: 
    //  - As sprites go off screen, Hide them and add them to pool for reuse as
    //    a different object 
    //  - For objects coming on screen - grab a sprite from the pool and use it 
    //    to display the object
    //  - Store objects in quadtree to speed up hiding/showing
};
mixin(SceneryParallaxLayer, ParallaxLayerMixin);

// General purpose layer, used for complex objects such as players.
// It's possible that ParticleContainer may be appropriate here
// depending on what advanced features I end up using.
export class ParallaxLayer extends PIXI.Container {
    constructor(parallax, viewPort) {
        super();
        this.initParallaxLayer(parallax, viewPort, viewPort.renderer.bounds);
    }
};
mixin(ParallaxLayer, ParallaxLayerMixin);
