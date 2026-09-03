import React from "react";
import {
  Text, 
  View,
  StyleSheet

} from 'react-native'

import { style } from "./style";

export default function menu () {
  return (
      <View style={style.container} >
        <View style={style.boxTop}>
          <Text style={style.color}></Text>
        </View>

        <View style={style.boxMid}>
           <Text style={style.color}>Menu</Text>
        </View>

        <View style={style.boxBottom}>
           <Text style={style.color}>Menu</Text>
        </View>
      </View>
  );
}