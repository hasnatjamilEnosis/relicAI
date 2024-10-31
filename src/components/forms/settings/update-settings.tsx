"use client";

import FieldContainer from "@/components/custom-ui/form-field-container";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { CircleCheck, CircleX } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";

export default function UpdateSettings({
  jiraApiKey,
  currentSelectedProjectId,
  projectList,
  currentSelectedUserIds,
  userList,
}: {
  jiraApiKey: string;
  currentSelectedProjectId: string;
  projectList: { value: string; label: string }[];
  currentSelectedUserIds: string;
  userList: { value: string; label: string }[];
}) {
  // states
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showServerValidationError, setShowServerValidationError] =
    useState(false);
  const [serverValidationError, setServerValidationError] = useState("");

  // effects
  useEffect(() => {
    if (showSuccessAlert) {
      setTimeout(() => {
        setShowSuccessAlert(false);
      }, 5000);
    }
  }, [showSuccessAlert]);

  useEffect(() => {
    if (showServerValidationError) {
      setTimeout(() => {
        setShowServerValidationError(false);
      }, 5000);
    }
  }, [showServerValidationError]);

  const { Field, Subscribe, handleSubmit } = useForm({
    defaultValues: {
      jiraApiKey: jiraApiKey,
      preferredJIRAProject: currentSelectedProjectId,
      preferredUsers: currentSelectedUserIds,
    },
    onSubmit: async (values) => {
      const { saveSettings } = await import(
        "@/actions/settings/settings-actions"
      );

      const { jiraApiKey, preferredJIRAProject, preferredUsers } = values.value;

      const res = await saveSettings(
        jiraApiKey,
        preferredJIRAProject,
        preferredUsers
      );

      if (res.status === 200) {
        setShowSuccessAlert(true);
      }
      if (res.status === 400) {
        setServerValidationError(res.message);
        setShowServerValidationError(true);
      }
    },
    validatorAdapter: zodValidator(),
  });

  return (
    <>
      {/* alert */}
      {/* success alert */}
      <Alert
        className={`fixed top-10 left-1/2 w-fit transform -translate-x-1/2 translate-y-0 bg-gray-600 ${
          showSuccessAlert ? "visible" : "hidden"
        }`}
      >
        <div className="flex items-center gap-4">
          <CircleCheck className="h-6 w-6" />
          <div>
            <AlertTitle className="text-lg">Success!</AlertTitle>
            <AlertDescription className="text-xs">
              Your settings have been saved.
            </AlertDescription>
          </div>
        </div>
      </Alert>

      {/* server validation error alert */}
      <Alert
        className={`fixed top-10 left-1/2 w-fit transform -translate-x-1/2 translate-y-0 bg-pink-600 ${
          showServerValidationError ? "visible" : "hidden"
        }`}
      >
        <div className="flex items-center gap-4">
          <CircleX className="h-6 w-6" />
          <div>
            <AlertTitle className="text-lg">Error!</AlertTitle>
            <AlertDescription className="text-xs">
              {serverValidationError}
            </AlertDescription>
          </div>
        </div>
      </Alert>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleSubmit();
        }}
      >
        <FieldContainer>
          <Field
            name="jiraApiKey"
            validators={{
              onChange: z
                .string()
                .min(20, "Key must be at least 20 characters"),
            }}
            children={({ state, handleChange, handleBlur }) => (
              <>
                <Label htmlFor="jiraApiKey" className="mb-3 block text-sm">
                  JIRA API Key
                </Label>
                <Input
                  id="jiraApiKey"
                  value={state.value}
                  placeholder="key"
                  onChange={(e) => handleChange(e.target.value)}
                  onBlur={handleBlur}
                  required
                  className="w-96"
                />
                <span
                  className={`${
                    state.meta.errors.length > 0 ? "visible" : "invisible"
                  } text-xs text-pink-600 block`}
                >
                  {state.meta.errors.length > 0
                    ? state.meta.errors.join(", ")
                    : "field error"}
                </span>
              </>
            )}
          />
        </FieldContainer>
        <FieldContainer>
          <Field
            name="preferredJIRAProject"
            validators={{
              onChange: z.string().optional(),
            }}
            children={({ state, handleChange }) => (
              <>
                <Label htmlFor="project" className="mb-3 block text-sm">
                  Preferred Project
                </Label>
                <Select value={state.value} onValueChange={handleChange}>
                  <SelectTrigger id="project" className="w-96">
                    <SelectValue placeholder="Select Preferred Project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Projects</SelectLabel>
                      {projectList.map((project) => (
                        <SelectItem key={project.value} value={project.value}>
                          {project.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <span
                  className={`${
                    state.meta.errors.length > 0 ? "visible" : "invisible"
                  } text-xs text-pink-600 block`}
                >
                  {state.meta.errors.length > 0
                    ? state.meta.errors.join(", ")
                    : "field error"}
                </span>
              </>
            )}
          />
        </FieldContainer>
        <FieldContainer>
          <Field
            name="preferredUsers"
            validators={{
              onChange: z.string().optional(),
            }}
            children={({ state, handleChange }) => (
              <>
                <Label htmlFor="preferredUsers" className="mb-3 block text-sm">
                  Preferred Users
                </Label>
                <MultiSelect
                  className="w-96"
                  id="preferredUsers"
                  options={userList}
                  onValueChange={(values) => handleChange(values.join(", "))}
                  defaultValue={
                    state.value === ""
                      ? []
                      : state.value.split(",").map((v) => v.trim())
                  }
                  placeholder="Select Preferred Users"
                  variant="inverted"
                  animation={2}
                  maxCount={3}
                />
                <span
                  className={`${
                    state.meta.errors.length > 0 ? "visible" : "invisible"
                  } text-xs text-pink-600 block`}
                >
                  {state.meta.errors.length > 0
                    ? state.meta.errors.join(", ")
                    : "field error"}
                </span>
              </>
            )}
          />
        </FieldContainer>
        <Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          )}
        />
      </form>
    </>
  );
}
