import React, { useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Box, PointerLockControls, useTexture } from '@react-three/drei';
import * as THREE from 'three';

const Bullet = ({ position, direction }) => {
  const ref = useRef();
  useFrame(() => {
    ref.current.position.add(direction.multiplyScalar(0.2));
  });
  return <mesh ref={ref} position={position}>
    <sphereGeometry args={[0.1, 32, 32]} />
    <meshBasicMaterial color="yellow" />
  </mesh>;
};

const Target = ({ position, onHit }) => {
  return (
    <Box position={position} args={[1, 1, 1]} onClick={onHit}>
      <meshStandardMaterial color="red" />
    </Box>
  );
};

const Player = ({ onShoot }) => {
  const { camera } = useThree();
  const [bullets, setBullets] = useState([]);

  const shoot = () => {
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    const newBullet = {
      id: Date.now(),
      position: camera.position.clone(),
      direction: direction,
    };
    setBullets(prev => [...prev, newBullet]);
    onShoot(newBullet);
  };

  useFrame(() => {
    setBullets(prev => prev.filter(bullet => {
      const distance = bullet.position.distanceTo(camera.position);
      return distance < 100;
    }));
  });

  return (
    <>
      {bullets.map(bullet => (
        <Bullet key={bullet.id} position={bullet.position} direction={bullet.direction} />
      ))}
      <mesh onClick={shoot}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshBasicMaterial color="black" />
      </mesh>
    </>
  );
};

const MarsGround = () => {
  const texture = useTexture('/mars-surface.jpg');
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
      <planeGeometry args={[1000, 1000]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
};

const MarsRock = ({ position }) => {
  return (
    <mesh position={position}>
      <dodecahedronGeometry args={[Math.random() * 2 + 1, 0]} />
      <meshStandardMaterial color="#8B4513" roughness={0.8} />
    </mesh>
  );
};

const Game = () => {
  const [targets, setTargets] = useState([
    { id: 1, position: [15, 0, -15] },
    { id: 2, position: [-15, 0, -15] },
    { id: 3, position: [0, 5, -20] },
  ]);

  const [score, setScore] = useState(0);

  const handleHit = (id) => {
    setTargets(prev => prev.filter(target => target.id !== id));
    setScore(prev => prev + 1);
  };

  const handleShoot = (bullet) => {
    targets.forEach(target => {
      const targetPosition = new THREE.Vector3(...target.position);
      const distance = bullet.position.distanceTo(targetPosition);
      if (distance < 1) {
        handleHit(target.id);
      }
    });
  };

  return (
    <div className="w-full h-screen">
      <div className="absolute top-0 left-0 p-4 text-white z-10">Score: {score}</div>
      <Canvas camera={{ fov: 75, near: 0.1, far: 1000, position: [0, 1.6, 0] }}>
        <color attach="background" args={['#FFA07A']} />
        <fog attach="fog" args={['#FFA07A', 10, 50]} />
        <ambientLight intensity={0.2} />
        <directionalLight position={[1, 1, 1]} intensity={0.8} />
        <Player onShoot={handleShoot} />
        {targets.map(target => (
          <Target key={target.id} position={target.position} onHit={() => handleHit(target.id)} />
        ))}
        <MarsGround />
        {[...Array(50)].map((_, i) => (
          <MarsRock key={i} position={[Math.random() * 100 - 50, 0, Math.random() * 100 - 50]} />
        ))}
        <PointerLockControls />
      </Canvas>
    </div>
  );
};

export default Game;
