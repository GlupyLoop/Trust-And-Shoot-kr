// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
import { getAnalytics } from "firebase/analytics"
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  type User,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  sendEmailVerification,
  fetchSignInMethodsForEmail,
  sendPasswordResetEmail, // Ajout de l'import pour la réinitialisation de mot de passe
} from "firebase/auth"
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  Timestamp,
  deleteDoc,
  limit,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore"
// Importez deleteObject de firebase/storage
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCVy-pj1wLnHAgdRPRFDt9yqoWO7CGuIrw",
  authDomain: "trust-and-shoot-4f3ca.firebaseapp.com",
  projectId: "trust-and-shoot-4f3ca",
  storageBucket: "trust-and-shoot-4f3ca.firebasestorage.app",
  messagingSenderId: "26944841368",
  appId: "1:26944841368:web:34c74ab72768164bf512ed",
  measurementId: "G-1H5MMNPVQW",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

// Initialize Analytics only on client side
let analytics
if (typeof window !== "undefined") {
  analytics = getAnalytics(app)
}

// User type with role
export type UserRole = "photographer" | "cosplayer"

// Base user data
export type UserData = {
  uid: string
  email: string | null
  displayName?: string | null
  role: UserRole
  createdAt: Date
  profileComplete?: boolean
  photoURL?: string
  bio?: string
  location?: string
  phoneNumber?: string
  website?: string
  emailVerified?: boolean
  socialMedia?: {
    instagram?: string
    facebook?: string
    twitter?: string
    tiktok?: string
    linkedin?: string
  }
}

// Review type
export type Review = {
  id: string
  userId: string
  userName: string
  userPhotoURL?: string
  userRole?: string
  targetId: string // This can be either photographerId or cosplayerId
  targetType: "photographer" | "cosplayer" // Add this to distinguish between target types
  rating: number
  title: string
  comment: string
  date: Date | Timestamp
  likes?: number
  dislikes?: number
  experienceDate?: string
}

// Convention type
export type Convention = {
  id: string
  name: string
  location: string
  startDate: Date | Timestamp
  endDate: Date | Timestamp
  description: string
  imageUrl?: string
  website?: string
  category?: string
  createdAt: Date | Timestamp
}

// TimeSlot type
export type TimeSlot = {
  id: string
  photographerId: string
  conventionId: string
  date: Date | Timestamp
  startTime: string
  endTime: string
  status: "available" | "booked"
  bookedBy?: string
  bookedByName?: string
  price?: number
  notes?: string
  location?: string
  createdAt: Date | Timestamp
}

// Photographer specific data
export type PhotographerData = UserData & {
  specialties?: string[]
  tags?: {
    photographyType?: string[]
    experience?: string[]
    location?: string[]
    services?: string[]
    equipment?: string[]
    pricing?: string[]
  }
  equipment?: string[]
  experience?: string
  pricing?: {
    hourlyRate?: number
    packages?: Array<{
      name: string
      description: string
      price: number
    }>
  }
  portfolio?: Array<{
    id: string
    url: string
    title?: string
    description?: string
  }>
  availability?: {
    days?: string[]
    hours?: string
  }
  reviews?: Array<Review>
  averageRating?: number
  totalReviews?: number
  ratingDistribution?: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
  conventions?: string[] // IDs of conventions the photographer will attend
  favoriteCosplayers?: string[] // IDs of cosplayers the photographer has favorited
}

// Cosplayer specific data
export type CosplayerData = UserData & {
  costumes?: Array<{
    name: string
    character: string
    series: string
    description?: string
    images?: string[]
  }>
  preferences?: {
    shootingStyles?: string[]
    locations?: string[]
    availability?: string[]
  }
  measurements?: {
    height?: string
    weight?: string
    bust?: string
    waist?: string
    hips?: string
  }
  experience?: string
  portfolio?: Array<{
    id: string
    url: string
    title?: string
    description?: string
    photographer?: string
  }>
  favoritePhotographers?: string[] // Ajout de cette propriété pour stocker les IDs des photographes favoris
  // Add rating fields to match photographer data structure
  reviews?: Array<Review>
  averageRating?: number
  totalReviews?: number
  ratingDistribution?: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
}

// Type pour les résultats de l'authentification Google
export type GoogleAuthResult = {
  user: User | null
  isNewUser: boolean
  emailExists?: boolean
  error?: string
  profileComplete?: boolean
}

