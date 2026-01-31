import React, { useMemo, useState } from 'react';
import './Slider.css';
import { observer } from 'mobx-react-lite';
import sliderStore from '../../store/SliderStore';

const formatDate = (value) => {
  const date = new Date(value);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const getStatus = (startDate, endDate) => {
  const today = new Date();
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date(startDate);
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  const currentDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  if (currentDay >= startDay && currentDay <= endDay) return 'current';
  if (currentDay < startDay) return 'upcoming';
  return 'past';
};

const Slider = observer(() => {
  const events = sliderStore.events;
  const promos = sliderStore.promos;
  const [promoIndex, setPromoIndex] = useState(0);

  const grouped = useMemo(() => {
    return events.reduce(
      (acc, event) => {
        const status = getStatus(event.startDate, event.endDate);
        acc[status].push(event);
        return acc;
      },
      { current: [], upcoming: [], past: [] }
    );
  }, [events]);

  const currentPromos = promos;
  const activePromo = currentPromos[promoIndex] || null;

  const nextPromo = () => {
    if (!currentPromos.length) return;
    setPromoIndex((prev) => (prev + 1) % currentPromos.length);
  };

  const prevPromo = () => {
    if (!currentPromos.length) return;
    setPromoIndex((prev) => (prev - 1 + currentPromos.length) % currentPromos.length);
  };

  const todayIndex = new Date().getDay();
  const isActiveToday = activePromo?.days?.includes(todayIndex);

  return (
    <div className="events-page">
      <section className="events-hero">
        <div className="events-hero__content">
          <p className="events-hero__eyebrow">Events & Promotions</p>
          <h1>Live nights, seasonal offers, and curated experiences.</h1>
          <p>
            We host weekly tastings, live sets, and limited menus. Book a table
            or join the next event and enjoy the new season lineup.
          </p>
        </div>
      </section>

      <section className="events-section">
        <div className="events-section__header">
          <h2>Current promotions</h2>
          <p>Happening this week — available tonight.</p>
        </div>
        {activePromo ? (
          <div className="promo-slider">
            <button className="promo-arrow promo-arrow--left" onClick={prevPromo} aria-label="Previous promotion">
              ‹
            </button>
            <article className="promo-card">
              <div className="promo-card__media">
                <img src={activePromo.img} alt={activePromo.title} loading="lazy" decoding="async" />
                <div className="promo-card__overlay">
                  <div className="promo-card__title">{activePromo.title}</div>
                  <div className="promo-card__subtitle">{activePromo.subtitle}</div>
                </div>
              </div>
              <div className="promo-card__content">
                {isActiveToday ? <span className="event-card__tag">Now</span> : null}
                <h3>{activePromo.title}</h3>
                <p>{activePromo.subtitle}</p>
              </div>
            </article>
            <button className="promo-arrow promo-arrow--right" onClick={nextPromo} aria-label="Next promotion">
              ›
            </button>
            <div className="promo-dots">
              {currentPromos.map((promo, index) => (
                <button
                  key={promo.id}
                  className={index === promoIndex ? 'promo-dot promo-dot--active' : 'promo-dot'}
                  onClick={() => setPromoIndex(index)}
                  aria-label={`Go to promotion ${index + 1}`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="events-empty">No current promos today.</div>
        )}
      </section>

      <section className="events-section">
        <div className="events-section__header">
          <h2>Upcoming events</h2>
          <p>Reserve your spot for the next evenings.</p>
        </div>
        <div className="events-grid">
          {grouped.upcoming.map((event) => (
            <article key={event.id} className="event-card">
              <img src={event.img} alt={event.name} loading="lazy" decoding="async" />
              <div className="event-card__content">
                <span className="event-card__tag event-card__tag--upcoming">Upcoming</span>
                <h3>{event.name}</h3>
                <p>{event.des}</p>
                <div className="event-card__date">
                  {formatDate(event.startDate)}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="events-section">
        <div className="events-section__header">
          <h2>Past highlights</h2>
          <p>Some of the evenings our guests loved.</p>
        </div>
        <div className="events-grid">
          {grouped.past.map((event) => (
            <article key={event.id} className="event-card event-card--past">
              <img src={event.img} alt={event.name} loading="lazy" decoding="async" />
              <div className="event-card__content">
                <span className="event-card__tag event-card__tag--past">Past</span>
                <h3>{event.name}</h3>
                <p>{event.des}</p>
                <div className="event-card__date">
                  {formatDate(event.startDate)}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
});

export default Slider;
