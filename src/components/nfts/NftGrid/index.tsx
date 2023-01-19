import type { SyntheticEvent } from 'react'
import { useMemo, type ReactElement } from 'react'
import {
  Box,
  Checkbox,
  Paper,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import FilterAltIcon from '@mui/icons-material/FilterAlt'
import NftIcon from '@/public/images/common/nft.svg'
import type { SafeCollectibleResponse } from '@safe-global/safe-gateway-typescript-sdk'
import ImageFallback from '@/components/common/ImageFallback'
import ExternalLink from '@/components/common/ExternalLink'

interface NftsTableProps {
  nfts: SafeCollectibleResponse[]
  selectedNfts: SafeCollectibleResponse[]
  onSelect: (item: SafeCollectibleResponse) => void
  onSendClick?: (nft: SafeCollectibleResponse) => void
  onFilter: (value: string) => void
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
    id: 'collection',
    label: 'Collection',
    width: '35%',
  },
  {
    id: 'id',
    label: 'ID',
    width: '35%',
  },
  {
    id: 'links',
    label: 'Links',
    width: '25%',
  },
  {
    id: 'checkbox',
    label: '',
    width: '5%',
  },
]

type Row = {
  key: string
  data: SafeCollectibleResponse
  cells: Record<string, ReactElement>
}

const minRows = 10
const iconSize = 20
const iconStyle = { width: '100%', maxHeight: '100%' }

const stopPropagation = (e: SyntheticEvent) => e.stopPropagation()

const NftGrid = ({ nfts, selectedNfts, onSendClick, onSelect, onFilter }: NftsTableProps): ReactElement => {
  const onFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilter(e.target.value.toLowerCase())
  }

  const handleRowClick = (row: Row) => {
    const item = nfts.find((nft) => nft === row.data)
    if (item) {
      onSelect(item)
    }
  }

  const fallbackIcon = <SvgIcon component={NftIcon} inheritViewBox width={iconSize} height={iconSize} />

  const rows: Row[] = useMemo(
    () =>
      nfts.map((item) => ({
        data: item,
        key: `${item.address}-${item.id}`,
        cells: {
          collection: (
            <Box display="flex" alignItems="center" alignContent="center" gap={1}>
              <Box width={iconSize} height={iconSize}>
                <ImageFallback
                  src={item.logoUri}
                  alt={`${item.tokenName} collection icon`}
                  fallbackComponent={fallbackIcon}
                  fallbackSrc=""
                  style={iconStyle}
                />
              </Box>

              <Typography fontWeight="bold">{item.tokenName || item.tokenSymbol}</Typography>
            </Box>
          ),
          id: (
            <Box display="flex" alignItems="center" alignContent="center" gap={1}>
              <Box width={iconSize} height={iconSize}>
                {item.imageUri ? (
                  <ImageFallback
                    src={item.imageUri}
                    alt={`${item.tokenName} NFT preview`}
                    fallbackComponent={fallbackIcon}
                    fallbackSrc=""
                    style={iconStyle}
                  />
                ) : null}
              </Box>

              {item.name ? (
                <Typography>{item.name}</Typography>
              ) : (
                <Typography sx={{ wordBreak: 'break-all' }}>
                  {item.tokenSymbol} #{item.id.slice(0, 20)}
                </Typography>
              )}
            </Box>
          ),
          links: (
            <Box display="flex" alignItems="center" alignContent="center" gap={1}>
              {linkTemplates.map(({ title, getUrl }) => (
                <ExternalLink href={getUrl(item)} key={title} onClick={stopPropagation}>
                  {title}
                </ExternalLink>
              ))}
            </Box>
          ),
          checkbox: <Checkbox checked={selectedNfts.includes(item)} />,
        },
      })),
    [nfts, selectedNfts, onSendClick, onSelect, fallbackIcon],
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
                  {headCell.id === 'collection' ? (
                    <Box display="flex" alignItems="center" alignContent="center" gap={1}>
                      <SvgIcon component={FilterAltIcon} />
                      <TextField
                        placeholder="Collection"
                        hiddenLabel
                        variant="standard"
                        size="small"
                        margin="none"
                        onChange={onFilterChange}
                      />
                    </Box>
                  ) : (
                    headCell.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row) => (
              <TableRow tabIndex={-1} key={row.key} onClick={() => handleRowClick(row)}>
                {headCells.map((cell) => (
                  <TableCell key={`${row.key}-${cell.id}`}>{row.cells[cell.id]}</TableCell>
                ))}
              </TableRow>
            ))}

            {/* Fill up the table up to N rows */}
            {Array.from({ length: minRows - rows.length }).map((_, index) => (
              <TableRow tabIndex={-1} key={index}>
                {headCells.map((headCell) => (
                  <TableCell key={headCell.id}>
                    <Box height="42px" width="42px" />
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
