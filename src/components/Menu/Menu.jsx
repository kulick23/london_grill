import React, { useMemo, useState } from 'react';
import s from './Menu.module.css';
import MenuElement from './Menu_elements/Menu_element';
import heroImage from '../../assets/img/hall.jpg';
import { useI18n } from '../../i18n/I18nProvider';

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
  const { t, language } = useI18n();
  const categories = useMemo(() => {
    const drinkGroups = groupByFolder(drinkAssets, 'drinks');
    const foodGroups = groupByFolder(foodAssets, 'menu');

    const drinks = [
      {
        title: t('menu.categories.cocktails'),
        items: buildItems(drinkGroups.coctails || [], t('menu.itemPrefix.cocktail'), 12, 180),
      },
      {
        title: t('menu.categories.tincture'),
        items: buildItems(drinkGroups.tincture || [], t('menu.itemPrefix.tincture'), 6, 50),
      },
      {
        title: t('menu.categories.vine'),
        items: buildItems(drinkGroups.vine || [], t('menu.itemPrefix.vine'), 20, 255),
      },
      {
        title: t('menu.categories.vodka'),
        items: buildItems(drinkGroups.vodka || [], t('menu.itemPrefix.vodka'), 10, 50),
      },
      {
        title: t('menu.categories.whiskey'),
        items: buildItems(drinkGroups.whiskey || [], t('menu.itemPrefix.whiskey'), 18, 100),
      },
      {
        title: t('menu.categories.cognac'),
        items: buildItems(drinkGroups.cognac || [], t('menu.itemPrefix.cognac'), 26, 100),
      },
      {
        title: t('menu.categories.beer'),
        items: buildItems(drinkGroups.bear || [], t('menu.itemPrefix.beer'), 6, 500),
      },
      {
        title: t('menu.categories.ciders'),
        items: buildItems(drinkGroups.cidres || [], t('menu.itemPrefix.cider'), 7, 500),
      },
    ];

    const food = [
      {
        title: t('menu.categories.burgers'),
        items: buildItems(foodGroups.burgers || [], t('menu.itemPrefix.burger'), 12, null),
      },
      {
        title: t('menu.categories.burgerSets'),
        items: buildItems(
          foodGroups['burger-sets'] || [],
          t('menu.itemPrefix.burgerSet'),
          16,
          null,
        ),
      },
      {
        title: t('menu.categories.nakedBurger'),
        items: buildItems(
          foodGroups['naked-burger'] || [],
          t('menu.itemPrefix.nakedBurger'),
          11,
          null,
        ),
      },
      {
        title: t('menu.categories.nakedBurgerSets'),
        items: buildItems(
          foodGroups['naked-burger-sets'] || [],
          t('menu.itemPrefix.nakedSet'),
          15,
          null,
        ),
      },
      {
        title: t('menu.categories.meals'),
        items: buildItems(foodGroups.meals || [], t('menu.itemPrefix.meal'), 14, null),
      },
      {
        title: t('menu.categories.salads'),
        items: buildItems(foodGroups.salads || [], t('menu.itemPrefix.salad'), 10, null),
      },
      {
        title: t('menu.categories.snacks'),
        items: buildItems(foodGroups.snacks || [], t('menu.itemPrefix.snack'), 8, null),
      },
      {
        title: t('menu.categories.soups'),
        items: buildItems(foodGroups.soups || [], t('menu.itemPrefix.soup'), 9, null),
      },
      {
        title: t('menu.categories.deserts'),
        items: buildItems(foodGroups.deserts || [], t('menu.itemPrefix.desert'), 7, null),
      },
      {
        title: t('menu.categories.kids'),
        items: buildItems(foodGroups.kids || [], t('menu.itemPrefix.kidsMenu'), 8, null),
      },
    ];

    return { drinks, food };
  }, [language, t]);

  const [activeGroup, setActiveGroup] = useState('drinks');
  const [activeDrinkCategory, setActiveDrinkCategory] = useState(0);
  const [activeFoodCategory, setActiveFoodCategory] = useState(0);

  const activeCategories = activeGroup === 'drinks' ? categories.drinks : categories.food;
  const activeIndex = activeGroup === 'drinks' ? activeDrinkCategory : activeFoodCategory;
  const activeCategory = activeCategories[activeIndex] || null;

  return (
    <div className={s.page}>
      <section className={s.hero}>
        <img
          className={s.heroImage}
          src={heroImage}
          alt="Restaurant interior"
          loading="lazy"
          decoding="async"
        />
        <div className={s.heroOverlay}></div>
        <div className={s.heroContent}>
          <p className={s.heroEyebrow}>{t('menu.heroEyebrow')}</p>
          <h1 className={s.heroTitle}>{t('menu.heroTitle')}</h1>
          <p className={s.heroSubtitle}>{t('menu.heroSubtitle')}</p>
          <div className={s.heroMeta}>
            <span>{t('menu.heroMeta1')}</span>
            <span>{t('menu.heroMeta2')}</span>
            <span>{t('menu.heroMeta3')}</span>
          </div>
        </div>
      </section>

      <section className={s.tabsSection}>
        <div className={s.groupTabs}>
          <button
            className={activeGroup === 'drinks' ? s.groupTabActive : s.groupTab}
            onClick={() => setActiveGroup('drinks')}
          >
            {t('menu.tabs.drinks')}
          </button>
          <button
            className={activeGroup === 'food' ? s.groupTabActive : s.groupTab}
            onClick={() => setActiveGroup('food')}
          >
            {t('menu.tabs.food')}
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
