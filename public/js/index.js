import { api } from './api.js';
import { buildQuery, formatDateTime, seatsLeft } from './format.js';
import { showLoading, showError, showEmpty, clear, el } from './ui.js';

const list = document.querySelector('#list');
const pager = document.querySelector('#pager');
const searchForm = document.querySelector('#search');
const params = new URLSearchParams(location.search);

searchForm.q.value = params.get('q') ?? '';

searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const q = searchForm.q.value.trim();
  location.search = buildQuery({ q });
});

function card(a) {
  const remaining = seatsLeft(a.capacity, a.registered);
  return el('article', { className: 'card' },
    el('div', {},
      el('h3', {}, el('a', { href: `/activity.html?id=${a.id}`, textContent: a.title })),
      el('p', { textContent: `📅 ${formatDateTime(a.start_at)}` }),
      el('p', { textContent: `📍 ${a.location || 'Chưa có địa điểm'}` })
    ),
    el('div', { style: 'margin-top: 1rem; display: flex; justify-content: space-between; align-items: center;' },
      el('span', { className: 'badge', textContent: `Còn ${remaining}/${a.capacity} chỗ` }),
      el('a', { href: `/activity.html?id=${a.id}`, className: 'btn', textContent: 'Chi tiết' })
    )
  );
}

async function load() {
  showLoading(list);
  try {
    const q = params.get('q');
    const page = params.get('page');
    const data = await api('GET', `/api/activities${buildQuery({ q, page })}`);

    if (!data.items || data.items.length === 0) {
      clear(pager);
      return showEmpty(list, 'Chưa có hoạt động nào phù hợp');
    }

    clear(list);
    list.append(...data.items.map(card));
    renderPager(data);
  } catch (e) {
    clear(pager);
    showError(list, e.message);
  }
}

function renderPager({ page, limit, total }) {
  const pages = Math.ceil(total / limit) || 1;
  clear(pager);

  if (pages <= 1) return;

  const currentQ = params.get('q');

  if (page > 1) {
    pager.append(el('a', {
      href: buildQuery({ q: currentQ, page: page - 1 }) || '?',
      textContent: '‹ Trước'
    }));
  }

  pager.append(el('span', { textContent: `Trang ${page}/${pages}` }));

  if (page < pages) {
    pager.append(el('a', {
      href: buildQuery({ q: currentQ, page: page + 1 }),
      textContent: 'Sau ›'
    }));
  }
}

load();

