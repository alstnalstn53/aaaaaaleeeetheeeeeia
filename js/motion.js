(function(){
'use strict';
try{
var container=document.getElementById('canvas-container');if(!container||typeof THREE==='undefined')return;
var _dk=document.body.classList.contains('dark-mode');
var _bgH=_dk?0x0a0a0a:0xffffff;var _ptH=_dk?0x888888:0x111111;
var scene=new THREE.Scene();scene.background=new THREE.Color(_bgH);scene.fog=new THREE.FogExp2(_bgH,0.002);
var camera=new THREE.PerspectiveCamera(75,innerWidth/innerHeight,0.1,1000);camera.position.z=180;
var renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(devicePixelRatio);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.outputEncoding=THREE.sRGBEncoding;container.appendChild(renderer.domElement);
function createPT(dark){var s=128,cv=document.createElement('canvas');cv.width=s;cv.height=s;var c=cv.getContext('2d'),g=c.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);if(dark){g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(0.2,'rgba(245,245,245,0.8)');g.addColorStop(0.5,'rgba(225,225,225,0.2)');g.addColorStop(1,'rgba(255,255,255,0)')}else{g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(0.2,'rgba(10,10,10,0.8)');g.addColorStop(0.5,'rgba(30,30,30,0.2)');g.addColorStop(1,'rgba(0,0,0,0)')}c.fillStyle=g;c.fillRect(0,0,s,s);return new THREE.CanvasTexture(cv)}
var cg=new THREE.Group();scene.add(cg);
var _c1Mat=new THREE.MeshBasicMaterial({color:_dk?0xffffff:0x000000,wireframe:true,transparent:true,opacity:0.15});
var _c2Mat=new THREE.MeshBasicMaterial({color:_dk?0xaaaaaa:0x555555,wireframe:true,transparent:true,opacity:0.05});
var _c1=new THREE.Mesh(new THREE.IcosahedronGeometry(3.8,5),_c1Mat);
var _c2=new THREE.Mesh(new THREE.IcosahedronGeometry(5,2),_c2Mat);
cg.add(_c1);cg.add(_c2);
var N=28000,geo=new THREE.BufferGeometry(),pos=new Float32Array(N*3),orig=[],rnd=[];
for(var i=0;i<N*3;i+=3){var R=20+85*Math.pow(Math.random(),1.2),th=Math.random()*Math.PI*2,ph=Math.acos(2*Math.random()-1);var x=R*Math.sin(ph)*Math.cos(th),y=R*Math.sin(ph)*Math.sin(th),z=R*Math.cos(ph);pos[i]=x;pos[i+1]=y;pos[i+2]=z;orig.push({x:x,y:y,z:z});rnd.push({speed:0.1+Math.random()*0.4,phase:Math.random()*Math.PI*2,amp:1.5+Math.random()*3})}
geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
var _ptMat=new THREE.PointsMaterial({size:1.2,color:_ptH,map:createPT(_dk),transparent:true,opacity:0.55,sizeAttenuation:true,depthWrite:false,blending:THREE.NormalBlending});
var pts=new THREE.Points(geo,_ptMat);scene.add(pts);
window._alScene={scene:scene,pts:pts,c1:_c1,c2:_c2,createPT:createPT};
scene.add(new THREE.AmbientLight(0xffffff,1.5));var dl=new THREE.DirectionalLight(0xffffff,2);dl.position.set(50,50,50);scene.add(dl);
var composer=new THREE.EffectComposer(renderer);composer.addPass(new THREE.RenderPass(scene,camera));composer.addPass(new THREE.UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),0.1,0.5,0.98));
var time=0,mx=0,my=0;
document.addEventListener('mousemove',function(e){mx=(e.clientX-innerWidth/2)*0.05;my=(e.clientY-innerHeight/2)*0.05});
(function animate(){requestAnimationFrame(animate);if(window._alPaused)return;time+=0.0008;var p=geo.attributes.position.array;for(var i=0;i<N;i++){var i3=i*3,o=orig[i],r=rnd[i],w=Math.sin(time*r.speed+r.phase)*r.amp;p[i3]=o.x+Math.cos(time*0.5+r.phase)*1.5;p[i3+1]=o.y+Math.sin(time*0.3+r.phase)*1.5+w;p[i3+2]=o.z+w}geo.attributes.position.needsUpdate=true;pts.rotation.y+=0.0001+mx*0.00005;pts.rotation.x+=my*0.00005;cg.rotation.y-=0.0005;cg.rotation.x+=0.0002;composer.render()})();
addEventListener('resize',function(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);composer.setSize(innerWidth,innerHeight)});
}catch(e){console.log('Three.js skipped:',e)}
})();
