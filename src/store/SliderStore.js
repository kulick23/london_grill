import { makeAutoObservable } from "mobx";
import Slide1 from '../assets/events/event1.jpg';
import Slide2 from '../assets/events/event2.png';
import Slide3 from '../assets/events/event3.jpg';
import Slide4 from '../assets/events/event4.png';
import Slide5 from '../assets/events/event5.webp';
const Slide6 = Slide1;
import Promo1 from '../assets/promo/IMG_2934_resized-min-884x590.jpg';
import Promo2 from '../assets/promo/DSC_6923.jpg';
import Promo3 from '../assets/promo/Настойки_74_resized-885x590.jpg';
import Promo4 from '../assets/promo/Thursday.jpg';
import Promo5 from '../assets/promo/Sunday.jpg';

class SliderStore {
  promos = [
    {
      id: 1,
      img: Promo1,
      titleKey: "promos.monTueTitle",
      subtitleKey: "promos.monTueSub",
      days: [1, 2]
    },
    {
      id: 2,
      img: Promo2,
      titleKey: "promos.wedTitle",
      subtitleKey: "promos.wedSub",
      days: [3]
    },
    {
      id: 3,
      img: Promo5,
      titleKey: "promos.thuTitle",
      subtitleKey: "promos.thuSub",
      days: [4]
    },
    {
      id: 4,
      img: Promo4,
      titleKey: "promos.friSatTitle",
      subtitleKey: "promos.friSatSub",
      days: [5, 6]
    },
    {
      id: 5,
      img: Promo3,
      titleKey: "promos.sunTitle",
      subtitleKey: "promos.sunSub",
      days: [0]
    }
  ];

  events = [
    {
      id: 1,
      nameKey: "eventsData.winterNegroni",
      img: Slide4,
      descKey: "eventsData.winterNegroniDesc",
      startDate: "2026-01-29",
      endDate: "2026-02-02",
      tag: "Current"
    },
    {
      id: 2,
      nameKey: "eventsData.jazz",
      img: Slide5,
      descKey: "eventsData.jazzDesc",
      startDate: "2026-02-07",
      endDate: "2026-02-07",
      tag: "Upcoming"
    },
    {
      id: 3,
      nameKey: "eventsData.chefsTable",
      img: Slide3,
      descKey: "eventsData.chefsTableDesc",
      startDate: "2026-02-14",
      endDate: "2026-02-14",
      tag: "Upcoming"
    },
    {
      id: 4,
      nameKey: "eventsData.brunch",
      img: Slide6,
      descKey: "eventsData.brunchDesc",
      startDate: "2026-02-08",
      endDate: "2026-02-08",
      tag: "Upcoming"
    },
    {
      id: 5,
      nameKey: "eventsData.oldFashioned",
      img: Slide2,
      descKey: "eventsData.oldFashionedDesc",
      startDate: "2026-01-11",
      endDate: "2026-01-11",
      tag: "Past"
    },
    {
      id: 6,
      nameKey: "eventsData.holiday",
      img: Slide4,
      descKey: "eventsData.holidayDesc",
      startDate: "2025-12-27",
      endDate: "2025-12-28",
      tag: "Past"
    }
  ];

  constructor() {
    makeAutoObservable(this);
  }
}

const sliderStore = new SliderStore();
export default sliderStore;
