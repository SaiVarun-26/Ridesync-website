/** All copy lives here. Keep it short: the phone tells the story. */

export const hero = {
  titleTop: "Ride Together.",
  titleBottom: "Stay Connected.",
  body: "Real-time rider tracking built for solo riders and riding groups.",
};

export interface Chapter {
  /** Phone screens (indices into SCREENS) this chapter steps through, in order. */
  screens: number[];
  /** One short caption per screen, shown under the line. Optional. */
  captions?: string[];
  /** Slow upward drift of the screen content while this chapter plays (0..0.08). */
  drift?: number;
  eyebrow: string;
  title: string;
  line: string;
}

/**
 * The story. Screen indices follow SCREENS in lib/phone/screens.ts:
 * 0 sign in, 1 home, 2 group, 3 join, 4 loading, 5 pick location, 6 guided or free,
 * 7 route, 8 live ride, 9 start ride, 10 complete, 11-12 history, 13 profile, 14 flex card.
 * The hero shows screen 0.
 */
export const chapters = {
  home: {
    screens: [1],
    eyebrow: "Home",
    title: "Everything starts here.",
    line: "Solo, host or join. One tap.",
  },
  group: {
    screens: [2, 3, 4],
    captions: ["Host a room.", "Join with a code.", "Get ready together."],
    eyebrow: "Group rides",
    title: "Ride together in real time.",
    line: "Share a code. Everyone is in.",
  },
  solo: {
    screens: [5, 6, 7, 8, 9],
    captions: ["Search or drop a pin.", "Guided or free roam.", "Follow the route.", "Turn by turn.", "Slide to start."],
    eyebrow: "Solo rides",
    title: "Press Ride. Start exploring.",
    line: "Guided or free. No setup.",
  },
  complete: {
    screens: [10],
    eyebrow: "Finish",
    title: "Every ride ends well.",
    line: "A small celebration, then your stats.",
  },
  history: {
    screens: [11, 12],
    captions: ["Replay the route.", "See every moment."],
    drift: 0.05,
    eyebrow: "Ride history",
    title: "Every ride becomes a memory.",
    line: "Rename it anytime.",
  },
  profile: {
    screens: [13],
    eyebrow: "Profile",
    title: "Your riding, in numbers.",
    line: "Totals and records, always synced.",
  },
  flex: {
    screens: [14],
    eyebrow: "Share",
    title: "Flex the ride.",
    line: "One card with the route and the stats.",
  },
  open: {
    screens: [14],
    eyebrow: "Open source",
    title: "Built by riders. Built for riders.",
    line: "Flutter • Riverpod • Firebase • OSRM • Photon",
  },
} satisfies Record<string, Chapter>;
export const cta = {
  title: "Ready for your next ride?",
};
