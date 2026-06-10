(function(){
  const SITE = 'tantantan';
  const STORAGE_KEY = SITE + '_visits';
  const NOW = Date.now();
  const SESSION = { id: NOW, start: NOW, page: location.pathname, referrer: document.referrer || 'direct' };

  // Load existing data
  let data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || { visits: [], clicks: [] };
  if(!Array.isArray(data.visits)) data.visits = [];
  if(!Array.isArray(data.clicks)) data.clicks = [];

  // Track time on page (send on leave)
  function trackLeave(){
    const duration = Math.round((Date.now() - SESSION.start) / 1000);
    if(duration < 2) return; // ignore bounces <2s
    SESSION.duration = duration;
    data.visits.push(SESSION);
    // Keep last 500 visits
    if(data.visits.length > 500) data.visits = data.visits.slice(-500);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  // Track clicks on tracked elements
  document.addEventListener('click', function(e){
    const el = e.target.closest('[data-track]');
    if(!el) return;
    data.clicks.push({ label: el.dataset.track, time: Date.now(), page: location.pathname });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  });

  // Track leave events
  window.addEventListener('beforeunload', trackLeave);
  document.addEventListener('visibilitychange', function(){
    if(document.visibilityState === 'hidden') trackLeave();
  });

  // Initial visit log
  SESSION.duration = 0;
  data.visits.push(SESSION);

  // Export function (for dashboard)
  window.__tracker = {
    data: function(){ return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { visits: [], clicks: [] }; },
    exportJSON: function(){ return JSON.stringify(window.__tracker.data(), null, 2); },
    exportCSV: function(){
      const d = window.__tracker.data();
      let csv = 'Date,Page,Référant,Durée (s)\n';
      d.visits.forEach(v => csv += new Date(v.start).toISOString()+','+v.page+','+(v.referrer||'')+','+(v.duration||0)+'\n');
      csv += '\nClic\nLabel,Date,Page\n';
      d.clicks.forEach(c => csv += c.label+','+new Date(c.time).toISOString()+','+c.page+'\n');
      return csv;
    },
    clear: function(){ localStorage.removeItem(STORAGE_KEY); },
    stats: function(){
      const d = window.__tracker.data();
      const unique = new Set(d.visits.map(v => v.start)).size;
      const totalTime = d.visits.reduce((s, v) => s + (v.duration || 0), 0);
      const topPages = {};
      d.visits.forEach(v => { topPages[v.page] = (topPages[v.page] || 0) + 1; });
      const topClicks = {};
      d.clicks.forEach(c => { topClicks[c.label] = (topClicks[c.label] || 0) + 1; });
      return {
        totalVisits: d.visits.length,
        uniqueVisits: unique,
        totalTime: totalTime,
        avgTime: d.visits.length ? Math.round(totalTime / d.visits.length) : 0,
        topPages: Object.entries(topPages).sort((a,b) => b[1] - a[1]).slice(0,10),
        topClicks: Object.entries(topClicks).sort((a,b) => b[1] - a[1]).slice(0,10),
        lastVisits: d.visits.slice(-20).reverse()
      };
    }
  };

  // Trim on save
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
})();
