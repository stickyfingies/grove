import{d as p,b as h,Q as i,p as c,_ as d,w as r,P as w,e as _,V as n}from"./game.d0ad9aae.js";import{G as y}from"./script.c9dee25c.js";const g={path:"./models/sponza.glb",rigidbody_whitelist:["mesh_5","mesh_6","mesh_8","mesh_9","mesh_10","mesh_19","mesh_19","mesh_21","mesh_22","mesh_24"]},b={path:"./models/skjar-isles-glb/skjarisles.glb"},u={path:"./models/arena/arena.glb"},f={path:"./models/new-map/new-map-physics.glb",physicsPath:"./models/new-map/new-map-physics.glb"};var M={sponza:g,skjarIsles:b,testArena:u,newMap:f};class k extends y{async initialize(){const l=M.testArena,a=await p.loadModel({uri:l.path});a.name="Map",a.traverse(s=>{if(s instanceof h){const e=new n,t=new n,o=new i;s.getWorldPosition(e),s.getWorldScale(t),s.getWorldQuaternion(o);const m=c.createTrimesh({mass:0,isGhost:!1,shouldRotate:!0},{pos:e.toArray(),scale:t.toArray(),quat:o.toArray()},d(s.geometry));r.spawn([w],[m])}}),r.spawn([_],[a])}}export{k as default};