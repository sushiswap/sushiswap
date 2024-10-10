import { CellContext } from '@tanstack/react-table'

export type Row<T> = { row: T; ctx?: CellContext<T, unknown> }
