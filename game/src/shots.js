import {makeWorld} from './world.js';
import {newPlayer} from './player.js';
import {spawnGuards} from './guard.js';
export function staged(name,seed=1){const world=makeWorld(0),p=newPlayer(world),g=spawnGuards(world),state={level:0,time:47.3,alarm:0,alert:0,lastKnown:{x:700,y:330},won:false,started:true};
if(name==='start'){p.x=350;p.y=500;p.seen=false;world.relics[0].taken=true;p.suspicion=.18;g[0].x=470;g[0].y=420;g[0].angle=3.25;g[0].suspicion=.22;state.time=62.4}
if(name==='play'){p.x=620;p.y=510;p.coin={x:760,y:315,life:3.1,ping:true};g[0].x=350;g[0].y=295;g[0].angle=0;g[0].pause=.15;state.time=38.6}
if(name==='alarm'){p.x=805;p.y=510;p.seen=true;p.suspicion=.68;state.alert=3.6;state.alarm=.86;state.lastKnown={x:742,y:345};g.forEach((x,i)=>{x.mode='alert';x.suspicion=.65+i*.05;x.x=[620,820,910,665,1000][i];x.y=[420,245,410,570,570][i];x.angle=Math.atan2(345-x.y,742-x.x)})}
if(name==='end'){state.won=true;state.time=91.8;world.relics.forEach(r=>r.taken=true);p.seen=false}
return {world,p,guards:g,state}}
