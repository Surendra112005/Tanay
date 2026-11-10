import React, { Suspense, useState, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Points, PointMaterial, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { Sliders } from "lucide-react";

// Color mappings for different emotions
const GLOW_COLORS = {
  joy: "#e5c048",      // Gold
  sadness: "#3b82f6",  // Blue
  anger: "#ef4444",    // Red
  fear: "#a855f7",     // Purple
  love: "#ec4899",     // Pink
  lonely: "#14b8a6",   // Teal
  stress: "#f97316",   // Orange
  neutral: "#d4af37"   // Gold default
};

// Subcomponent: Attempt to render GLB Model
function GlbModel({ url, state, scaleFactor, offsetX, offsetY, offsetZ, onError }) {
  try {
    const { scene, animations } = useGLTF(url);
    const modelRef = useRef();
    const mixer = useRef();
    const currentAction = useRef(null);
    const baseScale = useRef(1.0);

    // Auto-center and auto-scale model to fit the viewport nicely
    React.useEffect(() => {
      if (scene) {
        // Reset position and scale temporarily to compute raw bounding box
        scene.position.set(0, 0, 0);
        scene.scale.set(1, 1, 1);
        scene.updateMatrixWorld(true);

        const box = new THREE.Box3().setFromObject(scene);
        const size = new THREE.Vector3();
        box.getSize(size);
        const center = new THREE.Vector3();
        box.getCenter(center);

        const maxDim = Math.max(size.x, size.y, size.z);

        // Check if dimensions are valid and finite
        if (maxDim > 0 && isFinite(maxDim) && isFinite(center.x) && isFinite(center.y) && isFinite(center.z)) {
          baseScale.current = scaleFactor / maxDim;

          // Apply centered position plus custom user offsets
          scene.position.x = -center.x + offsetX;
          scene.position.y = -center.y + offsetY;
          scene.position.z = -center.z + offsetZ;
          
          scene.updateMatrixWorld(true);
        }
      }
    }, [scene, scaleFactor, offsetX, offsetY, offsetZ]);

    // Setup animations dynamically based on state
    React.useEffect(() => {
      if (scene && animations && animations.length > 0) {
        if (!mixer.current) {
          mixer.current = new THREE.AnimationMixer(scene);
        }

        const stateLower = state.toLowerCase();
        console.log(`GLB Model State: ${stateLower}. Available animations:`, animations.map(a => a.name));

        // Find the best matching animation name
        let activeAnim = null;

        // Match specific state names
        activeAnim = animations.find(a => a.name.toLowerCase().includes(stateLower));

        // Fallbacks for speech interaction states
        if (!activeAnim) {
          if (stateLower === "listening") {
            // Try to find idle or look-around animation
            activeAnim = animations.find(a =>
              a.name.toLowerCase().includes("idle") ||
              a.name.toLowerCase().includes("listen") ||
              a.name.toLowerCase().includes("look")
            );
          } else if (stateLower === "talking") {
            // Try to find speaking/mouth movements
            activeAnim = animations.find(a =>
              a.name.toLowerCase().includes("talk") ||
              a.name.toLowerCase().includes("speak") ||
              a.name.toLowerCase().includes("mouth")
            );
          } else if (["happy", "sad", "angry", "fearful"].includes(stateLower)) {
            const emotionMap = {
              happy: "joy",
              sad: "sadness",
              angry: "anger",
              fearful: "fear"
            };
            const mappedName = emotionMap[stateLower];
            activeAnim = animations.find(a => a.name.toLowerCase().includes(mappedName));
          }
        }

        // If still no animation found, fall back to the first available animation
        if (!activeAnim) {
          activeAnim = animations[0];
        }

        if (activeAnim) {
          const nextAction = mixer.current.clipAction(activeAnim);

          if (currentAction.current !== nextAction) {
            // Fade out previous action and fade in new action
            if (currentAction.current) {
              currentAction.current.fadeOut(0.3);
            }
            nextAction.reset().fadeIn(0.3).play();
            currentAction.current = nextAction;
          }
        }
      }
      return () => {
        // Cleanup if scene changes or component unmounts
      };
    }, [scene, animations, state]);

    // Update mixer and pulse model (rotation removed)
    useFrame((stateObj, delta) => {
      if (mixer.current) mixer.current.update(delta);
      if (modelRef.current) {
        // Emotional pulsing adjustments
        const time = stateObj.clock.getElapsedTime();
        const pulse = baseScale.current * (1.0 + Math.sin(time * 2) * 0.02);
        modelRef.current.scale.set(pulse, pulse, pulse);
      }
    });

    return (
      <primitive
        ref={modelRef}
        object={scene}
        onError={onError}
      />
    );
  } catch (err) {
    if (err instanceof Promise || (err && typeof err.then === "function")) {
      throw err;
    }
    console.error("Failed to load GLTF model:", err);
    onError();
    return null;
  }
}

// Subcomponent: Beautiful Golden Cyber Orb (Fallback)
function FallbackOrb({ emotionState, chatState }) {
  const orbRef = useRef();
  const particlesRef = useRef();

  // Build particle points
  const particleCount = 250;
  const positions = React.useMemo(() => {
    const arr = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const theta = THREE.MathUtils.randFloat(0, Math.PI * 2);
      const phi = THREE.MathUtils.randFloat(0, Math.PI);
      const distance = THREE.MathUtils.randFloat(1.4, 2.8);

      arr[i * 3] = distance * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = distance * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = distance * Math.cos(phi);
    }
    return arr;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const activeColor = GLOW_COLORS[emotionState] || GLOW_COLORS.neutral;

    if (orbRef.current) {
      // 1. Core Orb Rotation
      orbRef.current.rotation.y = time * 0.15;
      orbRef.current.rotation.x = time * 0.08;

      // 2. State-based scale pulsing
      let pulseFreq = 1.5;
      let pulseAmp = 0.05;

      if (chatState === "listening") {
        pulseFreq = 6.0;
        pulseAmp = 0.08;
      } else if (chatState === "talking") {
        pulseFreq = 4.0 + Math.sin(time * 10) * 2.0; // Vocal cadence simulation
        pulseAmp = 0.12;
      } else if (emotionState === "anger") {
        pulseFreq = 12.0;
        pulseAmp = 0.08;
      } else if (emotionState === "sadness") {
        pulseFreq = 0.6;
        pulseAmp = 0.02;
      } else if (emotionState === "joy") {
        pulseFreq = 3.5;
        pulseAmp = 0.08;
      }

      const pulse = 1.0 + Math.sin(time * pulseFreq) * pulseAmp;

      // Shaking for anger
      if (emotionState === "anger") {
        orbRef.current.position.x = Math.sin(time * 60) * 0.02;
        orbRef.current.position.y = Math.cos(time * 60) * 0.02;
      } else {
        orbRef.current.position.x = 0;
        orbRef.current.position.y = Math.sin(time * 0.8) * 0.05; // Floating effect
      }

      orbRef.current.scale.set(pulse, pulse, pulse);

      // Update material color dynamically
      orbRef.current.material.color.lerp(new THREE.Color(activeColor), 0.1);
      orbRef.current.material.emissive.lerp(new THREE.Color(activeColor), 0.1);
    }

    if (particlesRef.current) {
      // Rotate particles shell
      particlesRef.current.rotation.y = -time * 0.05;
      particlesRef.current.rotation.x = time * 0.02;
    }
  });

  const activeColorStr = GLOW_COLORS[emotionState] || GLOW_COLORS.neutral;

  return (
    <group>
      {/* Outer Floating Particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color={activeColorStr}
          size={0.06}
          sizeAttenuation={true}
          transparent={true}
          opacity={0.6}
        />
      </points>

      {/* Main Luxury Cyber Sphere */}
      <mesh ref={orbRef}>
        <icosahedronGeometry args={[1, 3]} />
        <meshStandardMaterial
          color={activeColorStr}
          wireframe={true}
          roughness={0.1}
          metalness={0.9}
          emissive={activeColorStr}
          emissiveIntensity={0.8}
          transparent={true}
          opacity={0.85}
        />
      </mesh>

      {/* Glowing Inner Core */}
      <mesh scale={0.4}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent={true}
          opacity={0.3}
        />
      </mesh>
    </group>
  );
}