// Fonction pour envoyer un email de vérification avec diagnostics améliorés
export const sendVerificationEmail = async (user: User): Promise<void> => {
  try {
    console.log("Attempting to send verification email to:", user.email)
    console.log("User emailVerified status:", user.emailVerified)
    console.log("User providerData:", user.providerData)

    // Vérifier si l'utilisateur existe et n'est pas déjà vérifié
    if (!user) {
      throw new Error("No user provided")
    }

    if (user.emailVerified) {
      console.log("User email is already verified")
      return
    }

    // Construire l'URL de continuation
    const continueUrl =
      typeof window !== "undefined" ? `${window.location.origin}/login` : "https://trust-and-shoot.vercel.app/login"

    console.log("Continue URL:", continueUrl)

    // Configuration de l'email de vérification
    const actionCodeSettings = {
      url: continueUrl,
      handleCodeInApp: false, // L'utilisateur sera redirigé vers l'URL après vérification
    }

    // Envoyer l'email de vérification
    await sendEmailVerification(user, actionCodeSettings)
    console.log("Verification email sent successfully to:", user.email)
  } catch (error: any) {
    console.error("Detailed error sending verification email:", {
      code: error.code,
      message: error.message,
      stack: error.stack,
      userEmail: user?.email,
      userUid: user?.uid,
    })

    // Fournir des messages d'erreur plus spécifiques
    let errorMessage = "Erreur lors de l'envoi de l'email de vérification"

    switch (error.code) {
      case "auth/too-many-requests":
        errorMessage = "Trop de demandes d'email envoyées. Veuillez attendre quelques minutes avant de réessayer."
        break
      case "auth/user-disabled":
        errorMessage = "Ce compte utilisateur a été désactivé."
        break
      case "auth/user-not-found":
        errorMessage = "Utilisateur non trouvé."
        break
      case "auth/invalid-email":
        errorMessage = "Adresse email invalide."
        break
      case "auth/network-request-failed":
        errorMessage = "Erreur de connexion réseau. Vérifiez votre connexion internet."
        break
      case "auth/internal-error":
        errorMessage = "Erreur interne du serveur. Veuillez réessayer plus tard."
        break
      default:
        if (error.message) {
          errorMessage = `Erreur: ${error.message}`
        }
    }

    const enhancedError = new Error(errorMessage)
    enhancedError.name = error.code || "EmailVerificationError"
    throw enhancedError
  }
}

// Nouvelle fonction pour envoyer un email de réinitialisation de mot de passe
export const sendPasswordResetEmailToUser = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email, {
      url:
        typeof window !== "undefined" ? `${window.location.origin}/login` : "https://trust-and-shoot.vercel.app/login",
    })
  } catch (error) {
    console.error("Error sending password reset email:", error)
    throw error
  }
}

// Modifiez la fonction registerUser pour une meilleure gestion d'erreur
export const registerUser = async (
  email: string,
  password: string,
  role: UserRole,
  displayName?: string,
): Promise<UserData> => {
  try {
    console.log("Starting user registration for:", email)

    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    console.log("User created successfully:", user.uid)

    // Create user profile in Firestore first
    const userData: UserData = {
      uid: user.uid,
      email: user.email,
      displayName: displayName || user.displayName,
      role,
      createdAt: new Date(),
      profileComplete: false,
      emailVerified: false,
    }

    await setDoc(doc(db, "users", user.uid), userData)
    console.log("User profile created in Firestore")

    // Attendre un court délai avant d'envoyer l'email
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Envoyer un email de vérification
    try {
      await sendVerificationEmail(user)
      console.log("Verification email sent successfully during registration")
    } catch (emailError: any) {
      console.error("Failed to send verification email during registration:", emailError)
      // Ne pas faire échouer l'inscription, mais logger l'erreur
      // L'utilisateur pourra renvoyer l'email plus tard
    }

    return userData
  } catch (error: any) {
    console.error("Error during user registration:", {
      code: error.code,
      message: error.message,
      email: email,
    })
    throw error
  }
}

// Sign in existing user
export const signInUser = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return userCredential.user
  } catch (error) {
    console.error("Error signing in:", error)
    throw error
  }
}

// Sign out user
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth)
  } catch (error) {
    console.error("Error signing out:", error)
    throw error
  }
}

// Vérifier si un email existe déjà
export const checkEmailExists = async (email: string): Promise<string[]> => {
  try {
    return await fetchSignInMethodsForEmail(auth, email)
  } catch (error) {
    console.error("Error checking email:", error)
    throw error
  }
}

// Nouvelle implémentation de l'authentification Google avec popup et rôle prédéfini
export const signInWithGoogle = async (role?: UserRole): Promise<GoogleAuthResult> => {
  try {
    const provider = new GoogleAuthProvider()
    provider.addScope("email")
    provider.addScope("profile")

    // Utiliser signInWithPopup au lieu de signInWithRedirect
    const result = await signInWithPopup(auth, provider)
    const user = result.user

    // Vérifier si l'utilisateur existe déjà dans Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid))
    const isNewUser = !userDoc.exists()

    // Si c'est un nouvel utilisateur et qu'un rôle est fourni, créer le profil
    if (isNewUser && role) {
      // Créer le profil utilisateur avec le rôle sélectionné
      // Pour Google, on considère que l'email est déjà vérifié
      await createOrUpdateUserData(user, role, {
        emailVerified: true, // Marquer l'email comme vérifié pour les utilisateurs Google
        displayName: user.displayName || undefined,
        photoURL: user.photoURL || undefined,
      })
    } else if (isNewUser && !role) {
      // Nouvel utilisateur sans rôle spécifié (ne devrait pas arriver avec la nouvelle UI)
      return {
        user: null,
        isNewUser: true,
        error: "Role selection is required for new users",
      }
    } else {
      // Utilisateur existant - mettre à jour l'état de vérification d'email si nécessaire
      const userData = userDoc.data() as UserData
      if (!userData.emailVerified) {
        await updateDoc(doc(db, "users", user.uid), {
          emailVerified: true, // Toujours marquer l'email comme vérifié pour les utilisateurs Google
          displayName: user.displayName || userData.displayName,
          photoURL: user.photoURL || userData.photoURL,
        })
      }
    }

    // Récupérer les données utilisateur mises à jour
    const userData = await getUserData(user.uid)
    const profileComplete = userData?.profileComplete || false

    return {
      user,
      isNewUser,
      profileComplete,
    }
  } catch (error: any) {
    console.error("Erreur lors de l'authentification Google:", error)

    // Vérifier si l'erreur est due à un email déjà utilisé
    if (error.code === "auth/account-exists-with-different-credential") {
      const email = error.customData?.email
      if (email) {
        return {
          user: null,
          isNewUser: false,
          emailExists: true,
          error: `Un compte existe déjà avec l'adresse email ${email}. Veuillez vous connecter avec votre mot de passe.`,
        }
      }
    }

    return {
      user: null,
      isNewUser: false,
      error: error.message || "Erreur lors de l'authentification Google",
    }
  }
}

