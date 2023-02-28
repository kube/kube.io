import{$ as m}from"./index.5cd0287d.js";function $(o){const t=o-1;return t*t*t+1}function l(o,{delay:t=0,duration:n=400,easing:r=m}={}){const s=+getComputedStyle(o).opacity;return{delay:t,duration:n,easing:r,css:c=>`opacity: ${c*s}`}}function g(o,{delay:t=0,duration:n=400,easing:r=$,x:s=0,y:c=0,opacity:i=0}={}){const a=getComputedStyle(o),e=+a.opacity,p=a.transform==="none"?"":a.transform,u=e*(1-i);return{delay:t,duration:n,easing:r,css:(f,y)=>`
			transform: ${p} translate(${(1-f)*s}px, ${(1-f)*c}px);
			opacity: ${e-u*y}`}}export{g as a,l as f};
