"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, ChevronRight, Star, Mail, Phone, Chrome } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"

const testimonials = [
  {
    id: 1,
    quote:
      "TalentFlow made my job search a breeze! I found the perfect resume template and landed my dream job. Highly recommended!",
    author: "Sarah Johnson",
    role: "Software Engineer",
    company: "Google",
    avatar: "/images/talent_1.jpeg",
    rating: 5,
  },
  {
    id: 2,
    quote:
      "The AI-powered quiz generator helped me prepare for technical interviews. The personalized feedback was incredibly valuable.",
    author: "Michael Chen",
    role: "Data Scientist",
    company: "Microsoft",
    avatar: "/images/talent_2.jpg",
    rating: 5,
  },
  {
    id: 3,
    quote:
      "Creating professional cover letters has never been easier. The AI suggestions saved me hours of writing time.",
    author: "Emily Rodriguez",
    role: "Marketing Manager",
    company: "Apple",
    avatar: "/images/talent_3.jpg",
    rating: 5,
  },
]

export function AuthPage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin")
  const [authMethod, setAuthMethod] = useState<"email" | "phone" | "social">("email")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const { signIn, signUp, loading } = useAuth()

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (authMethod === "email") {
      if (authMode === "signin") {
        const { error } = await signIn(formData.email, formData.password)
        if (error) {
          setError(error.message)
        }
      } else {
        const { error } = await signUp(formData.email, formData.password, formData.fullName)
        if (error) {
          setError(error.message)
        } else {
          setSuccess("Account created successfully! Please check your email to verify your account.")
        }
      }
    }
  }

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
      {/* Left Side - Testimonials */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-700">
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Background Image - Set the avatar as background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${testimonials[currentTestimonial].avatar || "/placeholder.svg"})`,
          }}
        />

        {/* Testimonial Content - Move to bottom right */}
        <div className="relative z-10 flex flex-col justify-end items-end p-12 text-white">
          <div className="max-w-md text-right">
            <div className="mb-6">
              <div className="flex justify-center mb-4">
                {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>

            <blockquote className="text-xl font-medium mb-6 leading-relaxed">
              "{testimonials[currentTestimonial].quote}"
            </blockquote>

            <div className="text-right">
              <div className="font-semibold text-lg">{testimonials[currentTestimonial].author}</div>
              <div className="text-blue-200">
                {testimonials[currentTestimonial].role} at {testimonials[currentTestimonial].company}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-4 mt-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevTestimonial}
              className="text-white hover:bg-white/20 rounded-full p-2"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-2 h-2 rounded-full transition-all ${index === currentTestimonial ? "bg-white w-8" : "bg-white/50"}`}
                />
              ))}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={nextTestimonial}
              className="text-white hover:bg-white/20 rounded-full p-2"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>



      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-xl font-bold">TalentFlow</span>
            </div>
            <CardTitle className="text-2xl">{authMode === "signin" ? "Welcome back" : "Let's join with us"}</CardTitle>
            <CardDescription>
              {authMode === "signin"
                ? "Sign in to access your productivity tools"
                : "The first Sign up to join with us & you will now be the first."}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {/* Auth Method Tabs */}
            <Tabs value={authMethod} onValueChange={(value) => setAuthMethod(value as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="phone" className="gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </TabsTrigger>
                <TabsTrigger value="email" className="gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="social" className="gap-2">
                  <Chrome className="w-4 h-4" />
                  Social
                </TabsTrigger>
              </TabsList>

              <TabsContent value="email" className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {authMode === "signup" && (
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                        required
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Loading..." : authMode === "signin" ? "Sign In" : "Continue"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="phone" className="space-y-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex gap-2">
                    <select className="px-3 py-2 border rounded-md bg-background">
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+91">🇮🇳 +91</option>
                    </select>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="555 123 4567"
                      value={formData.phone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>
                <Button className="w-full" disabled>
                  Continue (Coming Soon)
                </Button>
              </TabsContent>

              <TabsContent value="social" className="space-y-4">
                <Button variant="outline" className="w-full gap-2 bg-transparent" disabled>
                  <Chrome className="w-4 h-4" />
                  Continue with Google (Coming Soon)
                </Button>
              </TabsContent>
            </Tabs>

            {/* Toggle Auth Mode */}
            <div className="text-center">
              <Button
                variant="link"
                onClick={() => setAuthMode(authMode === "signin" ? "signup" : "signin")}
                className="text-sm"
              >
                {authMode === "signin" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </Button>
            </div>

            {authMode === "signin" && (
              <div className="text-center">
                <Button variant="link" className="text-sm text-muted-foreground">
                  Need help?
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
