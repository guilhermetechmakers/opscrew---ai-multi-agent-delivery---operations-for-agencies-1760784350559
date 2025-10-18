import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  Zap, 
  Rocket, 
  Shield, 
  ArrowRight, 
  CheckCircle,
  Star,
  Users,
  BarChart3,
  Play,
  ChevronRight,
  Sparkles,
  Target,
  Clock,
  Globe,
  FileText,
  Settings,
  MessageSquare,
  Code,
  GitBranch,
  Cloud,
  Mail,
  Phone,
  Twitter,
  Linkedin,
  Github
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";

const features = [
  {
    icon: Bot,
    title: "AI Intake Agent",
    description: "Qualifies leads, captures requirements, and generates proposals automatically with e-signature integration.",
    gradient: "from-primary/20 to-accent/20",
    borderColor: "border-primary/30"
  },
  {
    icon: GitBranch,
    title: "Project Spin-Up Agent",
    description: "Provisions repos, environments, task templates, and branded client portals in minutes.",
    gradient: "from-accent/20 to-primary/20",
    borderColor: "border-accent/30"
  },
  {
    icon: Target,
    title: "PM Agent",
    description: "Plans sprints, assigns tasks, writes acceptance criteria, and chases blockers automatically.",
    gradient: "from-primary/20 to-accent/20",
    borderColor: "border-primary/30"
  },
  {
    icon: MessageSquare,
    title: "Comms Agent",
    description: "Summarizes meetings, posts updates, and converts feedback into actionable tickets.",
    gradient: "from-accent/20 to-primary/20",
    borderColor: "border-accent/30"
  },
  {
    icon: Code,
    title: "Research/Copilot Agent",
    description: "Drafts specs, user stories, test plans, and PR drafts aligned with your tech stack.",
    gradient: "from-primary/20 to-accent/20",
    borderColor: "border-primary/30"
  },
  {
    icon: Rocket,
    title: "Launch Agent",
    description: "Runs QA/security checklists, coordinates deploys, and manages release communications.",
    gradient: "from-accent/20 to-primary/20",
    borderColor: "border-accent/30"
  }
];

const workflowSteps = [
  {
    step: "01",
    title: "Intake",
    description: "AI agent qualifies leads through intelligent conversation, capturing requirements and budget details.",
    icon: Bot,
    color: "text-primary"
  },
  {
    step: "02", 
    title: "Spin-Up",
    description: "Generate professional proposals and SoWs with automated e-signature workflows.",
    icon: FileText,
    color: "text-accent"
  },
  {
    step: "03",
    title: "Delivery",
    description: "Automatically provision repos, environments, and branded client portals.",
    icon: Cloud,
    color: "text-primary"
  },
  {
    step: "04",
    title: "Launch/Handover",
    description: "Specialized agents manage the entire delivery process with human oversight.",
    icon: Settings,
    color: "text-accent"
  }
];

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "CEO, TechStart Agency",
    company: "TechStart Agency",
    content: "OpsCrew has revolutionized how we handle client projects. The AI agents save us 40+ hours per week and our client satisfaction has increased by 60%.",
    rating: 5,
    avatar: "SJ",
    gradient: "from-primary to-accent"
  },
  {
    name: "Mike Chen",
    role: "CTO, Digital Solutions",
    company: "Digital Solutions",
    content: "The automated provisioning and project management features are game-changers. We've reduced project setup time from days to minutes.",
    rating: 5,
    avatar: "MC",
    gradient: "from-accent to-primary"
  },
  {
    name: "Emily Rodriguez",
    role: "Founder, Creative Studio",
    company: "Creative Studio",
    content: "The AI agents handle all our operational overhead so we can focus on creative work. It's like having a full operations team.",
    rating: 5,
    avatar: "ER",
    gradient: "from-primary to-accent"
  }
];

const customerLogos = [
  { name: "TechStart Agency", logo: "TS" },
  { name: "Digital Solutions", logo: "DS" },
  { name: "Creative Studio", logo: "CS" },
  { name: "Innovation Labs", logo: "IL" },
  { name: "Future Works", logo: "FW" },
  { name: "NextGen Agency", logo: "NG" }
];

