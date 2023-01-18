import { useEffect, useState } from 'react'
import type { SafeCollectiblesPage } from '@safe-global/safe-gateway-typescript-sdk'
import { type SafeCollectibleResponse } from '@safe-global/safe-gateway-typescript-sdk'
import { Box, Button, CircularProgress, Pagination, Typography } from '@mui/material'
import ErrorMessage from '@/components/tx/ErrorMessage'
import PagePlaceholder from '@/components/common/PagePlaceholder'
import NftIcon from '@/public/images/common/nft.svg'
import NftBatchModal from '@/components/tx/modals/NftBatchModal'
import NftGrid from '../NftGrid'
import useIsGranted from '@/hooks/useIsGranted'
import useCollectibles from '@/hooks/useCollectibles'

const NftCollections = () => {
  const [pageUrl, setPageUrl] = useState<string>()
  const [nftPages, setNftPages] = useState<SafeCollectiblesPage[]>([])
  const [currentPage, setCurrentPage] = useState<number>(-1)
  const [nfts, error, loading] = useCollectibles(pageUrl)
  const [selectedNfts, setSelectedNfts] = useState<SafeCollectibleResponse[]>([])
  const [sendNfts, setSendNfts] = useState<SafeCollectibleResponse[]>()
  const isGranted = useIsGranted()
  const currentNfts = nftPages[currentPage]?.results

  const onSelect = (token: SafeCollectibleResponse, checked: boolean) => {
    setSelectedNfts((prev) => (checked ? prev.concat(token) : prev.filter((t) => t.id !== token.id)))
  }

  useEffect(() => {
    if (nfts) {
      setNftPages((prev) => prev.concat(nfts))
      setCurrentPage((prev) => prev + 1)
    }
  }, [nfts])

  /* No NFTs to display */
  if (nfts && !nfts.results.length) {
    return <PagePlaceholder img={<NftIcon />} text="No NFTs available or none detected" />
  }

  return (
    <>
      {currentNfts?.length > 0 && (
        <>
          {/* Mass send button */}
          <Box my={2} display="flex" alignItems="center" gap={2}>
            <Button
              onClick={() => setSendNfts(selectedNfts)}
              variant="contained"
              size="small"
              disabled={!isGranted || !selectedNfts.length}
            >
              Send selected
            </Button>

            <Typography variant="subtitle2" color="textSecondary">
              {selectedNfts.length
                ? `${selectedNfts.length} NFTs selected`
                : 'Select one of more NFTs to send as a batch'}
            </Typography>
          </Box>

          {/* NFTs table */}
          <NftGrid
            nfts={currentNfts}
            onSendClick={isGranted ? (token) => setSendNfts([token]) : undefined}
            onSelect={onSelect}
          />
        </>
      )}

      {/* Pagination */}
      <Box display="flex" alignItems="center" gap={1} mt={3}>
        <Pagination
          count={nftPages.length}
          page={currentPage + 1}
          onChange={(_, page) => setCurrentPage(page - 1)}
          hideNextButton
          siblingCount={10}
          boundaryCount={10}
        />

        <Button
          onClick={nfts?.next ? () => setPageUrl(nfts.next) : undefined}
          variant="contained"
          size="small"
          disabled={loading || !nfts?.next}
        >
          {loading && <CircularProgress size={20} sx={{ mr: 1 }} />}
          Next page
        </Button>
      </Box>

      {/* Loading error */}
      {error && <ErrorMessage error={error}>Failed to load NFTs</ErrorMessage>}

      {/* Initial loading */}
      {!nftPages.length && loading && (
        <Box py={4} textAlign="center">
          {<CircularProgress size={40} />}
        </Box>
      )}

      {/* Send NFT modal */}
      {isGranted && sendNfts && (
        <NftBatchModal
          onClose={() => setSendNfts(undefined)}
          initialData={[
            {
              recipient: '',
              tokens: sendNfts,
            },
          ]}
        />
      )}
    </>
  )
}

export default NftCollections
