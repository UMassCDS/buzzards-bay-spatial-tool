import { Fieldset, Text } from "@mantine/core";
import { useContext } from "react";
import { AnnotationsContext } from "../context/AnnotationsContext";

function UserInformation() {
  const context = useContext(AnnotationsContext);
  return (
    <Fieldset legend="Interviewee Information" variant="filled">
      <Text>
        You are signed in as <b>{context.intervieweeId}</b>.
      </Text>
    </Fieldset>
  );
}

export default UserInformation;
