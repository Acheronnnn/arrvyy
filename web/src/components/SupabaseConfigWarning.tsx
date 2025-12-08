import { AlertCircle, ExternalLink, Copy } from 'lucide-react'
import { isSupabaseConfigured } from '@/lib/supabase'
import { useState } from 'react'

export function SupabaseConfigWarning() {
  const [copied, setCopied] = useState(false)

  if (isSupabaseConfigured()) {
    return null
  }

  const envTemplate = `VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(envTemplate)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-6 rounded-r-lg">
      <div className="flex items-start">
        <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Setup Supabase untuk menggunakan aplikasi
          </h3>
          <div className="text-xs text-blue-800 space-y-3">
            <div>
              <p className="font-medium mb-1">1. Buat Project Supabase (Gratis)</p>
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 underline"
              >
                Kunjungi supabase.com <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>
            
            <div>
              <p className="font-medium mb-1">2. Dapatkan API Credentials</p>
              <p className="text-blue-700">
                Di Supabase Dashboard → Settings → API, copy:
              </p>
              <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
                <li>Project URL</li>
                <li>anon public key</li>
              </ul>
            </div>

            <div>
              <p className="font-medium mb-2">3. Buat file <code className="bg-blue-100 px-1.5 py-0.5 rounded font-mono text-xs">.env</code> di folder <code className="bg-blue-100 px-1.5 py-0.5 rounded font-mono text-xs">web/</code></p>
              <div className="bg-blue-100 rounded p-3 font-mono text-xs relative">
                <button
                  onClick={copyToClipboard}
                  className="absolute top-2 right-2 p-1 hover:bg-blue-200 rounded transition"
                  title="Copy"
                >
                  <Copy className="w-3 h-3 text-blue-700" />
                </button>
                {copied && (
                  <span className="absolute top-2 right-8 text-xs text-green-700 font-semibold">
                    Copied!
                  </span>
                )}
                <pre className="text-blue-900 whitespace-pre-wrap">{envTemplate}</pre>
              </div>
            </div>

            <div>
              <p className="font-medium mb-1">4. Isi dengan credentials kamu</p>
              <p className="text-blue-700">
                Ganti <code className="bg-blue-100 px-1 rounded">your_supabase_project_url_here</code> dan <code className="bg-blue-100 px-1 rounded">your_supabase_anon_key_here</code> dengan credentials dari Supabase.
              </p>
            </div>

            <div>
              <p className="font-medium mb-1">5. Restart dev server</p>
              <p className="text-blue-700">
                Setelah file <code className="bg-blue-100 px-1 rounded">.env</code> dibuat, restart dev server (Ctrl+C lalu <code className="bg-blue-100 px-1 rounded">npm run dev</code> lagi).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

