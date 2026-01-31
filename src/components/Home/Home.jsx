import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Home.module.css';
import heroImage from '../../assets/img/london.png';
import plateImage from '../../assets/drinks/coctails/Mojito.png';

const Home = () => {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>Lunch & Grill</p>
          <h1 className={styles.title}>
            Beautiful food & cocktails,
            <span>delivered to your table.</span>
          </h1>
          <p className={styles.subtitle}>
            A modern restaurant with seasonal dishes, house infusions, and a signature bar program.
            Warm atmosphere, late dinners, and curated music every night.
          </p>
          <div className={styles.actions}>
            <Link to="/menu" className={styles.primaryButton}>Explore menu</Link>
            <Link to="/orders" className={styles.ghostButton}>Place an order</Link>
          </div>
          <div className={styles.trustRow}>
            <div className={styles.trustBadge}>★</div>
            <div>
              <div className={styles.trustTitle}>Guest reviews</div>
              <div className={styles.trustSub}>4.9 out of 5 based on 1,200+ visits</div>
            </div>
          </div>
        </div>

        <div className={styles.heroMedia}>
          <div className={styles.photoFrame}>
            <img src={heroImage} alt="Restaurant table" />
          </div>
       
          <div className={styles.glow}></div>
          <div className={styles.dots}></div>
        </div>
      </section>

      <section className={styles.highlights}>
        <div>
          <h3>Seasonal menu</h3>
          <p>Local produce, curated pairings, and chef specials every week.</p>
        </div>
        <div>
          <h3>Private dining</h3>
          <p>Intimate tables, private events, and custom tasting sets.</p>
        </div>
        <div>
          <h3>Live evenings</h3>
          <p>DJ sets, vinyl nights, and cozy ambiance after 20:00.</p>
        </div>
      </section>
    </div>
  );
};

export default Home;
