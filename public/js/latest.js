/*!
 * 
 * Made with <3 by the Grove team | Mon Jun 19 2017 14:39:40 GMT+0000 (UTC)
 * 
 */
webpackJsonp([0],{16:function(e,t,o){"use strict";function n(e){r.clearRect(0,0,a.width,a.height);var t=r.createLinearGradient(0,0,e.xp.xp/e.xp.max*a.width,0);t.addColorStop(0,"darkgreen"),t.addColorStop(.75,"darkgreen"),t.addColorStop(.95,"lime"),t.addColorStop(1,"lime"),r.fillStyle=t,r.fillRect(0,a.height-10,e.xp.xp/e.xp.max*a.width,10),r.save(),r.beginPath(),r.arc(i,a.height-s,s,0,2*Math.PI,!1),r.clip(),r.fillStyle="#cc0000",r.fillRect(i-s,a.height,2*s,-(e.hp.val/e.hp.max)*s*2),r.restore(),r.beginPath(),r.arc(i,a.height-s,s,0,2*Math.PI,!1),r.lineWidth=6,t=r.createLinearGradient(0,0,0,2*s),t.addColorStop(0,"grey"),t.addColorStop(1,"black"),r.strokeStyle=t,r.stroke(),r.fillStyle="black",r.textAlign="center",r.fillText((e.hp.val>0?Math.floor(e.hp.val):0)+" HP",i,a.height-s);for(var o=[-100,-170,-240,-310,-380,100,170,240,310,380],n=[5,4,3,2,1,6,7,8,9],d=0;d<o.length;d++)r.strokeStyle="#000",n[e.hotbar.selected]==d&&100!==Math.abs(o[d])&&(r.strokeStyle="#ddd"),r.lineWidth=3,r.strokeRect(i+o[d]-25,a.height-70,50,50),100==o[d]&&(r.fillText("LH",i-100,a.height-s),r.fillText("RH",i+100,a.height-s));window.lee=e.hotbar.list.length;for(var l=0;l<e.hotbar.list.length;l++)if(/sword/gi.test(e.hotbar.list[l].name)){var c=new Image;c.src="/img/icons/two-handed-sword.svg",r.drawImage(c,i+o[n[l+1]]-25,a.height-70,50,50)}}e.exports=function(e,t){$("#quest-alert").css("right","0px"),$("#quest-alert > p").text(e),$("#quest-alert > small").text(t),setTimeout(function(){$("#quest-alert").animate({right:"-280px"},1e3)},5e3)},e.exports.init=function(e){$("#gui").toggle(),$("#underlay").toggle(),$("#load-play-btn").hide(),$("#gui-exit").click(function(){$("#gui").toggle(),$("#underlay").toggle()}),setInterval(function(){return n(e)},100)},e.exports.quests=function(){$("#quest-alert > p").text("Getting Skills"),$("#quest-alert > small").text("Use the Alchemy Table to make a health potion."),setTimeout(function(){$("#quest-alert").animate({right:"-280px"},1e3)},1e4)},e.exports.hotbar=function(e){for(var t=0;t<8;t++)$("#hb-"+t).html("-");for(var o=0;o<e.hotbar.list.length;o++)$("#hb-"+(o+1)).text(e.hotbar.list[o].name).data("item",e.hotbar.list[o])},e.exports.stats=function(e){$("#gui").show(),$("#underlay").show(),$("#gui-title").text(""),$("#gui-content").html("<h1 style=margin-top:21.5%;text-align:center;width:90%;color:white>\n    <span id=gui-q>quests</span> | <span id=gui-i>inventory</span> | <span id=gui-m>map</span> | <span id=gui-p>player</span>\n    </h1>"),$("#gui-q").click(function(){$("#gui-title").html("Quests"),$("#gui-content").html("questy stuff")}),$("#gui-i").click(function(){$("#gui-title").html("Inventory"),$("#gui-content").html(""),e.inventory.forEach(function(t){$(document.createElement("img")).attr("src","/img/icons/"+t.icon).attr("title",t.name).css("margin","10px").width(50).height(50).click(function(o){e.hotbar.list.indexOf(t)==-1?(e.hotbar.list.push(t),$(this).css("background-color","lightblue")):(e.hotbar.list.splice(e.hotbar.list.indexOf(t),1),$(this).css("background-color","transparent"))}).css("background-color",e.hotbar.list.indexOf(t)!==-1?"lightblue":"transparent").appendTo($("#gui-content"))})}),$("#gui-m").click(function(){$("#gui-title").html("Map");var e="image/jpeg",t=o(23).renderer.domElement.toDataURL(e);$("#gui-content").html("<img src="+t+" width=200>")}),$("#gui-p").click(function(){$("#gui-title").html("Player"),$("#gui-content").html("<div id=st></div>"),skill("strength").current(1).max(3).pos(100,150).sprite(8,10).sprites({2:[8,10],3:[8,3]}).name("Strength").hint("This determines how much you can hold, etc.").hint("You are a weakling.",1).hint("You can beat up your stepmother now.",2).hint("Hercules is a mouse compared to you.",3).$("#st"),skill("fury").current(1).max(3).pos(200,150).sprite(2,6).sprites({2:[2,6],3:[2,6]}).name("Internal Fury").hint("How much you are able to mash up enemies :)").hint("Not a man to be trifled with.",1).hint("Everyone stops talking when you are around.",2).hint("They say you can start fires with your eyes...",3).$("#st"),skilltree.language.reqTitle="For level {0} you would need:",skilltree.language.req='<h4>{1}</h4><ul class="reqs commamenu">{0}</ul>',skilltree.language.levelTitle="Level {1} {0}",skilltree.init($("#st"))}),$("#gui-content").is(":visible")&&document.exitPointerLock()};var a=document.getElementById("hp-bar");a.setAttribute("width",.7*window.innerWidth);var r=a.getContext("2d"),i=a.width/2,s=(a.height,40)},23:function(e,t,o){"use strict";(function(t,n){o(24),e.exports={scene:new t.Scene,renderer:new t.WebGLRenderer({antialias:!0,preserveDrawingBuffer:!0,alpha:!0}),camera:new t.PerspectiveCamera(70,window.innerWidth/window.innerHeight,1,2e4),world:new n.World,socket:io(),composers:[],BODIES:{items:[],projectiles:[]},AIS:[],LABELS:[],PLAYERS:[],EMITTERS:[],TWEENS:[],remove:{bodies:[],meshes:[],tweens:[]},listener:new t.AudioListener,delta:Date.now(),clock:new t.Clock,frustum:new t.Frustum,cameraViewProjectionMatrix:new t.Matrix4,groundMaterial:new n.Material("groundMaterial")};var a=new n.ContactMaterial(e.exports.groundMaterial,e.exports.groundMaterial,{friction:50,restitution:.3});e.exports.world.addContactMaterial(a);var r=o(52);e.exports.load=r.load,e.exports.box=r.box,e.exports.label=r.label,e.exports.ball=r.ball,e.exports.plane=r.plane}).call(t,o(3),o(12))},24:function(e,t,o){"use strict";function n(e,t){var o=i.get(e),n=i.get(t);return o.mat=n,o.dmg=n.dmg,o.spd=n.spd,o.dur=n.dur,o.name="test",JSON.parse(JSON.stringify(o))}function a(e,t,o){var a=i.get(e?"longsword":"shortsword"),r=n("@blade",t),s=n("@handle",o);a.blade=r,a.handle=s,a.name=a.blade.mat.name+" "+a.name,a.dmg=(r.dmg+s.dmg)/2,a.spd=(r.spd+s.spd)/2,a.slot="weapon",a.icon="two-handed-sword.svg",a.id=Math.random();var d=JSON.parse(JSON.stringify(a));return a=null,d.id=Math.random(),d}var r=o(83),i=null,s=o(58),d=o(60),l=o(59);Object.assign(s,d,l),i=new r(s),e.exports=function(e){i=new r(s),e(i,a)}},42:function(e,t,o){"use strict";(function(t){e.exports=function(e,n){$(window).bind("online",function(){return Materialize.toast("Connection restored",4e3)}),$(window).bind("offline",function(){return Materialize.toast("Connection lost",4e3)}),e.socket.emit("client-credentials",{username:window.__D.username,password:window.__D.password}),window.__D=void 0,delete window.__D,e.socket.emit("requestOldPlayers",{}),e.socket.on("createPlayer",function(t){void 0===n.serverdata&&(n.serverdata=t,n.id=t.id,Object.assign(n.inventory,n.serverdata.acc.inventory),o(49)(e,n),o(47)(e))}),e.socket.on("addOtherPlayer",function(o){o.id!==n.id&&(new t.ObjectLoader).load("/models/character-model/character-model.json",function(t){var n=e.box({l:1,w:1,h:1,mass:0,mesh:t,norotate:!0});e.PLAYERS.push({body:n.body,mesh:n.mesh,id:o.id,data:o}),e.label(n.mesh,o.acc.level+" - "+o.acc.username),Materialize.toast("<span style='color:lightblue'>"+o.acc.username+" joined</span>",4e3)})}),e.socket.on("removeOtherPlayer",function(t){r(t.id).mesh&&(e.scene.remove(r(t.id).mesh),e.world.remove(r(t.id).body),Materialize.toast(t.acc.username+" left",4e3),console.log(t.id+" disconnected"))}),e.socket.on("updatePosition",function(e){var t=r(e.id);t&&(t.body.position.x=e.x,t.body.position.y=e.y,t.body.position.z=e.z)}),e.socket.on("bullet",function(t){var o=t.pos,n=t.vel,a=e.ball({array:"projectiles"});a.body.position.set(o.x,o.y,o.z),a.body.velocity.set(n.x,n.y,n.z),a.mesh.position.set(o.x,o.y,o.z),a.body.addEventListener("collide",function(t){setTimeout(function(){e.remove.bodies.push(a.body),e.remove.meshes.push(a.mesh)},1500)})}),e.socket.on("hit",function(e){e.id==n.id&&n.hp.val--});var a=function(){n.serverdata.x=e.BODIES.player.body.position.x,n.serverdata.y=e.BODIES.player.body.position.y,n.serverdata.z=e.BODIES.player.body.position.z,n.serverdata.q=e.BODIES.player.body.quaternion},r=function(t){for(var o=void 0,n=0;n<e.PLAYERS.length;n++)if(e.PLAYERS[n].id==t){o=n;break}return e.PLAYERS[o]};e.socket.on("chat-msg",function(t,o){/\\g/gi.test(o)&&e.world.gravity.set(0,0,0),Materialize.toast(t+": "+o,1e4)});var i=0;$(window).on("keydown",function(t){13==t.keyCode&&$("#chat-input").is(":focus")&&i<5?(e.socket.emit("chat-msg",n.serverdata.acc.username,$("#chat-input").val()),$("#chat-input").val(""),$("#chat-input").blur(),i++,setTimeout(function(){i--},5e3)):84!=t.keyCode||$("#chat-input").is(":focus")||setTimeout(function(){$("#chat-input").focus(),$("#chat-input").val(" ")},100)}),e.socket.on("clear",function(){for(var t=e.scene.children.length-1;t>=0;t--)e.scene.remove(e.scene.children[t])}),e.socket.on("reload",function(){return window.location.reload()}),e.updatePlayerData=a,e.playerForId=r}}).call(t,o(3))},43:function(e,t,o){"use strict";function n(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var a=function e(){var t=this;n(this,e),this.hp={val:10,max:10},this.mp={val:5,max:5},this.xp={level:0,xp:3,max:10},this.equipped={weapon:null},this.inventory=[],this.hotbar={list:[],selected:1,active:null},o(24)(function(e,o){t.inventory.push(o(0,"iron","wood")),t.inventory.push(o(0,"ebony","iron"))})},r=new a;e.exports=r},44:function(e,t,o){"use strict";(function(t){e.exports=function(e,n){function a(){n.hotbar.list[n.hotbar.selected-1]&&(n.equipped.weapon=n.hotbar.list[n.hotbar.selected-1]),n.equipped.weapon&&/sword/gi.test(n.equipped.weapon.name)&&!i?(i=r.clone(),e.camera.add(i),window.addEventListener("mousedown",function(){if(i){var o=new TWEEN.Tween(i.rotation).to({x:[-Math.PI/2,0]},1/n.equipped.weapon.spd*3e3).onStart(function(){new Audio("/audio/sword.mp3").play()}).start();e.TWEENS.push(o);var a=new t.Raycaster;a.set(e.camera.getWorldPosition(),e.camera.getWorldDirection());var r=a.intersectObjects(e.scene.children,!0);r.length&&"rabbit"==r[0].object.name?Materialize.toast("Got one!",750):r.length&&"Rabbit"==r[0].object.name&&Materialize.toast("Still unchanged.  Solution coming!",750)}})):n.equipped.weapon||(e.camera.remove(i),i=null)}var r=void 0,i=void 0;(new t.ObjectLoader).load("/models/sword/sword.json",function(e){r=e,r.scale.set(.1,.1,.1),r.castShadow=!0,r.position.x++,r.position.y-=1.2,r.position.z-=1.25}),setInterval(a,500),$(window).on("keydown",function(a){if("E"==String.fromCharCode(a.keyCode)){var r=new t.Raycaster;r.set(e.camera.getWorldPosition(),e.camera.getWorldDirection());var i=r.intersectObjects(e.scene.children,!0);i.length>0&&/door/gi.test(i[0].object.name)&&e.socket.emit("map-update",{username:n.serverdata.acc.username,password:n.serverdata.acc.password,map:"skjar-isles"})}"Q"==String.fromCharCode(a.keyCode)&&o(16).stats(n);try{var s=Number(String.fromCharCode(a.keyCode));"number"==typeof s&&!isNaN(s)&&s>=1&&s<=8&&(n.hotbar.selected=s,n.hotbar.list[s-1]?n.equipped.weapon=n.hotbar.list[s-1]:n.equipped.weapon=null)}catch(e){}})}}).call(t,o(3))},45:function(e,t,o){var n=o(54);"string"==typeof n&&(n=[[e.i,n,""]]);o(30)(n,{});n.locals&&(e.exports=n.locals)},46:function(e,t,o){var n=o(55);"string"==typeof n&&(n=[[e.i,n,""]]);o(30)(n,{});n.locals&&(e.exports=n.locals)},47:function(e,t,o){"use strict";(function(t){function o(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function n(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}function a(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var r=function(){function e(e,t){for(var o=0;o<t.length;o++){var n=t[o];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}return function(t,o,n){return o&&e(t.prototype,o),n&&e(t,n),t}}();e.exports=function(e){var i=function(){function t(){var o=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"{{ AI CONSTRUCTOR }}",n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:10,r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:10;a(this,t),this.name=o,this.hp=n,this.dmg=r,e.AIS.push(this)}return r(t,[{key:"update",value:function(){}}]),t}(),s=function(i){function s(){var n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"animal",r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:3,i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:2,d=arguments.length>3&&void 0!==arguments[3]?arguments[3]:0;a(this,s);var l=o(this,(s.__proto__||Object.getPrototypeOf(s)).call(this,n,r,i)),c=new t.ObjectLoader;return l.hostility=d,l.id=Math.random(),c.load("/models/"+n+"/"+n+".json",function(o){"chicken"==n&&o.scale.set(5,5,5);var a=e.ball({radius:.4,mass:15,pos:new t.Vector3(50*Math.random()-25,20,50*Math.random()-25),mesh:o,norotate:!0,cb:function(e){e.mesh.name="rabbit"}});l.body=a,setInterval(function(){return l.update(l.body,l.hostility)},40)}),l}return n(s,i),r(s,[{key:"update",value:function(t,o){var n=e.BODIES.player.body.position,a=t.body.position;if(e.BODIES.player.mesh.position.distanceTo(t.mesh.position)<20){var r=12.5;o<0&&(r*=-1),t.body.velocity.set(n.x<a.x?-r:r,t.body.velocity.y,n.z<a.z?-r:r),t.mesh.lookAt(e.BODIES.player.mesh.position)}else this.body.body.velocity.set(0,t.body.velocity.y,0)}}]),s}(i);new s("rabbit",3,0,0),new s("rabbit",3,0,0),new s("rabbit",3,0,0),new s("rabbit",3,0,0),new s("rabbit",3,0,0),new s("rabbit",3,0,0),new s("rabbit",3,0,0),new s("rabbit",3,0,-1),new s("rabbit",3,0,-1),new s("rabbit",3,0,-1),new s("rabbit",3,0,-1),new s("rabbit",3,0,-1),new s("rabbit",3,0,-1),new s("rabbit",3,0,-1),new s("chicken",1,0,1),new s("chicken",1,0,1),new s("chicken",1,0,1),new s("chicken",1,0,15),new s("chicken",1,0,1),new s("chicken",1,0,1),new s("chicken",1,0,1),new s("chicken",1,0,15),new s("chicken",1,0,1),new s("chicken",1,0,1),new s("chicken",1,0,1),new s("chicken",1,0,1),new s("chicken",1,0,-.5),new s("chicken",1,0,-.5),new s("chicken",1,0,-.5),new s("chicken",1,0,-.5),new s("chicken",1,0,-.5),new s("chicken",1,0,-.5)}}).call(t,o(3))},48:function(e,t,o){"use strict";(function(t){e.exports=function(e,o){e.scene.fog=new t.Fog(16777215,2);var n=new t.DirectionalLight(16777215,1);n.position.set(50,30,40),n.castShadow=!0,n.shadowCameraNear=e.camera.near,n.shadowCameraFar=e.camera.far,n.shadowCameraFov=70,n.shadowCameraLeft=-400,n.shadowCameraRight=400,n.shadowCameraTop=100,n.shadowCameraBottom=-300,n.shadowMapBias=.0036,n.shadowMapDarkness=.5,n.shadowMapWidth=4096,n.shadowMapHeight=4096,n.shadowCameraVisible=!0,e.scene.add(n);var a=new t.SpriteMaterial({map:new t.ImageUtils.loadTexture("/img/glow.png"),color:16755370,transparent:!1,blending:t.AdditiveBlending}),r=new t.Sprite(a);r.scale.set(100,100,1),n.add(r);var i={time:{value:1},resolution:{value:new t.Vector2}};setInterval(function(){i.time.value+=.1;var e=2.1,t=Math.sin(e),o=Math.cos(e);n.position.set(450*t,600*t,600*o)},40);var s=new t.HemisphereLight(16777215,16777215,.2);s.color.setHSL(.6,1,.6),s.groundColor.setHSL(.095,1,.75),s.position.set(0,500,0),e.scene.add(s);for(var d="/img/skybox/",l=["px","nx","py","ny","pz","nz"],c=".jpg",h=new t.CubeGeometry(2e3,2e3,2e3),u=[],p=0;p<6;p++)u.push(new t.MeshBasicMaterial({map:t.ImageUtils.loadTexture(d+l[p]+c),side:t.BackSide,fog:!1}));var m=new t.MeshFaceMaterial(u),w=new t.Mesh(h,m);e.BODIES.player.mesh.add(w),(new t.ObjectLoader).load("/models/skjar-isles/skjar-isles.json",function(o){e.scene.add(o),o.castShadow=!0,o.recieveShadow=!0,o.traverse(function(o){if(o instanceof t.Mesh&&(o.castShadow=!0,o.recieveShadow=!0,/NP/gi.test(o.name)||e.load(o,{mass:0,material:e.groundMaterial}),/portal/gi.test(o.name)&&(o.material=new t.ShaderMaterial({uniforms:i,vertexShader:document.getElementById("V_PortalShader").textContent,fragmentShader:document.getElementById("F_PortalShader").textContent}),o.add(new t.PointLight(16777215,1,25,2))),/bridge/gi.test(o.name))){var n=new TWEEN.Tween(o.rotation).to({y:-Math.PI/8},4e3).repeat(1/0).yoyo(!0).start();e.TWEENS.push(n)}})})}}).call(t,o(3))},49:function(e,t,o){"use strict";(function(t){function n(e,n){o(51)(e),o(50)(e,n),o(48)(e,n),e.renderer.shadowMapEnabled=!0,e.renderer.shadowMapSoft=!0,e.renderer.shadowMapType=t.BasicShadowMap,e.renderer.shadowCameraNear=3,e.renderer.shadowCameraFar=e.camera.far,e.renderer.shadowCameraFov=50,e.renderer.shadowMapBias=1e-4,e.renderer.shadowMapDarkness=.5,e.renderer.shadowMapWidth=1024,e.renderer.shadowMapHeight=1024,e.renderer.setClearColor(e.scene.fog.color,1),e.renderer.setSize(window.innerWidth,window.innerHeight),e.camera.add(e.listener),document.body.appendChild(e.renderer.domElement)}e.exports=n}).call(t,o(3))},50:function(e,t,o){"use strict";(function(t,n){var a=o(53);e.exports=function(e,o){var r=100,i=1.7,s=new t.Sphere(i),d=new t.Body({mass:r,material:e.groundMaterial});d.addShape(s),d.position.set(0,30,0),d.angularDamping=.9,e.world.add(d),d.addEventListener("collide",function(e){var n=e.contact,a=new t.Vec3(0,1,0),r=new t.Vec3;n.bi.id==d.id?n.ni.negate(r):r.copy(n.ni),r.dot(a)>.5&&d.velocity.y<=-60&&(o.hp.val+=Math.floor(d.velocity.y/10))});var l=new n.Mesh(new n.BoxGeometry(1,2,1),new n.MeshLambertMaterial);l.castShadow=!0,e.scene.add(l),e.BODIES.player={body:d,shape:s,mesh:l},e.controls=new a(e.camera,e.BODIES.player.body),e.scene.add(e.controls.getObject()),window.controls=e.controls}}).call(t,o(12),o(3))},51:function(e,t,o){"use strict";(function(t){e.exports=function(e){var o=new t.GSSolver;e.world.allowSleep=!0,e.world.defaultContactMaterial.contactEquationStiffness=1e9,e.world.defaultContactMaterial.contactEquationRelaxation=4,e.world.defaultContactMaterial.friction=2,o.iterations=7,o.tolerance=.1,e.world.solver=o,e.world.gravity.set(0,-25,0),e.world.broadphase=new t.NaiveBroadphase}}).call(t,o(12))},52:function(e,t,o){"use strict";(function(t,n){function a(e,o){o=o?o:{},e.castShadow=!0,e.recieveShadow=!0;for(var n=[],a=[],r=0;r<e.geometry.vertices.length;r++){var i=e.geometry.vertices[r];n.push(new t.Vec3(i.x,i.y,i.z))}for(var r=0;r<e.geometry.faces.length;r++){var s=e.geometry.faces[r];a.push([s.a,s.b,s.c])}var d=new t.ConvexPolyhedron(n,a),l=new t.Body({mass:o.mass||0,material:o.material||void 0});return l.addShape(d),l.position.copy(e.position),l.quaternion.copy(e.quaternion),c.world.add(l),c.BODIES.items.push({body:l,shape:d,mesh:e}),{body:l,shape:d,mesh:e}}function r(e){e=e?e:{};var o=new t.Vec3(void 0!==e.l?e.l:1,void 0!==e.h?e.h:1,void 0!==e.w?e.w:1),a=new t.Box(o),r=new n.BoxGeometry(2*o.x,2*o.y,2*o.z),i=new t.Body({mass:e.mass||0});i.addShape(a);var s=e.mesh||new n.Mesh(r,void 0!==e.mat?e.mat:new n.MeshPhongMaterial({color:16711680})),d=c.BODIES.items.push({body:i,shape:a,mesh:s}),l=c.BODIES.items[d];return c.world.add(l.body),c.scene.add(l.mesh),l.mesh.castShadow=!0,l.mesh.receiveShadow=!0,e.pos&&l.mesh.position.set(e.pos.x,e.pos.y,e.pos.z),l.norotete=e.norotate||!1,l}function i(e){e=e?e:{};var o=new t.Sphere(e.radius||.2),a=new n.SphereGeometry(o.radius,32,32),r=new t.Body({mass:void 0!==e.mass?e.mass:10});r.addShape(o);var i=e.mesh||new n.Mesh(a,e.mat||new n.MeshPhongMaterial({color:e.c||52479})),s=c.BODIES[e.array||"items"].push({body:r,shape:o,mesh:i,norotate:e.norotate||!1});return c.world.add(s.body),c.scene.add(s.mesh),s.mesh.castShadow=!0,s.mesh.receiveShadow=!0,!e.cb||e.cb(s),e.pos&&s.body.position.set(e.pos.x,e.pos.y,e.pos.z),s}function s(e){var o=new n.PlaneGeometry(5,20,32),a=new n.MeshBasicMaterial({color:16776960,side:n.DoubleSide}),r=new n.Mesh(o,a);c.scene.add(r);var i=new t.Plane,s=new t.Body({mass:0,shape:i});return c.world.add(s),c.BODIES[e.array||"items"].push({body:s,shape:i,mesh:r}),{body:s,shape:i,mesh:r}}function d(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"",o=(arguments.length>2&&void 0!==arguments[2]&&arguments[2],18),a=4,r={r:0,g:0,b:0,a:1},i={r:255,g:255,b:255,a:1},s=document.createElement("canvas"),d=s.getContext("2d");d.font="Bold "+o+"px Arial";var c=d.measureText(t),h=c.width;d.fillStyle="rgba("+i.r+","+i.g+","+i.b+","+i.a+")",d.strokeStyle="rgba("+r.r+","+r.g+","+r.b+","+r.a+")",d.lineWidth=a,l(d,a/2,a/2,h+a,1.4*o+a,6),d.fillStyle="rgba(0, 0, 0, 1.0)",d.fillText(t,a,o+a);var u=new n.Texture(s);u.needsUpdate=!0;var p=new n.SpriteMaterial({map:u,useScreenCoordinates:!1}),m=new n.Sprite(p);m.scale.set(5,2.5,1),e.add(m)}function l(e,t,o,n,a,r){e.beginPath(),e.moveTo(t+r,o),e.lineTo(t+n-r,o),e.quadraticCurveTo(t+n,o,t+n,o+r),e.lineTo(t+n,o+a-r),e.quadraticCurveTo(t+n,o+a,t+n-r,o+a),e.lineTo(t+r,o+a),e.quadraticCurveTo(t,o+a,t,o+a-r),e.lineTo(t,o+r),e.quadraticCurveTo(t,o,t+r,o),e.closePath(),e.fill(),e.stroke()}var c=o(23);e.exports.load=a,e.exports.box=r,e.exports.label=d,e.exports.ball=i,e.exports.plane=s}).call(t,o(12),o(3))},53:function(e,t,o){"use strict";(function(t,o){e.exports=function(e,n){var a=.3,r=10,i=this,s=new t.Object3D;s.add(e);var d=new t.Object3D;d.position.y=2,d.add(s);var l=new t.Quaternion,c=!1,h=!1,u=!1,p=!1,m=!1,w=new o.Vec3,v=new o.Vec3(0,1,0);n.addEventListener("collide",function(e){var t=e.contact;t.bi.id==n.id?t.ni.negate(w):w.copy(t.ni),w.dot(v)>.5&&(m=!0)});var y=n.velocity,f=Math.PI/2,g=function(e){if(i.enabled!==!1){var t=e.movementX||e.mozMovementX||e.webkitMovementX||0,o=e.movementY||e.mozMovementY||e.webkitMovementY||0;d.rotation.y-=.002*t,s.rotation.x-=.002*o,s.rotation.x=Math.max(-f,Math.min(f,s.rotation.x))}},b=function(e){if(!$("#chat-input").is(":focus"))switch(e.keyCode){case 38:case 87:c=!0;break;case 37:case 65:u=!0;break;case 40:case 83:h=!0;break;case 39:case 68:p=!0;break;case 32:m===!0&&(y.y=r),m=!1}},x=function(e){if(!$("#chat-input").is(":focus"))switch(e.keyCode){case 38:case 87:c=!1;break;case 37:case 65:u=!1;break;case 40:case 83:h=!1;break;case 39:case 68:p=!1}};document.addEventListener("mousemove",g,!1),document.addEventListener("keydown",b,!1),document.addEventListener("keyup",x,!1),this.enabled=!1,this.getObject=function(){return d},this.getDirection=function(e){e.set(0,0,-1),l.multiplyVector3(e)};var S=new t.Vector3,k=new t.Euler;this.update=function(e){i.enabled===!0&&(e*=.1,S.set(0,0,0),c&&(S.z=-a*e),h&&(S.z=a*e),u&&(S.x=-a*e),p&&(S.x=a*e),m&&(S.x*=.8,S.y*=.8,S.z*=.8)),!m||c||h||u||p||(n.velocity.x<0?n.velocity.x+=.45:n.velocity.x-=.46,n.velocity.z<0?n.velocity.z+=.45:n.velocity.z-=.46),n.velocity.x<-15?n.velocity.x=-15:n.velocity.x>15&&(n.velocity.x=15),n.velocity.z<-15?n.velocity.z=-15:n.velocity.z>15&&(n.velocity.z=15),k.y=d.rotation.y,k.order="XYZ",l.setFromEuler(k),S.applyQuaternion(l),y.x+=S.x,y.z+=S.z,d.position.copy(n.position)}}}).call(t,o(3),o(12))},58:function(e,t){e.exports={"@item":{name:"-- Item --",desc:"If you see this, please contact developers",weight:0,ench:{}},"@weapon":{proto:"@item",name:"-- Weapon --",dmg:0,spd:0,knbk:0,slot:0,cost:{}},"@sword":{proto:"@weapon",name:"-- Sword --",blade:{},handle:{}},"@blade":{proto:"@weapon",name:"-- Blade --",mat:{}},"@handle":{proto:"@weapon",name:"-- Handle --",mat:{}},"@bow":{proto:"@weapon",name:"-- Bow --",body:{},string:{}},"@body":{proto:"@weapon",name:"-- Bow Body --",mat:{}},"@string":{proto:"@weapon",name:"-- Bowstring --",mat:{}},"@spell":{proto:"@weapon",name:"-- Spell --",weight:0},"@material":{proto:"@item",dur:0,spd:0,dmg:0}}},59:function(e,t){e.exports={wood:{proto:"@material",name:"Wood",desc:"A block of wood.  Interesting.",weight:2,dmg:3,dur:1,spd:4},iron:{proto:"@material",name:"Iron",desc:"A bar of iron for all of your irony needs",weight:5,dmg:7,dur:3,spd:3},steel:{proto:"@material",name:"Steel",desc:"A rod of steel, a steel rod",weight:6,dmg:12,dur:5,spd:3},ebony:{proto:"@material",name:"Ebony",desc:"Like ebay, but ebony",weight:10,dmg:16,dur:8,spd:2},ivory:{proto:"@material",name:"Ivory",desc:"A fine, delicate material",weight:.5,dmg:2,dur:1,spd:15},dragonivory:{proto:"ivory",name:"Dragon Ivory",desc:"Carved from the scales of the finest dragons in The Grove",dmg:4,dur:2}}},60:function(e,t){e.exports={shortsword:{proto:"@sword",name:"Shortsword",desc:"A shortened sword",slot:1},longsword:{proto:"@sword",name:"Longsword",desc:"Slonglord!  Wait a sec...",slot:2}}},85:function(e,t,o){"use strict";(function(e,t){function n(e){if(window.controls&&window.controls.enabled){if(r.remove.bodies.length&&r.remove.meshes.length){for(var t in r.remove.bodies)r.world.remove(r.remove.bodies[t]),delete r.remove.bodies[t];for(var o in r.remove.meshes)r.scene.remove(r.remove.meshes[o]),delete r.remove.meshes[o]}else if(r.remove.tweens.length)for(var a in r.remove.tweens)r.TWEENS[r.remove.bodies[a]].stop(),delete r.remove.tweens[a];for(var d=0;d<r.BODIES.projectiles.length;d++)r.BODIES.projectiles[d].mesh.position.copy(r.BODIES.projectiles[d].body.position),r.BODIES.projectiles[d].mesh.quaternion.copy(r.BODIES.projectiles[d].body.quaternion);for(var l=0;l<r.BODIES.items.length;l++)r.BODIES.items[l].mesh.position.copy(r.BODIES.items[l].body.position),r.BODIES.items[l].norotate||r.BODIES.items[l].mesh.quaternion.copy(r.BODIES.items[l].body.quaternion);for(var c in r.TWEENS)r.TWEENS[c].update(e);if(r.BODIES.player.mesh.position.copy(r.BODIES.player.body.position),r.BODIES.player.body.position.y<-400&&i.hp.val--,$("#health-bar").val(i.hp.val/i.hp.max*100>0?i.hp.val/i.hp.max*100:0),$("#health").text((i.hp.val>0?i.hp.val:0)+" HP"),i.hp.val<=0)return r.socket.disconnect(),$("#blocker").fadeIn(5e3),void $("#load").show().html("<h1>You Have Perished. Game Over...</h1>");r.world.step(s),r.controls.update(Date.now()-r.delta),r.renderer.render(r.scene,r.camera),r.delta=Date.now(),i&&i.serverdata&&r&&r.updatePlayerData&&(r.updatePlayerData(),r.socket.emit("updatePosition",i.serverdata))}requestAnimationFrame(n)}function a(){r.camera.aspect=window.innerWidth/window.innerHeight,r.camera.updateProjectionMatrix(),r.renderer.setSize(window.innerWidth,window.innerHeight)}o(45),o(46);var r=o(23),i=o(43),s=1/60;o(24),o(16).init(i),o(44)(r,i),o(42)(r,i),t.DefaultLoadingManager.onProgress=function(t,a,r){console.log(a+" out of "+r),a==r&&($("#spinner").hide(),$("#load-play-btn, .play-btn").show(),e.once(n)(),o(16).quests())},window.addEventListener("resize",a,!1)}).call(t,o(28),o(3))}},[85]);