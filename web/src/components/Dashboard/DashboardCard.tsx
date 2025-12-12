import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useImportantDates } from '@/hooks/useImportantDates'
import { useMemories } from '@/hooks/useMemories'
import { useLoveNotes } from '@/hooks/useLoveNotes'
import { useMoodTracker } from '@/hooks/useMoodTracker'
import { useStreaks } from '@/hooks/useStreaks'
import { supabase } from '@/lib/supabase'
import { CountdownTimer } from './CountdownTimer'
import { DaysTogetherCounter } from './DaysTogetherCounter'
import { BirthdayCard } from './BirthdayCard'
import { MiniCalendar } from './MiniCalendar'
import { ImportantDatesList } from './ImportantDatesList'
import { MemoryTimeline } from './MemoryTimeline'
import { LoveNotes } from './LoveNotes'
import { MoodTracker } from './MoodTracker'
import { StreakCounter } from './StreakCounter'
import { AddDateModal } from './AddDateModal'
import { UserSettingsModal } from './UserSettingsModal'
import { AddLoveNoteModal } from './AddLoveNoteModal'
import { Heart, Sparkles, Settings } from 'lucide-react'
import { format, addYears } from 'date-fns'
import type { ImportantDate } from '@/types'

export function DashboardCard() {
  const { user, fetchUserProfile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [partner, setPartner] = useState<{ id: string; name: string; anniversary_date?: string | null; [key: string]: any } | null>(null)
  const [anniversaryDate, setAnniversaryDate] = useState<Date | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showLoveNoteModal, setShowLoveNoteModal] = useState(false)
  const [editingDate, setEditingDate] = useState<ImportantDate | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  
  const { dates, loading: datesLoading, addDate, deleteDate, togglePin } = useImportantDates(user?.id)
  const { memories, loading: memoriesLoading, deleteMemory } = useMemories(user?.id)
  const { notes, loading: notesLoading, markAsRead, deleteNote } = useLoveNotes(user?.id)
  const { todayMood, recentMoods, loading: moodLoading, setMood } = useMoodTracker(user?.id)
  const { streaks, loading: streaksLoading } = useStreaks(user?.id, partner?.id)

  useEffect(() => {
    if (user) {
      fetchPartnerAndDates()
    }
  }, [user])

  const fetchPartnerAndDates = async () => {
    try {
      setLoading(true)
      
      // Fetch partner using partner_id if available
      if (user?.partner_id) {
        const { data: partnerData } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.partner_id)
          .single()

        if (partnerData) {
          setPartner(partnerData)
        }
      } else {
        // Fallback: try to find another user
        const { data: partnerData } = await supabase
          .from('users')
          .select('*')
          .neq('id', user!.id)
          .limit(1)
          .maybeSingle()

        if (partnerData) {
          setPartner(partnerData)
        }
      }

      // Get anniversary date from user profile
      if (user?.anniversary_date) {
        const annDate = new Date(user.anniversary_date)
        if (!isNaN(annDate.getTime())) {
          setAnniversaryDate(annDate)
        }
      }
    } catch (error) {
      console.error('Error fetching partner:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSettingsUpdate = async () => {
    // Refetch user data from database
    if (user && fetchUserProfile) {
      try {
        // Refetch user profile from useAuth hook
        await fetchUserProfile(user.id)
        
        // Refetch partner and dates
        await fetchPartnerAndDates()
      } catch (error) {
        console.error('Error refreshing user data:', error)
        // Still try to fetch partner data
        fetchPartnerAndDates()
      }
    }
  }

  const handleAddDate = async (dateData: Omit<ImportantDate, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await addDate(dateData)
      setShowAddModal(false)
      setEditingDate(null)
    } catch (error: any) {
      alert('Error adding date: ' + error.message)
    }
  }

  const handleDeleteDate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this date?')) return
    try {
      await deleteDate(id)
    } catch (error: any) {
      alert('Error deleting date: ' + error.message)
    }
  }

  const getNextAnniversary = () => {
    if (!anniversaryDate) return null
    const today = new Date()
    const currentYear = today.getFullYear()
    let nextAnniversary = new Date(currentYear, anniversaryDate.getMonth(), anniversaryDate.getDate())
    
    if (nextAnniversary < today) {
      nextAnniversary = addYears(nextAnniversary, 1)
    }
    
    return nextAnniversary
  }

  if (loading || datesLoading || memoriesLoading || notesLoading || moodLoading || streaksLoading) {
    return (
      <div className="h-full bg-gradient-to-br from-white via-sky-50/50 to-blue-50/50 backdrop-blur-lg rounded-3xl shadow-2xl flex items-center justify-center border border-sky-100/80"
           style={{ backgroundColor: 'rgba(255, 255, 255, 0.98)' }}>
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const nextAnniversary = getNextAnniversary()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="h-full bg-gradient-to-br from-white via-sky-50/50 to-blue-50/50 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-sky-100/80"
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.98)' }}
    >
      {/* Header */}
      <div className="p-2 md:p-3 pb-1.5 md:pb-2 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-cyan-400 flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Our Home</h2>
              <p className="text-xs text-gray-600">Special moments together</p>
            </div>
          </div>
          <button
            onClick={() => setShowSettingsModal(true)}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-2 md:p-3 space-y-2 md:space-y-3">
        {/* Days Together Counter - HIGHLIGHTED */}
        {anniversaryDate ? (
          <DaysTogetherCounter anniversaryDate={anniversaryDate} />
        ) : (
          <div className="bg-gradient-to-br from-sky-50 to-cyan-50 rounded-2xl p-4 border border-sky-100 text-center">
            <p className="text-sm text-gray-600">Set your anniversary date in Settings</p>
            <p className="text-xs text-gray-500 mt-1">Click the gear icon above</p>
          </div>
        )}

        {/* Anniversary Countdown */}
        {nextAnniversary ? (
          <div className="bg-gradient-to-br from-sky-50 to-cyan-50 rounded-2xl p-4 border border-sky-100">
            <CountdownTimer
              targetDate={nextAnniversary}
              label="Next Anniversary"
            />
          </div>
        ) : anniversaryDate ? (
          <div className="bg-gradient-to-br from-sky-50 to-cyan-50 rounded-2xl p-4 border border-sky-100 text-center">
            <p className="text-sm text-gray-600">Anniversary: {format(anniversaryDate, 'MMMM d, yyyy')}</p>
            <p className="text-xs text-gray-500 mt-1">Countdown will appear after calculation</p>
          </div>
        ) : null}

        {/* Streak Counter */}
        {streaks.length > 0 && (
          <StreakCounter streaks={streaks} />
        )}

        {/* Mood Tracker */}
        <MoodTracker
          todayMood={todayMood}
          recentMoods={recentMoods}
          onSetMood={setMood}
        />

        {/* Birthdays */}
        <div className="space-y-2">
          {user?.birthday && (
            <BirthdayCard
              name={user.name}
              birthday={new Date(user.birthday)}
              isPartner={false}
            />
          )}
          {(user?.partner_birthday || partner) && (
            <BirthdayCard
              name={partner?.name || 'Partner'}
              birthday={new Date(user?.partner_birthday || '2005-04-17')}
              isPartner={true}
            />
          )}
        </div>

        {/* Memory Timeline */}
        <MemoryTimeline
          memories={memories}
          onAdd={() => {
            // Add memory modal is handled inside MemoryTimeline component
          }}
          onView={(memory) => {
            // TODO: Open memory view modal
            console.log('View memory:', memory)
          }}
          onDelete={(id) => {
            console.log('🗑️ DashboardCard: deleteMemory called with id:', id)
            return deleteMemory(id)
          }}
        />

        {/* Love Notes */}
        <LoveNotes
          notes={notes}
          onAdd={() => setShowLoveNoteModal(true)}
          onView={(note) => {
            if (note && !note.is_read) {
              markAsRead(note.id)
            }
            // TODO: Open love note view modal
            console.log('View note:', note)
          }}
          onDelete={deleteNote}
        />

        {/* Mini Calendar */}
        <MiniCalendar
          importantDates={dates}
          onDateClick={(date, existingDate) => {
            setSelectedDate(date)
            if (existingDate) {
              // View/Edit mode - tanggal sudah ada important date
              setEditingDate(existingDate)
            } else {
              // Add mode - tanggal kosong
              setEditingDate(null)
            }
            setShowAddModal(true)
          }}
          onMonthChange={setCurrentMonth}
        />

        {/* Important Dates List - Filtered by current month */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Sparkles className="w-5 h-5 text-sky-500" />
            <h3 className="text-lg font-bold text-gray-900">
              Important Dates - {format(currentMonth, 'MMMM yyyy')}
            </h3>
          </div>
          <ImportantDatesList
            dates={dates}
            currentMonth={currentMonth}
            onTogglePin={togglePin}
            onDelete={handleDeleteDate}
            onDateClick={(importantDate) => {
              // Click date card untuk edit
              setSelectedDate(new Date(importantDate.date))
              setEditingDate(importantDate)
              setShowAddModal(true)
            }}
          />
        </div>
      </div>

      {/* Add Date Modal */}
      <AddDateModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false)
          setEditingDate(null)
          setSelectedDate(null)
        }}
        onSave={handleAddDate}
        editingDate={editingDate}
        initialDate={selectedDate || null}
      />

      {/* Settings Modal */}
      <UserSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onUpdate={handleSettingsUpdate}
      />

      {/* Add Love Note Modal */}
      <AddLoveNoteModal
        isOpen={showLoveNoteModal}
        onClose={() => setShowLoveNoteModal(false)}
      />
    </motion.div>
  )
}
