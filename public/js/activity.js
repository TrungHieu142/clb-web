import { api } from './api.js';
import { formatDateTime, seatsLeft } from './format.js';
import { showLoading, showError, clear, el } from './ui.js';

const detail = document.querySelector('#detail');
const params = new URLSearchParams(location.search);
const id = params.get('id');

if (!/^\d+$/.test(id ?? '')) {
  showError(detail, 'Đường dẫn không hợp lệ hoặc thiếu mã hoạt động');
} else {
  load();
}

async function load() {
  showLoading(detail);
  try {
    const a = await api('GET', `/api/activities/${id}`);
    render(a);
  } catch (e) {
    showError(detail, e.message);
  }
}

function render(a) {
  clear(detail);
  const remaining = seatsLeft(a.capacity, a.registered);
  const isRegistered = Boolean(a.registered_by_me);

  // Vùng thông báo lỗi/thành công khi bấm nút
  const msgBox = el('div', { id: 'action-msg' });

  // Nút hành động Đăng ký hoặc Huỷ
  const actionBtn = el('button', {
    className: isRegistered ? 'btn btn--danger' : 'btn',
    textContent: isRegistered ? 'Huỷ đăng ký tham gia' : (remaining === 0 ? 'Hoạt động đã hết chỗ' : 'Đăng ký tham gia'),
    disabled: !isRegistered && remaining === 0
  });

  actionBtn.addEventListener('click', async () => {
    actionBtn.disabled = true;
    clear(msgBox);

    try {
      if (isRegistered) {
        // Gọi API huỷ đăng ký
        await api('DELETE', `/api/activities/${id}/registrations/me`);
        msgBox.append(el('p', { className: 'msg', textContent: 'Đã huỷ đăng ký thành công!' }));
      } else {
        // Gọi API đăng ký
        await api('POST', `/api/activities/${id}/registrations`);
        msgBox.append(el('p', { className: 'msg', textContent: 'Đăng ký tham gia thành công!' }));
      }
      // Tải lại dữ liệu chi tiết mới nhất
      await load();
    } catch (err) {
      msgBox.append(el('p', { className: 'msg msg--error', textContent: err.message }));
      actionBtn.disabled = false;
    }
  });

  detail.append(
    el('h1', { textContent: a.title }),
    el('div', { style: 'margin: 1rem 0; padding-bottom: 1rem; border-bottom: 1px solid #eee;' },
      el('p', { textContent: `📅 Bắt đầu: ${formatDateTime(a.start_at)}` }),
      el('p', { textContent: `🏁 Kết thúc: ${formatDateTime(a.end_at)}` }),
      el('p', { textContent: `📍 Địa điểm: ${a.location || 'Chưa cập nhật'}` }),
      el('p', { textContent: `👥 Sức chứa: ${a.capacity} người` }),
      el('p', {},
        el('strong', { textContent: 'Tình trạng chỗ: ' }),
        el('span', { className: 'badge', textContent: `Còn lại ${remaining} chỗ` })
      )
    ),
    el('div', { style: 'margin-bottom: 1.5rem;' },
      el('h3', { textContent: 'Nội dung mô tả' }),
      el('p', { style: 'white-space: pre-wrap;', textContent: a.description || 'Không có mô tả chi tiết' })
    ),
    msgBox,
    el('div', { style: 'margin-top: 1rem;' }, actionBtn)
  );
}

