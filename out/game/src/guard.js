import {T} from './config.js';
import {sees,shadowed} from './vision.js';
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export function spawnGuards(world){return world.guards.map((d,i)=>({x:d.route[0][0],y:d.route[0][1],angle:d.angle,route:d.route,index:0,pause:.4+i*.19,mode:'patrol',suspicion:0,last:{x:0,y:0},timer:0,turn:0,id:i}))}
function steer(g,target,dt,speed,world){const dx=target.x-g.x,dy=target.y-g.y,d=Math.hypot(dx,dy);if(d>1){g.x+=dx/d*Math.min(d,speed*dt);g.y+=dy/d*Math.min(d,speed*dt);g.angle=Math.atan2(dy,dx);for(const r of [...world.walls,...world.cover])if(g.x>r.x-15&&g.x<r.x+r.w+15&&g.y>r.y-15&&g.y<r.y+r.h+15){const px=Math.min(Math.max(g.x,r.x),r.x+r.w),py=Math.min(Math.max(g.y,r.y),r.y+r.h),ax=g.x-px,ay=g.y-py;if(Math.abs(ax)>Math.abs(ay))g.x+=Math.sign(ax||1)*(15-Math.abs(ax));else g.y+=Math.sign(ay||1)*(15-Math.abs(ay))}}return d}
export function updateGuards(gs,p,world,cover,dt,state,events){let spotted=false;const coinTarget=p.coin?gs.reduce((best,g)=>dist(g,p.coin)<dist(best,p.coin)?g:best,gs[0]):null;
for(const g of gs){const sight=sees(g,p,world,cover);if(sight){g.last={x:p.x,y:p.y};g.suspicion=Math.min(1,g.suspicion+dt*(cover.hidden?T.shadowFactor:1));g.timer=0;spotted=true;p.seen=true}else{g.timer+=dt;if(g.timer>T.grace)g.suspicion=Math.max(0,g.suspicion-T.decay*dt)}
if(state.alert>0){g.mode='alert';steer(g,state.lastKnown,dt,T.guardSpeed*1.6,world);continue}
if(g.mode==='alert'){g.mode='search';g.last={...state.lastKnown};g.timer=0}
if(g.suspicion>=1){state.alert=T.lock;state.lastKnown={x:p.x,y:p.y};state.alarm=Math.max(state.alarm,.9);events.alert=true;g.mode='alert';continue}
if(g.suspicion>.48&&!sight){g.mode='search';g.turn+=dt;g.angle+=Math.sin(g.turn*2)*dt*.6}
if(g.mode==='investigate'||g.mode==='search'){if(g.timer<5)steer(g,g.last,dt,T.guardSpeed*1.16,world);else if(g.suspicion<.05)g.mode='patrol'}
if(g.mode==='patrol'){if(g.pause>0){g.pause-=dt;g.angle+=Math.sin((g.pause+g.id)*3)*dt*.6}else{const target=g.route[(g.index+1)%g.route.length],d=steer(g,{x:target[0],y:target[1]},dt,T.guardSpeed,world);if(d<5){g.index=(g.index+1)%g.route.length;g.pause=1.1}}}
if(p.noise&&dist(g,p)<T.noise){g.mode='investigate';g.last={x:p.x,y:p.y};g.timer=0}
if(p.coin&&g===coinTarget&&dist(g,p.coin)<T.coin&&p.coin.ping){g.mode='investigate';g.last={x:p.coin.x,y:p.coin.y};g.timer=0;p.coin.ping=false}
}
if(!spotted&&state.alarm<=0){const peak=Math.max(0,...gs.map(g=>g.suspicion));state.alarm=Math.max(peak,state.alarm-dt*.035)}return spotted}
export function updateAlarm(state,dt){if(state.alert>0){state.alert=Math.max(0,state.alert-dt);state.alarm=Math.max(.35,state.alert/T.lock)}else if(state.alarm<.35)state.alarm=Math.max(0,state.alarm-dt*.06)}
