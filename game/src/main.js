import {FIXED,T} from './config.js';
import {makeWorld} from './world.js';
import {newPlayer,updatePlayer} from './player.js';
import {spawnGuards,updateGuards,updateAlarm} from './guard.js';
import {bindInput} from './input.js';
import {draw} from './render.js';
import {staged} from './shots.js';
import {sound} from './audio.js';
import {sees,clearRay,shadowed,covered} from './vision.js';

const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d'),params=new URLSearchParams(location.search),shot=params.get('shot');
let level=0,world,p,guards,state,coverState={hidden:false},acc=0,last=0,events={},stagedMode=!!shot;
function fresh(n){level=n;world=makeWorld(n);p=newPlayer(world);guards=spawnGuards(world);state={level:n,time:0,alarm:0,alert:0,lastKnown:{x:p.x,y:p.y},won:false,started:true,total:0};coverState={hidden:false}}
if(stagedMode){({world,p,guards,state}=staged(shot,Number(params.get('seed')||1)));coverState={hidden:shot==='start'||shot==='alarm'}}else fresh(0);
function step(dt){if(state.won)return;state.time+=dt;events={};input.poll();coverState=updatePlayer(p,input,dt,world,events);if(events.step)sound('step',p,guards);if(events.pickup)sound('pickup',p,guards);if(events.coin)sound('coin',p,guards);
updateAlarm(state,dt);const alarmed=updateGuards(guards,p,world,coverState,dt,state,events);if(events.alert)sound('alert',p,guards);if(world.relics.every(r=>r.taken)&&Math.hypot(p.x-world.exit[0],p.y-world.exit[1])<48&&state.alert<=0){if(level===2){state.won=true}else{state.won=true;state.next=level+1}}
}
const input=bindInput(canvas);
function frame(now){if(!last)last=now;const elapsed=Math.min(.1,(now-last)/1000);last=now;if(!stagedMode){acc+=elapsed;while(acc>=FIXED){step(FIXED);acc-=FIXED}}draw(ctx,canvas,world,p,guards,state,coverState);requestAnimationFrame(frame)}
addEventListener('restart-game',()=>{if(!stagedMode&&state.won){fresh(state.next??0);last=0;acc=0}});
addEventListener('keydown',e=>{if(!stagedMode&&state.won&&(e.code==='Enter'||e.code==='Space')){fresh(state.next??0);last=0;acc=0}});
requestAnimationFrame(frame);
window.__GAME={get world(){return world},get player(){return p},get guards(){return guards},get state(){return state},get hidden(){return coverState.hidden},step,vision:{sees,clearRay,shadowed,covered},fixedStep:FIXED};
