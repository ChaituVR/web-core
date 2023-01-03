import { useMemo, useState, type ReactElement } from 'react'
import { Box, Button, TextField, Typography } from '@mui/material'
import type { SafeCollectibleResponse } from '@safe-global/safe-gateway-typescript-sdk'
import useIsGranted from '@/hooks/useIsGranted'
import EnhancedTable from '@/components/common/EnhancedTable'
import ImageFallback from '@/components/common/ImageFallback'
import ExternalLink from '@/components/common/ExternalLink'

interface NftsTableProps {
  collectibles: SafeCollectibleResponse[]
  onSendClick?: (nft: SafeCollectibleResponse) => void
}

const NftGrid = ({ collectibles, onSendClick }: NftsTableProps): ReactElement => {
  const isGranted = useIsGranted()
  const [search, setSearch] = useState('')

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
        collection: {
          rawValue: item.tokenName,
          content: (
            <Typography>
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
            <ExternalLink href={`https://opensea.io/assets/ethereum/${item.address}/${item.id}`}>OpenSea</ExternalLink>
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
      <EnhancedTable rows={rows} headCells={headCells} />
    </>
  )
}

export default NftGrid
