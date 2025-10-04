'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Container, Shadow } from '@/components/ui'
import { CustomLink } from '@/components/custom-link'
import { FolderKanban, Users, Layout, FileText, AlertCircle } from 'lucide-react'


  const adminCards = [
    {
      title: 'Manage Projects',
      description: 'View, edit, and manage all projects in the system',
      icon: FolderKanban,
      href: '/admin/projects',
      iconColor: 'text-primary dark:text-blue-400',
    },
    {
      title: 'Manage Inverstors',
      description: 'View, edit, and manage all investors in the system',
      icon: Users,
      href: '/admin/investors',
      iconColor: 'text-primary dark:text-blue-400',
    },
       {
      title: 'Manage Sections',
      description: 'View, edit, and manage all sections in the system',
      icon: Layout,
      href: '/admin/sections',
      iconColor: 'text-primary dark:text-blue-400',
    },
    {
      title: 'Manage Pages',
      description: 'View, edit, and manage all pages in the system',
      icon: FileText,
      href: '/admin/pages',
      iconColor: 'text-primary dark:text-blue-400',
    },
  ]


function AdminPageSkeleton() {
  return (
    <div className="min-h-screen bg-background dark:bg-slate-900">
      <Container className="py-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header Section Skeleton */}
          <div className="text-center space-y-4">
            <div className="h-8 w-64 mx-auto bg-muted/50 dark:bg-slate-800/50 rounded animate-pulse"></div>
            <div className="h-5 w-96 max-w-full mx-auto bg-muted/50 dark:bg-slate-800/50 rounded animate-pulse"></div>
          </div>

          {/* Admin Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {adminCards.map((card, index) => {
              const IconComponent = card.icon
              return (
                <Shadow
                  key={index}
                  size="sm"
                  className="p-6 rounded-lg bg-card dark:bg-slate-800/50 border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-muted/50 dark:bg-slate-800/50 border-gray-200 dark:border-gray-700">
                      <IconComponent className={`h-6 w-6 ${card.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="h-6 w-48 bg-muted/50 dark:bg-slate-800/50 rounded animate-pulse"></div>
                      <div className="h-4 w-full bg-muted/50 dark:bg-slate-800/50 rounded animate-pulse"></div>
                    </div>
                  </div>
                  <div className="mt-4 h-10 w-full bg-muted/50 dark:bg-slate-800/50 rounded animate-pulse"></div>
                </Shadow>
              )
            })}
          </div>
        </div>
      </Container>

      {/* Custom Shimmer Animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  )
}

function UnauthorizedAccess({ message }: { message: string }) {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background dark:bg-slate-900 p-4">
      <Shadow
        size="sm"
        className="max-w-md w-full space-y-6 bg-card dark:bg-slate-800/50 border-gray-200 dark:border-gray-700 p-6 rounded-lg"
      >
        <div className="flex items-center gap-3 text-red-500 dark:text-red-400">
          <AlertCircle className="h-6 w-6" />
          <h2 className="text-xl font-bold text-foreground dark:text-white">Access Denied</h2>
        </div>
        <p className="text-muted-foreground dark:text-white/80">{message}</p>
        <Button
          onClick={() => router.push('/')}
          className="w-full bg-primary dark:bg-blue-500 hover:bg-primary/90 dark:hover:bg-blue-500/90 text-white border-none"
        >
          Return to Home
        </Button>
      </Shadow>
    </div>
  )
}

export default function AdminPage() {
  // const { user, isLoading } = useUser()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(true)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // useEffect(() => {
  //   if (!isLoading) {
  //     if (!user) {
  //       router.push('/login')
  //     } else {
  //       setIsAdmin(user.role === 'ADMIN')
  //       setIsCheckingAuth(false)
  //     }
  //   }
  // }, [user, isLoading, router])

  // if (isLoading || isCheckingAuth) {
  //   return <AdminPageSkeleton />
  // }

  if (!isAdmin) {
    return <UnauthorizedAccess message="You do not have permission to access the admin panel." />
  }

  return (
    <div className="min-h-screen bg-background dark:bg-slate-900">
      <Container className="py-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-foreground dark:text-white">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground dark:text-white/80 max-w-2xl mx-auto">
              Welcome back, manage your application settings and data.
            </p>
          </div>

          {/* Admin Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {adminCards.map((card, index) => {
              const IconComponent = card.icon
              return (
                <Shadow
                  key={index}
                  size="sm"
                  className="group p-6 rounded-lg bg-card dark:bg-slate-800/50 border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-muted/50 dark:bg-slate-800/50 border-gray-200 dark:border-gray-700">
                        <IconComponent className={`h-6 w-6 ${card.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-xl font-bold text-foreground dark:text-white">
                          {card.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground dark:text-white/80 mt-2">
                          {card.description}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button
                      asChild
                      className="w-full bg-primary hover:bg-primary/900 text-white border-none"
                    >
                      <CustomLink href={card.href}>{card.title}</CustomLink>
                    </Button>
                  </CardContent>
                </Shadow>
              )
            })}
          </div>
        </div>
      </Container>
    </div>
  )
}