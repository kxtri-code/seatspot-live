"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      // Ask Supabase: "Is anyone logged in?"
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        // No? Kick them to the login page!
        router.push("/login")
      } else {
        // Yes? Let them see the page.
        setIsLoading(false)
      }
    }
    checkUser()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p>Verifying Credentials...</p>
      </div>
    )
  }

  return <>{children}</>
}