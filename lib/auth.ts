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
          const user = await db.user.findUnique({
            where: { email: credentials.email },
          })

          if (!user) {
            throw new Error('User account not found. Please create an account first.')
          }

          if (!user.password) {
            throw new Error('This account has no password. Try using Google or GitHub to login.')
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
          const existingUser = await db.user.findUnique({
            where: { email: user.email! },
          })

          if (!existingUser) {
            // User coming from OAuth for the first time
            await db.user.upsert({
              where: { email: user.email! },
              update: {
                role: 'CLIENT',
              },
              create: {
                email: user.email!,
                name: user.name || 'User',
                image: user.image,
                role: 'CLIENT',
              },
            })
          }
        }
        return true
      } catch (error: any) {
        console.error('SignIn callback error:', error)
        return true // Allow signin even if upsert fails, adapter will handle it
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
      // Initial sign in
      if (user) {
        token.id = user.id
      }

      // Load user from database
      try {
        const dbUser = await db.user.findUnique({
          where: { email: token.email! },
        })

        if (dbUser) {
          token.id = dbUser.id
          token.name = dbUser.name
          token.email = dbUser.email
          token.picture = dbUser.image
          token.username = dbUser.username
          token.role = dbUser.role || 'CLIENT'

          // Set username if not exists
          if (!dbUser.username) {
            await db.user.update({
              where: { id: dbUser.id },
              data: { username: nanoid(10) },
            })
            token.username = dbUser.username
          }
        }
      } catch (error) {
        console.error('JWT callback error:', error)
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
