export const CATEGORIES=['Reconnaissance','Web','Networking','Files & transfer','Windows','Shell & utilities'];
export const PLATFORMS=['Linux','Windows','Cross-platform'];
export const now=()=>new Date().toISOString();
export function uid(){return globalThis.crypto?.randomUUID?.() || `cmd-${Date.now()}-${Math.random().toString(36).slice(2)}`;}
export function normalize(entry){
 if(!entry || typeof entry!=='object' || typeof entry.command!=='string' || !entry.command.trim())throw new Error('Every entry needs a nonempty "command" string.');
 if(entry.command.length>50000)throw new Error('A command exceeds 50,000 characters.');
 const str=(v,max)=>typeof v==='string'?v.slice(0,max):'';
 const tags=Array.isArray(entry.tags)?entry.tags:typeof entry.tags==='string'?entry.tags.split(','):[];
 const date=v=>typeof v==='string' && Number.isFinite(Date.parse(v))?new Date(v).toISOString():null;
 return {id:str(entry.id,100)||uid(),command:entry.command,title:str(entry.title,160).trim()||entry.command.trim().split('\n')[0].slice(0,80),description:str(entry.description,20000),notes:str(entry.notes,20000),category:str(entry.category,60).trim()||'Unsorted',platform:PLATFORMS.includes(entry.platform)?entry.platform:'Linux',tags:[...new Set(tags.filter(t=>typeof t==='string').map(t=>t.trim().toLowerCase().slice(0,40)).filter(Boolean))].slice(0,20),favorite:entry.favorite===true,example:entry.example===true,createdAt:date(entry.createdAt)||now(),updatedAt:date(entry.updatedAt)||now(),lastCopied:date(entry.lastCopied)};
}
export function parseImport(text){
 const clean=text.trim().replace(/^```(?:json)?\s*\n?/i,'').replace(/\n?```$/,'').trim();
 if(!clean)throw new Error('Paste commands or select a JSON/text file first.');
 if(clean.length>10000000)throw new Error('The import is too large (maximum 10 MB).');
 let entries;
 if(/^[\[{]/.test(clean)){
 let parsed;try{parsed=JSON.parse(clean);}catch{throw new Error('Invalid JSON. Check quotes and commas, or use one plain-text command per line.');}
 if(Array.isArray(parsed)) entries=parsed;
 else if(Array.isArray(parsed.commands)) entries=parsed.commands;
 else if(typeof parsed.command==='string') entries=[parsed];
 else throw new Error('JSON must be an array of commands or an object with a "commands" array.');
 }else entries=clean.split(/\r?\n/).map(line=>line.replace(/^\s*\d+\s+/,'')).filter(line=>line.trim()).map(command=>({command}));
 if(entries.length>10000)throw new Error('Import up to 10,000 commands at a time.');
 return entries.map(normalize);
}
export function mergeCommands(current,incoming){
 const seen=new Set(current.map(c=>c.command.trim()));const ids=new Set(current.map(c=>c.id));let skipped=0;const added=[];
 for(const c of incoming){if(seen.has(c.command.trim())){skipped++;continue;}seen.add(c.command.trim());let id=c.id;while(ids.has(id))id=uid();ids.add(id);added.push({...c,id});}
 return {commands:[...added,...current],added:added.length,skipped};
}
export function variableNames(command){return [...new Set([...command.matchAll(/\{\{\s*([a-zA-Z_][\w.-]*)\s*\}\}/g)].map(m=>m[1]))];}
export function fillVariables(command,values){return command.replace(/\{\{\s*([a-zA-Z_][\w.-]*)\s*\}\}/g,(all,key)=>values[key]?.trim()?values[key]:all);}
export function filterCommands(commands,{query='',view='all',category='',tag='',platform='all',sort='updated'}={}){
 const terms=query.toLowerCase().trim().split(/\s+/).filter(Boolean);
 return commands.filter(c=>(view!=='favorites'||c.favorite)&&(view!=='recent'||c.lastCopied)&&(!category||c.category===category)&&(!tag||c.tags.includes(tag))&&(platform==='all'||c.platform===platform)&&terms.every(t=>[c.title,c.command,c.description,c.notes,c.category,c.platform,...c.tags].join(' ').toLowerCase().includes(t))).sort((a,b)=>sort==='title'?a.title.localeCompare(b.title):sort==='used'||view==='recent'?(Date.parse(b.lastCopied)||0)-(Date.parse(a.lastCopied)||0):Date.parse(b.updatedAt)-Date.parse(a.updatedAt));
}
export function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
export function collectionNames(commands,explicit=[]){return [...new Set([...explicit.filter(x=>typeof x==='string').map(x=>x.trim().slice(0,60)).filter(Boolean),...commands.map(c=>c.category)])].sort((a,b)=>a.localeCompare(b));}
export function updateSelected(commands,ids,patch){return commands.map(c=>ids.has(c.id)?normalize({...c,...patch,example:false,updatedAt:now()}):c);}
export function renameCollection(commands,from,to){const name=to.trim().slice(0,60);if(!name)throw Error('Enter a collection name.');return updateSelected(commands,new Set(commands.filter(c=>c.category===from).map(c=>c.id)),{category:name});}
export function groupCommands(commands,key){if(key==='none')return [['',commands]];const groups=new Map();for(const c of commands){const name=c[key]||'Unsorted';if(!groups.has(name))groups.set(name,[]);groups.get(name).push(c);}return [...groups].sort(([a],[b])=>a.localeCompare(b));}
