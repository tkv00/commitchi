const DEFAULT = {status:'alive', mood:'happy', owner:'tkv00', level:1, xp:0, nextLevelXp:20, food:0, health:100, streak:0, idleDays:0, totalCommits:0, totalFoodEarned:0, latestCommitDate:null, asOf:'—'};
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num = (v, d=0) => Number.isFinite(Number(v)) ? Number(v) : d;
const text = (x,y,v,size=10,fill='#dce8f0',weight=700,anchor='start',extra='') => `<text x="${x}" y="${y}" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" ${extra}>${esc(v)}</text>`;
const validSprite = (v) => typeof v === 'string' && /^data:image\/png;base64,[A-Za-z0-9+/]+=*$/.test(v);

function fallbackSprite(dead=false) {
  if (dead) return `<g shape-rendering="crispEdges"><rect x="18" y="19" width="68" height="68" fill="#7d91a1"/><rect x="26" y="11" width="52" height="8" fill="#a9bac2"/><rect x="26" y="87" width="52" height="8" fill="#a9bac2"/><rect x="11" y="27" width="8" height="52" fill="#a9bac2"/><rect x="78" y="27" width="8" height="52" fill="#a9bac2"/><rect x="34" y="43" width="10" height="10" fill="#273447"/><rect x="60" y="43" width="10" height="10" fill="#273447"/><rect x="43" y="66" width="18" height="5" fill="#273447"/></g>`;
  const palette = ['#f5c84b','#f7d96b','#42b9a7','#1b7780','#194d6e'];
  const rows = ['00111100','01122110','11222211','12233221','12222221','01122110','00111100'];
  return `<g transform="translate(20 18) scale(9)" shape-rendering="crispEdges">${rows.map((row,y)=>[...row].map((v,x)=>v==='0'?'':`<rect x="${x}" y="${y}" width="1" height="1" fill="${palette[Number(v)-1]}"/>`).join('')).join('')}</g>`;
}

