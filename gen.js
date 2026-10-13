(function(root){
const money=p=>'$'+Math.round(p).toLocaleString('en-US');
const mi=m=>Math.round(m).toLocaleString('en-US');
function hash(s){let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function demandOf(v){const d=v.demand;return (d&&typeof d==='object'?d.label:d)||'Cool'}
function gen(data,dateStr){
 const rank={Hot:0,Warm:1,Cool:2};
 const cars=data.filter(v=>!(v.sold===true||v.sold==='True'));
 return cars.map(v=>{
  const ev=v.fuel==='ELECTRIC',title=`${v.year} ${v.make} ${v.model}`+(v.trim?` ${v.trim}`:'');
  const short=`${v.year} ${v.make} ${v.model}`,P=money(v.price),M=mi(v.miles),cf=v.carfax||{};
  const pts=[];
  if(ev&&v.soh) pts.push(`battery health tested at ${(+v.soh).toFixed(0)} percent${v.band_label?`, rated ${v.band_label}`:''}`);
  if(ev&&v.est_range) pts.push(`an estimated ${v.est_range} miles of range`);
  pts.push(v.miles<50000?`only ${M} miles`:`${M} miles on the clock`);
  if(v.drive&&['AWD','4WD'].includes(v.drive)) pts.push(`${v.drive==='AWD'?'all-wheel':'four-wheel'} drive`);
  if(v.fuel==='DIESEL') pts.push('diesel power');
  if(cf.one_owner) pts.push('a one-owner Carfax');
  else if(v.carfax_flag==='clean') pts.push('a clean Carfax');
  if(v.color&&v.interior) pts.push(`${v.color.toLowerCase()} with a ${v.interior.toLowerCase()} interior`);
  const seed=hash(dateStr+'|'+v.stock),pick=(a,o=0)=>a[(seed+o)%a.length];
  const hooks=[`Stop scrolling. This ${short} just might be your next ride.`,
   `Good morning from Lux Automotive! Let's look at this ${short}.`,
   `Looking for a ${v.body_type&&v.body_type!=='Other'?v.body_type.toLowerCase():'vehicle'} under ${money(Math.ceil(v.price/1000)*1000)}? Watch this.`,
   `Here's one that won't last long: a ${short}.`,
   `Quick walkaround time. Meet this ${v.color?v.color.toLowerCase()+' ':''}${short}.`,
   ev?`Worried about used EV batteries? We tested this ${short}.`:`Need something dependable? Check out this ${short}.`];
  const ctas=[`It's ${P}. Stock number ${v.stock}. Send us a message or stop by today.`,
   `Priced at ${P}. Tap the link to see it, or come drive it today.`,
   `${P} gets you in. Ask for stock ${v.stock} before someone else does.`,
   `All yours for ${P}. Call us or DM to set up a test drive.`];
  const s=seed%pts.length,chosen=[];for(let i=0;i<pts.length&&chosen.length<4;i++)chosen.push(pts[(s+i)%pts.length]);
  if(ev&&!chosen.some(p=>p.startsWith("battery"))&&v.soh)chosen[0]=pts[0];
  const body=chosen.map((p,i)=>i===0?p[0].toUpperCase()+p.slice(1):p);
  const mid=body.length>1?body.slice(0,-1).join(', ')+', and '+body[body.length-1]+'.':body[0]+'.';
  const bridges=[`Here's why it stands out.`,`Here's what you get.`,`Let me show you why.`,`Check this out.`];
  const script=`${pick(hooks)} ${pick(bridges,2)} ${mid} ${pick(ctas,3)}`;
  const shots=[`Slow walkaround starting front 3/4, then interior and odometer (${M} mi)`,
   `Open with the badge close-up, pan to full side profile, end on the driver's seat`,
   `Start inside on the dash${ev?' showing the battery %/range screen':''}, step out to full exterior`,
   `Walk toward the car from a distance, open the door, show the ${v.interior?v.interior.toLowerCase():''} interior`];
  return {stock:v.stock,title,price:v.price,priceStr:P,miles:v.miles,demand:demandOf(v),fuel:v.fuel,img:v.img,url:v.url,
   shot:pick(shots,1),script,words:script.split(/\s+/).length};
 }).sort((a,b)=>rank[a.demand]-rank[b.demand]||b.price-a.price);
}
root.genScripts=gen;if(typeof module!=='undefined')module.exports=gen;
})(typeof window!=='undefined'?window:globalThis);
