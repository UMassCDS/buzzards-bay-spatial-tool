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
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import { FaRegTrashAlt } from "react-icons/fa";
import { useContext } from "react";
import { AnnotationsContext } from "../context/AnnotationsContext";
import { IconInfoCircle } from "@tabler/icons-react";

import "../styles/Annotations.css";

function Annotations() {
  const [opened, { toggle }] = useDisclosure(true);
  const context = useContext(AnnotationsContext);
  const [oldAnnotation, setOldAnnotation] = useState(null);

  const form = useForm({
    mode: "controlled",
    initialValues: {
      type: context.currentNotes.type,
      dataTitle: context.currentNotes.dataTitle,
      locationRating: context.currentNotes.locationRating,
      explanation: context.currentNotes.explanation,
    },
    validate: {
      dataTitle: (value) => (value === "" ? "Please enter a data title" : null),
      explanation: (value) =>
        value === "" ? "Please enter an explanation" : null,
    },
  });

  const handleSubmit = (formValues) => {
    const updatedAnnotation = {
      ...context.currentNotes,
      ...formValues,
      annotationHexes: context.currentHexes,
    };

    updatedAnnotation.modifiedAt = new Date();

    // console.log(updatedAnnotation);

    if (context.currentHexes.length === 0) {
      alert("Please select a region first, at least one hex is required.");
      return;
    }

    context.updatePriorAnnotations(updatedAnnotation);
    context.resetCurrentAnnotation();
    context.setEditingAnnotation(false);
    context.setUpdatingAnnotation(false);
    context.setViewingPriorAnnotation(false);
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

    console.log(item);

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
      form.reset();
    }
  };

  const handleStopViewing = () => {
    context.setViewingPriorAnnotation(false);
    context.setEditingAnnotation(false);
    context.resetCurrentAnnotation();
    form.reset();
  };

  const handleCancelEdit = () => {
    console.log(oldAnnotation);
    context.setCurrentAnnotation(oldAnnotation);
    context.setEditingAnnotation(false);
    setOldAnnotation(null);
  };

  useEffect(() => {
    form.setValues({
      type: context.currentNotes.type,
      dataTitle: context.currentNotes.dataTitle,
      locationRating: context.currentNotes.locationRating,
      explanation: context.currentNotes.explanation,
    });
  }, [
    context.currentNotes.type,
    context.currentNotes.dataTitle,
    context.currentNotes.locationRating,
    context.currentNotes.explanation,
    form,
  ]);

  return (
    <>
      <form onSubmit={form.onSubmit(handleSubmit)}>
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
              {...form.getInputProps("type")}
              withAsterisk
              label="Select Type of Information"
              data={Object.keys(context.annotationTypes)}
              disabled={
                context.viewingPriorAnnotation && !context.editingAnnotation
              }
              onChange={(event) => {
                form.setFieldValue("type", event.currentTarget.value);
                const updatedNotes = {
                  ...context.currentNotes,
                  ...form.values,
                  type: event.currentTarget.value,
                };

                context.setCurrentNotes(updatedNotes);
              }}
            />
            {form.values.type === "Custom" && (
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
              {...form.getInputProps("dataTitle")}
              label="Data Title"
              placeholder="Enter the data title"
              disabled={
                context.viewingPriorAnnotation && !context.editingAnnotation
              }
            />
            <NativeSelect
              {...form.getInputProps("locationRating")}
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
            />
            <Textarea
              {...form.getInputProps("explanation")}
              label="Explanation"
              placeholder="Enter your explanation"
              disabled={
                context.viewingPriorAnnotation && !context.editingAnnotation
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

// const handleCardClick = (item) => {
//   console.log("Clicked, updating: ", context.updatingAnnotation);
//   if (context.updatingAnnotation) {
//     alert("Please save or cancel current updating annotation.");
//     return;
//   }

//   context.setUpdatingAnnotation(true);
//   item.modifiedAt = new Date();
//   context.setCurrentAnnotation(item);

//   context.deleteFromPriorAnnotations(item);
// };

// const handleDelete = (item, event) => {
//   event.stopPropagation(); // Prevent the card click event from firing
//   context.deleteFromPriorAnnotations(item);
// };
