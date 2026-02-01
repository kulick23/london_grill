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
      title: "Monday & Tuesday",
      subtitle: "20% off on all menu",
      days: [1, 2]
    },
    {
      id: 2,
      img: Promo2,
      title: "Wednesday",
      subtitle: "1+1 on tinctures",
      days: [3]
    },
    {
      id: 3,
      img: Promo3,
      title: "Thursday",
      subtitle: "1+1 on cocktails",
      days: [4]
    },
    {
      id: 4,
      img: Promo4,
      title: "Friday & Saturday",
      subtitle: "4+1 on tinctures",
      days: [5, 6]
    },
    {
      id: 5,
      img: Promo5,
      title: "Sunday",
      subtitle: "5+5 on tinctures",
      days: [0]
    }
  ];

  events = [
    {
      id: 1,
      name: "Winter Negroni Week",
      img: Slide4,
      des: "Signature negroni flights and bar bites",
      startDate: "2026-01-29",
      endDate: "2026-02-02",
      tag: "Current"
    },
    {
      id: 2,
      name: "Jazz & Candlelight",
      img: Slide5,
      des: "Live trio, candlelit tables, late dinner set",
      startDate: "2026-02-07",
      endDate: "2026-02-07",
      tag: "Upcoming"
    },
    {
      id: 3,
      name: "Chef's Table: Winter Menu",
      img: Slide3,
      des: "6-course tasting with wine pairing",
      startDate: "2026-02-14",
      endDate: "2026-02-14",
      tag: "Upcoming"
    },
    {
      id: 4,
      name: "Sunday Brunch Club",
      img: Slide6,
      des: "Bottomless mimosas + brunch favorites",
      startDate: "2026-02-08",
      endDate: "2026-02-08",
      tag: "Upcoming"
    },
    {
      id: 5,
      name: "Old Fashioned Night",
      img: Slide2,
      des: "Smoked cocktails and bourbon pairings",
      startDate: "2026-01-11",
      endDate: "2026-01-11",
      tag: "Past"
    },
    {
      id: 6,
      name: "Holiday Weekend Sessions",
      img: Slide4,
      des: "DJ set + festive specials",
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
