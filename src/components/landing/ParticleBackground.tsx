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

      // Initial positions — center-dense sphere
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

      // Silhouette target positions
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

      // Render shader — with hand glow effect
      const renderVert = `attribute vec2 aRef;uniform sampler2D uPositions;uniform sampler2D uSilTargets;
uniform float uPixelRatio;uniform float uMorph;uniform float uHandReveal;
varying float vAlpha;varying float vDensity;varying float vMorph;varying float vHandGlow;
void main(){
  vec4 posData=texture2D(uPositions,aRef);vec4 silData=texture2D(uSilTargets,aRef);
  vec3 pos=posData.xyz;vec4 mvPos=modelViewMatrix*vec4(pos,1.0);gl_Position=projectionMatrix*mvPos;
  float mp=uMorph*uMorph*(3.0-2.0*uMorph);vMorph=mp;
  float density=silData.w;float absDen=max(density,0.0);float isAmb=step(density,-0.5);
  float isOrb=step(-0.5,density)*step(density,-0.01);
  // Hand glow: particles in upper area (fingertips) get extra brightness
  float handY=silData.y;float handGlowRaw=smoothstep(20.0,80.0,handY)*absDen;
  vHandGlow=handGlowRaw*uHandReveal*mp;
  float coreSize=3.0;float figSize=1.8+absDen*1.2+vHandGlow*1.5;float orbSize=1.2+abs(density)*1.6;float ambSize=0.8;
  float unmaskSize=mix(mix(figSize,orbSize,isOrb),ambSize,isAmb);float sz=mix(coreSize,unmaskSize,mp);
  float depthScale=340.0/max(-mvPos.z,100.0);gl_PointSize=sz*uPixelRatio*depthScale;gl_PointSize=max(gl_PointSize,0.5);
  float coreAlpha=mix(0.15,0.35,posData.w);float figAlpha=0.2+absDen*0.35+vHandGlow*0.3;
  float orbAlpha=0.06+abs(density)*0.18;float ambAlpha=0.03;
  float unmaskAlpha=mix(mix(figAlpha,orbAlpha,isOrb),ambAlpha,isAmb);
  vAlpha=mix(coreAlpha,max(unmaskAlpha,0.01),mp);vDensity=density;
}`;

      const renderFrag = `varying float vAlpha;varying float vDensity;varying float vMorph;varying float vHandGlow;
void main(){
  float d=length(gl_PointCoord-0.5);if(d>0.5)discard;
  float absDen=max(vDensity,0.0);
  float core=1.0-smoothstep(0.0,0.12,d);float glow=1.0-smoothstep(0.0,0.5,d);glow*=glow;float coreShape=core*0.6+glow*0.5;
  float sharpness=10.0+absDen*18.0;float figShape=exp(-d*d*sharpness);
  float shape=mix(coreShape,figShape,vMorph);float alpha=shape*vAlpha;if(alpha<0.002)discard;
  // Hand glow: warm white with slight warmth
  vec3 baseCol=vec3(0.65);
  vec3 handCol=vec3(0.85,0.82,0.78);
  vec3 col=mix(baseCol,handCol,vHandGlow);
  gl_FragColor=vec4(col,alpha);
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
        uHandReveal: { value: 0 },
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

      // === Build hand as primary figure + supporting figures ===
      const budgetMul = isMobile ? 0.5 : 1.0;

      // Hand figure gets the biggest budget — center of composition
      const HAND_BUDGET = Math.floor(80000 * budgetMul);
      // Supporting ambient figures
      const FIGURES = [
        { src: '/images/fig-hand.jpg', cx: -0.30, cy: 0.05, h3d: 70, budget: Math.floor(22000 * budgetMul) },
        { src: '/images/fig-press.jpg', cx: 0.32, cy: -0.10, h3d: 60, budget: Math.floor(18000 * budgetMul) },
        { src: '/images/fig-stipple.jpg', cx: -0.48, cy: -0.18, h3d: 40, budget: Math.floor(10000 * budgetMul) },
        { src: '/images/fig-stipple.jpg', cx: 0.50, cy: 0.15, h3d: 30, budget: Math.floor(8000 * budgetMul) },
      ];
      const DISSOLVE_BUDGET = Math.floor(N * 0.15);

      function sampleFromImageData(
        px: Uint8ClampedArray, W: number, H: number,
        offX: number, offY: number, offZ: number,
        h3d: number, budget: number, sizeRatio: number, offset: number
      ): number {
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
        const s3d = h3d / H;
        const bodyTarget = Math.floor(budget * 0.65);
        let placed = 0, attempts = 0;
        const maxAtt = budget * 600;
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
            const edgeness = (1 - darkness) * (1 + Math.sqrt(dx * dx + dy * dy) * 2);
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

        // Dissolve around edges
        const dissTarget = Math.floor(budget * 0.20);
        let dissPlaced = 0;
        attempts = 0;
        while (dissPlaced < dissTarget && attempts < maxAtt) {
          const ix = Math.floor(Math.random() * W), iy = Math.floor(Math.random() * H);
          const idx = (iy * W + ix) * 4;
          const darkness = 1 - (px[idx] + px[idx + 1] + px[idx + 2]) / (3 * 255);
          if (darkness > 0.02 && darkness < 0.40) {
            const pushR = (6 + Math.random() * 35) * sizeRatio;
            const pushA = Math.random() * Math.PI * 2;
            const x3d = (ix - cenX) * s3d + offX + Math.cos(pushA) * pushR;
            const y3d = -(iy - cenY) * s3d + offY + Math.sin(pushA) * pushR * 0.7;
            const z3d = (Math.random() - 0.5) * pushR * 1.2 + offZ;
            const pi = offset + placed + dissPlaced;
            silTargetData[pi * 4] = x3d;
            silTargetData[pi * 4 + 1] = y3d;
            silTargetData[pi * 4 + 2] = z3d;
            silTargetData[pi * 4 + 3] = darkness * 0.12;
            dissPlaced++;
          }
          attempts++;
        }

        // Orbit particles
        const orbitTarget = budget - bodyTarget - dissTarget;
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
            x3d += Math.cos(orbitA) * orbitR; y3d += Math.sin(orbitA) * orbitR * 0.7;
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

      // === Load hand image + supporting figures ===
      const HAND_IMG_SRC = '/images/hand-front.PNG.png';
      const srcSet = new Set(FIGURES.map((f) => f.src));
      const allSrcs = [HAND_IMG_SRC, ...Array.from(srcSet)];
      const loadedImgs: Record<string, HTMLImageElement> = {};
      let loadCount = 0;

      function onAllLoaded() {
        // Sample hand image as primary figure
        let placed = 0;
        const handImg = loadedImgs[HAND_IMG_SRC];
        if (handImg) {
          const maxDim = 700;
          const sc = maxDim / Math.max(handImg.width, handImg.height);
          const W = Math.round(handImg.width * sc);
          const H = Math.round(handImg.height * sc);
          const cvs = document.createElement('canvas');
          cvs.width = W; cvs.height = H;
          const ctx = cvs.getContext('2d')!;
          ctx.drawImage(handImg, 0, 0, W, H);
          const imgData = ctx.getImageData(0, 0, W, H);
          placed = sampleFromImageData(
            imgData.data, W, H,
            0, 15, 0,
            180,
            HAND_BUDGET,
            1.0,
            0
          );
        }

        // Supporting figures
        let currentOffset = placed;
        for (const fig of FIGURES) {
          const img = loadedImgs[fig.src];
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
          const worldSpan = 320;
          currentOffset += sampleFromImageData(
            imgData.data, W, H,
            fig.cx * worldSpan, fig.cy * worldSpan * 0.6, (Math.random() - 0.5) * 15,
            fig.h3d, fig.budget, fig.h3d / 155, currentOffset
          );
        }

        // Dissolve fill between figures
        const dissEnd = currentOffset + DISSOLVE_BUDGET;
        while (currentOffset < dissEnd && currentOffset < N) {
          const rf = FIGURES[Math.floor(Math.random() * FIGURES.length)];
          const r = Math.random();
          let bx: number, by: number, bz: number;
          if (r < 0.5) {
            // Between hand center and supporting figures
            const t = Math.random();
            bx = t * rf.cx * 320 + (Math.random() - 0.5) * 80;
            by = t * rf.cy * 320 * 0.6 + (Math.random() - 0.5) * 60;
            bz = (Math.random() - 0.5) * 40;
          } else {
            bx = rf.cx * 320 + (Math.random() - 0.5) * 160;
            by = rf.cy * 320 * 0.6 + (Math.random() - 0.5) * 100;
            bz = (Math.random() - 0.5) * 50;
          }
          silTargetData[currentOffset * 4] = bx;
          silTargetData[currentOffset * 4 + 1] = by;
          silTargetData[currentOffset * 4 + 2] = bz;
          silTargetData[currentOffset * 4 + 3] = 0.02 + Math.random() * 0.08;
          currentOffset++;
        }

        // Ambient fill
        while (currentOffset < N) {
          const aAng = Math.random() * Math.PI * 2;
          const aDist = 30 + Math.random() * 200;
          silTargetData[currentOffset * 4] = Math.cos(aAng) * aDist;
          silTargetData[currentOffset * 4 + 1] = Math.sin(aAng) * aDist * 0.7;
          silTargetData[currentOffset * 4 + 2] = (Math.random() - 0.5) * 80;
          silTargetData[currentOffset * 4 + 3] = -1.0;
          currentOffset++;
        }

        silTargetTex = createDataTex(silTargetData);
        simMat.uniforms.uSilTargets.value = silTargetTex;
        renderUniforms.uSilTargets.value = silTargetTex;
      }

      for (const src of allSrcs) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          loadedImgs[src] = img;
          loadCount++;
          if (loadCount === allSrcs.length) onAllLoaded();
        };
        img.onerror = () => {
          loadCount++;
          if (loadCount === allSrcs.length) onAllLoaded();
        };
        img.src = src;
      }

      // Post-processing
      scene.add(new THREE.AmbientLight(0xffffff, 1.0));
      const bloomPass = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.05, 0.4, 0.98);
      const composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      composer.addPass(bloomPass);

      // === Animation state ===
      let time = 0;
      let rotAngle = 0;
      let flip = false;
      let animId: number;
      const mouseNDC = new THREE.Vector2();
      let mouseActive = false;
      let mouseTimer: ReturnType<typeof setTimeout>;
      const raycaster = new THREE.Raycaster();

      // Morph animation timing
      const MORPH_DELAY = 1.5;      // seconds before morph starts
      const MORPH_DURATION = 4.0;   // seconds for full morph (스르르르륵)
      const HAND_GLOW_DELAY = 3.5;  // hand glow starts after morph is mostly done
      const HAND_GLOW_DURATION = 2.0;
      const startTime = performance.now() / 1000;

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

        const elapsed = performance.now() / 1000 - startTime;

        // Smooth morph: 0 → 1 over MORPH_DURATION after MORPH_DELAY
        let morphTarget = 0;
        if (elapsed > MORPH_DELAY) {
          const t = Math.min((elapsed - MORPH_DELAY) / MORPH_DURATION, 1);
          // Ease out expo for smooth "스르르르륵" feel
          morphTarget = 1 - Math.pow(1 - t, 3);
        }

        // Hand glow reveal: 0 → 1 (사라라락 effect on fingertips)
        let handReveal = 0;
        if (elapsed > HAND_GLOW_DELAY) {
          const t = Math.min((elapsed - HAND_GLOW_DELAY) / HAND_GLOW_DURATION, 1);
          handReveal = t * t; // ease-in for gentle appear
        }

        simMat.uniforms.uPositions.value = flip ? rtB.texture : rtA.texture;
        simMat.uniforms.uTime.value = time;
        simMat.uniforms.uMorph.value = morphTarget;
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
        renderUniforms.uMorph.value = morphTarget;
        renderUniforms.uHandReveal.value = handReveal;
        flip = !flip;

        // Bloom increases as hand forms
        bloomPass.strength = 0.03 + morphTarget * 0.04 + handReveal * 0.06;
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
