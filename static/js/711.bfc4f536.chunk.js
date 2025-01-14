(()=>{"use strict";const e=[{type:"main",data:[{name:"HPDelta",data:705,percent:!1},{name:"HPAddedRatio",data:43.2,percent:!0},{name:"AttackDelta",data:352.8,percent:!1},{name:"AttackAddedRatio",data:43.2,percent:!0},{name:"DefenceAddedRatio",data:54,percent:!0},{name:"CriticalChanceBase",data:32.4,percent:!0},{name:"CriticalDamageBase",data:64.8,percent:!0},{name:"BreakDamageAddedRatioBase",data:64.8,percent:!0},{name:"SpeedDelta",data:25,percent:!1},{name:"StatusProbabilityBase",data:43.2,percent:!0},{name:"IceAddedRatio",data:38.8,percent:!0},{name:"ImaginaryAddedRatio",data:38.8,percent:!0},{name:"PhysicalAddedRatio",data:38.8,percent:!0},{name:"FireAddedRatio",data:38.8,percent:!0},{name:"WindAddedRatio",data:38.8,percent:!0},{name:"ThunderAddedRatio",data:38.8,percent:!0},{name:"QuantumAddedRatio",data:38.8,percent:!0},{name:"SPRatioBase",data:19.4,percent:!0},{name:"HealRatioBase",data:34.5,percent:!0}]},{type:"sub",data:[{name:"HPDelta",data:42.4,percent:!1},{name:"HPAddedRatio",data:4.32,percent:!0},{name:"AttackDelta",data:21.2,percent:!1},{name:"AttackAddedRatio",data:4.32,percent:!0},{name:"DefenceDelta",data:21.2,percent:!1},{name:"DefenceAddedRatio",data:5.4,percent:!0},{name:"CriticalChanceBase",data:3.24,percent:!0},{name:"CriticalDamageBase",data:6.48,percent:!0},{name:"BreakDamageAddedRatioBase",data:6.48,percent:!0},{name:"SpeedDelta",data:2.6,percent:!1},{name:"StatusProbabilityBase",data:4.32,percent:!0},{name:"StatusResistanceBase",data:4.32,percent:!0}]}];const a={1:{main:["hp"],sub:["hp","atk","def","spd","crit_rate","crit_dmg","effect_res","effect_hit","break_dmg"]},2:{main:["atk"],sub:["hp","atk","def","spd","crit_rate","crit_dmg","effect_res","effect_hit","break_dmg"]},3:{main:["atk","hp","def","crit_rate","crit_dmg","heal_rate","effect_hit"],sub:["hp","atk","def","spd","crit_rate","crit_dmg","effect_res","effect_hit","break_dmg"]},4:{main:["atk","hp","def","spd"],sub:["hp","atk","def","spd","crit_rate","crit_dmg","effect_res","effect_hit","break_dmg"]},5:{main:["atk","hp","def","break_dmg","sp_rate"],sub:["hp","atk","def","spd","crit_rate","crit_dmg","effect_res","effect_hit","break_dmg"]},6:{main:["atk","hp","def","physical_dmg","fire_dmg","ice_dmg","lightning_dmg","wind_dmg","quantum_dmg","imaginary_dmg"],sub:["hp","atk","def","spd","crit_rate","crit_dmg","effect_res","effect_hit","break_dmg"]}};const t=[{fieldName:"HPDelta",type:"hp",name:"\u751f\u547d\u529b",percent:!1,range:[34,38,42]},{fieldName:"HPAddedRatio",type:"hp",name:"\u751f\u547d\u529b%\u6578",percent:!0,range:[3.45,3.89,4.32]},{fieldName:"AttackDelta",type:"atk",name:"\u653b\u64ca\u529b",percent:!1,range:[17,19,21]},{fieldName:"AttackAddedRatio",type:"atk",name:"\u653b\u64ca\u529b%\u6578",percent:!0,range:[3.45,3.89,4.32]},{fieldName:"DefenceDelta",type:"def",name:"\u9632\u79a6\u529b",percent:!1,range:[17,19,21]},{fieldName:"DefenceAddedRatio",type:"def",name:"\u9632\u79a6\u529b%\u6578",percent:!0,range:[4.32,4.86,5.4]},{fieldName:"CriticalChanceBase",type:"crit_rate",name:"\u66b4\u64ca\u7387",percent:!0,range:[2.6,2.9,3.2]},{fieldName:"CriticalDamageBase",type:"crit_dmg",name:"\u66b4\u64ca\u50b7\u5bb3",percent:!0,range:[5.2,5.8,6.48]},{fieldName:"SpeedDelta",type:"spd",name:"\u901f\u5ea6",percent:!1,range:[2,2.3,2.6]},{fieldName:"BreakDamageAddedRatioBase",type:"break_dmg",name:"\u64ca\u7834\u7279\u653b",percent:!0,range:[5.2,5.8,6.5]},{fieldName:"SPRatioBase",type:"sp_rate",name:"\u80fd\u91cf\u5145\u80fd\u6548\u7387",percent:!0},{fieldName:"HealRatioBase",type:"heal_rate",name:"\u6cbb\u7642\u52a0\u6210",percent:!0},{fieldName:"StatusProbabilityBase",type:"effect_hit",name:"\u6548\u679c\u547d\u4e2d",percent:!0,range:[3.45,3.89,4.32]},{fieldName:"StatusResistanceBase",type:"effect_res",name:"\u6548\u679c\u6297\u6027",percent:!0,range:[3.45,3.89,4.32]},{fieldName:"PhysicalAddedRatio",type:"physical_dmg",name:"\u7269\u7406\u5c6c\u6027\u50b7\u5bb3\u63d0\u9ad8",percent:!0},{fieldName:"FireAddedRatio",type:"fire_dmg",name:"\u706b\u5c6c\u6027\u50b7\u5bb3\u63d0\u9ad8",percent:!0},{fieldName:"IceAddedRatio",type:"ice_dmg",name:"\u51b0\u5c6c\u6027\u50b7\u5bb3\u63d0\u9ad8",percent:!0},{fieldName:"ThunderAddedRatio",type:"lightning_dmg",name:"\u96f7\u5c6c\u6027\u50b7\u5bb3\u63d0\u9ad8",percent:!0},{fieldName:"WindAddedRatio",type:"wind_dmg",name:"\u98a8\u5c6c\u6027\u50b7\u5bb3\u63d0\u9ad8",percent:!0},{fieldName:"QuantumAddedRatio",type:"quantum_dmg",name:"\u91cf\u5b50\u5c6c\u6027\u50b7\u5bb3\u63d0\u9ad8",percent:!0},{fieldName:"ImaginaryAddedRatio",type:"imaginary_dmg",name:"\u865b\u6578\u5c6c\u6027\u50b7\u5bb3\u63d0\u9ad8",percent:!0}];function n(e,t){let n=5,d="";e=Object.entries(e).sort(((e,a)=>a[1]-e[1])),1!==t&&2!==t&&(e.forEach((e=>{let[r,i]=e,c=!a[t].sub.includes(r);a[t].main.includes(r)&&""===d&&c&&0!==i&&(d=r,n+=3*i)})),""===d&&e.forEach((e=>{let[r,i]=e;a[t].main.includes(r)&&""===d&&(d=r,n+=3*i)})));let r=0;return e.forEach((e=>{let[i,c]=e;i!==d&&r<4&&a[t].sub.includes(i)&&(n+=c,r+=1)})),n}onmessage=function(a){let d=a.data.SubData,r=parseInt(a.data.partsIndex),i=t.find((e=>e.name===a.data.MainData));var c=0;d.forEach((e=>{c+=Number(e.count)}));let m=function(e,a){const t=[];return function n(d,r,i){if(d.length!==a)for(let t=1;t<=e-r-(a-d.length-1);t++)d.push(t),n(d,r+t,d.length),d.pop();else r===e&&t.push([...d])}([],0),t}(c+4,4),p=function(e){let a={hp:0,atk:0,def:0,spd:0,crit_rate:0,crit_dmg:0,break_dmg:0,heal_rate:0,sp_rate:0,effect_hit:0,effect_res:0,physical_dmg:0,fire_dmg:0,ice_dmg:0,lightning_dmg:0,wind_dmg:0,quantum_dmg:0,imaginary_dmg:0};return e.forEach((e=>{let n=t.find((a=>a.name===e.name)).type;a[n]=parseFloat(e.value)})),a}(a.data.standard),l=[];d.forEach((e=>{let a=t.find((a=>a.name===e.subaffix));l.push({type:a.type,fieldName:a.fieldName,num:Number(p[a.type])})}));let f=p[i.type],s=[],o=function(a,d,r,i){let c=0;var m=3*i;let p=[];1!==a&&2!==a&&(c+=m);r.forEach((a=>{var n=parseFloat(a.data).toFixed(2);let r=t.find((e=>e.name===a.subaffix));var i=e.find((e=>"sub"===e.type)).data.find((e=>e.name===r.fieldName)).data,c=parseFloat(n/i).toFixed(2);let m=parseFloat(d[r.type]*c);p.push({type:r.fieldName,affixmutl:m})})),console.log(p),console.log(n(d,a)),p.forEach((e=>{"AttackDelta"!==e.type&&"DefenceDelta"!==e.type&&"HPDelta"!==e.type&&(c+=e.affixmutl)}));let l=0;return l=100*parseFloat(c/n(d,a)),parseFloat(l).toFixed(1)}(r,p,d,f);new Promise((async(a,d)=>{m.forEach(((a,d)=>{let i=function(e){const a=[],t=[0,1,2];return function n(d,r){if(d===e.length)return void a.push([...r]);const i=e[d],c=[];!function e(a){if(a.length!==i)for(const n of t)a.push(n),e(a),a.pop();else c.push([...a])}([]);for(const e of c)r.push(e),n(d+1,r),r.pop()}(0,[]),a}(a);i.forEach((a=>{let d=0;1!==r&&2!==r&&(d=3*f);let i=0,c=[];a.forEach(((a,n)=>{i=0;let d=l[n],r=t.find((e=>e.fieldName===d.fieldName)).range;a.forEach((e=>i+=r[e]));let m=e.find((e=>"sub"===e.type)).data.find((e=>e.name===d.fieldName)).data,f=parseFloat(i/m).toFixed(2),s=parseFloat(p[d.type]*f);c.push({type:d.fieldName,affixmutl:s})})),c.forEach((e=>{"AttackDelta"!==e.type&&"DefenceDelta"!==e.type&&"HPDelta"!==e.type&&(d+=e.affixmutl)}));let m=Number((100*parseFloat(d/n(p,r))).toFixed(1));s.push(m)}))})),a(o)})).then((e=>{let a,t=JSON.parse(JSON.stringify(s)).filter((e=>e>=Number(o))),n=parseFloat(t.length/s.length).toFixed(2),d=JSON.parse(JSON.stringify(s)),r=[];[{rank:"S+",stand:85,color:"rgb(239, 68, 68)",tag:"S+"},{rank:"S",stand:75,color:"rgb(239, 68, 68)",tag:"S"},{rank:"A",stand:50,color:"rgb(234, 179, 8)",tag:"A"},{rank:"B",stand:35,color:"rgb(234, 88 , 12)",tag:"B"},{rank:"C",stand:15,color:"rgb(163, 230, 53)",tag:"C"},{rank:"D",stand:0,color:"rgb(22,163,74)",tag:"D"}].forEach(((e,t)=>{let n=d.filter((a=>a>=e.stand));d=d.filter((a=>a<e.stand)),r.push({label:e.tag,value:Number((100*parseFloat(n.length/s.length)).toFixed(2)),color:e.color,tag:e.rank}),e.stand<=o&&void 0===a&&(a=e)})),this.postMessage({expRate:n,relicscore:e,relicrank:a,returnData:r})}))}})();
//# sourceMappingURL=711.bfc4f536.chunk.js.map