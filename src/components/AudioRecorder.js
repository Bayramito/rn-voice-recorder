import {Dimensions, Pressable, StyleSheet, Text, View} from 'react-native';
import useAudio from '../hooks/recorder';
import AudioVisualizer from './AudioVisualizer';
const {width: SCREEN_WIDTH} = Dimensions.get('window');
const AudioRecorder = () => {
  const {recording, levels, recordingTime, toggleRecording} = useAudio();
  return (
    <View style={styles.container}>
      <AudioVisualizer width={SCREEN_WIDTH} levels={levels.value} height={50} />
      <View style={styles.controls}>
        <Pressable style={styles.btn} onPress={toggleRecording}>
          <Text style={styles.text}>{recording ? 'Stop' : 'Record'}</Text>
        </Pressable>
        <Text style={styles.timer}>
          {Math.floor(recordingTime / 60)
            .toString()
            .padStart(2, '0')}
          :{(recordingTime % 60).toString().padStart(2, '0')}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    backgroundColor:"rebeccapurple"
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  timer: {
    fontSize: 24,
    marginLeft: 20,
    color:"white"
  },
  btn:{
    backgroundColor:"lightblue",
    padding:10
  },
  text:{
  }
});

export default AudioRecorder;
