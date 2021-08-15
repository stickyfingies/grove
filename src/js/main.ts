import 'bootstrap/dist/css/bootstrap';
import '../css/play';
import Engine from './engine';

/**
 * Note to future Seth:  I'm really pissed that I didn't blog about this coding journey.
 * The Grove has been single-handedly my deepest dive into coding a large project from scratch,
 * it has taught me so much, and I think there was a lot of invaluable wisdom gained from working
 * on this.
 *
 * I recall from memory *so* many thought processes and development decisions that could've been
 * written about, and it's a shame that I didn't do so.  My best wish now is to continue work on
 * The Grove, and document _everything_ on my way.
 *
 * Buddha shine upon these TypeScript files.
 */

/**
 * UPDATE 8/12/2021
 * ================
 * Big fat ole TODO: re-implement https://github.com/hybridalpaca/grove-revamped
 * using the modern Grove engine!!  I'm SO down!
 */

const engine = new Engine();

engine.init();
