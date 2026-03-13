import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Save, RotateCcw, Settings, MessageSquare, Shield, Clock } from 'lucide-react';

const AdminPanel = () => {
  const { adminRules, updateAdminRules } = useApp();
  const [activeTab, setActiveTab] = useState('rules');
  const [saved, setSaved] = useState(false);
  const [rules, setRules] = useState(adminRules);

  const handleSave = () => {
    updateAdminRules(rules);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setRules({
      tdsLimit: 50000,
      serviceGapDays: 60,
      advanceGapDays: 60,
      pensionYears: 9.5,
      messageTemplates: adminRules.messageTemplates
    });
  };

  const tabs = [
    { id: 'rules', label: 'Rule Engine', icon: Shield },
    { id: 'messages', label: 'Message Templates', icon: MessageSquare },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-semibold text-xl text-white">Admin Panel - Rule Engine</h2>
          <p className="text-text-secondary text-sm mt-1">
            Configure system rules and message templates without coding
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="btn btn-secondary flex items-center gap-2"
          >
            <RotateCcw size={18} />
            Reset
          </button>
          <button
            onClick={handleSave}
            className={`btn flex items-center gap-2 ${saved ? 'btn-success' : 'btn-primary'}`}
          >
            <Save size={18} />
            {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-accent text-white'
                : 'text-text-secondary hover:bg-white/5'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'rules' && (
        <RuleEngineSettings rules={rules} setRules={setRules} />
      )}
      
      {activeTab === 'messages' && (
        <MessageTemplates rules={rules} setRules={setRules} />
      )}
    </div>
  );
};

// Rule Engine Settings Component
const RuleEngineSettings = ({ rules, setRules }) => {
  const updateRule = (key, value) => {
    setRules(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* TDS Limit */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-accent/20">
            <Shield size={24} className="text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-white">TDS Limit</h3>
            <p className="text-text-secondary text-sm">Threshold for Form 15G/H requirement</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-2xl font-bold text-success">₹</span>
          <input
            type="number"
            value={rules.tdsLimit}
            onChange={(e) => updateRule('tdsLimit', parseInt(e.target.value))}
            className="input flex-1"
          />
        </div>
        <p className="text-text-secondary text-xs mt-2">
          Current: ₹{rules.tdsLimit.toLocaleString()} - If service {'<'} 5 years AND amount ≥ this, Form 15G/H is mandatory
        </p>
      </div>

      {/* Service Gap Days */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-warning/20">
            <Clock size={24} className="text-warning" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Service Gap Days</h3>
            <p className="text-text-secondary text-sm">Days allowed after unemployment</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="number"
            value={rules.serviceGapDays}
            onChange={(e) => updateRule('serviceGapDays', parseInt(e.target.value))}
            className="input flex-1"
          />
          <span className="text-text-secondary">days</span>
        </div>
        <p className="text-text-secondary text-xs mt-2">
          Current: {rules.serviceGapDays} days - Used for 60-Day Unemployment Rule
        </p>
      </div>

      {/* Advance Gap Days */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-success/20">
            <Clock size={24} className="text-success" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Advance Gap Days</h3>
            <p className="text-text-secondary text-sm">Days between Form 31 advances</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="number"
            value={rules.advanceGapDays}
            onChange={(e) => updateRule('advanceGapDays', parseInt(e.target.value))}
            className="input flex-1"
          />
          <span className="text-text-secondary">days</span>
        </div>
        <p className="text-text-secondary text-xs mt-2">
          Current: {rules.advanceGapDays} days (2 months) - Wait time after Illness Form 31 settlement
        </p>
      </div>

      {/* Pension Years */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-accent/20">
            <Shield size={24} className="text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Service Years for Pension</h3>
            <p className="text-text-secondary text-sm">Minimum years for Form 10D eligibility</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="number"
            step="0.5"
            value={rules.pensionYears}
            onChange={(e) => updateRule('pensionYears', parseFloat(e.target.value))}
            className="input flex-1"
          />
          <span className="text-text-secondary">years</span>
        </div>
        <p className="text-text-secondary text-xs mt-2">
          Current: {rules.pensionYears} years (9 years 6 months) - Required for monthly pension
        </p>
      </div>

      {/* Info Card */}
      <div className="md:col-span-2 card bg-gradient-to-r from-accent/10 to-transparent border-accent/30">
        <h3 className="font-semibold text-white mb-2">💡 System Note</h3>
        <p className="text-text-secondary text-sm">
          These rules control the smart audit logic. When EPFO updates their regulations, 
          you can modify these values here without any coding. All changes take effect immediately.
        </p>
      </div>
    </div>
  );
};

// Message Templates Component
const MessageTemplates = ({ rules, setRules }) => {
  const updateTemplate = (lang, key, value) => {
    setRules(prev => ({
      ...prev,
      messageTemplates: {
        ...prev.messageTemplates,
        [lang]: {
          ...prev.messageTemplates[lang],
          [key]: value
        }
      }
    }));
  };

  const templateKeys = [
    { key: 'welcome', label: 'Welcome Message', placeholder: 'Welcome to Chamunda Digital! Your PF audit is complete...' },
    { key: 'advanceEligible', label: 'Advance Eligible', placeholder: 'Your PF advance is eligible! Submit Form 31...' },
    { key: 'form10D', label: 'Form 10D Alert', placeholder: 'Congratulations! You are eligible for monthly pension...' },
    { key: 'lowBalance', label: 'Low Balance', placeholder: 'Your withdrawable balance is low. Consider waiting...' },
    { key: 'kycAlert', label: 'KYC Alert', placeholder: 'Please complete your Bank KYC to enable smooth withdrawals...' },
  ];

  return (
    <div className="space-y-6">
      {/* English Templates */}
      <div className="card">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          🇬🇧 English Message Templates
        </h3>
        <div className="space-y-4">
          {templateKeys.map(template => (
            <div key={template.key}>
              <label className="block text-sm text-text-secondary mb-1">{template.label}</label>
              <textarea
                value={rules.messageTemplates.english[template.key]}
                onChange={(e) => updateTemplate('english', template.key, e.target.value)}
                className="input w-full h-20 resize-none"
                placeholder={template.placeholder}
              />
              <p className="text-text-secondary text-xs mt-1">
                Use {'{balance}'} to insert customer's balance dynamically
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Hindi Templates */}
      <div className="card">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          🇮🇳 Hindi Message Templates
        </h3>
        <div className="space-y-4">
          {templateKeys.map(template => (
            <div key={template.key}>
              <label className="block text-sm text-text-secondary mb-1">{template.label}</label>
              <textarea
                value={rules.messageTemplates.hindi[template.key]}
                onChange={(e) => updateTemplate('hindi', template.key, e.target.value)}
                className="input w-full h-20 resize-none"
                placeholder={template.placeholder}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Preview Card */}
      <div className="card bg-gradient-to-r from-success/10 to-transparent border-success/30">
        <h3 className="font-semibold text-white mb-2">📱 WhatsApp Preview</h3>
        <div className="bg-background rounded-xl p-4 max-w-md">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
              <MessageSquare size={20} className="text-success" />
            </div>
            <div>
              <p className="text-white text-sm">Chamunda Digital</p>
              <p className="text-text-secondary text-xs mt-1">
                {rules.messageTemplates.english.welcome.replace('{balance}', '₹2,45,000')}
              </p>
              <p className="text-text-secondary text-xs mt-2">✓ Delivered</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;

