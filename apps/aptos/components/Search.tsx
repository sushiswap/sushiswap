import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Loader, classNames } from '@sushiswap/ui'
import React, {
  FC,
  KeyboardEvent,
  ReactElement,
  forwardRef,
  useCallback,
  useEffect,
  useState,
} from 'react'

interface Search {
  className?: string
  id: string
  input?(props: any): ReactElement | null
  value: string
  loading: boolean
  onChange(val: string): void
  size?: 'sm' | 'default'
  delimiter?: string
}

export const Search: FC<Search> = forwardRef<HTMLInputElement, Search>(
  function Search(
    {
      className,
      id,
      loading,
      input: Input,
      value,
      onChange,
      size = 'default',
      delimiter,
    },
    ref,
  ) {
    const [values, setValues] = useState({
      all: value.split(delimiter || ' '),
      typed: '',
    })
    const _onChange = useCallback(
      (val: string) => {
        if (val.slice(-1) === (delimiter || ' ')) {
          setValues((prev) => ({
            typed: '',
            all: [...prev.all, prev.typed],
          }))
        } else {
          setValues((prev) => ({
            typed: val,
            all: prev.all,
          }))
        }
      },
      [delimiter],
    )

    const remove = useCallback((val: string) => {
      setValues((prev) => ({
        typed: prev.typed,
        all: prev.all.filter((_val) => _val !== val),
      }))
    }, [])

    const handleKeyDown = useCallback(
      (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Backspace') {
          setValues((prev) => ({
            typed: prev.typed,
            all: prev.all.slice(0, -1),
          }))
        }
        if (event.key === 'Enter') {
          setValues((prev) => ({
            typed: '',
            all: [...prev.all, prev.typed],
          }))
        }
      },
      [],
    )

    useEffect(() => {
      if (delimiter) {
        onChange(
          `${values.typed} ${values.all
            .filter((el) => el !== ' ' && el !== '')
            .join(' ')}`,
        )
      }
    }, [delimiter, onChange, values])

    if (delimiter) {
      return (
        <div
          className={classNames(
            className,
            size === 'sm' ? 'h-[38px] text-sm px-[8px]' : '',
            '!focus-within:bg-gray-200 relative pr-10 rounded-xl flex gap-2.5 flex-grow items-center bg-black/[0.04] dark:bg-white/[0.04] px-3 py-2.5 h-[44px]',
          )}
        >
          <div
            className="block"
            style={{
              minWidth: size === 'sm' ? 18 : 24,
              minHeight: size === 'sm' ? 18 : 24,
            }}
          >
            <MagnifyingGlassIcon
              strokeWidth={2}
              width={size === 'sm' ? 18 : 24}
              height={size === 'sm' ? 18 : 24}
              className="text-gray-500 dark:text-slate-500"
            />
          </div>

          <div className="flex gap-1">
            {values.all
              .filter((el) => el !== ' ' && el !== '')
              .map((el, i) => (
                <button
                  type="button"
                  onClick={() => remove(el)}
                  key={i}
                  className="font-semibold text-gray-600 dark:text-slate-300 flex items-center text-sm rounded-full p-1 pl-2.5 bg-black/[0.08] dark:bg-white/[0.16] gap-1"
                >
                  {el}
                  <div className="cursor-pointer hover:bg-black/[0.16] dark:hover:bg-white/[0.24] rounded-full p-0.5">
                    <XMarkIcon
                      strokeWidth={3}
                      width={14}
                      height={14}
                      className="text-gray-600 dark:text-slate-300"
                    />
                  </div>
                </button>
              ))}
          </div>
          <input
            id={`${id}-address-input`}
            testdata-id={`${id}-address-input`}
            placeholder="Search"
            value={values.typed}
            onChange={(e) => _onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className={classNames(
              'truncate font-semibold w-full bg-transparent !p-0 placeholder:font-medium placeholder:text-gray-400 placeholder:dark:text-slate-500 text-gray-900 dark:text-slate-200',
            )}
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            autoComplete="off"
          />
          {(loading || value) && (
            <div className="absolute right-3 flex items-center">
              {loading ? (
                <div>
                  <Loader
                    size={16}
                    className="text-gray-700 dark:text-slate-500"
                  />
                </div>
              ) : value ? (
                <button
                  type="button"
                  onClick={() =>
                    setValues({
                      all: [],
                      typed: '',
                    })
                  }
                >
                  <XMarkIcon
                    width={24}
                    height={24}
                    className="cursor-pointer text-slate-500 hover:text-slate-300"
                  />
                </button>
              ) : (
                <></>
              )}
            </div>
          )}
        </div>
      )
    }
    return (
      <div
        className={classNames(
          className,
          size === 'sm' ? 'h-[38px] text-sm px-[8px]' : '',
          '!focus-within:bg-gray-200 relative pr-10 rounded-xl flex gap-2.5 flex-grow items-center bg-black/[0.04] dark:bg-white/[0.04] px-3 py-2.5 h-[44px]',
        )}
      >
        <MagnifyingGlassIcon
          strokeWidth={2}
          width={size === 'sm' ? 18 : 24}
          height={size === 'sm' ? 18 : 24}
          className="text-gray-500 dark:text-slate-500"
        />
        {Input ? (
          <Input
            ref={ref}
            id={`${id}-address-input`}
            testdata-id={`${id}-address-input`}
            variant="unstyled"
            placeholder="Search"
            value={value}
            onChange={onChange}
            className={classNames(
              'font-medium w-full bg-transparent !p-0 placeholder:font-medium placeholder:text-gray-400 placeholder:dark:text-slate-500 text-gray-900 dark:text-slate-200',
            )}
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            autoComplete="off"
          />
        ) : (
          <input
            id={`${id}-address-input`}
            testdata-id={`${id}-address-input`}
            placeholder="Search"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={classNames(
              'truncate font-semibold w-full bg-transparent !p-0 placeholder:font-medium placeholder:text-gray-400 placeholder:dark:text-slate-500 text-gray-900 dark:text-slate-200',
            )}
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            autoComplete="off"
          />
        )}
        {(loading || value) && (
          <div className="absolute right-3 flex items-center">
            {loading ? (
              <div>
                <Loader
                  size={16}
                  className="text-gray-700 dark:text-slate-500"
                />
              </div>
            ) : value ? (
              <button type="button" onClick={() => onChange('')}>
                <XMarkIcon
                  width={24}
                  height={24}
                  className="cursor-pointer text-slate-500 hover:text-slate-300"
                />
              </button>
            ) : (
              <></>
            )}
          </div>
        )}
      </div>
    )
  },
)
