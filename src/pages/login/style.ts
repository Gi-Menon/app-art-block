import {StyleSheet} from "react-native";




export const style = StyleSheet.create({
    container:{
        flex:1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    boxTop:{
        width: '100%',
        height: 100,
        backgroundColor: '#f8b4b4',
        alignItems: 'center',
        justifyContent: 'center',
    },
    boxMid:{
        width: '90%',
        height: 100,
        position: 'absolute',
        top: '50%',
        transform: [{translateY: -50}],
        backgroundColor: '#b4d8f8',
        alignItems: 'center',
        justifyContent: 'center',
    },
    boxBottom:{
        width: '100%',
        height: 100,
        marginTop: 'auto',
        backgroundColor: '#b8e6c1',
        alignItems: 'center',
        justifyContent: 'center',
    },
    color:{
        color: '#fff',

    }

});


