import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Home.module.css';
import heroImage from '../../assets/img/london.png';
import plateImage from '../../assets/drinks/coctails/Mojito.png';
import { useI18n } from '../../i18n/I18nProvider';

const Home = () => {
  const { t } = useI18n();
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>{t('home.eyebrow')}</p>
          <h1 className={styles.title}>
            {t('home.titleLine1')}
            <span>{t('home.titleLine2')}</span>
          </h1>
          <p className={styles.subtitle}>{t('home.subtitle')}</p>
          <div className={styles.actions}>
            <Link to="/menu" className={styles.primaryButton}>{t('home.exploreMenu')}</Link>
            <Link to="/orders" className={styles.ghostButton}>{t('home.placeOrder')}</Link>
          </div>
          <div className={styles.trustRow}>
            <div className={styles.trustBadge}>★</div>
            <div>
              <div className={styles.trustTitle}>{t('home.reviewsTitle')}</div>
              <div className={styles.trustSub}>{t('home.reviewsSub')}</div>
            </div>
          </div>
        </div>

        <div className={styles.heroMedia}>
          <div className={styles.photoFrame}>
            <img src={heroImage} alt="Restaurant table" loading="lazy" decoding="async" />
          </div>
       
          <div className={styles.glow}></div>
          <div className={styles.dots}></div>
        </div>
      </section>

      <section className={styles.highlights}>
        <div>
          <h3>{t('home.highlights.seasonalTitle')}</h3>
          <p>{t('home.highlights.seasonalText')}</p>
        </div>
        <div>
          <h3>{t('home.highlights.privateTitle')}</h3>
          <p>{t('home.highlights.privateText')}</p>
        </div>
        <div>
          <h3>{t('home.highlights.liveTitle')}</h3>
          <p>{t('home.highlights.liveText')}</p>
        </div>
      </section>
    </div>
  );
};

export default Home;
