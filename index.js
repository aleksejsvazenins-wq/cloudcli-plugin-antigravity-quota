export default function QuotaPlugin() {
  return {
    title: '⚡ Quota',
    render: async (container, api) => {
      container.innerHTML = `
        <div style="padding: 20px; color: #f8fafc; font-family: sans-serif; max-width: 900px; margin: 0 auto;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; padding-bottom: 15px; margin-bottom: 20px;">
            <h2 style="margin: 0; color: #38bdf8;">⚡ Antigravity Quota Status</h2>
            <button id="refreshBtn" style="background: #0284c7; color: white; border: none; padding: 6px 14px; border-radius: 6px; cursor: pointer;">🔄 Обновить</button>
          </div>
          <div id="quotaContent" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 14px;">
            <div>Загрузка квот...</div>
          </div>
        </div>
      `;
      async function fetchQuota() {
        const content = container.querySelector('#quotaContent');
        content.innerHTML = '<div style="color: #94a3b8;">Получение данных от Google...</div>';
        try {
          const res = await api.exec('npx antigravity-usage');
          const lines = (res.stdout || '').split('\n');
          const models = [];
          for (const line of lines) {
            if (line.includes('%')) {
              const parts = line.split('│').map(s => s.trim()).filter(Boolean);
              if (parts.length >= 3) {
                models.push({ name: parts[0], remaining: parts[1], resetsIn: parts[2] });
              }
            }
          }
          if (models.length > 0) {
            content.innerHTML = models.map(m => {
              const pct = parseInt(m.remaining) || 0;
              const color = pct > 50 ? '#22c55e' : pct > 20 ? '#eab308' : '#ef4444';
              return `
                <div style="background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 14px;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <strong style="color: #f1f5f9;">${m.name}</strong>
                    <span style="color: #94a3b8; font-size: 12px;">⏱ ${m.resetsIn}</span>
                  </div>
                  <div style="background: #334155; height: 8px; border-radius: 4px; overflow: hidden; margin-bottom: 6px;">
                    <div style="background: ${color}; width: ${pct}%; height: 100%;"></div>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 12px; color: #cbd5e1;">
                    <span>Остаток</span>
                    <strong style="color: ${color};">${m.remaining}</strong>
                  </div>
                </div>
              `;
            }).join('');
          } else {
            content.innerHTML = `<pre style="background: #0f172a; padding: 15px; border-radius: 8px;">${res.stdout}</pre>`;
          }
        } catch (e) {
          content.innerHTML = `<div style="color: #ef4444;">Ошибка: ${e.message}</div>`;
        }
      }
      container.querySelector('#refreshBtn').addEventListener('click', fetchQuota);
      fetchQuota();
    }
  };
}