export function renderPet(input={}, config={}) {
  const s={...DEFAULT,...input}; const dark=config.theme !== 'light';
  const character=s.character ?? {};
  const characterName=character.name || config.name || '커밋치';
  const generation=Math.max(1,Math.floor(num(s.generation,1)));
  const tint=/^#[0-9a-f]{6}$/i.test(character.accent ?? '') ? character.accent : '#55d1bd';
  const accent=dark?tint:'#'+tint.slice(1).match(/../g).map(v=>Math.round(parseInt(v,16)*0.52).toString(16).padStart(2,'0')).join('');
  const bg=dark?'#172437':'#f5f7f8', panel=dark?'#22344c':'#ffffff', line=dark?'#38516b':'#d9e1e7', ink=dark?'#f2f6f8':'#243244', muted=dark?'#91a9ba':'#718394';
  const level=Math.max(1,Math.floor(num(s.level,1))), xp=Math.max(0,num(s.xp)), next=Math.max(1,num(s.nextLevelXp,20));
  const start=Math.max(0,(level-1)*level*10), pct=Math.min(100,Math.max(0,Math.round(((xp-start)/Math.max(1,next-start))*100)));
  const dead=s.status==='dead'||s.mood==='dead';
  const stage=level>=10?'CROWN':level>=6?'GROWN':level>=3?'BABY':'SEED';
  const nextStage=level>=10?'MAX':level>=6?'LV 10':level>=3?'LV 6':'LV 3';
  const health=dead?0:Math.max(0,Math.min(100,Math.floor(num(s.health,100))));
  const hearts=Array.from({length:3},(_,i)=>`<rect x="${414+i*12}" y="30" width="8" height="8" fill="${i<Math.ceil(health/34)?'#f36f8f':line}"/><rect x="${417+i*12}" y="27" width="3" height="3" fill="${i<Math.ceil(health/34)?'#f36f8f':line}"/>`).join('');
  const size=character.id && character.id!=='spark'?104:150;
  const creature=validSprite(config.spriteDataUri)
    ? `<image x="${71-size/2}" y="${67-size/2}" width="${size}" height="${size}" href="${config.spriteDataUri}" preserveAspectRatio="xMidYMid meet" image-rendering="pixelated" clip-path="url(#sprite-panel)"${dead?' filter="url(#rest)" opacity=".5"':''}/>`
    : fallbackSprite(dead);
  const crown=!dead && level>=10?'<g transform="translate(55 22)" shape-rendering="crispEdges"><rect x="0" y="0" width="28" height="5" fill="#ffd05c"/><rect x="5" y="-5" width="6" height="5" fill="#ffd05c"/><rect x="17" y="-5" width="6" height="5" fill="#ffd05c"/><rect x="23" y="-1" width="5" height="6" fill="#ffd05c"/></g>':'';
  return `<!-- COMMITCHI badge -->
<svg xmlns="http://www.w3.org/2000/svg" width="560" height="200" viewBox="0 0 560 200" role="img" aria-labelledby="title desc">
<title id="title">${esc(characterName)} · COMMITCHI</title><desc id="desc">${esc(config.owner||s.owner)} GitHub commit pet, ${esc(characterName)}, GEN ${generation}, level ${level}, ${stage}</desc>
<defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="${bg}"/><stop offset="1" stop-color="${dark?'#20324a':'#e8f0f2'}"/></linearGradient><clipPath id="sprite-panel"><rect x="16" y="16" width="110" height="108" rx="9"/></clipPath><filter id="rest"><feColorMatrix type="saturate" values="0"/></filter></defs>
<rect width="560" height="200" rx="14" fill="url(#bg)"/><path d="M0 154h560M142 0v200" stroke="${line}" opacity=".42"/><path d="M18 18h8M18 18v8M542 182h-8M542 182v-8" stroke="${accent}" stroke-width="2"/>
<g opacity=".32" fill="${accent}"><rect x="154" y="19" width="3" height="3"/><rect x="531" y="28" width="3" height="3"/><rect x="373" y="174" width="3" height="3"/><rect x="118" y="164" width="3" height="3"/></g>
<rect x="15" y="15" width="112" height="126" rx="10" fill="${panel}" stroke="${line}" stroke-width="2"/>${creature}${crown}
${text(71,130,dead?'DEAD':'LV '+level,11,dead?'#f36f8f':accent,900,'middle')}${text(154,39,'COMMITCHI',18,ink,950)}${text(154,57,`${config.name||'커밋치'}  @${config.owner||s.owner}`,10,muted,750)}
<rect x="154" y="67" width="390" height="1" fill="${line}"/>${text(154,88,stage,12,accent,950)}${text(228,88,dead?'REST IN PEACE':`evolution → ${nextStage}`,10,muted,700)}${text(401,38,'HP',9,muted,900)}${hearts}${text(457,38,health,9,ink,850)}
${text(154,113,'FOOD',9,muted,900)}${text(194,113,Math.floor(num(s.food)),16,ink,950)}${text(238,113,'2 COMMITS = 1 FOOD',9,muted,800)}${text(419,113,`STREAK ${Math.floor(num(s.streak))}D`,9,accent,900,'end')}
<rect x="154" y="124" width="390" height="10" rx="2" fill="${line}"/><rect x="154" y="124" width="${Math.round(390*pct/100)}" height="10" rx="2" fill="${accent}"/>${text(154,150,`XP ${Math.floor(xp)} / ${Math.floor(next)}`,9,muted,750)}${text(544,150,`${pct}%`,9,accent,900,'end')}
${text(71,172,characterName,12,ink,850,'middle')}${text(71,188,`GEN ${generation}`,9,accent,750,'middle')}
${text(154,176,dead?'3일 무커밋 + 반영 유예 24h → 사망':`무커밋 ${Math.floor(num(s.idleDays))}일  ·  ${s.latestCommitDate?`last ${s.latestCommitDate}`:`as of ${s.asOf}`}`,9,dead?'#f36f8f':muted,750)}${text(544,176,`${Math.floor(num(s.totalCommits))} commits`,9,muted,750,'end')}
</svg>`;
}
export default renderPet;
