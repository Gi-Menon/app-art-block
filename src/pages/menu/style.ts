import {StyleSheet} from "react-native";




export const style = StyleSheet.create({
    container:{
        flex:1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    boxMenu:{
        height: 100,
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 20,
        alignItems: 'flex-end',
        paddingBottom: 10,
    },
    drawerButton: {
        backgroundColor: 'transparent',
        padding: 0,
    },
    menuButton: {
        backgroundColor: 'transparent',
        padding: 8,
    },
    boxTop:{
        width: '100%',
        height: 200,
        backgroundColor: '#8a9eb8',
        alignItems: 'center',
        justifyContent: 'center',
    },
    boxMid:{
        width: '0%',
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
        backgroundColor: '#b4d8f8',
        alignItems: 'center',
        justifyContent: 'center',
    },
    color:{
         color: '#fff',
         fontWeight: 'bold',
         fontSize: 17,
    },
    

});


