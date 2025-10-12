// -----------------------------
  // Simple i18n (English / Hindi)
  // -----------------------------
  const I18N = {
    en: { report: 'Report Hazard', eventType:'Event Type', source:'Source' },
    hi: { report: 'रिपोर्ट दर्ज करें', eventType:'घटना प्रकार', source:'स्रोत' }
  };
  const t = (k) => I18N[localStorage.getItem('lang')||'en'][k]||k;
  const applyI18n = () => {
    document.querySelectorAll('[data-i18n]').forEach(el=> el.textContent = t(el.getAttribute('data-i18n')));
  };

  // -----------------------------
  // Data store (simulated backend)
  // -----------------------------
  const store = {
    reports: [], // unified reports incl. social derived
    pending: []  // queued when offline
  };
  const saveStore = () => localStorage.setItem('oceanwatch_store', JSON.stringify(store));
  const loadStore = () => {
    const raw = localStorage.getItem('oceanwatch_store');
    if(raw){ const obj = JSON.parse(raw); store.reports = obj.reports||[]; store.pending = obj.pending||[]; }
  };

  // Seed sample data
  const seed = () => {
    if(store.reports.length) return;
    const now = Date.now();
    const samples = [
      {lat:13.0827,lng:80.2707, type:'swell', desc:'Strong swell surges hitting Marina Beach', src:'citizen', verified:false, ts: now-1000*60*60*2, lang:'en'},
      {lat:17.6868,lng:83.2185, type:'waves', desc:'High waves near RK Beach; fishermen advised caution', src:'official', verified:true, ts: now-1000*60*60*1.5, lang:'en'},
      {lat:19.0760,lng:72.8777, type:'flood', desc:'लोकल बाढ़ की सूचना, कोलाबा साइड', src:'citizen', verified:false, ts: now-1000*60*45, lang:'hi'},
      {lat:20.2961,lng:85.8245, type:'tide', desc:'Unusual high tide reported by lighthouse team', src:'citizen', verified:false, ts: now-1000*60*30, lang:'en'},
      {lat:25.2961,lng:55.8245, type:'flood', desc:'Unusual high tide reported by NGO team', src:'citizen', verified:false, ts: now-1000*60*30, lang:'en'},
      {lat:21.1458,lng:79.0882, type:'damage', desc:'Sea wall damage spotted after storm surge', src:'citizen', verified:false, ts: now-1000*60*15, lang:'en'}
    ];
    samples.forEach((s,i)=> store.reports.push({id:'seed'+i, ...s, media:[], sentiment: scoreSentiment(s.desc)}));
  };

  // -----------------------------
  // Map setup (Leaflet)
  // -----------------------------
  let map, clusterLayer, heatLayer;
  const iconByType = {
    tide: 'fa-water', flood:'fa-house-flood-water', damage:'fa-road-circle-exclamation', tsunami:'fa-wave-square', swell:'fa-water', waves:'fa-water'
  };
  function initMap(){
    map = L.map('map',{zoomControl:true}).setView([15.9129, 79.74], 5); // India focus
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19, attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    clusterLayer = L.markerClusterGroup();
    map.addLayer(clusterLayer);
    heatLayer = L.heatLayer([], {radius:25, blur:15, maxZoom:17});
    heatLayer.addTo(map);

    renderMapLayers();
  }

  function markerFor(r){
    const icon = L.divIcon({html:`<div style="display:grid;place-items:center;width:26px;height:26px;border-radius:50%;background:#0ea5e9;border:2px solid #1f2937;color:white"><i class=\"fa-solid ${iconByType[r.type]||'fa-circle'}\"></i></div>`});
    const m = L.marker([r.lat,r.lng], {icon});
    const s = r.sentiment;
    const sChip = s>0.2? '<span class="chip ok">positive</span>' : s<-0.2? '<span class="chip danger">negative</span>' : '<span class="chip warn">neutral</span>';
    m.bindPopup(`
      <b>${r.type.toUpperCase()}</b> ${r.verified? ' <span class=\"chip ok\">verified</span>':''}<br/>
      <small>${new Date(r.ts).toLocaleString()}</small><br/>
      <div style='margin-top:6px'>${escapeHtml(r.desc)}</div>
      <div style='margin-top:6px'>Source: <b>${r.src}</b> • ${sChip}</div>
    `);
    return m;
  }

  function renderMapLayers(){
    clusterLayer.clearLayers();
    const filtered = applyCurrentFilters();
    const heatpoints = [];
    filtered.forEach(r=>{
      clusterLayer.addLayer(markerFor(r));
      heatpoints.push([r.lat, r.lng, 0.5]);
    });
    heatLayer.setLatLngs(heatpoints);
  }

  // -----------------------------
  // Filters + Feed
  // -----------------------------
  function applyCurrentFilters(){
    const ft = document.getElementById('filterType').value;
    const fs = document.getElementById('filterSource').value;
    const fd = document.getElementById('fromDate').value? new Date(document.getElementById('fromDate').value).getTime() : -Infinity;
    const td = document.getElementById('toDate').value? new Date(document.getElementById('toDate').value).getTime()+86400000 : Infinity;
    return store.reports.filter(r=> (ft==='all'||r.type===ft) &&
                                   (fs==='all'|| (fs==='verified'? r.verified : r.src===fs)) &&
                                   (r.ts>=fd && r.ts<=td));
  }

  function renderFeed(){
    const feed = document.getElementById('feed');
    feed.innerHTML='';
    const rows = applyCurrentFilters().sort((a,b)=>b.ts-a.ts).slice(0,50).map(r=>{
      const chipCls = r.verified? 'ok':'warn';
      const s = r.sentiment; const sCls = s>0.2?'ok': s<-0.2?'danger':'warn';
      return `<div class="row">
        <div>
          <div><b>${r.type.toUpperCase()}</b> • <span class="meta">${new Date(r.ts).toLocaleString()}</span></div>
          <div class="meta">${escapeHtml(r.desc)}</div>
          <div class="meta">${r.src} • <span class="chip ${chipCls}">${r.verified? 'verified':'unverified'}</span> • <span class="chip ${sCls}">sentiment ${s.toFixed(2)}</span></div>
        </div>
        <div>
          <span class="chip">${r.lang}</span>
        </div>
      </div>`;
    }).join('');
    feed.innerHTML = rows || '<div class="tag">No items match filters.</div>';
  }

  // -----------------------------
  // Charts
  // -----------------------------
  let trendChart, sentimentChart;
  function renderCharts(){
    const arr = applyCurrentFilters();
    const buckets = Array.from({length:12},(_,i)=>({label:`-${11-i}h`, count:0}));
    const now = Date.now();
    arr.forEach(r=>{
      const diffh = Math.floor((now - r.ts)/3600000);
      if(diffh>=0 && diffh<12) buckets[11-diffh].count++;
    });
    const labels = buckets.map(b=>b.label);
    const data = buckets.map(b=>b.count);

    if(trendChart) trendChart.destroy();
    trendChart = new Chart(document.getElementById('trendChart'),{
      type:'line', data:{labels, datasets:[{label:'Reports', data, tension:.3, fill:true}]}, options:{responsive:true, plugins:{legend:{display:false}}}
    });

    const pos = arr.filter(r=>r.sentiment>0.2).length;
    const neu = arr.filter(r=>r.sentiment<=0.2 && r.sentiment>=-0.2).length;
    const neg = arr.filter(r=>r.sentiment<-0.2).length;
    if(sentimentChart) sentimentChart.destroy();
    sentimentChart = new Chart(document.getElementById('sentimentChart'),{
      type:'doughnut', data:{labels:['Positive','Neutral','Negative'], datasets:[{data:[pos,neu,neg]}]}, options:{plugins:{legend:{position:'bottom'}}}
    });
  }

  // -----------------------------
  // Simple NLP: keyword + sentiment (rule-based)
  // -----------------------------
  const KEYWORDS = {
    flood:['flood','बाढ़','pani bhar','waterlogging','inundation'],
    waves:['high waves','wave','लहर','lahar'],
    tide:['tide','ज्वार','jwar','spring tide','neap'],
    swell:['swell','surge','सर्ज','उभार'],
    damage:['damage','टूटा','break','erosion','breach','collapse'],
    tsunami:['tsunami','sunami','suname','सुनामी']
  };
  const NEG = ['danger','help','救命','risk','alert','warning','red','evacuate','गंभीर','खतरा','panic', 'sos', 'SOS'];
  const POS = ['safe','contained','clear','stabilized','normal','clear sky'];

  function classify(text){
    const t = text.toLowerCase();
    for(const [k, arr] of Object.entries(KEYWORDS)){
      if(arr.some(w=> t.includes(w))) return k;
    }
    return 'waves';
  }
  function scoreSentiment(text){
    const s = text.toLowerCase();
    let score = 0;
    POS.forEach(w=>{ if(s.includes(w)) score += 1; });
    NEG.forEach(w=>{ if(s.includes(w)) score -= 1; });
    return Math.max(-1, Math.min(1, score/3));
  }

  function analyzeSocial(raw){
    const lines = raw.split(/\n+/).map(s=>s.trim()).filter(Boolean);
    const buckets = {counts:{}, total:lines.length};
    lines.forEach((line,i)=>{
      const type = classify(line);
      buckets.counts[type] = (buckets.counts[type]||0)+1;
      // fabricate a geotag if found as @lat,lng pattern
      const m = line.match(/@(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
      const lat = m? parseFloat(m[1]) : 12 + Math.random()*13;
      const lng = m? parseFloat(m[2]) : 72 + Math.random()*12;
      const s = scoreSentiment(line);
      const id = 'soc'+Date.now()+i;
      store.reports.push({id, lat, lng, type, desc: line, src:'social', verified:false, ts: Date.now()-Math.random()*3600000, media:[], sentiment:s, lang:'en'});
    });
    saveStore();
    return buckets;
  }

  // -----------------------------
  // Reporting flow
  // -----------------------------
  const reportModal = document.getElementById('reportModal');
  document.getElementById('reportBtn').addEventListener('click', ()=> reportModal.showModal());
  document.getElementById('geoBtn').addEventListener('click', ()=>{
    if(!navigator.geolocation) return alert('Geolocation not supported');
    navigator.geolocation.getCurrentPosition(pos=>{
      document.getElementById('rLat').value = pos.coords.latitude.toFixed(6);
      document.getElementById('rLng').value = pos.coords.longitude.toFixed(6);
    }, err=> alert('Geolocation access not approved: '+err.message));
  });

  document.getElementById('rMedia').addEventListener('change', (e)=>{
    const box = document.getElementById('mediaPreview');
    box.innerHTML='';
    [...e.target.files].slice(0,4).forEach(file=>{
      const url = URL.createObjectURL(file);
      if(file.type.startsWith('image')){
        const img = new Image(); img.src=url; box.appendChild(img);
      } else if(file.type.startsWith('video')){
        const v = document.createElement('video'); v.src=url; v.controls=true; box.appendChild(v);
      }
    });
  });

  document.getElementById('submitReport').addEventListener('click', (e)=>{
    e.preventDefault();
    const lat = parseFloat(document.getElementById('rLat').value);
    const lng = parseFloat(document.getElementById('rLng').value);
    if(Number.isNaN(lat)||Number.isNaN(lng)) return alert('Please provide a valid location (use crosshair).');
    const type = document.getElementById('rType').value;
    const desc = document.getElementById('rDesc').value.trim();
    const ts = document.getElementById('rTime').value? new Date(document.getElementById('rTime').value).getTime() : Date.now();
    const lang = document.getElementById('rLang').value;

    const id = 'rep'+Date.now();
    const sentiment = scoreSentiment(desc);
    const report = {id, lat, lng, type, desc, src:'citizen', verified:false, ts: ts, media:[], sentiment, lang};

    if(navigator.onLine){
      // Simulated POST
      store.reports.push(report);
    } else {
      store.pending.push(report);
    }
    saveStore();
    renderMapLayers(); renderFeed(); renderCharts();
    reportModal.close();
  });

  window.addEventListener('online', ()=>{
    // simulate syncing pending queue
    if(store.pending.length){
      store.reports.push(...store.pending);
      store.pending = [];
      saveStore();
      renderMapLayers(); renderFeed(); renderCharts();
      alert('Pending reports synced.');
    }
  });

  // -----------------------------
  // Search (very simple geocoder using Nominatim API-free pattern -> we cannot call external API in offline demo. Here we just pan to predefined cities.)
  // -----------------------------
  const cityCoords = {
    chennai:[13.0827,80.2707], visakhapatnam:[17.6868,83.2185], mumbai:[19.076,72.8777], goa:[15.2993,74.1240], kolkata:[22.5726,88.3639]
  };
  document.getElementById('searchBox').addEventListener('keydown', (e)=>{
    if(e.key==='Enter') { e.preventDefault(); doSearch(); }
  });
  function doSearch(){
    const q = document.getElementById('searchBox').value.toLowerCase().trim();
    const k = Object.keys(cityCoords).find(k=> q.includes(k));
    if(k){ map.setView(cityCoords[k], 11); }
  }

  // -----------------------------
  // NLP UI
  // -----------------------------
  document.getElementById('ingestSample').addEventListener('click', ()=>{
    const sample = `High waves crashing near RK Beach, Vizag @17.73,83.32\nWaterlogging reported around Colaba, taxis stuck\nUnusual spring tide observed at Marina, Chennai\nSea wall damage after last night surge near Puri\nPotential tsunami rumor circulating – need verification`;
    document.getElementById('socialRaw').value = sample;
  });

  document.getElementById('runNlp').addEventListener('click', ()=>{
    const raw = document.getElementById('socialRaw').value.trim();
    if(!raw) return alert('Paste some posts first.');
    const res = analyzeSocial(raw);
    const box = document.getElementById('nlpSummary');
    const items = Object.entries(res.counts).sort((a,b)=>b[1]-a[1]).map(([k,v])=> `<div class='row'><div><b>${k.toUpperCase()}</b> • ${v} mentions</div><div></div></div>`).join('');
    box.innerHTML = `<div class='meta'>${res.total} social items ingested.</div>` + items;
    renderMapLayers(); renderFeed(); renderCharts();
  });

  // -----------------------------
  // Role-based access (UI gates only in MVP)
  // -----------------------------
  document.getElementById('role').addEventListener('change', (e)=>{
    const role = e.target.value;
    // Citizen: can submit; Official: can toggle verified; Analyst: NLP + filters focus
    document.getElementById('reportBtn').style.display = (role==='citizen'||role==='official')? 'inline-flex' : 'none';
  });

  // Verify toggle for officials (click markers to upgrade)
  document.addEventListener('keydown', (e)=>{
    // Secret: press V to verify latest item (official role only)
    if(e.key.toLowerCase()==='v' && document.getElementById('role').value==='official' && store.reports.length){
      store.reports[store.reports.length-1].verified = true; saveStore(); renderMapLayers(); renderFeed();
    }
  });

  // -----------------------------
  // Helpers
  // -----------------------------
  function escapeHtml(s){ return s.replace(/[&<>\"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c])) }

  // -----------------------------
  // Filters actions
  // -----------------------------
  document.getElementById('applyFilters').addEventListener('click', ()=>{ renderMapLayers(); renderFeed(); renderCharts(); });
  document.getElementById('resetFilters').addEventListener('click', ()=>{
    document.getElementById('filterType').value='all';
    document.getElementById('filterSource').value='all';
    document.getElementById('fromDate').value='';
    document.getElementById('toDate').value='';
    renderMapLayers(); renderFeed(); renderCharts();
  });

  // -----------------------------
  // Language switch
  // -----------------------------
  document.getElementById('lang').addEventListener('change', (e)=>{
    localStorage.setItem('lang', e.target.value); applyI18n();
  });

  // -----------------------------
  // Boot
  // -----------------------------
  (function(){
    loadStore(); seed();
    initMap(); renderFeed(); renderCharts();
    document.getElementById('lang').value = localStorage.getItem('lang')||'en'; applyI18n();
  })();