"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { diagnoseEmailIssues, checkFirebaseConfig } from "@/lib/email-diagnostics"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function EmailDiagnosticsPage() {
  const { user } = useAuth()
  const [diagnostics, setDiagnostics] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runDiagnostics = async () => {
    setLoading(true)
    try {
      const result = await diagnoseEmailIssues()
      const config = checkFirebaseConfig()
      setDiagnostics({ ...result, config })
    } catch (error) {
      console.error("Erreur lors du diagnostic:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-6">
            <p>Vous devez être connecté pour accéder aux diagnostics.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Diagnostics Email de Vérification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={runDiagnostics} disabled={loading}>
            {loading ? "Diagnostic en cours..." : "Lancer le diagnostic"}
          </Button>

          {diagnostics && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">Statut: {diagnostics.success ? "✅ Succès" : "❌ Échec"}</h3>
              </div>

              {diagnostics.issues.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-600">Problèmes détectés:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {diagnostics.issues.map((issue: string, index: number) => (
                      <li key={index} className="text-red-600">
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {diagnostics.recommendations.length > 0 && (
                <div>
                  <h4 className="font-medium text-blue-600">Recommandations:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {diagnostics.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="text-blue-600">
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h4 className="font-medium">Configuration Firebase:</h4>
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                  {JSON.stringify(diagnostics.config, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
