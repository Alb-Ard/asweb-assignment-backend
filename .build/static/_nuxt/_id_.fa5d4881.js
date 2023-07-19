import{g as C,x as D,l as L,o as a,c as o,a as t,b as p,w as m,d as _,t as v,F as B,C as F,q as c,y as I,D as N,e as T,p as U,f as V,_ as E,v as M,r as $,i as x,m as O,A as q,B as j}from"./entry.bb74548b.js";import{_ as z}from"./StarRating.63be099d.js";import{u as G}from"./usePlacesStore.3ccf87c0.js";import{w as b}from"./dataStore.d7792384.js";const f=l=>(U("data-v-fde7fae7"),l=l(),V(),l),H={class:"place-main-header"},J=f(()=>t("span",{class:"fa fa-arrow-left"},null,-1)),K=f(()=>t("header",null,[t("h3",null,"Details")],-1)),Q=f(()=>t("header",null,[t("h3",null,"Photos")],-1)),W={class:"place-images-list"},X=["src"],Y={key:0},Z=f(()=>t("legend",null,"Leave a review",-1)),ee=f(()=>t("header",null,[t("h3",null,"Reviews")],-1)),te={key:0},ne=C({__name:"UserFocusedPlaceSection",props:{place:{},canEditReview:{type:Boolean}},emits:["placeRated","backPressed"],setup(l,{emit:h}){const i=l,r=D(),d=L(()=>i.place.reviews.find(e=>{var s;return e.user._id===((s=r.userStore.userData)==null?void 0:s._id)})),u=e=>e<1e6?""+e:e/1e6+"M",g=e=>h("placeRated",e),n=()=>h("backPressed");return(e,s)=>{var R,P;const k=N,S=T,y=z;return a(),o("section",null,[t("header",H,[p(k,{onClick:n},{"icon-left":m(()=>[J]),default:m(()=>[_(" Back ")]),_:1}),t("h2",null,v(e.place.name),1)]),t("section",null,[K,t("p",null,"Owner: "+v(((R=e.place.owner)==null?void 0:R.username)??"Unknown"),1),t("p",null,v(e.place.description),1)]),t("section",null,[Q,t("ul",W,[(a(!0),o(B,null,F(e.place.photoSrcs,w=>(a(),o("li",null,[t("img",{src:w},null,8,X)]))),256))])]),c(r).userStore.userData?(a(),o("form",{key:1,action:"#",method:"post",onSubmit:s[0]||(s[0]=I(()=>{},["prevent"]))},[t("fieldset",null,[Z,p(y,{interactible:e.canEditReview,rating:((P=c(d))==null?void 0:P.star)??0,onClick:g},null,8,["interactible","rating"])])],32)):(a(),o("p",Y,[p(S,{to:"/login"},{default:m(()=>[_("Log in")]),_:1}),_(" or "),p(S,{to:"/register"},{default:m(()=>[_("Sign up")]),_:1}),_(" to leave a review! ")])),t("section",null,[ee,e.place.reviews.length<=0?(a(),o("p",te,"This place hasn't been reviewed yet. Be the first one to rate it!")):(a(),o(B,{key:1},[p(y,{rating:e.place.reviews.reduce((w,A)=>w+A.star,0)/e.place.reviews.length,class:"global-star-rating"},null,8,["rating"]),t("p",null,"Reviews count: "+v(u(e.place.reviews.length)),1)],64))])])}}});const ae=E(ne,[["__scopeId","data-v-fde7fae7"]]),ie=C({__name:"[id]",setup(l){const h=M(),i=G(),r=h.params.id,d=L(()=>{var n;return(n=i.places)==null?void 0:n.find(e=>e._id===r)}),u=$(!1),g=n=>b(u,i.updateReviewAsync(d.value._id,n),!1);return x(()=>b(u,i.fetchOneAsync(r),null)),(n,e)=>{const s=ae;return c(d)?(a(),O(s,{key:0,place:c(d),"can-edit-review":!c(u),onPlaceRated:g,onBackPressed:e[0]||(e[0]=k=>("navigateTo"in n?n.navigateTo:c(j))("/"))},null,8,["place","can-edit-review"])):q("",!0)}}});export{ie as default};