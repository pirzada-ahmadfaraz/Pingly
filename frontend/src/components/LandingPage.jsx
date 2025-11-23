import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Badge } from './ui/badge';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import {
  Globe, Activity, Shield, Calendar, Users, TrendingUp, Code,
  Wrench, Bell, Mail, Send, MessageCircle, Hash, MessageSquare,
  Smartphone, AlertCircle, Check, ArrowRight, Menu, X, ChevronLeft, ChevronRight,
  Zap, Layout, BarChart
} from 'lucide-react';
import { features, additionalFeatures, notificationChannels, pricingPlans, faqs } from '../mockData';

const iconMap = {
  Globe, Activity, Shield, Calendar, Users, TrendingUp, Code, Wrench, Bell,
  Mail, Send, MessageCircle, Hash, MessageSquare, Smartphone, AlertCircle,
  Zap, Layout, BarChart
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  const handleStartForFree = () => {
    navigate('/signup');
  };

  const extendedFeatures = [
    ...additionalFeatures,
    ...additionalFeatures,
    ...additionalFeatures
  ];

  const nextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 3000);
    return () => clearInterval(interval);
  }, [isTransitioning]);

  useEffect(() => {
    if (currentIndex === additionalFeatures.length) {
      setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(0);
      }, 500);
    } else if (currentIndex === -1) {
      setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(additionalFeatures.length - 1);
      }, 500);
    } else {
      setTimeout(() => {
        setIsTransitioning(false);
      }, 500);
    }
  }, [currentIndex]);

  return (
    <div className="min-h-screen bg-black text-white grid-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Pingly Logo" className="h-8 w-8" />
            <div className="text-2xl font-bold">Pingly</div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection('features')} className="hover:text-gray-300 transition-colors">Features</button>
            <button onClick={() => scrollToSection('pricing')} className="hover:text-gray-300 transition-colors">Pricing</button>
            <button onClick={() => scrollToSection('faq')} className="hover:text-gray-300 transition-colors">FAQ</button>
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-black transition-all" onClick={handleStartForFree}>Sign In</Button>
          </div>

          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>

        {mobileMenuOpen && (
          <div className="md:hidden bg-black border-t border-white/10 py-4">
            <div className="container mx-auto px-4 flex flex-col gap-4">
              <button onClick={() => scrollToSection('features')} className="text-left hover:text-gray-300">Features</button>
              <button onClick={() => scrollToSection('pricing')} className="text-left hover:text-gray-300">Pricing</button>
              <button onClick={() => scrollToSection('faq')} className="text-left hover:text-gray-300">FAQ</button>
              <Button variant="outline" className="border-white text-white" onClick={handleStartForFree}>Sign In</Button>
            </div>
          </div>
        )}
      </header>

      <section className="pt-32 pb-20">
        <div className="container mx-auto text-center px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Reliable Uptime Monitoring<br />& Public Status Pages<br />
            <span className="text-gray-400">That Won't Break the Bank </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-4xl mx-auto">
            Continuously monitor your websites, servers, and APIs with instant downtime alerts and build trust through beautiful status pages — all for a fraction of the cost.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="bg-white text-black hover:bg-gray-200 text-lg px-8 py-6" onClick={handleStartForFree}>
              Start for Free <ArrowRight className="ml-2" size={20} />
            </Button>
            <p className="text-sm text-gray-500">No credit card required</p>
          </div>
        </div>

        <div className="mt-16 px-4 md:px-8 lg:px-16">
          <img
            src="/preview.png"
            alt="Pingly Dashboard Preview"
            className="w-full rounded-xl shadow-2xl border border-white/10 hover:shadow-white/20 transition-shadow duration-300"
          />
        </div>
      </section>

      <section id="features" className="py-20 px-4 bg-gradient-to-b from-transparent to-white/5">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <Badge className="bg-white/10 text-white border-white/20 mb-4">Simple Monitoring Tool</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Everything You Need, All Together</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = iconMap[feature.icon];
              return (
                <Card key={feature.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                  <CardHeader>
                    <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center mb-4">
                      {Icon && <Icon size={24} />}
                    </div>
                    <CardTitle className="text-white">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-400">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge className="bg-white/10 text-white border-white/20 mb-4">Multi Region Connectivity</Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-12">Monitor from Multiple Regions Worldwide</h2>
          <p className="text-xl text-gray-400 mb-12">Ensure reliability with global monitoring from 6 Global regions.</p>

          <div className="bg-white/5 border border-white/10 rounded-lg p-8 backdrop-blur-sm">
            <div className="relative h-[500px] bg-black/50 rounded-lg overflow-hidden">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{ stopColor: '#06b6d4', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>

                {Array.from({ length: 30 }).map((_, i) => (
                  <circle key={`na-${i}`} cx={100 + (i % 10) * 8} cy={120 + Math.floor(i / 10) * 8} r="1" fill="rgba(255,255,255,0.15)" />
                ))}
                {Array.from({ length: 20 }).map((_, i) => (
                  <circle key={`sa-${i}`} cx={180 + (i % 5) * 8} cy={280 + Math.floor(i / 5) * 8} r="1" fill="rgba(255,255,255,0.15)" />
                ))}
                {Array.from({ length: 25 }).map((_, i) => (
                  <circle key={`eu-${i}`} cx={450 + (i % 10) * 7} cy={100 + Math.floor(i / 10) * 10} r="1" fill="rgba(255,255,255,0.15)" />
                ))}
                {Array.from({ length: 35 }).map((_, i) => (
                  <circle key={`af-${i}`} cx={480 + (i % 8) * 8} cy={230 + Math.floor(i / 8) * 8} r="1" fill="rgba(255,255,255,0.15)" />
                ))}
                {Array.from({ length: 50 }).map((_, i) => (
                  <circle key={`as-${i}`} cx={650 + (i % 12) * 8} cy={120 + Math.floor(i / 12) * 8} r="1" fill="rgba(255,255,255,0.15)" />
                ))}
                {Array.from({ length: 20 }).map((_, i) => (
                  <circle key={`au-${i}`} cx={780 + (i % 8) * 7} cy={350 + Math.floor(i / 8) * 8} r="1" fill="rgba(255,255,255,0.15)" />
                ))}

                <path d="M 150 150 Q 300 80 470 130" stroke="url(#lineGradient)" strokeWidth="2" fill="none" opacity="0.6" filter="url(#glow)">
                  <animate attributeName="stroke-dasharray" from="0,1000" to="1000,0" dur="2s" repeatCount="indefinite" />
                </path>
                <path d="M 520 130 Q 600 100 700 150" stroke="url(#lineGradient)" strokeWidth="2" fill="none" opacity="0.6" filter="url(#glow)">
                  <animate attributeName="stroke-dasharray" from="0,1000" to="1000,0" dur="2s" repeatCount="indefinite" />
                </path>
                <path d="M 730 180 Q 770 250 810 360" stroke="url(#lineGradient)" strokeWidth="2" fill="none" opacity="0.6" filter="url(#glow)">
                  <animate attributeName="stroke-dasharray" from="0,1000" to="1000,0" dur="2s" repeatCount="indefinite" />
                </path>
                <path d="M 150 180 Q 150 230 200 290" stroke="url(#lineGradient)" strokeWidth="2" fill="none" opacity="0.5" filter="url(#glow)">
                  <animate attributeName="stroke-dasharray" from="0,1000" to="1000,0" dur="2s" repeatCount="indefinite" />
                </path>
                <path d="M 490 150 Q 500 190 510 260" stroke="url(#lineGradient)" strokeWidth="2" fill="none" opacity="0.5" filter="url(#glow)">
                  <animate attributeName="stroke-dasharray" from="0,1000" to="1000,0" dur="2s" repeatCount="indefinite" />
                </path>

                <circle cx="150" cy="150" r="6" fill="#06b6d4" filter="url(#glow)">
                  <animate attributeName="r" values="6;8;6" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx="470" cy="130" r="6" fill="#06b6d4" filter="url(#glow)">
                  <animate attributeName="r" values="6;8;6" dur="2s" repeatCount="indefinite" begin="0.3s" />
                </circle>
                <circle cx="700" cy="150" r="6" fill="#06b6d4" filter="url(#glow)">
                  <animate attributeName="r" values="6;8;6" dur="2s" repeatCount="indefinite" begin="0.6s" />
                </circle>
                <circle cx="200" cy="290" r="6" fill="#06b6d4" filter="url(#glow)">
                  <animate attributeName="r" values="6;8;6" dur="2s" repeatCount="indefinite" begin="0.9s" />
                </circle>
                <circle cx="510" cy="260" r="6" fill="#06b6d4" filter="url(#glow)">
                  <animate attributeName="r" values="6;8;6" dur="2s" repeatCount="indefinite" begin="1.2s" />
                </circle>
                <circle cx="810" cy="360" r="6" fill="#06b6d4" filter="url(#glow)">
                  <animate attributeName="r" values="6;8;6" dur="2s" repeatCount="indefinite" begin="1.5s" />
                </circle>

                <text x="150" y="175" fill="#d1d5db" fontSize="12" textAnchor="middle" fontWeight="500">US West</text>
                <text x="470" y="120" fill="#d1d5db" fontSize="12" textAnchor="middle" fontWeight="500">Europe</text>
                <text x="700" y="140" fill="#d1d5db" fontSize="12" textAnchor="middle" fontWeight="500">Asia Pacific</text>
                <text x="200" y="315" fill="#d1d5db" fontSize="12" textAnchor="middle" fontWeight="500">S. America</text>
                <text x="510" y="250" fill="#d1d5db" fontSize="12" textAnchor="middle" fontWeight="500">Africa</text>
                <text x="810" y="350" fill="#d1d5db" fontSize="12" textAnchor="middle" fontWeight="500">Australia</text>
              </svg>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-b from-transparent to-white/5">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <Badge className="bg-white/10 text-white border-white/20 mb-4">Features</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">What Pingly offers?</h2>
            <p className="text-xl text-gray-400">Comprehensive monitoring tools for your online presence</p>
          </div>

          <div className="relative max-w-7xl mx-auto">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 z-20">
              <button
                onClick={prevSlide}
                disabled={isTransitioning}
                className="bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-full p-3 backdrop-blur-sm border border-white/10"
                aria-label="Previous slide"
              >
                <ChevronLeft size={24} />
              </button>
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 z-20">
              <button
                onClick={nextSlide}
                disabled={isTransitioning}
                className="bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-full p-3 backdrop-blur-sm border border-white/10"
                aria-label="Next slide"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(calc(-${(currentIndex % additionalFeatures.length) * 33.333}%))`
                }}
              >
                {extendedFeatures.map((feature, index) => {
                  const Icon = iconMap[feature.icon];
                  return (
                    <div key={`${feature.id}-${index}`} className="flex-shrink-0" style={{ width: '33.333%', padding: '0 12px' }}>
                      <Card className="bg-white/5 border-white/10 hover:border-white/30 transition-all h-full">
                        <CardHeader>
                          <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center mb-4">
                            {Icon && <Icon size={24} />}
                          </div>
                          <CardTitle className="text-white text-xl">{feature.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="text-gray-400">{feature.description}</CardDescription>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-center gap-2 mt-8">
              {additionalFeatures.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (!isTransitioning) {
                      setIsTransitioning(true);
                      setCurrentIndex(index);
                    }
                  }}
                  className={`h-2 rounded-full transition-all ${
                    (currentIndex % additionalFeatures.length) === index ? 'w-8 bg-white' : 'w-2 bg-white/30'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-white/10 text-white border-white/20 mb-4">Status Pages</Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Create Beautiful Status Pages for your monitors</h2>
              <p className="text-xl text-gray-400 mb-6">Keep your users informed about your website's status with custom status pages.</p>
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-black">
                View Demo Status Page <ArrowRight className="ml-2" size={20} />
              </Button>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-8">
              <div className="space-y-4">
                <div className="bg-black/50 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">All Systems Operational</span>
                    <Check className="text-white" size={20} />
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white w-full"></div>
                  </div>
                </div>
                {[1, 2, 3].map((item) => (
                  <div key={item} className="bg-black/30 rounded-lg p-4 border border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Service {item}</span>
                      <span className="text-xs text-gray-500">99.9% uptime</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-b from-transparent to-white/5">
        <div className="container mx-auto text-center">
          <Badge className="bg-white/10 text-white border-white/20 mb-4">Notifications</Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Get Notifications in your preferred channel</h2>
          <p className="text-xl text-gray-400 mb-12">Get instant alerts through your preferred channels when your website goes down or comes back online.</p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {notificationChannels.map((channel) => {
              return (
                <Card key={channel.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all hover:scale-105">
                  <CardContent className="pt-6 flex flex-col items-center">
                    <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center mb-3">
                      <span className="text-4xl">{channel.emoji}</span>
                    </div>
                    <p className="text-sm font-semibold text-white">{channel.name}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <Badge className="bg-white/10 text-white border-white/20 mb-4">Pricing</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-400 mb-8">Choose the plan that fits your needs</p>

            <Tabs value={billingCycle} onValueChange={setBillingCycle} className="inline-block">
              <TabsList className="bg-white/10">
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="yearly">
                  Yearly <Badge className="ml-2 bg-white text-black">Save 20%</Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {pricingPlans.map((plan) => (
              <Card key={plan.id} className={`bg-white/5 border-white/10 hover:border-white/30 transition-all ${
                plan.popular ? 'ring-2 ring-white scale-105' : ''
              }`}>
                <CardHeader>
                  {plan.popular && (
                    <Badge className="bg-white text-black w-fit mb-2">Most Popular</Badge>
                  )}
                  <CardTitle className="text-white text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-5xl font-bold text-white">
                      ${billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly}
                    </span>
                    <span className="text-gray-400">
                      {billingCycle === 'monthly' ? '/month' : '/year'}
                    </span>
                  </div>
                  <CardDescription className="text-gray-400 mt-2">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-white text-black hover:bg-gray-200 mb-6" onClick={handleStartForFree}>
                    {plan.cta}
                  </Button>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-400">
                        <Check size={16} className="text-white mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="py-20 px-4 bg-gradient-to-b from-transparent to-white/5">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <Badge className="bg-white/10 text-white border-white/20 mb-4">FAQ</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-400">Have more questions? Feel free to contact us</p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq) => (
              <AccordionItem key={faq.id} value={`item-${faq.id}`} className="bg-white/5 border-white/10 rounded-lg px-6">
                <AccordionTrigger className="text-white hover:text-gray-300 text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-400">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="bg-white/5 border border-white/10 rounded-lg p-12 backdrop-blur-sm">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Start Monitoring Your Websites For Free</h2>
            <p className="text-xl text-gray-400 mb-8">Get 5 monitors completely free, forever. No credit card required.</p>
            <Button size="lg" className="bg-white text-black hover:bg-gray-200 text-lg px-8 py-6" onClick={handleStartForFree}>
              Try For Free <ArrowRight className="ml-2" size={20} />
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Pingly</h3>
              <p className="text-gray-400 text-sm">Reliable uptime monitoring and status pages for your business.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 Ahmad Faraz. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;