import{g as x,o as a,m as P,w as y,a as u,d as S,t as w,b as N,e as D,D as E,n as L,_ as $,r as b,l as T,c as _,q as v,E as V,F as q,C as R,H as z,V as M,p as O,f as U}from"./entry.bb74548b.js";import{_ as j}from"./StarRating.63be099d.js";import{v as H}from"./index.97fe0762.js";const A=["src"],G=x({__name:"PlaceCard",props:{name:{},image:{},level:{},starRating:{},to:{}},emits:["click"],setup(n,{emit:c}){const f=n;function l(t){t.target.src="https://static.vecteezy.com/system/resources/previews/005/337/799/original/icon-image-not-found-free-vector.jpg"}return(t,s)=>{const d=D,g=E,h=j,k=L;return a(),P(k,{level:t.level??"800",class:"card"},{default:y(()=>[u("img",{alt:"",src:t.image,onError:l},null,40,A),t.to?(a(),P(d,{key:0,to:t.to,tint:"light",class:"link",onClick:s[0]||(s[0]=r=>c("click",r))},{default:y(()=>[S(w(t.name),1)]),_:1},8,["to"])):(a(),P(g,{key:1,flat:!0,tint:"light",class:"link",onClick:s[1]||(s[1]=r=>c("click",r))},{default:y(()=>[S(w(t.name),1)]),_:1})),N(h,{rating:f.starRating},null,8,["rating"])]),_:1},8,["level"])}}});const J=$(G,[["__scopeId","data-v-ec6ae865"]]),B=n=>(O("data-v-8fbb2d9e"),n=n(),U(),n),K=B(()=>u("header",null,[u("h2",null,"Places")],-1)),Q=B(()=>u("label",{for:"searchPlaceName"},"Search by name:",-1)),W={key:1},X=x({__name:"UserPlacesSection",props:{places:{},listClass:{}},emits:["requestPlaces","placeFocused"],setup(n,{emit:c}){const f=n,l=b(),t=b(""),s=T(()=>{var e;return(e=f.places)==null?void 0:e.filter(p=>p.name.toLowerCase().includes(t.value.toLowerCase()))}),d=b(0),g=e=>t.value=e,h=e=>c("placeFocused",e),k=e=>{l.value&&clearTimeout(l.value),l.value=setTimeout(g,50,e.target.value)},r=(e,p)=>{e.forEach(m=>{m.isIntersecting&&(p.unobserve(m.target),d.value++),d.value>=s.value.length&&c("requestPlaces")})};return(e,p)=>{const m=J;return a(),_("section",null,[K,Q,u("input",{type:"text",id:"searchPlaceName",placeholder:"Search...",onInput:k},null,32),v(s).length>0?(a(),_("ol",{key:0,class:V(e.listClass)},[(a(!0),_(q,null,R(v(s),(o,F)=>{var I;return z((a(),_("li",{key:o._id},[N(m,{name:o.name,image:((I=o.photoSrcs)==null?void 0:I.at(0))??"","star-rating":o.reviews.reduce((i,C)=>i+C.star,0)/o.reviews.length,onClick:i=>{i.preventDefault(),h(o._id)}},null,8,["name","image","star-rating","onClick"]),M(e.$slots,"default",{placeId:o._id},void 0,!0)])),[[v(H),(i,C)=>F===v(s).length-1&&r(i,C)]])}),128))],2)):(a(),_("p",W,"No places found!"))])}}});const te=$(X,[["__scopeId","data-v-8fbb2d9e"]]);export{te as _};
