import { makeAutoObservable } from 'mobx';

import MojitoImg from '../assets/Coctails/Mojito.png';
import LongIslandImg from '../assets/Coctails/LongIsland.png';
import BloodMaryImg from '../assets/Coctails/BloodMary.png';
import SexOnTheBeachImg from '../assets/Coctails/SexOnTheBeach.png';
import CubaLibreImg from '../assets/Coctails/CubaLibre.png';
import PinaColadaImg from '../assets/Coctails/PinaColada.png';
import BlueLagoonImg from '../assets/Coctails/BlueLagoon.png';
import CosmopolitanImg from '../assets/Coctails/Cosmopolitan.png';
import ChocolateImg from '../assets/Coctails/Chocolate.png';
import BananaImg from '../assets/Coctails/Banana.png';
import PenutImg from '../assets/Coctails/Penut.png';
import StrawberryImg from '../assets/Coctails/Strawberry.png';
import WatermelonImg from '../assets/Coctails/Watermelon.png';
import KiwiImg from '../assets/Coctails/Kiwi.png';
import AppleImg from '../assets/Coctails/Apple.png';
import WhiteImg from '../assets/Coctails/White.png';
import RedImg from '../assets/Coctails/Red.png';
import PinkImg from '../assets/Coctails/Pink.png';
import FinlandiaImg from '../assets/Coctails/Finlandia.png';
import SvayakImg from '../assets/Coctails/Svayak.png';
import JimBeamImg from '../assets/Coctails/JimBeam.png';
import JackDanielsImg from '../assets/Coctails/JackDaniels.png';
import JamesonImg from '../assets/Coctails/Jameson.png';
import HennessyImg from '../assets/Coctails/Hennessy.png';
import BudImg from '../assets/Coctails/Bud.png';
import BlancImg from '../assets/Coctails/Blanc.png';

class CoctailStore {
  coctails = [
    {
      id: 1,
      productName: 'Mojito',
      nameKey: 'coctails.mojito',
      image: MojitoImg,
      volume: 180,
      categoryId: 1,
      price: 12,
    },
    {
      id: 2,
      productName: 'Long Island',
      nameKey: 'coctails.longIsland',
      image: LongIslandImg,
      volume: 200,
      categoryId: 1,
      price: 12,
    },
    {
      id: 3,
      productName: 'Blood Mary',
      nameKey: 'coctails.bloodMary',
      image: BloodMaryImg,
      volume: 180,
      categoryId: 1,
      price: 12,
    },
    {
      id: 4,
      productName: 'Sex on the Beach',
      nameKey: 'coctails.sexOnTheBeach',
      image: SexOnTheBeachImg,
      volume: 200,
      categoryId: 1,
      price: 12,
    },
    {
      id: 5,
      productName: 'Cuba Libre',
      nameKey: 'coctails.cubaLibre',
      image: CubaLibreImg,
      volume: 180,
      categoryId: 1,
      price: 12,
    },
    {
      id: 6,
      productName: 'Pina Colada',
      nameKey: 'coctails.pinaColada',
      image: PinaColadaImg,
      volume: 200,
      categoryId: 1,
      price: 12,
    },
    {
      id: 7,
      productName: 'Blue Lagoon',
      nameKey: 'coctails.blueLagoon',
      image: BlueLagoonImg,
      volume: 180,
      categoryId: 1,
      price: 12,
    },
    {
      id: 8,
      productName: 'Cosmopolitan',
      nameKey: 'coctails.cosmopolitan',
      image: CosmopolitanImg,
      volume: 200,
      categoryId: 1,
      price: 12,
    },
    {
      id: 9,
      productName: 'Chocolate',
      nameKey: 'tincture.chocolate',
      image: ChocolateImg,
      volume: 50,
      categoryId: 2,
      price: 4,
    },
    {
      id: 10,
      productName: 'Banana',
      nameKey: 'tincture.banana',
      image: BananaImg,
      volume: 50,
      categoryId: 2,
      price: 4,
    },
    {
      id: 11,
      productName: 'Penut',
      nameKey: 'tincture.peanut',
      image: PenutImg,
      volume: 50,
      categoryId: 2,
      price: 4,
    },
    {
      id: 12,
      productName: 'Strawberry',
      nameKey: 'tincture.strawberry',
      image: StrawberryImg,
      volume: 50,
      categoryId: 2,
      price: 4,
    },
    {
      id: 13,
      productName: 'Watermelon',
      nameKey: 'tincture.watermelon',
      image: WatermelonImg,
      volume: 50,
      categoryId: 2,
      price: 4,
    },
    {
      id: 14,
      productName: 'Kiwi',
      nameKey: 'tincture.kiwi',
      image: KiwiImg,
      volume: 50,
      categoryId: 2,
      price: 4,
    },
    {
      id: 15,
      productName: 'Apple',
      nameKey: 'tincture.apple',
      image: AppleImg,
      volume: 50,
      categoryId: 2,
      price: 4,
    },
    {
      id: 16,
      productName: 'White',
      nameKey: 'wine.white',
      image: WhiteImg,
      volume: 255,
      categoryId: 3,
      price: 20,
    },
    {
      id: 17,
      productName: 'Red',
      nameKey: 'wine.red',
      image: RedImg,
      volume: 255,
      categoryId: 3,
      price: 20,
    },
    {
      id: 18,
      productName: 'Pink',
      nameKey: 'wine.pink',
      image: PinkImg,
      volume: 255,
      categoryId: 3,
      price: 20,
    },
    {
      id: 19,
      productName: 'Finlandia',
      nameKey: 'vodka.finlandia',
      image: FinlandiaImg,
      volume: 50,
      categoryId: 4,
      price: 12,
    },
    {
      id: 20,
      productName: 'Svayak',
      nameKey: 'vodka.svayak',
      image: SvayakImg,
      volume: 50,
      categoryId: 4,
      price: 8,
    },
    {
      id: 21,
      productName: 'Jim Beam',
      nameKey: 'whiskey.jimBeam',
      image: JimBeamImg,
      volume: 100,
      categoryId: 5,
      price: 19,
    },
    {
      id: 22,
      productName: 'Jack Daniels',
      nameKey: 'whiskey.jackDaniels',
      image: JackDanielsImg,
      volume: 100,
      categoryId: 5,
      price: 22,
    },
    {
      id: 23,
      productName: 'Jameson',
      nameKey: 'whiskey.jameson',
      image: JamesonImg,
      volume: 100,
      categoryId: 5,
      price: 22,
    },
    {
      id: 24,
      productName: 'Hennessy',
      nameKey: 'cognac.hennessy',
      image: HennessyImg,
      volume: 100,
      categoryId: 6,
      price: 35,
    },
    {
      id: 25,
      productName: 'Bud',
      nameKey: 'beer.bud',
      image: BudImg,
      volume: 500,
      categoryId: 7,
      price: 6,
    },
    {
      id: 26,
      productName: 'Blanc',
      nameKey: 'beer.blanc',
      image: BlancImg,
      volume: 500,
      categoryId: 7,
      price: 6,
    },
  ];

  constructor() {
    makeAutoObservable(this);
  }

  addCoctail(coctail) {
    this.coctails.push({ id: this.coctails.length + 1, ...coctail });
  }

  removeCoctail(id) {
    this.coctails = this.coctails.filter((coctail) => coctail.id !== id);
  }

  updateCoctail(id, updatedCoctail) {
    this.coctails = this.coctails.map((coctail) =>
      coctail.id === id ? { ...coctail, ...updatedCoctail } : coctail,
    );
  }
}

const coctailStore = new CoctailStore();
export default coctailStore;
