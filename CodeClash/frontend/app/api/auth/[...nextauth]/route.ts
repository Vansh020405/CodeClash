import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID || "",
            clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                // For now, simple validation
                // In production, validate against your Django backend
                if (credentials?.email && credentials?.password) {
                    // Mock user - replace with actual API call to Django
                    return {
                        id: "1",
                        email: credentials.email,
                        name: credentials.email.split('@')[0],
                    }
                }
                return null
            }
        })
    ],
    pages: {
        signIn: '/auth/signin',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id as string
            }
            return session
        }
    },
    session: {
        strategy: "jwt"
    },
    debug: true,
    secret: process.env.NEXTAUTH_SECRET || "your-secret-key-change-in-production",
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
