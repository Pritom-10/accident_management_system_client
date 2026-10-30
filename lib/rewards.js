import {
  Award,
  BadgeCheck,
  Droplet,
  HeartHandshake,
  Medal,
  Siren,
  Star,
  Trophy,
} from "lucide-react";

export const BADGES = {
  first_drop: {
    label: "First drop",
    desc: "Gave blood once",
    icon: Droplet,
    tone: "bg-rose-100 text-rose-600",
  },
  life_saver: {
    label: "Life saver",
    desc: "Gave blood 5 times",
    icon: Award,
    tone: "bg-rose-100 text-rose-600",
  },
  hero: {
    label: "Blood hero",
    desc: "Gave blood 10 times",
    icon: Trophy,
    tone: "bg-amber-100 text-amber-600",
  },
  first_responder: {
    label: "First responder",
    desc: "Arrived at an SOS",
    icon: Siren,
    tone: "bg-indigo-100 text-indigo-600",
  },
  rescuer: {
    label: "Rescuer",
    desc: "Arrived at 5 SOS alerts",
    icon: Medal,
    tone: "bg-indigo-100 text-indigo-600",
  },
  generous: {
    label: "Generous",
    desc: "Helped 3 campaigns",
    icon: HeartHandshake,
    tone: "bg-emerald-100 text-emerald-600",
  },
  trusted: {
    label: "Trusted",
    desc: "ID checked by an admin",
    icon: BadgeCheck,
    tone: "bg-emerald-100 text-emerald-600",
  },
  loved: {
    label: "Loved",
    desc: "Rated 4.5 or more by 3 people",
    icon: Star,
    tone: "bg-amber-100 text-amber-600",
  },
};

export const RULES = [
  ["Blood donation confirmed", 100],
  ["Arrived at an SOS", 20],
  ["Campaign donation confirmed", 10],
  ["ID verified", 50],
];
