import test from 'node:test'; import assert from 'node:assert/strict'; import {renderPet} from './render.mjs';
test('renders fixed compact safe badge',()=>{const svg=renderPet({owner:'<x>',level:3,xp:80,nextLevelXp:120,food:4}); assert.match(svg,/width="560" height="200"/); assert.match(svg,/COMMITCHI/); assert.match(svg,/&lt;x&gt;/); assert.doesNotMatch(svg,/<script|foreignObject|https:\/\//i); assert.match(svg,/2 COMMITS = 1 FOOD/);});
test('supports dark light moods and growth',()=>{for(const mood of ['happy','hungry','critical']) assert.match(renderPet({mood,level:6},{theme:'light'}),/GROWN/); assert.match(renderPet({status:'dead',mood:'dead'}),/3일 무커밋/); assert.match(renderPet({level:10}),/CROWN/);});
test('rejects non PNG sprite data and accepts base64 PNG',()=>{assert.doesNotMatch(renderPet({}, {spriteDataUri:'https://evil.test/x.png'}),/evil\.test/); assert.match(renderPet({}, {spriteDataUri:'data:image/png;base64,AAAA'}),/<image[^>]+data:image\/png;base64,AAAA/);});

test('badge identifies the selected species and generation, including safe character text',()=>{
  const svg=renderPet({generation:2,character:{id:'mogu',name:'모구 <버섯>',accent:'#ef8b98'}},{spriteDataUri:'data:image/png;base64,AAAA'});
  assert.match(svg,/모구 &lt;버섯&gt;/);
  assert.match(svg,/GEN 2/);
  assert.match(svg,/#ef8b98/);
  assert.doesNotMatch(svg,/<버섯>/);
});

test('dead pets retain their own sprite instead of all becoming the same ghost',()=>{
  const svg=renderPet({status:'dead',generation:4,character:{id:'luna',name:'루나'}},{spriteDataUri:'data:image/png;base64,BBBB'});
  assert.match(svg,/<image[^>]+data:image\/png;base64,BBBB/);
  assert.match(svg,/DEAD/);
  assert.match(svg,/루나/);
  assert.doesNotMatch(renderPet({character:{accent:'red\" onload=\"bad'}}),/onload/);
});
