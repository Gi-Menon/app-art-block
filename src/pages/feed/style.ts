import {StyleSheet} from "react-native";




export const style = StyleSheet.create({
    scrollView:{
        width: '100%',
        flex: 1,
    },
    container:{
        width: '100%',
        justifyContent: 'flex-start',
        paddingVertical: 16,
        backgroundColor: '#8a9eb8',
    },
    grid:{
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    boxTop:{
        width: '100%',
        height: 100,
        backgroundColor: '#8a9eb8',
        alignItems: 'center',
        justifyContent: 'center',
    },
    boxMid:{
        width: '90%',
        height: 800,
        position: 'absolute',
        top: '20%',
        transform: [{translateY: -50}],
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    boxBottom:{
        width: '100%',
        height: 100,
        marginTop: 'auto',
        backgroundColor: '#8a9eb8',
        alignItems: 'center',
        justifyContent: 'center',
    },
    color:{
        color: '#fff',
        fontWeight: 'bold'
    },
     image: {
          width: '48%',
        aspectRatio: 1,
          margin: '1%',
  },

});


