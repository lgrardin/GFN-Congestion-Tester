// GFN POPs (Points of Presence) - discovered dynamically
// Fallback list of known GFN endpoints by region
const FALLBACK_SERVERS = [
  // Europe
  { name: 'Frankfurt (EU)', region: 'eu-de', url: 'https://gfn-eu-de.nvidia.com/' },
  { name: 'Paris (EU)', region: 'eu-fr', url: 'https://gfn-eu-fr.nvidia.com/' },
  { name: 'UK (EU)', region: 'eu-uk', url: 'https://gfn-eu-uk.nvidia.com/' },
  // North America
  { name: 'US-West (NA)', region: 'na-us-west', url: 'https://gfn-na-us-west.nvidia.com/' },
  { name: 'US-East (NA)', region: 'na-us-east', url: 'https://gfn-na-us-east.nvidia.com/' },
  // Asia Pacific
  { name: 'Japan (APAC)', region: 'ap-jp', url: 'https://gfn-ap-jp.nvidia.com/' },
  { name: 'Singapore (APAC)', region: 'ap-sg', url: 'https://gfn-ap-sg.nvidia.com/' },
  { name: 'South Korea (APAC)', region: 'ap-kr', url: 'https://gfn-ap-kr.nvidia.com/' },
  // Fallback primary endpoint
  { name: 'GFN Primary API', region: 'primary', url: 'https://gfn.nvidia.com/' }
];

let servers = FALLBACK_SERVERS;

const ITERATIONS = 6;
const TIMEOUT_MS = 2500;
const GAP_MS = 120;
const DISCOVERY_TIMEOUT = 3000;

const els = {
  run: document.getElementById('run-check'),
  best: document.getElementById('best-endpoint'),
  avgPing: document.getElementById('avg-ping'),
  jitter: document.getElementById('jitter'),
  pingBadge: document.getElementById('ping-badge'),
  jitterBadge: document.getElementById('jitter-badge'),
  overallBadge: document.getElementById('overall-badge'),
  serverList: document.getElementById('server-list')
};

const levelMap = { good: 0, ok: 1, bad: 2 };

function classify(value, thresholds) {
  if (!Number.isFinite(value)) return { tag: 'bad', label: 'No data' };
  if (value <= thresholds.good) return { tag: 'good', label: 'Bon' };
  if (value <= thresholds.ok) return { tag: 'ok', label: 'Moyen' };
  return { tag: 'bad', label: 'Mauvais' };
}

