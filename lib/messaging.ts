import { db } from "./firebase"
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  onSnapshot,
} from "firebase/firestore"
import type { UserData } from "./firebase"

// Types pour le système de messagerie
export type Message = {
  id: string
  senderId: string
  text: string
  timestamp: Timestamp | Date
  read: boolean
  imageUrl?: string
}

export type Conversation = {
  id: string
  participants: string[] // UIDs des participants
  lastMessage?: {
    text: string
    timestamp: Timestamp | Date
    senderId: string
  }
  unreadCount?: {
    [userId: string]: number
  }
  createdAt: Timestamp | Date
  updatedAt: Timestamp | Date
}

// Créer une nouvelle conversation
export const createConversation = async (currentUserId: string, otherUserId: string): Promise<string> => {
  try {
    // Vérifier si une conversation existe déjà entre ces deux utilisateurs
    const existingConversation = await getConversationBetweenUsers(currentUserId, otherUserId)

    if (existingConversation) {
      return existingConversation.id
    }

    // Créer une nouvelle conversation
    const conversationData = {
      participants: [currentUserId, otherUserId],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      unreadCount: {
        [currentUserId]: 0,
        [otherUserId]: 0,
      },
    }

    const conversationRef = await addDoc(collection(db, "conversations"), conversationData)
    return conversationRef.id
  } catch (error) {
    console.error("Error creating conversation:", error)
    throw error
  }
}

// Obtenir une conversation entre deux utilisateurs
export const getConversationBetweenUsers = async (userId1: string, userId2: string): Promise<Conversation | null> => {
  try {
    const q = query(collection(db, "conversations"), where("participants", "array-contains", userId1))

    const querySnapshot = await getDocs(q)
    let conversation: Conversation | null = null

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      if (data.participants.includes(userId2)) {
        conversation = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
          lastMessage: data.lastMessage
            ? {
                ...data.lastMessage,
                timestamp:
                  data.lastMessage.timestamp instanceof Timestamp
                    ? data.lastMessage.timestamp.toDate()
                    : data.lastMessage.timestamp,
              }
            : undefined,
        } as Conversation
      }
    })

    return conversation
  } catch (error) {
    console.error("Error getting conversation:", error)
    throw error
  }
}

// Obtenir toutes les conversations d'un utilisateur
export const getUserConversations = async (userId: string): Promise<Conversation[]> => {
  try {
    const q = query(collection(db, "conversations"), where("participants", "array-contains", userId))

    const querySnapshot = await getDocs(q)
    const conversations: Conversation[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      conversations.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
        lastMessage: data.lastMessage
          ? {
              ...data.lastMessage,
              timestamp:
                data.lastMessage.timestamp instanceof Timestamp
                  ? data.lastMessage.timestamp.toDate()
                  : data.lastMessage.timestamp,
            }
          : undefined,
      } as Conversation)
    })

    // Trier les conversations côté client par updatedAt
    conversations.sort((a, b) => {
      const dateA = a.updatedAt instanceof Date ? a.updatedAt : new Date()
      const dateB = b.updatedAt instanceof Date ? b.updatedAt : new Date()
      return dateB.getTime() - dateA.getTime() // Tri décroissant (plus récent d'abord)
    })

    return conversations
  } catch (error) {
    console.error("Error getting user conversations:", error)
    throw error
  }
}

// Modifier la fonction sendMessage pour mieux gérer les images
export const sendMessage = async (
  conversationId: string,
  senderId: string,
  text: string,
  imageUrl?: string,
): Promise<string> => {
  try {
    // Ajouter le message à la collection messages
    const messageData: Record<string, any> = {
      conversationId,
      senderId,
      text,
      timestamp: serverTimestamp(),
      read: false,
    }

    // Ajouter l'URL de l'image si elle existe
    if (imageUrl) {
      messageData.imageUrl = imageUrl
    }

    const messageRef = await addDoc(collection(db, "messages"), messageData)

    // Mettre à jour la conversation avec le dernier message
    const conversationRef = doc(db, "conversations", conversationId)
    const conversationDoc = await getDoc(conversationRef)

    if (conversationDoc.exists()) {
      const conversationData = conversationDoc.data()
      const participants = conversationData.participants

      // Mettre à jour le compteur de messages non lus pour les autres participants
      const unreadCount = conversationData.unreadCount || {}
      participants.forEach((participantId: string) => {
        if (participantId !== senderId) {
          unreadCount[participantId] = (unreadCount[participantId] || 0) + 1
        }
      })

      // Créer un texte pour le dernier message qui indique s'il y a une image
      const lastMessageText = imageUrl ? "Image: " + text : text

      await updateDoc(conversationRef, {
        lastMessage: {
          text: lastMessageText,
          timestamp: serverTimestamp(),
          senderId,
        },
        updatedAt: serverTimestamp(),
        unreadCount,
      })
    }

    return messageRef.id
  } catch (error) {
    console.error("Error sending message:", error)
    throw error
  }
}

