(()=>{var e,t,a={827:(e,t,a)=>{"use strict";var r=a(377),l=a.n(r),o=a(667),n=a(737),s=a(234);function i(e,t,a,r,l,o){let n=[e[0]+a,e[1]+r],s=t[0],i=t[1],h=t[2],c=t[3];function g(e){return Math.max(Math.min(e,.999),.001)}return n[0]==a&&0==Math.abs(s-c)&&console.log("0 diff 1"),n[0]==a+1&&0==Math.abs(i-h)&&console.log("0 diff 2"),n[1]==r&&0==Math.abs(s-i)&&console.log("0 diff 3"),n[1]==r+1&&0==Math.abs(c-h)&&console.log("0 diff 4"),n[0]==a&&0!=Math.abs(s-c)?[n[0],Math.floor(n[1])+g((s-l.height/o.layer_count)/(s-c))]:n[0]==a+1&&0!=Math.abs(i-h)?[n[0],Math.floor(n[1])+g((i-l.height/o.layer_count)/(i-h))]:n[1]==r&&0!=Math.abs(s-i)?[Math.floor(n[0])+g((s-l.height/o.layer_count)/(s-i)),n[1]]:n[1]==r+1&&0!=Math.abs(c-h)?[Math.floor(n[0])+g((c-l.height/o.layer_count)/(c-h)),n[1]]:(console.log("interpolation failed: ",n),n)}function h(e,t){function a(t,a){if(e.edges.has(t))for(let r=0;r<e.edges.get(t).length;r++)if(e.edges.get(t)[r]!=a&&e.edges.has(e.edges.get(t)[r]))return e.edges.get(t)[r];return null}let r=[];for(;e.edges.size>0;){let t=[],l=e.edges.keys().next().value,o=l;t.push(o);let n=e.edges.get(o)[0];t.push(n);let s=e.edges.get(o)[1];for(e.edges.delete(o);n!=l&&e.edges.has(n);){let r=a(n,o);r?(o=n,n=r,t.push(n),e.edges.delete(o)):e.edges.delete(n)}if(t[t.length-1]!=s&&console.log("loop failed",t[t.length-1],s),t.length>9){let e=c(t);r.push(e)}}!function(e,t,a){var r,l;if(0==e.length)return;let s=[],i=[],h=[],c=[],g=0;for(let r of e){for(let e=0;e<r.length;e++){i.push([e+g,(e+1)%r.length+g]),h.push([(r[e][0]-.5)*a.scale,(r[e][1]-.5)*a.scale,a.vscale*t.height/a.layer_count]),h.push([(r[e][0]-.5)*a.scale,(r[e][1]-.5)*a.scale,a.vscale*(t.height+1)/a.layer_count]);let l=2*g,o=(2*e+2)%(2*r.length)+l,n=(2*e+3)%(2*r.length)+l;c.push(2*e+l,o,2*e+1+l),c.push(2*e+1+l,o,n)}s=s.concat(r),g+=r.length}let f=o.Z.from(s);try{new n.Z(f,i)}catch(e){}let u=[],d=[];for(let e of i){let t=Math.max(s[e[0]][1],s[e[1]][1])+.001,a=Math.min(s[e[0]][1],s[e[1]][1])-.001;for(let r=Math.floor(a);r<=t;r++)null==d[r]&&(d[r]=[]),d[r].push(e)}for(let e=0;e<f.triangles.length;e+=3){let t=(s[f.triangles[e]][0]+s[f.triangles[e+1]][0]+s[f.triangles[e+2]][0])/3,a=(s[f.triangles[e]][1]+s[f.triangles[e+1]][1]+s[f.triangles[e+2]][1])/3,o=0;for(let e of null!==(r=d[Math.floor(a)])&&void 0!==r?r:[]){let r=s[e[0]],l=s[e[1]],n=l[1]-r[1],i=((l[0]-r[0])*(a-r[1])-(l[1]-r[1])*(t-r[0]))/n,h=(a-r[1])/n;i>0&&h>0&&h<=1&&o++}if(o%2!=0){t=(.9*s[f.triangles[e]][0]+1.1*s[f.triangles[e+1]][0]+s[f.triangles[e+2]][0])/3,a=(.9*s[f.triangles[e]][1]+1.1*s[f.triangles[e+1]][1]+s[f.triangles[e+2]][1])/3,o=0;for(let e of null!==(l=d[Math.floor(a)])&&void 0!==l?l:[]){let r=s[e[0]],l=s[e[1]],n=l[1]-r[1],i=((l[0]-r[0])*(a-r[1])-(l[1]-r[1])*(t-r[0]))/n,h=(a-r[1])/n;i>0&&h>0&&h<=1&&o++}o%2!=0&&u.push(f.triangles[e],f.triangles[e+2],f.triangles[e+1])}}let p=s.map((e=>[(e[0]-.5)*a.scale,(e[1]-.5)*a.scale,a.vscale*(t.height+1)/a.layer_count])).flat();u=u.concat(u.map((e=>e+p.length/3)).reverse()),p=p.concat(s.map((e=>[(e[0]-.5)*a.scale,(e[1]-.5)*a.scale,a.vscale*t.height/a.layer_count])).flat()),u=u.concat(c.map((e=>e+p.length/3))),p=p.concat(h.flat()),postMessage({type:"make_mesh",triangles_ids:u,verts_3d:p,color:t.color})}(r,e,t)}function c(e){return(e=e.map((e=>function(e){let t=e.split(" ");return[parseInt(t[0])/1e3,parseInt(t[1])/1e3]}(e)))).map(((t,a)=>{let r=e[(a+e.length-1)%e.length],l=e[(a+e.length+1)%e.length];return[(2*t[0]+r[0]+l[0])/4,(2*t[1]+r[1]+l[1])/4]}))}function g(e,t,a){return(r,l)=>{let o=0;for(let n=0;n<a;n++){const a=1*Math.pow(2,n);o+=e(r/t*a,l/t*a)*(1*Math.pow(.8,n))}return o/(2-1/Math.pow(2,a-1))}}addEventListener("message",(e=>{return t=void 0,a=void 0,o=function*(){const t=e.data,a=t.parameters;l()(t.seed,{global:!0});const r=g((0,s.DA)(1e5*Math.random()),a.angle.scale,a.angle.octaves),o=g((0,s.DA)(1e5*Math.random()),a.angle.scale,a.angle.octaves),n=g((0,s.DA)(1e5*Math.random()),a.roughness.scale,a.roughness.octaves),i=g((0,s.DA)(1e5*Math.random()),a.base.scale,a.base.octaves);function c(e,t){if(e<0||t<0||e>=a.size||t>=a.size)return 0;let l=n(e,t)/2+.5,s=i(e,t)/2+.5,h=function(e,t){var a=1-(+(e<0)<<1),r=e*a+2220446049250313e-31,l=+(t<0)<<1,o=1-l;return(.7853981634*(l+1)+(.1821*(r=(t-o*r)/(o*t+r))*r-.9675)*r)*a}(o(e,t),r(e,t));h<-.4&&(h+=2*Math.PI),h<0&&(h*=2*Math.PI/-.4);let c=Math.sqrt(Math.pow(e-a.size/2,2)+Math.pow(t-a.size/2,2))/(a.size/2),g=h/(2*Math.PI)*l+s*(1-l);return g/=1+Math.pow(1.5*c,8),g}let f=new Map,u=a.size+2;for(let e=-1;e<a.size+1;e++)for(let t=-1;t<a.size+1;t++)f.set(e+t*u,c(e,t));let M=[];for(let e=0;e<a.layer_count;e++)M.push({height:e,color:p(e/a.layer_count,t.colors),verts:new Set,edges:new Map});let m=[];for(let r=0;r<a.size+1;r++)for(let l=0;l<a.size+1;l++){let o=[f.get(r-1+(l-1)*u),f.get(r+(l-1)*u),f.get(r+l*u),f.get(r-1+l*u)];for(let e of M)d(e,o,r,l,a);if(e.data.generate_image){let e=p(o[0],t.colors);m.push({color:"rgb("+e[0]+","+e[1]+","+e[2]+")",raw:255*o[0],x:a.size+1-r,y:l-2}),m.length==a.size+1&&(postMessage({type:"fill_pixels",pixels:m}),m=[])}}for(let e of M)h(e,a);let w=(.3*v()+.1)*a.vscale;w-=w%(a.vscale/a.layer_count),w-=a.vscale/a.layer_count/2,postMessage({type:"add_water",water_level:w})},new((r=void 0)||(r=Promise))((function(e,l){function n(e){try{i(o.next(e))}catch(e){l(e)}}function s(e){try{i(o.throw(e))}catch(e){l(e)}}function i(t){var a;t.done?e(t.value):(a=t.value,a instanceof r?a:new r((function(e){e(a)}))).then(n,s)}i((o=o.apply(t,a||[])).next())}));var t,a,r,o}));const f=new Map([[0,[]],[1,[[[.5,0],[0,.5]]]],[2,[[[.5,0],[1,.5]]]],[3,[[[0,.5],[1,.5]]]],[4,[[[.5,1],[1,.5]]]],[5,[[[.5,0],[1,.5]],[[0,.5],[.5,1]]]],[6,[[[.5,0],[.5,1]]]],[7,[[[0,.5],[.5,1]]]],[8,[[[0,.5],[.5,1]]]],[9,[[[.5,0],[.5,1]]]],[10,[[[.5,0],[0,.5]],[[1,.5],[.5,1]]]],[11,[[[1,.5],[.5,1]]]],[12,[[[0,.5],[1,.5]]]],[13,[[[.5,0],[1,.5]]]],[14,[[[.5,0],[0,.5]]]],[15,[]]]);function u(e){return Math.floor(1e3*e[0])+" "+Math.floor(1e3*e[1])}function d(e,t,a,r,l){var o,n;let s=0;for(let a=0;a<4;a++)s+=t[a]>=e.height/l.layer_count?1<<a:0;let h=f.get(s);for(let s of h){let h=u(i(s[0],t,a,r,e,l)),c=u(i(s[1],t,a,r,e,l));e.verts.add(h),e.verts.add(c);let g=null!==(o=e.edges.get(h))&&void 0!==o?o:[];g.push(c),g.length>2&&console.log("More than two edges at a point on layer: "+e.height,h,c),e.edges.set(h,g);let f=null!==(n=e.edges.get(c))&&void 0!==n?n:[];f.push(h),f.length>2&&console.log("More than two edges at a point on layer: "+e.height,h,c),e.edges.set(c,f)}}function p(e,t){return t.data.slice(4*Math.floor(e*t.width),4*Math.floor(e*t.width)+3)}function v(){let e=0,t=0;for(;0===e;)e=Math.random();for(;0===t;)t=Math.random();let a=Math.sqrt(-2*Math.log(e))*Math.cos(2*Math.PI*t);return a=a/10+.5,a>1||a<0?v():a}},42:()=>{}},r={};function l(e){var t=r[e];if(void 0!==t)return t.exports;var o=r[e]={id:e,loaded:!1,exports:{}};return a[e].call(o.exports,o,o.exports,l),o.loaded=!0,o.exports}l.m=a,l.x=()=>{var e=l.O(void 0,[428],(()=>l(827)));return l.O(e)},l.amdD=function(){throw new Error("define cannot be used indirect")},l.amdO={},e=[],l.O=(t,a,r,o)=>{if(!a){var n=1/0;for(c=0;c<e.length;c++){for(var[a,r,o]=e[c],s=!0,i=0;i<a.length;i++)(!1&o||n>=o)&&Object.keys(l.O).every((e=>l.O[e](a[i])))?a.splice(i--,1):(s=!1,o<n&&(n=o));if(s){e.splice(c--,1);var h=r();void 0!==h&&(t=h)}}return t}o=o||0;for(var c=e.length;c>0&&e[c-1][2]>o;c--)e[c]=e[c-1];e[c]=[a,r,o]},l.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return l.d(t,{a:t}),t},l.d=(e,t)=>{for(var a in t)l.o(t,a)&&!l.o(e,a)&&Object.defineProperty(e,a,{enumerable:!0,get:t[a]})},l.f={},l.e=e=>Promise.all(Object.keys(l.f).reduce(((t,a)=>(l.f[a](e,t),t)),[])),l.u=e=>e+".pack.js",l.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),l.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),l.nmd=e=>(e.paths=[],e.children||(e.children=[]),e),(()=>{var e;l.g.importScripts&&(e=l.g.location+"");var t=l.g.document;if(!e&&t&&(t.currentScript&&(e=t.currentScript.src),!e)){var a=t.getElementsByTagName("script");a.length&&(e=a[a.length-1].src)}if(!e)throw new Error("Automatic publicPath is not supported in this browser");e=e.replace(/#.*$/,"").replace(/\?.*$/,"").replace(/\/[^\/]+$/,"/"),l.p=e})(),(()=>{var e={430:1};l.f.i=(t,a)=>{e[t]||importScripts(l.p+l.u(t))};var t=self.webpackChunkislands=self.webpackChunkislands||[],a=t.push.bind(t);t.push=t=>{var[r,o,n]=t;for(var s in o)l.o(o,s)&&(l.m[s]=o[s]);for(n&&n(l);r.length;)e[r.pop()]=1;a(t)}})(),t=l.x,l.x=()=>l.e(428).then(t),l.x()})();