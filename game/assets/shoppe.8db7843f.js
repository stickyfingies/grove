import{w as o,f as a,r as h,y as f,g,p as i,P as u,C as w,o as S,V as A}from"./game.6fe68dfe.js";import{addToInventory as D}from"./inventory.24d76a8d.js";import{p as E}from"./goblin.1db4d653.js";import{Score as I}from"./score.6776b201.js";import"./script.2c8a546a.js";import"./health.e780e6ba.js";import"./keyboardControls.6f897e4d.js";import"./movement.ada393bb.js";import"./smoothCamera.f254c992.js";import"./shooting.4204f7df.js";import"./userInterface.661a8981.js";import"./damage.system.a2c7a798.js";const n=o.createEntity(),M={mass:0,isGhost:!1,shouldRotate:!0},c={radius:1},p=new a(new h(c.radius),new f({color:255}));g.addObjectToScene(p);const T=i.createSphere(M,{pos:[0,20,20],scale:[1,1,1],quat:[0,0,0,1]},c);o.put(n,[a,u],[p,T]);document.addEventListener("keydown",async m=>{if(m.key==="e"){const[e]=o.get(o.getTag(w),[S]),d=e.getWorldDirection(new A).multiplyScalar(30),y=e.position.clone().add(d),r=await i.raycast(e.position.toArray(),y.toArray());if(r){const{entityID:l}=r;if(l===n){const[s]=o.get(E,[I]),t=5;s.score>=t?(s.score-=t,D({name:"Fire Sword",damage:9,ranged:!0},!0)):console.log(`Not enough points.  Need: ${t}`)}}}});