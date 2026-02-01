import { makeAutoObservable } from 'mobx';
import Slide1 from '../assets/events/event1.jpg';
import Slide2 from '../assets/events/event2.png';
import Slide3 from '../assets/events/event3.jpg';
import Slide4 from '../assets/events/event4.png';
import Slide5 from '../assets/events/event5.webp';
const Slide6 = Slide1;
import Promo1 from '../assets/promo/IMG_2934_resized-min-884x590.jpg';
import Promo2 from '../assets/promo/DSC_6923.jpg';
import Promo3 from '../assets/promo/Nastoyki_74_resized-885x590.jpg';
import Promo4 from '../assets/promo/Thursday.jpg';
import Promo5 from '../assets/promo/Sunday.jpg';

class SliderStore {
  promos = [
    {
      id: 1,
      img: Promo1,
      titleKey: 'promos.monTueTitle',
      subtitleKey: 'promos.monTueSub',
      days: [1, 2],
    },
    {
      id: 2,
      img: Promo2,
      titleKey: 'promos.wedTitle',
      subtitleKey: 'promos.wedSub',
      days: [3],
    },
    {
      id: 3,
      img: Promo5,
      titleKey: 'promos.thuTitle',
      subtitleKey: 'promos.thuSub',
      days: [4],
    },
    {
      id: 4,
      img: Promo4,
      titleKey: 'promos.friSatTitle',
      subtitleKey: 'promos.friSatSub',
      days: [5, 6],
    },
    {
      id: 5,
      img: Promo3,
      titleKey: 'promos.sunTitle',
      subtitleKey: 'promos.sunSub',
      days: [0],
    },
  ];

  events = [];

  constructor() {
    makeAutoObservable(this);
    this.events = this.buildEvents();
  }

  buildEvents() {
    const today = new Date();
    const toISO = (date) => date.toISOString().slice(0, 10);
    const addDays = (date, days) =>
      new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
    const getNextWeekday = (weekday) => {
      const diff = (weekday - today.getDay() + 7) % 7 || 7;
      return addDays(today, diff);
    };
    const getPreviousWeekday = (weekday) => {
      const diff = (today.getDay() - weekday + 7) % 7 || 7;
      return addDays(today, -diff);
    };

    const currentStart = addDays(today, -1);
    const currentEnd = addDays(today, 3);
    const nextSaturday = getNextWeekday(6);
    const nextSunday = getNextWeekday(0);
    const nextFriday = getNextWeekday(5);
    const prevSaturday = getPreviousWeekday(6);
    const prevFriday = getPreviousWeekday(5);

    return [
      {
        id: 1,
        nameKey: 'eventsData.winterNegroni',
        img: Slide4,
        descKey: 'eventsData.winterNegroniDesc',
        startDate: toISO(currentStart),
        endDate: toISO(currentEnd),
        tag: 'Current',
      },
      {
        id: 2,
        nameKey: 'eventsData.jazz',
        img: Slide5,
        descKey: 'eventsData.jazzDesc',
        startDate: toISO(nextSaturday),
        endDate: toISO(nextSaturday),
        tag: 'Upcoming',
      },
      {
        id: 3,
        nameKey: 'eventsData.chefsTable',
        img: Slide3,
        descKey: 'eventsData.chefsTableDesc',
        startDate: toISO(addDays(nextSaturday, 7)),
        endDate: toISO(addDays(nextSaturday, 7)),
        tag: 'Upcoming',
      },
      {
        id: 4,
        nameKey: 'eventsData.brunch',
        img: Slide6,
        descKey: 'eventsData.brunchDesc',
        startDate: toISO(nextSunday),
        endDate: toISO(nextSunday),
        tag: 'Upcoming',
      },
      {
        id: 5,
        nameKey: 'eventsData.oldFashioned',
        img: Slide2,
        descKey: 'eventsData.oldFashionedDesc',
        startDate: toISO(prevFriday),
        endDate: toISO(prevFriday),
        tag: 'Past',
      },
      {
        id: 6,
        nameKey: 'eventsData.holiday',
        img: Slide4,
        descKey: 'eventsData.holidayDesc',
        startDate: toISO(prevSaturday),
        endDate: toISO(addDays(prevSaturday, 1)),
        tag: 'Past',
      },
    ];
  }
}

const sliderStore = new SliderStore();
export default sliderStore;
