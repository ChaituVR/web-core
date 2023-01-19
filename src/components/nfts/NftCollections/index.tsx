import { useEffect, useMemo, useState } from 'react'
import { type SafeCollectibleResponse } from '@safe-global/safe-gateway-typescript-sdk'
import { Box, Button, CircularProgress, SvgIcon, Typography } from '@mui/material'
import ErrorMessage from '@/components/tx/ErrorMessage'
import PagePlaceholder from '@/components/common/PagePlaceholder'
import NftIcon from '@/public/images/common/nft.svg'
import ArrowIcon from '@/public/images/common/arrow-nw.svg'
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
          <Box mb={2} display="flex" alignItems="center" gap={1}>
            <Box bgcolor="secondary.background" py={0.75} px={2} flex={1} borderRadius={1}>
              <Box display="flex" alignItems="center" gap={1.5}>
                <SvgIcon component={ArrowIcon} inheritViewBox color="border" sx={{ width: 12, height: 12 }} />

                <Typography variant="body2">
                  {`${selectedNfts.length} NFT${selectedNfts.length === 1 ? '' : 's'} selected`}
                </Typography>
              </Box>
            </Box>

            <Button
              onClick={() => setSelectedNfts([])}
              variant="outlined"
              size="small"
              sx={{
                py: selectedNfts.length ? '6px' : '7px',
                mx: selectedNfts.length ? '0' : '1px',
              }}
              disabled={!selectedNfts.length}
            >
              Deselect all
            </Button>

            <Button
              onClick={() => setSendNfts(selectedNfts)}
              variant="contained"
              size="small"
              disabled={!isGranted || !selectedNfts.length}
            >
              {isGranted ? 'Send' : 'Read only'}
            </Button>
          </Box>

          {/* NFTs table */}
          <NftGrid nfts={filteredNfts} selectedNfts={selectedNfts} onSelect={onSelect} onFilter={setFilter} />
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
