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
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import { FaRegTrashAlt, FaRegEdit } from "react-icons/fa";
import { useContext } from "react";
import { AnnotationsContext } from "../context/AnnotationsContext";

import "../styles/Annotations.css";

function Annotations() {
  const [opened, { toggle }] = useDisclosure(true);
  const context = useContext(AnnotationsContext);
  // const [viewingPriorAnnotation, setViewingPriorAnnotation] = useState(false);
  // const [editMode, setEditMode] = useState(false);

  const form = useForm({
    mode: "controlled",
    initialValues: {
      type: context.currentNotes.type,
      title: context.currentNotes.title,
      notes: context.currentNotes.notes,
    },
    validate: {
      title: (value) => (value === "" ? "Please enter a title" : null),
      notes: (value) => (value === "" ? "Please enter notes" : null),
    },
  });

  const handleSubmit = (formValues) => {
    const updatedAnnotation = {
      ...context.currentNotes,
      ...formValues,
      annotationHexes: context.currentHexes,
    };
    console.log(updatedAnnotation);

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
    context.setViewingPriorAnnotation(true);
    context.setCurrentAnnotation(item);
    context.setEditingAnnotation(false);
  };

  const handleDelete = (item, event) => {
    event.stopPropagation(); // Prevent the card click event from firing
    context.deleteFromPriorAnnotations(item);
  };

  const handleStopViewing = () => {
    context.setViewingPriorAnnotation(false);
    context.setEditingAnnotation(false);
    context.resetCurrentAnnotation();
    form.reset();
  };

  useEffect(() => {
    form.setValues({
      type: context.currentNotes.type,
      title: context.currentNotes.title,
      notes: context.currentNotes.notes,
    });
  }, [context.currentNotes]);

  return (
    <>
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
      <Divider />
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Fieldset legend="Annotation Input">
          <Stack gap="sm">
            <NativeSelect
              {...form.getInputProps("type")}
              withAsterisk
              label="Select Annotation Type"
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
            <TextInput
              {...form.getInputProps("title")}
              label="Annotation Title"
              placeholder="Enter a title for your annotation"
              disabled={
                context.viewingPriorAnnotation && !context.editingAnnotation
              }
            />
            <Textarea
              {...form.getInputProps("notes")}
              label="Annotation Notes"
              placeholder="Enter your comments about the selected region"
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
                    Stop Viewing
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
                    onClick={() => context.setEditingAnnotation(false)}
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
                    Reset
                  </Button>
                </>
              )}
            </Group>
          </Stack>
        </Fieldset>
      </form>
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
