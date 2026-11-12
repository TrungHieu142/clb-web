import { api } from './api.js';
import { formatDateTime } from './format.js';
import { clear, el } from './ui.js';

const tbody = document.querySelector('#evidence-tbody');
const filterStatus = document.querySelector('#filter-status');

filterStatus.addEventListener('change', () => {
  loadEvidences();
});

async function loadEvidences() {
  clear(tbody);
  tbody.append(el('tr', {}, el('td', { colSpan: 6, className: 'msg', textContent: 'Đang tải danh sách minh chứng...' })));

  const status = filterStatus.value;

  try {
    const list = await api('GET', `/api/evidences?status=${status}`);
    clear(tbody);

    if (!list || list.length === 0) {
      tbody.append(el('tr', {}, el('td', { colSpan: 6, className: 'msg', textContent: 'Không có minh chứng nào ở trạng thái này.' })));
      return;
    }

    list.forEach((ev) => {
      // 1. Nút xem file minh chứng an toàn
      const viewFileBtn = el('button', {
        className: 'btn btn--secondary',
        style: 'padding: 0.3rem 0.6rem; font-size: 0.85rem;',
        textContent: '👁 Xem file'
      });

      viewFileBtn.addEventListener('click', async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`/api/evidences/${ev.id}/file`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!res.ok) throw new Error('Không thể tải file');
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          window.open(url, '_blank');
        } catch (err) {
          alert(`Lỗi khi mở file: ${err.message}`);
        }
      });

      // 2. Nút Duyệt và Từ chối
      const actionTd = el('td', {});

      if (ev.status === 'PENDING') {
        const approveBtn = el('button', {
          className: 'btn',
          style: 'padding: 0.3rem 0.6rem; font-size: 0.85rem; margin-right: 0.3rem;',
          textContent: '✔ Duyệt'
        });

        approveBtn.addEventListener('click', async () => {
          if (!confirm(`Xác nhận DUYỆT minh chứng của sinh viên ${ev.full_name}?`)) return;
          try {
            await api('PATCH', `/api/evidences/${ev.id}`, { status: 'APPROVED' });
            await loadEvidences();
          } catch (err) {
            alert(`Lỗi duyệt: ${err.message}`);
          }
        });

        const rejectBtn = el('button', {
          className: 'btn btn--danger',
          style: 'padding: 0.3rem 0.6rem; font-size: 0.85rem;',
          textContent: '✖ Từ chối'
        });

        rejectBtn.addEventListener('click', async () => {
          if (!confirm(`Xác nhận TỪ CHỐI minh chứng của sinh viên ${ev.full_name}?`)) return;
          try {
            await api('PATCH', `/api/evidences/${ev.id}`, { status: 'REJECTED' });
            await loadEvidences();
          } catch (err) {
            alert(`Lỗi từ chối: ${err.message}`);
          }
        });

        actionTd.append(approveBtn, rejectBtn);
      } else {
        actionTd.append(el('span', {
          style: `font-weight: bold; color: ${ev.status === 'APPROVED' ? '#2e7d32' : '#d32f2f'}`,
          textContent: ev.status === 'APPROVED' ? 'Đã duyệt' : 'Đã từ chối'
        }));
      }

      const tr = el('tr', {},
        el('td', { textContent: `#${ev.id}` }),
        el('td', {},
          el('strong', { textContent: ev.full_name }),
          el('div', { style: 'font-size: 0.85rem; color: #666;', textContent: ev.email })
        ),
        el('td', { textContent: ev.activity_title }),
        el('td', { textContent: formatDateTime(ev.created_at) }),
        el('td', {}, viewFileBtn),
        actionTd
      );

      tbody.append(tr);
    });
  } catch (err) {
    clear(tbody);
    tbody.append(el('tr', {}, el('td', { colSpan: 6, className: 'msg msg--error', textContent: err.message })));
  }
}

loadEvidences();

