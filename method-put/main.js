const escapeHTML = (html) => String(html).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll("'", '&#39;').replaceAll('"', '&quot;');

const template = (row) => `<tr data-id="${escapeHTML(row.id)}">
    <th scope="row">${escapeHTML(row.id)}</th>
    <td><input type="text" name="title" class="form-control" value="${escapeHTML(row.title)}"><div class="invalid-feedback"></div></td>
    <td><input type="text" name="price" class="form-control" value="${escapeHTML(row.price)}"><div class="invalid-feedback"></div></td>
    <td><button type="button" class="btn btn-warning w-100 js-btn-update">
      <span class="spinner-border spinner-border-sm d-none" aria-hidden="true"></span>
      <span role="status">Обновить</span>
    </button></td>
  </tr>`;

const toastHTML = (success, message) => `<div class="toast align-items-center text-bg-${success ? 'success' : 'danger'} border-0" role="alert" aria-live="assertive" aria-atomic="true">
  <div class="d-flex">
    <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  </div>`;

const timeout = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const showToast = (success, message) => {
  const toastContainer = document.querySelector('.toast-container');
  toastContainer.insertAdjacentHTML('beforeend', toastHTML(success, message));
  const toast = document.querySelector('.toast:last-child');
  const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toast);
  toastBootstrap.show();
}

document.addEventListener('DOMContentLoaded', async () => {
  const response = await fetch('/phones/data.json', {
    method: 'GET',
    headers: {
      'pragma': 'no-cache',
      'cache-control': 'no-cache'
    }
  });
  if (response.ok) {
    const phones = await response.json();
    const html = phones.map((row) => template(row)).join('');
    document.querySelector('tbody').innerHTML = html;
  }
});

document.addEventListener('click', async (e) => {
  const submit = e.target.closest('.js-btn-update');
  if (!submit || submit.disabled) {
    return;
  }
  e.preventDefault();
  submit.disabled = true;
  submit.querySelector('.spinner-border').classList.remove('d-none');
  const tr = submit.closest('tr');
  const body = {
    id: Number(tr.dataset.id),
    title: tr.querySelector('[name="title"]').value,
    price: Number(tr.querySelector('[name="price"]').value),
  }
  const response = await fetch('/phones/update.php', {
    method: 'put',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      'X-Requested-With': 'XMLHttpRequest'
    },
    body: JSON.stringify(body),
  });
  if (response.ok) {
    await timeout(500);
    const result = await response.json();
    if (result.success) {
      tr.querySelectorAll('input').forEach((input) => {
        input.classList.remove('is-invalid');
      });
      showToast(result.success, `Данные в строке #${tr.dataset.id} успешно обновлены!`);
    } else {
      showToast(result.success, `Ошибка при обновлении данных в строке #${tr.dataset.id}!`);
      Object.keys(result.errors).forEach((key) => {
        const el = tr.querySelector(`[name="${key}"]`);
        el.classList.add('is-invalid');
        showToast(result.success, result.errors[key]);
      });
    }
  }
  submit.querySelector('.spinner-border').classList.add('d-none');
  submit.disabled = false;
});
