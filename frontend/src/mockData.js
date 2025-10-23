export const features = [
  {
    id: 1,
    title: 'HTTP Monitoring',
    description: 'Proactively monitor your HTTP endpoints performance from 6 different regions and receive instant alerts for any issues, ensuring optimal user experience',
    icon: 'Globe'
  },
  {
    id: 2,
    title: 'Ping Monitoring',
    description: 'Continuously check the responsiveness of your servers and devices with our advanced ping monitoring system',
    icon: 'Activity'
  },
  {
    id: 3,
    title: 'SSL Monitor',
    description: 'Stay secure with timely notifications 30, 7, and 1 day before SSL expiry, preventing potential security vulnerabilities and maintaining visitor trust',
    icon: 'Shield'
  },
  {
    id: 4,
    title: 'Domain Expiry',
    description: 'Safeguard your online identity with automated domain expiration alerts, ensuring uninterrupted web presence and brand protection',
    icon: 'Calendar'
  }
];

export const additionalFeatures = [
  {
    id: 1,
    title: 'Invite Team Members',
    description: 'Collaborate with your team by inviting members to your monitoring dashboard.',
    icon: 'Users'
  },
  {
    id: 2,
    title: 'Response Time Monitoring',
    description: 'Track and visualize response times with detailed charts to identify performance issues.',
    icon: 'TrendingUp'
  },
  {
    id: 3,
    title: 'Custom HTTP Requests',
    description: 'Create and monitor custom HTTP headers and payloads.',
    icon: 'Code'
  },
  {
    id: 4,
    title: 'Maintenance Windows',
    description: 'Set up maintenance periods to avoid alerts during planned downtime.',
    icon: 'Wrench'
  },
  {
    id: 5,
    title: 'Versatile Notification Channels',
    description: 'Stay informed with instant alerts via your preferred channels—Email, Telegram, and more.',
    icon: 'Bell'
  },
  {
    id: 6,
    title: 'Real-time Alerts',
    description: 'Get notified instantly when your services go down or come back online.',
    icon: 'Zap'
  },
  {
    id: 7,
    title: 'Status Page Builder',
    description: 'Create beautiful, branded status pages to keep your users informed.',
    icon: 'Layout'
  },
  {
    id: 8,
    title: 'Performance Analytics',
    description: 'Comprehensive analytics and reporting for all your monitored services.',
    icon: 'BarChart'
  }
];

export const notificationChannels = [
  { id: 1, name: 'Email', emoji: '📧' },
  { id: 2, name: 'Telegram', emoji: '📨' },
  { id: 3, name: 'Discord', emoji: '🎮' },
  { id: 4, name: 'Slack', emoji: '💬' },
  { id: 5, name: 'Teams', emoji: '👥' },
  { id: 6, name: 'Webhook', emoji: '🔗' },
  { id: 7, name: 'Google Chat', emoji: '💬' },
  { id: 8, name: 'Twilio SMS', emoji: '📱' },
  { id: 9, name: 'PagerDuty', emoji: '🔔' }
];

export const pricingPlans = [
  {
    id: 1,
    name: 'Free',
    price: { monthly: 0, yearly: 0 },
    description: 'Ideal for trying out.',
    features: [
      '5 monitors of 5 min frequency',
      'HTTP, Ping, SSL & Domain Monitors',
      'Single Region HTTP monitoring',
      'Email, Telegram, Discord notifications',
      '1 basic status page',
      'No login seats',
      '24 hrs data retention'
    ],
    cta: 'Get Started for Free',
    popular: false
  },
  {
    id: 2,
    name: 'Pro',
    price: { monthly: 4, yearly: 38.4 },
    description: 'Easy and affordable pricing.',
    features: [
      '10 monitors of 60 sec frequency',
      'HTTP, Ping, SSL & Domain Monitors',
      '6 Region HTTP monitoring',
      '8+ notification channels',
      '2 fully featured status pages',
      '1 login seat included',
      '1 year data retention'
    ],
    cta: 'Subscribe Now',
    popular: true
  },
  {
    id: 3,
    name: 'Business',
    price: { monthly: 10, yearly: 96 },
    description: 'For growing teams.',
    features: [
      'Unlimited monitors of 30 sec frequency',
      'HTTP, Ping, SSL & Domain Monitors',
      '6 Region HTTP monitoring',
      'All notification channels',
      'Unlimited status pages',
      '5 login seats included',
      'Unlimited data retention',
      'Priority support'
    ],
    cta: 'Subscribe Now',
    popular: false
  }
];

export const faqs = [
  {
    id: 1,
    question: 'How does Pingly work?',
    answer: 'Pingly monitors your websites, APIs, and servers at regular intervals from multiple global regions. When an issue is detected, you\'ll receive instant notifications through your preferred channels.'
  },
  {
    id: 2,
    question: 'Do you offer refunds?',
    answer: 'Yes, we offer a 30-day money-back guarantee. If you\'re not satisfied with our service, contact us within 30 days of purchase for a full refund.'
  },
  {
    id: 3,
    question: 'Can I upgrade or downgrade my plan?',
    answer: 'Absolutely! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.'
  },
  {
    id: 4,
    question: 'What notification channels do you support?',
    answer: 'We support Email, Telegram, Discord, Slack, Microsoft Teams, Webhooks, Google Chat, Twilio SMS, and PagerDuty. You can configure multiple channels for redundancy.'
  },
  {
    id: 5,
    question: 'How often does Pingly check my website\'s uptime?',
    answer: 'Check frequency depends on your plan. Free plans check every 5 minutes, Pro plans offer 60-second intervals, and Business plans provide 30-second monitoring for maximum responsiveness.'
  }
];

export const regions = [
  { id: 1, name: 'North America', lat: 40, lng: -100 },
  { id: 2, name: 'Europe', lat: 50, lng: 10 },
  { id: 3, name: 'Asia', lat: 30, lng: 100 },
  { id: 4, name: 'South America', lat: -15, lng: -60 },
  { id: 5, name: 'Africa', lat: 0, lng: 20 },
  { id: 6, name: 'Oceania', lat: -25, lng: 140 }
];