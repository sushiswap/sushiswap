export const formatNumberWithDecimals = (number: number, decimals: number) => {
  if (number === 0) return '0'
  let _number = (number / 10 ** decimals).toFixed(decimals)
  if (_number) {
    if (_number.includes('.') && _number.split('.')[1].length > 8) {
      _number = Number(_number).toFixed(8)
    }
    if (_number.includes('.') && parseFloat(_number.split('.')[0]) > 0) {
      _number = Number(_number).toFixed(4)
    }
  } else {
    _number = '0'
  }
  if (Number(_number) < 0.000000001) {
    return '0'
  }
  return _number
}
