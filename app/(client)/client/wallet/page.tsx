"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { Skeleton } from "@/components/ui/skeleton"

interface Transaction {
  id: string
  type: string
  amount: number
  description: string
  createdAt: string
}

export default function WalletPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated") {
      fetchWalletData()
    }
  }, [status])

  const fetchWalletData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/wallet")
      if (!response.ok) throw new Error("Failed to load wallet")
      const data = await response.json()
      setBalance(data.balance || 0)
      setTransactions(data.transactions || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const getTransactionIcon = (type: string) => {
    if (type === "EARNING") return <Icons.arrowDown className="h-4 w-4 text-green-600" />
    if (type === "PAYMENT") return <Icons.arrowUp className="h-4 w-4 text-red-600" />
    return <Icons.send className="h-4 w-4 text-gray-600" />
  }

  if (status === "loading" || loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Wallet & Payments</h1>
        <p className="text-muted-foreground mt-1">Manage your account balance and transaction history</p>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">Error: {error}</p>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0">
        <CardHeader>
          <CardDescription className="text-blue-100">Total Balance</CardDescription>
          <CardTitle className="text-4xl text-white">${balance.toFixed(2)}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button variant="secondary">
              <Icons.wallet className="mr-2 h-4 w-4" />
              Add Funds
            </Button>
            <Button variant="secondary">
              <Icons.send className="mr-2 h-4 w-4" />
              Withdraw
            </Button>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
        {transactions.length === 0 ? (
          <Card>
            <CardContent className="pt-8 pb-8 text-center">
              <p className="text-muted-foreground">No transactions yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {transactions.map(tx => (
              <Card key={tx.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        {getTransactionIcon(tx.type)}
                      </div>
                      <div>
                        <p className="font-medium">{tx.type}</p>
                        <p className="text-sm text-muted-foreground">{tx.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        tx.type === "EARNING" ? "text-green-600" : "text-red-600"
                      }`}>
                        {tx.type === "EARNING" ? "+" : "-"}${tx.amount.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
  )
}