// Sign in with Facebook
export const signInWithFacebook = async (role?: UserRole): Promise<GoogleAuthResult> => {
  try {
    const provider = new FacebookAuthProvider()
    provider.addScope("email")
    provider.addScope("public_profile")

    // Utiliser signInWithPopup au lieu de signInWithRedirect
    const result = await signInWithPopup(auth, provider)
    const user = result.user

    // Vérifier si l'utilisateur existe déjà dans Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid))
    const isNewUser = !userDoc.exists()

    // Si c'est un nouvel utilisateur et qu'un rôle est fourni, créer le profil
    if (isNewUser && role) {
      // Créer le profil utilisateur avec le rôle sélectionné
      // Pour Facebook, on considère que l'email est déjà vérifié
      await createOrUpdateUserData(user, role, {
        emailVerified: true, // Marquer l'email comme vérifié pour les utilisateurs Facebook
        displayName: user.displayName || undefined,
        photoURL: user.photoURL || undefined,
      })
    } else if (isNewUser && !role) {
      // Nouvel utilisateur sans rôle spécifié (ne devrait pas arriver avec la nouvelle UI)
      return {
        user: null,
        isNewUser: true,
        error: "Role selection is required for new users",
      }
    } else {
      // Utilisateur existant - mettre à jour l'état de vérification d'email si nécessaire
      const userData = userDoc.data() as UserData
      if (!userData.emailVerified) {
        await updateDoc(doc(db, "users", user.uid), {
          emailVerified: true, // Toujours marquer l'email comme vérifié pour les utilisateurs Facebook
          displayName: user.displayName || userData.displayName,
          photoURL: user.photoURL || userData.photoURL,
        })
      }
    }

    // Récupérer les données utilisateur mises à jour
    const userData = await getUserData(user.uid)
    const profileComplete = userData?.profileComplete || false

    return {
      user,
      isNewUser,
      profileComplete,
    }
  } catch (error: any) {
    console.error("Erreur lors de l'authentification Facebook:", error)

    // Vérifier si l'erreur est due à un email déjà utilisé
    if (error.code === "auth/account-exists-with-different-credential") {
      const email = error.customData?.email
      if (email) {
        return {
          user: null,
          isNewUser: false,
          emailExists: true,
          error: `Un compte existe déjà avec cette adresse email ${email}. Veuillez vous connecter avec votre mot de passe.`,
        }
      }
    }

    return {
      user: null,
      isNewUser: false,
      error: error.message || "Erreur lors de l'authentification Facebook",
    }
  }
}

// Create or update user data in Firestore
export const createOrUpdateUserData = async (
  user: User,
  role: UserRole,
  additionalData: Partial<UserData> = {},
): Promise<UserData> => {
  try {
    // Check if user already exists
    const userDocRef = doc(db, "users", user.uid)
    const userDoc = await getDoc(userDocRef)

    if (userDoc.exists()) {
      // Update existing user
      const updatedData = {
        ...additionalData,
        role,
        updatedAt: new Date(),
      }

      await updateDoc(userDocRef, updatedData)

      return {
        ...(userDoc.data() as UserData),
        ...updatedData,
      } as UserData
    } else {
      // Create new user
      const userData: UserData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL || undefined,
        role,
        createdAt: new Date(),
        profileComplete: false, // Ne pas marquer automatiquement comme complet pour les utilisateurs Google
        emailVerified: true, // Pour les authentifications sociales, on considère l'email comme vérifié
        ...additionalData,
      }

      await setDoc(userDocRef, userData)
      return userData
    }
  } catch (error) {
    console.error("Error creating/updating user data:", error)
    throw error
  }
}

// Get user data from Firestore
export const getUserData = async (uid: string): Promise<UserData | null> => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid))
    if (userDoc.exists()) {
      return userDoc.data() as UserData
    }
    return null
  } catch (error) {
    console.error("Error getting user data:", error)
    throw error
  }
}

// Get user by ID (alias for getUserData for consistency)
export const getUserById = async (uid: string): Promise<UserData | null> => {
  return getUserData(uid)
}

// Update photographer profile
export const updatePhotographerProfile = async (
  uid: string,
  profileData: Partial<PhotographerData>,
): Promise<PhotographerData> => {
  try {
    const userDocRef = doc(db, "users", uid)

    // Add updatedAt timestamp
    const dataToUpdate = {
      ...profileData,
      updatedAt: new Date(),
      profileComplete: true,
    }

    await updateDoc(userDocRef, dataToUpdate)

    // Get the updated document
    const updatedDoc = await getDoc(userDocRef)
    return updatedDoc.data() as PhotographerData
  } catch (error) {
    console.error("Error updating photographer profile:", error)
    throw error
  }
}

// Update cosplayer profile
export const updateCosplayerProfile = async (
  uid: string,
  profileData: Partial<CosplayerData>,
): Promise<CosplayerData> => {
  try {
    const userDocRef = doc(db, "users", uid)

    // Add updatedAt timestamp
    const dataToUpdate = {
      ...profileData,
      updatedAt: new Date(),
      profileComplete: true,
    }

    await updateDoc(userDocRef, dataToUpdate)

    // Get the updated document
    const updatedDoc = await getDoc(userDocRef)
    return updatedDoc.data() as CosplayerData
  } catch (error) {
    console.error("Error updating cosplayer profile:", error)
    throw error
  }
}

