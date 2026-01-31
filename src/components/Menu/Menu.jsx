import React from 'react';
import { observer } from 'mobx-react-lite';
import s from './Menu.module.css';
import MenuElement from './Menu_elements/Menu_element';
import coctailStore from '../../store/CoctailStore';
import heroImage from '../../assets/Party/Friday.jpg';

const Menu = observer(() => {
  const coctails = coctailStore.coctails;

  const renderMenuItems = (categoryId) => {
    return coctails
      .filter(coctail => coctail.categoryId === categoryId)
      .map(coctail => (
        <MenuElement
          key={coctail.id}
          img={coctail.image}
          id={coctail.id}
          ml={coctail.volume}
          name={coctail.productName}
          count={coctail.price}
        />
      ));
  };

  return (
    <div className={s.page}>
      <section className={s.hero}>
        <img className={s.heroImage} src={heroImage} alt="Restaurant interior" />
        <div className={s.heroOverlay}></div>
        <div className={s.heroContent}>
          <p className={s.heroEyebrow}>Lunch & Dinner</p>
          <h1 className={s.heroTitle}>Seasonal kitchen with a modern bar program</h1>
          <p className={s.heroSubtitle}>Handcrafted cocktails, signature infusions, and a curated spirits collection.</p>
          <div className={s.heroMeta}>
            <span>12:00 — 01:00</span>
            <span>Open daily</span>
            <span>Downtown London</span>
          </div>
        </div>
      </section>

      <section className={s.section}>
        <div className={s.sectionHeader}>
          <h2>Coctails</h2>
          <p>Signature mixes built around fresh ingredients and house-made syrups.</p>
        </div>
        <div className={s.menu}>{renderMenuItems(1)}</div>
      </section>

      <section className={s.section}>
        <div className={s.sectionHeader}>
          <h2>Tincture</h2>
          <p>Infusions with aromatic herbs and a dry, clean finish.</p>
        </div>
        <div className={s.menu}>{renderMenuItems(2)}</div>
      </section>

      <section className={s.section}>
        <div className={s.sectionHeader}>
          <h2>Vine</h2>
          <p>Elegant selections with crisp acidity and floral notes.</p>
        </div>
        <div className={s.menu}>{renderMenuItems(3)}</div>
      </section>

      <section className={s.section}>
        <div className={s.sectionHeader}>
          <h2>Vodka</h2>
          <p>Classic clarity with a smooth and subtle mineral profile.</p>
        </div>
        <div className={s.menu}>{renderMenuItems(4)}</div>
      </section>

      <section className={s.section}>
        <div className={s.sectionHeader}>
          <h2>Whiskey</h2>
          <p>Smoky, woody and full-bodied pours from around the world.</p>
        </div>
        <div className={s.menu}>{renderMenuItems(5)}</div>
      </section>

      <section className={s.section}>
        <div className={s.sectionHeader}>
          <h2>Cognac</h2>
          <p>Velvety brandy with notes of dried fruit and spice.</p>
        </div>
        <div className={s.menu}>{renderMenuItems(6)}</div>
      </section>

      <section className={s.section}>
        <div className={s.sectionHeader}>
          <h2>Beer</h2>
          <p>Fresh pours ranging from crisp lagers to dark classics.</p>
        </div>
        <div className={s.menu}>{renderMenuItems(7)}</div>
      </section>
    </div>
  );
});

export default Menu;
