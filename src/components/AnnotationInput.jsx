import { useForm } from "@mantine/form";
import {
  TextInput,
  Fieldset,
  NativeSelect,
  Textarea,
  Group,
  Box,
  Text,
  Button,
  Flex,
} from "@mantine/core";
import { AnnotationsContext } from "../context/AnnotationsContext";
import { useContext, useEffect } from "react";

function AnnotationInput() {
  const context = useContext(AnnotationsContext);
  const form = useForm({
    mode: "controlled",
    initialValues: {
      type: context.currentNotes.type,
      notes: context.currentNotes.notes,
    },
    validate: {
      notes: (value) => (value === "" ? "Please enter notes" : null),
    },
  });

  useEffect(() => {
    form.setValues({
      type: context.currentNotes.type,
      notes: context.currentNotes.notes,
    });
  }, [context.currentNotes]);

  const handleSubmit = (formValues) => {
    const updatedAnnotation = {
      ...context.currentNotes,
      ...formValues,
      annotationHexes: context.currentHexes,
    };

    context.updatePriorAnnotations(updatedAnnotation);
    context.resetCurrentAnnotation();
    context.setUpdatingAnnotation(false);
  };

  const handleReset = (formValues) => {
    context.resetCurrentAnnotation();
    form.reset();
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Fieldset
        legend={
          context.updatingAnnotation
            ? "Edit Existing Annotation"
            : "New Annotation"
        }
      >
        <NativeSelect
          {...form.getInputProps("type")}
          withAsterisk
          label="Select Annotation Type"
          data={[
            "Area of Interest",
            "Suggested Sensor Location",
            "Comment on existing sensor location",
          ]}
          onChange={(event) => {
            form.setFieldValue("type", event.currentTarget.value);
            // context.updateCurrentAnnotationType(event.currentTarget.value);
            const updatedNotes = {
              ...context.currentNotes,
              ...form.values,
              type: event.currentTarget.value,
            };

            console.log(updatedNotes);
            context.setCurrentNotes(updatedNotes);
          }}
        />
        <Textarea
          {...form.getInputProps("notes")}
          label="Annotation Notes"
          placeholder="Enter your comments about the selected region"
        />
        <Group mt="md">
          <Button type="submit" variant="outline" color="green">
            {context.updatingAnnotation
              ? "Update Annotation"
              : "Add Annotation"}
          </Button>
          <Button
            type="button"
            variant="light"
            color="red"
            onClick={handleReset}
          >
            {context.updatingAnnotation ? "Cancel Update" : "Clear Annotation"}
          </Button>
        </Group>
      </Fieldset>
    </form>
  );
}

export default AnnotationInput;
