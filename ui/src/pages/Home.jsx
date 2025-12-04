import React, { useState, useEffect } from 'react'
import { ArrowRight, Brain, TrendingUp, Shield, Zap, Sparkles, Database, Target, Users, ChevronRight, Play, CheckCircle, MessageCircle, Lightbulb, Bot, Globe, FileText, Activity, Star, Clock, Rocket } from 'lucide-react'
import { Link } from 'react-router-dom'
import ChatBox from '../components/ChatBox.jsx'

const Home = () => {
  const [currentStat, setCurrentStat] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const features = [
    {
      icon: TrendingUp,
      title: 'Market Intelligence',
      description: 'Real-time pharmaceutical market analysis, forecasting, and competitive insights powered by IQVIA data.',
      gradient: 'from-blue-500 to-cyan-500',
      delay: '0ms'
    },
    {
      icon: Shield,
      title: 'Patent Analysis',
      description: 'Comprehensive IP landscape analysis, patent expiry tracking, and freedom-to-operate assessments.',
      gradient: 'from-emerald-500 to-teal-500',
      delay: '200ms'
    },
    {
      icon: Brain,
      title: 'AI-Powered Insights',
      description: 'Multi-agent AI system that synthesizes complex pharmaceutical data into actionable intelligence.',
      gradient: 'from-purple-500 to-pink-500',
      delay: '400ms'
    },
    {
      icon: Zap,
      title: 'Real-time Updates',
      description: 'Continuous monitoring of clinical trials, regulatory changes, and market developments.',
      gradient: 'from-orange-500 to-red-500',
      delay: '600ms'
    }
  ]

  const stats = [
    { number: '500K+', label: 'Patents Analyzed', icon: Database },
    { number: '25K+', label: 'Clinical Trials Tracked', icon: Target },
    { number: '1.4T+', label: 'Market Data Points', icon: TrendingUp },
    { number: '98%', label: 'Accuracy Rate', icon: CheckCircle }
  ]

  const benefits = [
    'Accelerate drug discovery timelines',
    'Reduce research and development costs',
    'Identify market opportunities faster',
    'Make data-driven strategic decisions',
  ]

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleNewMessage = (message) => {
    // Handle new chat messages if needed
    console.log('New message:', message)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
        </div>

        <div className="container mx-auto px-6 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Hero Text */}
            <div className={`space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-50 -translate-x-10'}`}>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-full border border-blue-200/50 dark:border-blue-700/30">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">AI-Powered Intelligence Platform</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                <span className="text-foreground">Pharmaceutical</span>
                <br />
                    <span className="text-transparent bg-gradient-to-r from-primary via-purple-500 to-cyan-500 bg-clip-text animate-pulse">
                  Intelligence
                </span>
                <br />
                <span className="text-2xl lg:text-3xl font-light text-muted-foreground">Powered by AI Agents</span>
              </h1>

              <p className="text-xl text-muted-foreground leading-relaxed max-w-8xl">
                Transform your pharmaceutical decision-making with our advanced multi-agent AI platform. 
                Get comprehensive market analysis, competitive intelligence, and strategic insights 
                from specialized AI agents working in perfect harmony.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/dashboard" 
                  className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
                
                <button className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-transparent border-2 border-border hover:border-primary text-foreground hover:text-primary font-semibold rounded-2xl transition-all duration-300 hover:bg-muted/50">
                  <Play className="w-5 h-5 transition-transform group-hover:scale-110" />
                  <span>Watch Demo</span>
                </button>
              </div>

              {/* Quick Benefits */}
              <div className="grid grid-cols-2 gap-4 pt-8">
                {benefits.slice(0, 4).map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Visual */}
            <div className={`relative transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
              <div className="relative">
                {/* Main Visual Card */}
                <div className="bg-gradient-to-br from-card to-card/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-border/50">
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                          <Brain className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">AI Analysis</h3>
                          <p className="text-sm text-muted-foreground">Real-time insights</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-xs text-emerald-600 font-medium">Live</span>
                      </div>
                    </div>

                    {/* Animated Chart */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Market Analysis</span>
                        <span className="text-emerald-600 font-semibold">+24.7%</span>
                      </div>
                      <div className="space-y-2">
                        {[65, 78, 45, 89, 34].map((value, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <div className="w-16 text-xs text-muted-foreground">Q{index + 1}</div>
                            <div className="flex-1 bg-muted/30 rounded-full h-2 overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: isVisible ? `${value}%` : '0%', transitionDelay: `${index * 200}ms` }}
                              />
                            </div>
                            <div className="w-12 text-xs text-foreground font-medium">{value}%</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Stats Display */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/30">
                      {stats.slice(0, 3).map((stat, index) => (
                        <div key={index} className="text-center">
                          <div className="text-lg font-bold text-foreground">{stat.number}</div>
                          <div className="text-xs text-foreground">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-2xl backdrop-blur-sm border border-cyan-200/30 flex items-center justify-center animate-bounce">
                  <TrendingUp className="w-8 h-8 text-cyan-600" />
                </div>
                
                {/*<div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-xl backdrop-blur-sm border border-purple-200/30 flex items-center justify-center animate-pulse">*/}
                {/*  <Shield className="w-6 h-6 text-purple-600" />*/}
                {/*</div>*/}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            {/*<div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full border border-purple-200/50 dark:border-purple-700/30 mb-8">*/}
            {/*  <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />*/}
            {/*  <span className="text-sm font-medium text-purple-600 dark:text-purple-600">AI-Powered Capabilities</span>*/}
            {/*</div>*/}
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Comprehensive Pharmaceutical
              <span className="text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text"> Intelligence</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-8xl mx-auto">
              Our specialized AI agents work together to provide unparalleled insights across every aspect of pharmaceutical analysis
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div 
                  key={index}
                  className="group relative bg-gradient-to-br from-card to-card/80 backdrop-blur-sm rounded-2xl p-8 border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2"
                  style={{ animationDelay: feature.delay }}
                >
                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-500`} />
                  
                  {/* Icon */}
                  <div className={`relative w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all duration-500 group-hover:scale-110`}>
                    <Icon className="w-8 h-8 text-white" />
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-2xl animate-pulse opacity-30`} />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors duration-300">
                    {feature.description}
                  </p>

                  {/* Learn More Link */}
                  <div className="mt-6 flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <span className="text-sm font-medium">Learn more</span>
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-muted/30 via-background to-muted/30 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(59, 130, 246, 0.15) 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }} />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Trusted by Industry Leaders
            </h2>
            <p className="text-xl text-muted-foreground max-w-8xl mx-auto">
              Our platform processes billions of data points to deliver insights that drive pharmaceutical innovation
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              const isActive = currentStat === index
              return (
                <div 
                  key={index}
                  className={`relative group bg-gradient-to-br from-card to-card/80 backdrop-blur-sm rounded-2xl p-8 border transition-all duration-500 ${
                    isActive 
                      ? 'border-primary/50 shadow-2xl shadow-primary/20 scale-105' 
                      : 'border-border/50 hover:border-primary/30 hover:shadow-xl'
                  }`}
                >
                  {/* Animated Background */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl animate-pulse" />
                  )}

                  <div className="relative z-10 text-center">
                    <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                      isActive 
                        ? 'bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/30' 
                        : 'bg-gradient-to-br from-muted to-muted/80'
                    }`}>
                      <Icon className={`w-8 h-8 transition-colors duration-500 ${
                        isActive ? 'text-primary-foreground' : 'text-primary'
                      }`} />
                    </div>

                    <div className={`text-4xl lg:text-5xl font-bold mb-2 transition-all duration-500 ${
                      isActive 
                        ? 'text-foreground bg-gradient-to-r from-primary to-primary/80 bg-clip-text' 
                        : 'text-gray-500'
                    }`}>
                      {stat.number}
                    </div>

                    <div className={`${isActive
                        ? 'text-foreground bg-gradient-to-r from-primary to-primary/80 bg-clip-text'
                        : 'text-gray-500'
                    }`}>
                      {stat.label}
                    </div>

                    {/* Progress Indicator */}
                    {isActive && (
                      <div className="mt-4">
                        <div className="w-full bg-muted/30 rounded-full h-1 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full animate-pulse" style={{ width: '100%' }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Additional Benefits */}
          <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.slice(4).map((benefit, index) => (
              <div key={index} className="flex items-center gap-3 p-4 bg-card/50 backdrop-blur-sm rounded-xl border border-border/30">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span className="text-sm font-medium text-foreground">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Chat Section */}
      <section className="py-20 relative overflow-hidden">
        {/* Enhanced Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5" />
        <div className="absolute top-10 left-1/4 w-64 h-64 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-1/4 w-48 h-48 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        
        <div className="container justify-center-safe align-center mx-auto px-6 relative z-10">
          {/* Enhanced Header */}
          <div className="text-center mb-16 justify-items-center">
            {/*<div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-full border border-cyan-200/50 dark:border-cyan-700/30 mb-8 shadow-lg">*/}
            {/*  <div className="relative">*/}
            {/*    <MessageCircle className="w-5 h-5 text-cyan-600 dark:text-cyan-400 animate-bounce" />*/}
            {/*    <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-ping" />*/}
            {/*  </div>*/}
            {/*  <span className="text-sm font-semibold text-cyan-700 dark:text-cyan-300">Interactive AI Demo</span>*/}
            {/*  <div className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">*/}
            {/*    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Live</span>*/}
            {/*  </div>*/}
            {/*</div>*/}

            <h2 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 leading-tight max-w-4xl mx-auto">
              Experience
              <span className="text-transparent bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text"> PharmaAI</span>
              <br />
              <span className="text-3xl lg:text-4xl font-light text-muted-foreground">Intelligence in Action</span>
            </h2>

            <h2 className="text-lg lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-8">
              Chat with our specialized AI agents and get instant insights on market trends, competitive analysis, 
              patent landscapes, and clinical development strategies
            </h2>

            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-8 mb-12 py-12">
              {[
                { icon: Brain, label: '5 AI Agents', value: 'Multi-Agent System' },
                { icon: Clock, label: '< 3 Seconds', value: 'Response Time' },
                { icon: Globe, label: '200+ Countries', value: 'Global Coverage' },
                { icon: Star, label: '98% Accuracy', value: 'Validated Results' }
              ].map((stat, index) => (
                <div key={index} className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-muted/50 to-muted/30 backdrop-blur-sm rounded-xl border border-border/30">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                    <stat.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-foreground">{stat.label}</div>
                    <div className="text-xs text-muted-foreground">{stat.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Chat Interface */}
          <div className="max-w-6xl mx-auto">
            <div className="gap-6 pb-8">
              {/* AI Agents Sidebar */}
              {/*<div className="lg:col-span-1">*/}
              {/*  <div className="bg-gradient-to-br from-card to-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-6 shadow-xl">*/}
              {/*    <div className="flex items-center gap-3 mb-6">*/}
              {/*      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">*/}
              {/*        <Bot className="w-5 h-5 text-white" />*/}
              {/*      </div>*/}
              {/*      <div>*/}
              {/*        <h3 className="font-bold text-foreground">Active AI Agents</h3>*/}
              {/*        <p className="text-sm text-muted-foreground">Ready to assist</p>*/}
              {/*      </div>*/}
              {/*    </div>*/}

              {/*    <div className="space-y-3">*/}
              {/*      {[*/}
              {/*        { name: 'Master Agent', icon: Brain, status: 'online', specialty: 'Orchestration', gradient: 'from-blue-500 to-purple-500' },*/}
              {/*        { name: 'Market Intel', icon: TrendingUp, status: 'online', specialty: 'IQVIA Data', gradient: 'from-emerald-500 to-teal-500' },*/}
              {/*        { name: 'Patent Analyzer', icon: FileText, status: 'online', specialty: 'IP Landscape', gradient: 'from-orange-500 to-red-500' },*/}
              {/*        { name: 'Clinical Tracker', icon: Activity, status: 'online', specialty: 'Trials Data', gradient: 'from-cyan-500 to-blue-500' },*/}
              {/*        { name: 'Web Intelligence', icon: Globe, status: 'online', specialty: 'Market Sentiment', gradient: 'from-pink-500 to-purple-500' }*/}
              {/*      ].map((agent, index) => (*/}
              {/*        <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border/20 hover:border-primary/30 transition-all duration-300 group cursor-pointer">*/}
              {/*          <div className={`w-8 h-8 bg-gradient-to-br ${agent.gradient} rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}>*/}
              {/*            <agent.icon className="w-4 h-4 text-white" />*/}
              {/*          </div>*/}
              {/*          <div className="flex-1 min-w-0">*/}
              {/*            <div className="flex items-center gap-2">*/}
              {/*              <span className="font-medium text-foreground text-sm truncate">{agent.name}</span>*/}
              {/*              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />*/}
              {/*            </div>*/}
              {/*            <div className="text-xs text-muted-foreground">{agent.specialty}</div>*/}
              {/*          </div>*/}
              {/*        </div>*/}
              {/*      ))}*/}
              {/*    </div>*/}

              {/*    /!* Quick Actions *!/*/}
              {/*    <div className="mt-6 pt-6 border-t border-border/30">*/}
              {/*      <h4 className="font-semibold text-foreground mb-3 text-sm">Quick Actions</h4>*/}
              {/*      <div className="grid grid-cols-2 gap-2">*/}
              {/*        {[*/}
              {/*          { icon: Target, label: 'Market Size', color: 'text-blue-500' },*/}
              {/*          { icon: Shield, label: 'Patent Check', color: 'text-emerald-500' },*/}
              {/*          { icon: Database, label: 'Trial Status', color: 'text-purple-500' },*/}
              {/*          { icon: Lightbulb, label: 'Opportunities', color: 'text-orange-500' }*/}
              {/*        ].map((action, index) => (*/}
              {/*          <button key={index} className="flex items-center gap-2 p-2 bg-muted/20 hover:bg-muted/40 rounded-lg transition-all duration-300 group">*/}
              {/*            <action.icon className={`w-4 h-4 ${action.color} group-hover:scale-110 transition-transform`} />*/}
              {/*            <span className="text-xs font-medium text-foreground">{action.label}</span>*/}
              {/*          </button>*/}
              {/*        ))}*/}
              {/*      </div>*/}
              {/*    </div>*/}
              {/*  </div>*/}
              {/*</div>*/}

              {/* Main Chat Area */}
              <div className="lg:col-span-2 justify-between">
                <div className="bg-gradient-to-br from-card to-card/80 backdrop-blur-sm rounded-2xl border border-border/50 shadow-2xl overflow-hidden relative">
                  {/* Chat Header */}
                  <div className="bg-gradient-to-r from-primary/10 to-secondary/10 backdrop-blur-sm p-4 border-b border-border/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
                            <Sparkles className="w-5 h-5 text-white animate-pulse" />
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-card flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                          </div>
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground">PharmaAI Intelligence</h3>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-sm text-muted-foreground">All agents ready</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Demo Mode</span>
                        </div>
                        <Link to="/dashboard" className="px-3 py-1 bg-primary/20 hover:bg-primary/30 text-primary rounded-full text-xs font-medium transition-all duration-300 hover:scale-105">
                          Full Version
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Chat Component */}
                  <div className="relative">
                    <ChatBox onNewMessage={handleNewMessage} />
                    
                    {/* Floating Enhancement Indicators */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 backdrop-blur-sm rounded-xl border border-cyan-200/30 flex items-center justify-center animate-bounce">
                        <TrendingUp className="w-5 h-5 text-cyan-600" />
                      </div>
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400/20 to-pink-500/20 backdrop-blur-sm rounded-xl border border-purple-200/30 flex items-center justify-center animate-pulse" style={{ animationDelay: '1s' }}>
                        <Brain className="w-5 h-5 text-purple-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sample Queries */}
            <div className="bg-gradient-to-br from-muted/30 to-muted/10 backdrop-blur-sm rounded-2xl border border-border/30 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Lightbulb className="w-6 h-6 text-amber-500" />
                <h3 className="font-bold text-foreground text-lg">Try These Sample Queries</h3>
                <div className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400">Popular</span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    icon: TrendingUp,
                    category: 'Market Analysis',
                    query: 'What is the market size for CAR-T therapies in oncology?',
                    gradient: 'from-blue-500 to-cyan-500',
                    popular: true
                  },
                  {
                    icon: Shield,
                    category: 'Patent Intelligence',
                    query: 'When do key patents expire for adalimumab globally?',
                    gradient: 'from-emerald-500 to-teal-500',
                    popular: true
                  },
                  {
                    icon: Activity,
                    category: 'Clinical Trials',
                    query: 'Latest Phase 3 trials in Alzheimer\'s disease treatment',
                    gradient: 'from-purple-500 to-pink-500',
                    popular: false
                  },
                  {
                    icon: Target,
                    category: 'Competitive Analysis',
                    query: 'Compare biosimilar competition for diabetes drugs',
                    gradient: 'from-orange-500 to-red-500',
                    popular: true
                  },
                  {
                    icon: Globe,
                    category: 'Market Access',
                    query: 'Export opportunities for pharmaceuticals in Southeast Asia',
                    gradient: 'from-cyan-500 to-blue-500',
                    popular: false
                  },
                  {
                    icon: Rocket,
                    category: 'Innovation',
                    query: 'Emerging drug delivery technologies and market potential',
                    gradient: 'from-pink-500 to-purple-500',
                    popular: false
                  }
                ].map((sample, index) => (
                  <button
                    key={index}
                    className="group relative bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm rounded-xl border border-border/30 p-4 text-left hover:border-primary/40 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    {/* Popular Badge */}
                    {sample.popular && (
                      <div className="absolute top-2 right-2 px-2 py-1 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full">
                        <Star className="w-3 h-3 text-white" />
                      </div>
                    )}

                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-8 h-8 bg-gradient-to-br ${sample.gradient} rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110`}>
                        <sample.icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                          {sample.category}
                        </div>
                        <div className="text-sm font-medium text-foreground leading-relaxed group-hover:text-primary transition-colors duration-300">
                          {sample.query}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MessageCircle className="w-3 h-3" />
                      <span>Click to try</span>
                      <ArrowRight className="w-3 h-3 ml-auto group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </button>
                ))}
              </div>

              {/* CTA */}
              <div className="mt-8 text-center justify-between align-center">
                <Link 
                  to="/dashboard"
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <span>Start Your Free Analysis</span>
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <p className="text-sm text-muted-foreground mt-2">No credit card required • Full access to all AI agents</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-br from-cyan-500/10 to-emerald-500/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-6 relative z-10 justify-items-center-safe">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full border border-primary/20 mb-8">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Join 500+ Pharmaceutical Companies</span>
            </div>

            <h2 className="text-4xl lg:text-6xl font-bold text-foreground mb-8">
              Ready to Transform Your
              <br />
              <span className="text-transparent from-cyan-600 via-blue-600 to-purple-600  bg-gradient-to-r bg-clip-text">
                Pharmaceutical Intelligence?
              </span>
            </h2>

            <p className="text-xl text-muted-foreground mb-12 max-w-8xl mx-auto leading-relaxed">
              Join leading pharmaceutical companies using PharmaAI for strategic decision-making, 
              accelerated drug discovery, and competitive advantage in the market.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link 
                to="/dashboard" 
                className="group inline-flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 min-w-[240px]"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 to-secondary/20 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
              
              {/*<button className="group inline-flex items-center justify-center gap-3 px-10 py-5 bg-transparent border-2 border-border hover:border-primary text-foreground hover:text-primary font-bold text-lg rounded-2xl transition-all duration-300 hover:bg-muted/50 min-w-[240px]">*/}
              {/*  <Users className="w-6 h-6 transition-transform group-hover:scale-110" />*/}
              {/*  <span>Contact Sales</span>*/}
              {/*</button>*/}
            </div>

            {/* Trust Indicators */}
            <div className="mt-16 pt-12 border-t border-border/30">
              <p className="text-sm text-muted-foreground mb-6">Trusted by industry leaders worldwide</p>
              <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
                {/* Placeholder for company logos */}
                <div className="text-2xl font-bold text-muted-foreground">Pfizer</div>
                <div className="text-2xl font-bold text-muted-foreground">Novartis</div>
                <div className="text-2xl font-bold text-muted-foreground">Roche</div>
                <div className="text-2xl font-bold text-muted-foreground">J&J</div>
                <div className="text-2xl font-bold text-muted-foreground">GSK</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
