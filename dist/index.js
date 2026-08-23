export function mount(container, api) {
  container.innerHTML = `
    <div style="max-width: 680px; margin: 32px auto; padding: 0 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9;">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #f8fafc;">Models & Usage</h1>
            <button id="ag-refresh" title="Refresh" style="background: none; border: none; color: #94a3b8; cursor: pointer; padding: 4px; display: flex; align-items: center; border-radius: 6px; transition: color 0.2s;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/>
                <path d="M21 3v5h-5"/>
              </svg>
            </button>
          </div>
          <p style="margin: 4px 0 0; font-size: 13px; color: #94a3b8;">Manage your model quota and limits.</p>
        </div>
        <span id="ag-time" style="font-size: 12px; color: #64748b; margin-top: 6px;"></span>
      </div>

      <div id="ag-content">
        <div style="text-align: center; padding: 40px 0; color: #94a3b8; font-size: 14px;">Загрузка квот...</div>
      </div>
    </div>
  `;

  function renderRing(pct) {
    const radius = 14;
    const circ = 2 * Math.PI * radius;
    const strokePct = ((100 - pct) * circ) / 100;
    const color = pct > 50 ? '#22c55e' : pct > 20 ? '#eab308' : '#ef4444';

    return `
      <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
        <svg style="width: 34px; height: 34px; transform: rotate(-90deg);" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="${radius}" fill="none" stroke="#334155" stroke-width="3.5" />
          <circle cx="18" cy="18" r="${radius}" fill="none" stroke="${color}" stroke-width="3.5"
            stroke-dasharray="${circ}" stroke-dashoffset="${strokePct}" stroke-linecap="round" />
        </svg>
      </div>
    `;
  }

  async function loadData() {
    const content = container.querySelector('#ag-content');
    const timeEl = container.querySelector('#ag-time');
    const refreshBtn = container.querySelector('#ag-refresh');
    if (!content) return;

    if (refreshBtn) refreshBtn.style.transform = 'rotate(180deg)';

    try {
      let data = null;
      if (api && typeof api.rpc === 'function') {
        data = await api.rpc('GET', '/quota');
      }

      if (timeEl) timeEl.innerText = 'Updated: ' + new Date().toLocaleTimeString();

      if (!data || !data.models || data.models.length === 0) {
        content.innerHTML = '<div style="color: #ef4444; padding: 20px;">Не удалось получить квоты. Попробуйте обновить.</div>';
        return;
      }

      // Group models
      const geminiModels = data.models.filter(m => m.name.toLowerCase().includes('gemini'));
      const claudeGptModels = data.models.filter(m => !m.name.toLowerCase().includes('gemini'));

      const geminiPct = parseInt(geminiModels[0]?.remaining) || 0;
      const geminiReset = geminiModels[0]?.resetsIn || '4 hours';

      const claudePct = parseInt(claudeGptModels[0]?.remaining) || 0;
      const claudeReset = claudeGptModels[0]?.resetsIn || '5 hours';

      content.innerHTML = `
        <!-- Section: Plan -->
        <div style="margin-bottom: 24px;">
          <div style="font-size: 13px; font-weight: 600; color: #cbd5e1; margin-bottom: 8px;">Plan</div>
          <div style="background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 14px; font-weight: 600; color: #f8fafc;">Your Plan: Google AI Pro</div>
              <div style="font-size: 12px; color: #94a3b8; margin-top: 3px;">Account: ${data.account || 'darewangog@gmail.com'}</div>
            </div>
            <div style="background: #0284c7; color: white; font-size: 12px; font-weight: 500; padding: 6px 14px; border-radius: 6px;">Active</div>
          </div>
        </div>

        <!-- Section: Gemini Models -->
        <div style="margin-bottom: 24px;">
          <div style="display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: #cbd5e1; margin-bottom: 8px;">
            <span>Gemini Models</span>
            <span style="color: #64748b; font-size: 12px; cursor: help;" title="Gemini 3 Flash, 3.1 Pro, 3.5, 3.6, 3.7">ⓘ</span>
          </div>
          <div style="background: #1e293b; border: 1px solid #334155; border-radius: 12px; overflow: hidden;">
            <div style="padding: 16px 20px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-size: 14px; font-weight: 500; color: #f8fafc;">Five Hour Limit Remaining</div>
                <div style="font-size: 12px; color: #94a3b8; margin-top: 3px;">You have used some of your 5-hour limit, it will fully refresh in ${geminiReset}.</div>
              </div>
              <div style="display: flex; align-items: center; gap: 12px; flex-shrink: 0;">
                <span style="font-size: 15px; font-weight: 600; color: #f8fafc;">${geminiPct}%</span>
                ${renderRing(geminiPct)}
              </div>
            </div>
          </div>
        </div>

        <!-- Section: Claude & GPT Models -->
        <div style="margin-bottom: 24px;">
          <div style="display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: #cbd5e1; margin-bottom: 8px;">
            <span>Claude and GPT models</span>
            <span style="color: #64748b; font-size: 12px; cursor: help;" title="Claude Opus 4.6, Claude Sonnet 4.6, GPT-OSS 120B">ⓘ</span>
          </div>
          <div style="background: #1e293b; border: 1px solid #334155; border-radius: 12px; overflow: hidden;">
            <div style="padding: 16px 20px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-size: 14px; font-weight: 500; color: #f8fafc;">Five Hour Limit Remaining</div>
                <div style="font-size: 12px; color: #94a3b8; margin-top: 3px;">${claudePct === 100 ? 'Limit is full. Ready for heavy reasoning.' : 'Refreshes in ' + claudeReset + '.'}</div>
              </div>
              <div style="display: flex; align-items: center; gap: 12px; flex-shrink: 0;">
                <span style="font-size: 15px; font-weight: 600; color: #f8fafc;">${claudePct}%</span>
                ${renderRing(claudePct)}
              </div>
            </div>
          </div>
        </div>

        <!-- Detailed Breakdown Accordion -->
        <details style="margin-top: 16px; background: #0f172a; border: 1px solid #1e293b; border-radius: 10px; padding: 12px 16px;">
          <summary style="font-size: 13px; color: #94a3b8; cursor: pointer; user-select: none;">Show per-model details (${data.models.length} models)</summary>
          <div style="margin-top: 12px; display: grid; gap: 8px;">
            ${data.models.map(m => `
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 13px; padding: 6px 0; border-bottom: 1px solid #1e293b;">
                <span style="color: #cbd5e1;">${m.name}</span>
                <div style="display: flex; gap: 14px; align-items: center;">
                  <span style="color: #64748b; font-size: 12px;">⏱ ${m.resetsIn}</span>
                  <span style="font-weight: 600; color: ${parseInt(m.remaining) > 50 ? '#22c55e' : '#eab308'};">${m.remaining}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </details>
      `;
    } catch (e) {
      content.innerHTML = `<div style="color: #ef4444; padding: 20px;">Ошибка: ${e?.message || 'Не удалось получить квоты'}</div>`;
    } finally {
      if (refreshBtn) refreshBtn.style.transform = 'none';
    }
  }

  const refreshBtn = container.querySelector('#ag-refresh');
  if (refreshBtn) refreshBtn.addEventListener('click', loadData);

  loadData();
}

export function unmount(container) {}
