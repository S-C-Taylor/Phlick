import type { Level, Prayer } from "./types";

function level(build: (l: LevelBuilder) => void): Level {
  const b = new LevelBuilder();
  build(b);
  return b.build();
}

class LevelBuilder {
  number = 1;
  name = "";
  monsters: { attackStyle: Prayer; cycleLength: number; offset: number; isReactive?: boolean }[] = [];
  ticksToSurvive = 16;
  description = "";
  initialPrayerPoints: number | null = null;

  ticks(value: number) {
    this.ticksToSurvive = value;
  }
  prayerPoints(value: number) {
    this.initialPrayerPoints = value;
  }
  monster(attackStyle: Prayer, cycleLength = 4, offset = 0, isReactive = false) {
    this.monsters.push({ attackStyle, cycleLength, offset, isReactive });
  }
  build(): Level {
    return {
      number: this.number,
      name: this.name,
      monsters: this.monsters,
      ticksToSurvive: this.ticksToSurvive,
      description: this.description,
      initialPrayerPoints: this.initialPrayerPoints ?? undefined,
    };
  }
}

export const LEVELS = {
  level1: level((l) => {
    l.number = 1;
    l.name = "First Steps";
    l.description = "Survive a single mage";
    l.ticks(16);
    l.monster("Magic", 4, 0);
  }),
  level2: level((l) => {
    l.number = 2;
    l.name = "Dual Threat";
    l.description = "Mage and ranger attack together";
    l.ticks(20);
    l.monster("Magic", 4, 0);
    l.monster("Missiles", 4, 1);
  }),
  level3: level((l) => {
    l.number = 3;
    l.name = "Saving Prayer";
    l.description = "Only 1 prayer point – turn protection on only when the mage attacks";
    l.ticks(20);
    l.prayerPoints(1);
    l.monster("Magic", 4, 0);
  }),
  level4: level((l) => {
    l.number = 4;
    l.name = "Staggered Line";
    l.description = "Two mages then a ranger";
    l.ticks(24);
    l.monster("Magic", 4, 0);
    l.monster("Magic", 4, 1);
    l.monster("Missiles", 4, 2);
  }),
  level5: level((l) => {
    l.number = 5;
    l.name = "Triple Trouble";
    l.description = "Three monsters, alternating attacks";
    l.ticks(24);
    l.monster("Magic", 4, 0);
    l.monster("Missiles", 4, 1);
    l.monster("Magic", 4, 2);
  }),
  level6: level((l) => {
    l.number = 6;
    l.name = "Two and Two";
    l.description = "Two mages then two rangers";
    l.ticks(32);
    l.monster("Magic", 4, 0);
    l.monster("Magic", 4, 1);
    l.monster("Missiles", 4, 2);
    l.monster("Missiles", 4, 3);
  }),
  level7: level((l) => {
    l.number = 7;
    l.name = "Alternating Wave";
    l.description = "Mage, Range, Mage, Range pattern";
    l.ticks(32);
    l.monster("Magic", 4, 0);
    l.monster("Missiles", 4, 1);
    l.monster("Magic", 4, 2);
    l.monster("Missiles", 4, 3);
  }),
  level8: level((l) => {
    l.number = 8;
    l.name = "The Gauntlet";
    l.description = "Many monsters with tight timing";
    l.ticks(40);
    l.monster("Magic", 4, 0);
    l.monster("Missiles", 4, 1);
    l.monster("Magic", 4, 2);
    l.monster("Missiles", 4, 3);
    l.monster("Magic", 4, 4);
    l.monster("Missiles", 4, 5);
  }),
  level9: level((l) => {
    l.number = 9;
    l.name = "Solo Blob";
    l.description = "A single reactive blob - learn to control it";
    l.ticks(36);
    l.monster("Magic", 6, 0, true);
  }),
  level10: level((l) => {
    l.number = 10;
    l.name = "Blob Duo";
    l.description = "Two reactive blobs offset by one tick";
    l.ticks(36);
    l.monster("Magic", 6, 0, true);
    l.monster("Magic", 6, 1, true);
  }),
  level11: level((l) => {
    l.number = 11;
    l.name = "Manipulate the Blob";
    l.description = "A mage and a reactive blob – show a prayer 3 ticks before it attacks to make it match the mage";
    l.ticks(36);
    l.monster("Magic", 6, 0, true);
    l.monster("Magic", 4, 1);
  }),
  level12: level((l) => {
    l.number = 12;
    l.name = "Triple Threat";
    l.description = "A reactive blob, mage, and ranger - alternate prayers each tick";
    l.ticks(36);
    l.monster("Magic", 6, 0, true);
    l.monster("Magic", 4, 1);
    l.monster("Missiles", 4, 2);
  }),
  level13: level((l) => {
    l.number = 13;
    l.name = "Prayer Conservation";
    l.description = "Limited prayer points – only flick on attack ticks";
    l.ticks(32);
    l.prayerPoints(3);
    l.monster("Magic", 4, 0);
    l.monster("Missiles", 4, 1);
    l.monster("Magic", 4, 2);
    l.monster("Missiles", 4, 3);
  }),
  level14: level((l) => {
    l.number = 14;
    l.name = "The Test";
    l.description = "Ultimate challenge combining all skills";
    l.ticks(48);
    l.monster("Magic", 6, 0, true);
    l.monster("Magic", 4, 1);
    l.monster("Missiles", 4, 2);
    l.monster("Magic", 6, 3, true);
    l.monster("Missiles", 4, 4);
  }),
};

export const ALL_LEVELS = [
  LEVELS.level1, LEVELS.level2, LEVELS.level3, LEVELS.level4, LEVELS.level5,
  LEVELS.level6, LEVELS.level7, LEVELS.level8, LEVELS.level9, LEVELS.level10,
  LEVELS.level11, LEVELS.level12, LEVELS.level13, LEVELS.level14,
];
