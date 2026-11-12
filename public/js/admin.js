import { api } from './api.js';
import { formatDateTime } from './format.js';
import { showLoading, showError, showEmpty, clear, el } from './ui.js';

const tbody = document.querySelector('#tbody');
const modal = document.querySelector('#registrations-modal');
const modalTitle = document.querySelector('#modal-title');
const regList = document.querySelector('#registrations-list');
const closeBtn = document.querySelector('#close-modal-btn');

closeBtn.addEventListener('click', () => {
  modal.style.display = 'none';
});

async function load() {
  clear(tbody);
  const loadingRow = el('tr', {}, el('td', { colSpan: 6, className: 'msg', textContent: 'Đang tải danh sách...' }));
  tbody.append(loadingRow);

  try {
    const data = await api('GET', '/api/activities?limit=50');
    clear(tbody);

    if (!data.items || data.items.length === 0) {
      tbody.append(el('tr', {}, el('td', { colSpan: 6, className: 'msg', textContent: 'Chưa có hoạt động nào trong hệ thống' })));
      return;
    }

    data.items.forEach((a) => {
      const editBtn = el('a', {
        href: `/admin-edit.html?id=${a.id}`,
        className: 'btn btn--secondary',
        style: 'padding: 0.3rem 0.6rem; font-size: 0.85rem; margin-right: 0.3rem;',
        textContent: 'Sửa'
      });

      const deleteBtn = el('button', {
        className: 'btn btn--danger',
        style: 'padding: 0.3rem 0.6rem; font-size: 0.85rem; margin-right: 0.3rem;',
        textContent: 'Xoá'
      });

      deleteBtn.addEventListener('click', async () => {
        if (!confirm(`Bạn có chắc chắn muốn xoá hoạt động "${a.title}" không?`)) return;
        deleteBtn.disabled = true;
        try {
          await api('DELETE', `/api/activities/${a.id}`);
          await load();
        } catch (err) {
          alert(`Lỗi khi xoá: ${err.message}`);
          deleteBtn.disabled = false;
        }
      });

      const viewBtn = el('button', {
        className: 'btn',
        style: 'padding: 0.3rem 0.6rem; font-size: 0.85rem;',
        textContent: 'Xem DS'
      });

      viewBtn.addEventListener('click', async () => {
        modal.style.display = 'block';
        modalTitle.textContent = `Người đăng ký: ${a.title}`;
        showLoading(regList);

        try {
          const list = await api('GET', `/api/activities/${a.id}/registrations`);
          clear(regList);
          if (!list || list.length === 0) {
            regList.append(el('p', { textContent: 'Chưa có ai đăng ký hoạt động này.' }));
            return;
          }
          const ul = el('ul', { style: 'padding-left: 1.2rem;' });
          list.forEach((u) => {
            ul.append(el('li', { textContent: `${u.full_name} (${u.email}) - Đăng ký lúc: ${formatDateTime(u.created_at)}` }));
          });
          regList.append(ul);
        } catch (err) {
          showError(regList, err.message);
        }
      });

      const tr = el('tr', {},
        el('td', { textContent: `#${a.id}` }),
        el('td', {}, el('strong', { textContent: a.title })),
        el('td', { textContent: formatDateTime(a.start_at) }),
        el('td', { textContent: a.location || 'Chưa có' }),
        el('td', { textContent: `${a.registered}/${a.capacity}` }),
        el('td', {}, editBtn, deleteBtn, viewBtn)
      );
      tbody.append(tr);
    });
  } catch (err) {
    clear(tbody);
    tbody.append(el('tr', {}, el('td', { colSpan: 6, className: 'msg msg--error', textContent: err.message })));
  }
}

load();

