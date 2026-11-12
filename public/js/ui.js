export function clear(el) {
  el.replaceChildren();
}

function message(el, text, extraClass = '') {
  const p = document.createElement('p');
  p.className = `msg ${extraClass}`.trim();
  p.textContent = text; // Luôn dùng textContent để chống XSS
  el.replaceChildren(p);
}

export const showLoading = (el) => message(el, 'Đang tải dữ liệu...');
export const showError = (el, text) => message(el, text, 'msg--error');
export const showEmpty = (el, text) => message(el, text);

export function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  Object.assign(node, props);
  for (const child of children) {
    if (child !== null && child !== undefined && child !== false) {
      node.append(child);
    }
  }
  return node;
}

