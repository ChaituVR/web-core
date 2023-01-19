import { Box, Button, DialogContent, FormControl, Grid, SvgIcon, Typography } from '@mui/material'
import { FormProvider, useForm } from 'react-hook-form'
import NftIcon from '@/public/images/common/nft.svg'
import AddressBookInput from '@/components/common/AddressBookInput'
import SendFromBlock from '../../SendFromBlock'
import { type NftTransferParams } from '.'
import ImageFallback from '@/components/common/ImageFallback'
import useAddressBook from '@/hooks/useAddressBook'
import SendToBlock from '@/components/tx/SendToBlock'

enum Field {
  recipient = 'recipient',
}

type FormData = {
  [Field.recipient]: string
}

export type SendNftBatchProps = {
  onSubmit: (data: NftTransferParams) => void
  params: NftTransferParams
}

const NftItem = ({ image, name, description }: { image: string; name: string; description?: string }) => (
  <Grid container spacing={1} alignItems="center" wrap="nowrap" my={1}>
    <Grid item>
      <Box width={20} height={20}>
        <ImageFallback
          src={image}
          fallbackSrc=""
          fallbackComponent={<SvgIcon component={NftIcon} inheritViewBox width={20} height={20} />}
          alt={name}
          height={20}
        />
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

const SendNftBatch = ({ params, onSubmit }: SendNftBatchProps) => {
  const addressBook = useAddressBook()
  const { tokens } = params

  const formMethods = useForm<FormData>({
    defaultValues: {
      [Field.recipient]: params.recipient || '',
    },
  })
  const { handleSubmit, watch, setValue } = formMethods

  const recipient = watch(Field.recipient)

  const onFormSubmit = (data: FormData) => {
    onSubmit({
      recipient: data.recipient,
      tokens,
    })
  }

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <DialogContent>
          <SendFromBlock title={`Sending ${tokens.length} NFT${tokens.length > 1 ? 's' : ''} from`} />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <Typography color={({ palette }) => palette.text.secondary} pb={1}>
              To
            </Typography>

            {addressBook[recipient] ? (
              <Box onClick={() => setValue(Field.recipient, '')}>
                <SendToBlock address={recipient} />
              </Box>
            ) : (
              <AddressBookInput name={Field.recipient} label="Recipient" />
            )}
          </FormControl>

          {tokens.map((token) => (
            <NftItem
              key={`${token.address}-${token.id}`}
              image={token.imageUri || token.logoUri}
              name={`${token.tokenName || token.tokenSymbol || ''} #${token.id}`}
              description={`Token ID: ${token.id}${token.name ? ` - ${token.name}` : ''}`}
            />
          ))}
        </DialogContent>

        <Button variant="contained" type="submit">
          Next
        </Button>
      </form>
    </FormProvider>
  )
}

export default SendNftBatch
