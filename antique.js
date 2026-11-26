const OWNER_HASH="93b76d9c8166fa4eabce7ba80c11ce3b47d5ac1c125952efcc0c72d3d4848621";
const OWNER=["antiquewatches@gmail.com"];
let PAY=load("aw_pay",{card:"",name:""});
const REGIONS=["Toshkent shahri","Toshkent viloyati","Andijon viloyati","Buxoro viloyati","Farg‘ona viloyati","Jizzax viloyati","Xorazm viloyati","Namangan viloyati","Navoiy viloyati","Qashqadaryo viloyati","Qoraqalpog‘iston Respublikasi","Samarqand viloyati","Sirdaryo viloyati","Surxondaryo viloyati"];
const $=id=>document.getElementById(id);
const getEmail=()=>{const v=$("email").value.trim().toLowerCase().split("@")[0];return v?v+"@gmail.com":""};
const DEFAULTS=[
 {n:"Omega Seamaster Automatic",l:"Shveytsariya",y:1960,p:39000000,a:[40,200]},
 {n:"Elema Triple Date Moonphase",l:"Shveytsariya",y:1960,p:20000000,a:[110,300]},
 {n:"Jaeger-LeCoultre Memovox Alarm",l:"Shveytsariya",y:1963,p:51000000,a:[75,15]},
 {n:"Cartier Tank Must, limon siferblat",l:"Fransiya",y:1980,p:48000000,a:[150,60]},
 {n:"Omega Genève Automatic",l:"Shveytsariya",y:1973,p:21000000,a:[10,250]},
 {n:"IWC De Luxe, 18k tilla",l:"Shveytsariya",y:1965,p:48000000,a:[95,330]},
 {n:"Jaeger-LeCoultre Dress Watch, pushti tilla",l:"Shveytsariya",y:1950,p:56000000,a:[50,170]},
 {n:"Rolex Cellini, shampan siferblat",l:"Shveytsariya",y:1976,p:80000000,a:[125,90]}
];
function load(k,d){try{const v=JSON.parse(localStorage.getItem(k));return v||d}catch(e){return d}}
function save(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){toast("Xotira to‘ldi")}}
let watches=load("aw_watches",DEFAULTS),filters=load("aw_filters",[]),orders=load("aw_orders",[]),cart=load("aw_cart",[]),user=load("aw_user",null),active="",needPw=false;
const uzs=n=>String(n).replace(/\B(?=(\d{3})+(?!\d))/g," ")+" so‘m";
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function toast(t){const el=$("toast");el.textContent=t;el.classList.add("on");clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove("on"),2600);}

/* rasm va video xotirasi (IndexedDB) */
let _db;const idb=()=>_db||(_db=new Promise((res,rej)=>{const r=indexedDB.open("aw",1);r.onupgradeneeded=()=>r.result.createObjectStore("media");r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}));
const tx=async(mode,fn)=>{const d=await idb();return new Promise((res,rej)=>{const t=d.transaction("media",mode);const r=fn(t.objectStore("media"));t.oncomplete=()=>res(r&&r.result);t.onerror=()=>rej(t.error)})};
const putM=(id,b)=>tx("readwrite",s=>s.put(b,id));
const getM=id=>tx("readonly",s=>s.get(id));
const delM=id=>tx("readwrite",s=>s.delete(id));
function shrink(file){return createImageBitmap(file).then(img=>new Promise(res=>{const k=Math.min(1,1200/Math.max(img.width,img.height)),c=document.createElement("canvas");c.width=Math.round(img.width*k);c.height=Math.round(img.height*k);c.getContext("2d").drawImage(img,0,0,c.width,c.height);c.toBlob(b=>res(b||file),"image/jpeg",.82)})).catch(()=>file)}
const toURL=b=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=()=>rej(r.error);r.readAsDataURL(b)});
function hydrate(){document.querySelectorAll("[data-mid]").forEach(async el=>{try{const b=await getM(el.dataset.mid);if(b)el.src=typeof b==="string"?b:URL.createObjectURL(b)}catch(e){}})}