function fmt(value) {
  if (!Number.isFinite(value)) return '--';
  return `${value.toFixed(1)} ms`;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function measureOnce(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const start = performance.now();
  try {
    await fetch(url, { method: 'GET', cache: 'no-store', mode: 'no-cors', signal: controller.signal });
    return performance.now() - start;
  } catch (err) {
    // Network failure or timeout means this probe is unusable.
    return Number.POSITIVE_INFINITY;
  } finally {
    clearTimeout(timer);
  }
}

async function measureServer(server) {
  const rtts = [];
  for (let i = 0; i < ITERATIONS; i += 1) {
    const rtt = await measureOnce(server.url);
    rtts.push(rtt);
    await delay(GAP_MS);
  }
  return { server, stats: computeStats(rtts) };
}

function computeStats(samples) {
  const valid = samples.filter(Number.isFinite);
  if (valid.length === 0) return { count: 0 };
  const sum = valid.reduce((acc, v) => acc + v, 0);
  const avg = sum / valid.length;
  const min = Math.min(...valid);
  const variance = valid.reduce((acc, v) => acc + Math.pow(v - avg, 2), 0) / valid.length;
  const jitter = Math.sqrt(variance);
  return { count: valid.length, avg, min, jitter };
}

function updateBadges(pingVal, jitterVal) {
  const pingClass = classify(pingVal, { good: 40, ok: 80 });
  const jitterClass = classify(jitterVal, { good: 8, ok: 20 });
  setBadge(els.pingBadge, pingClass);
  setBadge(els.jitterBadge, jitterClass);
  const overallLevel = Math.max(levelMap[pingClass.tag], levelMap[jitterClass.tag]);
  const overallTag = Object.entries(levelMap).find(([, level]) => level === overallLevel)[0];
  const overallLabel = overallTag === 'good' ? 'Pret' : overallTag === 'ok' ? 'Limite' : 'Ajuster le reseau';
  setBadge(els.overallBadge, { tag: overallTag, label: overallLabel });
}

function setBadge(el, state) {
  el.textContent = state.label;
  el.className = `badge ${state.tag}`;
}

function renderSkeleton() {
  els.best.textContent = '--';
  els.avgPing.textContent = '-- ms';
  els.jitter.textContent = '-- ms';
  setBadge(els.pingBadge, { tag: '', label: '--' });
  setBadge(els.jitterBadge, { tag: '', label: '--' });
  setBadge(els.overallBadge, { tag: '', label: 'En cours' });
  els.serverList.innerHTML = '';
  servers.forEach((s) => {
    const row = document.createElement('div');
    row.className = 'server-row skeleton';
    row.innerHTML = '<span class="server-name">--</span><span>--</span><span>--</span><span>--</span>';
    els.serverList.appendChild(row);
  });
}

function renderResults(results) {
  const best = results
    .filter(r => r.stats.count > 0)
    .sort((a, b) => a.stats.avg - b.stats.avg)[0];

  const fallback = { stats: { avg: Infinity, jitter: Infinity } };
  const aggregate = best || fallback;

  els.best.textContent = best ? best.server.name : 'Aucun point joignable';
  els.avgPing.textContent = fmt(aggregate.stats.avg);
  els.jitter.textContent = fmt(aggregate.stats.jitter);
  updateBadges(aggregate.stats.avg, aggregate.stats.jitter);

  els.serverList.innerHTML = '';
  results.forEach(result => {
    const { server, stats } = result;
    const row = document.createElement('div');
    row.className = 'server-row';

    const name = document.createElement('div');
    name.className = 'server-name';
    name.textContent = server.name;

    const ping = document.createElement('div');
    ping.textContent = stats.count ? fmt(stats.avg) : 'N/A';

    const jitter = document.createElement('div');
    jitter.textContent = stats.count ? fmt(stats.jitter) : 'N/A';

    const status = document.createElement('div');
    const badge = classify(stats.avg, { good: 40, ok: 80 });
    status.textContent = stats.count ? badge.label : 'Echec';
    status.className = 'server-meta';

    row.appendChild(name);
    row.appendChild(ping);
    row.appendChild(jitter);
    row.appendChild(status);
    els.serverList.appendChild(row);
  });
}

async function discoverServers() {
  // Try to fetch GFN configuration from NVIDIA
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DISCOVERY_TIMEOUT);
    const res = await fetch('https://gfn.nvidia.com/api/config', {
      method: 'GET',
      cache: 'no-store',
      mode: 'cors',
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      // Expected format: { "pops": [ { "name": "...", "host": "..." } ] }
      if (data.pops && Array.isArray(data.pops)) {
        return data.pops.map(p => ({
          name: p.name || p.host,
          region: p.region || 'unknown',
          url: `https://${p.host}/`
        }));
      }
    }
  } catch (err) {
    // Discovery failed, will use fallback
  }
  return FALLBACK_SERVERS;
}

async function run() {
  els.run.disabled = true;
  renderSkeleton();

  // Discover servers dynamically
  const discoveredServers = await discoverServers();
  servers = discoveredServers;

  const results = [];
  for (const server of servers) {
    const res = await measureServer(server);
    results.push(res);
  }
  renderResults(results);
  els.run.disabled = false;
}

els.run.addEventListener('click', () => { run(); });
window.addEventListener('load', () => { run(); });
