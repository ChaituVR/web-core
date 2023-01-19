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
  onFilter: (value: string) => void
}

type Row = {
  key: string
  data: SafeCollectibleResponse
  cells: Record<string, ReactElement>
}

const minRows = 10
const iconSize = 20
const iconStyle = { width: '100%', maxHeight: '100%' }

const linkTemplates: Array<{
  title: string
  logo: string
  getUrl: (nft: SafeCollectibleResponse) => string
}> = [
  {
    title: 'Etherscan',
    logo: '/images/common/nft-etherscan.svg',
    getUrl: (item) => `https://etherscan.io/nft/${item.address}/${item.id}`,
  },
  {
    title: 'OpenSea',
    logo: '/images/common/nft-opensea.svg',
    getUrl: (item) => `https://opensea.io/assets/${item.address}/${item.id}`,
  },
  {
    title: 'Blur',
    logo: '/images/common/nft-blur.svg',
    getUrl: (item) => `https://blur.io/asset/${item.address}/${item.id}`,
  },
  {
    title: 'LooksRare',
    logo: '/images/common/nft-looksrare.svg',
    getUrl: (item) => `https://looksrare.org/collections/${item.address}/${item.id}`,
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
    label: (
      <>
        <Box width={iconSize} component="img" mr={1} />
        Token ID
      </>
    ),
  },
  {
    id: 'links',
    label: 'Links',
    width: '10%',
  },
  {
    id: 'checkbox',
    label: '',
    width: '5%',
  },
]

const stopPropagation = (e: SyntheticEvent) => e.stopPropagation()

const NftGrid = ({ nfts, selectedNfts, onSelect, onFilter }: NftsTableProps): ReactElement => {
  const onFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilter(e.target.value.toLowerCase())
  }

  const handleRowClick = (row: Row) => {
    const item = nfts.find((nft) => nft === row.data)
    if (item) {
      onSelect(item)
    }
  }

  const fallbackIcon = useMemo(
    () => <SvgIcon component={NftIcon} inheritViewBox width={iconSize} height={iconSize} />,
    [],
  )

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

              <ExternalLink href={linkTemplates[0].getUrl(item)} onClick={stopPropagation}>
                <Typography sx={item.name ? undefined : { wordBreak: 'break-all' }}>
                  {item.name || `${item.tokenSymbol} #${item.id.slice(0, 20)}`}
                </Typography>
              </ExternalLink>
            </Box>
          ),
          links: (
            <Box display="flex" alignItems="center" alignContent="center" gap={1.5}>
              {linkTemplates.map(({ title, logo, getUrl }) => (
                <ExternalLink href={getUrl(item)} key={title} onClick={stopPropagation} noIcon>
                  <img src={logo} width={24} height={24} alt={title} />
                </ExternalLink>
              ))}
            </Box>
          ),
          checkbox: <Checkbox checked={selectedNfts.includes(item)} />,
        },
      })),
    [nfts, selectedNfts, fallbackIcon],
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
