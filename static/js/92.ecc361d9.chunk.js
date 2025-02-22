(()=>{"use strict";const e=[{type:"main",data:[{name:"HPDelta",data:705,percent:!1},{name:"HPAddedRatio",data:43.2,percent:!0},{name:"AttackDelta",data:352.8,percent:!1},{name:"AttackAddedRatio",data:43.2,percent:!0},{name:"DefenceAddedRatio",data:54,percent:!0},{name:"CriticalChanceBase",data:32.4,percent:!0},{name:"CriticalDamageBase",data:64.8,percent:!0},{name:"BreakDamageAddedRatioBase",data:64.8,percent:!0},{name:"SpeedDelta",data:25,percent:!1},{name:"StatusProbabilityBase",data:43.2,percent:!0},{name:"IceAddedRatio",data:38.8,percent:!0},{name:"ImaginaryAddedRatio",data:38.8,percent:!0},{name:"PhysicalAddedRatio",data:38.8,percent:!0},{name:"FireAddedRatio",data:38.8,percent:!0},{name:"WindAddedRatio",data:38.8,percent:!0},{name:"ThunderAddedRatio",data:38.8,percent:!0},{name:"QuantumAddedRatio",data:38.8,percent:!0},{name:"SPRatioBase",data:19.4,percent:!0},{name:"HealRatioBase",data:34.5,percent:!0}]},{type:"sub",data:[{name:"HPDelta",data:42.4,percent:!1},{name:"HPAddedRatio",data:4.32,percent:!0},{name:"AttackDelta",data:21.2,percent:!1},{name:"AttackAddedRatio",data:4.32,percent:!0},{name:"DefenceDelta",data:21.2,percent:!1},{name:"DefenceAddedRatio",data:5.4,percent:!0},{name:"CriticalChanceBase",data:3.24,percent:!0},{name:"CriticalDamageBase",data:6.48,percent:!0},{name:"BreakDamageAddedRatioBase",data:6.48,percent:!0},{name:"SpeedDelta",data:2.6,percent:!1},{name:"StatusProbabilityBase",data:4.32,percent:!0},{name:"StatusResistanceBase",data:4.32,percent:!0}]}];const a={1:{main:["hp"],sub:["hp","atk","def","spd","crit_rate","crit_dmg","effect_res","effect_hit","break_dmg"]},2:{main:["atk"],sub:["hp","atk","def","spd","crit_rate","crit_dmg","effect_res","effect_hit","break_dmg"]},3:{main:["atk","hp","def","crit_rate","crit_dmg","heal_rate","effect_hit"],sub:["hp","atk","def","spd","crit_rate","crit_dmg","effect_res","effect_hit","break_dmg"]},4:{main:["atk","hp","def","spd"],sub:["hp","atk","def","spd","crit_rate","crit_dmg","effect_res","effect_hit","break_dmg"]},5:{main:["atk","hp","def","break_dmg","sp_rate"],sub:["hp","atk","def","spd","crit_rate","crit_dmg","effect_res","effect_hit","break_dmg"]},6:{main:["atk","hp","def","physical_dmg","fire_dmg","ice_dmg","lightning_dmg","wind_dmg","quantum_dmg","imaginary_dmg"],sub:["hp","atk","def","spd","crit_rate","crit_dmg","effect_res","effect_hit","break_dmg"]}};const t=[{fieldName:"HPDelta",icon:"IconMaxHP",type:"hp",name:"\u751f\u547d\u529b",percent:!1,range:[34,38,42]},{fieldName:"HPAddedRatio",icon:"IconMaxHP",type:"hp",name:"\u751f\u547d\u529b%\u6578",percent:!0,range:[3.45,3.89,4.32]},{fieldName:"AttackDelta",icon:"IconAttack",type:"atk",name:"\u653b\u64ca\u529b",percent:!1,range:[17,19,21]},{fieldName:"AttackAddedRatio",icon:"IconAttack",type:"atk",name:"\u653b\u64ca\u529b%\u6578",percent:!0,range:[3.45,3.89,4.32]},{fieldName:"DefenceDelta",icon:"IconDefence",type:"def",name:"\u9632\u79a6\u529b",percent:!1,range:[17,19,21]},{fieldName:"DefenceAddedRatio",icon:"IconDefence",type:"def",name:"\u9632\u79a6\u529b%\u6578",percent:!0,range:[4.32,4.86,5.4]},{fieldName:"CriticalChanceBase",icon:"IconCriticalChance",type:"crit_rate",name:"\u66b4\u64ca\u7387",percent:!0,range:[2.6,2.9,3.2]},{fieldName:"CriticalDamageBase",icon:"IconCriticalDamage",type:"crit_dmg",name:"\u66b4\u64ca\u50b7\u5bb3",percent:!0,range:[5.2,5.8,6.48]},{fieldName:"SpeedDelta",icon:"IconSpeed",type:"spd",name:"\u901f\u5ea6",percent:!1,range:[2,2.3,2.6]},{fieldName:"BreakDamageAddedRatioBase",icon:"IconBreakUp",type:"break_dmg",name:"\u64ca\u7834\u7279\u653b",percent:!0,range:[5.2,5.8,6.5]},{fieldName:"SPRatioBase",icon:"IconEnergyRecovery",type:"sp_rate",name:"\u80fd\u91cf\u5145\u80fd\u6548\u7387",percent:!0},{fieldName:"HealRatioBase",icon:"IconHealRatio",type:"heal_rate",name:"\u6cbb\u7642\u52a0\u6210",percent:!0},{fieldName:"StatusProbabilityBase",icon:"IconStatusProbability",type:"effect_hit",name:"\u6548\u679c\u547d\u4e2d",percent:!0,range:[3.45,3.89,4.32]},{fieldName:"StatusResistanceBase",icon:"IconStatusResistance",type:"effect_res",name:"\u6548\u679c\u6297\u6027",percent:!0,range:[3.45,3.89,4.32]},{fieldName:"PhysicalAddedRatio",icon:"IconPhysicalAddedRatio",type:"physical_dmg",name:"\u7269\u7406\u5c6c\u6027\u50b7\u5bb3\u63d0\u9ad8",percent:!0},{fieldName:"FireAddedRatio",icon:"IconFireAddedRatio",type:"fire_dmg",name:"\u706b\u5c6c\u6027\u50b7\u5bb3\u63d0\u9ad8",percent:!0},{fieldName:"IceAddedRatio",icon:"IconIceAddedRatio",type:"ice_dmg",name:"\u51b0\u5c6c\u6027\u50b7\u5bb3\u63d0\u9ad8",percent:!0},{fieldName:"ThunderAddedRatio",icon:"IconThunderAddedRatio",type:"lightning_dmg",name:"\u96f7\u5c6c\u6027\u50b7\u5bb3\u63d0\u9ad8",percent:!0},{fieldName:"WindAddedRatio",icon:"IconWindAddedRatio",type:"wind_dmg",name:"\u98a8\u5c6c\u6027\u50b7\u5bb3\u63d0\u9ad8",percent:!0},{fieldName:"QuantumAddedRatio",icon:"IconQuantumAddedRatio",type:"quantum_dmg",name:"\u91cf\u5b50\u5c6c\u6027\u50b7\u5bb3\u63d0\u9ad8",percent:!0},{fieldName:"ImaginaryAddedRatio",icon:"IconImaginaryAddedRatio",type:"imaginary_dmg",name:"\u865b\u6578\u5c6c\u6027\u50b7\u5bb3\u63d0\u9ad8",percent:!0}];function n(e,t){let n=5,d="";e=Object.entries(e).sort(((e,a)=>a[1]-e[1])),1!==t&&2!==t&&(e.forEach((e=>{let[i,r]=e,c=!a[t].sub.includes(i);a[t].main.includes(i)&&""===d&&c&&0!==r&&(d=i,n+=3*r)})),""===d&&e.forEach((e=>{let[i,r]=e;a[t].main.includes(i)&&""===d&&(d=i,n+=3*r)})));let i=0;return e.forEach((e=>{let[r,c]=e;r!==d&&i<4&&a[t].sub.includes(r)&&(n+=c,i+=1)})),n}onmessage=function(a){let d=a.data.SubData,i=parseInt(a.data.partsIndex),r=t.find((e=>e.name===a.data.MainData)),c=void 0!==a.data.deviation?a.data.deviation:0;var o=0;d.forEach((e=>{o+=Number(e.count)}));let m=function(e,a){const t=[];return function n(d,i,r){if(d.length!==a)for(let a=0;a<=e-i;a++)d.push(a),n(d,i+a,d.length),d.pop();else i===e&&t.push([...d])}([],0),t}(o,d.filter((e=>!e.locked)).length),p=function(e){let a={hp:0,atk:0,def:0,spd:0,crit_rate:0,crit_dmg:0,break_dmg:0,heal_rate:0,sp_rate:0,effect_hit:0,effect_res:0,physical_dmg:0,fire_dmg:0,ice_dmg:0,lightning_dmg:0,wind_dmg:0,quantum_dmg:0,imaginary_dmg:0};return e.forEach((e=>{let n=t.find((a=>a.name===e.name)).type;a[n]=parseFloat(e.value)})),a}(a.data.standard),l=[];d.forEach((e=>{let a=t.find((a=>a.name===e.subaffix));l.push({type:a.type,fieldName:a.fieldName,num:Number(p[a.type]),locked:!!e.locked})}));let f=p[r.type],s=[],g=function(a,d,i,r){let c=0;var o=3*r;let m=[];1!==a&&2!==a&&(c+=o);i.forEach((a=>{var n=parseFloat(a.data).toFixed(2);let i=t.find((e=>e.name===a.subaffix));var r=e.find((e=>"sub"===e.type)).data.find((e=>e.name===i.fieldName)).data,c=parseFloat(n/r).toFixed(2);let o=parseFloat(d[i.type]*c);m.push({type:i.fieldName,affixmutl:o})})),console.log(n(d,a)),m.forEach((e=>{"AttackDelta"!==e.type&&"DefenceDelta"!==e.type&&"HPDelta"!==e.type&&(c+=e.affixmutl)}));let p=0;return p=100*parseFloat(c/n(d,a)),parseFloat(p).toFixed(1)}(i,p,d,f);new Promise((async(a,r)=>{m.forEach(((a,r)=>{let c=function(e){const a=[],t=[0,1,2];return function n(d,i){if(d===e.length)return void a.push([...i]);const r=e[d],c=[];!function e(a){if(a.length!==r)for(const n of t)a.push(n),e(a),a.pop();else c.push([...a])}([]);for(const e of c)i.push(e),n(d+1,i),i.pop()}(0,[]),a}(a);c.forEach((a=>{let r=0;1!==i&&2!==i&&(r=3*f);let c=0,o=[];a.forEach(((a,n)=>{let i=l[n],r=t.find((e=>e.fieldName===i.fieldName)).range;c=0===d[n].count?d[n].data:r[1],a.forEach((e=>c+=r[e]));let m=e.find((e=>"sub"===e.type)).data.find((e=>e.name===i.fieldName)).data,f=parseFloat(c/m).toFixed(2),s=parseFloat(p[i.type]*f);o.push({type:i.fieldName,affixmutl:s})})),o.forEach((e=>{"AttackDelta"!==e.type&&"DefenceDelta"!==e.type&&"HPDelta"!==e.type&&(r+=e.affixmutl)}));let m=Number((100*parseFloat(r/n(p,i))).toFixed(2));s.push(m)}))})),a(g)})).then((e=>{let a,t=JSON.parse(JSON.stringify(s)).filter((e=>e-c>Number(g))).length/s.length.toFixed(2),n=JSON.parse(JSON.stringify(s)),d=[];[{rank:"S+",stand:85,color:"rgb(239, 68, 68)",tag:"S+"},{rank:"S",stand:70,color:"rgb(239, 68, 68)",tag:"S"},{rank:"A",stand:50,color:"rgb(234, 179, 8)",tag:"A"},{rank:"B",stand:35,color:"rgb(234, 88 , 12)",tag:"B"},{rank:"C",stand:15,color:"rgb(163, 230, 53)",tag:"C"},{rank:"D",stand:0,color:"rgb(22,163,74)",tag:"D"}].forEach(((e,t)=>{let i=n.filter((a=>a>=e.stand));n=n.filter((a=>a<e.stand)),d.push({label:e.tag,value:Number((100*parseFloat(i.length/s.length)).toFixed(2)),color:e.color,tag:e.rank}),e.stand<=g&&void 0===a&&(a=e)})),this.postMessage({expRate:t,relicscore:e,relicrank:a,returnData:d})}))}})();
//# sourceMappingURL=92.ecc361d9.chunk.js.map