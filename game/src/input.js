export function bindInput(canvas){const down=new Set(),mouse={x:640,y:360},keys={};let coin=false;
const map={KeyW:'up',ArrowUp:'up',KeyS:'down',ArrowDown:'down',KeyA:'left',ArrowLeft:'left',KeyD:'right',ArrowRight:'right',ShiftLeft:'sneak',ShiftRight:'sneak'};
addEventListener('keydown',e=>{if(map[e.code]){down.add(e.code);e.preventDefault()}if(e.code==='KeyR')window.dispatchEvent(new Event('restart-game'))});addEventListener('keyup',e=>down.delete(e.code));
const point=e=>{const r=canvas.getBoundingClientRect();mouse.x=(e.clientX-r.left)*1280/r.width;mouse.y=(e.clientY-r.top)*720/r.height};canvas.addEventListener('pointermove',point);canvas.addEventListener('pointerdown',e=>{point(e);coin=true;canvas.focus?.()});
return {keys,mouse,get coin(){return coin},set coin(v){coin=v},poll(){for(const k of ['up','down','left','right','sneak'])keys[k]=[...down].some(c=>map[c]===k)}}}
export function stageKeys(input,values){for(const key of Object.keys(values))if(values[key])input.keys[key]=values[key]}
