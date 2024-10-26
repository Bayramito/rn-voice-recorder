import {decode} from 'qs/lib/utils';
import {useEffect, useState} from 'react';
import {Dimensions, PermissionsAndroid, Platform} from 'react-native';
import AudioRecord from 'react-native-audio-record';
import {useSharedValue} from 'react-native-reanimated';

const HEIGHT = 60;
const WIDTH = Dimensions.get('screen').width;
const RECT_WIDTH = 3;
const GAP = 1; // Define a gap between each Rect
const bufferSize = Math.floor(WIDTH / (RECT_WIDTH + GAP));
const requestPermissions = async () => {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      {
        title: 'Microphone Permission',
        message: 'This app needs access to your microphone to record audio.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true;
};

const useAudio = () => {
  const [recording, setRecording] = useState(false);
  const levels = useSharedValue([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [filePath, setFilePath] = useState(null);

  const startRecording = async () => {
    const permissionGranted = await requestPermissions();
    if (!permissionGranted) return;

    AudioRecord.init({
      sampleRate: 16000, // default 44100
      channels: 1, // 1 or 2, default 1
      bitsPerSample: 16, // 8 or 16, default 16
      wavFile: 'test.wav', // default 'audio.wav'
    });

    AudioRecord.start();
    setRecording(true);
  };

  const stopRecording = async () => {
    if (recording) {
      const audioFile = await AudioRecord.stop();
      setFilePath(audioFile);
      console.log('Recording stopped and stored at', audioFile);
    }
    setRecording(false);
  };

  const toggleRecording = async () => {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateLevel = async () => {
    if (!recording) return;

    await AudioRecord.on('data', data => {
      // handle the recorded data here, we could calculate the sound levels using data
      const db = calculateDbFromAudioBuffer(data); // implement your dB calculation logic here
      const linearValue = dBToLinear(db);

      levels.value = [linearValue, ...levels.value].slice(0, bufferSize);
    });
  };

  useEffect(() => {
    const interval = setInterval(updateLevel, 100);
    return () => clearInterval(interval);
  }, [recording, updateLevel]);

  useEffect(() => {
    let interval;
    if (recording) {
      interval = setInterval(() => {
        setRecordingTime(prevTime => prevTime + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [recording]);

  return {
    recording,
    levels,
    recordingTime,
    toggleRecording,
    filePath,
  };
};

export default useAudio;

// Decode the base64-encoded audio buffer and calculate dB level from it
const calculateDbFromAudioBuffer = base64Data => {
  // Step 1: Decode base64 string to a binary buffer using react-native-base64
  const binaryString = decode(base64Data);
  const binaryLen = binaryString.length;
  const bytes = new Uint8Array(binaryLen);

  // Convert binary string to Uint8Array
  for (let i = 0; i < binaryLen; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Step 2: Convert the Uint8Array to Int16Array (assuming 16-bit PCM audio)
  const audioBuffer = new Int16Array(bytes.buffer);

  // Step 3: Calculate RMS (Root Mean Square) of the audio buffer
  const calculateRMS = (buffer) => {
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) {
      sum += buffer[i] * buffer[i];
    }
    const rms = Math.sqrt(sum / buffer.length);
    return rms;
  };

  const rms = calculateRMS(audioBuffer);

  // Step 4: Convert RMS to dB
  const maxAmplitude = 32767; // Max amplitude for 16-bit PCM
  const decibels = 20 * Math.log10(rms / maxAmplitude);

  // Handle case where RMS is 0 (silence)
  return isFinite(decibels) ? decibels : -Infinity; // -Infinity represents silence
};

// Convert dB value to a linear scale (0 to 1)
const dBToLinear = (db) => {
  // Convert to linear and apply aggressive scaling
  let linearValue = Math.pow(10, db / 20);

  // Apply threshold to ignore very small values
  const threshold = 0.01; // Adjust to control minimum sensitivity
  if (linearValue < threshold) {
    linearValue = 0; // Silence or very quiet sounds
  }

  // Apply more aggressive scaling
  const aggressiveScaling = 5; // Higher scaling for exaggerated peaks
  linearValue = Math.pow(linearValue, aggressiveScaling);

  return linearValue;
};
