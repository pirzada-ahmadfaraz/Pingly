// Mock data for the landing page

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
  }
];

export const notificationChannels = [
  { id: 1, name: 'Email', icon: 'Mail' },
  { id: 2, name: 'Telegram', icon: 'Send' },
  { id: 3, name: 'Discord', icon: 'MessageCircle' },
  { id: 4, name: 'Slack', icon: 'Hash' },
  { id: 5, name: 'Teams', icon: 'Users' },
  { id: 6, name: 'Webhook', icon: 'Webhook' },
  { id: 7, name: 'Google Chat', icon: 'MessageSquare' },
  { id: 8, name: 'Twilio SMS', icon: 'Smartphone' },
  { id: 9, name: 'PagerDuty', icon: 'AlertCircle' }
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
    name: 'Lifetime',
    price: { monthly: 99, yearly: 99 },
    oneTime: true,
    description: 'Limited time offer',
    features: [
      'Up to 10 monitors of 60 sec frequency',
      'HTTP, Ping, SSL & Domain Monitors',
      '6 Region HTTP monitoring',
      '8+ notification channels',
      '2 fully featured status pages',
      '1 login seat included',
      '90 days data retention',
      'Access to all upcoming features'
    ],
    cta: 'Subscribe Now',
    popular: false,
    badge: 'Early Bird Special'
  }
];

export const faqs = [
  {
    id: 1,
    question: 'What does the Lifetime Deal for early supporters include?',
    answer: 'The Lifetime Deal includes up to 10 monitors with 60-second frequency, all monitoring types (HTTP, Ping, SSL, Domain), 6-region monitoring, 8+ notification channels, 2 status pages, 1 login seat, 90 days data retention, and access to all upcoming features - all for a one-time payment.'
  },
  {
    id: 2,
    question: 'Do you offer refunds?',
    answer: 'Yes, we offer a 30-day money-back guarantee. If you\'re not satisfied with our service, contact us within 30 days of purchase for a full refund.'
  },
  {
    id: 3,
    question: 'Can I upgrade my plan after choosing the Lifetime Deal?',
    answer: 'The Lifetime Deal is our highest tier offering. However, if you need more monitors or additional features, you can purchase add-ons at any time.'
  },
  {
    id: 4,
    question: 'How does the monitoring system work?',
    answer: 'Our monitoring system checks your websites, APIs, and servers at regular intervals from multiple global regions. When an issue is detected, you\'ll receive instant notifications through your preferred channels.'
  },
  {
    id: 5,
    question: 'How often does the system check my website\'s uptime?',
    answer: 'Check frequency depends on your plan. Free plans check every 5 minutes, while Pro and Lifetime plans offer 60-second intervals for more responsive monitoring.'
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