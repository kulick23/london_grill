import React, { useMemo } from 'react';
import './Slider.css';
import { observer } from 'mobx-react-lite';
import sliderStore from '../../store/SliderStore';
import { useI18n } from '../../i18n/I18nProvider';
import { formatDate, getStatus } from '../../utils/date';
import { usePromoSlider } from '../../hooks/usePromoSlider';

const Slider = observer(() => {
  const events = sliderStore.events;
  const promos = sliderStore.promos;
  const { t, language } = useI18n();
  const locale = language === 'ru' ? 'ru-RU' : 'en-US';
  const { index: promoIndex, prevIndex: prevPromoIndex, isFading, goTo, next, prev } = usePromoSlider(promos);

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

  const todayIndex = new Date().getDay();
  const isActiveToday = activePromo?.days?.includes(todayIndex);

  return (
    <div className="events-page">
      <section className="events-hero">
        <div className="events-hero__content">
          <p className="events-hero__eyebrow">{t('events.heroEyebrow')}</p>
          <h1>{t('events.heroTitle')}</h1>
          <p>{t('events.heroSubtitle')}</p>
        </div>
      </section>

      <section className="events-section">
        <div className="events-section__header">
          <h2>{t('events.currentTitle')}</h2>
          <p>{t('events.currentSub')}</p>
        </div>
        {activePromo ? (
          <div className="promo-slider">
            <button className="promo-arrow promo-arrow--left" onClick={prev} aria-label="Previous promotion">
              ‹
            </button>
            <article className="promo-card">
              <div className="promo-card__media">
                {prevPromoIndex !== null ? (
                  <img
                    className="promo-image promo-image--prev"
                    src={currentPromos[prevPromoIndex].img}
                    alt={t(currentPromos[prevPromoIndex].titleKey)}
                    loading="lazy"
                    decoding="async"
                    style={{ opacity: isFading ? 1 : 0 }}
                  />
                ) : null}
                <img
                  className="promo-image promo-image--current"
                  src={activePromo.img}
                  alt={t(activePromo.titleKey)}
                  loading="lazy"
                  decoding="async"
                />
                <div className="promo-card__overlay">
                  <div className="promo-card__title">{t(activePromo.titleKey)}</div>
                  <div className="promo-card__subtitle">{t(activePromo.subtitleKey)}</div>
                </div>
              </div>
              <div className="promo-card__content">
                {isActiveToday ? <span className="event-card__tag">{t('events.nowTag')}</span> : null}
                <h3>{t(activePromo.titleKey)}</h3>
                <p>{t(activePromo.subtitleKey)}</p>
              </div>
            </article>
            <button className="promo-arrow promo-arrow--right" onClick={next} aria-label="Next promotion">
              ›
            </button>
            <div className="promo-dots">
              {currentPromos.map((promo, index) => (
                <button
                  key={promo.id}
                  className={index === promoIndex ? 'promo-dot promo-dot--active' : 'promo-dot'}
                  onClick={() => goTo(index)}
                  aria-label={`Go to promotion ${index + 1}`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="events-empty">{t('events.noCurrent')}</div>
        )}
      </section>

      <section className="events-section">
        <div className="events-section__header">
          <h2>{t('events.upcomingTitle')}</h2>
          <p>{t('events.upcomingSub')}</p>
        </div>
        <div className="events-grid">
          {grouped.upcoming.map((event) => (
            <article key={event.id} className="event-card">
              <img src={event.img} alt={t(event.nameKey)} loading="lazy" decoding="async" />
              <div className="event-card__content">
                <span className="event-card__tag event-card__tag--upcoming">{t('events.upcomingTag')}</span>
                <h3>{t(event.nameKey)}</h3>
                <p>{t(event.descKey)}</p>
                <div className="event-card__date">
                  {formatDate(event.startDate, locale)}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="events-section">
        <div className="events-section__header">
          <h2>{t('events.pastTitle')}</h2>
          <p>{t('events.pastSub')}</p>
        </div>
        <div className="events-grid">
          {grouped.past.map((event) => (
            <article key={event.id} className="event-card event-card--past">
              <img src={event.img} alt={t(event.nameKey)} loading="lazy" decoding="async" />
              <div className="event-card__content">
                <span className="event-card__tag event-card__tag--past">{t('events.pastTag')}</span>
                <h3>{t(event.nameKey)}</h3>
                <p>{t(event.descKey)}</p>
                <div className="event-card__date">
                  {formatDate(event.startDate, locale)}
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
