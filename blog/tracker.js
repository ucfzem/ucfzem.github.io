(function(){
  const SITE = 'blog';
  const STORAGE_KEY = SITE + '_visits';
  const GH_KEY = SITE + '_gh_token';
  const NOW = Date.now();
  const SESSION = { id: NOW, start: NOW, page: location.pathname, referrer: document.referrer || 'direct' };

  function getGHToken(){ return localStorage.getItem(GH_KEY); }

  function logToGitHub(type, data){
    const token = getGHToken();
    if(!token) return;
    const title = type === 'visit'
      ? 'Visite - ' + data.page + ' - ' + new Date().toISOString()
      : 'Clic - ' + data.label + ' - ' + new Date().toISOString();
    fetch('https://api.github.com/repos/ucfzem/ucfzem.github.io/issues', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify({
        title: title.substring(0, 256),
        body: JSON.stringify(data, null, 2),
        labels: [type === 'visit' ? 'visite' : 'clic']
      })
    }).catch(function(){});
  }

  let data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || { visits: [], clicks: [] };
  if(!Array.isArray(data.visits)) data.visits = [];
  if(!Array.isArray(data.clicks)) data.clicks = [];

  function trackLeave(){
    const duration = Math.round((Date.now() - SESSION.start) / 1000);
    if(duration < 2) return;
    SESSION.duration = duration;
    data.visits.push(SESSION);
    if(data.visits.length > 500) data.visits = data.visits.slice(-500);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    logToGitHub('visit', { page: SESSION.page, referrer: SESSION.referrer, duration: duration });
  }

  document.addEventListener('click', function(e){
    const el = e.target.closest('[data-track]');
    if(!el) return;
    const clickData = { label: el.dataset.track, time: Date.now(), page: location.pathname };
    data.clicks.push(clickData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    logToGitHub('click', clickData);
  });

  window.addEventListener('beforeunload', trackLeave);
  document.addEventListener('visibilitychange', function(){
    if(document.visibilityState === 'hidden') trackLeave();
  });

  SESSION.duration = 0;
  data.visits.push(SESSION);

  let _ghCache = null;

  function fetchGitHubIssues(label){
    const token = getGHToken();
    if(!token) return Promise.resolve([]);
    return fetch('https://api.github.com/repos/ucfzem/ucfzem.github.io/issues?labels=' + label + '&state=all&per_page=100', {
      headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/vnd.github.v3+json' }
    }).then(function(r){ return r.json(); }).catch(function(){ return []; });
  }

  window.__tracker = {
    setToken: function(token){ localStorage.setItem(GH_KEY, token); },
    getToken: function(){ return getGHToken(); },
    hasToken: function(){ return !!getGHToken(); },
    removeToken: function(){ localStorage.removeItem(GH_KEY); },
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
    clear: function(){
      localStorage.removeItem(STORAGE_KEY);
    },
    stats: function(){
      const d = window.__tracker.data();
      const topPages = {};
      d.visits.forEach(v => { topPages[v.page] = (topPages[v.page] || 0) + 1; });
      const topClicks = {};
      d.clicks.forEach(c => { topClicks[c.label] = (topClicks[c.label] || 0) + 1; });
      const totalTime = d.visits.reduce((s, v) => s + (v.duration || 0), 0);
      return {
        totalVisits: d.visits.length,
        totalTime: totalTime,
        avgTime: d.visits.length ? Math.round(totalTime / d.visits.length) : 0,
        topPages: Object.entries(topPages).sort((a,b) => b[1] - a[1]).slice(0,10),
        topClicks: Object.entries(topClicks).sort((a,b) => b[1] - a[1]).slice(0,10),
        lastVisits: d.visits.slice(-20).reverse()
      };
    },
    globalStats: function(callback){
      Promise.all([fetchGitHubIssues('visite'), fetchGitHubIssues('clic')]).then(function(results){
        const visits = results[0] || [];
        const clicks = results[1] || [];
        callback({
          totalVisits: visits.length,
          totalClicks: clicks.length,
          visits: visits.map(function(issue){
            try { return JSON.parse(issue.body); } catch(e){ return {}; }
          }),
          clicks: clicks.map(function(issue){
            try { return JSON.parse(issue.body); } catch(e){ return {}; }
          })
        });
      }).catch(function(){ callback(null); });
    }
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
})();