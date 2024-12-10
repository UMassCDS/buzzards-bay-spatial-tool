import {
  Text,
  ActionIcon,
  Button,
  Group,
  Box,
  Collapse,
  Paper,
  Stack,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { FaRegTrashAlt } from "react-icons/fa";
import { useContext } from "react";
import { AnnotationsContext } from "../context/AnnotationsContext";

import "../styles/Annotations.css";

function Annotations() {
  const [opened, { toggle }] = useDisclosure(true);
  const context = useContext(AnnotationsContext);

  const handleCardClick = (item) => {
    console.log("Clicked, updating: ", context.updatingAnnotation);
    if (context.updatingAnnotation) {
      alert("Please save or cancel current updating annotation.");
      return;
    }

    context.setUpdatingAnnotation(true);
    item.modifiedAt = new Date();
    context.setCurrentAnnotation(item);

    context.deleteFromPriorAnnotations(item);
  };

  const handleDelete = (item, event) => {
    event.stopPropagation(); // Prevent the card click event from firing
    context.deleteFromPriorAnnotations(item);
  };

  const sortByAnnotationType = (a, b) => {
    if (a.type < b.type) {
      return -1;
    }
    if (a.type > b.type) {
      return 1;
    }
    return 0;
  };

  return (
    <Box>
      <Group justify="center">
        <Tooltip label="List your annotations from this interview session.">
          <Button onClick={toggle} variant="outline" color="yellow" radius="md">
            Prior Annotations | {opened ? "Hide" : "Show"}
          </Button>
        </Tooltip>
      </Group>

      <Collapse in={opened} p="sm">
        <Stack gap="sm">
          {context.priorAnnotations
            .sort(sortByAnnotationType)
            .map((item, index) => (
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
                    <Text
                      size="sm"
                      style={{ color: context.annotationTypes[item.type] }}
                    >
                      {item.type}
                    </Text>
                    <Text size="md" fw={500}>
                      {item.title}
                    </Text>
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
