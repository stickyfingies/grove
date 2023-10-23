import { world } from '@grove/engine';
import { GameSystem } from '@grove/engine';
import { Score } from './score';
import { UserInterface } from './userInterface';

const SLIMES_TO_KILL = 20;

export default class QuestScript extends GameSystem {
    initialize() {
        // const gui = new Entity();

        // const guiSprite = new Sprite();
        // guiSprite.material = new SpriteMaterial();
        // guiSprite.position.set(-window.innerWidth / 2, -window.innerHeight / 2, -1);
        // guiSprite.scale.set(256, 256, 1);
        // graphics.addObjectToScene(guiSprite, true);
        // gui.setComponent(SpriteData, guiSprite);

        // scratch canvas context
        // const RESOLUTION = 256;
        // const canvas = document.createElement('canvas');
        // canvas.width = RESOLUTION;
        // canvas.height = RESOLUTION;
        // const ctx = canvas.getContext('2d')!;

        const gui = world.createEntity();
        const hud = new UserInterface(
            '50%',
            '95%',
            '24px Arial',
            'white'
        );
        world.put(gui, [UserInterface], [hud]);

        const updateGui = (content: string) => {
            hud.text = content;
            // ctx.clearRect(0, 0, canvas.width, canvas.height);
            // ctx.font = '24px Arial';
            // ctx.fillStyle = 'white';
            // ctx.textAlign = 'left';
            // ctx.fillText(content, 2, canvas.height - 24 * 2);
            // guiSprite.material.map = new CanvasTexture(canvas);
            // graphics.updateMaterial(guiSprite, true);
        };

        updateGui(`Quest: kill ${SLIMES_TO_KILL} slimes`);

        world.events.on('updateScore', (score: Score) => {
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
