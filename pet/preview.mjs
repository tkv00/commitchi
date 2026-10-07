import {CHARACTERS,characterFor} from './characters.mjs';
import {renderPet} from './render.mjs';

const collection=document.querySelector('#collection');
const demo=document.querySelector('#demo');
const description=document.querySelector('#description');
const errorMessage=document.querySelector('#error');
const levelInput=document.querySelector('#level');
const moodInput=document.querySelector('#mood');
const themeInput=document.querySelector('#theme');
const spriteCache=new Map();
let owner='tkv00';
let generation=1;
let selected=characterFor(owner,generation);
let revision=0;
let hasInteracted=false;

for(const [index,character] of CHARACTERS.entries()) {
  const button=document.createElement('button');
  button.className='character';
  button.dataset.id=character.id;
  button.style.setProperty('--accent',character.accent);
  button.setAttribute('aria-label',`${character.name} 배지 보기`);
  button.setAttribute('aria-pressed','false');
  // All interpolated values below are the local, versioned character catalog.
  button.innerHTML=`<span class="character-top"><span>No. ${String(index+1).padStart(2,'0')}</span><span class="selected-marker">SELECTED</span></span><span class="sprite-frame"><img src="../${character.sprite}" alt="" width="134" height="134"></span><strong>${character.name}</strong><span class="species">${character.species}</span>`;
  button.addEventListener('click',()=>{
    hasInteracted=true;
    selected=character;
    generation=Array.from({length:CHARACTERS.length},(_,i)=>i+1).find(g=>characterFor(owner,g).id===character.id);
    void renderDemo();
  });
  collection.append(button);
}

async function spriteFor(character) {
  if(!spriteCache.has(character.id)) {
    const response=await fetch(`../${character.sprite}`);
    if(!response.ok) throw new Error(`${character.name} 이미지를 불러오지 못했어요.`);
    const blob=await response.blob();
    const uri=await new Promise((resolve,reject)=>{
      const reader=new FileReader();
      reader.onload=()=>resolve(reader.result);
      reader.onerror=()=>reject(new Error('이미지를 읽지 못했어요.'));
      reader.readAsDataURL(blob);
    });
    spriteCache.set(character.id,uri);
  }
  return spriteCache.get(character.id);
}

async function renderDemo() {
  const current=++revision;
  const character=selected;
  for(const card of collection.children) card.setAttribute('aria-pressed',String(card.dataset.id===character.id));
  const level=Number(levelInput.value),mood=moodInput.value,theme=themeInput.value;
  const xp=(level-1)*level*10+10;
  const state={owner,generation,character,level,xp,nextLevelXp:level*(level+1)*10,food:2,totalCommits:18,streak:mood==='happy'?4:0,
    mood,status:mood==='dead'?'dead':'alive',health:mood==='dead'?0:mood==='critical'?32:mood==='hungry'?66:100,
    idleDays:mood==='dead'?4:mood==='critical'?2:mood==='hungry'?1:0,asOf:'DEMO'};
  description.textContent=`${character.name} · ${character.description}`;
  document.querySelector('#generation-note').textContent=`지금은 ${generation}세대 데모예요. 여덟 친구를 모두 만나면 다시 순환합니다.`;
  try {
    const spriteDataUri=await spriteFor(character);
    if(current!==revision) return;
    demo.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(renderPet(state,{owner,name:'커밋치',theme,spriteDataUri}));
    demo.alt=`${character.name} ${generation}세대 Lv.${level} ${mood} ${theme} 배지 미리보기`;
    errorMessage.textContent='';
  } catch(error) {
    if(current===revision) errorMessage.textContent=error.message;
  }
}

for(const control of [levelInput,moodInput,themeInput]) control.addEventListener('change',()=>{hasInteracted=true;void renderDemo();});
document.querySelector('#next').addEventListener('click',()=>{
  hasInteracted=true;
  generation+=1;
  selected=characterFor(owner,generation);
  levelInput.value='1';
  moodInput.value='happy';
  void renderDemo();
});

try {
  const response=await fetch('data/state.json');
  if(!response.ok) throw new Error('state unavailable');
  const state=await response.json();
  const initialCharacter=characterFor(state.owner,state.generation);
  if(!hasInteracted) {
    owner=state.owner;
    generation=state.generation;
    selected=initialCharacter;
  }
} catch { /* The gallery also runs without an adopted pet. */ }
await renderDemo();