function render(){
  const own=user&&user.owner;
  $("chips").innerHTML=filters.length?[["","Hammasi"],...filters.map(f=>[f,f])].map(([v,t])=>`<button class="chip" aria-pressed="${v===active}" data-f="${esc(v)}">${esc(t)}</button>${v&&own?`<button class="chip" data-df="${esc(v)}" aria-label="${esc(v)} filtrini o‘chirish">×</button>`:""}`).join(""):"";
  $("wf").innerHTML=`<option value="">Filtrsiz</option>`+filters.map(f=>`<option>${esc(f)}</option>`).join("");
  $("grid").innerHTML=watches.map((w,i)=>({w,i})).filter(({w})=>!active||w.f===active).map(({w,i})=>`
   <article class="card">${w.m&&w.m.length?`<div class="strip">${w.m.map(m=>m.t==="video"?`<video data-mid="${m.id}" controls playsinline preload="metadata"></video>`:`<img data-mid="${m.id}" alt="${esc(w.n)}">`).join("")}</div>`:`<div class="mini" style="--a:${(w.a||[40,200])[0]}deg;--b:${(w.a||[40,200])[1]}deg"></div>`}
   <small>${[w.l,w.y].filter(Boolean).map(esc).join(" · ")}</small><h3>${esc(w.n)}</h3><div class="price">${uzs(w.p)}</div>
   <button class="btn add" data-a="${i}">Savatga qo‘shish</button>
   ${own?`<button class="btn sm del" data-i="${i}">O‘chirish</button>`:""}</article>`).join("");
  hydrate();
}
document.addEventListener("click",e=>{
  const c=e.target.closest("[data-f]");if(c){active=c.dataset.f;render();}
  const df=e.target.closest("[data-df]");if(df){filters=filters.filter(f=>f!==df.dataset.df);watches.forEach(w=>{if(w.f===df.dataset.df)delete w.f});if(active===df.dataset.df)active="";save("aw_filters",filters);save("aw_watches",watches);render();}
  const a=e.target.closest(".add");if(a){const w=watches[+a.dataset.a];const it=cart.find(x=>x.n===w.n);if(it)it.q++;else cart.push({n:w.n,p:w.p,q:1});save("aw_cart",cart);cnt();toast(w.n+" savatga qo‘shildi");}
  const d=e.target.closest(".del");if(d&&user&&user.owner){const w=watches.splice(+d.dataset.i,1)[0];(w.m||[]).forEach(m=>delM(m.id).catch(()=>{}));save("aw_watches",watches);render();toast("Soat o‘chirildi");}
});

/* egasi: soat va filtr qo'shish */
$("addW").onclick=async()=>{
  const n=$("wn").value.trim(),l=$("wl").value.trim(),y=parseInt($("wy").value),p=parseInt($("wp").value.replace(/\s/g,""));
  if(!n||!l||!y||!p){toast("Nomi, joyi, yili va narxini to‘ldiring");return;}
  const m=[];
  for(const f of $("wm").files){
    const isV=f.type.startsWith("video/");
    if(!isV&&!f.type.startsWith("image/"))continue;
    if(f.size>30*1024*1024){toast(f.name+": fayl 30 MB dan katta");continue;}
    try{const id=Date.now()+"-"+Math.random().toString(36).slice(2);await putM(id,await toURL(isV?f:await shrink(f)));m.push({id,t:isV?"video":"image"});}catch(e){toast("Faylni saqlab bo‘lmadi");}
  }
  const w={n,l,y,p,m,a:[Math.floor(Math.random()*360),Math.floor(Math.random()*360)]};
  if($("wf").value)w.f=$("wf").value;
  watches.unshift(w);save("aw_watches",watches);
  ["wn","wl","wy","wp","wm"].forEach(i=>$(i).value="");render();toast("Soat qo‘shildi");
};
$("savePay").onclick=()=>{
  const c=$("pc").value.replace(/\D/g,"");
  if(!c){PAY={card:"",name:""};save("aw_pay",PAY);$("pn").value="";toast("Karta o‘chirildi");return;}
  if(c.length<16){toast("Karta raqami 16 ta raqamdan iborat bo‘lishi kerak");return;}
  PAY={card:c,name:$("pn").value.trim()};save("aw_pay",PAY);$("pc").value=c.replace(/(\d{4})(?=\d)/g,"$1 ");toast("Karta saqlandi");
};
$("addF").onclick=()=>{
  const f=$("nf").value.trim();if(!f)return;
  if(filters.includes(f)){toast("Bu filtr allaqachon bor");return;}
  filters.push(f);save("aw_filters",filters);$("nf").value="";render();toast("Filtr qo‘shildi");
};

