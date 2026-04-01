import { db } from '../lib/db'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { nanoid } from 'nanoid'
import { NextAuthOptions, getServerSession } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter email and password')
        }

        try {
          // Normalize email
          const email = credentials.email.toLowerCase().trim()
          
          const user = await db.user.findUnique({
            where: { email },
          })

          if (!user) {
            throw new Error('User account not found. Please create an account first.')
          }

          // If user has no password, they signed up with OAuth only
          if (!user.password) {
            throw new Error('This account was created with Google/GitHub only. Please login using Google or GitHub instead.')
          }

          const passwordMatch = await bcrypt.compare(credentials.password, user.password)

          if (!passwordMatch) {
            throw new Error('Incorrect password')
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          }
        } catch (error: any) {
          throw new Error(error.message || 'Authentication failed')
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // For OAuth providers, ensure user exists or create them
        if (account?.provider === 'google' || account?.provider === 'github') {
          if (!user.email) return false

          const normalizedEmail = user.email.toLowerCase().trim()
          
          await db.user.upsert({
            where: { email: normalizedEmail },
            update: {},
            create: {
              email: normalizedEmail,
              name: user.name || 'User',
              image: user.image,
              role: 'CLIENT',
              username: nanoid(10),
            },
          })
        }
        return true
      } catch (error: any) {
        console.error('[AUTH] SignIn callback error:', error)
        // Allow signin even if upsert fails - adapter will handle
        return true
      }
    },

    async session({ token, session }) {
      if (token) {
        session.user.id = token.id
        session.user.name = token.name
        session.user.email = token.email
        session.user.image = token.picture
        session.user.username = token.username
        session.user.role = token.role as string
      }

      return session
    },

    async jwt({ token, user, account }) {
      // On initial sign in, set basic values
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.picture = user.image
      }

      // On every token refresh, load user data from DB (but don't update)
      if (token.email) {
        try {
          const normalizedEmail = token.email.toLowerCase().trim()
          const dbUser = await db.user.findUnique({
            where: { email: normalizedEmail },
          })

          if (dbUser) {
            token.id = dbUser.id
            token.name = dbUser.name
            token.email = dbUser.email
            token.picture = dbUser.image
            token.username = dbUser.username || nanoid(10)
            token.role = dbUser.role || 'CLIENT'
          }
        } catch (error) {
          console.error('[JWT] Error loading user data:', error)
          // Continue with existing token data if lookup fails
        }
      }

      return token
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return `${baseUrl}/onboard`
    },
  },
}

export const getAuthSession = () => getServerSession(authOptions)

// export { getServerSession }
