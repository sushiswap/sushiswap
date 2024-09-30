import { DepositForm } from '~tron/_common/ui/Pools/Add/DepositForm'
import { SelectTokensForm } from '~tron/_common/ui/Pools/Add/SelectTokensForm'

export default function AddPage() {
  return (
    <>
      <SelectTokensForm />
      <DepositForm />
    </>
  )
}
