import {DEG_TO_RAD} from '../../2dGameUtils';

import {AnimatedSprite} from './animatedSprite';
import {Renderer} from './renderer';

class MoveableSprite {
    constructor(sprite=null) {
        this.sprite = sprite;
        this.x = 0;
        this.y = 0;
        this.rotateAngle = 0;
    }

    moveTo(x, y) {
        this.x = x;
        this.y = y;
        this.sprite.position.set(~~x, ~~y);
        return this;
    }

    move(vector2d) {
        this.x = this.x + vector2d.x;
        this.y = this.y + vector2d.y;
        this.sprite.position.set(~~this.x, ~~this.y);
        return this;
    }

    rotate(angleDeg) {
        this.rotateAngle = angleDeg;
        this.sprite.rotation = angleDeg * DEG_TO_RAD;
        return this;    
    }
}

export class RenderText extends MoveableSprite {
    constructor(text, style, renderLayer) {
        super(new PIXI.Text(text, style));
        // Put the anchor point on the baseline
        this.sprite.anchor.set(0, 1);
        // Scale the text to make it pixellated
        this.sprite.scale.set(2, 2);
        renderLayer.addChild(this.sprite);
        this.layer = renderLayer;
    }

    remove() {
        this.layer.removeChild(this.sprite);
        this.sprite.destroy(true);
    }

    center(layoutRect) {
        const   textRect = this.sprite.getBounds(true);
        // Control point is on far left, and on baseline, so x and y 
        // calculations are different because of this.
        return this.moveTo(
            (layoutRect.width - textRect.width * this.sprite.scale.x) / 2 + layoutRect.x,
            layoutRect.height / 2 + layoutRect.y
        );
    }
}

// This class wraps the underlying renderer's graphics
// objects.
// It holds some additional
// information that allows us to apply configs to named
// nodes, etc.
export class RenderObject extends MoveableSprite {
    // Create a renderObject from the object literial
    // configuration and add it to renderLayer.
    constructor(configName, renderLayer) {
        super();

        if (!(configName in Renderer.assets.templates)) {
            throw `${configName} not in renderer.assets.`;
        }

        const config = Renderer.assets.templates[configName];

        // Notes the objects that are named for specific access.
        // Other nodes are part of the PIXI tree
        // structure but can't be explicitly accessed
        // except through that tree.
        this.namedNodes = {};
        this.namedAnimNodes = {};

        if (!('base' in config)) {
            throw `'base' not in config.`;
            return null;
        }

        this.sprite = this._createRenderTreeNode(config.base);

        renderLayer.addChild(this.sprite);
        this.layer = renderLayer;

        this.configs = 'configs' in config ? config.configs : [];

        this.animEndHandlers = {};

        if ('initialConfig' in config)
            this.applyConfig(config.initialConfig);
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
                if (key === 'name') continue;
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

    // Remove from render tree, but do not destroy this RenderObject
    remove() {
        throw new Error('Not implemented');
    }
}
