import{w as a,M as i,g as r,p as m,a as b,P as w}from"./game.c6b7d49d.js";import{G as u}from"./script.e29e5157.js";import o,{Death as f}from"./health.2e633d5f.js";class n{}class v extends u{initialize(){window.webApi&&window.webApi.onmessage("barbarian",()=>{this.spawnBarbarian()}),this.spawnBarbarian()}every_frame(){a.do_with([i,n,f],([s],e)=>{r.removeObjectFromScene(s),a.deleteEntity(e)})}async spawnBarbarian(){const c=a.createEntity(),h=m.createCapsule({mass:10,isGhost:!1,shouldRotate:!1},{pos:[0,50,30],scale:[1,1,1],quat:[0,0,0,1]},{radius:.7,height:1.7}),t=await b.loadModel({uri:"./models/villager-male/villager-male.glb"});r.addObjectToScene(t);const p=new o(1,1),d={};a.put(c,[i,w,o,n],[t,h,p,d])}}export{n as BarbarianData,v as default};