import "@mantine/core/styles.css";

import {
  AppShell,
  Burger,
  Button,
  Divider,
  Group,
  MantineProvider,
  Modal,
  Skeleton,
  TextInput,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { GiHarborDock } from "react-icons/gi";
import "./App.css";

import NavBar from "./components/NavBar";
import MainContent from "./components/MainContent";
import { useState } from "react";
import { useField } from "@mantine/form";
import { AnnotationsContextProvider } from "./context/AnnotationsContext";

function App() {
  const [navBarOpened, { toggle }] = useDisclosure();
  const [modalOpened, { open, close }] = useDisclosure(true);
  const userCodeField = useField({
    initialValue: "",
    validateOnBlur: true,
    validate: (value) => (value === "" ? "Code not valid" : null),
  });

  return (
    <AnnotationsContextProvider>
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
            opened={modalOpened}
            onClose={close}
            title="Login"
            closeOnClickOutside={false}
            closeOnEscape={false}
            trapFocus
          >
            <TextInput
              {...userCodeField.getInputProps()}
              required={true}
              label="User code"
              description="Unique identifier for the interviewee"
              mb="md"
            />
            <Button onClick={close}>Log in</Button>
          </Modal>
          <AppShell.Header>
            <Group h="100%" px="sm">
              <Burger
                opened={navBarOpened}
                onClick={toggle}
                hiddenFrom="sm"
                size="sm"
              />
              <GiHarborDock size={30} />
              <Title order={2}>Buzzards Bay Interview Tool</Title>
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
            <NavBar code={userCodeField.getValue()} />
          </AppShell.Navbar>
          <AppShell.Main>
            <MainContent />
          </AppShell.Main>
        </AppShell>
      </MantineProvider>
    </AnnotationsContextProvider>
  );
}

export default App;