/* savat va buyurtma */
function cnt(){$("cnt").textContent=cart.reduce((s,i)=>s+i.q,0);$("ocnt").textContent=orders.length;}
function renderCart(){
  $("cartList").innerHTML=cart.length?cart.map((i,k)=>`<div class="ci"><span>${esc(i.n)} × ${i.q}</span><span>${uzs(i.p*i.q)} <button class="btn sm" data-r="${k}">O‘chirish</button></span></div>`).join(""):`<p style="color:var(--mute)">Savatingiz bo‘sh.</p>`;
  const sum=uzs(cart.reduce((s,i)=>s+i.p*i.q,0));$("total").textContent=sum;$("payAmt").textContent=sum;
  $("cardNo").textContent=PAY.card?PAY.card.replace(/\D/g,"").replace(/(\d{4})(?=\d)/g,"$1 "):"Karta raqami hali kiritilmagan";$("cardName").textContent=PAY.name;$("copyCard").hidden=!PAY.card;
  $("orderForm").hidden=!cart.length;
}
$("reg").innerHTML=`<option value="">Tanlang</option>`+REGIONS.map(r=>`<option>${r}</option>`).join("");
$("copyCard").onclick=async()=>{try{await navigator.clipboard.writeText(PAY.card.replace(/\D/g,""));toast("Karta raqami nusxalandi")}catch(e){toast("Nusxalab bo‘lmadi")}};
$("cartBtn").onclick=()=>{$("done").hidden=true;$("cartErr").textContent="";renderCart();$("cartModal").hidden=false;};
$("closeCart").onclick=()=>{$("cartModal").hidden=true;};
$("cartList").addEventListener("click",e=>{const r=e.target.closest("[data-r]");if(r){cart.splice(+r.dataset.r,1);save("aw_cart",cart);cnt();renderCart();}});
$("order").onclick=async()=>{
  const reg=$("reg").value,addr=$("addr").value.trim(),phone=$("phone").value.trim(),err=$("cartErr");
  if(!reg){err.textContent="Viloyat yoki shaharni tanlang.";$("reg").focus();return;}
  if(addr.length<5){err.textContent="Yetkazib berish manzilini kiriting.";$("addr").focus();return;}
  if(phone.replace(/\D/g,"").length<9){err.textContent="Telefon raqamini kiriting.";$("phone").focus();return;}
  const rf=$("rc").files[0];
  if(!rf||!rf.type.startsWith("image/")){err.textContent="To‘lov chekining rasmini yuklang.";return;}
  const rid=Date.now()+"-r";
  try{await putM(rid,await toURL(await shrink(rf)))}catch(e){err.textContent="Chekni saqlab bo‘lmadi. Qayta urinib ko‘ring.";return;}
  const total=cart.reduce((s,i)=>s+i.p*i.q,0);
  const o={id:Date.now(),t:new Date().toLocaleString(),email:user.email,phone,reg,addr,rc:rid,paid:false,items:cart.map(i=>({...i})),total};
  orders.unshift(o);save("aw_orders",orders);cart=[];save("aw_cart",cart);cnt();renderCart();
  ["addr","phone","rc"].forEach(i=>$(i).value="");$("reg").value="";
  const body=`Yangi buyurtma\n${o.items.map(i=>i.n+" × "+i.q+" — "+uzs(i.p*i.q)).join("\n")}\nJami: ${uzs(total)}\nViloyat/shahar: ${reg}\nManzil: ${addr}\nTelefon: ${phone}\nEmail: ${o.email}`;
  $("mailLink").href="mailto:antiquewatches@gmail.com?subject="+encodeURIComponent("Yangi buyurtma")+"&body="+encodeURIComponent(body);
  $("doneTxt").textContent="Buyurtmangiz tayyor. "+reg+", "+addr+" manziliga yetkazamiz. To‘lov cheki tekshirilgach, egasi to‘lovni tasdiqlaydi. Egasiga yuborish uchun quyidagi tugmani bosing.";
  $("done").hidden=false;
};
/* egasi: buyurtmalar */
function renderOrders(){
  $("ordList").innerHTML=orders.length?orders.map((o,k)=>`<div class="oi"><b>${esc(o.t)}</b> · ${esc(o.email)}<br>Tel: ${esc(o.phone)}<br>${o.reg?esc(o.reg)+", ":""}${esc(o.addr)}<br>${o.items.map(i=>esc(i.n)+" × "+i.q).join("<br>")}<br><span class="price" style="padding:0">${uzs(o.total)}</span> <span class="badge ${o.paid?"ok":"no"}">${o.paid?"To‘landi":"To‘lanmagan"}</span>${o.rc?`<img class="rcimg" data-mid="${o.rc}" alt="To‘lov cheki">`:""}<button class="btn sm" data-op="${k}">${o.paid?"To‘lovni bekor qilish":"To‘lovni tasdiqlash"}</button> <button class="btn sm" data-od="${k}">O‘chirish</button></div>`).join(""):`<p style="color:var(--mute)">Hozircha buyurtmalar yo‘q.</p>`;hydrate();
}
$("ordBtn").onclick=()=>{renderOrders();$("ordModal").hidden=false;};
$("closeOrd").onclick=()=>{$("ordModal").hidden=true;};
$("ordList").addEventListener("click",e=>{
  const d=e.target.closest("[data-od]");if(d){const x=orders.splice(+d.dataset.od,1)[0];if(x&&x.rc)delM(x.rc).catch(()=>{});save("aw_orders",orders);cnt();renderOrders();}
  const p=e.target.closest("[data-op]");if(p){const x=orders[+p.dataset.op];x.paid=!x.paid;save("aw_orders",orders);renderOrders();}
  const im=e.target.closest(".rcimg");if(im)im.classList.toggle("big");
});

