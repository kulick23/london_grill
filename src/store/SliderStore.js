import { makeAutoObservable } from "mobx";
import Slide1 from '../assets/Party/Tuesday.jpg';
import Slide2 from '../assets/Party/Wednesday.jpg';
import Slide3 from '../assets/Party/Thursday.jpg';
import Slide4 from '../assets/Party/Friday.jpg';
import Slide5 from '../assets/Party/Saturday.jpg';
import Slide6 from '../assets/Party/Sunday.jpg';

class SliderStore {
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
      img: Slide1,
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
