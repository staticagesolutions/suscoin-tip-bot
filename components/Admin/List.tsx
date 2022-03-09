import {
  Box,
  Button,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import { useAdminContract } from "contexts/admin-contract";

import { Controller, FieldValues, useForm } from "react-hook-form";

import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMemo, useState } from "react";

import utils from "web3-utils";

import DeleteIcon from "@mui/icons-material/Delete";
import { useQuery } from "react-query";

interface Submission {
  message: string;
  type: "error" | "success";
}

const NewAdminForm: React.FC = () => {
  const { addAdmin } = useAdminContract();
  const { handleSubmit, control, formState: { isValid } } = useForm({
    resolver: yupResolver(
      yup.object().shape({
        address: yup
          .string()
          .required("Address is required")
          .test({
            test: (value = "") => utils.isAddress(value),
            message: "Invalid format",
          }),
      })
    ),
    defaultValues: {
      address: "",
    },
  });

  const [submission, setSubmission] = useState<Submission | undefined>();

  const onSubmit = (formData: FieldValues) => {
    setSubmission(undefined);
    addAdmin(formData.address)
      .then((transactionhash) => {
        setSubmission({
          message: transactionhash,
          type: "success",
        });
      })
      .catch((message) => setSubmission({ message, type: "error" }));
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="address"
        control={control}
        render={({
          field: { onChange, value, name },
          formState: { errors },
        }) => (
          <TextField
            name={name}
            value={value}
            onChange={onChange}
            label="New Admin Address"
            sx={{ width: "100%", mb: 1 }}
            error={Object.keys(errors).length > 0}
            helperText={errors?.address?.message}
          />
        )}
      />
      <Button variant="contained" type="submit" disabled={!isValid}>
        Add as Admin
      </Button>
      {submission &&
        (submission.type === "error" ? (
          <Typography variant="body1" color={submission.type}>
            {submission.message}
          </Typography>
        ) : (
          <Link
            sx={{ mt: 1 }}
            href={`https://explorer.syscoin.org/tx/${submission.message}`}
            target="_blank"
          >
            {submission.message}
          </Link>
        ))}
    </Box>
  );
};

const AdminList: React.FC = () => {
  const { adminCount, getAdminAt, removeAdmin, roleMembers } =
    useAdminContract();

  const hanleDeleteAdmin = (address: string) => {
    removeAdmin(address).then((transactionhash) => {
      alert(transactionhash);
    });
  };

  return (
    <Box>
      <Typography variant="body1">
        Admin Count: {adminCount.isLoading ? "Loading..." : adminCount.data}
      </Typography>
      <List>
        {roleMembers.data?.map((member) => (
          <ListItem
            key={member}
            secondaryAction={
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => hanleDeleteAdmin(member)}
              >
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText>{member}</ListItemText>
          </ListItem>
        ))}
      </List>
      <NewAdminForm />
    </Box>
  );
};

export default AdminList;
