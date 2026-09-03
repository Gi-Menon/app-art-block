import {StyleSheet} from "react-native";




export const style = StyleSheet.create({
    container:{
        flex:1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: '#8a9eb8',
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
        position: 'absolute',
        top: 100,
        bottom: 100,
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
    }

});


