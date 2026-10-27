import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useI18n } from '../../../i18n/I18nProvider';
import { useExperience, useWords } from '../ExperienceProvider';
import { catalog, categories, getItem, isDrink, money } from '../data/catalog';
import { PageHeading } from '../components/Shell';
export default function MenuPage({ seasonal = false }) {
  const { state, change, mode } = useExperience();
  const w = useWords();
  const { language } = useI18n();
  const [params, setParams] = useSearchParams();
  const dialog = useRef(null);
  const [notice, setNotice] = useState('');
  const category = params.get('category') || 'all';
  const query = params.get('q') || '';
  const onlyFavorites = params.get('favorites') === '1';
  const count = Math.max(12, Math.min(120, Number(params.get('count')) || 12));
  const items = catalog.map((i) => getItem(i, state));
  const selected = items.find((i) => i.id === params.get('dish'));
  const name = (i) => w(i.nameRu, i.nameEn);
  const filtered = items.filter(
    (i) =>
      !i.hidden &&
      (!seasonal || i.featured) &&
      (category === 'all' || i.category === category) &&
      (!onlyFavorites || state.favorites.includes(i.id)) &&
      `${i.nameRu} ${i.nameEn}`.toLowerCase().includes(query.toLowerCase()),
  );
  const set = (key, value) => {
    const next = new URLSearchParams(window.location.search);
    if (value) next.set(key, String(value));
    else next.delete(key);
    if (key !== 'dish' && key !== 'count') next.delete('count');
    setParams(next, { replace: key === 'q' });
  };
  useEffect(() => {
    if (selected && !dialog.current.open) dialog.current.showModal();
    else if (!selected && dialog.current.open) dialog.current.close();
  }, [selected]);
  async function favorite(id) {
    try {
      await change((s) => ({
        ...s,
        favorites: s.favorites.includes(id)
          ? s.favorites.filter((x) => x !== id)
          : [...s.favorites, id],
      }));
    } catch {
      setNotice(w('Не удалось сохранить избранное.', 'Could not save favourites.'));
    }
  }
  async function add(item) {
    try {
      await change((s) => {
        const row = s.cart.find((i) => i.id === item.id);
        return {
          ...s,
          cart: row
            ? s.cart.map((i) =>
                i.id === item.id ? { ...i, quantity: Math.min(20, i.quantity + 1) } : i,
              )
            : [...s.cart, { id: item.id, quantity: 1 }],
        };
      });
      setNotice(w(`${name(item)} — в предзаказе.`, `${name(item)} added to your pre-order.`));
    } catch {
      setNotice(w('Не удалось сохранить предзаказ.', 'Could not save pre-order.'));
    }
  }
  const pairing = selected
    ? items.find(
        (i) =>
          !i.hidden && i.category === (isDrink(selected) ? 'snacks' : 'cocktails'),
      )
    : null;
  return (
    <>
      <PageHeading
        title={
          seasonal ? w('Сезонный стол.', 'The seasonal table.') : w('Хороший вкус.', 'Good taste.')
        }
        description={
          seasonal
            ? w(
                'Редакционная демо-подборка: горячее, свежие блюда и что-нибудь из бара.',
                'An editorial demo selection: hot plates, fresh dishes and something from the bar.',
              )
            : w(
                'Бургеры, закуски и барная карта — выберите, с чего начнётся вечер.',
                'Burgers, sharing plates and cocktails. Choose how your evening starts.',
              )
        }
      >
        <Link className="restaurant-text-link" to={seasonal ? '/menu' : '/selection'}>
          {seasonal ? w('Всё меню', 'Full menu') : w('Сезонная подборка', 'Seasonal selection')} ↗
        </Link>
      </PageHeading>
      <p className="demo-note">
        {w(
          mode === 'firebase'
            ? 'Меню и цены в BYN. Состав и аллергены не подтверждены. Заказ отправляется сотруднику после привязки к бронированию.'
            : 'Демонстрационное меню и цены в BYN. Состав и аллергены не подтверждены. Заказ остаётся в этом браузере.',
          mode === 'firebase'
            ? 'Menu prices are in BYN. Ingredients and allergens are unverified. Orders are sent to staff after being attached to a reservation.'
            : 'Demonstration menu and prices are in BYN. Ingredients and allergens are unverified. Orders stay in this browser.',
        )}
      </p>
      <div className="menu-toolbar" data-ui>
        <label className="menu-search">
          {w('Поиск по меню', 'Search the menu')}
          <input
            type="search"
            name="search"
            value={query}
            placeholder={w('Например, бургеры…', 'For example, burgers…')}
            onChange={(e) => set('q', e.target.value)}
          />
        </label>
        <label className="menu-category">
          {w('Категория', 'Category')}
          <select value={category} onChange={(e) => set('category', e.target.value)}>
            <option value="all">{w('Всё меню', 'All dishes')}</option>
            {categories.map((c) => (
              <option value={c.id} key={c.id}>
                {w(c.ru, c.en)}
              </option>
            ))}
          </select>
        </label>
        <button
          className="filter-button"
          aria-pressed={onlyFavorites}
          onClick={() => set('favorites', onlyFavorites ? '' : '1')}
        >
          {w('Избранное', 'Favourites')} · {state.favorites.length}
        </button>
        <Link to="/evening" className="restaurant-text-link">
          {w('Предзаказ', 'Pre-order')} · {state.cart.reduce((n, i) => n + i.quantity, 0)} ↗
        </Link>
      </div>
      <div className="menu-result-count" role="status">
        {filtered.length} {w('позиций', 'items')} {notice && <span>{notice}</span>}
      </div>
      {filtered.length ? (
        <div className="dish-grid">
          {filtered.slice(0, count).map((item) => (
            <article className="dish" key={item.id}>
              <div className={`dish-image ${isDrink(item) ? 'is-drink' : ''}`}>
                <button
                  onClick={() => set('dish', item.id)}
                  aria-label={w(`Подробнее: ${name(item)}`, `View ${name(item)}`)}
                >
                  <img src={item.image} alt={name(item)} width="720" height="500" loading="lazy" />
                </button>
                <button
                  className="favorite-button"
                  aria-pressed={state.favorites.includes(item.id)}
                  aria-label={w(`В избранное: ${name(item)}`, `Favourite ${name(item)}`)}
                  onClick={() => favorite(item.id)}
                >
                  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                    <path
                      d="M12 20 3.6 11.8C-1.2 6.8 5.8.5 12 6.5 18.2.5 25.2 6.8 20.4 11.8Z"
                      fill={state.favorites.includes(item.id) ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      strokeWidth="1.4"
                    />
                  </svg>
                </button>
              </div>
              <div className="dish-heading">
                <h2>
                  <button onClick={() => set('dish', item.id)}>{name(item)}</button>
                </h2>
                <p>{money(item.price, language)}</p>
              </div>
              <p className="dish-description">{w(item.descriptionRu, item.descriptionEn)}</p>
              <button className="restaurant-text-link" onClick={() => add(item)}>
                {w('В предзаказ', 'Add to pre-order')} <span aria-hidden="true">+</span>
              </button>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>{w('Пока ничего.', 'Nothing here yet.')}</h2>
          <p>
            {w(
              'Попробуйте другой запрос или добавьте блюда в избранное.',
              'Try another search or favourite some dishes.',
            )}
          </p>
          <button className="restaurant-text-link" onClick={() => setParams({})}>
            {w('Сбросить фильтры', 'Reset filters')} ↗
          </button>
        </div>
      )}
      {filtered.length > count && (
        <button className="restaurant-button load-more" onClick={() => set('count', count + 12)}>
          {w('Показать ещё', 'Show more')} +
        </button>
      )}
      <dialog
        ref={dialog}
        className="dish-dialog"
        aria-label={w('Описание блюда', 'Dish details')}
        onCancel={(e) => {
          e.preventDefault();
          set('dish', '');
        }}
      >
        <button
          className="dialog-close"
          onClick={() => set('dish', '')}
          aria-label={w('Закрыть блюдо', 'Close dish')}
        >
          ×
        </button>
        {selected && (
          <div className="dish-detail">
            <img
              className={isDrink(selected) ? 'is-drink' : ''}
              src={selected.image}
              width="720"
              height="600"
              alt={name(selected)}
            />
            <div>
              <p className="small-note">{w('Демонстрационная позиция', 'Demonstration item')}</p>
              <h2>{name(selected)}</h2>
              <p className="dish-detail-price">{money(selected.price, language)}</p>
              <p>{w(selected.descriptionRu, selected.descriptionEn)}</p>
              <h3>{w('Состав и аллергены', 'Ingredients & allergens')}</h3>
              <p>
                {w(
                  'Информация не предоставлена. Если у вас аллергия, уточните состав у ресторана до заказа.',
                  'Information has not been provided. If you have an allergy, confirm ingredients with the restaurant before ordering.',
                )}
              </p>
              {pairing && (
                <>
                  <h3>{w('К этому столу', 'For the table')}</h3>
                  <button className="restaurant-text-link" onClick={() => set('dish', pairing.id)}>
                    {name(pairing)} ↗
                  </button>
                  <p className="small-note">
                    {w(
                      'Демонстрационное сочетание, не рекомендация шефа.',
                      'A demonstration pairing, not a chef endorsement.',
                    )}
                  </p>
                </>
              )}
              <button className="restaurant-button" onClick={() => add(selected)}>
                {w('Добавить в предзаказ', 'Add to pre-order')} +
              </button>
              <p role="status" className="small-note">
                {notice}
              </p>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
