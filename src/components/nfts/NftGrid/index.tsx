import type { SyntheticEvent } from 'react'
import { useCallback } from 'react'
import { useMemo, type ReactElement } from 'react'
import {
  Box,
  Checkbox,
  InputAdornment,
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
import useChainId from '@/hooks/useChainId'
import { nftPlatforms } from '../config'

interface NftsTableProps {
  nfts: SafeCollectibleResponse[]
  selectedNfts: SafeCollectibleResponse[]
  onSelect: (item: SafeCollectibleResponse) => void
  onFilter: (value: string) => void
}

const minRows = 10
const iconSize = 20
const iconStyle = { width: '100%', maxHeight: '100%' }

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
    width: '7%',
  },
]

const stopPropagation = (e: SyntheticEvent) => e.stopPropagation()

const NftGrid = ({ nfts, selectedNfts, onSelect, onFilter }: NftsTableProps): ReactElement => {
  const chainId = useChainId()
  const linkTemplates = nftPlatforms[chainId]

  const onFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onFilter(e.target.value.toLowerCase())
    },
    [onFilter],
  )

  const fallbackIcon = useMemo(
    () => <SvgIcon component={NftIcon} inheritViewBox width={iconSize} height={iconSize} />,
    [],
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
                      <TextField
                        placeholder="Collection"
                        hiddenLabel
                        variant="standard"
                        size="small"
                        margin="none"
                        onChange={onFilterChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SvgIcon
                                component={FilterAltIcon}
                                inheritViewBox
                                color="border"
                                sx={{ marginTop: -0.5 }}
                              />
                            </InputAdornment>
                          ),
                          disableUnderline: true,
                        }}
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
            {nfts.map((item) => (
              <TableRow tabIndex={-1} key={`${item.address}-${item.id}`} onClick={() => onSelect(item)}>
                {/* Collection name */}
                <TableCell>
                  <Box display="flex" alignItems="center" alignContent="center" gap={1}>
                    <Box width={iconSize} height={iconSize} mr={1}>
                      <ImageFallback
                        src={item.logoUri}
                        alt={`${item.tokenName} collection icon`}
                        fallbackComponent={fallbackIcon}
                        fallbackSrc=""
                        style={iconStyle}
                      />
                    </Box>

                    <Typography>{item.tokenName || item.tokenSymbol}</Typography>
                  </Box>
                </TableCell>

                {/* Token ID */}
                <TableCell>
                  <Box display="flex" alignItems="center" alignContent="center" gap={1}>
                    <Box width={iconSize} height={iconSize} mr={1}>
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

                    <ExternalLink href={linkTemplates ? linkTemplates[0].getUrl(item) : ''} onClick={stopPropagation}>
                      <Typography sx={item.name ? undefined : { wordBreak: 'break-all' }}>
                        {item.name || `${item.tokenSymbol} #${item.id.slice(0, 20)}`}
                      </Typography>
                    </ExternalLink>
                  </Box>
                </TableCell>

                {/* Links */}
                <TableCell>
                  <Box display="flex" alignItems="center" alignContent="center" gap={1.5}>
                    {linkTemplates?.map(({ title, logo, getUrl }) => (
                      <ExternalLink href={getUrl(item)} key={title} onClick={stopPropagation} noIcon>
                        <img src={logo} width={24} height={24} alt={title} />
                      </ExternalLink>
                    ))}
                  </Box>
                </TableCell>

                {/* Checkbox */}
                <TableCell align="right">
                  <Checkbox checked={selectedNfts.includes(item)} />
                </TableCell>
              </TableRow>
            ))}

            {/* Fill up the table up to min rows */}
            {Array.from({ length: minRows - nfts.length }).map((_, index) => (
              <TableRow tabIndex={-1} key={index} sx={{ pointerEvents: 'none' }}>
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
