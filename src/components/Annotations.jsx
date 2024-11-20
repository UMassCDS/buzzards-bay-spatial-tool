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
  const [opened, { toggle }] = useDisclosure(false);
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

  return (
    <Box>
      <Group justify="center">
        <Tooltip label="List your annotations from this interview session.">
          <Button onClick={toggle} variant="outline" color="yellow">
            Prior Annotations
          </Button>
        </Tooltip>
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
                  <Text
                    weight={500}
                    style={{ color: context.annotationTypes[item.type] }}
                  >
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
