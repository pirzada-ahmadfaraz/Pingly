import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Send,
  MessageCircle,
  Slack,
  MessageSquare,
  Bell,
  Phone,
  Webhook
} from 'lucide-react';

const Integrations = () => {
  const navigate = useNavigate();
  const [selectedIntegration, setSelectedIntegration] = useState('email');
  const [emailInput, setEmailInput] = useState('');
  const [additionalEmails, setAdditionalEmails] = useState([]);

  const integrations = [
    { id: 'email', name: 'Email', icon: Mail, color: 'text-cyan-400' },
    { id: 'telegram', name: 'Telegram', icon: Send, color: 'text-blue-400' },
    { id: 'discord', name: 'Discord', icon: MessageCircle, color: 'text-indigo-400' },
    { id: 'slack', name: 'Slack', icon: Slack, color: 'text-pink-400' },
    { id: 'teams', name: 'Teams', icon: MessageSquare, color: 'text-blue-500' },
    { id: 'pagerduty', name: 'PagerDuty', icon: Bell, color: 'text-green-400' },
    { id: 'googlechat', name: 'Google Chat', icon: MessageSquare, color: 'text-green-500' },
    { id: 'twiliosms', name: 'Twilio SMS', icon: Phone, color: 'text-red-400' },
    { id: 'webhook', name: 'Webhook', icon: Webhook, color: 'text-blue-300' },
  ];

  const handleAddEmail = () => {
    if (emailInput && emailInput.includes('@')) {
      setAdditionalEmails([...additionalEmails, emailInput]);
      setEmailInput('');
    }
  };

  const handleRemoveEmail = (index) => {
    setAdditionalEmails(additionalEmails.filter((_, i) => i !== index));
  };

  const renderEmailIntegration = () => {
    const primaryEmail = localStorage.getItem('user_email') || 'ahmaddiscord2@gmail.com';

    return (
      <div className="bg-gray-800/50 rounded-lg p-6">
        <p className="text-gray-400 mb-6">
          You can add up to 2 more email addresses apart from primary emails. We'll send notifications to these emails if any of your monitors go down.
        </p>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-gray-300 font-medium">Primary Emails:</span>
            <span className="text-gray-400">{primaryEmail}</span>
          </div>
        </div>

        {additionalEmails.length > 0 && (
          <div className="mb-6">
            <div className="text-gray-300 font-medium mb-3">Additional Emails:</div>
            <div className="space-y-2">
              {additionalEmails.map((email, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-700/50 px-4 py-2 rounded-lg">
                  <span className="text-gray-400">{email}</span>
                  <button
                    onClick={() => handleRemoveEmail(index)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {additionalEmails.length < 2 && (
          <div className="flex gap-3">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="Enter email address"
              className="flex-1 px-4 py-3 bg-transparent border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              onKeyPress={(e) => e.key === 'Enter' && handleAddEmail()}
            />
            <button
              onClick={handleAddEmail}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              Add Email
            </button>
          </div>
        )}

        {additionalEmails.length >= 2 && (
          <p className="text-yellow-500 text-sm mt-4">
            Maximum limit of 2 additional emails reached
          </p>
        )}
      </div>
    );
  };

  const renderComingSoon = (name) => (
    <div className="bg-gray-800/50 rounded-lg p-6">
      <p className="text-gray-400 mb-4">
        {name} integration is coming soon. Stay tuned for updates!
      </p>
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
        <span>Under Development</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-400 hover:text-white mb-2 text-sm"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-2xl font-bold">Integrations</h1>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 border-r border-gray-800 min-h-[calc(100vh-73px)] p-4">
          <div className="space-y-1">
            {integrations.map((integration) => {
              const Icon = integration.icon;
              const isSelected = selectedIntegration === integration.id;

              return (
                <button
                  key={integration.id}
                  onClick={() => setSelectedIntegration(integration.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isSelected
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isSelected ? integration.color : ''}`} />
                  <span className="font-medium">{integration.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-4xl">
            <h2 className="text-2xl font-bold mb-6">
              {integrations.find(i => i.id === selectedIntegration)?.name} Notifications
            </h2>

            {selectedIntegration === 'email' && renderEmailIntegration()}
            {selectedIntegration === 'telegram' && renderComingSoon('Telegram')}
            {selectedIntegration === 'discord' && renderComingSoon('Discord')}
            {selectedIntegration === 'slack' && renderComingSoon('Slack')}
            {selectedIntegration === 'teams' && renderComingSoon('Microsoft Teams')}
            {selectedIntegration === 'pagerduty' && renderComingSoon('PagerDuty')}
            {selectedIntegration === 'googlechat' && renderComingSoon('Google Chat')}
            {selectedIntegration === 'twiliosms' && renderComingSoon('Twilio SMS')}
            {selectedIntegration === 'webhook' && renderComingSoon('Webhook')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Integrations;
