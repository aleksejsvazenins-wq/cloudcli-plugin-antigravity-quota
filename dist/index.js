export function mount(container, api) {
  container.innerHTML = `
    <div style="padding: 24px; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 1000px; margin: 0 auto;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; padding-bottom: 16px; margin-bottom: 24px;">
        <h2 style="margin: 0; color: #38bdf8; font-size: 22px; display: flex; align-items: center; gap: 10px;">
          ⚡ Antigravity Quota Status
        </h2>
        <div style="display: flex; align-items: center; gap: 12px;">
          <span id="ag-account" style="background: #1e293b; padding: 6px 14px; border-radius: 20px; font-size: 13px; border: 1px solid #334155; color: #94a3b8;">darewangog@gmail.com</span>
          <button id="ag-refresh" style="background: #0284c7; color: white; border: none; padding: 7px 16px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer;">🔄 Обновить</button>
        </div>
      </div>
      <div id="ag-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 16px;">
        <div style="color: #94a3b8; font-size: 14px;">Загрузка данных...</div>
      </div>
    </div>
  `;

  async function loadData() {
    const grid = container.querySelector('#ag-grid');
    const accountEl = container.querySelector('#ag-account');
    if (!grid) return;

    grid.innerHTML = '<div style="color: #94a3b8; font-size: 14px;">Запрос квот от Google...</div>';

    try {
      let stdout = '';
      if (api && typeof api.exec === 'function') {
        const res = await api.exec('npx antigravity-usage');
        stdout = res ? (res.stdout || res) : '';
      }

      const lines = (stdout || '').split('\n');
      let account = 'darewangog@gmail.com';
      const models = [];
      for (const line of lines) {
        if (line.includes('@')) {
          const match = line.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
          if (match) account = match[1];
        }
        if (line.includes('%')) {
          const parts = line.split('│').map(s => s.trim()).filter(Boolean);
          if (parts.length >= 3) {
            models.push({ name: parts[0], remaining: parts[1], resetsIn: parts[2] });
          }
        }
      }

      if (accountEl) {
        accountEl.innerText = `${account} • ${new Date().toLocaleTimeString()}`;
      }

      if (models.length > 0) {
        grid.innerHTML = models.map(m => {
          const pct = parseInt(m.remaining) || 0;
          const color = pct > 50 ? '#22c55e' : pct > 20 ? '#eab308' : '#ef4444';
          return `
            <div style="background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2);">
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 10px;">
                <strong style="color: #f1f5f9; font-size: 15px;">${m.name}</strong>
                <span style="color: #94a3b8; font-size: 13px;">⏱ ${m.resetsIn}</span>
              </div>
              <div style="background: #334155; height: 10px; border-radius: 5px; overflow: hidden; margin-bottom: 8px;">
                <div style="background: ${color}; width: ${pct}%; height: 100%; border-radius: 5px; transition: width 0.4s ease;"></div>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 13px; color: #cbd5e1;">
                <span>Остаток</span>
                <strong style="color: ${color}; font-size: 14px;">${m.remaining}</strong>
              </div>
            </div>
          `;
        }).join('');
      } else if (stdout) {
        grid.innerHTML = `<pre style="background: #0f172a; padding: 16px; border-radius: 10px; color: #f8fafc; font-size: 13px; overflow-x: auto;">${stdout}</pre>`;
      }
    } catch (e) {
      grid.innerHTML = `<div style="color: #ef4444;">Ошибка: ${e ? e.message : 'Не удалось получить квоты'}</div>`;
    }
  }

  const btn = container.querySelector('#ag-refresh');
  if (btn) btn.addEventListener('click', loadData);

  loadData();
}

export function unmount(container) {}
