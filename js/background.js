/* Standalone renderer for the source site's configured Bokeh background.
   Uses the original GLSL equations and configuration with a plain WebGL renderer.
   The noise shader retains its original attribution and MIT license notice. */
(() => {
  const scope=window.auctaPage;
  const ResizeObserver=scope ? scope.Observer(window.ResizeObserver) : window.ResizeObserver;
  const IntersectionObserver=scope ? scope.Observer(window.IntersectionObserver) : window.IntersectionObserver;
  const requestAnimationFrame=scope ? scope.frame.bind(scope) : window.requestAnimationFrame.bind(window);
  const setTimeout=scope ? scope.timer.bind(scope) : window.setTimeout.bind(window);
  const scopeOn=(target,...args)=>scope ? scope.on(target,...args) : target.addEventListener(...args);

  const shaders = {
    particleVertex: `
//
// GLSL textureless classic 3D noise "cnoise",
// with an RSL-style periodic variant "pnoise".
// Author:  Stefan Gustavson (stefan.gustavson@liu.se)
// Version: 2011-10-11
//
// Many thanks to Ian McEwan of Ashima Arts for the
// ideas for permutation and gradient selection.
//
// Copyright (c) 2011 Stefan Gustavson. All rights reserved.
// Distributed under the MIT license. See LICENSE file.
// https://github.com/ashima/webgl-noise
//

vec3 mod289_3843310594(vec3 x)
{
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289_3843310594(vec4 x)
{
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute_3843310594(vec4 x)
{
  return mod289_3843310594(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt_3843310594(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

vec3 fade_3843310594(vec3 t) {
  return t*t*t*(t*(t*6.0-15.0)+10.0);
}

// Classic Perlin noise
float cnoise(vec3 P)
{
  vec3 Pi0 = floor(P); // Integer part for indexing
  vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
  Pi0 = mod289_3843310594(Pi0);
  Pi1 = mod289_3843310594(Pi1);
  vec3 Pf0 = fract(P); // Fractional part for interpolation
  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute_3843310594(permute_3843310594(ix) + iy);
  vec4 ixy0 = permute_3843310594(ixy + iz0);
  vec4 ixy1 = permute_3843310594(ixy + iz1);

  vec4 gx0 = ixy0 * (1.0 / 7.0);
  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 * (1.0 / 7.0);
  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

  vec4 norm0 = taylorInvSqrt_3843310594(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt_3843310594(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade_3843310594(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
  return 2.2 * n_xyz;
}

attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec2 aUv;

attribute vec3 aOffset;
attribute vec4 aParticle;
attribute vec2 aDelayDuration;

uniform float uTime;
uniform float uDistortionTime;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform vec3 uStart;
uniform vec3 uEnd;
uniform float uSize;
uniform float uSeed;
uniform vec4 uPath;
uniform float uOffset;

varying vec2 vUv;
varying vec3 vPosition;
varying vec4 vParticle;

void main() {
  float p = mod((uTime + aDelayDuration.x), aDelayDuration.y) / aDelayDuration.y;

  vec3 pathPosition = mix(uStart, uEnd, p);

  vec3 position = pathPosition;

  float n1 = cnoise(vec3(p + uDistortionTime, uSeed, 0.0) * uPath.x);
  float n2 = cnoise(vec3(p + uDistortionTime, uSeed, 0.0) * uPath.z);

  position.y += n1 * uPath.y;
  position.z += n2 * uPath.w;

  float n3 = n2 * 0.5 + 0.3;

  position += aOffset * n3 * uOffset;

  float n = cnoise(position * 0.1);

  position.z += n * 4.0;

  position += aPosition * uSize * aParticle.x * n;

  vUv = aUv;
  vPosition = position;
  vParticle = aParticle;

  gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(position, 1.0);
}
`,
    particleFragment: `
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uAlpha;

varying vec2 vUv;
varying vec3 vPosition;
varying vec4 vParticle;

float circle(vec2 uv, vec2 blur, float r) {
  vec2 dist = uv - vec2(0.5);

  return 1.0 - smoothstep(r - (r * blur.x), r + (r * blur.y), dot(dist, dist) * 4.0);
}

float map(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

void main() {
  float depth = abs(map(vPosition.z, -160., 160., 0., 1.));
  depth *= depth;

  float radius = 0.5;
  float innerBlur = vParticle.y + 0.5 * depth;
  float outerBlur = vParticle.z + 0.5 * depth;
  // float innerBlur = vParticle.y;
  // float outerBlur = vParticle.z;
  vec2 blur = vec2(innerBlur, outerBlur);

  float a = circle(vUv, blur, radius);

  // if (a < 0.1) {
  //   discard;
  // }

  vec3 color = mix(uColor1, uColor2, vParticle.w);

  gl_FragColor = vec4(color * a * vParticle.w * uAlpha, a * uAlpha);
}
`,
    lightVertex: `
attribute vec3 aPosition;
attribute vec2 aUv;

varying vec2 vUv;

void main() {
  vec3 position = aPosition;

  vUv = aUv;

  gl_Position = vec4(position, 1.0);
}
`,
    lightFragment: `
//
// GLSL textureless classic 3D noise "cnoise",
// with an RSL-style periodic variant "pnoise".
// Author:  Stefan Gustavson (stefan.gustavson@liu.se)
// Version: 2011-10-11
//
// Many thanks to Ian McEwan of Ashima Arts for the
// ideas for permutation and gradient selection.
//
// Copyright (c) 2011 Stefan Gustavson. All rights reserved.
// Distributed under the MIT license. See LICENSE file.
// https://github.com/ashima/webgl-noise
//

vec3 mod289_1828402684(vec3 x)
{
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289_1828402684(vec4 x)
{
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute_1828402684(vec4 x)
{
  return mod289_1828402684(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt_1828402684(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

vec3 fade_1828402684(vec3 t) {
  return t*t*t*(t*(t*6.0-15.0)+10.0);
}

// Classic Perlin noise
float cnoise(vec3 P)
{
  vec3 Pi0 = floor(P); // Integer part for indexing
  vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
  Pi0 = mod289_1828402684(Pi0);
  Pi1 = mod289_1828402684(Pi1);
  vec3 Pf0 = fract(P); // Fractional part for interpolation
  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute_1828402684(permute_1828402684(ix) + iy);
  vec4 ixy0 = permute_1828402684(ixy + iz0);
  vec4 ixy1 = permute_1828402684(ixy + iz1);

  vec4 gx0 = ixy0 * (1.0 / 7.0);
  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 * (1.0 / 7.0);
  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

  vec4 norm0 = taylorInvSqrt_1828402684(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt_1828402684(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade_1828402684(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
  return 2.2 * n_xyz;
}

#define PI 3.141592653589793

uniform float uTime;

uniform vec3 uColor;
uniform float uIntensity;
uniform float uAngle;
uniform float uPosition;

varying vec2 vUv;

const highp float NOISE_GRANULARITY = 0.5/255.0;

highp float random(vec2 coords) {
  return fract(sin(dot(coords.xy, vec2(12.9898,78.233))) * 43758.5453);
}

vec2 rotate(vec2 uv,float amount){
  float ca = cos(amount);
  float sa = sin(amount);

  return vec2(
    uv.x * ca + uv.y * sa,
    -uv.x * sa + uv.y * ca
  );
}

void main() {
  vec2 coord = vUv - vec2(0.5);
  coord = rotate(coord, uAngle);
  coord += vec2(0.5);

  float n = cnoise(vec3(coord * vec2(8.0, 1.0), uTime * 0.25));
  n = n * 0.5 + 0.5;
  n *= vUv.y * vUv.y;

  float c = 0.;
  c = mix(0.0, 1.0, smoothstep(0.0, uPosition, vUv.x));
  c = mix(c, 0.0, smoothstep(uPosition, 1.0, vUv.x));

  n *= c * uIntensity;

  n += mix(-NOISE_GRANULARITY, NOISE_GRANULARITY, random(vUv));

  gl_FragColor = vec4(uColor, n);
}
`
  };
  const map = (value, low, high, start, end) => start + (value - low) / (high - low) * (end - start);
  document.querySelectorAll('[data-aucta-background]').forEach(section => {
    const config = JSON.parse(section.dataset.auctaBackground);
    const holder = section.querySelector('.background-fx-canvas');
    if (!holder) return;
    const initialize = () => {
    if(scope?.disposed)return;
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    Object.assign(canvas.style, {width:'100%', height:'100%', display:'block'});
    holder.append(canvas);
    const gl = canvas.getContext('webgl', {alpha:false, antialias:true});
    if (!gl) return;
    const makeProgram = (vertex, fragment) => {
      const program = gl.createProgram();
      [[gl.VERTEX_SHADER, vertex], [gl.FRAGMENT_SHADER, 'precision highp float;\n' + fragment]].forEach(([type, code]) => {
        const shader = gl.createShader(type); gl.shaderSource(shader, code); gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
        gl.attachShader(program, shader);
      });
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
      return program;
    };
    let particleProgram, lightProgram;
    try { particleProgram = makeProgram(shaders.particleVertex, shaders.particleFragment); lightProgram = makeProgram(shaders.lightVertex, shaders.lightFragment); }
    catch (error) { console.error('AUCTA background shader:', error.message); return; }
    const colorContext = document.createElement('canvas').getContext('2d');
    const color = value => {
      const palette = value?.sitePaletteColor;
      const css = palette ? `hsla(${getComputedStyle(document.documentElement).getPropertyValue('--'+(palette.id || palette.colorName)+'-hsl')},${palette.alpha ?? 1})` : value || '#000';
      colorContext.fillStyle = css; colorContext.fillRect(0,0,1,1);
      return [...colorContext.getImageData(0,0,1,1).data].slice(0,3).map(channel=>channel/255);
    };
    const count = Math.floor(map(config.count || 0,0,100,0,100000));
    const positions = [], uvs = [], offsets = [], particles = [], delays = [];
    const quad = [[-.5,.5,0,0,1],[-.5,-.5,0,0,0],[.5,.5,0,1,1],[.5,.5,0,1,1],[-.5,-.5,0,0,0],[.5,-.5,0,1,0]];
    const random = (min,max) => min + Math.random()*(max-min);
    for (let index=0;index<count;index++) {
      const offset=[random(-1,1),random(-1,1),random(-1,1)];
      const particle=[random(.1,1),random(.25,.75),random(.25,.75),random(0,1)];
      const delay=[random(0,1),random(.5,1)];
      quad.forEach(point=>{positions.push(...point.slice(0,3));uvs.push(...point.slice(3));offsets.push(...offset);particles.push(...particle);delays.push(...delay)});
    }
    const attribute = (program,name,size,data) => {
      const location=gl.getAttribLocation(program,name);if(location<0)return null;
      const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);
      return {location,buffer,size};
    };
    const particleAttributes=[attribute(particleProgram,'aPosition',3,positions),attribute(particleProgram,'aUv',2,uvs),attribute(particleProgram,'aOffset',3,offsets),attribute(particleProgram,'aParticle',4,particles),attribute(particleProgram,'aDelayDuration',2,delays)].filter(Boolean);
    const lightAttributes=[attribute(lightProgram,'aPosition',3,[-1,1,0,-1,-1,0,1,1,0,1,1,0,-1,-1,0,1,-1,0]),attribute(lightProgram,'aUv',2,[0,1,0,0,1,1,1,1,0,0,1,0])].filter(Boolean);
    const maxAttributes = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
    const locations = new Map();
    const enable = attributes => {
      for(let index=0;index<maxAttributes;index++)gl.disableVertexAttribArray(index);
      attributes.forEach(({location,buffer,size})=>{gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.enableVertexAttribArray(location);gl.vertexAttribPointer(location,size,gl.FLOAT,false,0,0)});
    };
    const uniform = (program,name,value) => {
      let cache=locations.get(program);if(!cache){cache=new Map();locations.set(program,cache)}
      if(!cache.has(name))cache.set(name,gl.getUniformLocation(program,name));
      const location=cache.get(name);if(location===null)return;
      if(typeof value==='number')gl.uniform1f(location,value);
      else if(value.length===16)gl.uniformMatrix4fv(location,false,new Float32Array(value));
      else if(value.length===4)gl.uniform4fv(location,value);
      else gl.uniform3fv(location,value);
    };
    const palette={background:color(config.backgroundColor),first:color(config.color1),second:color(config.color2),light:color(config.color3)};
    const identity=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
    let paused=matchMedia('(prefers-reduced-motion: reduce)').matches, visible=true, time=0, distortionTime=0, previous=performance.now(), frame;
    const draw = now => {
      const elapsed=Math.min((now-previous)/1000,.1);previous=now;
      if(!paused && visible){time+=elapsed*map(config.speed||0,-100,100,-.01,.01);distortionTime+=elapsed*map(config.distortionSpeed||0,-100,100,-.01,.01)}
      if(visible){
        const ratio=Math.min(devicePixelRatio,1.5),width=Math.max(1,Math.round(holder.clientWidth*ratio)),height=Math.max(1,Math.round(holder.clientHeight*ratio));
        if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height}
        gl.viewport(0,0,width,height);const clear=palette.background;gl.clearColor(...clear,1);gl.clear(gl.COLOR_BUFFER_BIT);gl.disable(gl.DEPTH_TEST);gl.enable(gl.BLEND);gl.blendEquation(gl.FUNC_ADD);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
        const aspect=width/height,f=1/Math.tan(20*Math.PI/180),near=1,far=10000;
        const projection=[f/aspect,0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,0,0,2*far*near/(near-far),0];
        const view=[...identity];view[14]=-100;const span=Math.max(200/f*aspect,200/f);
        gl.useProgram(particleProgram);enable(particleAttributes);
        const values={uTime:time,uDistortionTime:distortionTime,uModelMatrix:identity,uViewMatrix:view,uProjectionMatrix:projection,uStart:[-.75*span,0,0],uEnd:[.75*span,0,0],uSize:map(config.size||1,1,100,1,32),uSeed:config.seed||0,uPath:[map(config.complexityY||0,0,100,0,6),map(config.amplitudeY||0,0,100,0,100),map(config.complexityZ||0,0,100,0,6),map(config.amplitudeZ||0,0,100,0,100)],uOffset:map(config.offset||0,0,100,1,60),uColor1:palette.first,uColor2:palette.second,uAlpha:map(config.alpha||0,1,100,.01,1)};
        Object.entries(values).forEach(([name,value])=>uniform(particleProgram,name,value));gl.drawArrays(gl.TRIANGLES,0,count*6);
        gl.useProgram(lightProgram);enable(lightAttributes);
        Object.entries({uTime:time,uColor:palette.light,uIntensity:map(config.lightIntensity||0,0,100,0,1),uAngle:map(config.lightAngle||0,0,100,-.3*Math.PI,.3*Math.PI),uPosition:map(config.lightX||0,0,100,0,1)}).forEach(([name,value])=>uniform(lightProgram,name,value));gl.drawArrays(gl.TRIANGLES,0,6);gl.disable(gl.BLEND);
      }
      frame=null;
      if(!paused && visible && !document.hidden) frame=requestAnimationFrame(draw);
    };
    const resume = () => {
      cancelAnimationFrame(frame);frame=null;previous=performance.now();
      if(visible && !document.hidden) frame=requestAnimationFrame(draw);
    };
    new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;resume()}).observe(section);
    scopeOn(document,"visibilitychange",resume);
    frame=requestAnimationFrame(draw);
    scopeOn(window,'pagehide',()=>cancelAnimationFrame(frame));
    scopeOn(window,'pageshow',event=>{if(event.persisted){previous=performance.now();frame=requestAnimationFrame(draw)}});
    };
    // The effect is below the fold. Keep its configured base color visible while
    // avoiding shader/context initialization during the first page paint.
    if ('IntersectionObserver' in window) {
      const wake = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) { wake.disconnect();
          // Let navigation and the first visible content finish before compiling shaders.
          requestAnimationFrame(() => requestAnimationFrame(() => {
            if ('requestIdleCallback' in window) requestIdleCallback(initialize,{timeout:1500});
            else setTimeout(initialize,200);
          }));
        }
      }, {rootMargin:'300px'});
      wake.observe(section);
    } else initialize();
  });
})();
