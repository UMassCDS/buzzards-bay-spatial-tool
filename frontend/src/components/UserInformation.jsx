import { useForm } from "@mantine/form";
import { TextInput, Fieldset, Group, Box, Text } from "@mantine/core";
import { useContext } from "react";
import { AnnotationsContext } from "../context/AnnotationsContext";

function UserInformation() {
  const context = useContext(AnnotationsContext);
  return (
    <Fieldset legend="Interviewee Information" variant="filled">
      <Text>
        You are signed in as <b>{context.intervieweeId}</b>.
      </Text>
      {/* <TextInput label="Name" placeholder="John Smith" />
      <TextInput
        label="Phone Number"
        placeholder="314-314-3143"
        mt="md"
      ></TextInput>
      <TextInput
        label="Address"
        description="Line1, Line2, City, Zip"
        placeholder="56 Eastman Ln, Amherst, 01003"
        mt="md"
      /> */}
    </Fieldset>
  );
}

export default UserInformation;
