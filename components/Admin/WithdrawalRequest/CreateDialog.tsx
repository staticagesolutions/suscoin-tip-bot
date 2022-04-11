import { yupResolver } from "@hookform/resolvers/yup";
import {
  Box,
  Button,
  Dialog,
  DialogProps,
  TextField,
  Typography,
} from "@mui/material";
import { Controller, FieldValues, useForm } from "react-hook-form";
import { useMutation } from "react-query";

import * as yup from "yup";

interface AdminWithdrawalRequestCreateDialogProps extends DialogProps {
  maximum: number;
  initiator: string;
}

const AdminWithdrawalRequestCreateDialog: React.FC<
  AdminWithdrawalRequestCreateDialogProps
> = ({ maximum, initiator, ...dialogProps }) => {
  const { control, handleSubmit } = useForm({
    mode: "all",
    resolver: yupResolver(
      yup.object({
        amount: yup
          .number()
          .max(maximum, "Cannot go beyond current contract balance")
          .min(0.0001),
        reason: yup.string().required("Reason is required").max(200),
      })
    ),
    defaultValues: {
      amount: maximum,
      reason: "",
    },
  });

  const { mutate, error, isError } = useMutation({
    mutationFn: (data: FieldValues) => {
      return fetch("/api/withdrawal-request", {
        method: "POST",
        body: JSON.stringify({ ...data, address: initiator }),
      }).then(async (response) => {
        if (!response.ok) {
          const error = await response.json();
          throw error;
        }
        return response;
      });
    },
  });

  const onSubmit = (values: FieldValues) => {
    mutate(values);
  };

  return (
    <Dialog {...dialogProps}>
      <Box sx={{ p: 3 }} component="form" onSubmit={handleSubmit(onSubmit)}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Create Withdrawal Request
        </Typography>

        <Controller
          name="amount"
          control={control}
          render={({ field, formState: { errors } }) => (
            <TextField
              {...field}
              type="number"
              inputProps={{
                inputMode: "numeric",
                pattern: "[0-9]*",
                step: 0.1,
              }}
              label="Amount"
              fullWidth
              sx={{ mb: 2 }}
              error={Boolean(errors.amount)}
              helperText={errors?.amount?.message}
            />
          )}
        />
        <Controller
          name="reason"
          control={control}
          render={({ field, formState: { errors } }) => (
            <TextField
              {...field}
              label="Reason"
              fullWidth
              sx={{ mb: 2 }}
              error={Boolean(errors.reason)}
              helperText={errors?.reason?.message}
            />
          )}
        />
        <Button type="submit">Submit</Button>
        {isError && <Typography color="error">{(error as any).message}</Typography>}
      </Box>
    </Dialog>
  );
};

export default AdminWithdrawalRequestCreateDialog;
