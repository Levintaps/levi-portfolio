import { Environment, Lightformer } from '@react-three/drei';

// Made once, when the module loads. drei's Environment redraws its cube map,
// six renders of this lighting scene, whenever its children are a different
// object from last time, so lights written inline would be redrawn on every
// re-render of the badge, such as a change of theme.
const STUDIO_LIGHTS = (
  <>
    <Lightformer intensity={2} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
    <Lightformer intensity={3} color="white" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
    <Lightformer intensity={3} color="white" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
    <Lightformer
      intensity={10}
      color="white"
      position={[-10, 0, 14]}
      rotation={[0, Math.PI / 2, Math.PI / 3]}
      scale={[100, 10, 1]}
    />
  </>
);

/** The soft studio lighting the badge's glossy card reflects. */
export default function LanyardEnvironment() {
  return <Environment blur={0.75}>{STUDIO_LIGHTS}</Environment>;
}
