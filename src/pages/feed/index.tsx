import React from "react";
import {useState} from 'react';
import {Image,ScrollView,View} from "react-native"
import {style} from "./style";

const images = [
  require('./imagens/tetoris-kasane-teto.gif'),
  require('./imagens/teto.jpg'),
  require('./imagens/miku.png'),
  require('./imagens/tetoris-kasane-teto.gif'),
  require('./imagens/teto.jpg'),
  require('./imagens/miku.png'),
  require('./imagens/tetoris-kasane-teto.gif'),
  require('./imagens/teto.jpg'),
  require('./imagens/miku.png'),
  require('./imagens/tetoris-kasane-teto.gif'),
  require('./imagens/teto.jpg'),
  require('./imagens/miku.png'),
  require('./imagens/tetoris-kasane-teto.gif'),
  require('./imagens/teto.jpg'),
];

export default function Feed(){
  return (
    <ScrollView
      style={style.scrollView}
      contentContainerStyle={style.container}
      showsVerticalScrollIndicator
    >
      <View style={style.grid}>
        {images.map((source, index) => (
          <Image key={index} source={source} style={style.image} />
        ))}
      </View>
    </ScrollView>
  );
}
