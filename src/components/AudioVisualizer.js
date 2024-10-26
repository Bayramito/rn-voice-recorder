import {Canvas, RoundedRect} from '@shopify/react-native-skia';
import React, {useEffect, useState} from 'react';
import {Dimensions} from 'react-native';
import {interpolate, useDerivedValue} from 'react-native-reanimated';

const HEIGHT = 60;
const WIDTH = Dimensions.get('screen').width;
const RECT_WIDTH = 3;
const GAP = 1;

const AudioVisualizer = ({levels}) => {
  const [startTime, setStartTime] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => {
      setStartTime(Date.now());
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <Canvas style={{height: HEIGHT, width: WIDTH,}} mode={'continuous'}>
      {levels.map((value, index) => {
        return (
          <Candle
            value={value}
            key={index}
            index={index}
            startTime={startTime}
          />
        );
      })}
    </Canvas>
  );
};

const Candle = ({value, index, startTime}) => {
  const x = useDerivedValue(() => {
    const elapsedTime = (Date.now() - startTime) % 5000; // Loop every 5000ms
    const progress = elapsedTime / 5000; // Progress from 0 to 1

    return interpolate(
      progress,
      [0, 1],
      [WIDTH - index * (RECT_WIDTH + GAP), -index * (RECT_WIDTH + GAP)],
    );
  });
  const barHeight = aggressiveScale(value) * HEIGHT;
  const y = (HEIGHT - barHeight) / 2;
  return (
    <RoundedRect
      r={10}
      key={index}
      x={x}
      y={y}
      width={RECT_WIDTH}
      height={barHeight}
      color="red"
    />
  );
};

export default AudioVisualizer;

const aggressiveScale = level => {
  const scaleFactor = 200; // Adjust this value for more or less aggression
  return Math.pow(level, 3) * scaleFactor; // Cube the level for more contrast
};
