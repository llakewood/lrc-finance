import * as React from 'react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Text } from '@/components/ui/text'
import { Badge } from '@/components/ui/badge'
import { ProgressBar } from '@/components/molecules/progress-bar'
import { formatCurrency } from '@/lib/utils'

export interface DebtItem {
  name: string
  currentBalance: number
  originalBalance: number
  monthlyPayment?: number
  interestRate?: number
  change?: number
}

export interface DebtProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  debts: DebtItem[]
  showTotals?: boolean
}

const DebtProgress = React.forwardRef<HTMLDivElement, DebtProgressProps>(
  ({ className, title = 'Debt Paydown Progress', debts, showTotals = true, ...props }, ref) => {
    const totalCurrent = debts.reduce((sum, d) => sum + d.currentBalance, 0)
    const totalOriginal = debts.reduce((sum, d) => sum + d.originalBalance, 0)
    const totalPaidOff = totalOriginal - totalCurrent
    const percentPaid = totalOriginal > 0 ? (totalPaidOff / totalOriginal) * 100 : 0

    return (
      <Card ref={ref} className={cn('', className)} {...props}>
        <div className="flex items-center justify-between mb-6">
          <Text size="lg" weight="semibold">
            {title}
          </Text>
          {showTotals && (
            <Badge variant="success" size="sm">
              {percentPaid.toFixed(0)}% paid off
            </Badge>
          )}
        </div>

        <div className="space-y-5">
          {debts.map((debt, index) => {
            const paidOff = debt.originalBalance - debt.currentBalance
            const paidPercent = debt.originalBalance > 0
              ? (paidOff / debt.originalBalance) * 100
              : 0

            return (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <Text size="sm" weight="medium">
                      {debt.name}
                    </Text>
                    {debt.interestRate !== undefined && (
                      <Text size="xs" variant="muted">
                        {debt.interestRate}% APR
                      </Text>
                    )}
                  </div>
                  <div className="text-right">
                    <Text size="sm" weight="semibold">
                      {formatCurrency(debt.currentBalance)}
                    </Text>
                    <Text size="xs" variant="muted">
                      of {formatCurrency(debt.originalBalance)}
                    </Text>
                  </div>
                </div>
                <ProgressBar
                  value={paidOff}
                  max={debt.originalBalance}
                  color={paidPercent >= 75 ? 'success' : paidPercent >= 50 ? 'primary' : 'warning'}
                />
                <div className="flex items-center justify-between mt-1">
                  <Text size="xs" variant="muted">
                    {formatCurrency(paidOff)} paid
                  </Text>
                  {debt.change !== undefined && (
                    <Text
                      size="xs"
                      variant={debt.change < 0 ? 'success' : 'danger'}
                    >
                      {debt.change < 0 ? '' : '+'}{formatCurrency(debt.change)} this period
                    </Text>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {showTotals && (
          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <Text size="sm" weight="semibold">
                Total Remaining
              </Text>
              <Text size="lg" weight="bold">
                {formatCurrency(totalCurrent)}
              </Text>
            </div>
            <Text size="xs" variant="muted" className="mt-1">
              {formatCurrency(totalPaidOff)} of {formatCurrency(totalOriginal)} paid off
            </Text>
          </div>
        )}
      </Card>
    )
  }
)
DebtProgress.displayName = 'DebtProgress'

export { DebtProgress }
