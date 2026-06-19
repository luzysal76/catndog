const l="https://text.pollinations.ai/openai",m=`당신은 반려동물 건강 전문 AI입니다.
제공된 반려동물 대변 사진을 분석하여 아래 형식의 JSON만 반환하세요.
절대 다른 텍스트를 포함하지 마세요.

{
  "status": "normal|soft|diarrhea|constipation|blood|unknown",
  "confidence": 0~100,
  "description": "분석 결과 설명 (한국어, 2-3문장)",
  "advice": "보호자 조언 (한국어, 1-2문장)",
  "urgency": "low|medium|high"
}`;async function p(i){var c,e,t;if(!navigator.onLine)throw new Error("오프라인 상태입니다. 인터넷 연결을 확인해주세요.");const a=await fetch(l,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"openai-large",messages:[{role:"system",content:m},{role:"user",content:[{type:"image_url",image_url:{url:i}},{type:"text",text:"이 반려동물의 대변 사진을 분석해주세요."}]}],temperature:.3,max_tokens:512})});if(!a.ok)throw new Error(`AI 분석 서버 오류 (${a.status})`);const s=await a.text();let r;try{r=JSON.parse(s)}catch{throw new Error("AI 서버 응답을 파싱할 수 없습니다. 잠시 후 다시 시도해주세요.")}const n=((t=(e=(c=r==null?void 0:r.choices)==null?void 0:c[0])==null?void 0:e.message)==null?void 0:t.content)||"";try{const o=n.match(/\{[\s\S]*\}/);if(o){const d=JSON.parse(o[0]);if(d.status&&d.description)return d}}catch{}throw new Error("AI가 분석 결과를 반환하지 않았습니다. 사진을 다시 확인하거나 잠시 후 재시도해주세요.")}function g(i){return new Promise((h,a)=>{const s=new FileReader;s.onload=r=>{const n=new Image;n.onload=()=>{let{width:e,height:t}=n;(e>800||t>800)&&(e>t?(t=Math.round(t*800/e),e=800):(e=Math.round(e*800/t),t=800));const o=document.createElement("canvas");o.width=e,o.height=t,o.getContext("2d").drawImage(n,0,0,e,t),h(o.toDataURL("image/jpeg",.7))},n.onerror=a,n.src=r.target.result},s.onerror=a,s.readAsDataURL(i)})}export{p as a,g as r};
