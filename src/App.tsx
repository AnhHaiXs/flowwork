import { useState } from 'react'
import { AppView } from './types'
import { Layout } from './components/Layout'
import { Dashboard } from './views/Dashboard'
import { AgreementList } from './views/AgreementList'
import { CreateAgreement } from './views/CreateAgreement'
import { AgreementDetail } from './views/AgreementDetail'
import { Profile } from './views/Profile'
import { DocsViewer } from './views/DocsViewer'

export default function App() {
  const [view, setView] = useState<AppView>('dashboard')
  const [selectedAgreementId, setSelectedAgreementId] = useState<bigint | null>(null)

  function handleSelectAgreement(id: bigint) {
    setSelectedAgreementId(id)
    setView('detail')
  }

  function handleCreated(id: bigint) {
    setSelectedAgreementId(id)
    setView('detail')
  }

  function handleNav(v: AppView) {
    setView(v)
    if (v !== 'detail') setSelectedAgreementId(null)
  }

  return (
    <Layout view={view} onNav={handleNav}>
      {view === 'dashboard' && (
        <Dashboard onNav={handleNav} onSelectAgreement={handleSelectAgreement} />
      )}
      {view === 'agreements' && (
        <AgreementList onNav={handleNav} onSelectAgreement={handleSelectAgreement} />
      )}
      {view === 'create' && (
        <CreateAgreement onNav={handleNav} onCreated={handleCreated} />
      )}
      {view === 'detail' && selectedAgreementId !== null && (
        <AgreementDetail
          agreementId={selectedAgreementId}
          onBack={() => handleNav('agreements')}
          onNav={handleNav}
        />
      )}
      {view === 'profile' && (
        <Profile />
      )}
      {view === 'docs' && (
        <DocsViewer />
      )}
    </Layout>
  )
}
