import{e as p,b as h,Q as i,p as c,_ as d,w as r,P as w,a as _,d as y,V as n}from"./game.86b6fc01.js";import{G as g}from"./script.1f479a83.js";const b={path:"./models/sponza.glb",rigidbody_whitelist:["mesh_5","mesh_6","mesh_8","mesh_9","mesh_10","mesh_19","mesh_19","mesh_21","mesh_22","mesh_24"]},u={path:"./models/skjar-isles-glb/skjarisles.glb"},f={path:"./models/arena/arena.glb"},M={path:"./models/new-map/new-map-physics.glb",physicsPath:"./models/new-map/new-map-physics.glb"};var j={sponza:b,skjarIsles:u,testArena:f,newMap:M};class k extends g{async initialize(){const l=j.testArena,a=await p.loadModel({uri:l.path});a.name="Map",a.traverse(s=>{if(s instanceof h){const e=new n,t=new n,o=new i;s.getWorldPosition(e),s.getWorldScale(t),s.getWorldQuaternion(o);const m=c.createTrimesh({mass:0,isGhost:!1,shouldRotate:!0},{pos:e.toArray(),scale:t.toArray(),quat:o.toArray()},d(s.geometry));r.spawn([w],[m])}}),_.addObjectToScene(a),r.spawn([y],[a])}}export{k as default};
