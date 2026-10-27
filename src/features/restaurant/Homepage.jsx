import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RestaurantHeader } from './components/Shell';
import { useI18n } from '../../i18n/I18nProvider';
import bar from './images/bar.webp';
import exterior from './images/exterior.webp';
import room from './images/room.webp';
import night from './images/night.webp';
import bottles from './images/bottles.webp';
import burger from './images/burger.webp';
import './restaurant.css';

const copy = {
  ru: {
    menu: 'Меню',
    place: 'Пространство',
    evening: 'Ваш вечер',
    book: 'Забронировать стол',
    intro: 'Вечер с характером.',
    subtitle: 'Бургеры, коктейли и красный бар с лондонским характером.',
    scroll: 'Знакомство с London Grill',
    concept: 'Место встречи',
    conceptTitle: 'У каждого вечера свой вкус.',
    conceptText:
      'За большим столом с друзьями. У барной стойки за разговором. Или вдвоём, когда никуда не нужно спешить. London Grill начинается с простого: выбрать своё место и устроиться поудобнее.',
    foodTitle: 'Сначала — к столу.',
    foodText:
      'Бургеры, горячие блюда и закуски для всей компании. А затем — что-нибудь из барной карты.',
    foodLink: 'Смотреть меню',
    burger: 'Бургеры',
    bar: 'Барная карта',
    barText: 'От знакомой классики до коктейля под настроение.',
    galleryTitle: 'Найдите свой угол.',
    galleryText:
      'Дневной свет, длинные диваны, красная стойка. Одно пространство — разное настроение.',
    day: 'Днём',
    night: 'После заката',
    roomAlt: 'Зал с длинными диванами, большими окнами и красной барной стойкой',
    nightAlt: 'Красный неон над барной стойкой вечером',
    bookingTitle: 'Какой у вас вечер?',
    bookingText: 'Начните с даты и компании, затем выберите конкретный столик на плане зала.',
    demo: 'Демонстрационный план визита. Заявка не отправляется в ресторан.',
    date: 'Дата',
    time: 'Время',
    guests: 'Гостей',
    plan: 'Выбрать столик на плане',
    planned: 'Ваш план визита',
    duration: 'Продолжительность — 2 часа. Это не подтверждённая бронь.',
    edit: 'Изменить план',
    contact: 'До встречи за столом.',
    details: 'Адрес, телефон и часы работы ожидают подтверждения владельца.',
    footer: 'Портфолио-проект · фотографии из исходного проекта',
    top: 'Наверх',
    skip: 'Перейти к содержанию',
  },
  en: {
    menu: 'Menu',
    place: 'The space',
    evening: 'Your evening',
    book: 'Book a table',
    intro: 'An evening with character.',
    subtitle: 'Burgers, cocktails and a red bar with a London spirit.',
    scroll: 'Discover London Grill',
    concept: 'A meeting place',
    conceptTitle: 'An evening of your own.',
    conceptText:
      'Around a table with friends. At the bar, deep in conversation. Or just the two of you, with nowhere else to be. London Grill starts with something simple: finding your spot and settling in.',
    foodTitle: 'First, take a seat.',
    foodText: 'Burgers, hot plates and snacks for the whole table. Then something from the bar.',
    foodLink: 'Explore the menu',
    burger: 'Burgers',
    bar: 'From the bar',
    barText: 'Familiar classics and a cocktail to match your mood.',
    galleryTitle: 'Find your corner.',
    galleryText: 'Daylight, long sofas, a red bar. One space, a different mood.',
    day: 'By day',
    night: 'After dark',
    roomAlt: 'Dining room with long sofas, large windows and a red bar',
    nightAlt: 'Red neon above the bar after dark',
    bookingTitle: 'Make an evening of it.',
    bookingText:
      'Start with a date and your party, then choose a specific table on the floor plan.',
    demo: 'Demo visit planner. No request is sent to the restaurant.',
    date: 'Date',
    time: 'Time',
    guests: 'Guests',
    plan: 'Choose a table on the plan',
    planned: 'Your visit plan',
    duration: 'Duration: 2 hours. This is not a confirmed reservation.',
    edit: 'Edit your plan',
    contact: 'See you at the table.',
    details: 'Address, phone and opening hours await confirmation from the owner.',
    footer: 'Portfolio project · photography from the original project',
    top: 'Back to top',
    skip: 'Skip to content',
  },
};

