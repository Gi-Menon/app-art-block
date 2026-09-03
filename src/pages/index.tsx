import React from "react";
import Feed from "./feed";
import {
  Text, 
  View,
  StyleSheet

} from 'react-native'


import { style } from "./style";

export default function Divs() {
  return (
      <View style={[style.container]} >
        <Feed/>
      </View>
  );
}