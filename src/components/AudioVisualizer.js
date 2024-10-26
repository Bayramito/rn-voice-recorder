import {Canvas, Path, rect, rrect, Skia} from '@shopify/react-native-skia';
import React, {useEffect} from 'react';
import {Dimensions} from 'react-native';
import {interpolate, useDerivedValue, useSharedValue} from 'react-native-reanimated';

const HEIGHT = 60;
const WIDTH = Dimensions.get('screen').width;
const RECT_WIDTH = 3;
const GAP = 1;

const AudioVisualizer = React.memo(({levels}) => {
  const startTime = useSharedValue(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      startTime.value = Date.now();
    }, 5);

    return () => clearInterval(interval);
  }, [startTime]);

  const path = useDerivedValue(() => {
    const skPath = Skia.Path.Make();
    const currentTime = Date.now();
    for (let i = 0; i < levels.value.length; i++) {
      const elapsedTime = (currentTime - startTime.value) % 5000; // Loop every 5000ms

      const progress = elapsedTime / 5000; // Progress from 0 to 1
      const x = interpolate(
        progress,
        [0, 1],
        [WIDTH - i * (RECT_WIDTH + GAP), -i * (RECT_WIDTH + GAP)],
      );
      const value = levels.value[i];
      const barHeight = aggressiveScale(value) * HEIGHT;
      const y = (HEIGHT - barHeight) / 2;
      skPath.addRRect(rrect(rect(x, y, RECT_WIDTH, barHeight), 5, 5));
    }
    return skPath;
  }, [levels, startTime]);

  return (
    <Canvas style={{height: HEIGHT, width: WIDTH}}>
      <Path path={path} color="red" />
    </Canvas>
  );
});

const aggressiveScale = level => {
  'worklet';
  const scaleFactor = 300; // Adjust this value for more or less aggression
  return level**3 * scaleFactor; // Square the level for more contrast, cap at 1
};

export default AudioVisualizer;
