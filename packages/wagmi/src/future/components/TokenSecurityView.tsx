import {
  ExclamationTriangleIcon,
  HandThumbUpIcon,
} from '@heroicons/react/24/solid'
import {
  TokenSecurity,
  TokenSecurityLabel,
  TokenSecurityMessage,
  TokenSecurityResponse,
} from '@sushiswap/react-query'
import {
  Button,
  Explainer,
  GoPlusLabsIcon,
  List,
  SelectIcon,
  classNames,
} from '@sushiswap/ui'
import { useMemo, useState } from 'react'
import { Token } from 'sushi/currency'

const isTokenSecurityIssue = {
  // Contract security
  is_open_source: (value: TokenSecurity['is_open_source']) => value === false,
  is_mintable: (value: TokenSecurity['is_mintable']) => value === true,
  can_take_back_ownership: (value: TokenSecurity['can_take_back_ownership']) =>
    value === true,
  owner_change_balance: (value: TokenSecurity['owner_change_balance']) =>
    value === true,
  gas_abuse: (value: TokenSecurity['gas_abuse']) => value === true,
  // Trading security
  buy_tax: (value: TokenSecurity['buy_tax']) => value === true,
  sell_tax: (value: TokenSecurity['sell_tax']) => value === true,
  cannot_buy: (value: TokenSecurity['cannot_buy']) => value === true,
  cannot_sell_all: (value: TokenSecurity['cannot_sell_all']) => value === true,
  slippage_modifiable: (value: TokenSecurity['slippage_modifiable']) =>
    value === true,
  is_honeypot: (value: TokenSecurity['is_honeypot']) => value === true,
  transfer_pausable: (value: TokenSecurity['transfer_pausable']) =>
    value === true,
  is_blacklisted: (value: TokenSecurity['is_blacklisted']) => value === true,
  is_whitelisted: (value: TokenSecurity['is_whitelisted']) => value === true,
  is_anti_whale: (value: TokenSecurity['is_anti_whale']) => value === true,
  trading_cooldown: (value: TokenSecurity['trading_cooldown']) =>
    value === true,
  // Info security
  is_true_token: (value: TokenSecurity['is_true_token']) => value === false,
  is_airdrop_scam: (value: TokenSecurity['is_airdrop_scam']) => value === true,
}

export const TokenSecurityView = ({
  tokenSecurityResponse,
  token,
}: {
  tokenSecurityResponse: TokenSecurityResponse | undefined
  token: Token
}) => {
  const [showMore, setShowMore] = useState<boolean>(false)

  const { tokenSecurity, issues, nonIssues } = useMemo(() => {
    const tokenSecurity = tokenSecurityResponse?.[token.address]
    const issues: (keyof TokenSecurity)[] = []
    const nonIssues: (keyof TokenSecurity)[] = []

    tokenSecurity &&
      Object.entries(tokenSecurity).forEach(([key, value]) => {
        if (
          key in isTokenSecurityIssue &&
          isTokenSecurityIssue[key as keyof typeof isTokenSecurityIssue](value)
        )
          issues.push(key as keyof TokenSecurity)
        else if (key in isTokenSecurityIssue)
          nonIssues.push(key as keyof TokenSecurity)
      })

    return { tokenSecurity, issues, nonIssues }
  }, [tokenSecurityResponse, token])

  return (
    <List className="!pt-0">
      <List.Control>
        <List.Item
          className="justify-between items-center !cursor-default outline-none"
          iconProps={{ width: undefined, height: undefined }}
          title="Token Security"
          subtitle={
            <div className="flex items-center">
              powered by GoPlus
              <GoPlusLabsIcon width={16} height={20} />
            </div>
          }
          value={
            <div
              className={classNames(
                'rounded-full flex items-center px-2 py-1 gap-1',
                Number(issues?.length) > 0
                  ? 'bg-yellow/20 text-yellow'
                  : 'bg-green/20 text-green',
              )}
            >
              {Number(issues?.length) > 0 ? (
                <ExclamationTriangleIcon width={16} height={16} />
              ) : (
                <HandThumbUpIcon width={16} height={16} />
              )}
              <span className="text-sm">{`${Number(issues?.length)} issue${
                Number(issues?.length) !== 1 ? 's' : ''
              } found`}</span>
            </div>
          }
        />
        {issues.map((key) => (
          <List.KeyValue
            className="hover:bg-secondary"
            key={key}
            title={
              <div className="flex gap-1">
                {TokenSecurityLabel[key]}
                <Explainer>{TokenSecurityMessage[key]}</Explainer>
              </div>
            }
          >
            <div className="flex items-center gap-1">
              <div>
                {tokenSecurity?.[key] === undefined
                  ? 'Unknown'
                  : tokenSecurity[key]
                  ? 'Yes'
                  : 'No'}
              </div>
              <ExclamationTriangleIcon
                width={14}
                height={14}
                className="fill-yellow"
              />
            </div>
          </List.KeyValue>
        ))}
        {showMore
          ? nonIssues.map((key) => (
              <List.KeyValue
                className="hover:bg-muted py-1.5"
                key={key}
                title={
                  <div className="flex gap-1 text-gray-900 dark:text-slate-50">
                    {TokenSecurityLabel[key]}
                    <Explainer>{TokenSecurityMessage[key]}</Explainer>
                  </div>
                }
              >
                <div className="flex items-center gap-1">
                  <span>{tokenSecurity?.[key] ? 'Yes' : 'No'}</span>
                  <HandThumbUpIcon
                    width={14}
                    height={14}
                    className="fill-green"
                  />
                </div>
              </List.KeyValue>
            ))
          : null}
        <div className="p-3">
          <Button
            size="xs"
            fullWidth
            onClick={() => setShowMore(!showMore)}
            variant="ghost"
          >
            {showMore ? (
              <>
                <SelectIcon className="rotate-180" />
              </>
            ) : (
              <>
                <SelectIcon />
              </>
            )}
          </Button>
        </div>
      </List.Control>
    </List>
  )
}
