import{w as s}from"./game.6fe68dfe.js";import{G as l}from"./script.2c8a546a.js";import{UserInterface as r}from"./userInterface.661a8981.js";const i=20;class p extends l{initialize(){const a=s.createEntity(),o=new r("50%","95%","24px Arial","white");s.put(a,[r],[o]);const t=e=>{o.text=e};t(`Quest: kill ${i} slimes`),s.events.on("updateScore",e=>{e.score>=i?t("QUEST COMPLETE"):t(`Quest: kill ${e.score}/${i} slimes`)})}}export{p as default};