import { useMemo, type ReactElement } from 'react'
import {
  Box,
  Button,
  Checkbox,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import type { SafeCollectibleResponse } from '@safe-global/safe-gateway-typescript-sdk'
import ImageFallback from '@/components/common/ImageFallback'
import ExternalLink from '@/components/common/ExternalLink'

interface NftsTableProps {
  nfts: SafeCollectibleResponse[]
  onSelect: (item: SafeCollectibleResponse, checked: boolean) => void
  onSendClick?: (nft: SafeCollectibleResponse) => void
}

const linkTemplates: Array<{
  title: string
  getUrl: (nft: SafeCollectibleResponse) => string
}> = [
  {
    title: 'Etherscan',
    getUrl: (item) => `https://etherscan.io/nft/${item.address}/${item.id}`,
  },
  {
    title: 'OpenSea',
    getUrl: (item) => `https://opensea.io/assets/${item.address}/${item.id}`,
  },
]

const headCells = [
  {
    id: 'checkbox',
    label: '',
    width: '1%',
  },
  {
    id: 'collection',
    label: 'Collection',
    width: '40%',
  },
  {
    id: 'id',
    label: 'ID',
    width: '40%',
  },
  {
    id: 'links',
    label: 'Links',
    width: '10%',
  },
  {
    id: 'actions',
    label: '',
    width: '9%',
  },
]

const NftGrid = ({ nfts, onSendClick, onSelect }: NftsTableProps): ReactElement => {
  const rows = useMemo(
    () =>
      nfts.map((item) => ({
        key: `${item.address}-${item.id}`,
        cells: {
          checkbox: {
            rawValue: item.id,
            content: (
              <Checkbox
                onClick={(e) => {
                  e.stopPropagation()
                  const { checked } = e.target as HTMLInputElement
                  onSelect(item, checked)
                }}
              />
            ),
          },
          collection: {
            rawValue: item.tokenName,
            content: <Typography fontWeight="bold">{item.tokenName || item.tokenSymbol}</Typography>,
          },
          id: {
            rawValue: item.id,
            content: (
              <Box display="flex" alignItems="center" alignContent="center" gap={1}>
                <ImageFallback
                  src={item.logoUri}
                  alt={`${item.tokenName} collection icon`}
                  fallbackSrc="/images/common/nft-placeholder.png"
                  width="20"
                  style={{ maxHeight: '20px' }}
                />
                {item.name ? (
                  <Typography>{item.name}</Typography>
                ) : (
                  <Typography sx={{ wordBreak: 'break-all' }}>
                    {item.tokenSymbol} #{item.id.slice(0, 20)}
                  </Typography>
                )}
              </Box>
            ),
          },
          links: {
            rawValue: item.address,
            content: (
              <Box display="flex" alignItems="center" alignContent="center" gap={1}>
                {linkTemplates.map(({ title, getUrl }) => (
                  <ExternalLink href={getUrl(item)} key={title}>
                    {title}
                  </ExternalLink>
                ))}
              </Box>
            ),
          },
          actions: {
            rawValue: '',
            content: (
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={() => onSendClick?.(item)}
                disabled={!onSendClick}
              >
                Send
              </Button>
            ),
          },
        },
      })),
    [nfts, onSendClick, onSelect],
  )

  return (
    <>
      <TableContainer component={Paper}>
        <Table aria-labelledby="tableTitle">
          <TableHead>
            <TableRow>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  align="left"
                  padding="normal"
                  sx={headCell.width ? { width: headCell.width } : undefined}
                >
                  {headCell.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row) => (
              <TableRow tabIndex={-1} key={row.key}>
                {Object.entries(row.cells).map(([key, cell]) => (
                  <TableCell key={key}>{cell.content}</TableCell>
                ))}
              </TableRow>
            ))}

            {/* Fill the rows up to 10 with empty rows */}
            {Array.from({ length: 10 - rows.length }).map((_, index) => (
              <TableRow tabIndex={-1} key={index}>
                {headCells.map((headCell) => (
                  <TableCell key={headCell.id}>
                    <Box height="43px" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  )
}

export default NftGrid
