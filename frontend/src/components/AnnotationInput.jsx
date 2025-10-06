import {
  Fieldset,
  NativeSelect,
  Textarea,
  Group,
  Button,
  TextInput,
  Stack,
  ColorInput,
} from "@mantine/core";
import { AnnotationsContext } from "../context/AnnotationsContext";
import { useContext } from "react";

function AnnotationInput() {
  const context = useContext(AnnotationsContext);

  const validate = {
    dataTitle: (value) => (value === "" ? "Please enter a data title" : null),
    explanation: (value) =>
      value === "" ? "Please enter an explanation" : null,
  };

  const handleSubmit = () => {
    // Validate
    const errors = {};
    if (!context.currentNotes.dataTitle) {
      errors.dataTitle = "Please enter a data title";
    }
    if (!context.currentNotes.explanation) {
      errors.explanation = "Please enter an explanation";
    }

    if (Object.keys(errors).length > 0) {
      // Show validation errors
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

    context.updatePriorAnnotations(updatedAnnotation);
    context.resetCurrentAnnotation();
    context.setUpdatingAnnotation(false);
  };

  const handleReset = () => {
    context.resetCurrentAnnotation();
  };

  const handleFieldChange = (field, value) => {
    const updatedNotes = {
      ...context.currentNotes,
      [field]: value,
    };
    context.setCurrentNotes(updatedNotes);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <Fieldset
        legend={
          context.updatingAnnotation
            ? "Edit Existing Annotation"
            : "New Annotation"
        }
      >
        <Stack gap="sm">
          <NativeSelect
            value={context.currentNotes.type}
            withAsterisk
            label="Select Type of Information"
            data={Object.keys(context.annotationTypes)}
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
              onChange={(color) => {
                context.updateCustomColor(color);
              }}
            />
          )}
          <TextInput
            value={context.currentNotes.dataTitle}
            label="Data Title"
            placeholder="Enter the data title"
            onChange={(event) =>
              handleFieldChange("dataTitle", event.currentTarget.value)
            }
            error={!context.currentNotes.dataTitle && validate.dataTitle("")}
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
            onChange={(event) =>
              handleFieldChange("locationRating", event.currentTarget.value)
            }
          />
          <Textarea
            value={context.currentNotes.explanation}
            label="Explanation"
            placeholder="Enter your explanation"
            onChange={(event) =>
              handleFieldChange("explanation", event.currentTarget.value)
            }
            error={
              !context.currentNotes.explanation && validate.explanation("")
            }
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
