"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function Debug() {
  const [status, setStatus] = useState('Checking...')
  const [data, setData] = useState<any>(null)
  const [envCheck, setEnvCheck] = useState<any>({})

  useEffect(() => {
    // 1. Check if Code sees the Keys
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    setEnvCheck({
        hasUrl: !!url,
        urlPreview: url ? url.substring(0, 15) + '...' : 'MISSING',
        hasKey: !!key,
    })

    // 2. Try to fetch Venues
    const testConnection = async () => {
        try {
            const { data, error } = await supabase.from('venues').select('*')
            if (error) {
                setStatus('ERROR: ' + error.message)
            } else {
                setStatus(`SUCCESS: Found ${data.length} venues`)
                setData(data)
            }
        } catch (err: any) {
            setStatus('CRASH: ' + err.message)
        }
    }
    testConnection()
  }, [])

  return (
    <div className="p-10 font-mono text-sm bg-black text-green-400 min-h-screen">
      <h1 className="text-xl font-bold mb-6 text-white">System Diagnostics</h1>
      
      <div className="mb-6 border p-4 border-green-800 rounded">
          <h2 className="text-white mb-2">1. Environment Variables</h2>
          <p>URL Detect: {envCheck.hasUrl ? '✅ YES' : '❌ NO'} ({envCheck.urlPreview})</p>
          <p>Key Detect: {envCheck.hasKey ? '✅ YES' : '❌ NO'}</p>
      </div>

      <div className="mb-6 border p-4 border-green-800 rounded">
          <h2 className="text-white mb-2">2. Database Connection</h2>
          <p className="text-lg">{status}</p>
      </div>

      {data && (
          <div className="border p-4 border-green-800 rounded">
              <h2 className="text-white mb-2">3. Raw Data Preview</h2>
              <pre className="text-xs opacity-70">{JSON.stringify(data, null, 2)}</pre>
          </div>
      )}
    </div>
  )
}