export default function Avatar3D({ emotion = "neutral", state = "idle" }) {
  const [loadFailed, setLoadFailed] = useState(false);
  const [showControls, setShowControls] = useState(false);

  // Load axis adjustments from localStorage or use defaults
  const [scaleFactor, setScaleFactor] = useState(() => {
    return parseFloat(localStorage.getItem("tanay_3d_scale") || "2.6");
  });
  const [offsetX, setOffsetX] = useState(() => {
    return parseFloat(localStorage.getItem("tanay_3d_offset_x") || "0.0");
  });
  const [offsetY, setOffsetY] = useState(() => {
    return parseFloat(localStorage.getItem("tanay_3d_offset_y") || "-1.4");
  });
  const [offsetZ, setOffsetZ] = useState(() => {
    return parseFloat(localStorage.getItem("tanay_3d_offset_z") || "0.0");
  });

  const activeColor = GLOW_COLORS[emotion] || GLOW_COLORS.neutral;

  return (
    <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
      {/* Background Glowing Aura Effect */}
      <div
        className="absolute w-80 h-80 rounded-full golden-aura pointer-events-none transition-all duration-[2000ms]"
        style={{
          background: `radial-gradient(circle, ${activeColor}22 0%, rgba(0,0,0,0) 70%)`
        }}
      />

      {/* 3D Calibration Control Panel */}
      <div className="absolute right-4 top-4 z-20 flex flex-col items-end">
        <button
          onClick={() => setShowControls(prev => !prev)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-luxury-gold/30 bg-black/40 text-luxury-gold text-xs font-semibold backdrop-blur-md shadow-gold-glow hover:bg-luxury-gold/10 transition-all cursor-pointer"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{showControls ? "Hide Controls" : "Calibrate 3D Axis"}</span>
        </button>

        {showControls && (
          <div className="mt-2 w-64 p-4 rounded-xl border border-luxury-gold/20 bg-black/90 text-white backdrop-blur-md shadow-gold-glow flex flex-col gap-3 text-xs z-30">
            <h4 className="font-bold text-luxury-gold uppercase tracking-wider text-[10px] border-b border-luxury-gold/10 pb-1.5">
              3D Axis Calibration
            </h4>
            
            {/* Scale Slider */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between font-mono text-[10px] text-neutral-400">
                <span>Model Scale:</span>
                <span className="text-luxury-gold font-bold">{scaleFactor.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.1"
                value={scaleFactor}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setScaleFactor(val);
                  localStorage.setItem("tanay_3d_scale", val.toString());
                }}
                className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-luxury-gold"
              />
            </div>

            {/* X Offset Slider */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between font-mono text-[10px] text-neutral-400">
                <span>Offset X (Horizontal):</span>
                <span className="text-luxury-gold font-bold">{offsetX.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="-3.0"
                max="3.0"
                step="0.05"
                value={offsetX}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setOffsetX(val);
                  localStorage.setItem("tanay_3d_offset_x", val.toString());
                }}
                className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-luxury-gold"
              />
            </div>

            {/* Y Offset Slider */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between font-mono text-[10px] text-neutral-400">
                <span>Offset Y (Vertical):</span>
                <span className="text-luxury-gold font-bold">{offsetY.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="-3.0"
                max="3.0"
                step="0.05"
                value={offsetY}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setOffsetY(val);
                  localStorage.setItem("tanay_3d_offset_y", val.toString());
                }}
                className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-luxury-gold"
              />
            </div>

            {/* Z Offset Slider */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between font-mono text-[10px] text-neutral-400">
                <span>Offset Z (Depth):</span>
                <span className="text-luxury-gold font-bold">{offsetZ.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="-3.0"
                max="3.0"
                step="0.05"
                value={offsetZ}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setOffsetZ(val);
                  localStorage.setItem("tanay_3d_offset_z", val.toString());
                }}
                className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-luxury-gold"
              />
            </div>
            
            <button
              onClick={() => {
                setScaleFactor(2.6);
                setOffsetX(0.0);
                setOffsetY(-1.4);
                setOffsetZ(0.0);
                localStorage.setItem("tanay_3d_scale", "2.6");
                localStorage.setItem("tanay_3d_offset_x", "0.0");
                localStorage.setItem("tanay_3d_offset_y", "-1.4");
                localStorage.setItem("tanay_3d_offset_z", "0.0");
              }}
              className="mt-1 py-1 rounded bg-luxury-gold/10 border border-luxury-gold/30 hover:bg-luxury-gold/20 text-luxury-gold font-semibold text-[10px] uppercase transition-all cursor-pointer text-center"
            >
              Reset to Default
            </button>
          </div>
        )}
      </div>

      {/* 3D Canvas rendering */}
      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 45 }}
        className="w-full h-full bg-transparent z-10 cursor-grab active:cursor-grabbing"
      >
        <ambientLight intensity={0.4} />

        {/* Colorful Spotlights that match emotions */}
        <pointLight
          position={[5, 5, 5]}
          intensity={1.2}
          color={activeColor}
        />
        <pointLight
          position={[-5, -5, -5]}
          intensity={0.5}
          color="#ffffff"
        />
        <directionalLight
          position={[0, 5, 2]}
          intensity={1.0}
          color="#ffffff"
        />

        <Suspense fallback={null}>
          {!loadFailed ? (
            <GlbModel
              url="/models/talking_main.glb"
              state={state}
              scaleFactor={scaleFactor}
              offsetX={offsetX}
              offsetY={offsetY}
              offsetZ={offsetZ}
              onError={() => setLoadFailed(true)}
            />
          ) : (
            <FallbackOrb
              emotionState={emotion}
              chatState={state}
            />
          )}
        </Suspense>

        <OrbitControls
          enableZoom={true}
          minDistance={2.5}
          maxDistance={7}
          enablePan={false}
          autoRotate={false}
          enableRotate={false}
        />
      </Canvas>
    </div>
  );
}
