'use client';

import { useEffect, useRef } from 'react';

export function ParticleBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let disposed = false;

    async function init() {
      const THREE = await import('three');
      const { EffectComposer } = await import('three/examples/jsm/postprocessing/EffectComposer.js');
      const { RenderPass } = await import('three/examples/jsm/postprocessing/RenderPass.js');
      const { UnrealBloomPass } = await import('three/examples/jsm/postprocessing/UnrealBloomPass.js');

      if (disposed || !containerRef.current) return;

      const container = containerRef.current;
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0a0a0a);
      scene.fog = new THREE.FogExp2(0x0a0a0a, 0.00025);

      const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 2000);
      camera.position.z = 420;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(innerWidth, innerHeight);
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      container.appendChild(renderer.domElement);

      const isMobile = innerWidth < 768;
      const SIZE = isMobile ? 280 : 400;
      const N = SIZE * SIZE;

      function createDataTex(data: Float32Array) {
        const t = new THREE.DataTexture(data as unknown as BufferSource, SIZE, SIZE, THREE.RGBAFormat, THREE.FloatType);
        t.needsUpdate = true;
        return t;
      }

      // Initial positions — sphere distribution
      const initPosData = new Float32Array(N * 4);
      for (let i = 0; i < N; i++) {
        const phi = Math.acos(1 - 2 * (i + 0.5) / N);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;
        const u = Math.random();
        const R = 20 + u * u * 120;
        initPosData[i * 4] = Math.sin(phi) * Math.cos(theta) * R;
        initPosData[i * 4 + 1] = Math.cos(phi) * R;
        initPosData[i * 4 + 2] = Math.sin(phi) * Math.sin(theta) * R;
        initPosData[i * 4 + 3] = Math.random();
      }
      const initPosTex = createDataTex(initPosData);

      // Silhouette target positions (default — overwritten by figure loading)
      const silTargetData = new Float32Array(N * 4);
      for (let i = 0; i < N; i++) {
        const u = Math.random();
        const r = 15 + u * u * 100;
        const a = Math.random() * 6.2831;
        const b = Math.random() * 3.1416;
        silTargetData[i * 4] = Math.sin(b) * Math.cos(a) * r;
        silTargetData[i * 4 + 1] = Math.cos(b) * r * 0.7;
        silTargetData[i * 4 + 2] = Math.sin(b) * Math.sin(a) * r * 0.4;
        silTargetData[i * 4 + 3] = -1.0;
      }
      let silTargetTex = createDataTex(silTargetData);

      // FBO render targets
      const rtOpts = { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat, type: THREE.FloatType };
      const rtA = new THREE.WebGLRenderTarget(SIZE, SIZE, rtOpts);
      const rtB = new THREE.WebGLRenderTarget(SIZE, SIZE, rtOpts);

      // Simulation shader
      const simVert = 'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position,1.0);}';
      const simFrag = `precision highp float;
varying vec2 vUv;
uniform sampler2D uPositions;uniform sampler2D uInitPositions;uniform sampler2D uSilTargets;
uniform float uTime;uniform float uMorph;uniform float uRotAngle;uniform vec3 uMouse3D;uniform float uMouseActive;
vec3 mod289(vec3 x){return x-floor(x/289.0)*289.0;}
vec4 mod289v4(vec4 x){return x-floor(x/289.0)*289.0;}
vec4 permute(vec4 x){return mod289v4(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise3(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
vec3 curlNoise(vec3 p,float t){
  float e=0.1;float n1,n2;vec3 curl;
  n1=snoise3(vec3(p.x,p.y+e,p.z)+t);n2=snoise3(vec3(p.x,p.y-e,p.z)+t);curl.x=(n1-n2)/(2.0*e);
  n1=snoise3(vec3(p.x,p.y,p.z+e)+t*1.1);n2=snoise3(vec3(p.x,p.y,p.z-e)+t*1.1);curl.x-=(n1-n2)/(2.0*e);
  n1=snoise3(vec3(p.x,p.y,p.z+e)+t*0.9);n2=snoise3(vec3(p.x,p.y,p.z-e)+t*0.9);curl.y=(n1-n2)/(2.0*e);
  n1=snoise3(vec3(p.x+e,p.y,p.z)+t*1.2);n2=snoise3(vec3(p.x-e,p.y,p.z)+t*1.2);curl.y-=(n1-n2)/(2.0*e);
  n1=snoise3(vec3(p.x+e,p.y,p.z)+t*0.8);n2=snoise3(vec3(p.x-e,p.y,p.z)+t*0.8);curl.z=(n1-n2)/(2.0*e);
  n1=snoise3(vec3(p.x,p.y+e,p.z)+t*1.15);n2=snoise3(vec3(p.x,p.y-e,p.z)+t*1.15);curl.z-=(n1-n2)/(2.0*e);
  return curl;
}
void main(){
  vec4 cur=texture2D(uPositions,vUv);vec4 init=texture2D(uInitPositions,vUv);vec4 target=texture2D(uSilTargets,vUv);
  float seed=init.w;vec3 pos=cur.xyz;
  float mp=uMorph*uMorph*(3.0-2.0*uMorph);
  vec3 nDir=normalize(init.xyz);
  float surfN=snoise3(nDir*1.8+vec3(uTime*0.35))+snoise3(nDir*3.5+vec3(-uTime*0.2,uTime*0.25,seed*0.04))*0.35;
  float breathe=sin(uTime*0.35)*0.08;
  float targetR=length(init.xyz)*(1.0+surfN*0.22+breathe);
  vec3 homePos=nDir*targetR;
  float cR=cos(uRotAngle);float sR=sin(uRotAngle);
  homePos=vec3(homePos.x*cR-homePos.z*sR,homePos.y,homePos.x*sR+homePos.z*cR);
  vec3 curlP=pos*0.012;vec3 curl=curlNoise(curlP,uTime*0.15+seed*5.0);
  vec3 posNorm=normalize(pos+0.001);vec3 tangentCurl=curl-posNorm*dot(curl,posNorm);
  vec3 curlForce=tangentCurl*3.0*(1.0-mp);
  vec3 homeForce=(homePos-pos)*0.08*(1.0-mp);
  vec3 silPos=target.xyz;float silDensity=target.w;
  float isAmbient=step(silDensity,-0.5);vec3 silForce=vec3(0.0);
  float isOrbit=step(-0.5,silDensity)*step(silDensity,-0.01);
  if(isAmbient<0.5 && isOrbit<0.5){
    float looseness=(1.0-silDensity)*(1.0-silDensity);
    float pn=snoise3(vec3(seed*50.0,seed*30.0,uTime*0.10));
    silPos.x+=pn*looseness*1.5*mp;silPos.y+=sin(uTime*0.18+seed*20.0)*looseness*0.8*mp;silPos.z+=cos(uTime*0.15+seed*15.0)*looseness*1.0*mp;
    float figPhase=silPos.x*0.02+silPos.y*0.015;
    float swayX=sin(uTime*0.12+figPhase)*2.5+sin(uTime*0.07+figPhase*1.3)*1.2;
    float swayY=cos(uTime*0.10+figPhase*0.8)*1.8+sin(uTime*0.06+figPhase*0.5)*0.8;
    float swayZ=sin(uTime*0.09+figPhase*1.1)*1.5;
    float swayAmt=0.3+looseness*0.7;
    silPos.x+=swayX*swayAmt*mp;silPos.y+=swayY*swayAmt*mp;silPos.z+=swayZ*swayAmt*mp;
    float attractStr=0.06+silDensity*0.40;silForce=(silPos-pos)*attractStr*mp;
  }else if(isOrbit>0.5){
    float orbitDist=abs(silDensity);float spd1=0.06+seed*0.08;float spd2=0.04+orbitDist*0.12;
    float a1=uTime*spd1+seed*6.2831;float a2=uTime*spd2+seed*3.14+orbitDist*10.0;
    float oR=8.0+orbitDist*30.0;
    vec3 orbitOffset=vec3(cos(a1)*oR+sin(a2*0.3)*oR*0.4,sin(a1*0.6+seed*2.0)*oR*0.45+cos(a2*0.5)*oR*0.2,sin(a2*0.7+seed)*oR*0.5+cos(a1*0.4)*oR*0.15);
    vec3 orbitTarget=silPos+orbitOffset*mp;silForce=(orbitTarget-pos)*0.018*mp;silForce+=tangentCurl*3.0*mp;
  }else{
    float oAngle=uTime*(0.03+seed*0.05)+seed*6.28;float oR=3.0+seed*8.0;
    vec3 drift=silPos+vec3(cos(oAngle)*oR,sin(oAngle*0.6+seed)*oR*0.25,sin(oAngle*0.8)*oR);silForce=(drift-pos)*0.02*mp;
  }
  if(uMouseActive>0.5){vec3 toP=pos-uMouse3D;float mDist=length(toP);float mRad=mix(50.0,120.0,mp);if(mDist<mRad&&mDist>0.1){float push=1.0-mDist/mRad;push=push*push*push;pos+=normalize(toP)*push*12.0;}}
  pos+=curlForce+homeForce+silForce;gl_FragColor=vec4(pos,cur.w);
}`;

      const simMat = new THREE.ShaderMaterial({
        vertexShader: simVert,
        fragmentShader: simFrag,
        uniforms: {
          uPositions: { value: null },
          uInitPositions: { value: initPosTex },
          uSilTargets: { value: silTargetTex },
          uTime: { value: 0 },
          uMorph: { value: 0 },
          uRotAngle: { value: 0 },
          uMouse3D: { value: new THREE.Vector3() },
          uMouseActive: { value: 0 },
        },
      });

      const simScene = new THREE.Scene();
      const simCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      simScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), simMat));

      // Initialize FBO
      const initMat = new THREE.ShaderMaterial({
        vertexShader: simVert,
        fragmentShader: 'precision highp float;varying vec2 vUv;uniform sampler2D uTex;void main(){gl_FragColor=texture2D(uTex,vUv);}',
        uniforms: { uTex: { value: initPosTex } },
      });
      const initScene = new THREE.Scene();
      initScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), initMat));
      renderer.setRenderTarget(rtA);
      renderer.render(initScene, simCamera);
      renderer.setRenderTarget(rtB);
      renderer.render(initScene, simCamera);
      renderer.setRenderTarget(null);

      // Warm up
      for (let w = 0; w < 60; w++) {
        simMat.uniforms.uPositions.value = w % 2 === 0 ? rtA.texture : rtB.texture;
        simMat.uniforms.uTime.value = w * 0.001;
        renderer.setRenderTarget(w % 2 === 0 ? rtB : rtA);
        renderer.render(simScene, simCamera);
        renderer.setRenderTarget(null);
      }

      // Render shader
      const renderVert = `attribute vec2 aRef;uniform sampler2D uPositions;uniform sampler2D uSilTargets;
uniform float uPixelRatio;uniform float uMorph;
varying float vAlpha;varying float vDensity;varying float vMorph;
void main(){
  vec4 posData=texture2D(uPositions,aRef);vec4 silData=texture2D(uSilTargets,aRef);
  vec3 pos=posData.xyz;vec4 mvPos=modelViewMatrix*vec4(pos,1.0);gl_Position=projectionMatrix*mvPos;
  float mp=uMorph*uMorph*(3.0-2.0*uMorph);vMorph=mp;
  float density=silData.w;float absDen=max(density,0.0);float isAmb=step(density,-0.5);
  float isOrb=step(-0.5,density)*step(density,-0.01);
  float coreSize=3.0;float figSize=1.8+absDen*1.2;float orbSize=1.2+abs(density)*1.6;float ambSize=0.8;
  float unmaskSize=mix(mix(figSize,orbSize,isOrb),ambSize,isAmb);float sz=mix(coreSize,unmaskSize,mp);
  float depthScale=340.0/max(-mvPos.z,100.0);gl_PointSize=sz*uPixelRatio*depthScale;gl_PointSize=max(gl_PointSize,0.5);
  float coreAlpha=mix(0.15,0.35,posData.w);float figAlpha=0.2+absDen*0.35;
  float orbAlpha=0.06+abs(density)*0.18;float ambAlpha=0.03;
  float unmaskAlpha=mix(mix(figAlpha,orbAlpha,isOrb),ambAlpha,isAmb);
  vAlpha=mix(coreAlpha,max(unmaskAlpha,0.01),mp);vDensity=density;
}`;

      const renderFrag = `varying float vAlpha;varying float vDensity;varying float vMorph;
void main(){
  float d=length(gl_PointCoord-0.5);if(d>0.5)discard;
  float absDen=max(vDensity,0.0);
  float core=1.0-smoothstep(0.0,0.12,d);float glow=1.0-smoothstep(0.0,0.5,d);glow*=glow;float coreShape=core*0.6+glow*0.5;
  float sharpness=10.0+absDen*18.0;float figShape=exp(-d*d*sharpness);
  float shape=mix(coreShape,figShape,vMorph);float alpha=shape*vAlpha;if(alpha<0.002)discard;
  gl_FragColor=vec4(vec3(0.65),alpha);
}`;

      // Points geometry
      const pGeo = new THREE.BufferGeometry();
      const refs = new Float32Array(N * 2);
      const dummyPos = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) {
        refs[i * 2] = (i % SIZE) / SIZE;
        refs[i * 2 + 1] = Math.floor(i / SIZE) / SIZE;
      }
      pGeo.setAttribute('position', new THREE.BufferAttribute(dummyPos, 3));
      pGeo.setAttribute('aRef', new THREE.BufferAttribute(refs, 2));

      const renderUniforms = {
        uPositions: { value: rtA.texture },
        uSilTargets: { value: silTargetTex },
        uPixelRatio: { value: Math.min(devicePixelRatio, 2) },
        uMorph: { value: 0 },
      };

      const renderMat = new THREE.ShaderMaterial({
        vertexShader: renderVert,
        fragmentShader: renderFrag,
        uniforms: renderUniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      const pts = new THREE.Points(pGeo, renderMat);
      scene.add(pts);

      // Multi-figure composition
      const budgetMul = isMobile ? 0.5 : 1.0;
      const FIGURES = [
        { src: '/images/fig-hand.jpg', cx: -0.04, cy: 0.02, h3d: 115, budget: Math.floor(52000 * budgetMul) },
        { src: '/images/fig-press.jpg', cx: 0.20, cy: 0.04, h3d: 105, budget: Math.floor(46000 * budgetMul) },
        { src: '/images/fig-stipple.jpg', cx: -0.26, cy: -0.12, h3d: 75, budget: Math.floor(26000 * budgetMul) },
        { src: '/images/fig-stipple.jpg', cx: 0.35, cy: -0.20, h3d: 58, budget: Math.floor(18000 * budgetMul) },
        { src: '/images/fig-stipple.jpg', cx: 0.52, cy: 0.13, h3d: 42, budget: Math.floor(13000 * budgetMul) },
        { src: '/images/fig-press.jpg', cx: -0.50, cy: 0.04, h3d: 28, budget: Math.floor(6000 * budgetMul) },
      ];
      let totalBudget = 0;
      for (const fig of FIGURES) totalBudget += fig.budget;
      const DISSOLVE_BUDGET = Math.floor(N * 0.22);

      function sampleFigure(px: Uint8ClampedArray, W: number, H: number, fig: typeof FIGURES[0], offset: number): number {
        let sumW = 0, sumX = 0, sumY = 0;
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
          const idx = (y * W + x) * 4;
          const dk = 1 - (px[idx] + px[idx + 1] + px[idx + 2]) / (3 * 255);
          if (dk > 0.05) { sumX += x * dk; sumY += y * dk; sumW += dk; }
        }
        if (sumW < 1) return 0;
        const cenX = sumX / sumW, cenY = sumY / sumW;
        let maxR = 0;
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
          const idx = (y * W + x) * 4;
          const dk = 1 - (px[idx] + px[idx + 1] + px[idx + 2]) / (3 * 255);
          if (dk > 0.10) { const d = Math.sqrt((x - cenX) ** 2 + (y - cenY) ** 2); if (d > maxR) maxR = d; }
        }
        const s3d = fig.h3d / H, worldSpan = 320;
        const offX = fig.cx * worldSpan, offY = fig.cy * worldSpan * 0.6, offZ = (Math.random() - 0.5) * 15;
        const sizeRatio = fig.h3d / 155;
        const bodyTarget = Math.floor(fig.budget * 0.60);
        let placed = 0, attempts = 0;
        const maxAtt = fig.budget * 600;
        const vigR = maxR * 1.7;

        while (placed < bodyTarget && attempts < maxAtt) {
          const ix = Math.floor(Math.random() * W), iy = Math.floor(Math.random() * H);
          const idx = (iy * W + ix) * 4;
          const darkness = 1 - (px[idx] + px[idx + 1] + px[idx + 2]) / (3 * 255);
          const dx = (ix - cenX) / vigR, dy = (iy - cenY) / vigR;
          let vignette = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy));
          vignette = vignette ** 3;
          const prob = darkness * darkness * vignette * 4.5;
          if (darkness > 0.03 && Math.random() < prob) {
            let x3d = (ix - cenX) * s3d + offX, y3d = -(iy - cenY) * s3d + offY;
            const edgeness = (1 - darkness) * (1 + Math.sqrt(dx * dx + dy * dy) * vigR * 2 / vigR);
            const scatter = edgeness * edgeness * 5.0 * sizeRatio;
            x3d += (Math.random() - 0.5) * scatter;
            y3d += (Math.random() - 0.5) * scatter;
            const zRange = (6 * Math.sqrt(darkness) + scatter * 0.3) * sizeRatio;
            const z3d = (Math.random() * 2 - 1) * zRange + offZ;
            const pi = offset + placed;
            silTargetData[pi * 4] = x3d;
            silTargetData[pi * 4 + 1] = y3d;
            silTargetData[pi * 4 + 2] = z3d;
            silTargetData[pi * 4 + 3] = Math.pow(darkness, 0.4) * vignette;
            placed++;
          }
          attempts++;
        }

        // Dissolve particles
        const dissTarget = Math.floor(fig.budget * 0.10);
        let dissPlaced = 0;
        attempts = 0;
        while (dissPlaced < dissTarget && attempts < maxAtt) {
          const ix = Math.floor(Math.random() * W), iy = Math.floor(Math.random() * H);
          const idx = (iy * W + ix) * 4;
          const darkness = 1 - (px[idx] + px[idx + 1] + px[idx + 2]) / (3 * 255);
          if (darkness > 0.02 && darkness < 0.40) {
            const pushR = (6 + Math.random() * 45) * sizeRatio;
            const pushA = Math.random() * Math.PI * 2;
            const x3d = (ix - cenX) * s3d + offX + Math.cos(pushA) * pushR;
            const y3d = -(iy - cenY) * s3d + offY + Math.sin(pushA) * pushR * 0.7;
            const z3d = (Math.random() - 0.5) * pushR * 1.2 + offZ;
            const pi = offset + placed + dissPlaced;
            silTargetData[pi * 4] = x3d;
            silTargetData[pi * 4 + 1] = y3d;
            silTargetData[pi * 4 + 2] = z3d;
            silTargetData[pi * 4 + 3] = darkness * 0.15;
            dissPlaced++;
          }
          attempts++;
        }

        // Orbit particles
        const orbitTarget = fig.budget - bodyTarget - dissTarget;
        let orbitPlaced = 0;
        attempts = 0;
        while (orbitPlaced < orbitTarget && attempts < maxAtt) {
          const ix = Math.floor(Math.random() * W), iy = Math.floor(Math.random() * H);
          const idx = (iy * W + ix) * 4;
          const darkness = 1 - (px[idx] + px[idx + 1] + px[idx + 2]) / (3 * 255);
          if (darkness > 0.08) {
            let x3d = (ix - cenX) * s3d + offX, y3d = -(iy - cenY) * s3d + offY;
            const orbitR = (3 + Math.random() * 12) * sizeRatio;
            const orbitA = Math.random() * Math.PI * 2;
            x3d += Math.cos(orbitA) * orbitR;
            y3d += Math.sin(orbitA) * orbitR * 0.7;
            const z3d = (Math.random() - 0.5) * orbitR * 1.5 + offZ;
            const pi = offset + placed + dissPlaced + orbitPlaced;
            silTargetData[pi * 4] = x3d;
            silTargetData[pi * 4 + 1] = y3d;
            silTargetData[pi * 4 + 2] = z3d;
            silTargetData[pi * 4 + 3] = -(0.05 + Math.random() * 0.35);
            orbitPlaced++;
          }
          attempts++;
        }
        return placed + dissPlaced + orbitPlaced;
      }

      // Load figure images and build composition
      const srcSet = new Set(FIGURES.map((f) => f.src));
      const loaded: Record<string, HTMLImageElement> = {};
      let loadCount = 0;
      const srcList = Array.from(srcSet);

      function onAllLoaded() {
        let placed = 0;
        for (const fig of FIGURES) {
          const img = loaded[fig.src];
          if (!img) continue;
          const maxDim = Math.max(400, Math.min(600, fig.h3d * 4));
          const sc = maxDim / Math.max(img.width, img.height);
          const W = Math.round(img.width * sc), H = Math.round(img.height * sc);
          const cvs = document.createElement('canvas');
          cvs.width = W; cvs.height = H;
          const ctx = cvs.getContext('2d')!;
          ctx.translate(W, 0); ctx.scale(-1, 1);
          ctx.drawImage(img, 0, 0, W, H);
          const imgData = ctx.getImageData(0, 0, W, H);
          placed += sampleFigure(imgData.data, W, H, fig, placed);
        }
        // Dissolve fill
        const dissEnd = placed + DISSOLVE_BUDGET;
        while (placed < dissEnd) {
          const rf = FIGURES[Math.floor(Math.random() * FIGURES.length)];
          const r = Math.random();
          let bx: number, by: number, bz: number;
          if (r < 0.35) {
            bx = rf.cx * 320 + (Math.random() - 0.5) * rf.h3d * 1.2;
            by = rf.cy * 320 * 0.6 + (Math.random() - 0.5) * rf.h3d * 0.8;
            bz = (Math.random() - 0.5) * rf.h3d * 0.5;
          } else if (r < 0.70) {
            bx = rf.cx * 320 + (Math.random() - 0.5) * 180;
            by = rf.cy * 320 * 0.6 + (Math.random() - 0.5) * 120;
            bz = (Math.random() - 0.5) * 50;
          } else {
            const rf2 = FIGURES[Math.floor(Math.random() * FIGURES.length)];
            const ang = Math.random() * Math.PI * 2;
            const dist = 60 + Math.random() * 160;
            bx = rf2.cx * 320 + Math.cos(ang) * dist;
            by = rf2.cy * 320 * 0.6 + Math.sin(ang) * dist * 0.7;
            bz = (Math.random() - 0.5) * 70;
          }
          silTargetData[placed * 4] = bx;
          silTargetData[placed * 4 + 1] = by;
          silTargetData[placed * 4 + 2] = bz;
          silTargetData[placed * 4 + 3] = 0.02 + Math.random() * 0.10;
          placed++;
        }
        // Ambient fill
        while (placed < N) {
          const rff = FIGURES[Math.floor(Math.random() * FIGURES.length)];
          const aAng = Math.random() * Math.PI * 2;
          const aDist = 20 + Math.random() * 200;
          silTargetData[placed * 4] = rff.cx * 320 + Math.cos(aAng) * aDist;
          silTargetData[placed * 4 + 1] = rff.cy * 320 * 0.6 + Math.sin(aAng) * aDist * 0.7;
          silTargetData[placed * 4 + 2] = (Math.random() - 0.5) * 80;
          silTargetData[placed * 4 + 3] = -1.0;
          placed++;
        }
        silTargetTex = createDataTex(silTargetData);
        simMat.uniforms.uSilTargets.value = silTargetTex;
        renderUniforms.uSilTargets.value = silTargetTex;
      }

      for (const src of srcList) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          loaded[src] = img;
          loadCount++;
          if (loadCount === srcList.length) onAllLoaded();
        };
        img.onerror = () => {
          loadCount++;
          if (loadCount === srcList.length) onAllLoaded();
        };
        img.src = src;
      }

      // Post-processing
      scene.add(new THREE.AmbientLight(0xffffff, 1.0));
      const bloomPass = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.05, 0.4, 0.98);
      const composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      composer.addPass(bloomPass);

      // Animation loop
      let time = 0;
      let rotAngle = 0;
      let flip = false;
      let animId: number;
      const mouseNDC = new THREE.Vector2();
      let mouseActive = false;
      let mouseTimer: ReturnType<typeof setTimeout>;
      const raycaster = new THREE.Raycaster();

      const onMouseMove = (e: MouseEvent) => {
        mouseNDC.x = (e.clientX / innerWidth) * 2 - 1;
        mouseNDC.y = -(e.clientY / innerHeight) * 2 + 1;
        mouseActive = true;
        clearTimeout(mouseTimer);
        mouseTimer = setTimeout(() => { mouseActive = false; }, 200);
      };
      document.addEventListener('mousemove', onMouseMove);

      function animate() {
        if (disposed) return;
        animId = requestAnimationFrame(animate);
        time += 0.0018;
        rotAngle += 0.0002;

        simMat.uniforms.uPositions.value = flip ? rtB.texture : rtA.texture;
        simMat.uniforms.uTime.value = time;
        simMat.uniforms.uMorph.value = 0; // Landing = no morph
        simMat.uniforms.uRotAngle.value = rotAngle;

        if (mouseActive) {
          raycaster.setFromCamera(mouseNDC, camera);
          const rd = raycaster.ray.direction, ro = raycaster.ray.origin;
          let t = -ro.z / rd.z;
          if (t < 0) t = 420;
          simMat.uniforms.uMouse3D.value.set(ro.x + rd.x * t, ro.y + rd.y * t, 0);
          simMat.uniforms.uMouseActive.value = 1;
        } else {
          simMat.uniforms.uMouseActive.value = 0;
        }

        renderer.setRenderTarget(flip ? rtA : rtB);
        renderer.render(simScene, simCamera);
        renderer.setRenderTarget(null);

        renderUniforms.uPositions.value = flip ? rtA.texture : rtB.texture;
        renderUniforms.uMorph.value = 0;
        flip = !flip;

        bloomPass.strength = 0.03;
        composer.render();
      }
      animate();

      // Resize handler
      const onResize = () => {
        camera.aspect = innerWidth / innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(innerWidth, innerHeight);
        composer.setSize(innerWidth, innerHeight);
        renderUniforms.uPixelRatio.value = Math.min(devicePixelRatio, 2);
      };
      window.addEventListener('resize', onResize);

      // Cleanup
      return () => {
        disposed = true;
        cancelAnimationFrame(animId);
        document.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('resize', onResize);
        renderer.dispose();
        rtA.dispose();
        rtB.dispose();
        pGeo.dispose();
        renderMat.dispose();
        simMat.dispose();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      };
    }

    let cleanup: (() => void) | undefined;
    init().then((fn) => {
      cleanup = fn;
    });

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 z-0" aria-hidden="true" />;
}