// Upload image to Firebase Storage
export const uploadImage = async (file: File, path: string): Promise<string> => {
  try {
    const storageRef = ref(storage, path)
    await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(storageRef)
    return downloadURL
  } catch (error) {
    console.error("Error uploading image:", error)
    throw error
  }
}

// Add portfolio item
export const addPortfolioItem = async (
  uid: string,
  role: UserRole,
  imageFile: File,
  metadata: { title?: string; description?: string; photographer?: string },
): Promise<string> => {
  try {
    // Generate a unique ID for the portfolio item
    const itemId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

    // Upload the image to Firebase Storage
    const imagePath = `${role}s/${uid}/portfolio/${itemId}`
    const imageUrl = await uploadImage(imageFile, imagePath)

    // Get the user document
    const userDocRef = doc(db, "users", uid)
    const userDoc = await getDoc(userDocRef)

    if (!userDoc.exists()) {
      throw new Error("User not found")
    }

    const userData = userDoc.data() as UserData

    // Add the portfolio item
    const portfolioItem = {
      id: itemId,
      url: imageUrl,
      title: metadata.title || "",
      description: metadata.description || "",
      ...(role === "cosplayer" && { photographer: metadata.photographer || "" }),
      createdAt: new Date(),
    }

    // Update the user document with the new portfolio item
    await updateDoc(userDocRef, {
      portfolio: userData.portfolio ? [...userData.portfolio, portfolioItem] : [portfolioItem],
    })

    return itemId
  } catch (error) {
    console.error("Error adding portfolio item:", error)
    throw error
  }
}

// Get photographers
export const getPhotographers = async (limit = 10): Promise<PhotographerData[]> => {
  try {
    const q = query(collection(db, "users"), where("role", "==", "photographer"), where("profileComplete", "==", true))

    const querySnapshot = await getDocs(q)
    const photographers: PhotographerData[] = []

    querySnapshot.forEach((doc) => {
      photographers.push(doc.data() as PhotographerData)
    })

    return photographers.slice(0, limit)
  } catch (error) {
    console.error("Error getting photographers:", error)
    throw error
  }
}

// Get cosplayers
export const getCosplayers = async (limit = 10): Promise<CosplayerData[]> => {
  try {
    const q = query(collection(db, "users"), where("role", "==", "cosplayer"), where("profileComplete", "==", true))

    const querySnapshot = await getDocs(q)
    const cosplayers: CosplayerData[] = []

    querySnapshot.forEach((doc) => {
      cosplayers.push(doc.data() as CosplayerData)
    })

    return cosplayers.slice(0, limit)
  } catch (error) {
    console.error("Error getting cosplayers:", error)
    throw error
  }
}

// Fonction pour obtenir les éléments du portfolio
export const getPortfolioItems = async (
  uid: string,
): Promise<
  Array<{
    id: string
    url: string
    title?: string
    description?: string
    photographer?: string
    createdAt: Date
  }>
> => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid))
    if (!userDoc.exists()) {
      throw new Error("User not found")
    }

    const userData = userDoc.data()
    return userData.portfolio || []
  } catch (error) {
    console.error("Error getting portfolio items:", error)
    throw error
  }
}

// Fonction pour supprimer un élément du portfolio
export const deletePortfolioItem = async (uid: string, itemId: string): Promise<void> => {
  try {
    // Get the user document
    const userDocRef = doc(db, "users", uid)
    const userDoc = await getDoc(userDocRef)

    if (!userDoc.exists()) {
      throw new Error("User not found")
    }

    const userData = userDoc.data()
    const portfolio = userData.portfolio || []

    // Find the item to delete
    const itemToDelete = portfolio.find((item: any) => item.id === itemId)

    if (!itemToDelete) {
      throw new Error("Portfolio item not found")
    }

    // Delete the image from storage if it exists
    try {
      const imageRef = ref(storage, itemToDelete.storagePath)
      await deleteObject(imageRef)
    } catch (storageError) {
      console.warn("Could not delete image from storage:", storageError)
      // Continue with deletion from database even if storage deletion fails
    }

    // Update the portfolio array
    const updatedPortfolio = portfolio.filter((item: any) => item.id !== itemId)

    // Update the user document
    await updateDoc(userDocRef, {
      portfolio: updatedPortfolio,
    })
  } catch (error) {
    console.error("Error deleting portfolio item:", error)
    throw error
  }
}

// Fonction pour mettre à jour les détails d'un élément du portfolio
export const updatePortfolioItemDetails = async (
  uid: string,
  itemId: string,
  details: {
    title?: string
    description?: string
    photographer?: string
  },
): Promise<void> => {
  try {
    // Get the user document
    const userDocRef = doc(db, "users", uid)
    const userDoc = await getDoc(userDocRef)

    if (!userDoc.exists()) {
      throw new Error("User not found")
    }

    const userData = userDoc.data()
    const portfolio = userData.portfolio || []

    // Find the item to update
    const itemIndex = portfolio.findIndex((item: any) => item.id === itemId)

    if (itemIndex === -1) {
      throw new Error("Portfolio item not found")
    }

    // Update the item
    portfolio[itemIndex] = {
      ...portfolio[itemIndex],
      ...details,
      updatedAt: new Date(),
    }

    // Update the user document
    await updateDoc(userDocRef, {
      portfolio: portfolio,
    })
  } catch (error) {
    console.error("Error updating portfolio item details:", error)
    throw error
  }
}

