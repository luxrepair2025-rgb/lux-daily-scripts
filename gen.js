(function(root){
const money=p=>'$'+Math.round(p).toLocaleString('en-US');
const mi=m=>Math.round(m).toLocaleString('en-US');
function hash(s){let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function demandOf(v){const d=v.demand;return (d&&typeof d==='object'?d.label:d)||'Cool'}
// Rotation changes every 3 days from a fixed epoch (ET calendar dates), so all phones agree.
const EPOCH=Date.UTC(2026,9,12);
function period(dateStr){const [y,m,d]=dateStr.split('-').map(Number);return Math.floor((Date.UTC(y,m-1,d)-EPOCH)/864e5/3)}
const wc=s=>s.trim().split(/\s+/).length;
function gen(data,dateStr){
 const per=period(dateStr),rank={Hot:0,Warm:1,Cool:2};
 return data.filter(v=>!(v.sold===true||v.sold==='True')).map(v=>{
  const ev=v.fuel==='ELECTRIC',short=`${v.year} ${v.make} ${v.model}`,title=short+(v.trim?` ${v.trim}`:'');
  const P=money(v.price),M=mi(v.miles),cf=v.carfax||{},col=(v.color||'').toLowerCase(),int=(v.interior||'').toLowerCase();
  const body=v.body_type&&v.body_type!=='Other'?(v.body_type==='SUV'?'SUV':v.body_type.toLowerCase()):'ride';
  const seed=hash(per+'|'+v.stock),pick=(a,o=0)=>a[(seed+o*7)%a.length];
  const pts=[];
  if(ev&&v.soh) pts.push(pick([`Battery health tested at ${(+v.soh).toFixed(0)} percent${v.band_label?`, that's an ${v.band_label} rating`:''}!`,`We tested the battery: ${(+v.soh).toFixed(0)} percent health${v.band_label?`, rated ${v.band_label}`:''}!`],1));
  if(ev&&v.est_range) pts.push(pick([`You're looking at an estimated ${v.est_range} miles of range!`,`Estimated range? ${v.est_range} miles on a charge!`],2));
  if(ev&&v.chem==='LFP') pts.push(`It's got an LFP battery pack, the kind that's happy charging to 100 percent!`);
  pts.push(v.miles<50000?pick([`Only ${M} miles on it!`,`Just ${M} miles, barely broken in!`],3):pick([`${M} miles and ready for plenty more!`,`It's showing ${M} miles and ready to roll!`],3));
  if(v.drive==='AWD') pts.push(`All-wheel drive for confidence in any weather!`);
  if(v.drive==='4WD') pts.push(`Four-wheel drive, so it's ready when the road isn't!`);
  if(v.fuel==='DIESEL') pts.push(pick([`Diesel power under the hood, built to work!`,`And yes, it's a diesel. Torque for days!`],4));
  if(cf.one_owner) pts.push(`One-owner Carfax!`);
  if(cf.accidents&&cf.accidents.length===0) pts.push(`No accidents reported on the Carfax!`);
  else if(v.carfax_flag==='clean') pts.push(`Clean Carfax!`);
  if(cf.service>=3) pts.push(`${cf.service} service records on the Carfax!`);
  if(col&&int) pts.push(pick([`Finished in ${col} with a ${int} interior. Sharp!`,`Check out that ${col} paint with the ${int} interior!`],5));
  const hooks=[`Stop scrolling! This ${short} is one you need to see!`,`Good morning from Lux Automotive! Let's check out this ${short}!`,
   `Looking for ${body==="SUV"?"an":"a"} ${body} under ${money(Math.ceil(v.price/1000)*1000)}? You're going to love this one!`,`Heads up! This ${short} will not last long on our lot!`,
   `It's walkaround time! Meet this ${col?col+' ':''}${short}!`,ev?`Think used EV batteries are a gamble? Not this ${short}!`:`Want something dependable? Say hello to this ${short}!`];
  const bridges=[`Here's why it's special.`,`Let me show you what you get.`,`Let's get into it!`,`Check this out.`];
  const ctas=[`It's priced at ${P}. Ask for stock number ${v.stock}, send us a message, or come see it today!`,
   `All of that for ${P}! Tap the link, call us, or stop by Lux Automotive and take it for a drive!`,
   `${P} gets you behind the wheel! Ask for stock ${v.stock} before somebody else grabs it!`,
   `Yours for ${P}! DM us or call now to set up your test drive. Don't wait on this one!`];
  const fillers=[`Whether it's the daily commute or a weekend trip, this ${body} is ready.`,`Honestly, the photos don't do it justice. You have to see it in person.`,`This is the kind of ${body} people ask us about all the time.`];
  const st=seed%pts.length,ord=pts.slice(st).concat(pts.slice(0,st));
  if(ev&&v.soh&&!ord.slice(0,3).some(p=>/battery/i.test(p))){ord.unshift(pts[0]);ord.splice(ord.lastIndexOf(pts[0]),1)}
  let h=pick(hooks),b=pick(bridges,2),c=pick(ctas,3),use=[],fill=[];
  const build=()=>[h,b,...use,...fill,c].join(' ');
  for(const p of ord){if(wc(build()+' '+p)>85)break;use.push(p)}
  for(let i=0;i<fillers.length&&wc(build())<70;i++){const f=fillers[(seed+i)%fillers.length];if(wc(build()+' '+f)<=88)fill.push(f)}
  const script=build();
  const shots=[`Slow walkaround from the front 3/4, then the interior and odometer (${M} mi)`,`Open on a badge close-up, pan to the full side profile, end in the driver's seat`,
   `Start inside on the dash${ev?' showing the battery %/range screen':''}, then step out to the full exterior`,`Walk toward the car from a distance, open the door, show the ${int} interior`];
  return {stock:String(v.stock),title,price:v.price,priceStr:P,miles:v.miles,demand:demandOf(v),fuel:v.fuel,img:v.img,url:v.url,shot:pick(shots,1),script,words:wc(script)};
 }).sort((a,b)=>rank[a.demand]-rank[b.demand]||b.price-a.price);
}
root.genScripts=gen;root.scriptPeriod=period;if(typeof module!=='undefined')module.exports=gen;
})(typeof window!=='undefined'?window:globalThis);
