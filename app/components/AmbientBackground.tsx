import { ThreeBackground } from './ThreeBackground';

export function AmbientBackground() {
  return (
    <>
      <canvas id="bgCanvas"></canvas>
      <div className="aurora-bg">
        <div className="aurora-orb"></div>
      </div>
      <ThreeBackground />
    </>
  );
}
