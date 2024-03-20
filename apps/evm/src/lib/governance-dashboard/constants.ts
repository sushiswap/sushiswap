export const GOV_STATUS = {
  IMPLEMENTATION: {
    id: 'IMPLEMENTATION',
    title: 'Implementation Vote',
    color: 'bg-[#CF95FF]',
  },
  PROPOSAL: {
    id: 'PROPOSAL',
    title: 'Proposal Vote',
    color: 'bg-yellow',
  },
  DISCUSSION: {
    id: 'DISCUSSION',
    title: 'Discussions',
    color: 'bg-blue',
  },
} as const

export const DATE_FILTERS = {
  key: 'dateFilter',
  options: [
    { key: 'month', title: 'Last Month', seconds: 60 * 60 * 24 * 30 },
    {
      key: 'quarter',
      title: 'Last Quarter',
      seconds: (60 * 60 * 24 * 365) / 4,
    },
    { key: 'year', title: 'Last Year', seconds: 60 * 60 * 24 * 365 },
    { key: 'all', title: 'All Time', seconds: null },
  ],
}
