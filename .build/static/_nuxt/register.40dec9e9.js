import{g as q,x as A,r as s,m as b,w as u,n as B,o as h,a as f,q as a,A as S,b as e,z as m,d as x,y as k,B as C,D as L,I as N,p as R,f as U,_ as P}from"./entry.9dbfbc2c.js";import{a as D,_ as F}from"./InputField.54f2adc8.js";import{w as T}from"./dataStore.d7792384.js";import"./index.a5ba7d56.js";const v=n=>(R("data-v-b89aa3f3"),n=n(),U(),n),z=["onSubmit"],E=v(()=>f("h2",null,"Register",-1)),M=v(()=>f("p",null,"Incorrect data input! Please try again",-1)),$=q({__name:"register",setup(n){const g=A(),l=s(""),r=s(""),d=s(""),i=s(!1),_=s(!1),w=async()=>{await T(i,g.registerAsync(l.value,r.value,d.value),null),_.value=!g.userStore.userData,_.value||C("/")};return(j,t)=>{const y=B,c=D,p=F,V=L,I=N;return h(),b(y,{level:"800",class:"register-panel"},{default:u(()=>[f("form",{action:"#",method:"post",onSubmit:k(w,["prevent"])},[E,a(_)?(h(),b(y,{key:0,color:"danger",class:"error-panel"},{default:u(()=>[M]),_:1})):S("",!0),e(c,{class:"form-label",for:"name",text:"Username",required:""}),e(p,{modelValue:a(l),"onUpdate:modelValue":t[0]||(t[0]=o=>m(l)?l.value=o:null),type:"text",id:"name",placeholder:"Insert your name here",required:""},null,8,["modelValue"]),e(c,{class:"form-label",for:"email",text:"Email",required:""}),e(p,{modelValue:a(r),"onUpdate:modelValue":t[1]||(t[1]=o=>m(r)?r.value=o:null),type:"email",id:"email",placeholder:"Insert your mail here",required:""},null,8,["modelValue"]),e(c,{class:"form-label",for:"password",text:"Password",required:""}),e(p,{modelValue:a(d),"onUpdate:modelValue":t[2]||(t[2]=o=>m(d)?d.value=o:null),type:"password",id:"password",placeholder:"Insert your password here",required:""},null,8,["modelValue"]),e(V,{disabled:a(i),"full-width":!0,color:"primary",class:"register-button",type:"submit"},{default:u(()=>[x(" Register ")]),_:1},8,["disabled"]),e(I,{disabled:a(i),flat:!0,to:"/login"},{default:u(()=>[x(" Already registered? Click here! ")]),_:1},8,["disabled"])],40,z)]),_:1})}}});const O=P($,[["__scopeId","data-v-b89aa3f3"]]);export{O as default};
