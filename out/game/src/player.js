import {T,W,H} from './config.js';
import {shadowed,covered} from './vision.js';
export function newPlayer(world){return{x:world.start[0],y:world.start[1],r:12,face:-Math.PI/2,suspicion:0,noise:0,noiseTimer:0,coin:null,seen:false,still:0,foot:0}}
export function updatePlayer(p,input,dt,world,events){let dx=(input.keys.right?1:0)-(input.keys.left?1:0),dy=(input.keys.down?1:0)-(input.keys.up?1:0);const moving=!!(dx||dy),sneak=input.keys.sneak,speed=sneak?T.sneak:T.walk;p.sneak=sneak;if(moving){const m=Math.hypot(dx,dy);dx/=m;dy/=m;p.face=Math.atan2(dy,dx);p.x=Math.max(22,Math.min(W-22,p.x+dx*speed*dt));p.y=Math.max(65,Math.min(H-22,p.y+dy*speed*dt));p.still=0}else p.still+=dt;
for(const r of [...world.walls,...world.cover])if(p.x>r.x-p.r&&p.x<r.x+r.w+p.r&&p.y>r.y-p.r&&p.y<r.y+r.h+p.r){const px=Math.min(Math.max(p.x,r.x),r.x+r.w),py=Math.min(Math.max(p.y,r.y),r.y+r.h),ax=p.x-px,ay=p.y-py;if(Math.abs(ax)>Math.abs(ay))p.x+=Math.sign(ax||1)*(p.r-Math.abs(ax));else p.y+=Math.sign(ay||1)*(p.r-Math.abs(ay))}
if(moving&&!sneak){p.foot-=dt;if(p.foot<=0){p.foot=.38;p.noise=1;p.noiseTimer=.7;events.step=true}}else p.foot=0;if(p.noiseTimer>0){p.noiseTimer-=dt;if(p.noiseTimer<=0)p.noise=0}
if(input.coin){input.coin=false;if(!p.coin){const tx=Math.max(25,Math.min(W-25,input.mouse.x)),ty=Math.max(65,Math.min(H-25,input.mouse.y)),dx=tx-p.x,dy=ty-p.y,d=Math.hypot(dx,dy),range=Math.min(330,d);p.coin={x:p.x+(d?dx/d*range:0),y:p.y+(d?dy/d*range:0),life:4,ping:true}}events.coin=true}
if(p.coin){p.coin.life-=dt;if(p.coin.life<=0)p.coin=null}
for(const r of world.relics)if(!r.taken&&Math.hypot(p.x-r.x,p.y-r.y)<25){r.taken=true;events.pickup=true}
const alcove=p.still>.8&&world.shadows.some(r=>p.x>r.x+18&&p.x<r.x+r.w-18&&p.y>r.y+18&&p.y<r.y+r.h-18);return {hidden:shadowed(p,world)||covered(p,world),alcove,slow:sneak,noise:p.noise};}
