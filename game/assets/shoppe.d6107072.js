import{b as a,S as y,v as h,a as f,p as i,w as o,P as g,C as u,r as w,V as S}from"./game.d0ad9aae.js";import{addToInventory as A}from"./inventory.24d76a8d.js";import{p as D}from"./goblin.f8496e98.js";import{Score as I}from"./score.6776b201.js";import"./script.c9dee25c.js";import"./health.44648e76.js";import"./keyboardControls.dab56049.js";import"./movement.651c1734.js";import"./smoothCamera.8cfd5353.js";import"./shooting.2a506596.js";import"./userInterface.3ca2e4ed.js";import"./damage.system.4e7a59e5.js";import"./attack.1b33267a.js";const M={mass:0,isGhost:!1,shouldRotate:!0},n={radius:1},c=new a(new y(n.radius),new h({color:255}));f.addObjectToScene(c);const T=i.createSphere(M,{pos:[0,20,20],scale:[1,1,1],quat:[0,0,0,1]},n),C=o.spawn([a,g],[c,T]);document.addEventListener("keydown",async p=>{if(p.key==="e"){const[e]=o.get(o.getTag(u),[w]),m=e.getWorldDirection(new S).multiplyScalar(30),d=e.position.clone().add(m),s=await i.raycast(e.position.toArray(),d.toArray());if(s){const{entityID:l}=s;if(l===C){const[r]=o.get(D,[I]),t=5;r.score>=t?(r.score-=t,A({name:"Fire Sword",damage:9,ranged:!0},!0)):console.log(`Not enough points.  Need: ${t}`)}}}});