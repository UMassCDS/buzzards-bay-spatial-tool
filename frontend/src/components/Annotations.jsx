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
  Divider,
  Fieldset,
  NativeSelect,
  TextInput,
  Textarea,
  Blockquote,
  Highlight,
  ColorInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import { FaRegTrashAlt } from "react-icons/fa";
import { useContext } from "react";
import { AnnotationsContext } from "../context/AnnotationsContext";
import { IconInfoCircle } from "@tabler/icons-react";

import "../styles/Annotations.css";

function Annotations() {
  const [opened, { toggle }] = useDisclosure(false);
  const context = useContext(AnnotationsContext);
  const [oldAnnotation, setOldAnnotation] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate
    const errors = {};
    if (!context.currentNotes.dataTitle) {
      errors.dataTitle = "Please enter a data title";
    }
    if (!context.currentNotes.explanation) {
      errors.explanation = "Please enter an explanation";
    }

    if (Object.keys(errors).length > 0) {
      Object.values(errors).forEach((error) => alert(error));
      return;
    }

    if (context.currentHexes.length === 0) {
      alert("Please select a region first, at least one hex is required.");
      return;
    }

    const updatedAnnotation = {
      ...context.currentNotes,
      annotationHexes: context.currentHexes,
    };

    updatedAnnotation.modifiedAt = new Date();

    context.updatePriorAnnotations(updatedAnnotation);
    context.resetCurrentAnnotation();
    context.setEditingAnnotation(false);
    context.setUpdatingAnnotation(false);
    context.setViewingPriorAnnotation(false);
  };

  const handleFieldChange = (field, value) => {
    const updatedNotes = {
      ...context.currentNotes,
      [field]: value,
    };
    context.setCurrentNotes(updatedNotes);
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

  const handlePriorAnnotationClick = (item) => {
    if (context.viewingPriorAnnotation && context.editingAnnotation) {
      alert("Please save or cancel current editing annotation.");
      return;
    }

    context.setViewingPriorAnnotation(true);
    context.setCurrentAnnotation(item);
    context.setEditingAnnotation(false);
    setOldAnnotation(item);
  };

  const handleDelete = (item, event) => {
    event.stopPropagation(); // Prevent the card click event from firing
    context.deleteFromPriorAnnotations(item);

    // If we're currently viewing the deleted annotation, reset to new annotation mode
    if (
      context.viewingPriorAnnotation &&
      context.currentNotes.index === item.index
    ) {
      context.setViewingPriorAnnotation(false);
      context.setEditingAnnotation(false);
      context.resetCurrentAnnotation();
    }
  };

  const handleStopViewing = () => {
    context.setViewingPriorAnnotation(false);
    context.setEditingAnnotation(false);
    context.resetCurrentAnnotation();
  };

  const handleCancelEdit = () => {
    context.setCurrentAnnotation(oldAnnotation);
    context.setEditingAnnotation(false);
    setOldAnnotation(null);
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Fieldset legend="Data Input Panel">
          <Stack gap="sm">
            {context.viewingPriorAnnotation && (
              <Blockquote
                color="blue"
                icon={<IconInfoCircle size={20} />}
                mt="xs"
                p="md"
              >
                <Highlight highlight={["Edit"]}>
                  You are viewing a prior annotation. Click on Edit to modify.
                </Highlight>
              </Blockquote>
            )}
            <NativeSelect
              value={context.currentNotes.type}
              withAsterisk
              label="Select Type of Information"
              data={Object.keys(context.annotationTypes)}
              disabled={
                context.viewingPriorAnnotation && !context.editingAnnotation
              }
              onChange={(event) => {
                handleFieldChange("type", event.currentTarget.value);
              }}
            />
            {context.currentNotes.type === "Custom" && (
              <ColorInput
                label="Custom Color"
                placeholder="Enter hex color"
                format="hex"
                value={context.annotationTypes["Custom"]}
                disabled={
                  context.viewingPriorAnnotation && !context.editingAnnotation
                }
                onChange={(color) => {
                  context.updateCustomColor(color);
                }}
              />
            )}
            <TextInput
              value={context.currentNotes.dataTitle}
              label="Data Title"
              placeholder="Enter the data title"
              disabled={
                context.viewingPriorAnnotation && !context.editingAnnotation
              }
              onChange={(event) =>
                handleFieldChange("dataTitle", event.currentTarget.value)
              }
            />
            <NativeSelect
              value={context.currentNotes.locationRating}
              label="Location Rating (input only when directed)"
              data={[
                "Not applicable",
                "Extremely",
                "Highly",
                "Moderately",
                "Slightly",
                "Minimally",
              ]}
              disabled={
                context.viewingPriorAnnotation && !context.editingAnnotation
              }
              onChange={(event) =>
                handleFieldChange("locationRating", event.currentTarget.value)
              }
            />
            <Textarea
              value={context.currentNotes.explanation}
              label="Explanation"
              placeholder="Enter your explanation"
              disabled={
                context.viewingPriorAnnotation && !context.editingAnnotation
              }
              onChange={(event) =>
                handleFieldChange("explanation", event.currentTarget.value)
              }
            />
            <Group mt="md">
              {/* Edit only allowed when viewing a prior annotation */}
              {context.viewingPriorAnnotation && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    color="orange"
                    disabled={context.editingAnnotation}
                    onClick={() => context.setEditingAnnotation(true)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="light"
                    color="blue"
                    disabled={context.editingAnnotation}
                    onClick={handleStopViewing}
                  >
                    Add new annotation
                  </Button>
                </>
              )}
              {context.editingAnnotation && (
                <>
                  <Button type="submit" variant="outline" color="green">
                    Save Edit
                  </Button>
                  <Button
                    type="button"
                    variant="light"
                    color="red"
                    onClick={handleCancelEdit}
                  >
                    Cancel Edit
                  </Button>
                </>
              )}
              {!context.viewingPriorAnnotation && (
                <>
                  <Button type="submit" variant="outline" color="green">
                    Save
                  </Button>
                  <Button
                    type="button"
                    variant="light"
                    color="red"
                    onClick={() => handleStopViewing()}
                  >
                    Clear
                  </Button>
                </>
              )}
            </Group>
          </Stack>
        </Fieldset>
      </form>

      <Divider />
      <Box>
        <Group justify="center">
          <Tooltip label="List your annotations from this interview session.">
            <Button
              onClick={toggle}
              variant="outline"
              color="yellow"
              radius="md"
            >
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
                  onClick={() => handlePriorAnnotationClick(item)}
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
                        {item.dataTitle}
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
    </>
  );
}

export default Annotations;
