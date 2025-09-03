const ENDPOINT = 'https://get-statement-data-893947194926.us-central1.run.app/get_initiatives';
const FALLBACK_IMG = 'assets/placeholder.png';

function pickSummary(item) {
  const s = item?.summary;
  if (s && s !== 'undefined') return s;
  return item?.problem || item?.solution || item?.achievement || '';
}

/* sort by best-available date field, tolerate bad formats */
function pickDate(item) {
  return item?.date || item?.published_at || item?.publishedAt || item?.created_at || item?.updated_at || '';
}

function parseDateSafe(input) {
  if (!input) return 0;
  const isoLike = String(input).replace(' ', 'T');
  const t = Date.parse(isoLike);
  return Number.isFinite(t) ? t : 0;
}

function getImageUrl(item) {
  // Prefer API's imgSrc, then fallbacks
  const candidates = [
    item?.imgSrc,
    item?.image,
    item?.image_url,
    item?.imageUrl,
    item?.thumbnail,
    item?.thumb,
    item?.photo,
    item?.cover,
    item?.cover_image,
    item?.coverImage,
    item?.media?.image,
    item?.media?.url,
    item?.image?.url,
  ];
  const url = candidates.find(v => typeof v === 'string' && v.trim());
  return url || null;
}

async function loadInitiatives() {
  const container = document.querySelector('#landing-initiatives .workflow');
  if (!container) return;

  try {
    const res = await fetch(ENDPOINT, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('Unexpected payload shape');

    data.sort((a, b) => parseDateSafe(pickDate(b)) - parseDateSafe(pickDate(a)));

    const frag = document.createDocumentFragment();

    data.forEach((item, idx) => {
      // wrapper row
      const row = document.createElement('div');
      row.className = 'workflow-item' + (idx % 2 ? ' reverse' : '');

      // image
      const img = document.createElement('img');
      img.src = getImageUrl(item) || FALLBACK_IMG;
      img.alt = item?.title ? `${item.title} image` : 'Initiative image';
      img.loading = 'lazy';

      // text block
      const desc = document.createElement('div');
      desc.className = 'description';

      const h2 = document.createElement('h2');
      const rawUrl = item?.url || '';
      const url = rawUrl.trim();

      console.log(`[${item.title}] Raw URL: "${rawUrl}" | Trimmed: "${url}"`);

      if (url.length > 5 && /^https?:\/\//i.test(url)) {
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = item.title || 'Untitled Initiative';
        h2.appendChild(a);
      } else {
        h2.textContent = item.title || 'Untitled Initiative';
      }

      const p = document.createElement('p');
      p.textContent = pickSummary(item);

      desc.append(h2, p);
      row.append(img, desc);
      frag.appendChild(row);
    });

    container.innerHTML = '';
    container.appendChild(frag);
    if (!container.children.length) container.textContent = 'No initiatives found.';
  } catch (err) {
    console.error('Failed to load initiatives:', err);
    const msg = document.createElement('div');
    msg.className = 'error';
    msg.textContent = 'Could not load initiatives.';
    container.innerHTML = '';
    container.appendChild(msg);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadInitiatives);
} else {
  loadInitiatives();
}
