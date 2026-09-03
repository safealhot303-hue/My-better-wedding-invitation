const EVENT_DATE = new Date("2026-09-25T20:00:00+03:00");

function tick(){
  const diff=Math.max(0,EVENT_DATE-new Date());
  const s=Math.floor(diff/1000);
  document.getElementById("days").textContent=String(Math.floor(s/86400)).padStart(2,"0");
  document.getElementById("hours").textContent=String(Math.floor((s%86400)/3600)).padStart(2,"0");
  document.getElementById("minutes").textContent=String(Math.floor((s%3600)/60)).padStart(2,"0");
  document.getElementById("seconds").textContent=String(s%60).padStart(2,"0");
}
tick(); setInterval(tick,1000);

document.getElementById("calendarBtn").addEventListener("click",()=>{
  const url="https://calendar.google.com/calendar/render?action=TEMPLATE"
    +"&text="+encodeURIComponent("حفل خطوبة خالد وندى")
    +"&dates=20260925T170000Z/20260925T190000Z"
    +"&details="+encodeURIComponent("نتشرف بحضوركم ومشاركتنا فرحتنا")
    +"&location="+encodeURIComponent("نادي اليخت ببورفؤاد - بورسعيد");
  window.open(url,"_blank");
});

document.getElementById("rsvpForm").addEventListener("submit",(e)=>{
  e.preventDefault();
  const d=new FormData(e.target);
  const attendance=d.get("attendance")==="yes"?"سأحضر بإذن الله":"أعتذر عن الحضور";
  const text=`تأكيد الحضور%0Aالاسم: ${encodeURIComponent(d.get("name"))}%0Aرقم الجوال: ${encodeURIComponent(d.get("phone"))}%0Aالحضور: ${encodeURIComponent(attendance)}%0Aعدد الحاضرين: ${encodeURIComponent(d.get("guests"))}`;
  const whatsappNumber="201271958455"; // غيّر هذا الرقم إلى رقم استقبال الدعوة بصيغة دولية بدون +
  window.open(`https://wa.me/${whatsappNumber}?text=${text}`,"_blank");
});

const audio=document.getElementById("bgMusic");
const toggle=document.getElementById("musicToggle");
toggle.addEventListener("click",()=>{
  if(audio.paused){audio.play().catch(()=>{});toggle.textContent="♫";}
  else{audio.pause();toggle.textContent="♪";}
});
