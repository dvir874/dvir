import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
for (const line of readFileSync("/Users/dvirbenbaruch/raga-lifnei/.env.local","utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/); if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g,"");
}
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const { isRsvpMessage, didArrive } = await import("/Users/dvirbenbaruch/raga-lifnei/src/lib/rsvp-contact");
const { whatsappInviteLink } = await import("/Users/dvirbenbaruch/raga-lifnei/src/lib/phone");
const { coupleName } = await import("/Users/dvirbenbaruch/raga-lifnei/src/lib/couple-name");

const today = new Date().toLocaleDateString("en-CA",{timeZone:"Asia/Jerusalem"});
const { data: evs } = await sb.from("events").select("id,name,couple_names,date,send_paused_until").gte("date",today).order("date").limit(12);
const LIMIT = 3500;
const chunks: string[] = []; let buf = "";
const push=(b:string)=>{ if (buf && buf.length+b.length+2>LIMIT){chunks.push(buf);buf="";} buf = buf?`${buf}\n\n${b}`:b; };
for (const e of evs ?? []) {
  const { data: gs } = await sb.from("guests").select("id,name,phone,rsvp_token,status,category,do_not_contact").eq("event_id", e.id).eq("status","pending").limit(900);
  const real=(gs??[]).filter(g=>g.category!=="demo"&&!g.do_not_contact&&String(g.phone??"").trim()&&g.rsvp_token);
  if(!real.length) continue;
  const ids=real.map(g=>g.id as string); const reached=new Set<string>();
  for(let i=0;i<ids.length;i+=100){ const {data:ms}=await sb.from("wa_messages").select("guest_id,status,body").eq("direction","out").in("guest_id",ids.slice(i,i+100));
    for(const m of ms??[]) if(m.guest_id&&didArrive(m.status as string)&&isRsvpMessage(m.body as string)) reached.add(m.guest_id as string);}
  const missing=real.filter(g=>!reached.has(g.id as string)); if(!missing.length) continue;
  const who=coupleName(e as any)??e.name;
  if(!reached.size&&missing.length>5){push(`${who} — עוד לא התחילה שליחה. ${missing.length} ממתינים.`);continue;}
  push(`${who} — ${missing.length} לא קיבלו:`);
  for(const g of missing){ const blk=`${g.name} ${g.phone}\n${whatsappInviteLink(String(g.phone),String(g.name),String(g.rsvp_token))}`;
    if(!(global as any).sample){(global as any).sample=blk;console.log("BLOCK len chars",blk.length,"bytes",Buffer.byteLength(blk));}
    push(blk); }
}
if(buf)chunks.push(buf);
console.log("chunks", chunks.length);
chunks.forEach((c,i)=>console.log(`chunk ${i}: chars=${c.length} bytes=${Buffer.byteLength(c)} startsWithHeader=${/לא קיבלו:$/m.test(c.split("\n\n")[0])} first="${c.split("\n")[0].slice(0,50)}"`));
// what if איילת had 1 reached
console.log("\n--- hypothetical: איילת 222 missing, avg block", 750, "=> chunks:", Math.ceil(222*752/3500));
console.log("\n--- header lines per chunk ---");
chunks.forEach((c,i)=>{ const hs=c.split("\n").filter(l=>/לא קיבלו:$/.test(l)); console.log(i, JSON.stringify(hs)); });
