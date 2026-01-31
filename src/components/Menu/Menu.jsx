import React, { useMemo, useState } from 'react';
import s from './Menu.module.css';
import MenuElement from './Menu_elements/Menu_element';
import heroImage from '../../assets/img/hall.jpg';

const drinkAssets = import.meta.glob('../../assets/drinks/**/*.{png,jpg,jpeg}', {
  eager: true,
  import: 'default',
});

const foodAssets = import.meta.glob('../../assets/menu/**/*.{png,jpg,jpeg}', {
  eager: true,
  import: 'default',
});

const groupByFolder = (assets, rootKey) => {
  const entries = Object.entries(assets).sort(([a], [b]) => a.localeCompare(b));
  return entries.reduce((acc, [path, src]) => {
    const parts = path.split('/');
    const idx = parts.indexOf(rootKey);
    const group = idx !== -1 ? parts[idx + 1] : 'other';
    if (!acc[group]) acc[group] = [];
    acc[group].push(src);
    return acc;
  }, {});
};

const buildItems = (sources, namePrefix, basePrice, volume) => {
  return sources.map((img, index) => ({
    id: `${namePrefix}-${index + 1}`,
    name: `${namePrefix} ${index + 1}`,
    image: img,
    price: basePrice,
    volume,
  }));
};

const Menu = () => {
  const categories = useMemo(() => {
    const drinkGroups = groupByFolder(drinkAssets, 'drinks');
    const foodGroups = groupByFolder(foodAssets, 'menu');

    const drinks = [
      { title: 'Cocktails', items: buildItems(drinkGroups.coctails || [], 'Cocktail', 12, 180) },
      { title: 'Tincture', items: buildItems(drinkGroups.tincture || [], 'Tincture', 6, 50) },
      { title: 'Vine', items: buildItems(drinkGroups.vine || [], 'Vine', 20, 255) },
      { title: 'Vodka', items: buildItems(drinkGroups.vodka || [], 'Vodka', 10, 50) },
      { title: 'Whiskey', items: buildItems(drinkGroups.whiskey || [], 'Whiskey', 18, 100) },
      { title: 'Cognac', items: buildItems(drinkGroups.cognac || [], 'Cognac', 26, 100) },
      { title: 'Bear', items: buildItems(drinkGroups.bear || [], 'Bear', 6, 500) },
      { title: 'Ciders', items: buildItems(drinkGroups.cidres || [], 'Cider', 7, 500) },
    ];

    const food = [
      { title: 'Burgers', items: buildItems(foodGroups.burgers || [], 'Burger', 12, null) },
      { title: 'Burger Sets', items: buildItems(foodGroups['burger-sets'] || [], 'Burger set', 16, null) },
      { title: 'Naked Burger', items: buildItems(foodGroups['naked-burger'] || [], 'Naked burger', 11, null) },
      { title: 'Naked Burger Sets', items: buildItems(foodGroups['naked-burger-sets'] || [], 'Naked set', 15, null) },
      { title: 'Meals', items: buildItems(foodGroups.meals || [], 'Meal', 14, null) },
      { title: 'Salads', items: buildItems(foodGroups.salads || [], 'Salad', 10, null) },
      { title: 'Snacks', items: buildItems(foodGroups.snacks || [], 'Snack', 8, null) },
      { title: 'Soups', items: buildItems(foodGroups.soups || [], 'Soup', 9, null) },
      { title: 'Deserts', items: buildItems(foodGroups.deserts || [], 'Desert', 7, null) },
      { title: 'Kids', items: buildItems(foodGroups.kids || [], 'Kids menu', 8, null) },
    ];

    return { drinks, food };
  }, []);

  const [activeGroup, setActiveGroup] = useState('drinks');
  const [activeDrinkCategory, setActiveDrinkCategory] = useState(0);
  const [activeFoodCategory, setActiveFoodCategory] = useState(0);

  const activeCategories = activeGroup === 'drinks' ? categories.drinks : categories.food;
  const activeIndex = activeGroup === 'drinks' ? activeDrinkCategory : activeFoodCategory;
  const activeCategory = activeCategories[activeIndex] || null;

  return (
    <div className={s.page}>
      <section className={s.hero}>
        <img className={s.heroImage} src={heroImage} alt="Restaurant interior" loading="lazy" decoding="async" />
        <div className={s.heroOverlay}></div>
        <div className={s.heroContent}>
          <p className={s.heroEyebrow}>Lunch & Dinner</p>
          <h1 className={s.heroTitle}>Seasonal kitchen with a modern bar program</h1>
          <p className={s.heroSubtitle}>Handcrafted cocktails, signature infusions, and a curated spirits collection.</p>
          <div className={s.heroMeta}>
            <span>12:00 — 01:00</span>
            <span>Open daily</span>
            <span>Minsk/Vilnius</span>
          </div>
        </div>
      </section>

      <section className={s.tabsSection}>
        <div className={s.groupTabs}>
          <button
            className={activeGroup === 'drinks' ? s.groupTabActive : s.groupTab}
            onClick={() => setActiveGroup('drinks')}
          >
            Drinks
          </button>
          <button
            className={activeGroup === 'food' ? s.groupTabActive : s.groupTab}
            onClick={() => setActiveGroup('food')}
          >
            Food
          </button>
        </div>

        <div className={s.categoryTabs}>
          {activeCategories.map((category, index) => (
            <button
              key={category.title}
              className={index === activeIndex ? s.categoryTabActive : s.categoryTab}
              onClick={() => {
                if (activeGroup === 'drinks') setActiveDrinkCategory(index);
                if (activeGroup === 'food') setActiveFoodCategory(index);
              }}
            >
              {category.title}
            </button>
          ))}
        </div>
      </section>

      {activeCategory ? (
        <section className={s.section}>
          <div className={s.sectionHeader}>
            <h3>{activeCategory.title}</h3>
          </div>
          <div className={s.menu}>
            {activeCategory.items.map((item, index) => (
              <MenuElement
                key={`${activeCategory.title}-${index}`}
                img={item.image}
                id={index}
                ml={item.volume}
                name={item.name}
                count={item.price}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
};

export default Menu;
