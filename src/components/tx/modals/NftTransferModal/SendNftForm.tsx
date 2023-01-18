import { Box, Button, DialogContent, FormControl, Grid, Typography } from '@mui/material'
import { FormProvider, useForm } from 'react-hook-form'
import AddressBookInput from '@/components/common/AddressBookInput'
import SendFromBlock from '../../SendFromBlock'
import { type NftTransferParams } from '.'
import ImageFallback from '@/components/common/ImageFallback'
import useAddressBook from '@/hooks/useAddressBook'
import SendToBlock from '@/components/tx/SendToBlock'

enum Field {
  recipient = 'recipient',
  tokenAddress = 'tokenAddress',
  tokenId = 'tokenId',
}

type FormData = {
  [Field.recipient]: string
  [Field.tokenAddress]: string
  [Field.tokenId]: string
}

export type SendNftFormProps = {
  onSubmit: (data: NftTransferParams) => void
  params: NftTransferParams
}

const NftItem = ({ image, name, description }: { image: string; name: string; description?: string }) => (
  <Grid container spacing={1} alignItems="center" wrap="nowrap">
    <Grid item>
      <Box width={20} height={20}>
        <ImageFallback src={image} fallbackSrc="/images/common/nft-placeholder.png" alt={name} height={20} />
      </Box>
    </Grid>
    <Grid item overflow="hidden">
      <Typography overflow="hidden" textOverflow="ellipsis">
        {name}
      </Typography>

      {description && (
        <Typography variant="caption" color="primary.light" display="block" overflow="hidden" textOverflow="ellipsis">
          {description}
        </Typography>
      )}
    </Grid>
  </Grid>
)

const SendNftForm = ({ params, onSubmit }: SendNftFormProps) => {
  const addressBook = useAddressBook()
  const { token } = params

  const formMethods = useForm<FormData>({
    defaultValues: {
      [Field.recipient]: params.recipient || '',
      [Field.tokenAddress]: token.address || '',
      [Field.tokenId]: token.id || '',
    },
  })
  const { handleSubmit, watch, setValue } = formMethods

  const recipient = watch(Field.recipient)

  const onFormSubmit = (data: FormData) => {
    onSubmit({
      recipient: data.recipient,
      token,
    })
  }

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <DialogContent>
          <SendFromBlock />

          <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
            {addressBook[recipient] ? (
              <Box onClick={() => setValue(Field.recipient, '')}>
                <SendToBlock address={recipient} />
              </Box>
            ) : (
              <AddressBookInput name={Field.recipient} label="Recipient" />
            )}
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <Typography color={({ palette }) => palette.text.secondary} pb={1}>
              Token
            </Typography>

            <NftItem
              image={token.imageUri || token.logoUri}
              name={`${token.tokenName || token.tokenSymbol || ''} #${token.id}`}
              description={`Token ID: ${token.id}${token.name ? ` - ${token.name}` : ''}`}
            />
          </FormControl>
        </DialogContent>

        <Button variant="contained" type="submit">
          Next
        </Button>
      </form>
    </FormProvider>
  )
}

export default SendNftForm
