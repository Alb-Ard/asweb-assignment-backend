const s=async(e,t)=>{n(e())||await t.fetchNextAsync()},n=e=>!!e&&e.length>0&&e.length%10===0,h=(e,t,a)=>(e.value=!0,t.then(c=>(e.value=!1,c)).catch(()=>(e.value=!1,a)));export{n as a,s as i,h as w};
