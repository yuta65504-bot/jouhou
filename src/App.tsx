import { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import HomePage from './pages/HomePage'
import FieldsPage from './pages/FieldsPage'
import FieldDetailPage from './pages/FieldDetailPage'
import QuizPage from './pages/QuizPage'
import QuizQuestionPage from './pages/QuizQuestionPage'
import TermsPage from './pages/TermsPage'
import TermDetailPage from './pages/TermDetailPage'
import RecordsPage from './pages/RecordsPage'
import SettingsPage from './pages/SettingsPage'
import AdminPage from './pages/AdminPage'

export default function App() {
  return (
    <Suspense fallback={<p style={{ padding: 24 }}>読み込み中…</p>}>
      <Routes>
        {/* 管理者ページは共通レイアウトの外。URLでの直接アクセスのみ（README「問題・演習の仕様」） */}
        <Route path="/admin" element={<AdminPage />} />
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/fields" element={<FieldsPage />} />
          <Route path="/fields/:fieldId" element={<FieldDetailPage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/quiz/:id" element={<QuizQuestionPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/terms/:termId" element={<TermDetailPage />} />
          <Route path="/records" element={<RecordsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
