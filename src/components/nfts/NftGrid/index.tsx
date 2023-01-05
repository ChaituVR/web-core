import { useMemo, useState, type ReactElement } from 'react'
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  InputAdornment,
  Popover,
  SvgIcon,
  TextField,
  Typography,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import type { SafeCollectibleResponse } from '@safe-global/safe-gateway-typescript-sdk'
import useIsGranted from '@/hooks/useIsGranted'
import EnhancedTable from '@/components/common/EnhancedTable'
import ImageFallback from '@/components/common/ImageFallback'
import ExternalLink from '@/components/common/ExternalLink'
import useAsync from '@/hooks/useAsync'

interface NftsTableProps {
  collectibles: SafeCollectibleResponse[]
  onSendClick?: (nft: SafeCollectibleResponse) => void
}

const apiKey = process.env.NEXT_PUBLIC_OPENSEA_KEY

const useOpenSeaAsset = (
  tokenAddress: string,
  tokenId: string,
):
  | {
      image_url: string
      name: string
      permalink: string
    }
  | undefined => {
  const [data, error, loading] = useAsync(() => {
    if (!tokenAddress || !tokenId) return

    return fetch(`https://api.opensea.io/api/v1/asset/${tokenAddress}/${tokenId}/?include_orders=false`, {
      headers: {
        'X-API-KEY': apiKey,
      } as HeadersInit,
    }).then((data) => data.json())
  }, [tokenAddress, tokenId])

  return data
}

const Preview = ({
  nft,
  anchorEl,
  onClose,
}: {
  nft: SafeCollectibleResponse
  anchorEl: HTMLElement
  onClose: () => void
}) => {
  const data = useOpenSeaAsset(nft.address, nft.id)

  return (
    <Popover
      open
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          width: '300px',
          height: '300px',
          p: 1,
        }}
      >
        {data ? (
          <>
            <Box width="200px" height="200px">
              <img
                src={data.image_url}
                alt="NFT preview"
                style={{ display: 'block', maxWidth: '100%', maxHeight: '200px' }}
              />
            </Box>

            <Typography width="100%" textAlign="center">
              {data.name}
            </Typography>
            <Typography width="100%" textAlign="center" fontSize="small">
              Preview powered by <ExternalLink href={data.permalink}>OpenSea</ExternalLink>
            </Typography>
          </>
        ) : (
          <CircularProgress size={60} color="primary" />
        )}
      </Box>
    </Popover>
  )
}

const NftGrid = ({ collectibles, onSendClick }: NftsTableProps): ReactElement => {
  const isGranted = useIsGranted()
  const [search, setSearch] = useState('')
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [previewNft, setPreviewNft] = useState<SafeCollectibleResponse>()
  const [selected, setSelected] = useState<SafeCollectibleResponse[]>([])

  const shouldHideActions = !isGranted

  const headCells = useMemo(
    () => [
      {
        id: 'checkbox',
        label: '',
        width: '5%',
      },
      {
        id: 'collection',
        label: 'Collection',
        width: '30%',
      },
      {
        id: 'id',
        label: 'ID',
      },
      {
        id: 'explorer',
        label: 'Links',
        width: '10%',
      },
      {
        id: 'link',
        label: '',
        width: '10%',
      },
      {
        id: 'actions',
        label: '',
        width: '20%',
        hide: shouldHideActions,
        sticky: true,
      },
    ],
    [shouldHideActions],
  )

  const rows = collectibles
    .filter((nft) => nft.tokenName.toLowerCase().includes(search.toLowerCase()))
    .map((item) => {
      return {
        cells: {
          checkbox: {
            rawValue: item.id,
            content: (
              <Checkbox
                onClick={(e) => {
                  e.stopPropagation()
                  const { checked } = e.target as HTMLInputElement
                  setSelected((items) => (checked ? items.concat(item) : items.filter((i) => i.id !== item.id)))
                }}
              />
            ),
          },
          collection: {
            rawValue: item.tokenName,
            content: <Typography fontWeight="bold">{item.tokenName}</Typography>,
          },
          id: {
            rawValue: item.id,
            content: (
              <Box display="flex" alignItems="center" alignContent="center" gap={1}>
                <ImageFallback
                  src={item.logoUri}
                  alt={`${item.tokenName} collection icon`}
                  fallbackSrc="/images/common/nft-placeholder.png"
                  height="20"
                />
                {item.name ? (
                  <Typography>{item.name}</Typography>
                ) : (
                  <Typography sx={{ wordBreak: 'break-all' }}>
                    {item.tokenSymbol} #{item.id.slice(0, 30)}
                  </Typography>
                )}
              </Box>
            ),
          },
          explorer: {
            rawValue: item.address,
            content: (
              <>
                <ExternalLink href={`https://etherscan.io/nft/${item.address}/${item.id}`}>
                  {item.address.slice(0, 6)}...{item.address.slice(-4)}
                </ExternalLink>
              </>
            ),
          },
          actions: {
            rawValue: '',
            sticky: true,
            hide: shouldHideActions,
            content: (
              <Button variant="contained" color="primary" size="small" onClick={() => onSendClick?.(item)}>
                Send
              </Button>
            ),
          },
        },
      }
    })

  return (
    <>
      <TextField
        label="Search"
        variant="outlined"
        fullWidth
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SvgIcon component={SearchIcon} />
            </InputAdornment>
          ),
        }}
      />

      {apiKey && anchorEl && previewNft && (
        <Preview nft={previewNft} anchorEl={anchorEl} onClose={() => setAnchorEl(null)} />
      )}

      <Box my={2} display="flex" alignItems="center" gap={2}>
        <Button
          onClick={() => alert('This is just a demo!')}
          variant="contained"
          size="small"
          disabled={!selected.length}
        >
          Send selected
        </Button>

        <Typography variant="subtitle2" color="textSecondary">
          {selected.length ? `${selected.length} NFTs selected` : 'Select one of more NFTs to send as a batch'}
        </Typography>
      </Box>

      <EnhancedTable
        rows={rows}
        headCells={headCells}
        paginationKey={search}
        onRowClick={
          apiKey
            ? (e, row) => {
                const nft = collectibles.find(
                  (item) => item.address === row.cells.explorer.rawValue && item.id === row.cells.id.rawValue,
                )
                if (nft && e.target) {
                  setAnchorEl(e.target as HTMLTableRowElement)
                  setPreviewNft(nft)
                }
              }
            : undefined
        }
      />
    </>
  )
}

export default NftGrid