// Obtenir les messages d'une conversation
export const getConversationMessages = async (conversationId: string): Promise<Message[]> => {
  try {
    // Modifier la requête pour ne pas utiliser orderBy
    const q = query(collection(db, "messages"), where("conversationId", "==", conversationId))

    const querySnapshot = await getDocs(q)
    const messages: Message[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      messages.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate() : data.timestamp,
      } as Message)
    })

    // Trier les messages côté client par timestamp
    messages.sort((a, b) => {
      const timeA = a.timestamp instanceof Date ? a.timestamp.getTime() : 0
      const timeB = b.timestamp instanceof Date ? b.timestamp.getTime() : 0
      return timeA - timeB // Tri croissant (plus ancien d'abord)
    })

    return messages
  } catch (error) {
    console.error("Error getting conversation messages:", error)
    throw error
  }
}

// Marquer les messages comme lus
export const markMessagesAsRead = async (conversationId: string, userId: string): Promise<void> => {
  try {
    // Mettre à jour le compteur de messages non lus
    const conversationRef = doc(db, "conversations", conversationId)
    const conversationDoc = await getDoc(conversationRef)

    if (conversationDoc.exists()) {
      const conversationData = conversationDoc.data()
      const unreadCount = conversationData.unreadCount || {}

      // Réinitialiser le compteur pour cet utilisateur
      unreadCount[userId] = 0

      await updateDoc(conversationRef, { unreadCount })
    }

    // Utiliser une requête plus simple qui ne nécessite pas d'index composite
    // Nous récupérons tous les messages de la conversation, puis filtrons côté client
    const q = query(collection(db, "messages"), where("conversationId", "==", conversationId))

    const querySnapshot = await getDocs(q)

    // Filtrer côté client pour trouver les messages non lus qui ne sont pas envoyés par l'utilisateur
    const batch = querySnapshot.docs
      .filter((doc) => {
        const data = doc.data()
        return data.read === false && data.senderId !== userId
      })
      .map((doc) => updateDoc(doc.ref, { read: true }))

    if (batch.length > 0) {
      await Promise.all(batch)
    }
  } catch (error) {
    console.error("Error marking messages as read:", error)
    throw error
  }
}

// Obtenir le nombre total de messages non lus pour un utilisateur
export const getTotalUnreadMessages = async (userId: string): Promise<number> => {
  try {
    const conversations = await getUserConversations(userId)

    let totalUnread = 0
    conversations.forEach((conversation) => {
      if (conversation.unreadCount && conversation.unreadCount[userId]) {
        totalUnread += conversation.unreadCount[userId]
      }
    })

    return totalUnread
  } catch (error) {
    console.error("Error getting total unread messages:", error)
    throw error
  }
}

// Écouter les changements dans les conversations d'un utilisateur
export const listenToUserConversations = (userId: string, callback: (conversations: Conversation[]) => void) => {
  // Modifier la requête pour ne pas utiliser orderBy
  const q = query(collection(db, "conversations"), where("participants", "array-contains", userId))

  return onSnapshot(q, (querySnapshot) => {
    const conversations: Conversation[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      conversations.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
        lastMessage: data.lastMessage
          ? {
              ...data.lastMessage,
              timestamp:
                data.lastMessage.timestamp instanceof Timestamp
                  ? data.lastMessage.timestamp.toDate()
                  : data.lastMessage.timestamp,
            }
          : undefined,
      } as Conversation)
    })

    // Trier les conversations côté client par updatedAt
    conversations.sort((a, b) => {
      const dateA = a.updatedAt instanceof Date ? a.updatedAt : new Date()
      const dateB = b.updatedAt instanceof Date ? b.updatedAt : new Date()
      return dateB.getTime() - dateA.getTime() // Tri décroissant (plus récent d'abord)
    })

    callback(conversations)
  })
}

// Écouter les messages d'une conversation
export const listenToConversationMessages = (conversationId: string, callback: (messages: Message[]) => void) => {
  // Modifier la requête pour ne pas utiliser orderBy
  const q = query(collection(db, "messages"), where("conversationId", "==", conversationId))

  return onSnapshot(q, (querySnapshot) => {
    const messages: Message[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      messages.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate() : data.timestamp,
      } as Message)
    })

    // Trier les messages côté client par timestamp
    messages.sort((a, b) => {
      const timeA = a.timestamp instanceof Date ? a.timestamp.getTime() : 0
      const timeB = b.timestamp instanceof Date ? b.timestamp.getTime() : 0
      return timeA - timeB // Tri croissant (plus ancien d'abord)
    })

    callback(messages)
  })
}

// Obtenir les informations d'un utilisateur par son ID
export const getUserInfo = async (userId: string): Promise<UserData | null> => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId))
    if (userDoc.exists()) {
      return userDoc.data() as UserData
    }
    return null
  } catch (error) {
    console.error("Error getting user info:", error)
    throw error
  }
}
