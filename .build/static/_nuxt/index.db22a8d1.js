import{d as W,t as d,n as b,a as w,b as A,c as C,i as H,e as M}from"./index.a5ba7d56.js";import{l as O,r as y,h as g,X as N,i as X}from"./entry.9dbfbc2c.js";function m(e){var t;const r=d(e);return(t=r==null?void 0:r.$el)!=null?t:r}const E=H?window:void 0;function Y(...e){let t,r,n,l;if(typeof e[0]=="string"||Array.isArray(e[0])?([r,n,l]=e,t=E):[t,r,n,l]=e,!t)return w;Array.isArray(r)||(r=[r]),Array.isArray(n)||(n=[n]);const a=[],c=()=>{a.forEach(s=>s()),a.length=0},o=(s,u,v,f)=>(s.addEventListener(u,v,f),()=>s.removeEventListener(u,v,f)),i=g(()=>[m(t),d(l)],([s,u])=>{c(),s&&a.push(...r.flatMap(v=>n.map(f=>o(s,v,f,u))))},{immediate:!0,flush:"post"}),h=()=>{i(),c()};return A(h),h}function _(){const e=y(!1);return N()&&X(()=>{e.value=!0}),e}function x(e){const t=_();return O(()=>(t.value,!!e()))}function S(e,t,r={}){const{root:n,rootMargin:l="0px",threshold:a=.1,window:c=E,immediate:o=!0}=r,i=x(()=>c&&"IntersectionObserver"in c),h=O(()=>{const p=d(e);return(Array.isArray(p)?p:[p]).map(m).filter(b)});let s=w;const u=y(o),v=i.value?g(()=>[h.value,m(n),u.value],([p,D])=>{if(s(),!u.value||!p.length)return;const k=new IntersectionObserver(t,{root:m(D),rootMargin:l,threshold:a});p.forEach(L=>L&&k.observe(L)),s=()=>{k.disconnect(),s=w}},{immediate:o,flush:"post"}):w,f=()=>{s(),v(),u.value=!1};return A(f),{isSupported:i,isActive:u,pause(){s(),u.value=!1},resume(){u.value=!0},stop:f}}const j={[W.mounted](e,t){typeof t.value=="function"?S(e,t.value):S(e,...t.value)}};function I(e){const t=window.getComputedStyle(e);if(t.overflowX==="scroll"||t.overflowY==="scroll"||t.overflowX==="auto"&&e.clientWidth<e.scrollWidth||t.overflowY==="auto"&&e.clientHeight<e.scrollHeight)return!0;{const r=e.parentNode;return!r||r.tagName==="BODY"?!1:I(r)}}function B(e){const t=e||window.event,r=t.target;return I(r)?!1:t.touches.length>1?!0:(t.preventDefault&&t.preventDefault(),!1)}function R(e,t=!1){const r=y(t);let n=null,l;g(C(e),o=>{if(o){const i=o;l=i.style.overflow,r.value&&(i.style.overflow="hidden")}},{immediate:!0});const a=()=>{const o=d(e);!o||r.value||(M&&(n=Y(o,"touchmove",i=>{B(i)},{passive:!1})),o.style.overflow="hidden",r.value=!0)},c=()=>{const o=d(e);!o||!r.value||(M&&(n==null||n()),o.style.overflow=l,r.value=!1)};return A(c),O({get(){return r.value},set(o){o?a():c()}})}function T(){let e=!1;const t=y(!1);return(r,n)=>{if(t.value=n.value,e)return;e=!0;const l=R(r,n.value);g(t,a=>l.value=a)}}T();export{j as v};
