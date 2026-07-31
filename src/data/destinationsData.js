// Centralized detailed dataset for all places in the website.
// Includes realistic descriptions, locations, maps, and reviews to match the user's photo mockup.

import angkorImg from '../assets/PicPlace/siemreap/Angkor Wat .jpg';
import kohHanImg from '../assets/PicPlace/Koh Han.jpeg';
import waterfallImg from '../assets/PicPlace/Veal Pouch Waterfall, Kompot.jpeg';
import kohRongImg from '../assets/koh rong island.jpg';
import kampotImg from '../assets/Kampot-Riverfront-Boutique.webp';
import ratnakKiriImg from '../assets/PicPlace/Ratnak Kiri.jpeg';
import kohKongImg from '../assets/PicPlace/koh kong.jpg';
import battambangImg from '../assets/Battambang Colonial Town.jpg';
import kompongPhlukImg from '../assets/kompong-phluk.jpg';
import psakdamImg from '../assets/Kep Crab Market.jpg';

export const destinationsData = [
  {
    id: "angkor-wat",
    name: "Angkor Wat Temple",
    searchNames: ["angkor wat", "angkor wat temple", "angkor wat tample", "siem reap"],
    location: "Siem Reap, Cambodia",
    rating: 5,
    img: angkorImg,
    cat: "plains",
    about: "Angkor Wat is a magnificent temple complex located in Siem Reap, Cambodia. Originally built in the early 12th century as a Hindu temple dedicated to the god Vishnu, it gradually transformed into a Buddhist temple. As the largest religious monument in the world, it represents the high point of classical Khmer architecture. The temple is admired for the grandeur and harmony of its design, its extensive bas-reliefs, and the numerous devatas (guardian spirits) adorning its walls. It is a symbol of Cambodia, appearing on its national flag, and is a UNESCO World Heritage site.",
    mapSearch: "Angkor Wat, Siem Reap, Cambodia",
    reviews: [
      {
        id: "r1",
        username: "Ratna",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
        comment: "That looking grate! The sunrise view behind the temple was absolutely breathtaking.",
        likes: 12
      },
      {
        id: "r2",
        username: "Sophea",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
        comment: "An absolute masterpiece of ancient architecture. Hiring a guide is highly recommended to learn about history.",
        likes: 8
      },
      {
        id: "r3",
        username: "John Doe",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
        comment: "Huge complex! Spend at least a full day here to explore the main temple and surrounding areas.",
        likes: 4
      }
    ]
  },
  {
    id: "koh-rong",
    name: "Koh Rong Island",
    searchNames: ["khonh rong", "khonh rong 2", "koh rong", "koh rong island"],
    location: "Sihanoukville, Cambodia",
    rating: 5,
    img: kohRongImg,
    cat: "coastal",
    about: "Koh Rong is the second-largest island of Cambodia. Located in the Gulf of Thailand, it is famous for its white sandy beaches, crystal-clear turquoise waters, and vibrant marine life. Ideal for snorkeling, diving, and kayaking, Koh Rong is a tropical paradise that remains largely undeveloped, retaining its natural charm. Its pristine beaches are lined with coconut palms, offering a peaceful getaway from the mainland.",
    mapSearch: "Koh Rong, Cambodia",
    reviews: [
      {
        id: "kr1",
        username: "Ratna",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
        comment: "That looking grate! Best beaches in Cambodia by far. Super clean water.",
        likes: 15
      },
      {
        id: "kr2",
        username: "David",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
        comment: "Excellent bioluminescent plankton tour at night! Highly recommended.",
        likes: 9
      }
    ]
  },
  {
    id: "kampot",
    name: "Kampot Riverfront",
    searchNames: ["kompot", "kampot", "kampot riverfront"],
    location: "Kampot, Cambodia",
    rating: 4,
    img: kampotImg,
    cat: "coastal",
    about: "Kampot is a beautiful, laid-back riverside town in southern Cambodia. It is world-renowned for its high-quality Kampot Pepper and unique salt fields. The town features charming French colonial architecture, a relaxed pace of life, and close proximity to Bokor National Park. The riverfront is perfect for sunset cruises, paddleboarding, and enjoying local seafood dishes under the stars.",
    mapSearch: "Kampot, Cambodia",
    reviews: [
      {
        id: "kp1",
        username: "Ratna",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
        comment: "That looking grate! Lovely pepper farms and fresh durian.",
        likes: 5
      },
      {
        id: "kp2",
        username: "Alice",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
        comment: "So peaceful. Kayaking along the Green Cathedral loop was the highlight of my trip.",
        likes: 7
      }
    ]
  },
  {
    id: "koh-han",
    name: "Koh Han Flooded Forest",
    searchNames: ["koh han", "koh han flooded forest"],
    location: "Stung Treng, Cambodia",
    rating: 5,
    img: kohHanImg,
    cat: "mountain",
    about: "Koh Han is a stunning ecotourism destination located along the Mekong River. Known for its incredible flooded forests, seasonal sandy beaches, and unique riverine biodiversity, it offers travelers an immersive experience in nature. Visitors can kayak through the dense canopy of trees growing directly out of the riverbed, spot rare birds, and camp on pristine sand bars under the night sky.",
    mapSearch: "Koh Han, Stung Treng, Cambodia",
    reviews: [
      {
        id: "kh1",
        username: "Ratna",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
        comment: "That looking grate! The flooded forest looks magical. Perfect for kayaking.",
        likes: 11
      },
      {
        id: "kh2",
        username: "Sokha",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
        comment: "Unforgettable ecotourism experience! The local guides are very helpful.",
        likes: 6
      }
    ]
  },
  {
    id: "kep",
    name: "Kep Crab Market & Beach",
    searchNames: ["kep", "kep beach", "kep crab market"],
    location: "Kep, Cambodia",
    rating: 5,
    img: psakdamImg,
    cat: "coastal",
    about: "Kep is a coastal province in southern Cambodia known for its seafood, peaceful atmosphere, and French colonial-era ruins. The famous Crab Market is a must-visit, where fresh blue crabs are caught daily and cooked on the spot with green Kampot pepper. Kep Beach is a peaceful stretch of white sand, and Kep National Park offers hiking trails through lush jungles with panoramic views of neighboring islands.",
    mapSearch: "Kep, Cambodia",
    reviews: [
      {
        id: "ke1",
        username: "Ratna",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
        comment: "That looking grate! The pepper crab at the Crab Market is incredible.",
        likes: 21
      },
      {
        id: "ke2",
        username: "Michael",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
        comment: "Very relaxing place. Much quieter than Sihanoukville. Great sunset views.",
        likes: 10
      }
    ]
  },
  {
    id: "green-field",
    name: "Mondulkiri Green Fields",
    searchNames: ["green field", "green field mondulkiri", "mondulkiri"],
    location: "Mondulkiri, Cambodia",
    rating: 5,
    img: ratnakKiriImg,
    cat: "mountain",
    about: "Mondulkiri is a mountainous province in eastern Cambodia known for its rolling hills, pine forests, cool climate, and majestic waterfalls. The 'Green Fields' area offers endless vistas of grassy hills that turn vibrant green during the wet season. Mondulkiri is also home to indigenous communities and elephant sanctuaries dedicated to wildlife conservation, offering a unique highland adventure.",
    mapSearch: "Mondulkiri, Cambodia",
    reviews: [
      {
        id: "gf1",
        username: "Ratna",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
        comment: "That looking grate! Feels like Switzerland in Cambodia with these pine trees and hills.",
        likes: 18
      },
      {
        id: "gf2",
        username: "Vanna",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
        comment: "Lovely cool weather in the evenings. The wildlife sanctuary here is doing amazing work.",
        likes: 14
      }
    ]
  },
  {
    id: "koh-kong",
    name: "Koh Kong Mangroves & Forests",
    searchNames: ["koh kong", "koh kong province"],
    location: "Koh Kong, Cambodia",
    rating: 5,
    img: kohKongImg,
    cat: "coastal",
    about: "Koh Kong province contains some of the largest and most pristine mangrove forests in Southeast Asia, along with parts of the Cardamom Mountains. It is a premier destination for ecotourism, offering jungle trekking, waterfall exploration, and wildlife watching. The Peam Krasop Mangrove Sanctuary features long wooden elevated walkways weaving through dense coastal forests.",
    mapSearch: "Koh Kong, Cambodia",
    reviews: [
      {
        id: "kk1",
        username: "Ratna",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
        comment: "That looking grate! Walking through the mangroves was peaceful and mystical.",
        likes: 9
      },
      {
        id: "kk2",
        username: "Sarah",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
        comment: "Great spot for kayaking and seeing fireflies at night along the river.",
        likes: 7
      }
    ]
  },
  {
    id: "veal-touch-waterfall",
    name: "Veal Touch Waterfall",
    searchNames: ["veal touch waterfall", "veal pouch waterfall", "waterfall"],
    location: "Kampot, Cambodia",
    rating: 5,
    img: waterfallImg,
    cat: "mountain",
    about: "Veal Touch Waterfall (often referred to as Veal Pouch Waterfall) is a hidden gem located in the lush jungles near Kampot/Kep. Surrounded by dense vegetation, tropical flowers, and ancient rock formations, the waterfall cascades into a cool, freshwater pool that is perfect for swimming. It offers a peaceful and secluded spot to relax and enjoy the sights and sounds of nature away from the main tourist crowds.",
    mapSearch: "Veal Pouch Waterfall, Kampot, Cambodia",
    reviews: [
      {
        id: "vw1",
        username: "Ratna",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
        comment: "That looking grate! Refreshing cold water, perfect after a long hike in the sun.",
        likes: 10
      },
      {
        id: "vw2",
        username: "Borey",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
        comment: "A beautiful hidden spot. Be sure to bring good shoes for the trail.",
        likes: 5
      }
    ]
  },
  {
    id: "battambang",
    name: "Battambang Colonial Town",
    searchNames: ["battambang"],
    location: "Battambang, Cambodia",
    rating: 4,
    img: battambangImg,
    cat: "plains",
    about: "Battambang is Cambodia's second-largest city and a hub for arts, culture, and colonial architecture. Situated along the Sangkae River, it features some of the best-preserved French colonial architecture in the country. It is famous for the Bamboo Train (Norry), ancient temples like Phnom Banan, and the Bat Caves of Phnom Sampeau, where millions of bats fly out at sunset in a spectacular stream.",
    mapSearch: "Battambang, Cambodia",
    reviews: [
      {
        id: "bb1",
        username: "Ratna",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
        comment: "That looking grate! Riding the Bamboo Train was an absolute blast.",
        likes: 14
      },
      {
        id: "bb2",
        username: "Leon",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
        comment: "The art scene here is thriving! Visited some wonderful local galleries.",
        likes: 12
      }
    ]
  },
  {
    id: "kampong-phluk",
    name: "Kampong Phluk Floating Village",
    searchNames: ["kampong phluk", "floating village", "tonle sap"],
    location: "Siem Reap (Tonle Sap), Cambodia",
    rating: 5,
    img: kompongPhlukImg,
    cat: "tonle",
    about: "Kampong Phluk is a cluster of three villages of stilted houses built within the floodplain of the Tonle Sap Lake, about 16 km southeast of Siem Reap. The houses are built on stilts that range between 6 and 10 meters high to handle the massive water height variation of the lake between wet and dry seasons. During the wet season, the area transforms into a magical flooded forest where villagers navigate by boat, offering visitors a unique look at lake-dwelling life.",
    mapSearch: "Kampong Phluk, Cambodia",
    reviews: [
      {
        id: "kf1",
        username: "Ratna",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
        comment: "That looking grate! Navigating the stilted houses by boat is an eye-opening experience.",
        likes: 8
      },
      {
        id: "kf2",
        username: "Srey",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
        comment: "Visiting the flooded mangrove forests here was the highlight of our trip.",
        likes: 5
      }
    ]
  },
  {
    id: "kampong-phluk",
    name: "Kampong Phluk Floating Village",
    searchNames: ["kampong phluk", "floating village", "tonle sap"],
    location: "Siem Reap (Tonle Sap), Cambodia",
    rating: 5,
    img: kompongPhlukImg,
    cat: "tonle",
    about: "Kampong Phluk is a cluster of three villages of stilted houses built within the floodplain of the Tonle Sap Lake, about 16 km southeast of Siem Reap. The houses are built on stilts that range between 6 and 10 meters high to handle the massive water height variation of the lake between wet and dry seasons. During the wet season, the area transforms into a magical flooded forest where villagers navigate by boat, offering visitors a unique look at lake-dwelling life.",
    mapSearch: "Kampong Phluk, Cambodia",
    reviews: [
      {
        id: "kf1",
        username: "Ratna",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
        comment: "That looking grate! Navigating the stilted houses by boat is an eye-opening experience.",
        likes: 8
      },
      {
        id: "kf2",
        username: "Srey",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
        comment: "Visiting the flooded mangrove forests here was the highlight of our trip.",
        likes: 5
      }
    ]
  },
  {
    id: "kampong-phluk",
    name: "Kampong Phluk Floating Village",
    searchNames: ["kampong phluk", "floating village", "tonle sap"],
    location: "Siem Reap (Tonle Sap), Cambodia",
    rating: 5,
    img: kompongPhlukImg,
    cat: "tonle",
    about: "Kampong Phluk is a cluster of three villages of stilted houses built within the floodplain of the Tonle Sap Lake, about 16 km southeast of Siem Reap. The houses are built on stilts that range between 6 and 10 meters high to handle the massive water height variation of the lake between wet and dry seasons. During the wet season, the area transforms into a magical flooded forest where villagers navigate by boat, offering visitors a unique look at lake-dwelling life.",
    mapSearch: "Kampong Phluk, Cambodia",
    reviews: [
      {
        id: "kf1",
        username: "Ratna",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
        comment: "That looking grate! Navigating the stilted houses by boat is an eye-opening experience.",
        likes: 8
      },
      {
        id: "kf2",
        username: "Srey",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
        comment: "Visiting the flooded mangrove forests here was the highlight of our trip.",
        likes: 5
      }
    ]
  },
  {
    id: "kampong-phluk",
    name: "Kampong Phluk Floating Village",
    searchNames: ["kampong phluk", "floating village", "tonle sap"],
    location: "Siem Reap (Tonle Sap), Cambodia",
    rating: 5,
    img: kompongPhlukImg,
    cat: "tonle",
    about: "Kampong Phluk is a cluster of three villages of stilted houses built within the floodplain of the Tonle Sap Lake, about 16 km southeast of Siem Reap. The houses are built on stilts that range between 6 and 10 meters high to handle the massive water height variation of the lake between wet and dry seasons. During the wet season, the area transforms into a magical flooded forest where villagers navigate by boat, offering visitors a unique look at lake-dwelling life.",
    mapSearch: "Kampong Phluk, Cambodia",
    reviews: [
      {
        id: "kf1",
        username: "Ratna",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
        comment: "That looking grate! Navigating the stilted houses by boat is an eye-opening experience.",
        likes: 8
      },
      {
        id: "kf2",
        username: "Srey",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
        comment: "Visiting the flooded mangrove forests here was the highlight of our trip.",
        likes: 5
      }
    ]
  },
  {
    id: "kampong-phluk",
    name: "Kampong Phluk Floating Village",
    searchNames: ["kampong phluk", "floating village", "tonle sap"],
    location: "Siem Reap (Tonle Sap), Cambodia",
    rating: 5,
    img: kompongPhlukImg,
    cat: "tonle",
    about: "Kampong Phluk is a cluster of three villages of stilted houses built within the floodplain of the Tonle Sap Lake, about 16 km southeast of Siem Reap. The houses are built on stilts that range between 6 and 10 meters high to handle the massive water height variation of the lake between wet and dry seasons. During the wet season, the area transforms into a magical flooded forest where villagers navigate by boat, offering visitors a unique look at lake-dwelling life.",
    mapSearch: "Kampong Phluk, Cambodia",
    reviews: [
      {
        id: "kf1",
        username: "Ratna",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
        comment: "That looking grate! Navigating the stilted houses by boat is an eye-opening experience.",
        likes: 8
      },
      {
        id: "kf2",
        username: "Srey",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
        comment: "Visiting the flooded mangrove forests here was the highlight of our trip.",
        likes: 5
      }
    ]
  },
  {
    id: "kampong-phluk",
    name: "Kampong Phluk Floating Village",
    searchNames: ["kampong phluk", "floating village", "tonle sap"],
    location: "Siem Reap (Tonle Sap), Cambodia",
    rating: 5,
    img: kompongPhlukImg,
    cat: "tonle",
    about: "Kampong Phluk is a cluster of three villages of stilted houses built within the floodplain of the Tonle Sap Lake, about 16 km southeast of Siem Reap. The houses are built on stilts that range between 6 and 10 meters high to handle the massive water height variation of the lake between wet and dry seasons. During the wet season, the area transforms into a magical flooded forest where villagers navigate by boat, offering visitors a unique look at lake-dwelling life.",
    mapSearch: "Kampong Phluk, Cambodia",
    reviews: [
      {
        id: "kf1",
        username: "Ratna",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
        comment: "That looking grate! Navigating the stilted houses by boat is an eye-opening experience.",
        likes: 8
      },
      {
        id: "kf2",
        username: "Srey",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
        comment: "Visiting the flooded mangrove forests here was the highlight of our trip.",
        likes: 5
      }
    ]
  },
  {
    id: "kampong-phluk",
    name: "Kampong Phluk Floating Village",
    searchNames: ["kampong phluk", "floating village", "tonle sap"],
    location: "Siem Reap (Tonle Sap), Cambodia",
    rating: 5,
    img: kompongPhlukImg,
    cat: "tonle",
    about: "Kampong Phluk is a cluster of three villages of stilted houses built within the floodplain of the Tonle Sap Lake, about 16 km southeast of Siem Reap. The houses are built on stilts that range between 6 and 10 meters high to handle the massive water height variation of the lake between wet and dry seasons. During the wet season, the area transforms into a magical flooded forest where villagers navigate by boat, offering visitors a unique look at lake-dwelling life.",
    mapSearch: "Kampong Phluk, Cambodia",
    reviews: [
      {
        id: "kf1",
        username: "Ratna",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
        comment: "That looking grate! Navigating the stilted houses by boat is an eye-opening experience.",
        likes: 8
      },
      {
        id: "kf2",
        username: "Srey",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
        comment: "Visiting the flooded mangrove forests here was the highlight of our trip.",
        likes: 5
      }
    ]
  },
  {
    id: "kampong-phluk",
    name: "Kampong Phluk Floating Village",
    searchNames: ["kampong phluk", "floating village", "tonle sap"],
    location: "Siem Reap (Tonle Sap), Cambodia",
    rating: 5,
    img: kompongPhlukImg,
    cat: "tonle",
    about: "Kampong Phluk is a cluster of three villages of stilted houses built within the floodplain of the Tonle Sap Lake, about 16 km southeast of Siem Reap. The houses are built on stilts that range between 6 and 10 meters high to handle the massive water height variation of the lake between wet and dry seasons. During the wet season, the area transforms into a magical flooded forest where villagers navigate by boat, offering visitors a unique look at lake-dwelling life.",
    mapSearch: "Kampong Phluk, Cambodia",
    reviews: [
      {
        id: "kf1",
        username: "Ratna",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
        comment: "That looking grate! Navigating the stilted houses by boat is an eye-opening experience.",
        likes: 8
      },
      {
        id: "kf2",
        username: "Srey",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
        comment: "Visiting the flooded mangrove forests here was the highlight of our trip.",
        likes: 5
      }
    ]
  },
  {
    id: "kampong-phluk",
    name: "Kampong Phluk Floating Village",
    searchNames: ["kampong phluk", "floating village", "tonle sap"],
    location: "Siem Reap (Tonle Sap), Cambodia",
    rating: 5,
    img: kompongPhlukImg,
    cat: "tonle",
    about: "Kampong Phluk is a cluster of three villages of stilted houses built within the floodplain of the Tonle Sap Lake, about 16 km southeast of Siem Reap. The houses are built on stilts that range between 6 and 10 meters high to handle the massive water height variation of the lake between wet and dry seasons. During the wet season, the area transforms into a magical flooded forest where villagers navigate by boat, offering visitors a unique look at lake-dwelling life.",
    mapSearch: "Kampong Phluk, Cambodia",
    reviews: [
      {
        id: "kf1",
        username: "Ratna",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
        comment: "That looking grate! Navigating the stilted houses by boat is an eye-opening experience.",
        likes: 8
      },
      {
        id: "kf2",
        username: "Srey",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
        comment: "Visiting the flooded mangrove forests here was the highlight of our trip.",
        likes: 5
      }
    ]
  },
  {
    id: "kampong-phluk",
    name: "Kampong Phluk Floating Village",
    searchNames: ["kampong phluk", "floating village", "tonle sap"],
    location: "Siem Reap (Tonle Sap), Cambodia",
    rating: 5,
    img: kompongPhlukImg,
    cat: "tonle",
    about: "Kampong Phluk is a cluster of three villages of stilted houses built within the floodplain of the Tonle Sap Lake, about 16 km southeast of Siem Reap. The houses are built on stilts that range between 6 and 10 meters high to handle the massive water height variation of the lake between wet and dry seasons. During the wet season, the area transforms into a magical flooded forest where villagers navigate by boat, offering visitors a unique look at lake-dwelling life.",
    mapSearch: "Kampong Phluk, Cambodia",
    reviews: [
      {
        id: "kf1",
        username: "Ratna",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
        comment: "That looking grate! Navigating the stilted houses by boat is an eye-opening experience.",
        likes: 8
      },
      {
        id: "kf2",
        username: "Srey",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
        comment: "Visiting the flooded mangrove forests here was the highlight of our trip.",
        likes: 5
      }
    ]
  },
  {
    id: "kampong-phluk",
    name: "Kampong Phluk Floating Village",
    searchNames: ["kampong phluk", "floating village", "tonle sap"],
    location: "Siem Reap (Tonle Sap), Cambodia",
    rating: 5,
    img: kompongPhlukImg,
    cat: "tonle",
    about: "Kampong Phluk is a cluster of three villages of stilted houses built within the floodplain of the Tonle Sap Lake, about 16 km southeast of Siem Reap. The houses are built on stilts that range between 6 and 10 meters high to handle the massive water height variation of the lake between wet and dry seasons. During the wet season, the area transforms into a magical flooded forest where villagers navigate by boat, offering visitors a unique look at lake-dwelling life.",
    mapSearch: "Kampong Phluk, Cambodia",
    reviews: [
      {
        id: "kf1",
        username: "Ratna",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
        comment: "That looking grate! Navigating the stilted houses by boat is an eye-opening experience.",
        likes: 8
      },
      {
        id: "kf2",
        username: "Srey",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
        comment: "Visiting the flooded mangrove forests here was the highlight of our trip.",
        likes: 5
      }
    ]
  },
  {
    id: "kampong-phluk",
    name: "Kampong Phluk Floating Village",
    searchNames: ["kampong phluk", "floating village", "tonle sap"],
    location: "Siem Reap (Tonle Sap), Cambodia",
    rating: 5,
    img: kompongPhlukImg,
    cat: "tonle",
    about: "Kampong Phluk is a cluster of three villages of stilted houses built within the floodplain of the Tonle Sap Lake, about 16 km southeast of Siem Reap. The houses are built on stilts that range between 6 and 10 meters high to handle the massive water height variation of the lake between wet and dry seasons. During the wet season, the area transforms into a magical flooded forest where villagers navigate by boat, offering visitors a unique look at lake-dwelling life.",
    mapSearch: "Kampong Phluk, Cambodia",
    reviews: [
      {
        id: "kf1",
        username: "Ratna",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
        comment: "That looking grate! Navigating the stilted houses by boat is an eye-opening experience.",
        likes: 8
      },
      {
        id: "kf2",
        username: "Srey",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
        comment: "Visiting the flooded mangrove forests here was the highlight of our trip.",
        likes: 5
      }
    ]
  }
];

export function getDestinationDetails(searchName) {
  if (!searchName) return null;
  const nameClean = searchName.trim().toLowerCase();
  
  // Find match where searchName is included in searchNames list
  const match = destinationsData.find(d => 
    d.searchNames.some(sn => nameClean.includes(sn) || sn.includes(nameClean))
  );

  if (match) return match;

  // Fallback default details if not found
  return {
    id: "default-place",
    name: searchName,
    location: "Cambodia",
    rating: 4,
    img: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&q=80",
    about: `Explore the breathtaking beauty of ${searchName} in Cambodia. Immerse yourself in the rich local culture, historical landmarks, and scenic natural views that make this destination a unique travel experience.`,
    mapSearch: `${searchName}, Cambodia`,
    reviews: [
      {
        id: "def1",
        username: "Ratna",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
        comment: "That looking grate! Highly recommend visiting this wonderful spot.",
        likes: 3
      }
    ]
  };
}