// Modify the addReview function to handle both photographer and cosplayer reviews
export const addReview = async (reviewData: Omit<Review, "id">): Promise<Review> => {
  try {
    console.log("Adding review with data:", reviewData)

    // Create a reference to the reviews collection
    const reviewsCollectionRef = collection(db, "reviews")

    // Prepare the data, replacing undefined with null or omitting them
    const cleanedData: Record<string, any> = {
      userId: reviewData.userId,
      userName: reviewData.userName,
      targetId: reviewData.targetId,
      targetType: reviewData.targetType,
      rating: reviewData.rating,
      title: reviewData.title,
      comment: reviewData.comment,
      date: serverTimestamp(),
      likes: 0,
      dislikes: 0,
    }

    // Add optional fields only if they're not undefined
    if (reviewData.userPhotoURL !== undefined) {
      cleanedData.userPhotoURL = reviewData.userPhotoURL
    }

    if (reviewData.userRole !== undefined) {
      cleanedData.userRole = reviewData.userRole
    }

    if (reviewData.experienceDate !== undefined) {
      cleanedData.experienceDate = reviewData.experienceDate
    }

    console.log("Cleaned data for Firestore:", cleanedData)

    // Add the review to the collection
    const reviewDoc = await addDoc(reviewsCollectionRef, cleanedData)
    console.log("Review added with ID:", reviewDoc.id)

    // Create the return object with ID and a JavaScript date
    const reviewWithId = {
      id: reviewDoc.id,
      ...reviewData,
      date: new Date(), // Use current date for immediate display
      likes: 0,
      dislikes: 0,
    } as Review

    // Update the target's rating stats
    if (reviewData.targetType === "photographer") {
      await updatePhotographerRatingStats(reviewData.targetId)
    } else if (reviewData.targetType === "cosplayer") {
      await updateCosplayerRatingStats(reviewData.targetId)
    }

    console.log("Review successfully added and stats updated")
    return reviewWithId
  } catch (error) {
    console.error("Error adding review:", error)
    throw error
  }
}

// Modify the deleteReview function to handle both photographer and cosplayer reviews with better error handling
export const deleteReview = async (reviewId: string): Promise<void> => {
  try {
    console.log("Attempting to delete review with ID:", reviewId)

    // Get the review to get the target ID and type
    const reviewRef = doc(db, "reviews", reviewId)
    const reviewDoc = await getDoc(reviewRef)

    if (!reviewDoc.exists()) {
      console.error("Review not found with ID:", reviewId)
      throw new Error("Review not found")
    }

    const reviewData = reviewDoc.data()
    const targetId = reviewData.targetId
    const targetType = reviewData.targetType

    console.log("Deleting review for target:", targetId, "type:", targetType)

    // Delete the review
    await deleteDoc(reviewRef)
    console.log("Review document deleted successfully")

    // Update the target's rating stats
    if (targetType === "photographer") {
      await updatePhotographerRatingStats(targetId)
      console.log("Photographer rating stats updated")
    } else if (targetType === "cosplayer") {
      await updateCosplayerRatingStats(targetId)
      console.log("Cosplayer rating stats updated")
    }

    console.log("Review deletion completed successfully")
    return
  } catch (error) {
    console.error("Error deleting review:", error)
    throw error
  }
}

// Add this function to get cosplayer reviews with better error handling
export const getCosplayerReviews = async (cosplayerId: string, reviewLimit = 50): Promise<Review[]> => {
  try {
    console.log("Fetching reviews for cosplayer:", cosplayerId)

    const reviewsQuery = query(
      collection(db, "reviews"),
      where("targetId", "==", cosplayerId),
      where("targetType", "==", "cosplayer"),
    )

    const querySnapshot = await getDocs(reviewsQuery)
    const reviews: Review[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      reviews.push({
        id: doc.id,
        ...data,
        date: data.date instanceof Timestamp ? data.date.toDate() : data.date,
      } as Review)
    })

    console.log(`Found ${reviews.length} reviews for cosplayer ${cosplayerId}`)

    // Sort reviews by date descending (newest first)
    reviews.sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date.getTime() : new Date(a.date).getTime()
      const dateB = b.date.getTime() instanceof Date ? b.date.getTime() : new Date(b.date).getTime()
      return dateB - dateA
    })

    // Limit the number of results after sorting
    return reviews.slice(0, reviewLimit)
  } catch (error) {
    console.error("Error getting cosplayer reviews:", error)
    throw error
  }
}

// Add this function to update cosplayer rating stats with better error handling
export const updateCosplayerRatingStats = async (cosplayerId: string): Promise<void> => {
  try {
    console.log("Updating rating stats for cosplayer:", cosplayerId)

    // Get all reviews for the cosplayer
    const reviewsQuery = query(
      collection(db, "reviews"),
      where("targetId", "==", cosplayerId),
      where("targetType", "==", "cosplayer"),
    )

    const querySnapshot = await getDocs(reviewsQuery)
    const reviews: Review[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      reviews.push({
        id: doc.id,
        ...data,
        date: data.date instanceof Timestamp ? data.date.toDate() : data.date,
      } as Review)
    })

    console.log(`Processing ${reviews.length} reviews for stats calculation`)

    // Calculate rating distribution
    const ratingDistribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    }

    reviews.forEach((review) => {
      const rating = Math.min(Math.max(Math.round(review.rating), 1), 5) as 1 | 2 | 3 | 4 | 5
      ratingDistribution[rating]++
    })

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0

    console.log("Calculated stats:", { averageRating, totalReviews: reviews.length, ratingDistribution })

    // Update the cosplayer document
    const cosplayerRef = doc(db, "users", cosplayerId)
    await updateDoc(cosplayerRef, {
      averageRating,
      totalReviews: reviews.length,
      ratingDistribution,
    })

    console.log("Cosplayer rating stats updated successfully")
  } catch (error) {
    console.error("Error updating cosplayer rating stats:", error)
    throw error
  }
}

