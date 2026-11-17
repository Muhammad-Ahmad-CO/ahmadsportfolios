// Dot-matrix icons for the dock switches — a style adaptation of the
// "Dot Matrix" toggle (design 04) from the reference reel: bold, chunky
// dot grids, no fine detail, so each glyph stays readable at the 12px
// render size inside the 26px/22px choice circles.
//
// Every icon uses fill="currentColor", so the existing choice-circle state
// coloring (dim when inactive, #0C0C0C when aria-checked) keeps working
// unchanged. Grid: 5x5, dot centres at 2/6/10/14/18 on a 20x20 viewBox.

export interface DotMatrixIconProps {
  className?: string;
  /** Accepted for call-site compatibility; dot icons have no stroke. */
  strokeWidth?: number;
}

type Dot = readonly [number, number];

function Grid({
  dots,
  small = [],
  className,
}: {
  dots: Dot[];
  small?: Dot[];
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      {dots.map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={1.6} />
      ))}
      {small.map(([cx, cy]) => (
        <circle key={`s${cx}-${cy}`} cx={cx} cy={cy} r={1.1} />
      ))}
    </svg>
  );
}

/** Light theme: filled starburst sun — the reel's orange-yellow sun dot grid. */
export function DotMatrixSunIcon({ className }: DotMatrixIconProps) {
  return (
    <Grid
      className={className}
      dots={[
        [2, 2], [10, 2], [18, 2],
        [6, 6], [10, 6], [14, 6],
        [2, 10], [6, 10], [10, 10], [14, 10], [18, 10],
        [6, 14], [10, 14], [14, 14],
        [2, 18], [10, 18], [18, 18],
      ]}
    />
  );
}

/** Dark theme: crescent moon opening right, plus one small star dot. */
export function DotMatrixMoonIcon({ className }: DotMatrixIconProps) {
  return (
    <Grid
      className={className}
      dots={[
        [6, 2], [10, 2], [14, 2],
        [2, 6], [6, 6],
        [2, 10],
        [2, 14], [6, 14],
        [6, 18], [10, 18], [14, 18],
      ]}
      small={[[18, 6]]}
    />
  );
}

/** Eye-protection theme: almond eye outline with a centre pupil dot. */
export function DotMatrixEyeIcon({ className }: DotMatrixIconProps) {
  return (
    <Grid
      className={className}
      dots={[
        [6, 2], [10, 2], [14, 2],
        [2, 6], [18, 6],
        [2, 10], [10, 10], [18, 10],
        [2, 14], [18, 14],
        [6, 18], [10, 18], [14, 18],
      ]}
    />
  );
}

/** Digital clock: display panel outline with two centre colon dots. */
export function DotMatrixDigitalIcon({ className }: DotMatrixIconProps) {
  return (
    <Grid
      className={className}
      dots={[
        [2, 2], [6, 2], [10, 2], [14, 2], [18, 2],
        [2, 6], [10, 6], [18, 6],
        [2, 10], [18, 10],
        [2, 14], [10, 14], [18, 14],
        [2, 18], [6, 18], [10, 18], [14, 18], [18, 18],
      ]}
    />
  );
}

/** Analog clock: ring of dots with hands pointing up and right (3:00). */
export function DotMatrixAnalogIcon({ className }: DotMatrixIconProps) {
  return (
    <Grid
      className={className}
      dots={[
        [6, 2], [10, 2], [14, 2],
        [2, 6], [10, 6], [18, 6],
        [2, 10], [10, 10], [14, 10], [18, 10],
        [2, 14], [18, 14],
        [6, 18], [10, 18], [14, 18],
      ]}
    />
  );
}
