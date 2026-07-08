import angkorImg from '../assets/PicPlace/Angkor Wat .jpg';
import kohHanImg from '../assets/PicPlace/Koh Han.jpeg';
import waterfallImg from '../assets/PicPlace/Veal Pouch Waterfall, Kompot.jpeg';
import chreavWaterfallImg from '../assets/PicPlace/Chreav Waterfall.jpeg';
import ratnakKiriImg from '../assets/PicPlace/Ratnak Kiri.jpeg';

const slides = [
  {
    location: "SIEM REAP",
    description:
      "Gateway to the majestic Angkor temples, featuring a lively night market and ancient ruins.",
    portrait:
      "https://i.pinimg.com/1200x/5b/a2/ae/5ba2ae8012bb08db10695f6c084f5a66.jpg",
    photos: [
      angkorImg,
      chreavWaterfallImg,
      "https://images.unsplash.com/photo-1540202404-a2f29b7b4c62?w=400&h=300&fit=crop",
    ],
  },
  {
    location: "KEP",
    description:
      "A peaceful coastal town famous for its fresh crab market, sunset views, and French colonial villas.",
    portrait:
      "https://www.asiakingtravel.com/cuploads/files/Kep-2(1).jpg",
    photos: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1520209268518-aec60b8bb5ca?w=300&h=400&fit=crop",
      "https://images.unsplash.com/photo-1582192730841-2a682d7375f9?w=400&h=300&fit=crop",
    ],
  },
  {
    location: "BATTAMBANG",
    description:
      "Cambodia's artistic hub, famous for its French colonial architecture and the unique bamboo train.",
    portrait:
      "https://therestlessbeans.com/wp-content/uploads/2025/02/ta-dumbong-kro-nhong-roundabout-battambang-cambodia.webp",
    photos: [
      ratnakKiriImg,
      kohHanImg,
      angkorImg,
    ],
  },
  {
    location: "KOH KONG",
    description:
      "A pristine coastal province known for its lush mangrove forests, waterfalls, and eco-adventures.",
    portrait:
      "https://karenfranza2014.com/wp-content/uploads/2015/06/img_0706.jpg",
    photos: [
      "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=300&h=400&fit=crop",
      "https://images.unsplash.com/photo-1540202404-a2f29b7b4c62?w=400&h=300&fit=crop",
    ],
  },
  {
    location: "KAMPOT",
    description:
      "A sleepy riverside town famous for pepper farms, French villas, and relaxing river tours.",
    portrait:
      "https://www.novo-monde.com/app/uploads/2023/07/kampot-roundabout-1024x683.jpg",
    photos: [
      waterfallImg,
      "https://images.unsplash.com/photo-1582192730841-2a682d7375f9?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=400&fit=crop",
    ],
  },
];

export default slides;