// Remplacer la fonction getPhotographerReviews par cette version qui n'utilise pas orderBy
export const getPhotographerReviews = async (photographerId: string, reviewLimit = 50): Promise<Review[]> => {
  try {
    console.log("Fetching reviews for photographer:", photographerId)

    const reviewsQuery = query(
      collection(db, "reviews"),
      where("targetId", "==", photographerId),
      where("targetType", "==", "photographer"),
    )

    const querySnapshot = await getDocs(reviewsQuery)
    const reviews: Review[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      reviews.push({
        id: doc.id,
        ...data,
        date: data.date instanceof Timestamp ? data.date.toDate() : data.date,
      } as Review)
    })

    console.log(`Found ${reviews.length} reviews for photographer ${photographerId}`)

    // Trier les reviews côté client par date décroissante
    reviews.sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date.getTime() : new Date(a.date).getTime()
      const dateB = b.date instanceof Date ? b.date.getTime() : new Date(b.date).getTime()
      return dateB - dateA // Tri décroissant (plus récent d'abord)
    })

    // Limiter le nombre de résultats après le tri
    return reviews.slice(0, reviewLimit)
  } catch (error) {
    console.error("Error getting photographer reviews:", error)
    throw error
  }
}

// Fonction pour mettre à jour les statistiques de notation d'un photographe
export const updatePhotographerRatingStats = async (photographerId: string): Promise<void> => {
  try {
    console.log("Updating rating stats for photographer:", photographerId)

    // Récupérer toutes les reviews du photographe
    const reviewsQuery = query(
      collection(db, "reviews"),
      where("targetId", "==", photographerId),
      where("targetType", "==", "photographer"),
    )

    const querySnapshot = await getDocs(reviewsQuery)
    const reviews: Review[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      reviews.push({
        id: doc.id,
        ...data,
        date: data.date instanceof Timestamp ? data.date.toDate() : data.date,
      } as Review)
    })

    console.log(`Processing ${reviews.length} reviews for stats calculation`)

    // Calculer la distribution des notes
    const ratingDistribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    }

    reviews.forEach((review) => {
      const rating = Math.min(Math.max(Math.round(review.rating), 1), 5) as 1 | 2 | 3 | 4 | 5
      ratingDistribution[rating]++
    })

    // Calculer la note moyenne
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0

    console.log("Calculated stats:", { averageRating, totalReviews: reviews.length, ratingDistribution })

    // Mettre à jour le document du photographe
    const photographerRef = doc(db, "users", photographerId)
    await updateDoc(photographerRef, {
      averageRating,
      totalReviews: reviews.length,
      ratingDistribution,
    })

    console.log("Photographer rating stats updated successfully")
  } catch (error) {
    console.error("Error updating photographer rating stats:", error)
    throw error
  }
}

// Fonction pour aimer/ne pas aimer une review
export const updateReviewReaction = async (
  reviewId: string,
  reaction: "like" | "dislike",
  increment: boolean,
): Promise<void> => {
  try {
    const reviewRef = doc(db, "reviews", reviewId)
    const field = reaction === "like" ? "likes" : "dislikes"

    const reviewDoc = await getDoc(reviewRef)
    if (!reviewDoc.exists()) {
      throw new Error("Review not found")
    }

    const currentValue = reviewDoc.data()[field] || 0

    await updateDoc(reviewRef, {
      [field]: increment ? currentValue + 1 : Math.max(0, currentValue - 1),
    })
  } catch (error) {
    console.error(`Error updating review ${reaction}:`, error)
    throw error
  }
}

// Fonction pour obtenir les photographes classés
export const getRankedPhotographers = async (
  limit = 10,
  criteria: "rating" | "reviewCount" | "popularity" = "rating",
): Promise<PhotographerData[]> => {
  try {
    // Récupérer tous les photographes avec un profil complet
    const q = query(collection(db, "users"), where("role", "==", "photographer"), where("profileComplete", "==", true))

    const querySnapshot = await getDocs(q)
    const photographers: PhotographerData[] = []

    querySnapshot.forEach((doc) => {
      photographers.push(doc.data() as PhotographerData)
    })

    // Trier les photographes selon le critère spécifié
    let sortedPhotographers = [...photographers]

    switch (criteria) {
      case "rating":
        // Trier par note moyenne (du plus haut au plus bas)
        sortedPhotographers = sortedPhotographers.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
        break

      case "reviewCount":
        // Trier par nombre d'avis (du plus grand au plus petit)
        sortedPhotographers = sortedPhotographers.sort((a, b) => (b.totalReviews || 0) - (a.totalReviews || 0))
        break

      case "popularity":
        // Pour la popularité, on pourrait utiliser une combinaison de critères
        // Par exemple: (note moyenne * nombre d'avis)
        sortedPhotographers = sortedPhotographers.sort((a, b) => {
          const scoreA = (a.averageRating || 0) * (a.totalReviews || 0)
          const scoreB = (b.averageRating || 0) * (b.totalReviews || 0)
          return scoreB - scoreA
        })
        break
    }

    // Limiter les résultats
    return sortedPhotographers.slice(0, limit)
  } catch (error) {
    console.error("Error getting ranked photographers:", error)
    throw error
  }
}

