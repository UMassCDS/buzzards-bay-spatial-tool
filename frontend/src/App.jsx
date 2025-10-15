import "@mantine/core/styles.css";
import "./styles/Help.css";

import {
  ActionIcon,
  AppShell,
  Burger,
  Button,
  Group,
  MantineProvider,
  Modal,
  Select,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import "./App.css";

import NavBar from "./components/NavBar";
import MainContent from "./components/MainContent";
import { useContext, useRef, useState } from "react";
import { useField } from "@mantine/form";
import { AnnotationsContext } from "./context/AnnotationsContext";
import Legend from "./components/Legend";
import { GiHarborDock } from "react-icons/gi";
import { IconQuestionMark } from "@tabler/icons-react";
import REGIONS from "./config/regions";

function App() {
  const context = useContext(AnnotationsContext);
  const [navBarOpened, { toggle }] = useDisclosure();
  const [modalOpened, { _open, close }] = useDisclosure(true);
  const helpTriggerRef = useRef();
  const [selectedRegion, setSelectedRegion] = useState("newengland");

  const validationFunction = (value) => {
    if (value === "") {
      return false;
    } else {
      return true;
    }
  };

  const userCodeField = useField({
    initialValue: "",
    validate: (value) => (validationFunction(value) ? "Code not valid" : null),
  });

  const regionOptions = Object.values(REGIONS).map((region) => ({
    value: region.id,
    label: region.name,
  }));

  return (
    <MantineProvider>
      <AppShell
        header={{ height: 60 }}
        navbar={{
          width: "30vw",
          breakpoint: "sm",
          collapsed: { mobile: !navBarOpened },
        }}
        padding="xs"
      >
        <Modal
          opened={modalOpened && context.intervieweeId === ""}
          onClose={close}
          title={
            <Group justify="space-between" style={{ width: "100%" }}>
              <Text>Login</Text>
              <ActionIcon
                onClick={() => helpTriggerRef.current?.()}
                variant="filled"
                color="blue"
                size="sm"
                className="help-button"
              >
                <IconQuestionMark size={16} />
              </ActionIcon>
            </Group>
          }
          closeOnClickOutside={false}
          closeOnEscape={false}
          withCloseButton={false}
          trapFocus
          style={{ zIndex: 100 }}
        >
          <TextInput
            {...userCodeField.getInputProps()}
            required={true}
            label="User code"
            description="A User Code is required to access the tool. Please enter the User Code provided by the Interviewer."
            mb="md"
          />
          <Select
            label="Select Region"
            placeholder="Choose a region"
            description="Select the region you want to work with. This cannot be changed after login."
            data={regionOptions}
            value={selectedRegion}
            onChange={(value) => setSelectedRegion(value)}
            required
            mb="md"
          />
          <Button
            disabled={!validationFunction(userCodeField.getValue())}
            onClick={() => {
              context.setIntervieweeId(userCodeField.getValue());
              context.setSelectedRegion(selectedRegion);
              close();
            }}
          >
            Log in
          </Button>
        </Modal>
        <AppShell.Header>
          <Group h="100%" px="sm" justify="space-between">
            <Group>
              <Burger
                opened={navBarOpened}
                onClick={toggle}
                hiddenFrom="sm"
                size="sm"
              />
              <GiHarborDock size={30} />
              <Title order={2}>
                COMBB Water Quality Monitoring Locations Interview Tool
              </Title>
            </Group>
            <Legend externalTrigger={helpTriggerRef} />
          </Group>
        </AppShell.Header>
        <AppShell.Navbar
          p="md"
          style={{
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <NavBar />
        </AppShell.Navbar>
        <AppShell.Main>
          <MainContent />
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
}

export default App;
