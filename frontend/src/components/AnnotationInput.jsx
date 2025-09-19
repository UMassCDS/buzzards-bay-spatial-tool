import { useForm } from "@mantine/form";
import {
  Fieldset,
  NativeSelect,
  Textarea,
  Group,
  Button,
  TextInput,
  Stack,
} from "@mantine/core";
import { AnnotationsContext } from "../context/AnnotationsContext";
import { useContext, useEffect } from "react";

function AnnotationInput() {
  const context = useContext(AnnotationsContext);
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
      explanation: (value) => (value === "" ? "Please enter an explanation" : null),
    },
  });

  useEffect(() => {
    form.setValues({
      type: context.currentNotes.type,
      dataTitle: context.currentNotes.dataTitle,
      locationRating: context.currentNotes.locationRating,
      explanation: context.currentNotes.explanation,
    });
  }, [context.currentNotes]);

  const handleSubmit = (formValues) => {
    const updatedAnnotation = {
      ...context.currentNotes,
      ...formValues,
      annotationHexes: context.currentHexes,
    };

    if (context.currentHexes.length === 0) {
      alert("Please select a region first, at least one hex is required.");
      return;
    }

    context.updatePriorAnnotations(updatedAnnotation);
    context.resetCurrentAnnotation();
    context.setUpdatingAnnotation(false);
  };

  const handleReset = (formValues) => {
    const updatedAnnotation = {
      ...context.currentNotes,
      annotationHexes: context.currentHexes,
    };

    if (context.updatingAnnotation) {
      context.updatePriorAnnotations(updatedAnnotation);
    }

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
        <Stack gap="sm">
          <NativeSelect
            {...form.getInputProps("type")}
            withAsterisk
            label="Select Type of Information"
            data={Object.keys(context.annotationTypes)}
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
          <TextInput
            {...form.getInputProps("dataTitle")}
            label="Data Title"
            placeholder="Enter the data title"
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
              "Minimally"
            ]}
          />
          <Textarea
            {...form.getInputProps("explanation")}
            label="Explanation"
            placeholder="Enter your explanation"
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
              {context.updatingAnnotation
                ? "Cancel Update"
                : "Clear Annotation"}
            </Button>
          </Group>
        </Stack>
      </Fieldset>
    </form>
  );
}

export default AnnotationInput;
