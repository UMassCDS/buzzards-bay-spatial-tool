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
import { useContext } from "react";
import { AnnotationsContext } from "../context/AnnotationsContext";

import "../styles/Annotations.css";

const cssMap = {
  "Area of Interest": "interest",
  "Suggested Sensor Location": "suggestion",
  "Comment on existing sensor location": "comment",
};

function Annotations() {
  const [opened, { toggle }] = useDisclosure(false);
  const context = useContext(AnnotationsContext);

  const handleCardClick = (item) => {
    console.log(item);
    item.modifiedAt = new Date();
    context.setCurrentAnnotation(item);
  };

  const handleDelete = (item, event) => {
    event.stopPropagation(); // Prevent the card click event from firing
    context.deleteFromPriorAnnotations(item);
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
          {context.priorAnnotations.map((item, index) => (
            <Paper
              className="annotation_paper"
              key={index}
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
                  <Text weight={500} className={cssMap[item["type"]]}>
                    {item.type}
                  </Text>
                  <Text size="sm">{item.notes}</Text>
                </div>
                <ActionIcon
                  color="red"
                  onClick={(event) => handleDelete(item, event)}
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
}

export default Annotations;
