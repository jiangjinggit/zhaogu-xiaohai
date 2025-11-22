import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { TrackerTab } from './components/TrackerTab';
import { KnowledgeTab } from './components/KnowledgeTab';
import { IllnessTab } from './components/IllnessTab';
import { EmergencyTab } from './components/EmergencyTab';
import { AppTab } from './types';

function App() {
  const [currentTab, setCurrentTab] = useState<AppTab>(AppTab.TRACKER);

  const renderTab = () => {
    switch (currentTab) {
      case AppTab.TRACKER:
        return <TrackerTab />;
      case AppTab.KNOWLEDGE:
        return <KnowledgeTab />;
      case AppTab.ILLNESS:
        return <IllnessTab />;
      case AppTab.EMERGENCY:
        return <EmergencyTab />;
      default:
        return <TrackerTab />;
    }
  };

  return (
    <Layout currentTab={currentTab} onTabChange={setCurrentTab}>
      {renderTab()}
    </Layout>
  );
}

export default App;