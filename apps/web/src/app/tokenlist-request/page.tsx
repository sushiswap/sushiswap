'use client'

import {
  CheckCircleIcon,
  EllipsisHorizontalCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/20/solid'
import { CameraIcon } from '@heroicons/react/24/outline'
import { zodResolver } from '@hookform/resolvers/zod'
import { TokenAnalysis } from '@sushiswap/graph-client/data-api/queries/token-list-submission'
import {
  Button,
  Card,
  Container,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  Label,
  LinkExternal,
  Loader,
  Message,
  NetworkSelector,
  SelectIcon,
  Separator,
  TextField,
  classNames,
} from '@sushiswap/ui'
import { NetworkIcon } from '@sushiswap/ui/icons/NetworkIcon'
import { useMutation } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useTokenAnalysis } from 'src/lib/hooks/api/useTokenAnalysis'
import { Chain, ChainId } from 'sushi/chain'
import { SUSHI_DATA_API_HOST } from 'sushi/config/subgraph'
import { formatNumber, formatUSD } from 'sushi/format'
import { SUPPORTED_CHAIN_IDS } from '../../config'
import { NavigationItems } from './navigation-items'
import {
  ApplyForTokenListTokenSchema,
  ApplyForTokenListTokenSchemaType,
} from './schema'

const Metrics = ({
  analysis,
  isValid,
  isLoading,
  isError,
}: {
  analysis: TokenAnalysis | undefined
  isValid: boolean
  isLoading: boolean
  isError: boolean
}) => {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold dark:text-slate-200 peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        Metrics
      </h2>

      <Card className="overflow-scroll">
        <div className="min-w-[600px]">
          <div className="grid grid-cols-4 gap-4 p-4 text-xs text-muted-foreground">
            <span>
              Age{' '}
              {analysis ? ` (>${analysis.requirements.minimumAge} Days)` : ''}
            </span>
            <span>
              Daily Volume{' '}
              {analysis
                ? ` (>${formatUSD(analysis.requirements.minimumVolumeUSD24h)})`
                : ''}
            </span>
            <span>
              Market Cap{' '}
              {analysis
                ? ` (>${formatUSD(analysis.requirements.minimumMarketcapUSD)})`
                : ''}
            </span>
            <span>
              Holder Count{' '}
              {analysis ? ` (>${analysis.requirements.minimumHolders})` : ''}
            </span>
          </div>
          <Separator />
          <div className="grid grid-cols-4 gap-4 p-4 text-xs">
            <div
              className={classNames(
                'text-xs flex flex-row space-x-1',
                analysis &&
                  analysis.metrics.age >= analysis.requirements.minimumAge
                  ? 'text-[#139B6D]'
                  : analysis &&
                      analysis.metrics.age < analysis.requirements.minimumAge
                    ? 'text-[#B4303C]'
                    : 'text-muted-foreground',
              )}
            >
              {analysis ? (
                <>
                  {analysis.metrics.age >= analysis.requirements.minimumAge ? (
                    <CheckCircleIcon width={15} height={15} />
                  ) : (
                    <ExclamationCircleIcon width={15} height={15} />
                  )}
                  <span>{analysis.metrics.age} Days</span>
                </>
              ) : (
                '-'
              )}
            </div>
            <div
              className={classNames(
                'text-xs flex flex-row space-x-1',
                analysis &&
                  analysis.metrics.volumeUSD24h >=
                    analysis.requirements.minimumVolumeUSD24h
                  ? 'text-[#139B6D]'
                  : analysis &&
                      analysis.metrics.volumeUSD24h <
                        analysis.requirements.minimumVolumeUSD24h
                    ? 'text-[#B4303C]'
                    : 'text-muted-foreground',
              )}
            >
              {analysis ? (
                <>
                  {analysis.metrics.volumeUSD24h >=
                  analysis.requirements.minimumVolumeUSD24h ? (
                    <CheckCircleIcon width={16} height={16} />
                  ) : (
                    <ExclamationCircleIcon width={16} height={16} />
                  )}

                  <span>{formatUSD(analysis.metrics.volumeUSD24h)}</span>
                </>
              ) : (
                '-'
              )}
            </div>

            <div
              className={classNames(
                'text-xs flex flex-row space-x-1',
                analysis &&
                  analysis.metrics.marketcapUSD >=
                    analysis.requirements.minimumMarketcapUSD
                  ? 'text-[#139B6D]'
                  : analysis &&
                      analysis.metrics.marketcapUSD <
                        analysis.requirements.minimumMarketcapUSD
                    ? 'text-[#B4303C]'
                    : 'text-muted-foreground',
              )}
            >
              {analysis ? (
                <>
                  {analysis.metrics.marketcapUSD >=
                  analysis.requirements.minimumMarketcapUSD ? (
                    <CheckCircleIcon width={16} height={16} />
                  ) : (
                    <ExclamationCircleIcon width={16} height={16} />
                  )}

                  <span>{formatUSD(analysis.metrics.marketcapUSD)}</span>
                </>
              ) : (
                '-'
              )}
            </div>

            <div
              className={classNames(
                'text-xs flex flex-row space-x-1',
                analysis &&
                  analysis.metrics.holders >=
                    analysis.requirements.minimumHolders
                  ? 'text-[#139B6D]'
                  : analysis &&
                      analysis.metrics.holders <
                        analysis.requirements.minimumHolders
                    ? 'text-[#B4303C]'
                    : 'text-muted-foreground',
              )}
            >
              {analysis ? (
                <>
                  {analysis.metrics.holders >=
                  analysis.requirements.minimumHolders ? (
                    <CheckCircleIcon width={16} height={16} />
                  ) : (
                    <ExclamationCircleIcon width={16} height={16} />
                  )}

                  <span>{formatNumber(analysis.metrics.holders)}</span>
                </>
              ) : (
                '-'
              )}
            </div>
          </div>
        </div>
      </Card>
      <Card>
        <div className="flex flex-row items-center gap-2 p-4">
          {isLoading ? (
            <Loader className="w-4 h-4 text-muted-foreground" />
          ) : isValid ? (
            <CheckCircleIcon
              width={16}
              height={16}
              className="text-[#139B6D]"
            />
          ) : analysis || isError ? (
            <ExclamationCircleIcon
              width={16}
              height={16}
              className="text-[#B4303C]"
            />
          ) : (
            <EllipsisHorizontalCircleIcon
              width={16}
              height={16}
              className="text-muted-foreground opacity-80"
            />
          )}
          <h3 className="text-sm font-medium text-muted-foreground">
            Token Status
          </h3>
        </div>
        <Separator />

        <ul className="p-4 list-disc list-inside text-muted-foreground text-xs min-h-[48px]">
          {analysis?.reasoning.map((reason, i) => (
            <li key={`reason-${i}`}>{reason}</li>
          ))}
          {isError ? <li>Token not found on coingecko.</li> : null}
        </ul>
      </Card>
    </div>
  )
}

