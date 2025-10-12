// i18n dictionary
  const I18N = {
    en: {
      report: 'Report Hazard',
      eventType:'Event Type',
      source:'Source',
      filters: 'Filters',
      from: 'From',
      to: 'To',
      location: 'Location',
      apply: 'Apply',
      reset: 'Reset',
      hotspots: 'Hotspots',
      about: 'About',
      unifiedFeed: 'Unified Feed',
      socialMonitor: 'Social Monitor',
      newReport: 'New Disaster Report',
      description: 'Description',
      when: 'When',
      language: 'Language',
      locationLabel: 'Location',
      media: 'Media (images/videos)',
      consent: 'Consent',
      cancel: 'Cancel',
      submit: 'Submit',
      close: 'Close',
      tagline: 'Unified citizen + social hazard intelligence',
      roleCitizen: 'Citizen',
      roleOfficial: 'Official',
      roleAnalyst: 'Analyst',
      all: 'All',
      legendDensity: 'Reports density',
      legendSpikes: 'Keyword spikes',
      legendVerified: 'Verified incidents',
      hotspotsNote: 'Heat layer shows density; clusters show localized hotspots. Toggle in map controls.',
      aboutText: 'A project that provides a unified platform for citizens, volunteers, and disaster managers to report hazards and monitor social trends in real time.',
      loadSample: 'Load Sample Social Posts',
      analyze: 'Analyze',
      searchPlaceholder: 'e.g., Assam, Nagaland',
      pastePostsPlaceholder: 'Paste recent social posts, one per line.',
      descPlaceholder: 'What did you observe?',
      noItems: 'No items match filters.',
      geolocationUnsupported: 'Geolocation not supported',
      geolocationDenied: 'Geolocation access not approved:',
      provideLocation: 'Please provide a valid location (use crosshair).',
      pasteSomePosts: 'Paste some posts first.'
    },
    hi: {
      report: 'रिपोर्ट दर्ज करें',
      eventType:'घटना प्रकार',
      source:'स्रोत',
      filters: 'फ़िल्टर',
      from: 'से',
      to: 'तक',
      location: 'स्थान',
      apply: 'लागू करें',
      reset: 'रीसेट करें',
      hotspots: 'हॉटस्पॉट्स',
      about: 'परिचय',
      unifiedFeed: 'एकीकृत फ़ीड',
      socialMonitor: 'सोशल मॉनिटर',
      newReport: 'नई आपदा रिपोर्ट',
      description: 'विवरण',
      when: 'कब',
      language: 'भाषा',
      locationLabel: 'स्थान',
      media: 'मीडिया (छवियाँ/वीडियो)',
      consent: 'सहमति',
      cancel: 'रद्द करें',
      submit: 'सबमिट करें',
      close: 'बंद करें',
      tagline: 'नागरिक + सोशल खतरा इंटेलिजेंस का एकीकृत मंच',
      roleCitizen: 'नागरिक',
      roleOfficial: 'अधिकारी',
      roleAnalyst: 'विश्लेषक',
      all: 'सभी',
      legendDensity: 'रिपोर्ट घनत्व',
      legendSpikes: 'कीवर्ड स्पाइक्स',
      legendVerified: 'सत्यापित घटनाएँ',
      hotspotsNote: 'हीट लेयर घनत्व दिखाता है; क्लस्टर स्थानीय हॉटस्पॉट दिखाते हैं। मानचित्र नियंत्रण में टॉगल करें।',
      aboutText: 'यह एक परियोजना है जो नागरिकों, स्वयंसेवकों और आपदा प्रबंधकों को रिपोर्ट करने और सामाजिक प्रवृत्तियों की निगरानी करने के लिए एक एकीकृत मंच प्रदान करती है।',
      loadSample: 'नमूना सोशल पोस्ट लोड करें',
      analyze: 'विश्लेषण करें',
      searchPlaceholder: 'उदा., असम, नागालैंड',
      pastePostsPlaceholder: 'हालिया सोशल पोस्ट पेस्ट करें, प्रत्येक लाइन में एक।',
      descPlaceholder: 'आपने क्या देखा?',
      noItems: 'कोई आइटम फ़िल्टर से मेल नहीं खाते।',
      geolocationUnsupported: 'जियोलोकेशन समर्थित नहीं है',
      geolocationDenied: 'जियोलोकेशन एक्सेस स्वीकृत नहीं हुआ:',
      provideLocation: 'कृपया एक मान्य स्थान दें (क्रॉसहेयर उपयोग करें)।',
      pasteSomePosts: 'कृपया कुछ पोस्ट पेस्ट करें।'
    }
  };

  const t = (k) => I18N[localStorage.getItem('lang')||'en'][k]||k;

  // apply translations to elements with data-i18n and placeholders
  const applyI18n = () => {
    document.querySelectorAll('[data-i18n]').forEach(el=> el.textContent = t(el.getAttribute('data-i18n')) );
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el=> el.placeholder = t(el.getAttribute('data-i18n-placeholder')) );

    // update dynamic button visibility/labels
    document.getElementById('reportBtn').style.display = (document.getElementById('role').value==='citizen'||document.getElementById('role').value==='official')? 'inline-flex' : 'none';
  };

  // i18n-aware alert helper
  const alertI = (key, extra) => alert((t(key) || key) + (extra? ' ' + extra : ''));

  const store = { reports: [], pending: [] };
  const saveStore = ()=>{ try{ localStorage.setItem('oceanwatch_store', JSON.stringify(store)); }catch(e){ console.warn('Saving store failed'); } };
  const loadStore = ()=>{ const raw = localStorage.getItem('oceanwatch_store'); if(raw){ try{ const obj = JSON.parse(raw); store.reports = obj.reports||[]; store.pending = obj.pending||[]; }catch(e){} } };

  const seed = ()=>{ if(store.reports.length) return; const now = Date.now(); const samples = [ {lat:29.53,lng:78.7747,type:'Tree',desc:'Unusual tree cutting reported near reserve area',src:'citizen',verified:false,ts:now-1000*60*60*2,lang:'en'}, {lat:21.5937,lng:86.3487,type:'Fire',desc:'Forest fire spreading near hill region',src:'citizen',verified:false,ts:now-1000*60*60*1.5,lang:'en'}, {lat:22.3345,lng:80.6115,type:'Hunting',desc:'Hunting spotted in restricted area',src:'citizen',verified:false,ts:now-1000*60*45,lang:'en'}, {lat:26.5775,lng:93.1711,type:'Poaching',desc:'Poaching activity suspected by patrol team',src:'citizen',verified:false,ts:now-1000*60*30,lang:'en'}, {lat:12.2958,lng:76.6394,type:'Logging',desc:'Illegal logging trucks seen at night',src:'citizen',verified:false,ts:now-1000*60*15,lang:'en'}, {lat:21.1240,lng:70.8242,type:'Wind',desc:'Several trees blown down after storm',src:'citizen',verified:false,ts:now-1000*60*30,lang:'en'} ]; samples.forEach((s,i)=> store.reports.push({id:'seed'+i, ...s, media:[], sentiment: scoreSentiment(s.desc)})); };

  let map, clusterLayer, heatLayer;
  const iconByType = { Tree:'fa-tree', Fire:'fa-fire', Hunting:'fa-hat-cowboy', Poaching:'fa-paw', Logging:'fa-industry', Wind:'fa-wind' };

  function initMap(){ map = L.map('map',{zoomControl:true}).setView([15.9129,79.74],5); L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19, attribution:'&copy; OpenStreetMap'}).addTo(map); clusterLayer = L.markerClusterGroup(); map.addLayer(clusterLayer); heatLayer = L.heatLayer([], {radius:25, blur:15, maxZoom:17}).addTo(map); renderMapLayers(); }

  function markerFor(r){ const icon = L.divIcon({html:`<div style="display:grid;place-items:center;width:26px;height:26px;border-radius:50%;background:#0ea5e9;border:2px solid #1f2937;color:white"><i class=\"fa-solid ${iconByType[r.type]||'fa-circle'}\"></i></div>`}); const m = L.marker([r.lat,r.lng], {icon}); const s = r.sentiment; const sChip = s>0.2? '<span class="chip ok">positive</span>' : s<-0.2? '<span class="chip danger">negative</span>' : '<span class="chip warn">neutral</span>'; let mediaHtml = ''; if(Array.isArray(r.media) && r.media.length){ mediaHtml = '<div style="margin-top:6px">' + (r.media[0].type==='image'? `<img src="${r.media[0].data}" style="width:200px;max-width:100%;border-radius:8px;">` : `<video src="${r.media[0].data}" style="width:200px;max-width:100%;" controls></video>`) + '</div>'; } m.bindPopup(`<b>${r.type.toUpperCase()}</b> ${r.verified? ' <span class=\"chip ok\">verified</span>':''}<br/><small>${new Date(r.ts).toLocaleString()}</small><br/><div style='margin-top:6px'>${escapeHtml(r.desc)}</div>${mediaHtml}<div style='margin-top:6px'>Source: <b>${r.src}</b> • ${sChip}</div>`); return m; }


  function renderMapLayers(){ clusterLayer.clearLayers(); const filtered = applyCurrentFilters(); const heatpoints = []; filtered.forEach(r=>{ clusterLayer.addLayer(markerFor(r)); heatpoints.push([r.lat, r.lng, 0.5]); }); heatLayer.setLatLngs(heatpoints); }

  function applyCurrentFilters(){ const ft = document.getElementById('filterType').value; const fs = document.getElementById('filterSource').value; const fd = document.getElementById('fromDate').value? new Date(document.getElementById('fromDate').value).getTime() : -Infinity; const td = document.getElementById('toDate').value? new Date(document.getElementById('toDate').value).getTime()+86400000 : Infinity; return store.reports.filter(r=> (ft==='all'||r.type===ft) && (fs==='all'|| (fs==='verified'? r.verified : r.src===fs)) && (r.ts>=fd && r.ts<=td)); }

  function renderFeed(){ const feed = document.getElementById('feed'); feed.innerHTML=''; const rows = applyCurrentFilters().sort((a,b)=>b.ts-a.ts).slice(0,50).map(r=>{ const chipCls = r.verified? 'ok':'warn'; const s = r.sentiment; const sCls = s>0.2?'ok': s<-0.2?'danger':'warn'; let thumbHtml = ''; if(Array.isArray(r.media) && r.media.length){ const thumbs = r.media.slice(0,2).map((m, idx) => { if(m.type==='image') return `<img src="${m.data}" style="width:48px;height:36px;object-fit:cover;border-radius:6px;border:1px solid #1f2937; margin-right:6px" loading="lazy" />`; if(m.type==='video') return `<video src="${m.data}" style="width:48px;height:36px;object-fit:cover;border-radius:6px;border:1px solid #1f2937; margin-right:6px" muted></video>`; return ''; }).join(''); thumbHtml = `<div style="margin-top:8px; display:flex; align-items:center" class="feed-thumbs">${thumbs}<span class="meta" style="margin-left:6px">${r.media.length} file(s)</span></div>`; } return `<div class="row feed-row" data-id="${r.id}" style="cursor:pointer"><div><div><b>${r.type.toUpperCase()}</b> • <span class="meta">${new Date(r.ts).toLocaleString()}</span></div><div class="meta">${escapeHtml(r.desc)}</div>${thumbHtml}<div class="meta">${r.src} • <span class="chip ${chipCls}">${r.verified? 'verified':'unverified'}</span> • <span class="chip ${sCls}">sentiment ${s.toFixed(2)}</span></div></div><div><span class="chip">${r.lang}</span></div></div>`; }).join(''); feed.innerHTML = rows || `<div class="tag">${t('noItems')}</div>`; document.querySelectorAll('.feed-row').forEach(el=>{ el.addEventListener('click', (ev)=>{ const id = el.getAttribute('data-id'); const report = store.reports.find(rr=> rr.id === id); if(!report) return; openMediaViewer(report); }); }); }

  const KEYWORDS = { Tree:['tree','पेड़','ped','vriksh','wood', 'tree fall'], Fire:['fire','आग','aag','blaze','flames','burning','forest fire','wildfire','दावानल'], Hunting:['hunting','शिकार','shikaar','poaching','animal hunting','illegal hunting','wildlife killing','trophy hunting'], Poaching:['poaching','शिकार','shikaar','illegal hunting','wildlife trade','smuggling','ivory trade','rhino horn','animal skin','endangered hunting'], Logging:['illegal logging','अवैध कटाई','jungle katayi','jungle cutting','deforestation','timber smuggling','wood smuggling','forest destruction','tree cutting'], Wind:['wind','हवा','pawan','storm','gale','breeze','झोंका','झंझा','airflow','gust'] };
  const NEG = ['danger','help','救命','risk','alert','warning','red','evacuate','गंभीर','खतरा','panic', 'sos', 'SOS'];
  const POS = ['safe','contained','clear','stabilized','normal','clear sky'];

  function classify(text){ if(!text) return 'Other'; const t = text.toLowerCase(); for(const [k, arr] of Object.entries(KEYWORDS)){ if(arr.some(w=> { try { if(/\s/.test(w)) return t.includes(w); return new RegExp('\\b' + w.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&') + '\\b', 'i').test(t); } catch(e) { return t.includes(w); } })) return k; } return 'Other'; }
  function scoreSentiment(text){ const s = (text||'').toLowerCase(); let score = 0; POS.forEach(w=>{ if(s.includes(w)) score += 1; }); NEG.forEach(w=>{ if(s.includes(w)) score -= 1; }); return Math.max(-1, Math.min(1, score/3)); }

  function analyzeSocial(raw){ const lines = raw.split(/\n+/).map(s=>s.trim()).filter(Boolean); const buckets = {counts:{}, total:lines.length}; lines.forEach((line,i)=>{ let type = classify(line) || 'Other'; buckets.counts[type] = (buckets.counts[type]||0)+1; const m = line.match(/@(-?\d+\.\d+),\s*(-?\d+\.\d+)/); const lat = m? parseFloat(m[1]) : 12 + Math.random()*13; const lng = m? parseFloat(m[2]) : 72 + Math.random()*12; const s = scoreSentiment(line); const id = 'soc'+Date.now()+i; store.reports.push({id, lat, lng, type, desc: line, src:'social', verified:false, ts: Date.now()-Math.random()*3600000, media:[], sentiment:s, lang:'en'}); }); saveStore(); return buckets; }

  const reportModal = document.getElementById('reportModal'); document.getElementById('reportBtn').addEventListener('click', ()=> reportModal.showModal()); document.getElementById('geoBtn').addEventListener('click', ()=>{ if(!navigator.geolocation) return alertI('geolocationUnsupported'); navigator.geolocation.getCurrentPosition(pos=>{ document.getElementById('rLat').value = pos.coords.latitude.toFixed(6); document.getElementById('rLng').value = pos.coords.longitude.toFixed(6); }, err=> alertI('geolocationDenied', err.message)); });

  document.getElementById('rMedia').addEventListener('change', (e)=>{ const box = document.getElementById('mediaPreview'); box.innerHTML=''; [...e.target.files].slice(0,4).forEach(file=>{ const url = URL.createObjectURL(file); if(file.type.startsWith('image')){ const img = new Image(); img.src = url; img.width = 120; img.height = 80; img.loading = 'lazy'; img.style.objectFit = 'cover'; img.style.borderRadius = '10px'; box.appendChild(img); } else if(file.type.startsWith('video')){ const v = document.createElement('video'); v.src = url; v.controls=true; v.width=160; v.height=90; v.style.borderRadius='10px'; box.appendChild(v); } }); });

  document.getElementById('submitReport').addEventListener('click', async (e)=>{ e.preventDefault(); const lat = parseFloat(document.getElementById('rLat').value); const lng = parseFloat(document.getElementById('rLng').value); if(Number.isNaN(lat)||Number.isNaN(lng)) return alertI('provideLocation'); const type = document.getElementById('rType').value; const desc = document.getElementById('rDesc').value.trim(); const ts = document.getElementById('rTime').value? new Date(document.getElementById('rTime').value).getTime() : Date.now(); const lang = document.getElementById('rLang').value; const fileToDataURL = (file) => new Promise((res, rej) => { const reader = new FileReader(); reader.onload = () => res(reader.result); reader.onerror = (err) => rej(err); reader.readAsDataURL(file); }); const files = Array.from(document.getElementById('rMedia').files || []); const media = []; for(const file of files.slice(0,6)){ try { if(file.size > 3.5 * 1024 * 1024){ console.warn('Skipping large file (>3.5MB):', file.name); continue; } const data = await fileToDataURL(file); media.push({ type: file.type.startsWith('image') ? 'image' : 'video', data, name: file.name }); } catch(err){ console.error('file read err', err); } } const id = 'rep'+Date.now(); const sentiment = scoreSentiment(desc); const report = {id, lat, lng, type, desc, src:'citizen', verified:false, ts: ts, media, sentiment, lang}; if(navigator.onLine){ store.reports.push(report); } else { store.pending.push(report); } saveStore(); renderMapLayers(); renderFeed(); reportModal.close(); document.getElementById('rDesc').value = ''; document.getElementById('rMedia').value = ''; document.getElementById('mediaPreview').innerHTML = ''; });

  window.addEventListener('online', ()=>{ if(store.pending.length){ store.reports.push(...store.pending); store.pending = []; saveStore(); renderMapLayers(); renderFeed(); console.info('Pending reports synced.'); } });

  const cityCoords = { chennai:[13.0827,80.2707], visakhapatnam:[17.6868,83.2185], mumbai:[19.076,72.8777], goa:[15.2993,74.1240], kolkata:[22.5726,88.3639] };
  document.getElementById('searchBox').addEventListener('keydown', (e)=>{ if(e.key==='Enter') { e.preventDefault(); doSearch(); } }); function doSearch(){ const q = document.getElementById('searchBox').value.toLowerCase().trim(); const k = Object.keys(cityCoords).find(k=> q.includes(k)); if(k){ map.setView(cityCoords[k], 11); } }

  document.getElementById('ingestSample').addEventListener('click', ()=>{ const sample = `High waves crashing near RK Beach, Vizag @17.73,83.32\nWaterlogging reported around Colaba, taxis stuck\nUnusual spring tide observed at Marina, Chennai\nSea wall damage after last night surge near Puri\nPotential tsunami rumor circulating need verification`; document.getElementById('socialRaw').value = sample; });

  document.getElementById('runNlp').addEventListener('click', ()=>{ const raw = document.getElementById('socialRaw').value.trim(); if(!raw) return alertI('pasteSomePosts'); const res = analyzeSocial(raw); const box = document.getElementById('nlpSummary'); const items = Object.entries(res.counts).sort((a,b)=>b[1]-a[1]).map(([k,v])=> `<div class='row'><div><b>${k.toUpperCase()}</b> • ${v} mentions</div><div></div></div>`).join(''); box.innerHTML = `<div class='meta'>${res.total} social items ingested.</div>` + items; renderMapLayers(); renderFeed(); });

  document.getElementById('role').addEventListener('change', (e)=>{ const role = e.target.value; document.getElementById('reportBtn').style.display = (role==='citizen'||role==='official')? 'inline-flex' : 'none'; });

  document.addEventListener('keydown', (e)=>{ if(e.key.toLowerCase()==='v' && document.getElementById('role').value==='official' && store.reports.length){ store.reports[store.reports.length-1].verified = true; saveStore(); renderMapLayers(); renderFeed(); } });

  function escapeHtml(s){ s = (s === undefined || s === null) ? '' : String(s); return s.replace(/[&<>\"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

  function openMediaViewer(report){ const mediaViewer = document.getElementById('mediaViewer'); const content = document.getElementById('mediaContent'); const title = document.getElementById('mediaTitle'); content.innerHTML = ''; title.textContent = `${report.type.toUpperCase()} — ${new Date(report.ts).toLocaleString()}`; if(Array.isArray(report.media) && report.media.length){ (report.media || []).forEach(m=>{ if(m.type === 'image'){ const img = new Image(); img.src = m.data; img.style.maxWidth = 'min(90vw, 420px)'; img.style.maxHeight = '70vh'; img.style.objectFit = 'contain'; img.style.borderRadius = '8px'; img.style.border = '1px solid #1f2937'; content.appendChild(img); } else if(m.type === 'video'){ const v = document.createElement('video'); v.src = m.data; v.controls = true; v.style.maxWidth = 'min(90vw, 420px)'; v.style.maxHeight = '70vh'; v.style.borderRadius = '8px'; v.style.border = '1px solid #1f2937'; content.appendChild(v); } }); } else { const info = document.createElement('div'); info.style.maxWidth = '80ch'; info.style.padding = '8px'; info.style.fontSize = '14px'; info.innerHTML = `<div style="margin-bottom:8px;"><strong>${t('description')}</strong><div style="margin-top:6px">${escapeHtml(report.desc)}</div></div><div style="margin-top:8px; color:var(--muted)"><div><strong>${t('when')}</strong> ${new Date(report.ts).toLocaleString()}</div><div><strong>${t('source')}</strong> ${escapeHtml(report.src || '')} • <strong>${t('language')}</strong> ${escapeHtml(report.lang || '')}</div><div style="margin-top:6px"><strong>Sentiment</strong> ${report.sentiment?.toFixed(2) ?? '0.00'}</div></div>`; content.appendChild(info); } try{ mediaViewer.showModal(); }catch(e){ if(Array.isArray(report.media) && report.media[0]) { window.open(report.media[0].data, '_blank'); } else { const w = window.open('', '_blank'); w.document.write(`<html><head><title>Report: ${escapeHtml(report.type)}</title></head><body><pre>${escapeHtml(JSON.stringify(report, null, 2))}</pre></body></html>`); } }
  }

  (function(){ loadStore(); seed(); initMap(); renderFeed(); document.getElementById('lang').value = localStorage.getItem('lang')||'en';
    // wire lang change
    document.getElementById('lang').addEventListener('change', (e) => { const lang = e.target.value; localStorage.setItem('lang', lang); applyI18n(); });
    applyI18n();
  })();