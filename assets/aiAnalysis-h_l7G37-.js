const l="https://text.pollinations.ai/openai",m=`당신은 반려동물 건강 전문 AI입니다.
제공된 반려동물 대변 사진을 분석하여 아래 형식의 JSON만 반환하세요.
절대 다른 텍스트를 포함하지 마세요.

{
  "status": "normal|soft|diarrhea|constipation|blood|unknown",
  "confidence": 0~100,
  "description": "분석 결과 설명 (한국어, 2-3문장)",
  "advice": "보호자 조언 (한국어, 1-2문장)",
  "urgency": "low|medium|high"
}`;async function u(s){var n,c,t;if(!navigator.onLine)throw new Error("오프라인 상태입니다. 인터넷 연결을 확인해주세요.");const a=await fetch(l,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"openai-large",messages:[{role:"system",content:m},{role:"user",content:[{type:"image_url",image_url:{url:s}},{type:"text",text:"이 반려동물의 대변 사진을 분석해주세요."}]}],temperature:.3,max_tokens:512})});if(!a.ok)throw new Error(`AI 분석 서버 오류 (${a.status})`);const o=await a.json(),i=((t=(c=(n=o==null?void 0:o.choices)==null?void 0:n[0])==null?void 0:c.message)==null?void 0:t.content)||"";try{const e=i.match(/\{[\s\S]*\}/);if(e)return JSON.parse(e[0])}catch{}return{status:"unknown",confidence:0,description:"AI 분석 결과를 처리할 수 없습니다.",advice:"수의사에게 문의해보세요.",urgency:"low"}}function g(s){return new Promise((d,a)=>{const o=new FileReader;o.onload=i=>{const n=new Image;n.onload=()=>{let{width:t,height:e}=n;(t>800||e>800)&&(t>e?(e=Math.round(e*800/t),t=800):(t=Math.round(t*800/e),e=800));const r=document.createElement("canvas");r.width=t,r.height=e,r.getContext("2d").drawImage(n,0,0,t,e),d(r.toDataURL("image/jpeg",.7))},n.onerror=a,n.src=i.target.result},o.onerror=a,o.readAsDataURL(s)})}export{u as a,g as r};
