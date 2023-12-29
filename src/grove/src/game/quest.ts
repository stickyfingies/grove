import { world } from '@grove/engine';
import { GameSystem } from '@grove/engine';
import { Score } from './score';
import { UserInterface } from './userInterface';

const SLIMES_TO_KILL = 20;

export default class QuestScript extends GameSystem {
    initialize() {
        
        const ui = new UserInterface(
            '50%',
            '95%',
            '24px Arial',
            'white'
        );
        world.spawn([UserInterface], [ui]);

        const updateGui = (content: string) => {
            ui.text = content;
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
