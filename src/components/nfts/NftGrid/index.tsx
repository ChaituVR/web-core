import { useMemo, useState, type ReactElement } from 'react'
import { Box, Button, CircularProgress, Popover, TextField, Typography } from '@mui/material'
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
            <img src={data.image_url} alt="NFT preview" height="200" />
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

  const shouldHideActions = !isGranted

  const headCells = useMemo(
    () => [
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
          collection: {
            rawValue: item.tokenName,
            content: (
              <Typography fontWeight="bold">
                {item.tokenName} ({item.tokenSymbol})
              </Typography>
            ),
          },
          id: {
            rawValue: item.id,
            content: (
              <Box display="flex" alignItems="center" alignContent="center" gap={1}>
                <ImageFallback
                  src={item.imageUri || item.logoUri}
                  alt={`${item.tokenName} collection icon`}
                  fallbackSrc="/images/common/nft-placeholder.png"
                  height="20"
                />
                <Typography sx={{ wordBreak: 'break-all' }}>#{item.id.slice(0, 30)}</Typography>
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
          link: {
            rawValue: item.address,
            content: (
              <ExternalLink href={`https://opensea.io/assets/ethereum/${item.address}/${item.id}`}>
                OpenSea
              </ExternalLink>
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
      />

      {apiKey && anchorEl && previewNft && (
        <Preview nft={previewNft} anchorEl={anchorEl} onClose={() => setAnchorEl(null)} />
      )}

      <EnhancedTable
        rows={rows}
        headCells={headCells}
        paginationKey={search}
        onRowClick={(e, row) => {
          const nft = collectibles.find(
            (item) => item.address === row.cells.explorer.rawValue && item.id === row.cells.id.rawValue,
          )
          if (nft && e.target) {
            setAnchorEl(e.target as HTMLTableRowElement)
            setPreviewNft(nft)
          }
        }}
      />
    </>
  )
}

export default NftGrid
