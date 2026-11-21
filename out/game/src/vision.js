import {T} from './config.js';
export const inside=(p,r)=>p.x>=r.x&&p.x<=r.x+r.w&&p.y>=r.y&&p.y<=r.y+r.h;
export const covered=(p,w)=>w.cover.some(r=>inside(p,r));
export const shadowed=(p,w)=>w.shadows.some(r=>inside(p,r));
function hit(x,y,w){for(const r of w.walls)if(x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h)return true;for(const r of w.cover)if(x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h)return true;return false}
export function clearRay(a,b,w){const n=Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/7);for(let i=1;i<n;i++){const t=i/n;if(hit(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t,w))return false}return true}
export function sees(g,p,w,cover={}){if(cover.alcove)return false;const d=Math.hypot(p.x-g.x,p.y-g.y);if(d>T.view||d<1)return false;const a=Math.atan2(p.y-g.y,p.x-g.x),diff=Math.atan2(Math.sin(a-g.angle),Math.cos(a-g.angle));return Math.abs(diff)<T.angle&&clearRay(g,p,w)}
export function conePoints(g,w,steps=40){const pts=[{x:g.x,y:g.y}];for(let i=0;i<=steps;i++){const a=g.angle-T.angle+2*T.angle*i/steps;let d=T.view;for(let q=1;q<=48;q++){const r=T.view*q/48,x=g.x+Math.cos(a)*r,y=g.y+Math.sin(a)*r;if(x<0||x>1280||y<0||y>720||hit(x,y,w)){d=r-3;break}}pts.push({x:g.x+Math.cos(a)*d,y:g.y+Math.sin(a)*d})}return pts}
