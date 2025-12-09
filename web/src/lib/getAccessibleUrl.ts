/**
 * Get accessible URL untuk email redirect
 * - Development: gunakan IP address agar bisa diakses dari HP
 * - Production: gunakan Vercel URL
 */
export function getAccessibleUrl(): string {
  // Jika production (Vercel)
  if (import.meta.env.PROD) {
    return 'https://arrvyy.vercel.app'
  }

  // Development: cek apakah ada custom URL di env
  const customUrl = import.meta.env.VITE_ACCESSIBLE_URL
  if (customUrl) {
    return customUrl
  }

  // Fallback: gunakan current origin (localhost atau IP)
  // Jika user buka dari HP, window.location.origin sudah benar
  // Jika user buka dari PC tapi mau kirim ke HP, perlu IP
  const origin = window.location.origin
  
  // Jika localhost, coba detect IP dari network
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
    // Untuk development, lebih baik user set manual di .env
    // Tapi kita bisa return origin dulu, user bisa set VITE_ACCESSIBLE_URL
    return origin
  }

  return origin
}