const pricingPlans = [
  {
    name: "Starter",
    price: "$99",
    period: "/month",
    description: "Perfect for small agencies getting started",
    features: [
      "Up to 5 active projects",
      "AI Intake Agent",
      "Basic project provisioning",
      "Email support",
      "Standard templates"
    ],
    cta: "Start Free Trial",
    popular: false
  },
  {
    name: "Professional",
    price: "$299",
    period: "/month", 
    description: "Most popular for growing agencies",
    features: [
      "Up to 25 active projects",
      "All AI agents included",
      "Advanced provisioning",
      "Priority support",
      "Custom templates",
      "Client portal branding",
      "Advanced analytics"
    ],
    cta: "Start Free Trial",
    popular: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large agencies with custom needs",
    features: [
      "Unlimited projects",
      "All features included",
      "Custom integrations",
      "Dedicated support",
      "SLA guarantees",
      "On-premise deployment",
      "Custom agent training"
    ],
    cta: "Contact Sales",
    popular: false
  }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section with Animated Gradients */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Enhanced Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20"></div>
          {/* Floating geometric shapes */}
          <motion.div 
            className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
            animate={{ 
              y: [0, -20, 0],
              x: [0, 10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
            animate={{ 
              y: [0, 20, 0],
              x: [0, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
          <motion.div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-2xl"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ 
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 z-10">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8"
            >
              <Sparkles className="w-4 h-4" />
              AI-Powered Operations Platform
            </motion.div>

            {/* Main Headline */}
            <motion.h1 
              className="text-5xl md:text-7xl lg:text-8xl font-bold text-foreground mb-8 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <motion.span 
                className="block"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                AI-Powered Operations
              </motion.span>
              <motion.span 
                className="block gradient-text-animated"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
              >
                for Modern Agencies
              </motion.span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p 
              className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              Automate intake, project spin-up, delivery orchestration, and client management 
              with specialized AI agents that work 24/7. Focus on building while we handle the operations.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button asChild size="lg" className="btn-primary text-lg px-8 py-6 h-14 group pulse-glow">
                  <Link to="/dashboard/intake" className="flex items-center gap-2">
                    Start Intake
                    <motion.div
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  </Link>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 h-14 group border-primary/30 hover:border-primary/50 hover:bg-primary/5">
                  <Link to="/contact" className="flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    Book Demo
                  </Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* Stats */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              <motion.div 
                className="text-center"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div 
                  className="text-3xl md:text-4xl font-bold text-primary mb-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 1.2, type: "spring", stiffness: 200 }}
                >
                  40+
                </motion.div>
                <div className="text-muted-foreground">Hours Saved Per Week</div>
              </motion.div>
              <motion.div 
                className="text-center"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div 
                  className="text-3xl md:text-4xl font-bold text-primary mb-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 1.4, type: "spring", stiffness: 200 }}
                >
                  60%
                </motion.div>
                <div className="text-muted-foreground">Faster Project Setup</div>
              </motion.div>
              <motion.div 
                className="text-center"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div 
                  className="text-3xl md:text-4xl font-bold text-primary mb-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 1.6, type: "spring", stiffness: 200 }}
                >
                  24/7
                </motion.div>
                <div className="text-muted-foreground">AI Agent Availability</div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-primary/30 rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-3 bg-primary rounded-full mt-2"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-background to-card/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              AI Agents
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Specialized AI Agents for
              <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Every Operation
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Our multi-agent system handles every aspect of your operations, from initial client intake 
              to project delivery and ongoing support.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -12, scale: 1.03 }}
                className="group"
              >
                <Card className={`relative overflow-hidden border-2 ${feature.borderColor} hover:border-primary/50 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-primary/20 card-hover`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                  <CardHeader className="relative z-10">
                    <motion.div 
                      className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                      whileHover={{ rotate: 5 }}
                    >
                      <feature.icon className="w-7 h-7 text-foreground" />
                    </motion.div>
                    <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors duration-300">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                  <motion.div 
                    className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    whileHover={{ x: 4 }}
                  >
                    <ChevronRight className="w-5 h-5 text-primary" />
                  </motion.div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gradient-to-b from-card/30 to-background relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
              Workflow
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Get started in minutes with our streamlined 4-step process that transforms 
              your operations from day one.
            </p>
          </motion.div>

          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
              {workflowSteps.map((step, index) => (
                <motion.div 
                  key={index}
                  className="relative text-center group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -12, scale: 1.02 }}
                >
                  {/* Step Number Circle */}
                  <div className="relative mb-8">
                    <motion.div 
                      className="w-24 h-24 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 border-2 border-primary/30 group-hover:border-primary/50"
                      whileHover={{ rotate: 5 }}
                    >
                      <motion.div 
                        className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl group-hover:scale-105 transition-transform duration-300"
                        whileHover={{ rotate: -5 }}
                      >
                        {step.step}
                      </motion.div>
                    </motion.div>
                    {/* Icon */}
                    <motion.div 
                      className="absolute -top-2 -right-2 w-12 h-12 bg-card border-2 border-border rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                      whileHover={{ rotate: 10 }}
                    >
                      <step.icon className={`w-6 h-6 ${step.color}`} />
                    </motion.div>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-4 group-hover:text-primary transition-colors duration-300">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                  
                  {/* Arrow for mobile */}
                  {index < workflowSteps.length - 1 && (
                    <motion.div 
                      className="lg:hidden flex justify-center mt-8"
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <ChevronRight className="w-6 h-6 text-primary/50" />
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Customer Logos */}
      <section className="py-16 bg-gradient-to-b from-background to-card/30 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <p className="text-muted-foreground text-lg mb-8">
              Trusted by leading agencies worldwide
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center justify-items-center">
              {customerLogos.map((logo, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.1 }}
                  className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center text-primary font-bold text-lg hover:from-primary/30 hover:to-accent/30 transition-all duration-300"
                >
                  {logo.logo}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gradient-to-b from-card/30 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
              Testimonials
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Customer Testimonials
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              See how OpsCrew is transforming operations for agencies worldwide
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -12, scale: 1.03 }}
                className="group"
              >
                <Card className="relative overflow-hidden border-2 border-border/30 hover:border-primary/30 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-primary/10 card-hover">
                  <div className={`absolute inset-0 bg-gradient-to-br ${testimonial.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                  <CardContent className="pt-8 relative z-10">
                    {/* Stars */}
                    <motion.div 
                      className="flex items-center mb-6"
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                    >
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: index * 0.1 + 0.5 + i * 0.1 }}
                        >
                          <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        </motion.div>
                      ))}
                    </motion.div>
                    
                    {/* Quote */}
                    <blockquote className="text-lg leading-relaxed mb-6 text-foreground/90">
                      "{testimonial.content}"
                    </blockquote>
                    
                    {/* Author */}
                    <motion.div 
                      className="flex items-center gap-4"
                      whileHover={{ x: 4 }}
                    >
                      <motion.div 
                        className={`w-12 h-12 bg-gradient-to-br ${testimonial.gradient} rounded-full flex items-center justify-center text-white font-bold text-lg`}
                        whileHover={{ rotate: 5, scale: 1.1 }}
                      >
                        {testimonial.avatar}
                      </motion.div>
                      <div>
                        <p className="font-semibold text-foreground">{testimonial.name}</p>
                        <p className="text-muted-foreground text-sm">{testimonial.role}</p>
                        <p className="text-primary text-sm font-medium">{testimonial.company}</p>
                      </div>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Teaser Section */}
      <section className="py-24 bg-gradient-to-b from-card/30 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              Pricing
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose the plan that fits your agency's needs. All plans include our core AI agents.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -12, scale: 1.03 }}
                className={`relative group ${plan.popular ? 'md:-mt-8' : ''}`}
              >
                {plan.popular && (
                  <motion.div 
                    className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10"
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                  >
                    <Badge className="bg-primary text-primary-foreground px-4 py-1 pulse-glow">
                      Most Popular
                    </Badge>
                  </motion.div>
                )}
                <Card className={`relative overflow-hidden border-2 transition-all duration-500 ${
                  plan.popular 
                    ? 'border-primary/50 shadow-2xl shadow-primary/10' 
                    : 'border-border/30 hover:border-primary/30'
                } group-hover:shadow-2xl group-hover:shadow-primary/10 card-hover`}>
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-2xl font-bold group-hover:text-primary transition-colors duration-300">{plan.name}</CardTitle>
                    <motion.div 
                      className="mt-4"
                      whileHover={{ scale: 1.05 }}
                    >
                      <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </motion.div>
                    <p className="text-muted-foreground mt-2">{plan.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <ul className="space-y-4">
                      {plan.features.map((feature, featureIndex) => (
                        <motion.li 
                          key={featureIndex} 
                          className="flex items-center gap-3"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 + featureIndex * 0.05 }}
                        >
                          <motion.div
                            whileHover={{ scale: 1.2, rotate: 5 }}
                          >
                            <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                          </motion.div>
                          <span className="text-sm">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        asChild 
                        className={`w-full h-12 text-lg ${
                          plan.popular 
                            ? 'btn-primary' 
                            : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
                        }`}
                      >
                        <Link to={plan.cta === "Contact Sales" ? "/contact" : "/pricing"}>
                          {plan.cta}
                          <motion.div
                            animate={{ x: [0, 4, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <ArrowRight className="w-5 h-5 ml-2" />
                          </motion.div>
                        </Link>
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* CTA to full pricing page */}
          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 h-14 group border-primary/30 hover:border-primary/50">
              <Link to="/pricing" className="flex items-center gap-2">
                View Full Pricing Details
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-b from-background to-card/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5"></div>
        <div className="max-w-6xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Ready to Transform Your Operations?
            </h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              Join hundreds of agencies already using OpsCrew to scale their operations. 
              Start your free trial today and see the difference AI can make.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button asChild size="lg" className="btn-primary text-lg px-8 py-6 h-14 group pulse-glow">
                  <Link to="/dashboard/intake" className="flex items-center gap-2">
                    Start Intake
                    <motion.div
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  </Link>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 h-14 group border-primary/30 hover:border-primary/50 hover:bg-primary/5">
                  <Link to="/contact" className="flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    Book Demo
                  </Link>
                </Button>
              </motion.div>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {[
                { value: "500+", label: "Agencies" },
                { value: "10K+", label: "Projects Delivered" },
                { value: "99.9%", label: "Uptime" },
                { value: "24/7", label: "Support" }
              ].map((stat, index) => (
                <motion.div 
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <motion.div 
                    className="text-2xl font-bold text-primary mb-2"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 + 0.3, type: "spring", stiffness: 200 }}
                  >
                    {stat.value}
                  </motion.div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                  <Bot className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="font-bold text-2xl">OpsCrew</span>
              </div>
              <p className="text-muted-foreground mb-6 max-w-md leading-relaxed">
                AI-powered operations platform that automates intake, project management, 
                and delivery for modern agencies.
              </p>
              <div className="flex gap-4">
                <motion.div whileHover={{ scale: 1.1, rotate: 5 }} whileTap={{ scale: 0.9 }}>
                  <Button variant="outline" size="icon" className="border-border/30 hover:border-primary/50">
                    <Twitter className="w-5 h-5" />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.1, rotate: 5 }} whileTap={{ scale: 0.9 }}>
                  <Button variant="outline" size="icon" className="border-border/30 hover:border-primary/50">
                    <Linkedin className="w-5 h-5" />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.1, rotate: 5 }} whileTap={{ scale: 0.9 }}>
                  <Button variant="outline" size="icon" className="border-border/30 hover:border-primary/50">
                    <Github className="w-5 h-5" />
                  </Button>
                </motion.div>
              </div>
            </div>
            
            {/* Product */}
            <div>
              <h3 className="font-semibold text-foreground mb-6">Product</h3>
              <ul className="space-y-4 text-muted-foreground">
                <li><Link to="/features" className="hover:text-primary transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link to="/integrations" className="hover:text-primary transition-colors">Integrations</Link></li>
                <li><Link to="/api" className="hover:text-primary transition-colors">API</Link></li>
                <li><Link to="/changelog" className="hover:text-primary transition-colors">Changelog</Link></li>
              </ul>
            </div>
            
            {/* Company */}
            <div>
              <h3 className="font-semibold text-foreground mb-6">Company</h3>
              <ul className="space-y-4 text-muted-foreground">
                <li><Link to="/about" className="hover:text-primary transition-colors">About</Link></li>
                <li><Link to="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
                <li><Link to="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
                <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                <li><Link to="/press" className="hover:text-primary transition-colors">Press</Link></li>
              </ul>
            </div>
            
            {/* Support */}
            <div>
              <h3 className="font-semibold text-foreground mb-6">Support</h3>
              <ul className="space-y-4 text-muted-foreground">
                <li><Link to="/docs" className="hover:text-primary transition-colors">Docs</Link></li>
                <li><Link to="/help" className="hover:text-primary transition-colors">Help Center</Link></li>
                <li><Link to="/status" className="hover:text-primary transition-colors">Status</Link></li>
                <li><Link to="/community" className="hover:text-primary transition-colors">Community</Link></li>
                <li><Link to="/security" className="hover:text-primary transition-colors">Security</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-muted-foreground text-sm">
                &copy; 2024 OpsCrew. All rights reserved.
              </p>
              <div className="flex gap-6 text-sm text-muted-foreground">
                <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
                <Link to="/terms" className="hover:text-primary transition-colors">Terms</Link>
                <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
