import Engine from "../engine";
import GameScript from "../script";

export class UserInterfaceData {
    constructor(
        public x: string = '50%',
        public y: string = '50%',
        public font: string = '24px Arial',
        public color: string = 'white',
        public text: string = '',
    ) { }

    _DOMElement?: HTMLParagraphElement;
}

export default class UserInteraceSystem extends GameScript {
    div = document.createElement('div');

    createUIElement(_: number, data: UserInterfaceData) {
        const div = document.createElement('div');
        const text = document.createElement('p');
        div.style.position = 'fixed';
        div.style.left = data.x;
        div.style.top = data.y;
        div.style.transform = 'translate(-50%, -50%)';
        text.style.font = data.font;
        text.style.color = data.color;
        text.style.textAlign = 'center';
        text.innerText = data.text;
        data._DOMElement = text;
        div.appendChild(data._DOMElement);
        document.body.appendChild(div);
    }

    // @todo @hack - WTF I need to figure out events....
    // AND load ordering.  I'm doing this in the constructor
    // because the script loads after the player script, and
    // the callback *must* be registered before the player script runs.
    constructor(engine: Engine) {
        super(engine);
        this.ecs.events.on(`set${UserInterfaceData.name}Component`, this.createUIElement.bind(this));
    }

    update() {
        this.ecs.executeQuery([UserInterfaceData], ([uiData]) => {
            uiData._DOMElement!.innerText = uiData.text;
        });
    }
}