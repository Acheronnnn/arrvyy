import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChat } from '@/hooks/useChat'
import { Send, Loader2, MessageCircle } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import type { User } from '@/types'

interface ChatWindowProps {
  currentUser: User
  otherUser: User
}

export function ChatWindow({ currentUser, otherUser }: ChatWindowProps) {
  const [message, setMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { messages, loading, sending, sendMessage } = useChat({
    currentUserId: currentUser.id,
    otherUserId: otherUser.id,
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || sending) return

    const messageToSend = message
    setMessage('')
    try {
      await sendMessage(messageToSend)
    } catch (error) {
      setMessage(messageToSend) // Restore message on error
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Messages - Ocean Blue Soft Background */}
      <div className="flex-1 overflow-y-auto px-3 md:px-4 py-4 md:py-6 space-y-3 md:space-y-4 bg-gradient-to-b from-sky-50/50 via-blue-50/40 to-cyan-50/50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-20 h-20 bg-gradient-to-br from-sky-200 to-blue-200 rounded-full flex items-center justify-center mb-4 shadow-lg"
            >
              <MessageCircle className="w-10 h-10 text-sky-500" />
            </motion.div>
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-gray-700 font-medium text-lg mb-2"
            >
              Start your conversation
            </motion.p>
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-gray-500 text-sm"
            >
              Send a message to your loved one 🌊
            </motion.p>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((msg) => {
              const isOwn = msg.sender_id === currentUser.id
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'} items-end`}
                >
                  {/* Hanya message bubble, tanpa avatar */}
                  <motion.div
                    className="max-w-[80%] md:max-w-md relative"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Message bubble with ocean blue styling */}
                    <div
                      className={`relative px-4 py-2.5 md:px-5 md:py-3 rounded-2xl md:rounded-3xl shadow-lg ${
                        isOwn
                          ? 'bg-gradient-to-br from-sky-400 via-blue-400 to-cyan-400 text-white'
                          : 'bg-white/95 backdrop-blur-sm text-gray-800 border border-sky-100/60'
                      }`}
                      style={{
                        boxShadow: isOwn
                          ? '0 4px 20px rgba(14, 165, 233, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                          : '0 2px 12px rgba(0, 0, 0, 0.08)',
                      }}
                    >
                      <p className="text-sm md:text-base whitespace-pre-wrap break-words leading-relaxed">
                        {msg.content}
                      </p>
                      <p
                        className={`text-xs mt-1.5 ${
                          isOwn ? 'text-sky-50' : 'text-gray-500'
                        }`}
                      >
                        {format(new Date(msg.created_at), 'HH:mm', {
                          locale: id,
                        })}
                      </p>
                      {/* Decorative corner for own messages */}
                      {isOwn && (
                        <div className="absolute -bottom-1 right-4 w-3 h-3 bg-gradient-to-br from-sky-400 to-cyan-400 transform rotate-45 border-r border-b border-sky-300/40"></div>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input - Ocean Blue Glassmorphism */}
      <form
        onSubmit={handleSend}
        className="relative z-10 bg-gradient-to-r from-sky-50/90 via-blue-50/90 to-cyan-50/90 backdrop-blur-xl border-t border-sky-200/60 px-3 md:px-4 py-3 md:py-4 shadow-lg"
      >
        <div className="flex items-center space-x-2 md:space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message... 🌊"
              className="w-full px-4 md:px-5 py-2.5 md:py-3 bg-white/90 backdrop-blur-md border border-sky-200/60 rounded-full focus:ring-2 focus:ring-sky-400/50 focus:border-sky-400 outline-none transition-all duration-200 text-sm md:text-base placeholder:text-gray-400 shadow-sm hover:shadow-md"
              disabled={sending}
            />
          </div>
          <motion.button
            type="submit"
            disabled={!message.trim() || sending}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-11 h-11 md:w-12 md:h-12 bg-gradient-to-br from-sky-500 via-blue-500 to-cyan-500 text-white rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:shadow-sky-500/30"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </motion.button>
        </div>
      </form>
    </div>
  )
}

