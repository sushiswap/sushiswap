import {
  ExclamationTriangleIcon,
  HandThumbUpIcon,
} from '@heroicons/react/24/solid'
import { Button, Explainer, List, SelectIcon, classNames } from '@sushiswap/ui'
import { GoPlusLabsIcon } from '@sushiswap/ui/icons/GoPlusLabsIcon'
import { useMemo, useState } from 'react'
import {
  TokenSecurity,
  TokenSecurityLabel,
  TokenSecurityMessage,
  TokenSecurityResponse,
} from 'src/lib/hooks/react-query'
import { Token } from 'sushi/currency'

const isTokenSecurityIssue = {
  // Contract security
  is_open_source: (value: TokenSecurity['is_open_source']) => value === false,
  is_proxy: (value: TokenSecurity['is_proxy']) => value === true,
  is_mintable: (value: TokenSecurity['is_mintable']) => value === true,
  can_take_back_ownership: (value: TokenSecurity['can_take_back_ownership']) =>
    value === true,
  owner_change_balance: (value: TokenSecurity['owner_change_balance']) =>
    value === true,
  gas_abuse: (value: TokenSecurity['gas_abuse']) => value === true,
  hidden_owner: (value: TokenSecurity['hidden_owner']) => value === true,
  selfdestruct: (value: TokenSecurity['selfdestruct']) => value === true,
  external_call: (value: TokenSecurity['external_call']) => value === true,
  trust_list: (value: TokenSecurity['trust_list']) => value === true,
  // Trading security
  buy_tax: (value: TokenSecurity['buy_tax']) => value === true,
  sell_tax: (value: TokenSecurity['sell_tax']) => value === true,
  is_buyable: (value: TokenSecurity['is_buyable']) => value === false,
  is_sell_limit: (value: TokenSecurity['is_sell_limit']) => value === true,
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
  is_fake_token: (value: TokenSecurity['is_fake_token']) => value === true,
  is_airdrop_scam: (value: TokenSecurity['is_airdrop_scam']) => value === true,
} as Record<
  NonNullable<keyof TokenSecurity>,
  (value: TokenSecurity[keyof TokenSecurity]) => boolean
>

export const TokenSecurityView = ({
  tokenSecurityResponse,
  token,
  forceShowMore = false,
}: {
  tokenSecurityResponse: TokenSecurityResponse | undefined
  token: Token
  forceShowMore?: boolean
}) => {
  const [showMore, setShowMore] = useState<boolean>(forceShowMore)

  const { tokenSecurity, issues, nonIssues } = useMemo(() => {
    const tokenSecurity = tokenSecurityResponse?.[token.address]
    const issues: (keyof TokenSecurity)[] = []
    const nonIssues: (keyof TokenSecurity)[] = []

    for (const [_key, value] of Object.entries(tokenSecurity || {})) {
      const key = _key as keyof TokenSecurity
      if (key in isTokenSecurityIssue && isTokenSecurityIssue[key](value))
        issues.push(key)
      else nonIssues.push(key)
    }

    return { tokenSecurity, issues, nonIssues }
  }, [tokenSecurityResponse, token])

  return (
    <List className="!pt-0 overflow-hidden">
      <List.Control className="!overflow-y-auto">
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
        {!forceShowMore ? (
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
        ) : null}
      </List.Control>
    </List>
  )
}
