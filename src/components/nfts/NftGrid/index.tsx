import { useMemo, useState, type ReactElement } from 'react'
import { Box, Button, Checkbox, Popover, Typography } from '@mui/material'
import type { SafeCollectibleResponse } from '@safe-global/safe-gateway-typescript-sdk'
import useIsGranted from '@/hooks/useIsGranted'
import EnhancedTable from '@/components/common/EnhancedTable'
import ImageFallback from '@/components/common/ImageFallback'
import ExternalLink from '@/components/common/ExternalLink'

interface NftsTableProps {
  collectibles: SafeCollectibleResponse[]
  onSendClick?: (nft: SafeCollectibleResponse) => void
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
      <Box width="200px" height="200px" p={1}>
        <img src={nft.imageUri} alt="NFT preview" style={{ display: 'block', maxWidth: '100%', maxHeight: '200px' }} />
      </Box>
    </Popover>
  )
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

const NftGrid = ({ collectibles, onSendClick }: NftsTableProps): ReactElement => {
  const isGranted = useIsGranted()
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
        id: 'links',
        label: 'Links',
        width: '10%',
      },
      {
        id: 'actions',
        label: '',
        hide: shouldHideActions,
        sticky: true,
      },
    ],
    [shouldHideActions],
  )

  const rows = collectibles.map((item) => {
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
      {anchorEl && previewNft && <Preview nft={previewNft} anchorEl={anchorEl} onClose={() => setAnchorEl(null)} />}

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
        onRowClick={(e, row) => {
          const nft = collectibles.find(
            (item) => item.address === row.cells.links.rawValue && item.id === row.cells.id.rawValue,
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
