import {
  Box,
  Button,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import { useAdminContract, useAdmin } from "contexts/admin-contract";

import { Controller, FieldValues, useForm } from "react-hook-form";

import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useState } from "react";

import utils from "web3-utils";

import { Edit } from "@mui/icons-material";
import AdminEditDialog from "./Edit";

interface Submission {
  message: string;
  type: "error" | "success";
}

const NewAdminForm: React.FC = () => {
  const { addAdmin } = useAdminContract();
  const {
    handleSubmit,
    control,
    formState: { isValid },
  } = useForm({
    mode: "all",
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

const AdminListItem: React.FC<{ member: string }> = ({ member }) => {
  const { data: admin, isLoading: adminIsLoading } = useAdmin(member);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <>
      <ListItem
        key={member}
        secondaryAction={
          <IconButton
            edge="end"
            aria-label="delete"
            onClick={() => setIsEditing(true)}
          >
            <Edit />
          </IconButton>
        }
      >
        <ListItemText>
          {member} {!adminIsLoading && admin && `(${admin.name})`}
        </ListItemText>
        <AdminEditDialog
          address={member}
          onClose={() => setIsEditing(false)}
          open={isEditing}
        />
      </ListItem>
    </>
  );
};

const AdminList: React.FC = () => {
  const { adminCount, getAdminAt, removeAdmin, roleMembers } =
    useAdminContract();

  return (
    <Box>
      <Typography variant="body1">
        Admin Count: {adminCount.isLoading ? "Loading..." : adminCount.data}
      </Typography>
      <List>
        {roleMembers.data?.map((member) => (
          <AdminListItem member={member} key={member} />
        ))}
      </List>
      <NewAdminForm />
    </Box>
  );
};

export default AdminList;
