import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useGoogleDrive() {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadPhoto = async (file: File): Promise<string> => {
    setUploading(true)
    setError(null)

    try {
      // Convert file to base64
      const base64 = await fileToBase64(file)

      console.log('📤 Uploading to Edge Function...', {
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      })

      // Verify Supabase client is configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
        throw new Error('Supabase URL belum dikonfigurasi. Pastikan VITE_SUPABASE_URL di .env file benar.')
      }

      console.log('🔗 Supabase URL:', supabaseUrl)
      console.log('📤 Calling Edge Function: upload-to-drive-oauth')

      // Call Edge Function with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

      let uploadError: any = null
      let data: any = null

      try {
        const response = await supabase.functions.invoke('upload-to-drive-oauth', {
          body: {
            fileData: base64,
            fileName: file.name,
            mimeType: file.type,
          },
          signal: controller.signal as any,
        })
        
        data = response.data
        uploadError = response.error
      } catch (invokeError: any) {
        console.error('❌ Invoke error:', invokeError)
        uploadError = invokeError
      } finally {
        clearTimeout(timeoutId)
      }

      const { data: responseData, error: responseError } = { data, error: uploadError }

      console.log('📥 Edge Function response:', { data: responseData, error: responseError })

      if (responseError) {
        console.error('❌ Edge Function error:', responseError)
        
        // Check for specific error types
        if (responseError.message?.includes('Failed to send')) {
          throw new Error('Edge Function tidak dapat diakses. Pastikan function sudah ter-deploy dan Supabase URL benar.')
        }
        
        if (responseError.message?.includes('timeout') || responseError.message?.includes('aborted')) {
          throw new Error('Upload timeout. File mungkin terlalu besar atau koneksi lambat.')
        }
        
        throw new Error(responseError.message || 'Failed to connect to upload service. Please check if Edge Function is deployed and secrets are configured.')
      }

      if (!responseData) {
        throw new Error('No response from upload service. Edge Function mungkin belum ter-deploy.')
      }

      if (!responseData.success) {
        const errorMsg = responseData.error || 'Failed to upload to Google Drive'
        console.error('❌ Upload failed:', errorMsg)
        throw new Error(errorMsg)
      }

      console.log('✅ Upload successful:', responseData.publicUrl)
      return responseData.publicUrl
    } catch (err: any) {
      console.error('❌ Upload error:', err)
      const errorMessage = err.message || 'Failed to upload photo'
      setError(errorMessage)
      
      // More user-friendly error messages
      if (errorMessage.includes('Failed to connect') || errorMessage.includes('fetch')) {
        throw new Error('Cannot connect to upload service. Please check your internet connection and ensure Edge Function is deployed.')
      }
      
      throw new Error(errorMessage)
    } finally {
      setUploading(false)
    }
  }

  const deletePhoto = async (photoUrl: string): Promise<void> => {
    setError(null)

    try {
      // Extract file ID from Google Drive URL
      let fileId: string | null = null
      
      // Try format 1: ?id= or &id=
      const match1 = photoUrl.match(/[?&]id=([^&]+)/)
      if (match1 && match1[1]) {
        fileId = match1[1]
      } else {
        // Try format 2: /file/d/FILE_ID/
        const match2 = photoUrl.match(/\/file\/d\/([^\/]+)/)
        if (match2 && match2[1]) {
          fileId = match2[1]
        }
      }

      if (!fileId) {
        console.warn('⚠️ Could not extract file ID from URL:', photoUrl)
        throw new Error('Invalid photo URL format')
      }

      console.log('🗑️ Deleting photo from Drive:', fileId)

      const response = await supabase.functions.invoke('upload-to-drive-oauth', {
        body: {
          action: 'delete',
          fileId: fileId,
        },
      })

      const { data: responseData, error: responseError } = response

      if (responseError) {
        console.error('❌ Delete error:', responseError)
        throw new Error(responseError.message || 'Failed to delete photo from Google Drive')
      }

      if (!responseData || !responseData.success) {
        throw new Error(responseData?.error || 'Failed to delete photo from Google Drive')
      }

      console.log('✅ Photo deleted from Drive successfully')
    } catch (err: any) {
      console.error('❌ Delete photo error:', err)
      const errorMessage = err.message || 'Failed to delete photo'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  return {
    uploadPhoto,
    deletePhoto,
    uploading,
    error,
  }
}

// Helper: Convert File to Base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1] // Remove data:image/jpeg;base64, prefix
      resolve(base64String)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

