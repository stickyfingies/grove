import{w as p}from"./game.d0ad9aae.js";class t{constructor(a=1,o=2){this.hp=a,this.max=o}}class i{}p.addRule({name:"Dead things die",types:[t],fn([s],a){s.hp=Math.min(s.hp,s.max),s.hp<=0&&p.swapComponent(a,[t],[i],[{}])}});export{i as Death,t as Health};
