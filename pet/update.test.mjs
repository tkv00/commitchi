import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm,mkdir,copyFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {updatePet} from './update.mjs';

async function seedSprite(root,filename='commitchi.png') {
  await mkdir(join(root,'assets/sprites'),{recursive:true});
  await copyFile(new URL('../assets/sprites/commitchi.png',import.meta.url),join(root,'assets/sprites',filename));
}

test('unsupported private mode stops before querying or creating pet files',async()=>{
  const root=await mkdtemp(join(tmpdir(),'commitchi-test-'));
  try { await assert.rejects(updatePet({root,includePrivate:true,fetchDays:async()=>{throw new Error('must not query');}}),/private.*not supported/i); }
  finally {await rm(root,{recursive:true,force:true});}
});

test('first successful update adopts today, persists real counts and is byte-idempotent',async()=>{
  const root=await mkdtemp(join(tmpdir(),'commitchi-test-'));
  try {
    await seedSprite(root);
    const opts={root,asOf:'2026-10-07',owner:'tkv00',fetchDays:async()=>[{date:'2026-10-07',commits:3}]};
    const state=await updatePet(opts);
    assert.equal(state.totalCommits,3);assert.equal(state.totalFoodEarned,1);assert.equal(state.commitRemainder,1);
    const first=await readFile(join(root,'pet/data/state.json'),'utf8');
    assert.match(await readFile(join(root,'assets/commitchi.svg'),'utf8'),/<svg/);
    assert.match(await readFile(join(root,'assets/commitchi-light.svg'),'utf8'),/<svg/);
    await updatePet(opts);
    assert.equal(await readFile(join(root,'pet/data/state.json'),'utf8'),first);
    await assert.rejects(updatePet({...opts,owner:'someone-else'}),/owner/i);
  } finally {await rm(root,{recursive:true,force:true});}
});
test('API failure and partial catch-up preserve every existing output',async()=>{
  const root=await mkdtemp(join(tmpdir(),'commitchi-test-'));
  try {
    await seedSprite(root);
    await updatePet({root,asOf:'2026-10-07',owner:'tkv00',fetchDays:async()=>[{date:'2026-10-07',commits:2}]});
    const files=['pet/data/ledger.json','pet/data/state.json','assets/commitchi.svg'];
    const before=await Promise.all(files.map(f=>readFile(join(root,f),'utf8')));
    await assert.rejects(updatePet({root,asOf:'2026-10-12',owner:'tkv00',fetchDays:async()=>{throw new Error('API down');}}),/API down/);
    await assert.rejects(updatePet({root,asOf:'2026-10-12',owner:'tkv00',fetchDays:async()=>[{date:'2026-10-12',commits:0}]}));
    assert.deepEqual(await Promise.all(files.map(f=>readFile(join(root,f),'utf8'))),before);
  } finally {await rm(root,{recursive:true,force:true});}
});

test('rebirth requires its own sprite and preserves all outputs when that sprite is missing',async()=>{
  const root=await mkdtemp(join(tmpdir(),'commitchi-test-'));
  try {
    await seedSprite(root);
    await updatePet({root,owner:'tkv00',asOf:'2026-10-01',fetchDays:async()=>[{date:'2026-10-01',commits:2}]});
    const files=['pet/data/ledger.json','pet/data/state.json','assets/commitchi.svg','assets/commitchi-light.svg'];
    const before=await Promise.all(files.map(f=>readFile(join(root,f),'utf8')));
    const rebirth={root,owner:'tkv00',asOf:'2026-10-06',fetchDays:async()=>[
      {date:'2026-10-01',commits:2},{date:'2026-10-02',commits:0},{date:'2026-10-03',commits:0},
      {date:'2026-10-04',commits:0},{date:'2026-10-05',commits:0},{date:'2026-10-06',commits:2}
    ]};
    await assert.rejects(updatePet(rebirth),/mogu\.png/);
    assert.deepEqual(await Promise.all(files.map(f=>readFile(join(root,f),'utf8'))),before);
    await seedSprite(root,'mogu.png');
    const state=await updatePet(rebirth);
    assert.equal(state.character.id,'mogu');
    assert.equal(state.generation,2);
    assert.match(await readFile(join(root,'assets/commitchi.svg'),'utf8'),/모구/);
  } finally {await rm(root,{recursive:true,force:true});}
});
