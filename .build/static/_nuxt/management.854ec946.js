import{_ as w}from"./UserPlacesSection.bf312de3.js";import{g as f,r as p,x as v,h as y,o as i,m as T,w as A,d as B,q as t,B as S,l as P,c as u,F as _,a as d,t as b,b as g,_ as F}from"./entry.9dbfbc2c.js";import{u as h}from"./usePlacesStore.5fcb8dfe.js";import{w as k,i as x}from"./dataStore.d7792384.js";import{_ as L}from"./Fab.8c80f483.js";import"./StarRating.c3e15fc6.js";import"./index.db22a8d1.js";import"./index.a5ba7d56.js";const N=f({__name:"createplace",setup(D){p(3);const n=v(),a=h(),l=p(!1);return y(n.userStore,o=>{o.userData&&k(l,x(()=>a.places,a),null)},{immediate:!0}),(o,e)=>{const s=L;return i(),T(s,{onClick:e[0]||(e[0]=r=>t(a).createAsync("testX",[4.5,2.1]).then(c=>c&&("navigateTo"in o?o.navigateTo:t(S))("/editpage/"+c)))},{default:A(()=>[B("+")]),_:1})}}}),$={key:0},C={key:1},V=f({__name:"management",setup(D){const n=v(),a=h(),l=P(()=>{var e;return(e=a.places)==null?void 0:e.filter(s=>{var r;return s.owner._id===((r=n.userStore.userData)==null?void 0:r._id)})}),o=p(!1);return y(n.userStore,e=>{e.userData&&k(o,x(()=>a.places,a),null)},{immediate:!0}),(e,s)=>{var c;const r=w;return i(),u(_,null,[!t(l)||t(n).userStore.userData===void 0?(i(),u("p",$,"Loading...")):t(n).userStore.userData===null?(i(),u("p",C,"Please log in to enter manager mode!")):(i(),u(_,{key:2},[d("header",null,[d("h2",null,"Welcome back, "+b((c=t(n).userStore.userData)==null?void 0:c.username),1)]),g(r,{places:t(l),class:"place-list-section","list-class":"place-list",onRequestPlaces:s[0]||(s[0]=m=>t(a).fetchNextAsync()),onPlaceFocused:s[1]||(s[1]=m=>("navigateTo"in e?e.navigateTo:t(S))("/dashboard/"+m))},null,8,["places"])],64)),g(N)],64)}}});const j=F(V,[["__scopeId","data-v-43523704"]]);export{j as default};