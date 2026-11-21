import {C,W,H} from './config.js';
import {conePoints,shadowed,covered} from './vision.js';

const poly=(ctx,pts)=>{ctx.beginPath();ctx.moveTo(pts[0].x,pts[0].y);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i].x,pts[i].y);ctx.closePath()};
const rect=(ctx,r,color)=>{ctx.fillStyle=color;ctx.fillRect(r.x,r.y,r.w,r.h)};
const text=(ctx,value,x,y,size=14,color=C.cream,align='left',weight='600')=>{ctx.font=`${weight} ${size}px system-ui, sans-serif`;ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillStyle=color;ctx.fillText(value,x,y)};

export function draw(ctx,canvas,world,p,guards,state,coverState){
  ctx.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle=C.floor;ctx.fillRect(0,0,W,H);
  ctx.globalAlpha=.18;ctx.fillStyle=C.tile;
  for(let y=74;y<H;y+=42)for(let x=0;x<W;x+=56)ctx.fillRect(x+(Math.floor(y/42)%2)*28,y,54,40);
  ctx.globalAlpha=1;

  for(const s of world.shadows){ctx.fillStyle=C.shadow;ctx.fillRect(s.x,s.y,s.w,s.h);ctx.strokeStyle=C.shadowEdge;ctx.lineWidth=2;ctx.strokeRect(s.x+1,s.y+1,s.w-2,s.h-2)}
  for(const r of world.walls){ctx.fillStyle=C.wood;ctx.fillRect(r.x,r.y,r.w,r.h);ctx.fillStyle=C.woodHi;ctx.fillRect(r.x,r.y,r.w,Math.min(5,r.h));ctx.strokeStyle='#392a25';ctx.lineWidth=2;ctx.strokeRect(r.x+1,r.y+1,r.w-2,r.h-2)}
  for(const r of world.cover){ctx.fillStyle='#71523b';ctx.fillRect(r.x,r.y,r.w,r.h);ctx.fillStyle='#a6794a';ctx.fillRect(r.x+4,r.y+4,r.w-8,6);ctx.strokeStyle='#382d29';ctx.lineWidth=2;ctx.strokeRect(r.x+1,r.y+1,r.w-2,r.h-2)}

  const ex=world.exit[0],ey=world.exit[1],open=world.relics.every(r=>r.taken);
  ctx.save();ctx.translate(ex,ey);ctx.fillStyle=open?'#b9e6cd':'#59636a';ctx.fillRect(-23,-17,46,34);ctx.strokeStyle=open?'#f1e8d2':'#a8b4b6';ctx.lineWidth=3;ctx.strokeRect(-23,-17,46,34);ctx.fillStyle=open?'#263e3b':'#303b43';ctx.fillRect(-16,-10,32,20);ctx.restore();
  ctx.font='700 10px system-ui, sans-serif';const exitLabel=open?'SKYLIGHT':'LOCKED',tw=ctx.measureText(exitLabel).width+18;ctx.fillStyle='rgba(16,25,35,.92)';ctx.fillRect(ex-tw/2,ey+23,tw,21);ctx.strokeStyle=open?'#99dfbb':'#75838a';ctx.lineWidth=1;ctx.strokeRect(ex-tw/2+.5,ey+23.5,tw-1,20);text(ctx,exitLabel,ex,ey+34,10,open?C.mint:C.muted,'center','700');

  for(const r of world.relics)if(!r.taken){ctx.save();ctx.translate(r.x,r.y);ctx.rotate(Math.PI/4);ctx.fillStyle=C.gold;ctx.fillRect(-9,-9,18,18);ctx.strokeStyle='#fff0bb';ctx.lineWidth=2;ctx.strokeRect(-8,-8,16,16);ctx.restore();ctx.beginPath();ctx.arc(r.x,r.y,16,0,Math.PI*2);ctx.strokeStyle='rgba(255,211,108,.38)';ctx.lineWidth=1;ctx.stroke()}

  for(const g of guards){const pts=conePoints(g,world);poly(ctx,pts);const alpha=g.mode==='alert'?.38:g.suspicion>.18?.30:.22;ctx.fillStyle=g.mode==='alert'?`rgba(239,69,69,${alpha})`:g.suspicion>.18?`rgba(241,139,61,${alpha})`:`rgba(242,206,98,${alpha})`;ctx.fill();ctx.strokeStyle='rgba(255,244,210,.5)';ctx.lineWidth=2;ctx.stroke();
    if(g.suspicion>.08){ctx.beginPath();ctx.arc(g.x,g.y,22,-Math.PI/2,-Math.PI/2+Math.PI*2*g.suspicion);ctx.strokeStyle=g.mode==='alert'?C.hot:C.warn;ctx.lineWidth=3;ctx.stroke()}
    ctx.save();ctx.translate(g.x,g.y);ctx.rotate(g.angle);ctx.fillStyle='#273b48';ctx.beginPath();ctx.ellipse(0,2,13,10,0,0,Math.PI*2);ctx.fill();ctx.fillStyle=C.uniform;ctx.beginPath();ctx.arc(0,-2,7,0,Math.PI*2);ctx.fill();ctx.fillStyle=C.red;ctx.fillRect(3,-4,8,3);ctx.restore();
  }
  if(p.coin){ctx.beginPath();ctx.arc(p.coin.x,p.coin.y,14,0,Math.PI*2);ctx.strokeStyle='rgba(241,232,210,.75)';ctx.lineWidth=2;ctx.stroke();ctx.beginPath();ctx.arc(p.coin.x,p.coin.y,7,0,Math.PI*2);ctx.stroke()}
  const pr=(p.r||12)*1.4;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.face||0);ctx.fillStyle=p.seen?C.hot:C.mint;ctx.beginPath();ctx.ellipse(0,0,pr,pr*.82,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(255,255,255,.9)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,pr+2,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#f1e8d2';ctx.beginPath();ctx.moveTo(pr+4,0);ctx.lineTo(pr-2,-4);ctx.lineTo(pr-2,4);ctx.closePath();ctx.fill();ctx.restore();

  ctx.fillStyle='rgba(16,25,35,.96)';ctx.fillRect(0,0,W,64);ctx.fillStyle=C.gold;ctx.fillRect(0,62,W,2);
  text(ctx,'EMBERWICK HEIST',24,22,18,C.cream,'left','800');text(ctx,world.name,24,46,10,C.muted,'left','700');
  text(ctx,`RELICS ${world.relics.filter(r=>r.taken).length}/3`,370,25,13,C.gold,'left','800');
  const hidden=shadowed(p,world)||covered(p,world)||coverState?.hidden;
  text(ctx,hidden?'GHOST':'SEEN',510,25,12,hidden?C.mint:C.warn,'left','800');
  text(ctx,`TIME ${Math.floor(state.time/60).toString().padStart(2,'0')}:${Math.floor(state.time%60).toString().padStart(2,'0')}`,640,25,12,C.cream,'left','700');
  text(ctx,open?'REACH THE SKYLIGHT':'COLLECT ALL RELICS',24,86,12,C.cream,'left','700');
  text(ctx,`${open?'EXIT OPEN':'EXIT LOCKED'} · ${world.name}`,W-24,86,11,open?C.mint:C.muted,'right','700');
  ctx.fillStyle='rgba(16,25,35,.88)';ctx.fillRect(W-235,20,211,20);ctx.fillStyle='#26323a';ctx.fillRect(W-231,24,203,12);ctx.fillStyle=state.alarm>.55?C.hot:C.warn;ctx.fillRect(W-231,24,203*Math.max(0,Math.min(1,state.alarm)),12);text(ctx,'ALARM',W-240,50,9,C.muted,'right','700');
  if(state.alert>0){ctx.fillStyle='rgba(124,34,35,.92)';ctx.fillRect(W/2-135,73,270,33);ctx.strokeStyle='#ff8b6f';ctx.lineWidth=1;ctx.strokeRect(W/2-134.5,73.5,269,32);text(ctx,'GUARDS ALERTED',W/2,90,13,'#fff0df','center','800')}
  if(state.won){ctx.fillStyle='rgba(8,14,20,.76)';ctx.fillRect(0,0,W,H);ctx.fillStyle='rgba(16,25,35,.97)';ctx.fillRect(W/2-245,H/2-114,490,228);ctx.strokeStyle=C.gold;ctx.lineWidth=2;ctx.strokeRect(W/2-244,H/2-113,488,226);text(ctx,'HEIST COMPLETE',W/2,H/2-51,30,C.gold,'center','800');text(ctx,'THE SKYLIGHT IS YOURS',W/2,H/2-7,14,C.cream,'center','700');text(ctx,'PRESS ENTER TO PLAY AGAIN',W/2,H/2+61,12,C.mint,'center','700')}
}
