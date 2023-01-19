import { useEffect, useMemo, useState } from 'react'
import { type SafeCollectibleResponse } from '@safe-global/safe-gateway-typescript-sdk'
import { Box, Button, CircularProgress, Typography } from '@mui/material'
import ErrorMessage from '@/components/tx/ErrorMessage'
import PagePlaceholder from '@/components/common/PagePlaceholder'
import NftIcon from '@/public/images/common/nft.svg'
import NftBatchModal from '@/components/tx/modals/NftBatchModal'
import NftGrid from '../NftGrid'
import useIsGranted from '@/hooks/useIsGranted'
import useCollectibles from '@/hooks/useCollectibles'
import InfiniteScroll from '@/components/common/InfiniteScroll'

const NftCollections = () => {
  const [pageUrl, setPageUrl] = useState<string>()
  const [nftPage, error, loading] = useCollectibles(pageUrl)
  const [allNfts, setAllNfts] = useState<SafeCollectibleResponse[]>([])
  const [selectedNfts, setSelectedNfts] = useState<SafeCollectibleResponse[]>([])
  const [sendNfts, setSendNfts] = useState<SafeCollectibleResponse[]>()
  const [filter, setFilter] = useState<string>('')
  const isGranted = useIsGranted()

  const onSelect = (token: SafeCollectibleResponse) => {
    setSelectedNfts((prev) => (prev.includes(token) ? prev.filter((t) => t !== token) : prev.concat(token)))
  }

  const filteredNfts = useMemo(() => {
    return allNfts.filter((nft) => nft.tokenName.toLowerCase().includes(filter))
  }, [allNfts, filter])

  useEffect(() => {
    if (nftPage) {
      setAllNfts((prev) => prev.concat(nftPage.results))
    }
  }, [nftPage])

  /* No NFTs to display */
  if (nftPage && !nftPage.results.length) {
    return <PagePlaceholder img={<NftIcon />} text="No NFTs available or none detected" />
  }

  return (
    <>
      {allNfts?.length > 0 && (
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
            nfts={filteredNfts}
            selectedNfts={selectedNfts}
            onSendClick={isGranted ? (token) => setSendNfts([token]) : undefined}
            onSelect={onSelect}
            onFilter={setFilter}
          />
        </>
      )}

      {/* Loading error */}
      {error && <ErrorMessage error={error}>Failed to load NFTs</ErrorMessage>}

      {/* Loading */}
      {loading && (
        <Box py={4} textAlign="center">
          {<CircularProgress size={40} />}
        </Box>
      )}

      {/* Infinite scroll */}
      {!loading && nftPage?.next && <InfiniteScroll onLoadMore={() => setPageUrl(nftPage.next)} />}

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
