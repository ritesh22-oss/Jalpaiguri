export const CURRENT_TOUR_VERSION = 1;

export interface TourStepConfig {
  id: string;
  targetId?: string;
  title: string;
  titleBn?: string;
  description: string;
  descriptionBn?: string;
  targetView?: string;
}

export const TOUR_STEPS: TourStepConfig[] = [
  {
    id: 'welcome',
    targetId: 'nav-home',
    title: 'Welcome to MYJPG 👋',
    titleBn: 'MYJPG-তে স্বাগতম 👋',
    description: 'Your Jalpaiguri, Connected. Everything local, trusted, and community-driven in one powerful app.',
    descriptionBn: 'আপনার জলপাইগুড়ি, সংযুক্ত। স্থানীয় সবকিছু, বিশ্বস্ত এবং সম্প্রদায়ের পরিষেবা এক অ্যাপে।',
    targetView: 'home'
  },
  {
    id: 'search',
    targetId: 'home-search-bar',
    title: 'Instant Local Search 🔍',
    titleBn: 'তাৎক্ষণিক স্থানীয় অনুসন্ধান 🔍',
    description: 'Search for workers, doctors, shops, services, and useful local information instantly from the search bar.',
    descriptionBn: 'অনুসন্ধান বার থেকে অবিলম্বে কর্মী, ডাক্তার, দোকান, পরিষেবা এবং দরকারী স্থানীয় তথ্য খুঁজুন।',
    targetView: 'home'
  },
  {
    id: 'emergency',
    targetId: 'nav-help',
    title: 'Emergency & Healthcare 🚨',
    titleBn: 'জরুরি এবং স্বাস্থ্যসেবা 🚨',
    description: 'Access SOS safety alerts, emergency phone numbers, blood donors, and medical services immediately.',
    descriptionBn: 'জরুরি পরিস্থিতিতে এসওএস সতর্কতা, জরুরি ফোন নম্বর, রক্তদাতা এবং চিকিৎসা পরিষেবা পান।',
    targetView: 'blood'
  },
  {
    id: 'shops',
    targetId: 'nav-shops',
    title: 'Shop Marketplace & Merchants 🛍️',
    titleBn: 'দোকান ও বাজার 🛍️',
    description: 'Explore verified Jalpaiguri shops, local products, daily essentials, and merchant storefronts.',
    descriptionBn: 'জলপাইগুড়ির যাচাইকৃত দোকান, স্থানীয় পণ্য, দৈনন্দিন প্রয়োজনীয় জিনিস এবং ব্যবসার বিবরণ দেখুন।',
    targetView: 'shop-marketplace'
  },
  {
    id: 'city_services',
    targetId: undefined,
    title: 'City Transport & Courier 🚌',
    titleBn: 'শহরের পরিবহন ও পার্সেল 🚌',
    description: 'Check NBSTC bus schedules, train timings, courier parcel hubs, and local educational institutions.',
    descriptionBn: 'এনবিএসটিসি বাস সময়সূচী, ট্রেনের সময়, কুরিয়ার পার্সেল হাব এবং স্থানীয় শিক্ষা প্রতিষ্ঠান পরীক্ষা করুন।',
    targetView: 'transport'
  },
  {
    id: 'government',
    targetId: undefined,
    title: 'Government & Civic Services 🏛️',
    titleBn: 'সরকারি ও নাগরিক পরিষেবা 🏛️',
    description: 'Find municipal updates, utility bill portals, government schemes, and report local civic problems.',
    descriptionBn: 'পৌরসভার আপডেট, ইউটিলিটি বিল পোর্টাল, সরকারি স্কিম খুঁজুন এবং স্থানীয় সমস্যা রিপোর্ট করুন।',
    targetView: 'government'
  },
  {
    id: 'discover',
    targetId: 'nav-discover',
    title: 'Explore Places & Community 📍',
    titleBn: 'স্থান ও সম্প্রদায় অন্বেষণ 📍',
    description: 'Discover iconic Jalpaiguri landmarks, local workers, job openings, rentals, and community boards.',
    descriptionBn: 'জলপাইগুড়ির বিখ্যাত স্থান, স্থানীয় কর্মী, চাকরির সুযোগ, ভাড়া এবং কমিউনিটি বোর্ড আবিষ্কার করুন।',
    targetView: 'discover'
  },
  {
    id: 'profile',
    targetId: 'nav-profile',
    title: 'Profile & Language Settings ⚙️',
    titleBn: 'প্রোফাইল ও ভাষা সেটিংস ⚙️',
    description: 'Manage your account, switch between English and Bengali, adjust settings, and replay this tour anytime.',
    descriptionBn: 'আপনার অ্যাকাউন্ট পরিচালনা করুন, ইংরেজি ও বাংলার মধ্যে স্যুইচ করুন এবং যেকোনো সময় ট্যুরটি আবার দেখুন।',
    targetView: 'profile'
  }
];
