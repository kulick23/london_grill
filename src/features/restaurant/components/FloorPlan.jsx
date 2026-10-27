import { useRef, useState } from 'react';
import { useWords } from '../ExperienceProvider';
import { STATUS, tableStatus } from '../booking/model';

export default function FloorPlan({ state, request, selected, onSelect, recommended, ignoreId }) {
  const w = useWords();
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const points = useRef(new Map());
  const previous = useRef(null);
  const limit = (n) => Math.max(-180, Math.min(180, n));
  const scale = (n) => setZoom(Math.max(1, Math.min(2.3, n)));
  const start = (e) => {
    if (e.target.closest('[data-table]')) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    points.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    previous.current = null;
  };
  const move = (e) => {
    if (!points.current.has(e.pointerId)) return;
    const old = points.current.get(e.pointerId);
    points.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (points.current.size === 2) {
      const [a, b] = [...points.current.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (previous.current) scale((zoom * d) / previous.current);
      previous.current = d;
    } else {
      setPan((p) => ({
        x: limit(p.x + (e.clientX - old.x) * 1.2),
        y: limit(p.y + (e.clientY - old.y) * 1.2),
      }));
    }
  };
  const stop = (e) => {
    points.current.delete(e.pointerId);
    previous.current = null;
  };
  return (
    <div className="floor-plan" data-ui>
      <div className="floor-toolbar">
        <p>
          {w('План зала', 'Floor plan')}{' '}
          <span>{w('· схема для демонстрации', '· demonstration layout')}</span>
        </p>
        <div>
          <button
            type="button"
            aria-label={w('Уменьшить план', 'Zoom out')}
            onClick={() => scale(zoom - 0.2)}
            disabled={zoom <= 1}
          >
            −
          </button>
          <output aria-label={w('Масштаб', 'Zoom')}>{Math.round(zoom * 100)}%</output>
          <button
            type="button"
            aria-label={w('Увеличить план', 'Zoom in')}
            onClick={() => scale(zoom + 0.2)}
            disabled={zoom >= 2.3}
          >
            +
          </button>
          <button
            type="button"
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
          >
            {w('Сброс', 'Reset')}
          </button>
        </div>
      </div>
      <div
        className="floor-canvas"
        tabIndex="0"
        role="group"
        aria-label={w(
          'Интерактивный план. Стрелки перемещают план; кнопки изменяют масштаб.',
          'Interactive floor plan. Arrow keys pan; buttons change zoom.',
        )}
        onKeyDown={(e) => {
          if (e.target !== e.currentTarget) return;
          const delta = {
            ArrowLeft: [30, 0],
            ArrowRight: [-30, 0],
            ArrowUp: [0, 30],
            ArrowDown: [0, -30],
          }[e.key];
          if (delta) {
            e.preventDefault();
            setPan((p) => ({ x: limit(p.x + delta[0]), y: limit(p.y + delta[1]) }));
          }
        }}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={stop}
        onPointerCancel={stop}
        onLostPointerCapture={stop}
      >
        <svg
          viewBox="0 0 720 660"
          aria-label={w('Зоны и столики ресторана', 'Restaurant zones and tables')}
        >
          <defs>
            <pattern id="table-unavailable" width="7" height="7" patternUnits="userSpaceOnUse">
              <path d="M-1 1L1-1M0 7L7 0M6 8L8 6" stroke="currentColor" strokeWidth=".65" />
            </pattern>
          </defs>
          <g
            transform={`translate(${360 + pan.x} ${330 + pan.y}) scale(${zoom}) translate(-360 -330)`}
          >
            <path className="floor-wall" d="M50 610V35H680V610H440M50 610H260" />
            <path className="floor-window" d="M80 35H235M265 35H420M450 35H630" />
            <path className="floor-divider" d="M60 235H620M60 435H620" />
            {state.zones.map((zone, i) => (
              <text className="floor-zone-label" key={zone.id} x="80" y={i * 200 + 79}>
                {w(zone.ru, zone.en)}
              </text>
            ))}
            <rect x="640" y="280" width="32" height="130" className="floor-bar" />
            <text x="657" y="350" className="floor-bar-label" transform="rotate(-90 657 350)">
              {w('Бар', 'Bar')}
            </text>
            <text x="300" y="628" className="floor-note">
              {w('Вход', 'Entrance')} →
            </text>
            {state.tables.map((t) => {
              const status = tableStatus(t, request, state, ignoreId);
              const visible = request.zone === 'all' || request.zone === t.zone;
              const active = selected === t.id;
              const canSelect = visible && status === 'available';
              const cls = active ? 'selected' : status;
              const width = t.capacity === 6 ? 112 : 84;
              const chairXs = t.capacity === 6 ? [-36, 0, 36] : t.capacity === 4 ? [-23, 23] : [0];
              return (
                <g
                  key={t.id}
                  data-table={t.id}
                  className={`floor-table status-${cls} ${visible ? '' : 'outside-zone'} ${recommended === t.id && canSelect ? 'is-recommended' : ''}`}
                  transform={`translate(${t.x} ${t.y})`}
                  role="button"
                  tabIndex={canSelect ? 0 : -1}
                  aria-disabled={!canSelect}
                  aria-pressed={active}
                  aria-label={`${w('Стол', 'Table')} ${t.number}, ${t.capacity} ${w('мест', 'seats')}, ${w(...STATUS[cls])}`}
                  onClick={() => canSelect && onSelect(t.id)}
                  onKeyDown={(e) => {
                    if (canSelect && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      onSelect(t.id);
                    }
                  }}
                >
                  <title>{`${w('Стол', 'Table')} ${t.number} · ${t.capacity} ${w('мест', 'seats')} · ${w(...STATUS[cls])}`}</title>
                  {chairXs.map((x) => (
                    <g key={x} className="floor-chair">
                      <rect x={x - 12} y="-55" width="24" height="12" rx="3" />
                      <rect x={x - 12} y="43" width="24" height="12" rx="3" />
                    </g>
                  ))}
                  {t.shape === 'circle' ? (
                    <circle className="floor-table-surface" r="38" />
                  ) : (
                    <rect
                      className="floor-table-surface"
                      x={-width / 2}
                      y="-36"
                      width={width}
                      height="72"
                      rx="7"
                    />
                  )}
                  <text className="floor-table-number" textAnchor="middle" y="2">
                    {t.number}
                  </text>
                  <text className="floor-table-seats" textAnchor="middle" y="22">
                    {t.capacity} {w('мест', 'seats')}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
      <div className="floor-legend">
        {Object.entries(STATUS).map(([key, value]) => (
          <span key={key}>
            <i className={`status-dot status-${key}`} aria-hidden="true" />
            {w(...value)}
          </span>
        ))}
      </div>
      <p className="floor-help">
        {w(
          'Перетаскивайте схему или используйте стрелки. На телефоне масштаб меняется двумя пальцами. Ниже доступен список столиков.',
          'Drag or use arrow keys to pan. Pinch with two fingers to zoom. An accessible table list is available below.',
        )}
      </p>
    </div>
  );
}
