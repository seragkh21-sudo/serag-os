(async()=>{
  try{
    const V='14';
    const res=await fetch(`/legacy.html?v=${V}`,{cache:'no-store',headers:{'Cache-Control':'no-cache'}});
    if(!res.ok)throw new Error('Legacy app failed to load');
    let html=await res.text();

    html=html.replace('</head>',`<link rel="stylesheet" href="/dashboard-v2.css?v=${V}"/>
<link rel="stylesheet" href="/english-learning-v6.css?v=${V}"/>
<link rel="stylesheet" href="/english-focus-v7.css?v=${V}"/>
<link rel="stylesheet" href="/english-v8.css?v=${V}"/>
<link rel="stylesheet" href="/english-v9.css?v=${V}"/>
<style>#appView.hidden~#v5BottomNav,#appView.hidden~#v5MobileMore{display:none!important}</style>
</head>`);

    const tasksNav='<button data-page="tasks" type="button">المهام</button>';
    html=html.replace(tasksNav,tasksNav+'\n      <button data-page="calendar" type="button">التقويم</button>');

    const tipCard='<section class="card span4"><h3>ملاحظة اليوم</h3><div id="homeTip" class="notice">سجّل أكلك ومياهك، والملخص هيتحدث تلقائيًا.</div></section>';
    const homeV2=`${tipCard}
        <section class="card span8 weekly-card">
          <div class="section-head v2-section-head">
            <div><h3>تقدم الأسبوع</h3><p class="muted">آخر 7 أيام — شارت واحد بدل زحمة أرقام.</p></div>
            <div id="weeklyMetricTabs" class="metric-tabs" aria-label="اختيار الشارت">
              <button class="metric-tab active" data-metric="water" type="button">المياه</button>
              <button class="metric-tab" data-metric="calories" type="button">السعرات</button>
              <button class="metric-tab" data-metric="tasks" type="button">المهام</button>
              <button class="metric-tab" data-metric="workouts" type="button">الجيم</button>
            </div>
          </div>
          <div class="weekly-summary"><strong id="weeklyHeadline">—</strong><span id="weeklyInsight" class="muted">بيتحسب من بياناتك الفعلية.</span></div>
          <div id="weeklyChartCanvas" class="weekly-chart" aria-label="شارت تقدم الأسبوع"></div>
        </section>
        <section class="card span4 mini-calendar-card">
          <div class="section-head"><div><h3>الأيام الجاية</h3><p class="muted">المواعيد والـdeadlines في مكان واحد.</p></div><button id="openCalendarFromHome" class="text-btn" type="button">عرض الكل</button></div>
          <div id="homeWeekStrip" class="week-strip"></div>
          <div id="homeUpcomingList" class="home-upcoming"></div>
        </section>`;
    html=html.replace(tipCard,homeV2);

    const calendarPage=`
    <section id="page-calendar" class="page hidden">
      <header class="top">
        <div><h2>التقويم</h2><p class="muted">المهام، الجيم، الـdeadlines والتذكيرات في View واحدة.</p></div>
        <button id="openGoogleCalendar" class="btn desktop-only" type="button">فتح Google Calendar ↗</button>
      </header>
      <div class="calendar-layout">
        <section class="card calendar-main">
          <div class="calendar-toolbar">
            <button id="calendarPrev" class="icon-btn calendar-arrow" type="button" aria-label="الشهر السابق">›</button>
            <div><h3 id="calendarMonthTitle">—</h3><button id="calendarToday" class="text-btn" type="button">اليوم</button></div>
            <button id="calendarNext" class="icon-btn calendar-arrow" type="button" aria-label="الشهر التالي">‹</button>
          </div>
          <div class="calendar-weekdays"><span>السبت</span><span>الأحد</span><span>الاثنين</span><span>الثلاثاء</span><span>الأربعاء</span><span>الخميس</span><span>الجمعة</span></div>
          <div id="calendarGrid" class="calendar-grid"></div>
        </section>
        <aside class="calendar-side">
          <section class="card">
            <div class="section-head"><div><h3>إضافة موعد</h3><p class="muted">هيتحفظ ويتزامن مع حسابك على كل الأجهزة.</p></div></div>
            <form id="calendarEventForm" class="form">
              <input id="calendarEventTitle" required placeholder="اسم الموعد"/>
              <input id="calendarEventAt" type="datetime-local" required/>
              <select id="calendarEventCategory"><option value="general">عام</option><option value="work">شغل</option><option value="english">English</option><option value="fitness">Gym</option><option value="creative">Creative</option></select>
              <button class="btn primary" type="submit">إضافة للتقويم</button>
            </form>
          </section>
          <section class="card">
            <div class="section-head"><div><h3 id="selectedDayTitle">مواعيد اليوم</h3><p class="muted">اضغط على أي يوم في الشهر.</p></div></div>
            <div id="selectedDayEvents" class="calendar-events-list"></div>
          </section>
          <section class="card google-lite-card">
            <div class="google-lite-head"><span class="google-mark">G</span><div><strong>Google Calendar</strong><div class="muted">تقدر تضيف أي موعد إلى Google بنقرة واحدة. المزامنة التلقائية الكاملة محتاجة Google OAuth.</div></div></div>
          </section>
        </aside>
      </div>
    </section>`;

    const mainClose='\n  </main>\n</div>\n\n<button id="quickFab"';
    html=html.replace(mainClose,calendarPage+mainClose);
    html=html.replace('</body>',`<script src="/dashboard-v2.js?v=${V}"></script>
<script src="/english-v3.js?v=${V}"></script>
<script src="/english-audio-v4.js?v=${V}"></script>
<script src="/microsoft-tts-v1.js?v=${V}"></script>
<script src="/serag-v5.js?v=${V}"></script>
<script src="/english-content-v9.js?v=${V}"></script>
<script src="/english-learning-v6.js?v=${V}"></script>
<script src="/english-review-v10-data.js?v=${V}"></script>
<script src="/english-review-v10.js?v=${V}"></script>
<script src="/english-review-v10-fallback.js?v=${V}"></script>
<script src="/english-attempt-sync-v11.js?v=${V}"></script>
<script src="/english-focus-v7.js?v=${V}"></script>
<script src="/voice-commands-v1.js?v=1"></script>
<script>document.addEventListener("click",function(e){if(e.target.closest&&e.target.closest("[data-open-article]")){var p=document.getElementById("articleViewPane");if(p)p.dataset.v5Words=""}},true);</script>
</body>`);

    document.open();
    document.write(html);
    document.close();
  }catch(err){
    document.body.innerHTML='<div class="boot"><div class="boot-card"><div class="boot-logo">Serag OS</div><div class="boot-sub">حصلت مشكلة في تحميل الواجهة. جرّب Refresh.</div></div></div>';
    console.error(err);
  }
})();