// Ajouter cette fonction pour télécharger une image de message
export const uploadMessageImage = async (file: File, conversationId: string): Promise<string> => {
  try {
    // Créer un nom de fichier unique avec timestamp et id aléatoire
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    const storageRef = ref(storage, `messages/${conversationId}/${fileName}`)

    // Télécharger le fichier
    await uploadBytes(storageRef, file)

    // Obtenir l'URL de téléchargement
    const downloadURL = await getDownloadURL(storageRef)
    return downloadURL
  } catch (error) {
    console.error("Error uploading message image:", error)
    throw error
  }
}

// Fonctions pour les conventions
export const getConventions = async (limitCount = 20): Promise<Convention[]> => {
  try {
    // Récupérer les conventions à venir (date de fin >= aujourd'hui)
    const today = new Date()
    const conventionsQuery = query(collection(db, "conventions"), where("endDate", ">=", today), limit(limitCount))

    const querySnapshot = await getDocs(conventionsQuery)
    const conventions: Convention[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      conventions.push({
        id: doc.id,
        ...data,
        startDate: data.startDate instanceof Timestamp ? data.startDate.toDate() : data.startDate,
        endDate: data.endDate instanceof Timestamp ? data.endDate.toDate() : data.endDate,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
      } as Convention)
    })

    // Trier les conventions par date de début
    conventions.sort((a, b) => {
      const dateA = a.startDate instanceof Timestamp ? a.startDate.toDate().getTime() : new Date(a.startDate).getTime()
      const dateB = b.startDate instanceof Timestamp ? b.startDate.toDate().getTime() : new Date(b.startDate).getTime()
      return dateA - dateB // Tri croissant (plus proche d'abord)
    })

    return conventions
  } catch (error) {
    console.error("Error getting conventions:", error)
    throw error
  }
}

export const getConventionById = async (conventionId: string): Promise<Convention | null> => {
  try {
    const conventionDoc = await getDoc(doc(db, "conventions", conventionId))

    if (!conventionDoc.exists()) {
      return null
    }

    const data = conventionDoc.data()
    return {
      id: conventionDoc.id,
      ...data,
      startDate: data.startDate instanceof Timestamp ? data.startDate.toDate() : data.startDate,
      endDate: data.endDate instanceof Timestamp ? data.endDate.toDate() : data.endDate,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
    } as Convention
  } catch (error) {
    console.error("Error getting convention:", error)
    throw error
  }
}

export const addPhotographerToConvention = async (photographerId: string, conventionId: string): Promise<void> => {
  try {
    const userDocRef = doc(db, "users", photographerId)
    const userDoc = await getDoc(userDocRef)

    if (!userDoc.exists()) {
      throw new Error("Photographer not found")
    }

    const userData = userDoc.data() as PhotographerData
    const conventions = userData.conventions || []

    // Vérifier si le photographe est déjà inscrit à cette convention
    if (!conventions.includes(conventionId)) {
      // Ajouter la convention à la liste des conventions du photographe
      await updateDoc(userDocRef, {
        conventions: arrayUnion(conventionId),
      })
    }
  } catch (error) {
    console.error("Error adding photographer to convention:", error)
    throw error
  }
}

export const removePhotographerFromConvention = async (photographerId: string, conventionId: string): Promise<void> => {
  try {
    const userDocRef = doc(db, "users", photographerId)
    const userDoc = await getDoc(userDocRef)

    if (!userDoc.exists()) {
      throw new Error("Photographer not found")
    }

    const userData = userDoc.data() as PhotographerData
    const conventions = userData.conventions || []

    // Retirer la convention de la liste
    const updatedConventions = conventions.filter((id) => id !== conventionId)

    await updateDoc(userDocRef, {
      conventions: updatedConventions,
    })

    // Supprimer également tous les créneaux associés à cette convention pour ce photographe
    await deletePhotographerTimeSlots(photographerId, conventionId)
  } catch (error) {
    console.error("Error removing photographer from convention:", error)
    throw error
  }
}

// Nouvelles fonctions pour gérer les photographes favoris
export const addFavoritePhotographer = async (cosplayerId: string, photographerId: string): Promise<void> => {
  try {
    const userDocRef = doc(db, "users", cosplayerId)

    // Utiliser arrayUnion pour ajouter le photographe aux favoris sans créer de doublons
    await updateDoc(userDocRef, {
      favoritePhotographers: arrayUnion(photographerId),
    })
  } catch (error) {
    console.error("Error adding favorite photographer:", error)
    throw error
  }
}

export const removeFavoritePhotographer = async (cosplayerId: string, photographerId: string): Promise<void> => {
  try {
    const userDocRef = doc(db, "users", cosplayerId)

    // Utiliser arrayRemove pour retirer le photographe des favoris
    await updateDoc(userDocRef, {
      favoritePhotographers: arrayRemove(photographerId),
    })
  } catch (error) {
    console.error("Error removing favorite photographer:", error)
    throw error
  }
}

