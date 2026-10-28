import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import HomePage from './pages/HomePage'
import FieldsPage from './pages/FieldsPage'
import FieldDetailPage from './pages/FieldDetailPage'
import QuizPage from './pages/QuizPage'
import QuizQuestionPage from './pages/QuizQuestionPage'
import LabsPage from './pages/LabsPage'
import LabDetailPage from './pages/LabDetailPage'
import TermsPage from './pages/TermsPage'
import TermDetailPage from './pages/TermDetailPage'
import RecordsPage from './pages/RecordsPage'
import SettingsPage from './pages/SettingsPage'
import AdminPage from './pages/AdminPage'

/** 開発時だけ使う図解ギャラリー。本番ビルドではルートごと無効化する */
const DevFiguresPage = lazy(() => import('./pages/DevFiguresPage'))

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
          <Route path="/labs" element={<LabsPage />} />
          <Route path="/labs/:labId" element={<LabDetailPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/terms/:termId" element={<TermDetailPage />} />
          <Route path="/records" element={<RecordsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          {import.meta.env.DEV && <Route path="/dev/figures" element={<DevFiguresPage />} />}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
