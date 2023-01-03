import { type ReactElement, memo } from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import { Box, Grid, Typography } from '@mui/material'
import AssetsHeader from '@/components/balances/AssetsHeader'
import NftCollections from '@/components/nfts/NftCollections'
import { AppCard } from '@/components/safe-apps/AppCard'
import { SafeAppsTag } from '@/config/constants'
import { useRemoteSafeApps } from '@/hooks/safe-apps/useRemoteSafeApps'

// `React.memo` requires a `displayName`
const NftApps = memo(function NftApps(): ReactElement | null {
  const [nftApps] = useRemoteSafeApps(SafeAppsTag.NFT)

  if (!nftApps?.length) {
    return null
  }

  return (
    <Box mb={4}>
      <Typography component="h2" variant="subtitle1" fontWeight={700} my={2}>
        NFT Safe Apps
      </Typography>

      <Grid container spacing={3}>
        {nftApps.map((nftApp) => (
          <Grid item xs={12} md={4} lg={3} key={nftApp.id}>
            <AppCard safeApp={nftApp} />
          </Grid>
        ))}
      </Grid>
    </Box>
  )
})

const NFTs: NextPage = () => {
  return (
    <>
      <Head>
        <title>Safe – NFTs</title>
      </Head>

      <AssetsHeader />

      <main>
        <NftApps />

        <NftCollections />
      </main>
    </>
  )
}

export default NFTs