export const getFavoritePhotographers = async (cosplayerId: string): Promise<PhotographerData[]> => {
  try {
    // Récupérer d'abord les données du cosplayer pour obtenir la liste des IDs favoris
    const cosplayerDoc = await getDoc(doc(db, "users", cosplayerId))

    if (!cosplayerDoc.exists()) {
      throw new Error("Cosplayer not found")
    }

    const cosplayerData = cosplayerDoc.data() as CosplayerData
    const favoriteIds = cosplayerData.favoritePhotographers || []

    if (favoriteIds.length === 0) {
      return []
    }

    // Récupérer les données de chaque photographe favori
    const photographers: PhotographerData[] = []

    for (const id of favoriteIds) {
      const photographerDoc = await getDoc(doc(db, "users", id))
      if (photographerDoc.exists()) {
        photographers.push(photographerDoc.data() as PhotographerData)
      }
    }

    return photographers
  } catch (error) {
    console.error("Error getting favorite photographers:", error)
    throw error
  }
}

export const isFavoritePhotographer = async (cosplayerId: string, photographerId: string): Promise<boolean> => {
  try {
    const cosplayerDoc = await getDoc(doc(db, "users", cosplayerId))

    if (!cosplayerDoc.exists()) {
      return false
    }

    const cosplayerData = cosplayerDoc.data() as CosplayerData
    const favoriteIds = cosplayerData.favoritePhotographers || []

    return favoriteIds.includes(photographerId)
  } catch (error) {
    console.error("Error checking if photographer is favorite:", error)
    return false
  }
}

// New functions for favorite cosplayers
export const addFavoriteCosplayer = async (photographerId: string, cosplayerId: string): Promise<void> => {
  try {
    const userDocRef = doc(db, "users", photographerId)

    // Use arrayUnion to add the cosplayer to favorites without creating duplicates
    await updateDoc(userDocRef, {
      favoriteCosplayers: arrayUnion(cosplayerId),
    })
  } catch (error) {
    console.error("Error adding favorite cosplayer:", error)
    throw error
  }
}

export const removeFavoriteCosplayer = async (photographerId: string, cosplayerId: string): Promise<void> => {
  try {
    const userDocRef = doc(db, "users", photographerId)

    // Use arrayRemove to remove the cosplayer from favorites
    await updateDoc(userDocRef, {
      favoriteCosplayers: arrayRemove(cosplayerId),
    })
  } catch (error) {
    console.error("Error removing favorite cosplayer:", error)
    throw error
  }
}

export const getFavoriteCosplayers = async (photographerId: string): Promise<CosplayerData[]> => {
  try {
    // First get the photographer data to get the list of favorite IDs
    const photographerDoc = await getDoc(doc(db, "users", photographerId))

    if (!photographerDoc.exists()) {
      throw new Error("Photographer not found")
    }

    const photographerData = photographerDoc.data() as PhotographerData
    const favoriteIds = photographerData.favoriteCosplayers || []

    if (favoriteIds.length === 0) {
      return []
    }

    // Get the data for each favorite cosplayer
    const cosplayers: CosplayerData[] = []

    for (const id of favoriteIds) {
      const cosplayerDoc = await getDoc(doc(db, "users", id))
      if (cosplayerDoc.exists()) {
        cosplayers.push(cosplayerDoc.data() as CosplayerData)
      }
    }

    return cosplayers
  } catch (error) {
    console.error("Error getting favorite cosplayers:", error)
    throw error
  }
}

export const isFavoriteCosplayer = async (photographerId: string, cosplayerId: string): Promise<boolean> => {
  try {
    const photographerDoc = await getDoc(doc(db, "users", photographerId))

    if (!photographerDoc.exists()) {
      return false
    }

    const photographerData = photographerDoc.data() as PhotographerData
    const favoriteIds = photographerData.favoriteCosplayers || []

    return favoriteIds.includes(cosplayerId)
  } catch (error) {
    console.error("Error checking if cosplayer is favorite:", error)
    return false
  }
}

// Function to get photographers participating in a convention
export const getPhotographersByConvention = async (conventionId: string): Promise<PhotographerData[]> => {
  try {
    const q = query(
      collection(db, "users"),
      where("role", "==", "photographer"),
      where("conventions", "array-contains", conventionId),
      where("profileComplete", "==", true),
    )

    const querySnapshot = await getDocs(q)
    const photographers: PhotographerData[] = []

    querySnapshot.forEach((doc) => {
      photographers.push(doc.data() as PhotographerData)
    })

    return photographers
  } catch (error) {
    console.error("Error getting photographers for convention:", error)
    throw error
  }
}

// Function to delete photographer time slots for a specific convention
const deletePhotographerTimeSlots = async (photographerId: string, conventionId: string): Promise<void> => {
  try {
    const timeSlotsQuery = query(
      collection(db, "timeSlots"),
      where("photographerId", "==", photographerId),
      where("conventionId", "==", conventionId),
    )

    const querySnapshot = await getDocs(timeSlotsQuery)

    // Delete each time slot
    querySnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref)
    })
  } catch (error) {
    console.error("Error deleting photographer time slots:", error)
    throw error
  }
}

// Fonction pour récupérer les utilisateurs par rôle
export async function getUsersByRole(role: "photographer" | "cosplayer") {
  try {
    const usersRef = collection(db, "users")
    const q = query(usersRef, where("role", "==", role))
    const snapshot = await getDocs(q)

    return snapshot.docs.map((doc) => ({
      uid: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error(`Error getting ${role}s:`, error)
    return []
  }
}

export { app, auth, db, storage, analytics }