function todayInMinsk() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Minsk',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export default function Homepage() {
  const { language } = useI18n();
  const navigate = useNavigate();
  const c = copy[language] || copy.ru;
  const [view, setView] = useState('day');
  const [date, setDate] = useState(todayInMinsk);
  const [time, setTime] = useState('19:00');
  const [guests, setGuests] = useState('2');
  const page = useRef(null);

  useEffect(() => {
    document.documentElement.lang = language === 'en' ? 'en' : 'ru';
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-seen');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    const elements = page.current.querySelectorAll('[data-reveal]');
    elements.forEach((element) => {
      element.classList.add('will-reveal');
      observer.observe(element);
    });
    return () => observer.disconnect();
  }, [language]);

  return (
    <div className="restaurant-home" ref={page} id="top">
      <a className="restaurant-skip" href="#restaurant-main">
        {c.skip}
      </a>
      <RestaurantHeader />
      <main id="restaurant-main">
        <section className="restaurant-hero" aria-labelledby="restaurant-title">
          <h1 id="restaurant-title" translate="no">
            London Grill
          </h1>
          <div className="restaurant-hero-image">
            <img
              src={bar}
              width="1600"
              height="1067"
              alt={
                language === 'en'
                  ? 'The red London Grill bar with a telephone box display'
                  : 'Красная барная стойка London Grill с витриной в форме телефонной будки'
              }
              fetchPriority="high"
            />
          </div>
          <div className="restaurant-hero-copy">
            <p className="restaurant-intro">{c.intro}</p>
            <p>{c.subtitle}</p>
            <Link className="restaurant-button" to="/reserve">
              {c.book}
              <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <a className="restaurant-scroll" href="#story">
            {c.scroll}
            <span aria-hidden="true">↓</span>
          </a>
        </section>
        <section
          className="restaurant-story restaurant-section"
          id="story"
          aria-labelledby="story-heading"
        >
          <figure data-reveal>
            <img
              src={exterior}
              width="768"
              height="512"
              alt={
                language === 'en'
                  ? 'London Grill entrance in the stone building'
                  : 'Вход в London Grill в каменном здании'
              }
              loading="lazy"
            />
          </figure>
          <div>
            <h2 id="story-heading" data-reveal>
              {c.conceptTitle}
            </h2>
            <p className="restaurant-story-text" data-reveal>
              {c.conceptText}
            </p>
          </div>
        </section>
        <section className="restaurant-food restaurant-section" aria-labelledby="food-heading">
          <div className="restaurant-food-heading" data-reveal>
            <h2 id="food-heading">{c.foodTitle}</h2>
            <p>{c.foodText}</p>
            <Link className="restaurant-text-link" to="/menu">
              {c.foodLink}
              <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <figure className="restaurant-burger" data-reveal>
            <img
              src={burger}
              width="885"
              height="590"
              alt={
                language === 'en' ? 'Burger served on a wooden board' : 'Бургер на деревянной доске'
              }
              loading="lazy"
            />
            <figcaption>{c.burger}</figcaption>
          </figure>
          <figure className="restaurant-bar" data-reveal>
            <img
              src={bottles}
              width="885"
              height="590"
              alt={
                language === 'en'
                  ? 'Bottles displayed behind the bar'
                  : 'Коллекция напитков за барной стойкой'
              }
              loading="lazy"
            />
            <figcaption>
              <span>{c.bar}</span>
              <span>{c.barText}</span>
            </figcaption>
          </figure>
        </section>
        <section
          className="restaurant-space restaurant-section"
          id="space"
          aria-labelledby="space-heading"
        >
          <div className="restaurant-space-heading">
            <h2 id="space-heading" data-reveal>
              {c.galleryTitle}
            </h2>
            <p data-reveal>{c.galleryText}</p>
          </div>
          <div className="restaurant-gallery-controls" role="group" aria-label={c.place}>
            <button onClick={() => setView('day')} aria-pressed={view === 'day'}>
              {c.day}
            </button>
            <button onClick={() => setView('night')} aria-pressed={view === 'night'}>
              {c.night}
            </button>
          </div>
          <figure className="restaurant-gallery" data-reveal>
            <img
              key={view}
              src={view === 'day' ? room : night}
              width="1600"
              height="1067"
              alt={view === 'day' ? c.roomAlt : c.nightAlt}
              loading="lazy"
            />
            <figcaption aria-live="polite">
              London Grill · {view === 'day' ? c.day : c.night}
            </figcaption>
          </figure>
        </section>
        <section
          className="restaurant-visit restaurant-section"
          id="visit"
          aria-labelledby="visit-heading"
        >
          <div data-reveal>
            <h2 id="visit-heading">{c.bookingTitle}</h2>
            <p>{c.bookingText}</p>
            <p className="restaurant-demo">{c.demo}</p>
          </div>
          <div className="restaurant-planner" data-ui data-reveal>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                navigate(`/reserve?date=${date}&time=${time}&guests=${guests}`);
              }}
            >
              <label>
                {c.date}
                <input
                  type="date"
                  name="date"
                  required
                  min={todayInMinsk()}
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                />
              </label>
              <div className="restaurant-form-row">
                <label>
                  {c.time}
                  <select
                    name="time"
                    value={time}
                    onChange={(event) => setTime(event.target.value)}
                  >
                    {[
                      '12:00',
                      '13:00',
                      '14:00',
                      '15:00',
                      '16:00',
                      '17:00',
                      '18:00',
                      '19:00',
                      '20:00',
                      '21:00',
                    ].map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                </label>
                <label>
                  {c.guests}
                  <select
                    name="guests"
                    value={guests}
                    onChange={(event) => setGuests(event.target.value)}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                </label>
              </div>
              <button type="submit" className="restaurant-button">
                {c.plan}
                <span aria-hidden="true">↗</span>
              </button>
            </form>
          </div>
        </section>
      </main>
      <footer className="restaurant-footer">
        <div className="restaurant-footer-top">
          <div>
            <h2>{c.contact}</h2>
            <p>{c.details}</p>
          </div>
          <a href="#top" className="restaurant-text-link">
            {c.top}
            <span aria-hidden="true">↑</span>
          </a>
        </div>
        <p className="restaurant-footer-name" translate="no">
          London Grill
        </p>
        <div className="home-footer-links">
          <Link to="/gallery">{language === 'en' ? 'Gallery' : 'Галерея'}</Link>
          <Link to="/stories">{language === 'en' ? 'Stories' : 'Истории'}</Link>
          <Link to="/selection">{language === 'en' ? 'Seasonal table' : 'Сезонный стол'}</Link>
        </div>
        <p className="restaurant-credit">{c.footer}</p>
      </footer>
    </div>
  );
}
