import angkorImg from '../assets/PicPlace/siemreap/Angkor Wat .jpg';
import phnomkulenImg from '../assets/PicPlace/siemreap/phnom-kulen.webp'
import siemreapImg from '../assets/PicPlace/siemreap/siemreap.jpg';
import tonleomImg from '../assets/PicPlace/siemreap/tonle-om.jpg';

import KepPortraitImg from '../assets/PicPlace/Kep/Kep portrait.jpg'
import kepImg from '../assets/PicPlace/Kep/Kep.jpg';
import kep1Img from '../assets/PicPlace/Kep/Kep1 copy.png';
import kep3Img from '../assets/PicPlace/Kep/Kep3.jpg';

import battambangImg from '../assets/PicPlace/battambang/battambang.webp';
import battambang1 from '../assets/PicPlace/battambang/phnom-banan2.jpg';
import battambang2 from '../assets/PicPlace/battambang/bemboo train.jpg';
import battambang3 from '../assets/PicPlace/battambang/batscave.webp';

import kohkongportrait from '../assets/PicPlace/kohkong/kohkongportrait.jpg';
import kohkong1 from '../assets/PicPlace/kohkong/kohkong.webp';
import kohkong2 from '../assets/PicPlace/kohkong/kohkong1.jpg';
import kohkong3 from '../assets/PicPlace/kohkong/kohkong2.jpg';

import kompotportriat from '../assets/PicPlace/kompot/kompot portrait.jpg';
import kompot1 from '../assets/PicPlace/kompot/kompot1.webp';
import kompot2 from '../assets/PicPlace/kompot/kompot2.webp';
import kompot3 from '../assets/PicPlace/kompot/kompot3.jpg';

const slides = [
  {
    location: "SIEM REAP",
    description:
      "Gateway to the majestic Angkor temples, featuring a lively night market and ancient ruins.",
    portrait:
      siemreapImg,
    photos: [
      angkorImg,
      tonleomImg,
      phnomkulenImg,
    ],
  },
  {
    location: "KEP",
    description:
      "A peaceful coastal town famous for its fresh crab market, sunset views, and French colonial villas.",
    portrait:
      KepPortraitImg,
    photos: [
      kepImg,
      kep1Img,
      kep3Img,
    ],
  },
  {
    location: "BATTAMBANG",
    description:
      "Cambodia's artistic hub, famous for its French colonial architecture and the unique bamboo train.",
    portrait:
      battambangImg,
    photos: [
      battambang1,
      battambang2,
      battambang3,
    ],
  },
  {
    location: "KOH KONG",
    description:
      "A pristine coastal province known for its lush mangrove forests, waterfalls, and eco-adventures.",
    portrait:
      kohkongportrait,
    photos: [
      kohkong3,
      kohkong2,
      kohkong1,
    ],
  },
  {
    location: "KAMPOT",
    description:
      "A sleepy riverside town famous for pepper farms, French villas, and relaxing river tours.",
    portrait:
      kompotportriat,
    photos: [
      kompot1,
      kompot2,
      kompot3,
    ],
  },
];

export const slidesRawData = [
  {
    id: "siem-reap",
    location: "SIEM REAP",
    description:
      "Gateway to the majestic Angkor temples, featuring a lively night market and ancient ruins.",
    portrait: "/assets/PicPlace/siemreap/siemreap.jpg",
    photos: [
      "/assets/PicPlace/siemreap/Angkor Wat .jpg",
      "/assets/PicPlace/siemreap/tonle-om.jpg",
      "/assets/PicPlace/siemreap/phnom-kulen.webp",
    ],
  },
  {
    id: "kep",
    location: "KEP",
    description:
      "A peaceful coastal town famous for its fresh crab market, sunset views, and French colonial villas.",
    portrait: "/assets/PicPlace/Kep/Kep portrait.jpg",
    photos: [
      "/assets/PicPlace/Kep/Kep.jpg",
      "/assets/PicPlace/Kep/Kep1 copy.png",
      "/assets/PicPlace/Kep/Kep3.jpg",
    ],
  },
  {
    id: "battambang",
    location: "BATTAMBANG",
    description:
      "Cambodia's artistic hub, famous for its French colonial architecture and the unique bamboo train.",
    portrait: "/assets/PicPlace/battambang/battambang.webp",
    photos: [
      "/assets/PicPlace/battambang/phnom-banan2.jpg",
      "/assets/PicPlace/battambang/bemboo train.jpg",
      "/assets/PicPlace/battambang/batscave.webp",
    ],
  },
  {
    id: "koh-kong",
    location: "KOH KONG",
    description:
      "A pristine coastal province known for its lush mangrove forests, waterfalls, and eco-adventures.",
    portrait: "/assets/PicPlace/kohkong/kohkongportrait.jpg",
    photos: [
      "/assets/PicPlace/kohkong/kohkong2.jpg",
      "/assets/PicPlace/kohkong/kohkong1.jpg",
      "/assets/PicPlace/kohkong/kohkong.webp",
    ],
  },
  {
    id: "kampot",
    location: "KAMPOT",
    description:
      "A sleepy riverside town famous for pepper farms, French villas, and relaxing river tours.",
    portrait: "/assets/PicPlace/kompot/kompot portrait.jpg",
    photos: [
      "/assets/PicPlace/kompot/kompot1.webp",
      "/assets/PicPlace/kompot/kompot2.webp",
      "/assets/PicPlace/kompot/kompot3.jpg",
    ],
  },
];

export default slides;
