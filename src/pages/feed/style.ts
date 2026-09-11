import { StyleSheet } from "react-native";

export const style = StyleSheet.create({
    scrollView: {
        width: '100%',
        flex: 1,
        backgroundColor: '#8a9eb8',
    },
    container: {
        width: '100%',
        flexGrow: 1,
        justifyContent: 'flex-start',
        paddingTop: 112,
        paddingBottom: 16,
        backgroundColor: '#8a9eb8',
    },
    grid: {
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    boxTop: {
        width: '100%',
        height: 100,
        backgroundColor: '#8a9eb8',
        alignItems: 'center',
        justifyContent: 'center',
    },
    boxMid: {
        width: '90%',
        height: 800,
        position: 'absolute',
        top: '20%',
        transform: [{ translateY: -50 }],
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    boxBottom: {
        width: '100%',
        height: 100,
        marginTop: 'auto',
        backgroundColor: '#8a9eb8',
        alignItems: 'center',
        justifyContent: 'center',
    },
    color: {
        color: '#fff',
        fontWeight: 'bold'
    },
    image: {
        width: '48%',
        aspectRatio: 1,
        margin: '1%',
    },
    post: {
        width: '94%',
        marginHorizontal: '3%',
        marginBottom: 12,
        padding: 16,
        backgroundColor: '#ffffff',
        borderRadius: 12,
    },
    author: {
        color: '#2d3748',
        fontSize: 17,
        fontWeight: '700',
    },
    handle: {
        color: '#718096',
        marginTop: 2,
    },
    text: {
        color: '#1a202c',
        fontSize: 16,
        marginTop: 12,
    },
    actionsRow: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    actionButton: {
        backgroundColor: '#e2e8f0',
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 8,
    },
    actionButtonActive: {
        backgroundColor: '#bfdbfe',
    },
    actionButtonText: {
        color: '#1f2937',
        fontWeight: '600',
    },
    actionButtonTextActive: {
        color: '#1d4ed8',
    },
    likes: {
        color: '#718096',
    },
    commentsCount: {
        color: '#4b5563',
        fontWeight: '600',
        marginTop: 8,
    },
    commentsBox: {
        backgroundColor: '#f8fafc',
        borderRadius: 8,
        marginTop: 12,
        padding: 10,
    },
    commentItem: {
        borderBottomColor: '#e2e8f0',
        borderBottomWidth: 1,
        paddingBottom: 8,
        paddingTop: 8,
    },
    commentItemFirst: {
        paddingTop: 0,
    },
    commentAuthor: {
        color: '#1f2937',
        fontWeight: '700',
    },
    commentText: {
        color: '#374151',
        marginTop: 4,
    },
    commentInputRow: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 8,
        marginTop: 12,
    },
    commentInput: {
        backgroundColor: '#f8fafc',
        borderColor: '#cbd5e1',
        borderRadius: 8,
        borderWidth: 1,
        color: '#1f2937',
        flex: 1,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    commentButton: {
        backgroundColor: '#8a9eb8',
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    commentButtonText: {
        color: '#ffffff',
        fontWeight: '700',
    },
    loginHint: {
        color: '#4b5563',
        marginTop: 12,
    },
    postImage: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 8,
        marginTop: 12,
    },
    message: {
        color: '#ffffff',
        padding: 24,
        textAlign: 'center',
    },
    newPostButton: {
        alignSelf: 'flex-end',
        backgroundColor: '#ffffff',
        borderRadius: 18,
        marginHorizontal: '3%',
        marginBottom: 14,
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    newPostButtonText: {
        color: '#38465a',
        fontWeight: '700',
    },
    modalBackdrop: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.35)',
    },
    modalBox: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        padding: 20,
    },
    modalTitle: {
        color: '#2d3748',
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 12,
    },
    postInput: {
        borderColor: '#cbd5e0',
        borderRadius: 8,
        borderWidth: 1,
        color: '#1a202c',
        minHeight: 80,
        padding: 12,
        textAlignVertical: 'top',
    },
    previewImage: {
        borderRadius: 8,
        height: 180,
        marginTop: 12,
        width: '100%',
    },
    secondaryButton: {
        alignItems: 'center',
        borderColor: '#8a9eb8',
        borderRadius: 8,
        borderWidth: 1,
        marginTop: 12,
        padding: 12,
    },
    secondaryButtonText: {
        color: '#38465a',
        fontWeight: '600',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 16,
    },
    cancelButton: {
        justifyContent: 'center',
        marginRight: 16,
        padding: 12,
    },
    publishButton: {
        backgroundColor: '#8a9eb8',
        borderRadius: 8,
        paddingHorizontal: 18,
        paddingVertical: 12,
    },
    publishButtonText: {
        color: '#ffffff',
        fontWeight: '700',
    },
});


