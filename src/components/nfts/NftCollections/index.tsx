import { useState } from 'react'
import { getCollectibles, type SafeCollectibleResponse } from '@safe-global/safe-gateway-typescript-sdk'
import { Box, CircularProgress } from '@mui/material'
import ErrorMessage from '@/components/tx/ErrorMessage'
import PagePlaceholder from '@/components/common/PagePlaceholder'
import NftIcon from '@/public/images/common/nft.svg'
import NftTransferModal from '@/components/tx/modals/NftTransferModal'
import NftGrid from '../NftGrid'
import useIsGranted from '@/hooks/useIsGranted'
import useAsync from '@/hooks/useAsync'
import useSafeInfo from '@/hooks/useSafeInfo'

const NftCollections = () => {
  const { safe, safeAddress } = useSafeInfo()
  const [sendNft, setSendNft] = useState<SafeCollectibleResponse>()
  const isGranted = useIsGranted()

  const [allNfts = [], error, loading] = useAsync<SafeCollectibleResponse[]>(() => {
    if (!safeAddress) return undefined
    return getCollectibles(safe.chainId, safeAddress)
  }, [safe.chainId, safeAddress])

  /* No NFTs to display */
  if (safeAddress && !allNfts.length && !loading && !error) {
    return <PagePlaceholder img={<NftIcon />} text="No NFTs available or none detected" />
  }

  return (
    <>
      {/* Aggregated NFTs grouped by collection */}
      {allNfts.length > 0 && (
        <NftGrid collectibles={allNfts} onSendClick={isGranted ? (nft) => setSendNft(nft) : undefined} />
      )}

      {/* Loading error */}
      {error && <ErrorMessage error={error}>Failed to load NFTs</ErrorMessage>}

      <Box py={4} textAlign="center">
        {/* Loading */}
        {loading && <CircularProgress size={40} />}
      </Box>

      {/* Send NFT modal */}
      {isGranted && sendNft && (
        <NftTransferModal
          onClose={() => setSendNft(undefined)}
          initialData={[
            {
              recipient: '',
              token: sendNft,
            },
          ]}
        />
      )}
    </>
  )
}

export default NftCollections
