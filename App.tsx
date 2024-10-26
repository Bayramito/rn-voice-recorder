import React from 'react';
import { View} from 'react-native';
import AudioRecorder from './src/components/AudioRecorder';

const App = () => {
  return (
    <View style={{flex:1}}>
      <AudioRecorder />
    </View>
  );
};

export default App;
