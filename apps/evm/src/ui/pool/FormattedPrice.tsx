import React from 'react'

interface FormattedNumberProps {
  number: string
}

const FormattedPrice: React.FC<FormattedNumberProps> = ({ number }) => {
  const groupZeros = (numberStr: string): JSX.Element[] => {
    const parts = numberStr.split('.')
    const integerPart = parts[0]
    const fractionalPart = parts[1]

    const zeroGroups = fractionalPart.match(/(?:0+)/) // Match consecutive zeros

    if (integerPart !== '0' || !zeroGroups || zeroGroups[0].length <= 4) {
      // If no zero groups found or less than or equal to 4 zeros, return regular rendering
      return [<span key="integer">{number}</span>]
    }

    const zeroCount = zeroGroups[0].length

    const renderDigits = (digits: string): JSX.Element[] => {
      return digits
        .split('')
        .map((digit, index) => <span key={index}>{digit}</span>)
    }

    return [
      <span key="before-decimal-group">{integerPart}.0</span>,
      <span
        key="decimal-count"
        style={{
          verticalAlign: 'sub',
          fontSize: '0.8em',
          top: '0.2em',
          paddingInlineStart: '0.2em',
          paddingInlineEnd: '0.2em',
        }}
      >
        {zeroCount}
      </span>,
      <span key="after-decimal-group">
        {renderDigits(fractionalPart.slice(zeroCount))}
      </span>,
    ]
  }

  return <>{groupZeros(number)}</>
}

export default FormattedPrice
