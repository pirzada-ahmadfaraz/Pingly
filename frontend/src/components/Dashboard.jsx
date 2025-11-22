import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutGrid, AlertCircle, FileText, Zap, Users, Settings, Globe, Radio, ChevronDown, Mail, Send, MessageCircle, Slack, MessageSquare, Bell, Phone, Webhook } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'monitors');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMonitorDropdown, setShowMonitorDropdown] = useState(false);
  const [monitors, setMonitors] = useState([]);
  const [monitorsLoading, setMonitorsLoading] = useState(true);
  const dropdownRef = useRef(null);

  // Integrations state
  const [selectedIntegration, setSelectedIntegration] = useState('email');
  const [emailInput, setEmailInput] = useState('');
  const [additionalEmails, setAdditionalEmails] = useState([]);
  const [telegramConnected, setTelegramConnected] = useState(false);
  const [telegramUsername, setTelegramUsername] = useState('');
  const [telegramLoading, setTelegramLoading] = useState(false);
  const [discordWebhook, setDiscordWebhook] = useState('');
  const [discordConnected, setDiscordConnected] = useState(false);
  const [discordLoading, setDiscordLoading] = useState(false);
  const [slackWebhook, setSlackWebhook] = useState('');
  const [slackConnected, setSlackConnected] = useState(false);
  const [slackLoading, setSlackLoading] = useState(false);
  const [teamsWebhook, setTeamsWebhook] = useState('');
  const [teamsConnected, setTeamsConnected] = useState(false);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [pagerdutyRoutingKey, setPagerdutyRoutingKey] = useState('');
  const [pagerdutyConnected, setPagerdutyConnected] = useState(false);
  const [pagerdutyLoading, setPagerdutyLoading] = useState(false);
  const [googlechatWebhook, setGooglechatWebhook] = useState('');
  const [googlechatConnected, setGooglechatConnected] = useState(false);
  const [googlechatLoading, setGooglechatLoading] = useState(false);
  const [twilioAccountSid, setTwilioAccountSid] = useState('');
  const [twilioAuthToken, setTwilioAuthToken] = useState('');
  const [twilioFromNumber, setTwilioFromNumber] = useState('');
  const [twilioToNumber, setTwilioToNumber] = useState('');
  const [twilioConnected, setTwilioConnected] = useState(false);
  const [twilioLoading, setTwilioLoading] = useState(false);
  const [twilioPhoneNumbers, setTwilioPhoneNumbers] = useState([]);
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookMethod, setWebhookMethod] = useState('POST');
  const [webhookConnected, setWebhookConnected] = useState(false);
  const [webhookLoading, setWebhookLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');

      if (!token) {
        navigate('/signup');
        return;
      }

      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          navigate('/signup');
        }
      } catch (err) {
        navigate('/signup');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  // Fetch monitors
  useEffect(() => {
    const fetchMonitors = async () => {
      const token = localStorage.getItem('auth_token');

      if (!token) return;

      try {
        setMonitorsLoading(true);
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/monitors`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setMonitors(data.monitors || []);
        } else {
          console.error('Failed to fetch monitors:', data.error);
        }
      } catch (error) {
        console.error('Error fetching monitors:', error);
      } finally {
        setMonitorsLoading(false);
      }
    };

    if (!loading && user) {
      fetchMonitors();
      // Refresh monitors every 30 seconds
      const interval = setInterval(fetchMonitors, 30000);
      return () => clearInterval(interval);
    }
  }, [loading, user]);

  // Check Telegram connection status
  useEffect(() => {
    const checkTelegramStatus = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/integrations/telegram/status`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok && data.connected) {
          setTelegramConnected(true);
          setTelegramUsername(data.username);
        }
      } catch (error) {
        console.error('Error checking Telegram status:', error);
      }
    };

    if (!loading && user) {
      checkTelegramStatus();
    }
  }, [loading, user]);

  // Check Discord connection status
  useEffect(() => {
    const checkDiscordStatus = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/integrations/discord/status`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok && data.connected) {
          setDiscordConnected(true);
          setDiscordWebhook(data.webhook);
        }
      } catch (error) {
        console.error('Error checking Discord status:', error);
      }
    };

    if (!loading && user) {
      checkDiscordStatus();
    }
  }, [loading, user]);

  // Check Slack connection status
  useEffect(() => {
    const checkSlackStatus = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/integrations/slack/status`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok && data.connected) {
          setSlackConnected(true);
          setSlackWebhook(data.webhook);
        }
      } catch (error) {
        console.error('Error checking Slack status:', error);
      }
    };

    if (!loading && user) {
      checkSlackStatus();
    }
  }, [loading, user]);

  // Check Teams connection status
  useEffect(() => {
    const checkTeamsStatus = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/integrations/teams/status`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok && data.connected) {
          setTeamsConnected(true);
          setTeamsWebhook(data.webhook);
        }
      } catch (error) {
        console.error('Error checking Teams status:', error);
      }
    };

    if (!loading && user) {
      checkTeamsStatus();
    }
  }, [loading, user]);

  // Check PagerDuty connection status
  useEffect(() => {
    const checkPagerDutyStatus = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/integrations/pagerduty/status`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok && data.connected) {
          setPagerdutyConnected(true);
          setPagerdutyRoutingKey(data.routingKey);
        }
      } catch (error) {
        console.error('Error checking PagerDuty status:', error);
      }
    };

    if (!loading && user) {
      checkPagerDutyStatus();
    }
  }, [loading, user]);

  // Check Google Chat connection status
  useEffect(() => {
    const checkGoogleChatStatus = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/integrations/googlechat/status`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok && data.connected) {
          setGooglechatConnected(true);
          setGooglechatWebhook(data.webhook);
        }
      } catch (error) {
        console.error('Error checking Google Chat status:', error);
      }
    };

    if (!loading && user) {
      checkGoogleChatStatus();
    }
  }, [loading, user]);

  // Check Twilio SMS connection status
  useEffect(() => {
    const checkTwilioStatus = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/integrations/twiliosms/status`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok && data.connected) {
          setTwilioConnected(true);
          setTwilioFromNumber(data.phoneNumber);
          setTwilioToNumber(data.toNumber);
        }
      } catch (error) {
        console.error('Error checking Twilio SMS status:', error);
      }
    };

    if (!loading && user) {
      checkTwilioStatus();
    }
  }, [loading, user]);

  // Check Webhook connection status
  useEffect(() => {
    const checkWebhookStatus = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/integrations/webhook/status`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok && data.connected) {
          setWebhookConnected(true);
          setWebhookUrl(data.webhook);
          setWebhookMethod(data.method || 'POST');
        }
      } catch (error) {
        console.error('Error checking Webhook status:', error);
      }
    };

    if (!loading && user) {
      checkWebhookStatus();
    }
  }, [loading, user]);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowMonitorDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleCreateMonitor = (type) => {
    setShowMonitorDropdown(false);
    navigate(`/dashboard/monitors/new-monitor/${type}`);
  };

  // Integration handlers
  const handleAddEmail = () => {
    if (emailInput && emailInput.includes('@')) {
      setAdditionalEmails([...additionalEmails, emailInput]);
      setEmailInput('');
    }
  };

  const handleRemoveEmail = (index) => {
    setAdditionalEmails(additionalEmails.filter((_, i) => i !== index));
  };

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

  const handleConnectTelegram = async () => {
    setTelegramLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/integrations/telegram/connect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.botUrl) {
        // Open Telegram bot in new window
        window.open(data.botUrl, '_blank');

        // Poll for connection status
        const pollInterval = setInterval(async () => {
          const statusResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/integrations/telegram/status`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          const statusData = await statusResponse.json();

          if (statusData.connected) {
            setTelegramConnected(true);
            setTelegramUsername(statusData.username);
            clearInterval(pollInterval);
            setTelegramLoading(false);
          }
        }, 3000); // Check every 3 seconds

        // Stop polling after 2 minutes
        setTimeout(() => {
          clearInterval(pollInterval);
          setTelegramLoading(false);
        }, 120000);
      }
    } catch (error) {
      console.error('Error connecting Telegram:', error);
      setTelegramLoading(false);
    }
  };

  const handleDisconnectTelegram = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/integrations/telegram/disconnect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setTelegramConnected(false);
        setTelegramUsername('');
      }
    } catch (error) {
      console.error('Error disconnecting Telegram:', error);
    }
  };

  // Toast notification handler
  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 3000);
  };

  // Discord handlers
  const handleAddDiscordWebhook = async () => {
    if (!discordWebhook || !discordWebhook.startsWith('https://discord.com/api/webhooks/')) {
      showToast('Please enter a valid Discord webhook URL');
      return;
    }

    setDiscordLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/integrations/discord/connect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ webhookUrl: discordWebhook }),
      });

      const data = await response.json();

      if (response.ok) {
        setDiscordConnected(true);
        showToast('Discord notifications activated');
      } else {
        showToast(data.error || 'Failed to connect Discord webhook');
      }
    } catch (error) {
      console.error('Error connecting Discord:', error);
      showToast('Failed to connect Discord webhook');
    } finally {
      setDiscordLoading(false);
    }
  };

  const handleDisconnectDiscord = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/integrations/discord/disconnect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setDiscordConnected(false);
        setDiscordWebhook('');
        showToast('Discord notifications deactivated');
      }
    } catch (error) {
      console.error('Error disconnecting Discord:', error);
    }
  };

  // Slack handlers
  const handleAddSlackWebhook = async () => {
    if (!slackWebhook || !slackWebhook.startsWith('https://hooks.slack.com/services/')) {
      showToast('Please enter a valid Slack webhook URL');
      return;
    }

    setSlackLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/integrations/slack/connect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ webhookUrl: slackWebhook }),
      });

      const data = await response.json();

      if (response.ok) {
        setSlackConnected(true);
        showToast('Slack notifications activated');
      } else {
        showToast(data.error || 'Failed to connect Slack webhook');
      }
    } catch (error) {
      console.error('Error connecting Slack:', error);
      showToast('Failed to connect Slack webhook');
    } finally {
      setSlackLoading(false);
    }
  };

  const handleDisconnectSlack = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/integrations/slack/disconnect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setSlackConnected(false);
        setSlackWebhook('');
        showToast('Slack notifications deactivated');
      }
    } catch (error) {
      console.error('Error disconnecting Slack:', error);
    }
  };

  // Teams handlers
  const handleAddTeamsWebhook = async () => {
    if (!teamsWebhook || !teamsWebhook.includes('webhook.office.com')) {
      showToast('Please enter a valid Microsoft Teams webhook URL');
      return;
    }

    setTeamsLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/integrations/teams/connect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ webhookUrl: teamsWebhook }),
      });

      const data = await response.json();

      if (response.ok) {
        setTeamsConnected(true);
        showToast('Microsoft Teams notifications activated');
      } else {
        showToast(data.error || 'Failed to connect Teams webhook');
      }
    } catch (error) {
      console.error('Error connecting Teams:', error);
      showToast('Failed to connect Teams webhook');
    } finally {
      setTeamsLoading(false);
    }
  };

  const handleDisconnectTeams = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/integrations/teams/disconnect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setTeamsConnected(false);
        setTeamsWebhook('');
        showToast('Microsoft Teams notifications deactivated');
      }
    } catch (error) {
      console.error('Error disconnecting Teams:', error);
    }
  };

  // PagerDuty handlers
  const handleConnectPagerDuty = async () => {
    if (!pagerdutyRoutingKey || pagerdutyRoutingKey.length < 32) {
      showToast('Please enter a valid PagerDuty routing key');
      return;
    }

    setPagerdutyLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/integrations/pagerduty/connect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ routingKey: pagerdutyRoutingKey }),
      });

      const data = await response.json();

      if (response.ok) {
        setPagerdutyConnected(true);
        showToast('PagerDuty notifications activated');
      } else {
        showToast(data.error || 'Failed to connect PagerDuty');
      }
    } catch (error) {
      console.error('Error connecting PagerDuty:', error);
      showToast('Failed to connect PagerDuty');
    } finally {
      setPagerdutyLoading(false);
    }
  };

  const handleDisconnectPagerDuty = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/integrations/pagerduty/disconnect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setPagerdutyConnected(false);
        setPagerdutyRoutingKey('');
        showToast('PagerDuty notifications deactivated');
      }
    } catch (error) {
      console.error('Error disconnecting PagerDuty:', error);
    }
  };

  // Google Chat handlers
  const handleAddGoogleChatWebhook = async () => {
    if (!googlechatWebhook || !googlechatWebhook.includes('chat.googleapis.com')) {
      showToast('Please enter a valid Google Chat webhook URL');
      return;
    }

    setGooglechatLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/integrations/googlechat/connect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ webhookUrl: googlechatWebhook }),
      });

      const data = await response.json();

      if (response.ok) {
        setGooglechatConnected(true);
        showToast('Google Chat notifications activated');
      } else {
        showToast(data.error || 'Failed to connect Google Chat webhook');
      }
    } catch (error) {
      console.error('Error connecting Google Chat:', error);
      showToast('Failed to connect Google Chat webhook');
    } finally {
      setGooglechatLoading(false);
    }
  };

  const handleDisconnectGoogleChat = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/integrations/googlechat/disconnect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setGooglechatConnected(false);
        setGooglechatWebhook('');
        showToast('Google Chat notifications deactivated');
      }
    } catch (error) {
      console.error('Error disconnecting Google Chat:', error);
    }
  };

  // Twilio SMS handlers
  const handleConnectTwilioApp = () => {
    // Open Twilio Connect flow (placeholder for now)
    showToast('Twilio Connect App integration coming soon');
  };

  const handleAddPhoneNumber = () => {
    if (!newPhoneNumber) {
      showToast('Please fill in this field.');
      return;
    }

    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(newPhoneNumber)) {
      showToast('Phone number must be in E.164 format (e.g., +1234567890)');
      return;
    }

    if (twilioPhoneNumbers.includes(newPhoneNumber)) {
      showToast('Phone number already added');
      return;
    }

    setTwilioPhoneNumbers([...twilioPhoneNumbers, newPhoneNumber]);
    setNewPhoneNumber('');
    showToast('Phone number added successfully');
  };

  const handleRemovePhoneNumber = (phoneNumber) => {
    setTwilioPhoneNumbers(twilioPhoneNumbers.filter(num => num !== phoneNumber));
    showToast('Phone number removed');
  };

  const handleConnectTwilioSms = async () => {
    if (!twilioAccountSid || !twilioAuthToken || !twilioFromNumber || !twilioToNumber) {
      showToast('Please fill in all Twilio SMS fields');
      return;
    }

    setTwilioLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/integrations/twiliosms/connect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountSid: twilioAccountSid,
          authToken: twilioAuthToken,
          phoneNumber: twilioFromNumber,
          toNumber: twilioToNumber,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTwilioConnected(true);
        showToast('Twilio SMS notifications activated');
      } else {
        showToast(data.error || 'Failed to connect Twilio SMS');
      }
    } catch (error) {
      console.error('Error connecting Twilio SMS:', error);
      showToast('Failed to connect Twilio SMS');
    } finally {
      setTwilioLoading(false);
    }
  };

  const handleDisconnectTwilioSms = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/integrations/twiliosms/disconnect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setTwilioConnected(false);
        setTwilioAccountSid('');
        setTwilioAuthToken('');
        setTwilioFromNumber('');
        setTwilioToNumber('');
        setTwilioPhoneNumbers([]);
        showToast('Twilio SMS notifications deactivated');
      }
    } catch (error) {
      console.error('Error disconnecting Twilio SMS:', error);
    }
  };

  // Webhook handlers
  const handleConnectWebhook = async () => {
    if (!webhookUrl) {
      showToast('Please enter a webhook URL');
      return;
    }

    setWebhookLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/integrations/webhook/connect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          webhookUrl: webhookUrl,
          method: webhookMethod,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setWebhookConnected(true);
        showToast('Webhook notifications activated');
      } else {
        showToast(data.error || 'Failed to connect webhook');
      }
    } catch (error) {
      console.error('Error connecting webhook:', error);
      showToast('Failed to connect webhook');
    } finally {
      setWebhookLoading(false);
    }
  };

  const handleDisconnectWebhook = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/integrations/webhook/disconnect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setWebhookConnected(false);
        setWebhookUrl('');
        setWebhookMethod('POST');
        showToast('Webhook notifications deactivated');
      }
    } catch (error) {
      console.error('Error disconnecting webhook:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const menuItems = [
    { id: 'monitors', label: 'Monitors', icon: LayoutGrid },
    { id: 'incidents', label: 'Incidents', icon: AlertCircle },
    { id: 'status-pages', label: 'Status Pages', icon: FileText },
    { id: 'integrations', label: 'Integrations', icon: Zap },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* Sidebar */}
      <aside className="w-56 bg-[#0f0f0f] border-r border-white/10 flex flex-col fixed h-full">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Pingly Logo" className="h-8 w-8" />
            <span className="text-xl font-bold">Pingly</span>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      if (item.id === 'incidents') {
                        navigate('/dashboard/incidents');
                      } else if (item.id === 'status-pages') {
                        navigate('/dashboard/status-pages');
                      } else {
                        setActiveTab(item.id);
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                      activeTab === item.id
                        ? 'bg-green-500/10 text-green-500'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="text-xs text-gray-400 max-w-[100px] truncate">
                {user?.email}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-500 transition-colors text-xs"
              title="Logout"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-56 flex">
        {/* Center Content */}
        <div className="flex-1 p-8">
          <h1 className="text-3xl font-bold mb-8">
            {activeTab === 'integrations' ? 'Integrations' : 'Monitors'}
          </h1>

          {activeTab === 'integrations' ? (
            // Integrations View
            <div className="flex gap-6">
              {/* Integrations Sidebar */}
              <div className="w-56 bg-[#0f0f0f] border border-white/10 rounded-lg p-4">
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
                            ? 'bg-[#1a1a1a] text-white'
                            : 'text-gray-400 hover:bg-[#1a1a1a]/50 hover:text-white'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isSelected ? integration.color : ''}`} />
                        <span className="font-medium text-sm">{integration.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Integrations Content */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-6">
                  {integrations.find(i => i.id === selectedIntegration)?.name} Notifications
                </h2>

                {selectedIntegration === 'email' ? (
                  <div className="bg-[#0f0f0f] border border-white/10 rounded-lg p-6">
                    <p className="text-gray-400 mb-6">
                      You can add up to 2 more email addresses apart from primary emails. We'll send notifications to these emails if any of your monitors go down.
                    </p>

                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-gray-300 font-medium">Primary Emails:</span>
                        <span className="text-gray-400">{user?.email || 'ahmaddiscord2@gmail.com'}</span>
                      </div>
                    </div>

                    {additionalEmails.length > 0 && (
                      <div className="mb-6">
                        <div className="text-gray-300 font-medium mb-3">Additional Emails:</div>
                        <div className="space-y-2">
                          {additionalEmails.map((email, index) => (
                            <div key={index} className="flex items-center justify-between bg-[#1a1a1a] px-4 py-2 rounded-lg">
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
                          className="flex-1 px-4 py-3 bg-transparent border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50"
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
                ) : selectedIntegration === 'telegram' ? (
                  <div className="bg-[#0f0f0f] border border-white/10 rounded-lg p-6">
                    <p className="text-gray-400 mb-6">
                      Click the button below to connect your Telegram account.
                    </p>

                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-gray-300 font-medium">Current status:</span>
                        <span className={telegramConnected ? "text-green-400" : "text-gray-400"}>
                          {telegramConnected ? `Connected with @${telegramUsername}` : 'Not connected'}
                        </span>
                      </div>

                      {!telegramConnected ? (
                        <button
                          onClick={handleConnectTelegram}
                          disabled={telegramLoading}
                          className="px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                        >
                          {telegramLoading ? 'Waiting for connection...' : 'Connect Telegram'}
                        </button>
                      ) : (
                        <button
                          onClick={handleDisconnectTelegram}
                          className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                        >
                          Disconnect Telegram
                        </button>
                      )}
                    </div>

                    <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-2">
                        Do not forget to click <span className="text-white font-semibold">start</span>, otherwise the bot will not work
                      </p>
                      <p className="text-gray-400 text-sm">
                        After connecting to Telegram, if it's not reflected here please refresh the page.
                      </p>
                    </div>
                  </div>
                ) : selectedIntegration === 'discord' ? (
                  <div className="bg-[#0f0f0f] border border-white/10 rounded-lg p-6">
                    <p className="text-gray-400 mb-6">
                      To receive Discord notifications, provide a webhook URL. We'll send POST requests to this URL.
                    </p>

                    <div className="mb-6">
                      <div className="mb-4">
                        <div className="text-gray-300 font-medium mb-2">Current status:</div>
                        <div className="text-gray-400">
                          {discordConnected ? 'Connected to' : 'Not connected'}
                        </div>
                        {discordConnected && (
                          <a
                            href={discordWebhook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-400 hover:text-green-300 text-sm break-all underline"
                          >
                            {discordWebhook}
                          </a>
                        )}
                      </div>

                      {!discordConnected ? (
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={discordWebhook}
                            onChange={(e) => setDiscordWebhook(e.target.value)}
                            placeholder="Enter webhook URL"
                            className="flex-1 px-4 py-3 bg-transparent border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50"
                          />
                          <button
                            onClick={handleAddDiscordWebhook}
                            disabled={discordLoading}
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                          >
                            {discordLoading ? 'Adding...' : 'Add Webhook URL'}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={handleDisconnectDiscord}
                          className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-4">
                      <p className="text-gray-400 text-sm">
                        Steps to setup{' '}
                        <a
                          href="https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-400 hover:text-indigo-300 underline"
                        >
                          Discord Incoming webhook
                        </a>
                      </p>
                    </div>
                  </div>
                ) : selectedIntegration === 'slack' ? (
                  <div className="bg-[#0f0f0f] border border-white/10 rounded-lg p-6">
                    <p className="text-gray-400 mb-6">
                      To enable Slack notifications, you need to activate Incoming Webhooks. Once activated, simply provide the webhook URL for each Slack channel where you'd like to receive notifications.
                    </p>

                    <div className="mb-6">
                      <div className="mb-4">
                        <div className="text-gray-300 font-medium mb-2">Current status:</div>
                        <div className="text-gray-400">
                          {slackConnected ? 'Connected' : 'Not connected'}
                        </div>
                        {slackConnected && (
                          <div className="text-gray-400 text-sm mt-2 break-all">
                            {slackWebhook}
                          </div>
                        )}
                      </div>

                      {!slackConnected ? (
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={slackWebhook}
                            onChange={(e) => setSlackWebhook(e.target.value)}
                            placeholder="Enter webhook URL"
                            className="flex-1 px-4 py-3 bg-transparent border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50"
                          />
                          <button
                            onClick={handleAddSlackWebhook}
                            disabled={slackLoading}
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                          >
                            {slackLoading ? 'Adding...' : 'Add Webhook URL'}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={handleDisconnectSlack}
                          className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-4">
                      <p className="text-gray-400 text-sm">
                        Steps to setup{' '}
                        <a
                          href="https://api.slack.com/messaging/webhooks"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-pink-400 hover:text-pink-300 underline"
                        >
                          Slack Incoming Webhook
                        </a>
                      </p>
                    </div>
                  </div>
                ) : selectedIntegration === 'teams' ? (
                  <div className="bg-[#0f0f0f] border border-white/10 rounded-lg p-6">
                    <p className="text-gray-400 mb-6">
                      To enable Microsoft Teams notifications, you need to activate Incoming Webhooks. Once activated, simply provide the webhook URL for each Teams channel where you'd like to receive notifications.
                    </p>

                    <div className="mb-6">
                      <div className="mb-4">
                        <div className="text-gray-300 font-medium mb-2">Current status:</div>
                        <div className="text-gray-400">
                          {teamsConnected ? 'Connected' : 'Not connected'}
                        </div>
                        {teamsConnected && (
                          <div className="text-gray-400 text-sm mt-2 break-all">
                            {teamsWebhook}
                          </div>
                        )}
                      </div>

                      {!teamsConnected ? (
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={teamsWebhook}
                            onChange={(e) => setTeamsWebhook(e.target.value)}
                            placeholder="Enter webhook URL"
                            className="flex-1 px-4 py-3 bg-transparent border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                          />
                          <button
                            onClick={handleAddTeamsWebhook}
                            disabled={teamsLoading}
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                          >
                            {teamsLoading ? 'Adding...' : 'Add Webhook URL'}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={handleDisconnectTeams}
                          className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-4">
                      <p className="text-gray-400 text-sm">
                        Steps to setup{' '}
                        <a
                          href="https://learn.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 underline"
                        >
                          Teams Incoming webhook
                        </a>
                      </p>
                    </div>
                  </div>
                ) : selectedIntegration === 'pagerduty' ? (
                  <div className="bg-[#0f0f0f] border border-white/10 rounded-lg p-6">
                    <p className="text-gray-400 mb-6">
                      PagerDuty is an incident management platform. Connect your PagerDuty service to receive critical alerts when monitors go down.
                    </p>

                    <div className="mb-6">
                      <div className="mb-4">
                        <div className="text-gray-300 font-medium mb-2">Current status:</div>
                        <div className="text-gray-400">
                          {pagerdutyConnected ? 'Connected' : 'Not connected'}
                        </div>
                        {pagerdutyConnected && (
                          <div className="text-gray-400 text-sm mt-2">
                            Routing Key: {pagerdutyRoutingKey}
                          </div>
                        )}
                      </div>

                      {!pagerdutyConnected ? (
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={pagerdutyRoutingKey}
                            onChange={(e) => setPagerdutyRoutingKey(e.target.value)}
                            placeholder="Enter PagerDuty routing key"
                            className="flex-1 px-4 py-3 bg-transparent border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50"
                          />
                          <button
                            onClick={handleConnectPagerDuty}
                            disabled={pagerdutyLoading}
                            className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                          >
                            {pagerdutyLoading ? 'Connecting...' : 'Connect'}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={handleDisconnectPagerDuty}
                          className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                        >
                          Disconnect
                        </button>
                      )}
                    </div>

                    <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-4">
                      <p className="text-gray-400 text-sm">
                        Get your routing key from{' '}
                        <a
                          href="https://support.pagerduty.com/docs/services-and-integrations#create-a-generic-events-api-integration"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 underline"
                        >
                          PagerDuty Events API v2 integration
                        </a>
                      </p>
                    </div>
                  </div>
                ) : selectedIntegration === 'googlechat' ? (
                  <div className="bg-[#0f0f0f] border border-white/10 rounded-lg p-6">
                    <p className="text-gray-400 mb-6">
                      Google Chat is a communication platform. Connect your Google Chat space to receive notifications when monitors go down.
                    </p>

                    <div className="mb-6">
                      <div className="mb-4">
                        <div className="text-gray-300 font-medium mb-2">Current status:</div>
                        <div className="text-gray-400">
                          {googlechatConnected ? 'Connected' : 'Not connected'}
                        </div>
                        {googlechatConnected && (
                          <div className="text-gray-400 text-sm mt-2 break-all">
                            {googlechatWebhook}
                          </div>
                        )}
                      </div>

                      {!googlechatConnected ? (
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={googlechatWebhook}
                            onChange={(e) => setGooglechatWebhook(e.target.value)}
                            placeholder="Enter Google Chat webhook URL"
                            className="flex-1 px-4 py-3 bg-transparent border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50"
                          />
                          <button
                            onClick={handleAddGoogleChatWebhook}
                            disabled={googlechatLoading}
                            className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                          >
                            {googlechatLoading ? 'Adding...' : 'Add Webhook'}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={handleDisconnectGoogleChat}
                          className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-4">
                      <p className="text-gray-400 text-sm">
                        Setup{' '}
                        <a
                          href="https://developers.google.com/chat/how-tos/webhooks"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 underline"
                        >
                          Google Chat incoming webhook
                        </a>
                      </p>
                    </div>
                  </div>
                ) : selectedIntegration === 'twiliosms' ? (
                  <div className="bg-[#0f0f0f] border border-white/10 rounded-lg p-8">
                    <h2 className="text-2xl font-bold text-white mb-6">Twilio SMS Notifications</h2>

                    <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6 mb-6">
                      <p className="text-gray-400 mb-6">
                        Connect your Twilio account to enable SMS notifications. We will purchase a phone number on your behalf to send SMS messages. You can add as many numbers as you want to receive SMS notifications.
                      </p>

                      <div className="mb-6">
                        <div className="text-lg font-semibold text-white mb-2">Current status: <span className="text-gray-400 font-normal">{twilioConnected ? 'Connected' : 'Not connected'}</span></div>
                      </div>

                      {!twilioConnected && (
                        <button
                          onClick={handleConnectTwilioApp}
                          className="px-6 py-3 bg-[#F22F46] hover:bg-[#d62839] text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" />
                            <path fill="#F22F46" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                            <path fill="white" d="M12 7a5 5 0 100 10 5 5 0 000-10z"/>
                          </svg>
                          Twilio Connect App
                        </button>
                      )}
                    </div>

                    <div className="mb-6">
                      <h3 className="text-xl font-semibold text-white mb-4">Phone Numbers</h3>

                      {twilioPhoneNumbers.length === 0 ? (
                        <div className="text-gray-400 mb-4">No Numbers</div>
                      ) : (
                        <div className="space-y-2 mb-4">
                          {twilioPhoneNumbers.map((number, index) => (
                            <div key={index} className="flex items-center justify-between bg-[#1a1a1a] border border-white/10 rounded-lg p-3">
                              <span className="text-white">{number}</span>
                              <button
                                onClick={() => handleRemovePhoneNumber(number)}
                                className="text-red-400 hover:text-red-300 text-sm"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={newPhoneNumber}
                          onChange={(e) => setNewPhoneNumber(e.target.value)}
                          placeholder="+1 Enter phone number"
                          className="flex-1 px-4 py-3 bg-transparent border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                        />
                        <button
                          onClick={handleAddPhoneNumber}
                          className="px-6 py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-lg font-medium transition-colors"
                        >
                          Add Phone Number
                        </button>
                      </div>
                    </div>

                    <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-2">
                        <strong>NOTE:</strong> Please do not connect and disconnect multiple times, as Twilio will charge everytime when you buy phone number.
                      </p>
                      <p className="text-gray-400 text-sm">
                        For more details, visit{' '}
                        <a
                          href="https://www.twilio.com/docs/sms"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 underline"
                        >
                          Twilio SMS Notifications
                        </a>
                      </p>
                    </div>
                  </div>
                ) : selectedIntegration === 'webhook' ? (
                  <div className="bg-[#0f0f0f] border border-white/10 rounded-lg p-8">
                    <h2 className="text-2xl font-bold text-white mb-6">Webhook Notifications</h2>

                    <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6 mb-6">
                      <p className="text-gray-400 mb-6">
                        To receive webhook notifications, provide a webhook URL. We'll send POST requests to this URL.
                      </p>

                      <div className="mb-6">
                        <div className="text-lg font-semibold text-white mb-2">Current status: <span className="text-gray-400 font-normal">{webhookConnected ? 'Connected' : 'Not connected'}</span></div>
                      </div>

                      {!webhookConnected ? (
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={webhookUrl}
                            onChange={(e) => setWebhookUrl(e.target.value)}
                            placeholder="Enter webhook URL"
                            className="flex-1 px-4 py-3 bg-transparent border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                          />
                          <button
                            onClick={handleConnectWebhook}
                            disabled={webhookLoading}
                            className="px-6 py-3 bg-[#5865F2] hover:bg-[#4752C4] disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                          >
                            {webhookLoading ? 'Adding...' : 'Add Webhook URL'}
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="text-gray-400 text-sm break-all">
                            Connected to: {webhookUrl}
                          </div>
                          <button
                            onClick={handleDisconnectWebhook}
                            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#0f0f0f] border border-white/10 rounded-lg p-6">
                    <p className="text-gray-400 mb-4">
                      {integrations.find(i => i.id === selectedIntegration)?.name} integration is coming soon. Stay tuned for updates!
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                      <span>Under Development</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Monitors View
            <>
              {/* Search and Filter */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search sites..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50"
                  />
                </div>
                <button className="px-6 py-3 bg-[#1a1a1a] border border-white/10 rounded-lg hover:bg-white/5 transition-colors flex items-center gap-2 text-sm">
                  <span>Filter</span>
                </button>
              </div>

          {/* Table */}
          <div className="bg-[#0f0f0f] border border-white/10 rounded-lg overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-4 gap-4 px-6 py-4 border-b border-white/10 text-sm font-medium text-gray-400">
              <div className="flex items-center gap-1">
                Name <span className="text-xs">↕</span>
              </div>
              <div>Type</div>
              <div>Frequency</div>
              <div className="flex items-center gap-1">
                Status <span className="text-xs">↕</span>
              </div>
            </div>

            {/* Monitors List */}
            {monitorsLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mb-4"></div>
                <p className="text-gray-400">Loading monitors...</p>
              </div>
            ) : monitors.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <p className="text-gray-400 text-lg">Nothing to see here</p>
                <p className="text-gray-500 text-sm mt-2">Create your first monitor to get started</p>
              </div>
            ) : (
              monitors
                .filter(monitor =>
                  monitor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (monitor.url && monitor.url.toLowerCase().includes(searchQuery.toLowerCase())) ||
                  (monitor.ipAddress && monitor.ipAddress.toLowerCase().includes(searchQuery.toLowerCase()))
                )
                .map((monitor) => (
                  <div
                    key={monitor._id}
                    onClick={() => navigate(`/dashboard/monitors/${monitor._id}`)}
                    className="grid grid-cols-4 gap-4 px-6 py-4 border-b border-white/10 hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        monitor.lastStatus === 'up' ? 'bg-green-500' :
                        monitor.lastStatus === 'down' ? 'bg-red-500' :
                        'bg-gray-400'
                      }`}></div>
                      <span className="text-white font-medium">{monitor.name}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-400 capitalize">{monitor.type}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-400">{monitor.frequency}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`${
                        monitor.lastStatus === 'up' ? 'text-green-500' :
                        monitor.lastStatus === 'down' ? 'text-red-500' :
                        'text-gray-400'
                      } font-medium capitalize`}>
                        {monitor.lastStatus || 'Pending'}
                      </span>
                      {monitor.uptime24h !== undefined && (
                        <span className="text-xs text-gray-500">{monitor.uptime24h}%</span>
                      )}
                    </div>
                  </div>
                ))
            )}
          </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-400">Showing {monitors.length} of {monitors.length} rows</p>
                <div className="flex gap-2">
                  <button className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
                    Show 10 ▼
                  </button>
                  <button className="px-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-sm text-gray-500">
                    Previous
                  </button>
                  <button className="px-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-sm text-gray-500">
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Sidebar */}
        <aside className="w-80 bg-[#0f0f0f] border-l border-white/10 p-6">
          {/* New Monitor Dropdown */}
          <div className="relative mb-8" ref={dropdownRef}>
            <button
              onClick={() => setShowMonitorDropdown(!showMonitorDropdown)}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <ChevronDown size={20} />
              <span>New Monitor</span>
            </button>

            {/* Dropdown Menu */}
            {showMonitorDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-lg overflow-hidden shadow-xl z-50">
                {/* HTTP Monitor Option */}
                <button
                  onClick={() => handleCreateMonitor('http')}
                  className="w-full px-6 py-4 text-left hover:bg-white/5 transition-colors border-b border-white/10"
                >
                  <div className="flex items-start gap-3">
                    <Globe size={24} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-white font-semibold text-base mb-1">HTTP Monitor</h4>
                      <p className="text-gray-400 text-sm">Monitor websites and API endpoints</p>
                    </div>
                  </div>
                </button>

                {/* Ping Monitor Option */}
                <button
                  onClick={() => handleCreateMonitor('ping')}
                  className="w-full px-6 py-4 text-left hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Radio size={24} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-white font-semibold text-base mb-1">Ping Monitor</h4>
                      <p className="text-gray-400 text-sm">Monitor server availability using IP addresses</p>
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Current Status */}
          <div className="mb-8">
            <h3 className="text-lg font-bold mb-4">Current Status</h3>
            <div className="flex items-center justify-between mb-2">
              <div className="flex gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
              </div>
            </div>
            <p className="text-sm text-gray-400">Using {monitors.length} out of 5 Monitors</p>
          </div>

          {/* Last 24 Hours */}
          <div>
            <h3 className="text-lg font-bold mb-4">Last 24 hours</h3>
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Overall</p>
                  <p className="text-sm text-gray-400">Uptime</p>
                </div>
                <div className="text-3xl font-bold">
                  {monitors.length > 0
                    ? (monitors.reduce((sum, m) => sum + (m.uptime24h || 0), 0) / monitors.length).toFixed(1)
                    : 0}%
                </div>
              </div>

              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-400">Incidents</p>
                <p className="text-3xl font-bold">
                  {monitors.filter(m => m.lastStatus === 'down').length}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Active</p>
                  <p className="text-2xl font-bold">{monitors.filter(m => m.lastStatus === 'up').length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Down</p>
                  <p className="text-2xl font-bold">{monitors.filter(m => m.lastStatus === 'down').length}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-8 right-8 bg-[#1a1a1a] border border-white/10 rounded-lg px-6 py-4 shadow-2xl animate-slide-up z-50">
          <p className="text-white text-sm">{toast.message}</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
