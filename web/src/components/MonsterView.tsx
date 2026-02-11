import type { Prayer } from "../core/types";

const SEGMENT_GAP = 2;
const SEGMENT_HEIGHT = 10;
const STACK_WIDTH = 32;
const SEGMENT_INNER_WIDTH = STACK_WIDTH - 4;

type AttackStyle = "Magic" | "Ranged" | "Melee";

function prayerToAttackStyle(p: Prayer): AttackStyle {
  if (p === "Magic") return "Magic";
  if (p === "Missiles") return "Ranged";
  return "Melee";
}

interface MonsterViewProps {
  attackStyle: Prayer;
  isAttacking: boolean;
  tickInCycle: number;
  cycleLength: number;
}

/**
 * Monster attack cycle as stacked segments (matches Android MonsterView).
 * One segment fills per tick; when all full, that tick is the attack.
 * tickInCycle: 0 = attack tick, 1..cycleLength-1 = growing, -1 = inactive.
 */
export function MonsterView({
  attackStyle,
  isAttacking,
  tickInCycle,
  cycleLength,
}: MonsterViewProps) {
  const style = prayerToAttackStyle(attackStyle).toLowerCase();
  const baseFilledCount =
    tickInCycle <= 0 ? 0 : Math.min(tickInCycle, cycleLength);
  const filledCount = isAttacking ? cycleLength : baseFilledCount;

  const totalHeight =
    cycleLength * SEGMENT_HEIGHT + (cycleLength - 1) * SEGMENT_GAP;

  return (
    <div className="monster-column">
      <div
        className={`monster-stack ${isAttacking ? "attacking" : ""}`}
        style={{ minHeight: totalHeight }}
      >
        {Array.from({ length: cycleLength }, (_, index) => {
          const segmentFilled = cycleLength - 1 - index < filledCount;
          return (
            <div
              key={index}
              className={`monster-segment ${style} ${segmentFilled ? "filled" : ""}`}
              style={{
                width: SEGMENT_INNER_WIDTH,
                height: SEGMENT_HEIGHT,
              }}
            />
          );
        })}
      </div>
      <span className="monster-label">
        {attackStyle === "Magic" ? "M" : attackStyle === "Missiles" ? "R" : "L"}
      </span>
    </div>
  );
}

interface MonsterDisplayInfo {
  attackStyle: Prayer;
  tickInCycle: number;
  cycleLength: number;
  isAttacking: boolean;
  isWallUp: boolean;
}

interface MonsterWithWallProps {
  info: MonsterDisplayInfo;
  onKnockDown?: () => void;
}

export function MonsterWithWall({ info, onKnockDown }: MonsterWithWallProps) {
  const label =
    info.attackStyle === "Magic"
      ? "Mage"
      : info.attackStyle === "Missiles"
        ? "Range"
        : "Melee";

  return (
    <div className="monster-column">
      <div style={{ position: "relative" }}>
        <MonsterView
          attackStyle={info.attackStyle}
          isAttacking={info.isAttacking}
          tickInCycle={info.tickInCycle}
          cycleLength={info.cycleLength}
        />
        {info.isWallUp && onKnockDown && (
          <div
            className="monster-wall"
            onClick={onKnockDown}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onKnockDown()}
            aria-label={`Tap to knock down ${label} wall`}
          >
            Tap
          </div>
        )}
      </div>
      <span className="monster-label">{label}</span>
    </div>
  );
}
