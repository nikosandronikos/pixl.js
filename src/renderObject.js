import {DEG_TO_RAD} from '../../2dGameUtils/src/geometry';

import {AnimatedSprite} from './animatedSprite';
import {Renderer} from './renderer';

// This class wraps the underlying renderer's graphics
// objects.
// It holds some additional
// information that allows us to apply configs to named
// nodes, etc.
export class RenderObject {
	constructor(sprite) {
		throw 'Create via RenderObject.createFromConfig()';
	}

	// Create a renderObject from the object literial
	// configuration and add it to renderLayer.
	static createFromConfig(configName, renderLayer) {

		if (!(configName in Renderer.assets.templates)) {
			throw `${configName} not in renderer.assets.`;
			return null;
		}

		const config = Renderer.assets.templates[configName];
		const ro = Object.create(RenderObject.prototype);

		// Notes the objects that are named for specific access.
		// Other nodes are part of the PIXI tree
		// structure but can't be explicitly accessed
		// except through that tree.
		ro.namedNodes = {};
		ro.namedAnimNodes = {};

		if (!('base' in config)) {
			throw `'base' not in config.`;
			return null;
		}

        ro.sprite = ro._createRenderTreeNode(config.base);
        ro.rotateAngle = 0;
        ro.moveTo(0, 0);

		renderLayer.addChild(ro.sprite);

		ro.configs = 'configs' in config ? config.configs : [];

		ro.animEndHandlers = {};

		return ro;
	}

	_createRenderTreeNode(defn) {
		let node = null;

		switch (defn.type) {
			case 'container':
				// TODO: Implement container render tree node
				//renderChild = new PIXI.Container();
				throw 'ignoring container';
				break;
			case 'sprite':
				node = new PIXI.Sprite(PIXI.loader.resources['atlas.json'].textures[defn.sprite]);
				break;
			case 'animatedSprite':
				const textures = [];
				defn.frames.forEach(tex => textures.push(PIXI.loader.resources['atlas.json'].textures[tex]));
				node = new AnimatedSprite(
					defn.name,
					textures,
					'animationSpeed' in defn ? defn.animationSpeed : 100
				);
				node.addObserver('animationEnd', this.animationEnded, this);
    			// Animations must always be named and are stored separately from other
    			// named nodes.
    			// TODO: Assess if this is necessary. It might be ok to put them all in the same object.
    			this.namedAnimNodes[defn.name] = node;
				break;
		}

		if ('name' in defn) this.namedNodes[defn.name] = node;

		if ('visible' in defn) node.visible = defn.visible;

		if ('pivot' in defn) node.anchor.set(defn.pivot.x, defn.pivot.y);
    	else node.anchor.set(0.5, 0.5);

    	if ('position' in defn) node.position.set(~~defn.position.x, ~~defn.position.y);
    	
    	if ('rotation' in defn) node.rotation = defn.rotation * DEG_TO_RAD;

		if ('children' in defn) {
			for (let child of defn.children) {
				node.addChild(this._createRenderTreeNode(child));
			}
		}

		return node;
	}

	animationEnded(animEndedName) {
		if (animEndedName in this.animEndHandlers) {
			const nextConfig = this.animEndHandlers[animEndedName];
			delete this.animEndHandlers[animEndedName];
			this.applyConfig(nextConfig);
		}
	}

	applyConfig(name) {
		if (!(name in this.configs)) {
			console.log(`Visual config ${name} doesn't exist.`);
			return;
		}
		for (let config of this.configs[name]) {
			const node = this.namedNodes[config.name];
			for (let key in config) {
				if (key == 'animation') {
					const node = this.namedAnimNodes[config.name];
					switch (config.animation.control) {
						case 'start':
							node.repeats = 'repeats' in config.animation ? config.animation.repeats : Infinity;
							node.play(performance.now());
							if ('onEnd' in config.animation) {
								this.animEndHandlers[node.name] = config.animation.onEnd;
							}
							break;
						case 'stop':
							node.stop();
							break;
					}	
				} else {
					node[key] = config[key];
				}
			}
		}
		return this;
    }

    move(vector2d) {
        this.x = this.x + vector2d.x;
        this.y = this.y + vector2d.y;
		this.sprite.position.set(~~this.x, ~~this.y);
		return this;
	}

	moveTo(x, y) {
		this.x = x;
		this.y = y;
		this.sprite.position.set(~~x, ~~y);
		return this;
	}

	rotate(angleDeg) {
		//this.rotateAngle = angleDeg;
		this.sprite.rotation = angleDeg * DEG_TO_RAD;
		return this;	
	}
};
