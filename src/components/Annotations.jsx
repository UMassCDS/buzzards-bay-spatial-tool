import {
  Menu,
  Card,
  Text,
  ActionIcon,
  Button,
  Group,
  Box,
  Collapse,
  Paper,
  Stack,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import { FaRegTrashAlt } from "react-icons/fa";

import "../styles/Annotations.css";

function Annotations() {
  const [opened, { toggle }] = useDisclosure(false);
  // const [opened, setOpened] = useState(false);
  const [items, setItems] = useState([
    { id: 1, type: "Area of Interest", notes: "I got fish" },
    { id: 2, type: "Suggested Sensor Location", notes: "Something" },
    { id: 3, type: "Suggested Sensor Location", notes: "Another note" },
  ]);

  const handleCardClick = (item) => {
    console.log(item);
  };

  const handleDelete = (itemId, event) => {
    event.stopPropagation(); // Prevent the card click event from firing
    setItems(items.filter((item) => item.id !== itemId));
  };

  return (
    <Box>
      <Group justify="center">
        <Button onClick={toggle} variant="outline" color="yellow">
          Prior Annotations
        </Button>
      </Group>

      <Collapse in={opened} p="sm">
        <Stack gap="sm">
          {items.map((item, index) => (
            <Paper
              className="annotation_paper"
              key={item.id}
              withBorder
              style={{
                cursor: "pointer",
              }}
              shadow="xs"
              p="sm"
              onClick={() => handleCardClick(item)}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <Text weight={500}>{item.type}</Text>
                  <Text size="sm">{item.notes}</Text>
                </div>
                <ActionIcon
                  color="red"
                  onClick={(event) => handleDelete(item.id, event)}
                >
                  <FaRegTrashAlt size={16} />
                </ActionIcon>
              </div>
            </Paper>
          ))}
        </Stack>
      </Collapse>
    </Box>
  );

  // return (
  //   <Menu opened={opened} onChange={setOpened}>
  //     <Menu.Target>
  //       <Button>Prior Annotations</Button>
  //     </Menu.Target>
  //     <Menu.Dropdown>
  //       {items.map((item, index) => (
  //         <Menu.Item key={item.id} component="div">
  //           <Card
  //             shadow="sm"
  //             p="lg"
  //             radius="md"
  //             withBorder
  //             onClick={() => handleCardClick(item)}
  //             style={{
  //               cursor: "pointer",
  //             }}
  //           >
  //             <div
  // style={{
  //   display: "flex",
  //   justifyContent: "space-between",
  //   alignItems: "center",
  // }}
  //             >
  // <div>
  //   <Text weight={500}>{item.type}</Text>
  //   <Text size="sm">{item.notes}</Text>
  // </div>
  // <ActionIcon
  //   color="red"
  //   onClick={(event) => handleDelete(item.id, event)}
  // >
  //   <FaRegTrashAlt size={16} />
  // </ActionIcon>
  //             </div>
  //           </Card>
  //         </Menu.Item>
  //       ))}
  //     </Menu.Dropdown>
  //   </Menu>
  // );
}

export default Annotations;
