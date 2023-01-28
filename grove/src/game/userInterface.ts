import { world } from "@grove/engine";

export type UserInterfaceData = {
    x: string,
    y: string,
    font: string,
    color: string,
    text: string
};

export class UserInterface {
    constructor(
        public x: string = '50%',
        public y: string = '50%',
        public font: string = '24px Arial',
        public color: string = 'white',
        public text: string = '',
    ) { }

    _DOMElement?: HTMLParagraphElement;
}

function createUIElement({ data }: { data: UserInterface }) {
    const div = document.createElement('div');
    const text = document.createElement('p');

    div.style.position = 'fixed';
    div.style.transform = 'translate(-50%, -50%)';
    text.style.textAlign = 'center';

    div.style.left = data.x;
    div.style.top = data.y;
    text.style.font = data.font;
    text.style.color = data.color;
    text.innerText = data.text;

    data._DOMElement = text;
    div.appendChild(data._DOMElement);
    document.body.appendChild(div);
}

world.events.on(`set${UserInterface.name}Component`, createUIElement);

export default class UserInteraceSystem {
    every_frame() {
        world.executeQuery([UserInterface], ([uiData]) => {
            uiData._DOMElement!.innerText = uiData.text;
        });
    }
}