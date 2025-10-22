import React, { useState, useEffect } from 'react';
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
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const slidesPerView = 3;
  const totalSlides = Math.ceil(additionalFeatures.length / slidesPerView);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  const getCurrentSlideFeatures = () => {
    const start = currentSlide * slidesPerView;
    return additionalFeatures.slice(start, start + slidesPerView);
  };

  return (
    <div className="min-h-screen bg-black text-white grid-background">
      {/* Header/Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold">Pingly</div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection('features')} className="hover:text-gray-300 transition-colors">Features</button>
            <button onClick={() => scrollToSection('pricing')} className="hover:text-gray-300 transition-colors">Pricing</button>
            <button onClick={() => scrollToSection('faq')} className="hover:text-gray-300 transition-colors">FAQ</button>
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-black transition-all">Sign In</Button>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-black border-t border-white/10 py-4">
            <div className="container mx-auto px-4 flex flex-col gap-4">
              <button onClick={() => scrollToSection('features')} className="text-left hover:text-gray-300">Features</button>
              <button onClick={() => scrollToSection('pricing')} className="text-left hover:text-gray-300">Pricing</button>
              <button onClick={() => scrollToSection('faq')} className="text-left hover:text-gray-300">FAQ</button>
              <Button variant="outline" className="border-white text-white">Sign In</Button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Uptime Monitoring<br />and Status Pages.<br />
            <span className="text-gray-400">without Breaking the Bank</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-4xl mx-auto">
            Monitor your websites, servers and APIs 24/7, get instant downtime alerts, and build trust with beautiful status pages - all at a fraction of the cost of alternatives
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="bg-white text-black hover:bg-gray-200 text-lg px-8 py-6">
              Start for Free <ArrowRight className="ml-2" size={20} />
            </Button>
            <p className="text-sm text-gray-500">No credit card required</p>
          </div>

          {/* Hero Image Placeholder */}
          <div className="mt-16 rounded-lg border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-8 backdrop-blur-sm">
            <div className="bg-black/50 rounded-lg p-12 border border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="h-32 bg-white/10 rounded animate-pulse"></div>
                <div className="h-32 bg-white/10 rounded animate-pulse delay-100"></div>
                <div className="h-32 bg-white/10 rounded animate-pulse delay-200"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
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

      {/* Multi-Region Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge className="bg-white/10 text-white border-white/20 mb-4">Multi Region Connectivity</Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-12">Monitor from Multiple Regions Worldwide</h2>
          <p className="text-xl text-gray-400 mb-12">Ensure reliability with global monitoring from 6 Global regions.</p>

          {/* World Map Visualization */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-8 backdrop-blur-sm">
            <div className="relative h-96 bg-black/50 rounded-lg overflow-hidden">
              {/* Dot pattern background */}
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}></div>
              
              {/* Region markers */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="grid grid-cols-3 gap-16 w-full max-w-4xl px-8">
                  {[1, 2, 3, 4, 5, 6].map((region) => (
                    <div key={region} className="flex flex-col items-center">
                      <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
                      <div className="mt-2 text-xs text-gray-400">Region {region}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Features Slider */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent to-white/5">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <Badge className="bg-white/10 text-white border-white/20 mb-4">Features</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">What Pingly offers?</h2>
            <p className="text-xl text-gray-400">Comprehensive monitoring tools for your online presence</p>
          </div>

          {/* Slider Container */}
          <div className="relative">
            <div className="overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {getCurrentSlideFeatures().map((feature) => {
                  const Icon = iconMap[feature.icon];
                  return (
                    <Card key={feature.id} className="bg-white/5 border-white/10 hover:border-white/30 transition-all">
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
                  );
                })}
              </div>
            </div>

            {/* Navigation Buttons */}
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all backdrop-blur-sm border border-white/10"
              aria-label="Previous slide"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all backdrop-blur-sm border border-white/10"
              aria-label="Next slide"
            >
              <ChevronRight size={24} />
            </button>

            {/* Slide Indicators */}
            <div className="flex justify-center gap-2 mt-8">
              {[...Array(totalSlides)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full transition-all ${
                    currentSlide === index ? 'w-8 bg-white' : 'w-2 bg-white/30'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Status Pages Section */}
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

      {/* Notifications Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent to-white/5">
        <div className="container mx-auto text-center">
          <Badge className="bg-white/10 text-white border-white/20 mb-4">Notifications</Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Get Notifications in your preferred channel</h2>
          <p className="text-xl text-gray-400 mb-12">Get instant alerts through your preferred channels when your website goes down or comes back online.</p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {notificationChannels.map((channel) => {
              const Icon = iconMap[channel.icon] || Bell;
              return (
                <Card key={channel.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all hover:scale-105">
                  <CardContent className="pt-6 flex flex-col items-center">
                    <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center mb-3">
                      <Icon size={24} />
                    </div>
                    <p className="text-sm font-semibold">{channel.name}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
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
                  <Button className="w-full bg-white text-black hover:bg-gray-200 mb-6">
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

      {/* FAQ Section */}
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

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="bg-white/5 border border-white/10 rounded-lg p-12 backdrop-blur-sm">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Start Monitoring Your Websites For Free</h2>
            <p className="text-xl text-gray-400 mb-8">Get 5 monitors completely free, forever. No credit card required.</p>
            <Button size="lg" className="bg-white text-black hover:bg-gray-200 text-lg px-8 py-6">
              Try For Free <ArrowRight className="ml-2" size={20} />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
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
            <p>&copy; 2024 Pingly. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;