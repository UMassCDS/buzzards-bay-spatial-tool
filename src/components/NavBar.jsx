import UserInformation from "./UserInformation.jsx";
import Annotations from "./Annotations.jsx";
import AnnotationInput from "./AnnotationInput.jsx";
import { Button, Divider, Stack } from "@mantine/core";

function NavBar({ code }) {
  return (
    <div style={{ flexGrow: 1, overflow: "auto" }}>
      <Stack gap="md">
        <UserInformation code={code} />
        <Divider />
        <Annotations />
        <Divider />
        <AnnotationInput />
        <Divider />
        <Button variant="filled" color="lime">
          Submit Interview
        </Button>
      </Stack>
    </div>
  );
}

export default NavBar;
