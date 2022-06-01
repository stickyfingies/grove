import {
    CanvasTexture,
    Sprite, SpriteMaterial,
} from 'three';

import Entity from '../ecs/entity';
import GameScript from '../script';
import { ScoreData } from './score';
import { SpriteData } from '3-AD';

const SLIMES_TO_KILL = 20;

export default class QuestScript extends GameScript {
    init() {
        const gui = new Entity();

        const guiSprite = new Sprite();
        guiSprite.material = new SpriteMaterial();
        guiSprite.position.set(-window.innerWidth / 2, -window.innerHeight / 2, -1);
        guiSprite.scale.set(256, 256, 1);
        this.graphics.addObjectToScene(guiSprite, true);
        gui.setComponent(SpriteData, guiSprite);

        // scratch canvas context
        const RESOLUTION = 256;
        const canvas = document.createElement('canvas');
        canvas.width = RESOLUTION;
        canvas.height = RESOLUTION;
        const ctx = canvas.getContext('2d')!;

        const updateGui = (text: string) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.font = '24px Arial';
            ctx.fillStyle = 'white';
            ctx.textAlign = 'left';
            ctx.fillText(text, 2, canvas.height - 24 * 2);
            guiSprite.material.map = new CanvasTexture(canvas);
            this.graphics.updateMaterial(guiSprite, true);
        };

        updateGui(`Quest: kill ${SLIMES_TO_KILL} slimes`);

        this.ecs.events.on('updateScore', (score: ScoreData) => {
            if (score.score >= SLIMES_TO_KILL) {
                updateGui('QUEST COMPLETE');
            } else {
                updateGui(`Quest: kill ${score.score}/${SLIMES_TO_KILL} slimes`);
            }
        });
    }
}

// (canvas -> texture) -> frontend -> backend texture
// (canvas) -> frontend -> backend texture
