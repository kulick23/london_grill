import { useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useWords } from '../ExperienceProvider';
import { PageHeading } from '../components/Shell';
import room from '../images/room.webp';
import bar from '../images/bar.webp';
import bottles from '../images/bottles.webp';
import burger from '../images/burger.webp';
import night from '../images/night.webp';
import exterior from '../images/exterior.webp';
const photos = [
  { id: 'room', category: 'space', image: room, ru: 'Свет и пространство', en: 'Light & space' },
  { id: 'bar', category: 'bar', image: bar, ru: 'Красная стойка', en: 'The red bar' },
  { id: 'burger', category: 'kitchen', image: burger, ru: 'К столу', en: 'For the table' },
  { id: 'bottles', category: 'bar', image: bottles, ru: 'За барной стойкой', en: 'Behind the bar' },
  { id: 'night', category: 'bar', image: night, ru: 'После заката', en: 'After dark' },
  { id: 'exterior', category: 'space', image: exterior, ru: 'С порога', en: 'At the door' },
];
export function Gallery() {
  const w = useWords();
  const [params, setParams] = useSearchParams();
  const ref = useRef(null);
  const category = params.get('category') || 'all';
  const index = photos.findIndex((p) => p.id === params.get('photo'));
  const current = photos[index];
  const filtered = photos.filter((p) => category === 'all' || p.category === category);
  const set = (key, value) => {
    const next = new URLSearchParams(window.location.search);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  };
  const go = (delta) => {
    const currentIndex = photos.findIndex(
      (p) => p.id === new URLSearchParams(window.location.search).get('photo'),
    );
    set('photo', photos[(currentIndex + delta + photos.length) % photos.length].id);
  };
  useEffect(() => {
    if (current && !ref.current.open) ref.current.showModal();
    else if (!current && ref.current.open) ref.current.close();
  }, [current]);
  return (
    <>
      <PageHeading
        title={w('Внутри London Grill.', 'Inside London Grill.')}
        description={w(
          'Красная стойка, дневной свет и вечерний неон. Посмотрите вокруг.',
          'A red bar, daylight and evening neon. Take a look around.',
        )}
      >
        <Link className="restaurant-text-link" to="/reserve">
          {w('Выбрать своё место', 'Find your spot')} ↗
        </Link>
      </PageHeading>
      <div
        className="gallery-filters"
        role="group"
        aria-label={w('Фильтр фотографий', 'Photo filter')}
      >
        {[
          ['all', 'Все фото', 'All photos'],
          ['space', 'Пространство', 'Space'],
          ['bar', 'Бар', 'Bar'],
          ['kitchen', 'Кухня', 'Kitchen'],
        ].map(([id, ru, en]) => (
          <button
            key={id}
            className="filter-button"
            aria-pressed={category === id}
            onClick={() => set('category', id)}
          >
            {w(ru, en)}
          </button>
        ))}
      </div>
      <div className="editorial-gallery">
        {filtered.map((p, i) => (
          <figure key={p.id} className={i % 3 === 0 ? 'gallery-wide' : ''}>
            <button
              onClick={() => set('photo', p.id)}
              aria-label={w(`Открыть фото: ${p.ru}`, `Open photo: ${p.en}`)}
            >
              <img src={p.image} width="1600" height="1100" alt={w(p.ru, p.en)} loading="lazy" />
            </button>
            <figcaption>{w(p.ru, p.en)}</figcaption>
          </figure>
        ))}
      </div>
      <dialog
        ref={ref}
        className="gallery-dialog"
        aria-label={w('Просмотр фотографии', 'Photo viewer')}
        onCancel={(e) => {
          e.preventDefault();
          set('photo', '');
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') go(-1);
          if (e.key === 'ArrowRight') go(1);
        }}
      >
        <button
          className="dialog-close"
          aria-label={w('Закрыть фото', 'Close photo')}
          onClick={() => set('photo', '')}
        >
          ×
        </button>
        {current && (
          <>
            <img src={current.image} alt={w(current.ru, current.en)} width="1600" height="1100" />
            <div className="gallery-dialog-footer">
              <button onClick={() => go(-1)} aria-label={w('Предыдущее фото', 'Previous photo')}>
                ←
              </button>
              <p aria-live="polite">
                {w(current.ru, current.en)} · {index + 1}/{photos.length}
              </p>
              <button onClick={() => go(1)} aria-label={w('Следующее фото', 'Next photo')}>
                →
              </button>
            </div>
          </>
        )}
      </dialog>
    </>
  );
}
export function Stories() {
  const w = useWords();
  return (
    <>
      <PageHeading
        title={w('Вечера и истории.', 'Evenings & stories.')}
        description={w(
          'London Grill в деталях: от входной двери до последнего разговора у бара.',
          'London Grill in detail: from the front door to the last conversation at the bar.',
        )}
      >
        <Link className="restaurant-text-link" to="/gallery">
          {w('Вся галерея', 'Full gallery')} ↗
        </Link>
      </PageHeading>
      <nav className="story-index" aria-label={w('Истории', 'Stories')}>
        <a href="#space-story">{w('Пространство', 'The space')} ↓</a>
        <a href="#kitchen-story">{w('Кухня', 'The kitchen')} ↓</a>
        <a href="#evening-story">{w('Бар и вечера', 'The bar')} ↓</a>
      </nav>
      <article className="story-feature" id="space-story">
        <img
          src={room}
          width="1600"
          height="1067"
          alt={w('Дневной свет в зале London Grill', 'Daylight in the London Grill dining room')}
          fetchPriority="high"
        />
        <div>
          <h2>{w('Устроиться поудобнее.', 'Settle in.')}</h2>
          <p>
            {w(
              'Свет из больших окон ложится на длинные диваны. В глубине зала — красная стойка, вокруг — столики для двух и больших компаний. У этого пространства есть своё настроение в любое время дня.',
              'Light from tall windows falls across long sofas. A red bar anchors the room, with tables for two and for larger groups. This space has a mood of its own at any hour.',
            )}
          </p>
          <Link to="/gallery?category=space" className="restaurant-text-link">
            {w('Рассмотреть интерьер', 'Explore the room')} ↗
          </Link>
        </div>
      </article>
      <article className="story-split" id="kitchen-story">
        <div>
          <h2>{w('С доски — на стол.', 'From board to table.')}</h2>
          <p>
            {w(
              'Бургер на деревянной доске — один из узнаваемых образов кухни London Grill. В меню проекта есть горячее, закуски, салаты и блюда для детей. Выберите своё сочетание и сохраните его к демо-визиту.',
              'A burger on a wooden board is one of the familiar images of London Grill. The project menu includes hot plates, snacks, salads and children’s dishes. Put together your selection and save it to a demo visit.',
            )}
          </p>
          <Link to="/selection" className="restaurant-text-link">
            {w('Сезонный стол', 'Seasonal table')} ↗
          </Link>
        </div>
        <img
          src={burger}
          width="1260"
          height="884"
          alt={w('Бургер на доске', 'Burger on a board')}
          loading="lazy"
        />
      </article>
      <article className="story-feature story-night" id="evening-story">
        <img
          src={night}
          width="885"
          height="590"
          alt={w('Красный неон в баре', 'Red neon in the bar')}
          loading="lazy"
        />
        <div>
          <h2>{w('Когда загорается неон.', 'When the neon comes on.')}</h2>
          <p>
            {w(
              'Дневной зал меняет настроение. Красный свет, бутылки на полках и место у стойки — для вечера, который не хочется торопить. Актуальная программа событий ещё не предоставлена: анонсы появятся после подтверждения рестораном.',
              'The room takes on a different mood. Red light, bottles on the shelves and a seat at the counter, for an evening that need not be rushed. The current events programme has not been provided; announcements will appear once confirmed by the restaurant.',
            )}
          </p>
          <Link to="/reserve" className="restaurant-text-link">
            {w('Спланировать вечер', 'Plan an evening')} ↗
          </Link>
        </div>
      </article>
    </>
  );
}
