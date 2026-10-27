import data from './catalog.json';
const images = import.meta.glob('../images/menu/*.webp', {
  eager: true,
  import: 'default',
  query: '?url',
});

const drinkDescription = {
  descriptionRu: 'Позиция из исходного меню. Актуальность цены и наличие уточняются.',
  descriptionEn: 'An item from the original menu. Price and availability need confirmation.',
};

const drinkCategories = [
  { id: 'tinctures', ru: 'Настойки', en: 'Infusions' },
  { id: 'wine', ru: 'Вино', en: 'Wine' },
  { id: 'vodka', ru: 'Водка', en: 'Vodka' },
  { id: 'whiskey', ru: 'Виски', en: 'Whiskey' },
  { id: 'cognac', ru: 'Коньяк', en: 'Cognac' },
  { id: 'beer', ru: 'Пиво', en: 'Beer' },
  { id: 'cider', ru: 'Сидры', en: 'Ciders' },
];

const drink = (id, category, nameRu, nameEn, price, volume, featured = false) => ({
  id: `drink-${id}`,
  category,
  nameRu,
  nameEn,
  price,
  volume,
  featured,
  ...drinkDescription,
});

const originalDrinks = [
  drink('mojito', 'cocktails', 'Мохито', 'Mojito', 12, 180, true),
  drink('long-island', 'cocktails', 'Лонг-Айленд', 'Long Island', 12, 200),
  drink('bloody-mary', 'cocktails', 'Кровавая Мэри', 'Bloody Mary', 12, 180),
  drink('sex-on-the-beach', 'cocktails', 'Секс на пляже', 'Sex on the Beach', 12, 200),
  drink('cuba-libre', 'cocktails', 'Куба Либре', 'Cuba Libre', 12, 180),
  drink('pina-colada', 'cocktails', 'Пина Колада', 'Pina Colada', 12, 200),
  drink('blue-lagoon', 'cocktails', 'Голубая лагуна', 'Blue Lagoon', 12, 180),
  drink('cosmopolitan', 'cocktails', 'Космополитен', 'Cosmopolitan', 12, 200),
  drink('tincture-chocolate', 'tinctures', 'Шоколадная настойка', 'Chocolate infusion', 4, 50, true),
  drink('tincture-banana', 'tinctures', 'Банановая настойка', 'Banana infusion', 4, 50),
  drink('tincture-peanut', 'tinctures', 'Арахисовая настойка', 'Peanut infusion', 4, 50),
  drink('tincture-strawberry', 'tinctures', 'Клубничная настойка', 'Strawberry infusion', 4, 50),
  drink('tincture-watermelon', 'tinctures', 'Арбузная настойка', 'Watermelon infusion', 4, 50),
  drink('tincture-kiwi', 'tinctures', 'Настойка киви', 'Kiwi infusion', 4, 50),
  drink('tincture-apple', 'tinctures', 'Яблочная настойка', 'Apple infusion', 4, 50),
  drink('wine-white', 'wine', 'Белое вино', 'White wine', 20, 255, true),
  drink('wine-red', 'wine', 'Красное вино', 'Red wine', 20, 255),
  drink('wine-rose', 'wine', 'Розовое вино', 'Rosé wine', 20, 255),
  drink('vodka-finlandia', 'vodka', 'Finlandia', 'Finlandia', 12, 50, true),
  drink('vodka-svayak', 'vodka', 'Сваяк', 'Svayak', 8, 50),
  drink('vodka-blackcurrant', 'vodka', 'Водка Blackcurrant', 'Blackcurrant vodka', 10, 50),
  drink('whiskey-jim-beam', 'whiskey', 'Jim Beam', 'Jim Beam', 19, 100, true),
  drink('whiskey-jack-daniels', 'whiskey', "Jack Daniel's", "Jack Daniel's", 22, 100),
  drink('whiskey-jameson', 'whiskey', 'Jameson', 'Jameson', 22, 100),
  drink('cognac-hennessy', 'cognac', 'Hennessy', 'Hennessy', 35, 100, true),
  drink('beer-bud', 'beer', 'Bud', 'Bud', 6, 500, true),
  drink('beer-blanc', 'beer', 'Blanc', 'Blanc', 6, 500),
  drink('beer-zatecky-radler', 'beer', 'Žatecký Gus Radler', 'Žatecký Gus Radler', 6, 500),
  drink('cider-strawberry-lime', 'cider', 'Kopparberg Strawberry & Lime', 'Kopparberg Strawberry & Lime', 7, 500, true),
  drink('cider-pear', 'cider', 'Kopparberg Pear', 'Kopparberg Pear', 7, 330),
  drink('cider-spiced-apple', 'cider', 'Kopparberg Spiced Apple', 'Kopparberg Spiced Apple', 7, 500),
  drink('cider-mixed-fruit', 'cider', 'Сидр Mixed Fruit', 'Mixed Fruit cider', 7, 500),
];

const drinkCategoryIds = new Set(['cocktails', ...drinkCategories.map((category) => category.id)]);
export const isDrink = (item) => drinkCategoryIds.has(item.category);

export const categories = [...data.categories, ...drinkCategories];
export const catalog = [
  ...data.items.filter((item) => item.category !== 'cocktails'),
  ...originalDrinks,
].map((item) => ({
  ...item,
  image: images[`../images/menu/${item.id}.webp`],
}));
export const money = (value, language = 'ru') =>
  new Intl.NumberFormat(language === 'en' ? 'en-GB' : 'ru-BY', {
    style: 'currency',
    currency: 'BYN',
    maximumFractionDigits: 2,
  }).format(value);
export function getItem(item, state) {
  return { ...item, ...state.menuOverrides[item.id] };
}
