import React from "react";
import {useState} from 'react';
import {Image,ScrollView,View} from "react-native"
import {style} from "./style";

const animacao = [
    require('./imagens/tetoris-kasane-teto.gif'),
    require('./imagens/tetoris-kasane-teto.gif'),
    require('./imagens/tetoris-kasane-teto.gif'),
    require('./imagens/tetoris-kasane-teto.gif'),
    require('./imagens/tetoris-kasane-teto.gif'),
    require('./imagens/tetoris-kasane-teto.gif'),
    require('./imagens/tetoris-kasane-teto.gif'),
    require('./imagens/tetoris-kasane-teto.gif'),
    require('./imagens/tetoris-kasane-teto.gif'),
    require('./imagens/tetoris-kasane-teto.gif'),
    require('./imagens/tetoris-kasane-teto.gif'),
    require('./imagens/tetoris-kasane-teto.gif'),
    require('./imagens/tetoris-kasane-teto.gif'),
    require('./imagens/tetoris-kasane-teto.gif'),
    require('./imagens/tetoris-kasane-teto.gif'),
    require('./imagens/tetoris-kasane-teto.gif'),
    require('./imagens/tetoris-kasane-teto.gif'),
    require('./imagens/tetoris-kasane-teto.gif'),
    require('./imagens/tetoris-kasane-teto.gif'),

];

export default function Animacao(){
  return (
    <ScrollView
      style={style.scrollView}
      contentContainerStyle={style.container}
      showsVerticalScrollIndicator
    >
      <View style={style.grid}>
        {animacao.map((source, index) => (
          <Image key={index} source={source} style={style.image} />
        ))}
      </View>
    </ScrollView>
  );
}
