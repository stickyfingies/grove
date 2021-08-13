import GameScript from '../script';

export default class LoadingScreenScript extends GameScript {
    init() {
        // when all the game assets are loaded, hide the loading spinner and show the play button
        this.assetLoader.events.on('assetLoaded', (_, loaded: number, total: number) => {
            if (loaded === total) {
                document.querySelector('#spinner')?.setAttribute('style', 'display:none');
                document.querySelector('#load-play-btn')?.setAttribute('style', 'display:block');
            }
        });
    }
}
