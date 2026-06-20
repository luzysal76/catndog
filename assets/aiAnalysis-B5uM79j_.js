const w="https://text.pollinations.ai/openai",g=`당신은 반려동물 건강 전문 AI입니다.
제공된 반려동물 대변 사진을 분석하여 아래 형식의 JSON만 반환하세요.
절대 다른 텍스트를 포함하지 마세요.

{
  "status": "normal|soft|diarrhea|constipation|blood|unknown",
  "confidence": 0~100,
  "description": "분석 결과 설명 (한국어, 2-3문장)",
  "advice": "보호자 조언 (한국어, 1-2문장)",
  "urgency": "low|medium|high"
}`;async function u(l){var t,r,d;if(!navigator.onLine)throw new Error("오프라인 상태입니다. 인터넷 연결을 확인해주세요.");const h={model:"openai-large",messages:[{role:"system",content:g},{role:"user",content:[{type:"image_url",image_url:{url:l}},{type:"text",text:"이 반려동물의 대변 사진을 분석해주세요."}]}],temperature:.3,max_tokens:512},s=new AbortController,i=setTimeout(()=>s.abort(),3e4);let a;try{a=await fetch(w,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(h),signal:s.signal})}catch(n){throw n.name==="AbortError"?new Error("AI 서버 응답이 너무 늦습니다. 잠시 후 다시 시도해주세요."):n}finally{clearTimeout(i)}if(!a.ok)throw new Error(`AI 분석 서버 오류 (${a.status})`);const o=await a.text();let c;try{c=JSON.parse(o)}catch{throw new Error("AI 서버 응답을 파싱할 수 없습니다. 잠시 후 다시 시도해주세요.")}const e=((d=(r=(t=c==null?void 0:c.choices)==null?void 0:t[0])==null?void 0:r.message)==null?void 0:d.content)||"";try{const n=e.match(/\{[\s\S]*\}/);if(n){const m=JSON.parse(n[0]);if(m.status&&m.description)return m}}catch{}throw new Error("AI가 분석 결과를 반환하지 않았습니다. 사진을 다시 확인하거나 잠시 후 재시도해주세요.")}function p(l){return new Promise((h,s)=>{const i=new FileReader;i.onload=a=>{const o=new Image;o.onload=()=>{let{width:e,height:t}=o;(e>800||t>800)&&(e>t?(t=Math.round(t*800/e),e=800):(e=Math.round(e*800/t),t=800));const r=document.createElement("canvas");r.width=e,r.height=t,r.getContext("2d").drawImage(o,0,0,e,t),h(r.toDataURL("image/jpeg",.7))},o.onerror=s,o.src=a.target.result},i.onerror=s,i.readAsDataURL(l)})}export{u as a,p as r};