export default function TokenListing() {
  const methods = useForm<ApplyForTokenListTokenSchemaType>({
    resolver: zodResolver(ApplyForTokenListTokenSchema),
    defaultValues: {
      chainId: ChainId.ETHEREUM,
      logoUrl: undefined,
      address: undefined,
    },
  })
  const [chainId, address, logoUrl] = methods.watch([
    'chainId',
    'address',
    'logoUrl',
  ])

  const {
    data: analysis,
    isLoading,
    isError: isTokenError,
  } = useTokenAnalysis({
    address,
    chainId,
  })

  const isValid = useMemo(() => {
    if (isTokenError) return false
    if (!analysis) return false
    if (analysis.isExisting) return false
    return !analysis.isExisting && analysis.isPassingRequirements
  }, [analysis, isTokenError])

  useEffect(() => {
    if (isTokenError)
      methods.setError('address', {
        type: 'custom',
        message: 'Token not found',
      })
    else methods.clearErrors('address')
  }, [methods, isTokenError])

  const { status, mutateAsync, isPending } = useMutation<
    void,
    Error,
    ApplyForTokenListTokenSchemaType
  >({
    mutationFn: async (values) => {
      const response = await fetch(
        `${SUSHI_DATA_API_HOST}/common/token-list/submit-token/v1`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        },
      )
      if (!response.ok) {
        throw new Error(`${response.statusText}`)
      }
      methods.reset()
    },
  })

  return (
    <>
      <Container
        maxWidth="7xl"
        className="px-4 h-[200px] shrink-0 flex flex-col justify-center gap-2"
      >
        <h1 className="text-4xl font-bold">Community List</h1>
        <p className="text-sm text-muted-foreground">
          Get your token verified to Sushi&apos;s Community List.
        </p>
      </Container>
      <NavigationItems />
      <div className="bg-gray-50 dark:bg-white/[0.02] border-t border-accent">
        <Container maxWidth="7xl" className="px-4 py-10">
          <Form {...methods}>
            <form
              onSubmit={methods.handleSubmit(
                mutateAsync as SubmitHandler<ApplyForTokenListTokenSchemaType>,
              )}
            >
              <div className="flex flex-col gap-8">
                <FormField
                  control={methods.control}
                  name="chainId"
                  render={({ field: { onChange, value } }) => (
                    <FormItem className="flex flex-row items-center gap-8">
                      <Label className="!text-lg font-semibold">
                        Select Network
                      </Label>
                      <FormControl>
                        <NetworkSelector
                          networks={SUPPORTED_CHAIN_IDS}
                          selected={value}
                          onSelect={onChange}
                        >
                          <Button
                            type="button"
                            variant="secondary"
                            className="!font-medium !mt-0"
                          >
                            <NetworkIcon
                              chainId={value}
                              width={16}
                              height={16}
                            />
                            {Chain.from(value)?.name}
                            <SelectIcon />
                          </Button>
                        </NetworkSelector>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={methods.control}
                  name="address"
                  render={({ field: { onChange, value, onBlur, name } }) => {
                    return (
                      <FormItem className="flex-1 max-w-[600px]">
                        <Label className="!text-lg font-semibold">
                          Token Address
                        </Label>
                        <FormControl>
                          <TextField
                            type="text"
                            placeholder="0x.."
                            onValueChange={onChange}
                            value={value ?? ''}
                            name={name}
                            onBlur={onBlur}
                            testdata-id="address"
                            unit={analysis?.token.symbol}
                          />
                        </FormControl>
                        <FormMessage>
                          The contract address of your token.
                        </FormMessage>
                      </FormItem>
                    )
                  }}
                />
                <Metrics
                  analysis={analysis}
                  isValid={isValid}
                  isLoading={isLoading}
                  isError={isTokenError}
                />
                <FormField
                  control={methods.control}
                  name="tweetUrl"
                  render={({ field: { onChange, value, onBlur, name } }) => {
                    return (
                      <FormItem className="flex-1 max-w-[600px]">
                        <Label className="!text-lg font-semibold">
                          Twitter Attestation
                        </Label>

                        <FormControl>
                          <TextField
                            type="text"
                            placeholder="https://x.com/username/status/123456789"
                            onValueChange={onChange}
                            value={value}
                            name={name}
                            onBlur={onBlur}
                            testdata-id="tweetUrl"
                            required={false}
                          />
                        </FormControl>
                        <FormMessage>
                          Give us a tweet including the token address from the
                          project&apos;s official Twitter account. This is not
                          required, but it increases the chances of getting
                          approved by verifying ownership of the token.
                        </FormMessage>
                      </FormItem>
                    )
                  }}
                />

                <FormField
                  control={methods.control}
                  name="logoUrl"
                  render={({ field: { onChange, value, onBlur, name } }) => {
                    return (
                      <FormItem className="flex-1 max-w-[600px]">
                        <Label className="!text-lg font-semibold">Logo</Label>

                        <FormControl>
                          <TextField
                            type="text"
                            placeholder="https://assets.coingecko.com/coins/images/279/standard/ethereum.png"
                            onValueChange={onChange}
                            value={value ?? ''}
                            name={name}
                            onBlur={onBlur}
                            testdata-id="logoUrl"
                          />
                        </FormControl>
                        <FormMessage>Logo URL of your token.</FormMessage>
                      </FormItem>
                    )
                  }}
                />

                <FormItem>
                  <Label className="!text-lg font-semibold">Preview</Label>

                  {logoUrl ? (
                    <div className="w-16 h-16">
                      <img
                        alt="logo"
                        src={logoUrl}
                        width={64}
                        height={64}
                        className="rounded-full"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full border-[3px] border-muted-foreground p-2">
                      <CameraIcon className="w-full h-full text-muted-foreground" />
                    </div>
                  )}
                </FormItem>

                {status === 'error' ? (
                  <Message size="sm" variant="destructive">
                    Oops! Something went wrong when trying to execute your
                    request.
                  </Message>
                ) : null}
                {status === 'success' ? (
                  <Message size="sm" variant="success">
                    Successfully send your whitelisting request! View your
                    request{' '}
                    <LinkExternal
                      href={'/pending-tokens'}
                      className="text-blue"
                    >
                      here
                    </LinkExternal>
                  </Message>
                ) : null}

                <div>
                  <Button
                    disabled={!methods.formState.isValid || !isValid}
                    loading={isLoading || isPending}
                    type="submit"
                  >
                    Submit for review
                  </Button>
                </div>
              </div>
            </form>
          </Form>
          <div className="pt-10">
            <p className="text-sm text-muted-foreground">
              * You can submit your token once it meets the required threshold
              values. These values may be different depending on the network you
              have selected. While there is an age requirement based on the
              token&apos;s first tradable date (not the creation date) to help
              reduce noise and maintain quality, exceptions may be made for
              well-known tokens within the community.
            </p>
            <p className="pt-2 text-sm text-muted-foreground">
              If your coin is listed on CoinGecko, it automatically bypasses all
              other requirements and can be submitted regardless. For notable
              pre-launch tokens, feel free to reach out in the #token-listings
              channel on Discord with your token address!
            </p>
          </div>
        </Container>
      </div>
    </>
  )
}