/* kirish */
function paint(){
  document.body.classList.toggle("locked",!user);
  $("who").textContent=user?(user.owner?"Egasi · ":"")+user.email:"";
  $("owner").hidden=!(user&&user.owner);
  $("ordBtn").hidden=!(user&&user.owner);
  $("pc").value=PAY.card?PAY.card.replace(/(\d{4})(?=\d)/g,"$1 "):"";$("pn").value=PAY.name||"";
  render();cnt();
  if(!user){needPw=false;$("pwWrap").hidden=true;$("pw").value="";$("email").value="";$("err").textContent="";$("mt").textContent="Kirish";}
}
async function sha(s){const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("");}
function finish(email,owner){user={email,owner};save("aw_user",user);paint();toast("Tizimga kirdingiz: "+email);}
async function submit(){
  const email=getEmail();
  if(!email){$("err").textContent="Elektron pochta manzilini kiriting.";return;}
  if(OWNER.includes(email)){
    if(!needPw){needPw=true;$("pwWrap").hidden=false;$("mt").textContent="Parolni kiriting";$("err").textContent="";$("pw").focus();return;}
    let ok=false;
    try{ok=(await sha($("pw").value))===OWNER_HASH}catch(e){}
    if(ok)finish(email,true);else{$("err").textContent="Parol noto‘g‘ri. Qayta urinib ko‘ring.";$("pw").select();}
    return;
  }
  if(!/^[a-z0-9.]{3,30}@gmail\.com$/.test(email)){$("err").textContent="Faqat @ belgisigacha bo‘lgan qismni kiriting (harflar, raqamlar, nuqta).";return;}
  finish(email,false);
}
$("go").onclick=submit;
$("out").onclick=()=>{user=null;try{localStorage.removeItem("aw_user")}catch(e){}$("cartModal").hidden=true;$("ordModal").hidden=true;paint();};
$("email").addEventListener("input",()=>{if(needPw&&!OWNER.includes(getEmail())){needPw=false;$("pwWrap").hidden=true;$("mt").textContent="Kirish";}});
document.addEventListener("keydown",e=>{
  if(e.key==="Enter"&&document.body.classList.contains("locked"))submit();
  if(e.key==="Escape"){$("cartModal").hidden=true;$("ordModal").hidden=true;}
});
paint();