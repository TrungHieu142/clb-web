import { api } from './api.js';
import { formatDateTime, seatsLeft } from './format.js';
import { showLoading, showError, clear, el } from './ui.js';

const detail = document.querySelector('#detail');
const evidenceSection = document.querySelector('#evidence-section');
const evidenceStatusBox = document.querySelector('#evidence-status-box');
const evidenceForm = document.querySelector('#evidence-form');
const evidenceSubmitBtn = document.querySelector('#evidence-submit-btn');

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

  const msgBox = el('div', { id: 'action-msg' });

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
        await api('DELETE', `/api/activities/${id}/registrations/me`);
        msgBox.append(el('p', { className: 'msg', textContent: 'Đã huỷ đăng ký thành công!' }));
      } else {
        await api('POST', `/api/activities/${id}/registrations`);
        msgBox.append(el('p', { className: 'msg', textContent: 'Đăng ký tham gia thành công!' }));
      }
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

  // Hiển thị khung nộp minh chứng nếu người dùng đã đăng ký
  if (isRegistered) {
    evidenceSection.style.display = 'block';
    renderEvidenceStatus(a);
  } else {
    evidenceSection.style.display = 'none';
  }
}

function renderEvidenceStatus(a) {
  clear(evidenceStatusBox);

  if (!a.evidence_status) {
    evidenceStatusBox.append(el('p', {
      style: 'color: #666;',
      textContent: 'Bạn chưa nộp minh chứng tham gia hoạt động này. Hãy chọn file bên dưới để tải lên.'
    }));
    return;
  }

  const statusMap = {
    'PENDING': { text: '⏳ Đang chờ duyệt', color: '#f57c00' },
    'APPROVED': { text: '✅ Đã được duyệt', color: '#2e7d32' },
    'REJECTED': { text: '❌ Bị từ chối', color: '#d32f2f' }
  };

  const st = statusMap[a.evidence_status] || { text: a.evidence_status, color: '#333' };

  const viewFileBtn = el('button', {
    className: 'btn btn--secondary',
    style: 'padding: 0.3rem 0.6rem; font-size: 0.85rem; margin-left: 0.8rem;',
    textContent: 'Xem file đã nộp'
  });

  viewFileBtn.addEventListener('click', async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/evidences/${a.evidence_id}/file`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Không thể tải file minh chứng');
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
    } catch (err) {
      alert(err.message);
    }
  });

  evidenceStatusBox.append(
    el('p', {},
      el('strong', { textContent: 'Trạng thái minh chứng: ' }),
      el('span', { style: `color: ${st.color}; font-weight: bold;`, textContent: st.text }),
      viewFileBtn
    )
  );
}

// Xử lý gửi form nộp minh chứng
evidenceForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fileInput = document.querySelector('#evidence-file');
  if (!fileInput.files || fileInput.files.length === 0) return;

  const formData = new FormData();
  formData.append('file', fileInput.files[0]);

  evidenceSubmitBtn.disabled = true;
  evidenceSubmitBtn.textContent = 'Đang tải lên...';

  try {
    await api('POST', `/api/activities/${id}/evidences`, formData);
    fileInput.value = '';
    alert('Nộp minh chứng thành công! Vui lòng chờ quản trị viên phê duyệt.');
    await load();
  } catch (err) {
    alert(`Lỗi nộp minh chứng: ${err.message}`);
  } finally {
    evidenceSubmitBtn.disabled = false;
    evidenceSubmitBtn.textContent = 'Gửi minh chứng';
  }
});
