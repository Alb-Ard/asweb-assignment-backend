import{S as _,r as d,x as m,l as x,T as r,U as n}from"./entry.9dbfbc2c.js";import{a as C}from"./dataStore.d7792384.js";const P=_("places",()=>{const s=d(void 0),l=d(0),c=m(),w=async()=>{const e=await r.get(n("place")+"?page="+l.value);e.status===200&&(C(e.data)&&l.value++,e.data.forEach(o))},i=async e=>{const t=await r.get(n("place")+"/"+e);t.status===200&&o(t.data)},v=async(e,t)=>{if(!c.userStore.userData)return!1;const a=await r.post(n("place"),{name:e,owner:c.userStore.userData._id,location:t},{withCredentials:!0});return a.status!==200?!1:(await i(a.data),a.data)},h=async e=>{var f;const{_id:t,...a}=e;if((await r.patch(n("place")+"/"+t,a,{withCredentials:!0})).status!==200)return!1;const p=(f=s.value)==null?void 0:f.find(A=>A._id===t);return p?o({...p,...e}):await i(e._id),!0},y=async e=>{var a;return(await r.delete(n("place")+"/"+e,{withCredentials:!0})).status!==200?!1:((a=s.value)!=null&&a.some(u=>u._id===e)&&(s.value=s.value.filter(u=>u._id!==e)),!0)},g=async(e,t)=>!c.userStore.userData||(t>0?await r.post(n("place")+"/"+e+"/review",{star:t},{withCredentials:!0}):await r.delete(n("place")+"/"+e+"/review",{withCredentials:!0})).status!==200?!1:(await i(e),!0),o=e=>{s.value||(s.value=[]);const t=s.value.find(a=>a._id===e._id);t?Object.assign(t,e):s.value.push(e)};return{places:x(()=>s.value),fetchNextAsync:w,fetchOneAsync:i,createAsync:v,updateAsync:h,updateReviewAsync:g,deleteAsync:y}});export{P as u};