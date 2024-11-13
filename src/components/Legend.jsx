import { useDisclosure } from "@mantine/hooks";
import { Drawer, ActionIcon } from "@mantine/core";
import { GiHarborDock } from "react-icons/gi";

function Legend() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Drawer opened={opened} onClose={close} title="How to use this app?">
        <h1>Instructions</h1>
        <p>To be filled out...</p>
        <h1>Manual</h1>
        <p>To be filled out...</p>
        <h1>Legend</h1>
        <p>White markers represent low sensor value: 0</p>
        <p>Red markers represent high sensor value: 1</p>
      </Drawer>
      <ActionIcon onClick={open} variant="outline" color="cyan">
        <GiHarborDock size={30} />
      </ActionIcon>
    </>
  );
}

export default Legend;
