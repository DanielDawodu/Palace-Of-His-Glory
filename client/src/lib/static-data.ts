import type { Staff, Programme, Department } from "@shared/schema";

export const STATIC_STAFF: Staff[] = [
  {
    id: "pastor-bright",
    name: "Pastor Bright Oluwole",
    role: "Lead Pastor and General Overseer",
    category: "pastor",
    isLead: true,
    bio: "Pastor Bright Oluwole is the visionary leader and General Overseer of Palace of His Glory International Ministries. A charismatic and dynamic preacher, he is known for his honest and transparent approach to ministry. With a heart ablaze for God and a passion for souls, he has dedicated his life to teaching the undiluted Word of God with clarity and power. His ministry is marked by a strong emphasis on prayer, worship, and raising believers to walk in their God-given purpose and destiny. Pastor Bright's authentic leadership style and commitment to truth have made him a trusted spiritual guide to many.",
    imageUrl: "/pastor-bright.jpg"
  },
  {
    id: "pastor-oluwakemi",
    name: "Pastor Oluwakemi Adesanya",
    role: "Associate Pastor",
    category: "pastor",
    isLead: false,
    imageUrl: "/pastor-oluwakemi.jpg",
    bio: null
  },
  {
    id: "pastor-adewale",
    name: "Pastor Adewale Olusanwo",
    role: "Associate Pastor",
    category: "pastor",
    isLead: false,
    imageUrl: "/pastor-adewale.jpg",
    bio: null
  }
];

export const STATIC_PROGRAMMES: Programme[] = [
  {
    id: "prog-1",
    title: "Sunday School",
    description: "Join us for a time of worship and word.",
    type: "weekly",
    day: "Sunday",
    time: "8:00 AM",
    location: "Main Auditorium"
  },
  {
    id: "prog-2",
    title: "Sunday Service",
    description: "Join us for a time of worship and word.",
    type: "weekly",
    day: "Sunday",
    time: "9:00 AM",
    location: "Main Auditorium"
  },
  {
    id: "prog-3",
    title: "Bible Study",
    description: "Digging deep into the scriptures.",
    type: "weekly",
    day: "Tuesday",
    time: "5:30 PM",
    location: "Main Auditorium"
  },
  {
    id: "prog-4",
    title: "Hour Of Glorification",
    description: "Revival Sessions.",
    type: "weekly",
    day: "Wednesday",
    time: "5:00 PM",
    location: "Main Auditorium"
  },
  {
    id: "prog-5",
    title: "Night of Destiny",
    description: "A powerful night of prophetic prayers and divine encounters.",
    type: "special",
    day: "Every last Friday of the Month",
    time: "11:00 PM",
    location: "Main Sanctuary"
  },
  {
    id: "prog-6",
    title: "Romilowo",
    description: "Every 2nd Saturday of the Month Prayer and sacrifice.",
    type: "special",
    day: "Every 2nd Saturday of the Month",
    time: "5:30 AM - 7:00 AM",
    location: "Main Sanctuary"
  },
  {
    id: "prog-7",
    title: "Youth Summit",
    description: "Empowering the next generation for kingdom impact.",
    type: "special",
    day: "Every 1st Tuesday of the Month",
    time: "5:30 PM",
    location: "Youth Hall"
  },
  {
    id: "prog-8",
    title: "Hosannah Service",
    description: "A special service of praise and victory.",
    type: "special",
    day: "Every 1st Sunday of the Month",
    time: "9:00 AM",
    location: "Main Sanctuary"
  },
  {
    id: "prog-9",
    title: "Impartation Service",
    description: "Divine empowerment and mantle for the week ahead.",
    type: "special",
    day: "Every last Sunday of the Month",
    time: "7:30 AM",
    location: "Main Sanctuary"
  }
];

export const STATIC_DEPARTMENTS: Department[] = [
  {
    id: "dept-1",
    name: "Choir Department",
    leader: "Sis. Adebisi",
    description: "Leading the congregation in worship.",
    imageUrl: null
  },
  {
    id: "dept-2",
    name: "Ushers Department",
    leader: "Sis. Adebanjo",
    description: "Maintaining order and welcoming guests.",
    imageUrl: null
  }
];
