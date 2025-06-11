import { auth, sendVerificationEmail } from "./firebase"

// Fonction de diagnostic pour tester l'envoi d'emails
export const diagnoseEmailIssues = async (): Promise<{
  success: boolean
  issues: string[]
  recommendations: string[]
}> => {
  const issues: string[] = []
  const recommendations: string[] = []

  try {
    // Vérifier la configuration Firebase
    if (!auth) {
      issues.push("Firebase Auth n'est pas initialisé")
      recommendations.push("Vérifiez la configuration Firebase")
    }

    // Vérifier l'utilisateur actuel
    const currentUser = auth.currentUser
    if (!currentUser) {
      issues.push("Aucun utilisateur connecté")
      recommendations.push("L'utilisateur doit être connecté pour envoyer un email de vérification")
      return { success: false, issues, recommendations }
    }

    // Vérifier l'email de l'utilisateur
    if (!currentUser.email) {
      issues.push("L'utilisateur n'a pas d'adresse email")
      recommendations.push("Assurez-vous que l'utilisateur a une adresse email valide")
    }

    // Vérifier si l'email est déjà vérifié
    if (currentUser.emailVerified) {
      issues.push("L'email est déjà vérifié")
      recommendations.push("Aucune action nécessaire")
      return { success: true, issues, recommendations }
    }

    // Vérifier les domaines autorisés
    const domain = currentUser.email?.split("@")[1]
    if (domain) {
      console.log("Domaine de l'email:", domain)
      // Ajouter des vérifications spécifiques si nécessaire
    }

    // Tester l'envoi d'email
    try {
      await sendVerificationEmail(currentUser)
      console.log("Test d'envoi d'email réussi")
      return { success: true, issues, recommendations }
    } catch (emailError: any) {
      issues.push(`Erreur lors de l'envoi: ${emailError.message}`)

      switch (emailError.code) {
        case "auth/too-many-requests":
          recommendations.push("Attendez quelques minutes avant de réessayer")
          break
        case "auth/network-request-failed":
          recommendations.push("Vérifiez votre connexion internet")
          break
        case "auth/internal-error":
          recommendations.push("Problème côté serveur Firebase, réessayez plus tard")
          break
        default:
          recommendations.push("Contactez le support technique")
      }
    }
  } catch (error: any) {
    issues.push(`Erreur générale: ${error.message}`)
    recommendations.push("Vérifiez la configuration Firebase et les permissions")
  }

  return { success: false, issues, recommendations }
}

// Fonction pour vérifier la configuration Firebase
export const checkFirebaseConfig = () => {
  const config = {
    hasAuth: !!auth,
    authDomain: auth?.app?.options?.authDomain,
    projectId: auth?.app?.options?.projectId,
    currentUser: auth?.currentUser?.email || "Aucun utilisateur connecté",
  }

  console.log("Configuration Firebase:", config)
  return config
}
